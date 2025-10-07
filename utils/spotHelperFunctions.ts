import { API_BASE_URL } from '@env';
import { formDataSpot, Photo, Spot } from '../types/types';
import { supabase } from '../utils/supabase';
import * as FileSystem from 'expo-file-system/legacy';

const updateurl = API_BASE_URL.startsWith("http") ? `${API_BASE_URL}/spots/update` : `https://${API_BASE_URL}/spots/update`;
const apiUrl = API_BASE_URL.startsWith("http") ? API_BASE_URL : `https://${API_BASE_URL}`;


export const saveSpot = async (spot: Spot) => {
  console.log("Saving spot called:");
  const res = await fetch(`${updateurl}/${spot.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(spot),
  })

  if (!res.ok) {
    console.log("Failed to save spot:");
    throw new Error('Failed to save spot');
  }
}

export const deletePhotosFromSupabase = async (photos: Photo[]) => {
  try {
    console.log("Deleting photos from Supabase:", photos);

    // Extract the exact path within the 'spots' bucket
    const pathsToDelete = photos.map(photo => {
      const marker = "/storage/v1/object/public/spots/";
      const path = photo.url.split(marker)[1]; // Gives "Submissions/uuid/photo.jpg"
      console.log("Extracted path for deletion:", path);
      return path;
    }).filter(Boolean); // remove undefined if any parsing fails

    if (pathsToDelete.length === 0) {
      console.warn("No valid photo paths found for deletion.");
      return;
    }

    console.log("Paths to delete:", pathsToDelete);

    const { error } = await supabase.storage
      .from("spots")
      .remove(pathsToDelete);

    if (error) throw error;

    console.log("✅ Photos deleted successfully from Supabase:", pathsToDelete);
  } catch (error) {
    console.error("❌ Error deleting photos from Supabase:", error);
  }
};

export const deleteFolderFromSupabase = async (folderPath: string, uuid: string) => {

  const { data, error } = await supabase.storage
    .from('spots')
    .list('Submissions/' + uuid);

  if (error) {
    console.error('Error listing files:', error);
  }

  if (data && data.length > 0) {
    const filesToDelete = data.map(file => `Submissions/${uuid}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('spots')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Error deleting files:', deleteError);
    }
  }
}

// Uploads photos to supabase and returns array of Photo objects with URLS
export const uploadPhotosToSupabase = async (formData: formDataSpot, uuid: string) => {
  console.log("Uploading photos to Supabase:");
  const uploadedPhotos: Photo[] = [];
  const folderName =  `Submissions/${uuid}`;
  const spotId = formData.id;

  console.log("FormData photos:", formData.photos);

  const newPhotos = formData.photos.filter(p => typeof p === 'string') as string[];

  for (const photo of newPhotos) {
    try {
      const base64 = await FileSystem.readAsStringAsync(photo, {
        encoding: "base64",
      });

      // Convert to binary buffer
      const fileBytes = decodeBase64(base64);

      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
      const path = `${folderName}/${fileName}`;

      console.log("Uploading photo to path:", path);

      const { data, error } = await supabase.storage.from('spots').upload(path, fileBytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

      console.log("Supabase upload response:", data, error);

      const { data: publicUrlData } = supabase.storage
        .from("spots")
        .getPublicUrl(path);

      const photoObject = {
        id: 0, // Placeholder, will be set by the database
        url: publicUrlData.publicUrl,
        uuid: uuid,
        spotId: spotId,
      };

      console.log("Created photo object:", photoObject);
      uploadedPhotos.push(photoObject);
      console.log("✅ Uploaded:", publicUrlData.publicUrl);

    } catch(error) {
      console.error("Error uploading photo:", error);
    }

  }
  return uploadedPhotos;
};

export const finalizeApproval = async (spot: Spot) => {
  const uuid = spot.photos[0]?.uuid;
  if (!uuid) return;
  try {
    console.log("Finalizing approval for spot:", spot.name);

    const uploaded = await uploadOrderedPhotosToR2(spot);

    await deleteFolderFromSupabase('Submissions', uuid);

    // fix url
    console.log("uploding to url: ", `${apiUrl}/${spot.id}`);
    const res = await fetch(`${updateurl}/${spot.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...spot, photos: uploaded, status: 'Approved' }),
    });

    if (!res.ok) {
      console.error("Failed to finalize approval, server responded with:", res.status);
      throw new Error('Failed to finalize approval');
    }

  } catch (error) {
    console.error("Error finalizing approval:", error);
  }
}


export const uploadOrderedPhotosToR2 = async (
  spot: Spot,
): Promise<Photo[]> => {
  console.log('📸 Uploading ordered photos for', spot.name);
  const orderedPhotos = spot.photos;
  const folderName = spot.id;
  const uuid = orderedPhotos[0]?.uuid;

  const uploadPromises = orderedPhotos.map(async (photo, index) => {
    const extension = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${String(index + 1).padStart(2, '0')}_${folderName}.${extension}`;

    // 1. Fetch the photo (from Supabase or local)
    const localPath =
      photo.url.startsWith('file://') || photo.url.startsWith('content://')
        ? photo.url
        : await downloadTempFile(photo.url);

    const base64 = await fileToBase64(localPath);
    const fileBytes = decodeBase64(base64);
    const mimeType = 'image/jpeg';

    console.log(`Uploading ${fileName} to R2...`);

    // 2. Ask backend for a signed upload URL
    const signRes = await fetch(`${apiUrl}/r2/sign-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        folderName,
        fileType: mimeType,
      }),
    });

    if (!signRes.ok) throw new Error(`Failed presign for ${fileName}`);

    const { uploadUrl, publicUrl } = await signRes.json();

    console.log(`Received signed URL for ${fileName}:`, uploadUrl);

    // 3. Upload directly to R2
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: fileBytes,
    });

    console.log(`Upload response for ${fileName}:`, uploadRes);

    if (!uploadRes.ok) throw new Error(`Upload failed: ${fileName}`);

    return {
      id: Date.now() + index,
      url: publicUrl,
      uuid,
      spotId: spot.id,
    };
  });
  const newPhotos = await Promise.all(uploadPromises);
  console.log('✅ Uploaded to R2:', newPhotos);
  return newPhotos;
};

/**
 * Helper to download a remote photo to local tmp for encoding
 */
async function downloadTempFile(remoteUrl: string): Promise<string> {
  const localUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, localUri);
  return uri;
}

async function fileToBase64(fileUri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}


function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}