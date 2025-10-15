import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import Header from "../components/Header";
import { ApprovedSpot } from "../types/types";
import Toast from "react-native-toast-message";
import { simulateProgress } from "../utils/toastHelperFunctions";
import { fetchSpots } from "../api/spots";
import { getMarkerColor } from "../utils/spotmap";
import { LocationContext } from "../components/location/LocationContext";



const { width, height } = Dimensions.get("window");

const SpotmapScreen: React.FC = () => {
  const [spots, setSpots] = useState<ApprovedSpot[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const userLocation = useContext(LocationContext);
  
  useEffect(() => {
    fetchData();
  }, []);



  const fetchData = async () => {
    try {
      Toast.show({
        type: "progress",
        text1: "Loading spots...",
        props: { progress: 0 },
        autoHide: false,
        toastId: "fetchProgress",
      });

      const progressPromise = simulateProgress(1500, (p) => {
        Toast.show({
          type: "progress",
          text1: "Loading spots...",
          props: { progress: p },
          autoHide: false,
          toastId: "fetchProgress",
        });
      });

      const data = await fetchSpots("Approved");
      await progressPromise;
      setSpots(data);

      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spots loaded successfully",
      });
    } catch (error) {
      console.error("Error fetching spots:", error);
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Failed to load spots",
        text2: (error as Error)?.message || "Check connection or API",
      });
    }
  };

  if (!userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Spotmap"
        rightButton={{ icon: "list", onPress: () => setShowFilters(true) }}
      />

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.lat,
              longitude: spot.lng,
            }}
            title={spot.name}
            description={spot.notes}
            pinColor={getMarkerColor(spot.category)}

          />
        ))}
      </MapView>

      {showFilters && (
        <View style={styles.filterOverlay}>
          <Text>Filter Options</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width,
    height,
  },
  filterOverlay: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default SpotmapScreen;
