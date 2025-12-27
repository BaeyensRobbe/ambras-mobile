import { insertPhotoRecords, uploadPhotosToSupabase } from "../utils/spotHelperFunctions";
import uuid from "react-native-uuid";
import { addSpotData, Photo, Spot } from "../types/types";
import { uploadOrderedPhotosToR2, deleteFolderFromSupabase, deletePhotosFromR2, deletePhotosFromSupabase } from "../utils/spotHelperFunctions";
import { updateSpot, addSpot } from "../api/spots";
import { formDataSpot } from "../types/types";
/**
 * Adds a new spot with its photos. Returns the saved spot or null if failed.
 */
export const addNewSpot = async (newSpot: addSpotData, refreshData: () => Promise<void>) => {
  if (!newSpot) return null;

  try {
    const folderUUID = uuid.v4() as string;
    const uploadedPhotos: Photo[] = [];

    console.log("Adding new spot:", newSpot.photos);

    // Upload all photos
    for (const photo of newSpot.photos) {
      const photos = await uploadPhotosToSupabase({ ...newSpot, photos: [photo] }, folderUUID);
      if (photos) uploadedPhotos.push(...photos);
    }

    // Save the spot with uploaded photos
    const savedSpot = await addSpot({ ...newSpot, photos: uploadedPhotos} as Spot);

    // Insert photo records if needed
    if (uploadedPhotos.length > 0) {
      const photoRecords = uploadedPhotos.map((p) => ({
        url: p.url,
        uuid: folderUUID,
        spotId: savedSpot.id,
      }));
      const { error } = await insertPhotoRecords(photoRecords);
      if (error) throw new Error("Failed to insert photo records");
    }

    // Refresh spot list
    await refreshData();

    return savedSpot;
  } catch (error) {
    console.error("Error adding new spot:", error);
    return null;
  }
};

export const approveSpot = async (spot: Spot, refreshData?: () => Promise<void>) => {
  if (!spot || spot.photos.length === 0) return false;

  const uuid = spot.photos[0]?.uuid;
  if (!uuid) throw new Error("Spot photos missing UUID");

  try {
    // 1. Upload ordered photos to R2
    const uploadedPhotos = await uploadOrderedPhotosToR2(spot);

    // 2. Update spot status & photos in backend
    await updateSpot(spot.id, { ...spot, photos: uploadedPhotos, status: "Approved" });

    // 3. Delete old photos from Supabase
    await deleteFolderFromSupabase("Submissions", uuid);

    // 4. Refresh data if provided
    if (refreshData) await refreshData();

    return true;
  } catch (error) {
    console.error("Error approving spot:", error);
    throw error;
  }
};

export const saveSpotChanges = async (
  originalSpot: Spot,
  updatedSpot: formDataSpot,
  refreshData: () => Promise<void>
) => {
  const isApproved = updatedSpot.status === "Approved";

  const originalPhotoUrls = originalSpot.photos.map(p => p.url);

  // 1. Determine kept, new, removed
  const keptPhotos = updatedSpot.photos.filter(p => originalPhotoUrls.includes(typeof p === "string" ? p : p.url));
  const newLocalPhotos = updatedSpot.photos.filter(p => (typeof p === "string" ? p : p.url).startsWith("file://"));
  const removedPhotos = originalSpot.photos.filter(p => !updatedSpot.photos.some(up => (typeof up === "string" ? up : up.url) === p.url));

  // 2. Delete removed photos
  if (removedPhotos.length > 0) {
    if (isApproved) await deletePhotosFromR2(removedPhotos);
    else await deletePhotosFromSupabase(removedPhotos);
  }

  // 3. Upload photos
  let finalPhotos: Photo[] = [];

  if (!isApproved) {
    // Pending: Supabase only
    const folderUUID = keptPhotos[0]?.uuid ?? (uuid.v4() as string);

    const uploadedNew = newLocalPhotos.length
      ? await uploadPhotosToSupabase({ ...updatedSpot, photos: newLocalPhotos.map(p => p.url) }, folderUUID)
      : [];

    finalPhotos = [...keptPhotos.map(p => ({ ...p, uuid: folderUUID })), ...uploadedNew];
  } else {
    // Approved: R2 only
    const existingUuid = keptPhotos[0]?.uuid ?? String(updatedSpot.id);

    // Keep modal order intact
    const orderedPhotos = updatedSpot.photos.map(p => ({
      ...(typeof p === "string" ? { id: 0, url: p } : p),
      uuid: existingUuid,
      spotId: updatedSpot.id,
    }));

    finalPhotos = await uploadOrderedPhotosToR2({ ...(updatedSpot as Spot), photos: orderedPhotos });
  }

  // 4. Save spot with proper order
  await updateSpot(updatedSpot.id, { ...(updatedSpot as Spot), photos: finalPhotos });

  // 5. Refresh UI
  await refreshData();
};



