// Replace the existing uploadPhotosToR2 function in spotHelperFunctions.ts
// Add this import at the top of the file:
import { compressImage } from './imageCompressionUtils';

export const uploadPhotosToR2 = async (formData: formDataSpot | addSpotData, uuid: string) => {
  const uploadedPhotos: Photo[] = [];
  const folderName = `Submissions/${uuid}`;
  const spotId = formData.id;

  // Filter new photos (strings / local URIs)
  const newPhotos = formData.photos.filter(p => typeof p === 'string') as string[];

  for (const photo of newPhotos) {
    try {
      // 🔥 COMPRESS IMAGE BEFORE UPLOADING
      // Ensure photo has proper URI format for expo-image-manipulator
      const photoUri = photo.startsWith('file://') ? photo : `file://${photo}`;
      
      console.log(`🗜️ Compressing image: ${photoUri}`);
      const compressionResult = await compressImage(photoUri);
      
      if (compressionResult.saved) {
        const savedKB = (compressionResult.originalSize - compressionResult.compressedSize) / 1024;
        console.log(`✅ Compressed successfully, saved ${savedKB.toFixed(2)} KB`);
      } else {
        console.log(`ℹ️ Keeping original (no size reduction)`);
      }

      // Use compressed image (or original if compression didn't help)
      const imageToUpload = compressionResult.uri;

      // Read the compressed/original photo file
      const base64 = await FileSystem.readAsStringAsync(imageToUpload, { encoding: "base64" });
      const fileBytes = decodeBase64(base64);

      // Generate a random file name
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
      const mimeType = "image/jpeg";

      // Ask backend for a signed URL
      const signRes = await fetch(`${apiUrl}/r2/sign-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          folderName,
          fileType: mimeType,
        }),
      });

      if (!signRes.ok) {
        console.error(`❌ Failed presign for ${fileName}`);
        throw new Error('Failed to get signed URL');
      }

      const { uploadUrl, publicUrl } = await signRes.json();

      // Upload to R2 using the signed URL
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: fileBytes,
      });

      if (!uploadRes.ok) {
        console.error(`❌ Upload failed for ${fileName}`);
        throw new Error(`Upload failed for ${fileName}`);
      }

      // Construct final photo object
      const photoObject: Photo = {
        id: Date.now(), // temp local id
        url: publicUrl,
        uuid,
        spotId,
      };

      uploadedPhotos.push(photoObject);

      // Clean up compressed file if it's different from original
      if (compressionResult.saved && compressionResult.uri !== photo) {
        try {
          await FileSystem.deleteAsync(compressionResult.uri, { idempotent: true });
        } catch (cleanupError) {
          console.warn(`Failed to clean up temp file: ${compressionResult.uri}`);
        }
      }

    } catch (error) {
      console.error("❌ Error uploading photo to R2:", error);
    }
  }

  return uploadedPhotos;
};