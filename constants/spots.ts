  import { Spot } from "../types/types";
  
  export const fields: { key: keyof Spot; label: string; type: "text" | "picker" | "check" | "favorite" | "location" | "photos" }[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "city", label: "City", type: "picker" },
    { key: "category", label: "Category", type: "picker" },
    { key: "notes", label: "Notes", type: "text" },
    { key: "isPkPark", label: "Parkour park", type: "check" },
    { key: "isCovered", label: "Covered", type: "check" },
    { key: "hasFlipArea", label: "Flip area", type: "check" },
    { key: "hasWaterChallenge", label: "Water challenge", type: "check" },
    { key: "hasSwings", label: "Swings", type: "check" },
    { key: "isFavorite", label: "Favorite", type: "favorite" },
    { key: "websiteLink", label: "Website", type: "text" },
    { key: "lat", label: "Location", type: "location" },
    { key: "photos", label: "Photos (URLs)", type: "photos" },
  ];