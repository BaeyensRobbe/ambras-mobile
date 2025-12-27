import { API_BASE_URL } from '@env';
import { addSpotData, formDataSpot, Photo, Spot } from '../types/types';
import { supabase } from '../utils/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from "expo-image-manipulator";

const apiUrl = API_BASE_URL.startsWith("http") ? API_BASE_URL : `https://${API_BASE_URL}`;

const optimizeImageForUpload = async (uri: string) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 2560 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
};

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

// Fetch total number of spots from Supabase
export const getTotalSpots = async (): Promise<number> => {
  const { count, error } = await supabase.from('Spot').select('id', { count: 'exact', head: true });
  if (error) {
    console.error('Error fetching total spots:', error);
    return 0;
  }
  return count ?? 0;
}

// Fetch total number of pending spots from Supabase
export const getPendingSpots = async (): Promise<number> => {
  const { count, error } = await supabase.from('Spot').select('id', { count: 'exact', head: true }).eq('status', 'Pending');
  if (error) {
    console.error('Error fetching pending spots:', error);
    return 0;
  }
  return count ?? 0;
}

// Fetch R2 storage usage from backend
export const fetchR2StorageUsage = async (): Promise<number> => {
  const response = await fetch(`${apiUrl}/R2/storage-usage`);
  if (!response.ok) throw new Error("Failed to fetch R2 storage usage");
  const data = await response.json();
  return parseFloat(data.totalGB); // e.g., 1.24 GB
};

// Insert photo records into Supabase and return inserted data
export const insertPhotoRecords = async (photos: { url: string; uuid: string; spotId: number }[]) => {
  if (photos.length === 0) {
    return { data: [], error: null };
  }
  return supabase.from('Photo').insert(photos).select('*');
}

export const deletePhotosFromSupabase = async (photos: Photo[]) => {
  try {
    // Extract the exact path within the 'spots' bucket
    const pathsToDelete = photos.map(photo => {
      const marker = "/storage/v1/object/public/spots/";
      const path = photo.url.split(marker)[1]; // Gives "Submissions/uuid/photo.jpg"
      return path;
    }).filter(Boolean); // remove undefined if any parsing fails

    if (pathsToDelete.length === 0) {
      console.warn("No valid photo paths found for deletion.");
      return;
    }
    const { error } = await supabase.storage
      .from("spots")
      .remove(pathsToDelete);

    if (error) throw error;

  } catch (error) {
    console.error("❌ Error deleting photos from Supabase:", error);
  }
};

// Deletes entire folder from Supabase storage given folder path and uuid
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
export const uploadPhotosToSupabase = async (formData: formDataSpot | addSpotData, uuid: string) => {
  const uploadedPhotos: Photo[] = [];
  const folderName = `Submissions/${uuid}`;
  const spotId = formData.id;

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

      const { data, error } = await supabase.storage.from('spots').upload(path, fileBytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

      const { data: publicUrlData } = supabase.storage
        .from("spots")
        .getPublicUrl(path);

      const photoObject = {
        id: 0, // Placeholder, will be set by the database
        url: publicUrlData.publicUrl,
        uuid: uuid,
        spotId: spotId,
      };

      uploadedPhotos.push(photoObject);
    } catch (error) {
      console.error("Error uploading photo:", error);
    }

  }
  return uploadedPhotos;
};

// Deletes photos from R2 storage given array of Photo objects
export const deletePhotosFromR2 = async (photos: Photo[]) => {
  try {

    if (!photos || photos.length === 0) {
      console.warn("No photos provided for R2 deletion.");
      return;
    }

    // Extract the path (key) from each photo's R2 URL
    const pathsToDelete = photos
      .map(photo => {
        try {
          const url = new URL(photo.url);
          // R2 public URLs look like: https://pub-xyz.r2.dev/Submissions/uuid/filename.jpg
          const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
          return key;
        } catch {
          console.warn("Invalid photo URL, skipping:", photo.url);
          return null;
        }
      })
      .filter(Boolean) as string[];

    if (pathsToDelete.length === 0) {
      console.warn("No valid R2 paths found for deletion.");
      return;
    }

    // Delete each file from R2
    for (const key of pathsToDelete) {
      const res = await fetch(`${apiUrl}/r2/file`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!res.ok) {
        console.error(`❌ Failed to delete ${key} (status ${res.status})`);
      } else {
      }
    }
  } catch (error) {
    console.error("❌ Error deleting photos from R2:", error);
  }
};

// Uploads ordered photos to R2 and returns array of Photo objects with URLs
export const uploadOrderedPhotosToR2 = async (spot: Spot): Promise<Photo[]> => {
  if (!spot.photos || spot.photos.length === 0) return [];

  console.log("photos to upload to R2:", spot.photos);

  const folderName = spot.id;
  const uuid = spot.photos[0]?.uuid;

  const uploadedPhotos: Photo[] = [];

  for (let index = 0; index < spot.photos.length; index++) {
    const photo = spot.photos[index];

    try {
    // ✅ Skip if photo is already on R2 with correct order
    if (photo.url.includes('.r2.dev') && photo.order === index + 1) {
      uploadedPhotos.push(photo);
      continue;
    }
      // Determine file path
      // 1. Get local file
      const originalLocalPath =
        photo.url.startsWith("file://") || photo.url.startsWith("content://")
          ? photo.url
          : await downloadTempFile(photo.url);

      // 2. Optimize image BEFORE upload
      const optimizedPath = await optimizeImageForUpload(originalLocalPath);

      // 3. Convert optimized image to base64
      const base64 = await fileToBase64(optimizedPath);

      if (!base64) throw new Error(`File read failed for ${photo.url}`);

      const fileBytes = decodeBase64(base64);
      if (!fileBytes || fileBytes.byteLength === 0) throw new Error(`File is empty: ${photo.url}`);

      // Determine file name and MIME type
      const urlPath = new URL(photo.url).pathname;
      const extension = urlPath.split(".").pop() || "jpg";
      const fileName = `${String(index + 1).padStart(2, "0")}_${folderName}.${extension}`;
      const mimeType = extension === "png" ? "image/png" : "image/jpeg";

      // Get presigned URL
      const signRes = await fetch(`${apiUrl}/r2/sign-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, folderName, fileType: mimeType }),
      });

      if (!signRes.ok) throw new Error(`Presign failed for ${fileName}`);
      const { uploadUrl, publicUrl } = await signRes.json();

      // Upload file
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: fileBytes,
      });

      if (!uploadRes.ok) throw new Error(`Upload failed for ${fileName}`);

      // Store uploaded photo with order
      uploadedPhotos.push({
        id: Date.now() + index,
        url: publicUrl,
        uuid,
        spotId: spot.id,
        order: index + 1, // store order explicitly
      });

    } catch (err) {
      console.error("Failed uploading photo:", photo.url, err);
      throw err; // stop approval if any photo fails
    }
  }

  console.log("Uploaded photos to R2:", uploadedPhotos);

  return uploadedPhotos;
};