import {API_BASE_URL} from "@env";
import { supabase } from "../utils/supabase";
import { deletePhotosFromR2 } from "../utils/spotHelperFunctions";

const BASE_URL = API_BASE_URL || "http://localhost:4000";
const apiUrl = BASE_URL.startsWith("http") ? BASE_URL : `https://${BASE_URL}`;

// export const fetchSpots = async () => {
//   const res = await fetch(`${BASE_URL}/spots/all`);
//   if (!res.ok) {
//     throw new Error("Failed to fetch spots");
//   }
//   return res.json();
// }

export const fetchSpots = async (type: string) => {
  try {
    const url = BASE_URL.startsWith("http") ? `${BASE_URL}/spots/${type}` : `https://${BASE_URL}/spots/${type}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch spot suggestions");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
};

export const getSpotById = async (spotId: number) => {
  const { data, error } = await supabase
    .from('Spot')
    .select('*, Photos(*)')
    .eq('id', spotId)
    .single();
  if (error) {
    throw new Error("Failed to fetch spot details");
  }
  return data;
}

export const deleteSpot = async (spotId: number) => {
  if (typeof spotId !== 'number') {
    throw new Error('deleteSpot: invalid spotId (expected number)');
  }
  const spot = await supabase.from('Spot').select('*').eq('id', spotId).single().then(res => res.data);
  if (!spot) {
    throw new Error('Spot not found');
  }
  const photos = await supabase.from('Photo').select('*').eq('spotId', spotId).then(res => res.data || []);
  // if (photos.length < 1) {
  //   return;
  //   throw new Error('Cannot delete spot with associated photos. Please delete photos first.');
  // }

  if (spot.status === 'Approved') {
    await deletePhotosFromR2(photos);
  }
  const res = await fetch(`${apiUrl}/spots/delete/${spotId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete this spot");
  }
}

export const fetchApprovedSpots = async () => {
  const res = await fetch(`${BASE_URL}/spots/approved`);
  if (!res.ok) {
    throw new Error("Failed to fetch approved spots");
  }
  const data = await res.json();   // <--- await here!
  return data;
}


export const updateSpot = async (spotId: number, data: any) => {
  const res = await fetch(`${BASE_URL}/spots/update/${spotId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update spot");
  return res.json();
};

export const approveSpot = async (spotId: number) => {
  return updateSpot(spotId, { status: "Approved" });
};