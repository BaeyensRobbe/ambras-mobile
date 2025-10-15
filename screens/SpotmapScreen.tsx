import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useState } from "react";
import { fetchSpots } from "../api/spots";
import { simulateProgress } from "../utils/toastHelperFunctions";
import Toast from "react-native-toast-message";
import Header from "../components/Header";
import { LocationContext } from "../components/location/LocationContext";
import { SpotMarker } from "../components/spotmap/Marker";
import { ApprovedSpot, Photo } from "../types/types";
import { ambrasGreen, styles as globalStyles } from "../styles";
import SpotDetailsOverlay from "../components/SpotDetailsOverlay";

const { width, height } = Dimensions.get("window");

interface SpotWithDistance extends ApprovedSpot {
  distance: number;
}

const SpotmapScreen: React.FC = () => {
  const [spots, setSpots] = useState<ApprovedSpot[]>([]);
  const [spotsWithDistance, setSpotsWithDistance] = useState<SpotWithDistance[]>([]);
  const [showList, setShowList] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedSpot, setSelectedSpot] = useState<ApprovedSpot | null>(null);
  const [showSpotDetails, setShowSpotDetails] = useState(false);

  const userLocation = useContext(LocationContext);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (userLocation && spots.length) {
      // calculate distances
      const spotsWithDist = spots.map((spot) => ({
        ...spot,
        distance: getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          spot.lat,
          spot.lng
        ),
      }));
      // sort by distance ascending
      spotsWithDist.sort((a, b) => a.distance - b.distance);
      setSpotsWithDistance(spotsWithDist);
    }
  }, [userLocation, spots]);

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
      Toast.show({ type: "success", text1: "Spots loaded successfully" });
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

  const memoizedMarkers = useMemo(
  () =>
    spots.map((spot) => (
      <SpotMarker key={spot.id} spot={spot} onPress={handleMarkerPress} />
    )),
  [spots]
);

  if (!userLocation) {
    return (
      <View style={styles.center}>
        <Text>Fetching your location...</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: userLocation.latitude || 50.8798,
    longitude: userLocation.longitude || 4.7005,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Distance calculation
  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkerPress = (spot: ApprovedSpot) => {
  setSelectedSpot(spot);
  console.log("Marker pressed:", spot.name);
  setShowSpotDetails(true);
};

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const renderSpotCard = ({ item }: { item: SpotWithDistance }) => (
  <TouchableOpacity style={styles.spotCard}
    onPress={() => {
      setSelectedSpot(item);
      setShowSpotDetails(true);
    }}>
    {/* Spot name at the top */}
    <Text style={styles.spotName}>{item.isFavorite ? "★ " : ""}{item.name}</Text>
    
    {/* Image fills remaining space */}
    <Image
      source={{ uri: item.photos[0]?.url }}
      style={styles.spotImage}
      resizeMode="cover"
      cachePolicy="memory-disk"
      removeClippedSubviews={false}  // keep offscreen items mounted

    />

    {/* Distance badge on image */}
    <View style={styles.distanceBadge}>
      <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
    </View>
  </TouchableOpacity>
);

  // Placeholder function; implement logic to pick best photo
  const getBestPhotoUrl = (photos: Photo[]) => {
    if (!photos || photos.length === 0) return "";
    return photos[0].url;
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Spotmap"
        rightButton={{ icon: "list", onPress: () => setShowFilters(true) }}
      />

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && memoizedMarkers}
      </MapView>

      {showFilters && (
        <View style={styles.filterOverlay}>
          <Text>Filter Options</Text>
        </View>
      )}

      {/* Floating button */}
      {mapReady && (
        <View
          style={[
            styles.floatingButtonContainer,
            { bottom: showList ? height * 0.4 : 0 },
          ]}
        >
          <Ionicons
            name={showList ? "chevron-down" : "chevron-up"}
            size={24}
            color="white"
            style={styles.floatingButton}
            onPress={() => setShowList(!showList)}
          />
        </View>
      )}

      {/* Show list */}
      {showList && (
        <View style={styles.listContainer}>
          <Text style={{ ...globalStyles.title, color: "white", marginBottom: 20 }}>
            Nearby spots
          </Text>
          <FlatList
            data={spotsWithDistance}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSpotCard}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <SpotDetailsOverlay
  spot={selectedSpot!}
  visible={showSpotDetails}
  onClose={() => setShowSpotDetails(false)}
  onShowOnMap={() => {
    // Optionally scroll/zoom map to this spot
    setShowSpotDetails(false);
  }}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  map: { width, height },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  floatingButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
  },
  floatingButton: {
    width: 140,
    height: 30,
    backgroundColor: "#1F3B28",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 25,
    color: "white",
  },
  listContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: ambrasGreen,
    padding: 10,
  },
  spotCard: {
    width: 240,
    height: 200,          // fixed total card height
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  spotName: {
    padding: 10,          // top padding for spacing
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  spotImage: {
    width: "100%",
    flex: 1,              // fills the remaining card height
  },
  distanceBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceText: {
    color: "white",
    fontSize: 12,
  },
});

export default SpotmapScreen;
