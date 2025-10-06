import {API_BASE_URL} from "@env";

const BASE_URL = API_BASE_URL || "http://localhost:4000";

export const fetchSpots = async () => {
  const res = await fetch(`${BASE_URL}/spots/all`);
  if (!res.ok) {
    throw new Error("Failed to fetch spots");
  }
  return res.json();
}

export const fetchSpotSuggestions = async () => {
  try {
    const url = BASE_URL.startsWith("http") ? `${BASE_URL}/spots/suggestions` : `https://${BASE_URL}/spots/suggestions`;
    console.log("Fetching spot suggestions from:", url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Error response:", res.status, res.statusText);
      throw new Error("Failed to fetch spot suggestions");
    }
    const data = await res.json();
    console.log("Spot suggestions response:", data);
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
};

export const fetchApprovedSpots = async () => {
  const res = await fetch(`${BASE_URL}/spots/approved`);
  if (!res.ok) {
    throw new Error("Failed to fetch approved spots");
  }
  const data = await res.json();   // <--- await here!
  console.log("Approved spots response:", data);
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