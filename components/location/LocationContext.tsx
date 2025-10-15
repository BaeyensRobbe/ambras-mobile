// LocationContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

type LocationType = { latitude: number; longitude: number } | null;


export const LocationContext = createContext<LocationType>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LocationType>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const lastLocation = await Location.getLastKnownPositionAsync({});
      if (lastLocation) {
        setUserLocation({
          latitude: lastLocation.coords.latitude,
          longitude: lastLocation.coords.longitude,
        });
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={userLocation}>
      {children}
    </LocationContext.Provider>
  );
};
