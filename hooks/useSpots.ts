import { useState, useCallback, useEffect } from "react";
import { Spot } from "../types/types";
import { fetchSpots } from "../api/spots";

export const useSpots = (showSuggestions: boolean) => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true);
      const mode = showSuggestions ? "suggestions" : "approved";
      const data = await fetchSpots(mode);
      setSpots(data);
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      setIsFetching(false);
    }
  }, [showSuggestions]);

  // Automatically fetch when the hook is used
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { spots, isFetching, fetchData };
};
