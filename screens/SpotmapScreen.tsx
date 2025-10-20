import React, { useRef, useState, useEffect, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { fetchSpots } from "../api/spots";
import { simulateProgress } from "../utils/toastHelperFunctions";
import Toast from "react-native-toast-message";
import { LocationContext } from "../components/location/LocationContext";
import { SpotMarker } from "../components/spotmap/Marker";
import { ApprovedSpot, Category, Spot } from "../types/types";
import { ambrasGreen, styles as globalStyles } from "../styles";
import SpotDetailsOverlay from "../components/SpotDetailsOverlay";
import { PickerInputModal } from "../components/PickerInputModal";
import { fetchCitiesOnly } from "../utils/spotHelperFunctions";
import SpotSearchModal from "../components/spotmap/SpotSearchModal";
import MultiSelectModal from "../components/MultiSelectModal";

const { width, height } = Dimensions.get("window");

interface SpotWithDistance extends ApprovedSpot {
  distance: number;
}

const SpotmapScreen: React.FC = () => {
  const [spots, setSpots] = useState<ApprovedSpot[]>([]);
  const [spotsWithDistance, setSpotsWithDistance] = useState<SpotWithDistance[]>([]);
  const [showList, setShowList] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedSpot, setSelectedSpot] = useState<ApprovedSpot | null>(null);
  const [showSpotDetails, setShowSpotDetails] = useState(false);
  const [filteredSpots, setFilteredSpots] = useState<SpotWithDistance[]>([]);

  // FILTER STATES
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // PICKER
  const [showPickerInputModal, setShowPickerInputModal] = useState(false);
  const [activeField, setActiveField] = useState<"category" | "city" | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const userLocation = useContext(LocationContext);

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  const mapRef = useRef<MapView>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null);

  // Feature mapping
  const featureFieldMap: Record<string, keyof Spot> = {
    "Covered": "isCovered",
    "Swings": "hasSwings",
    "Flip area": "hasFlipArea",
    "Parkour park": "isPkPark",
  };

  // DATA FETCHING
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      Toast.show({ type: "progress", text1: "Loading spots...", props: { progress: 0 }, autoHide: false, toastId: "fetchProgress" });
      const progressPromise = simulateProgress(1500, (p) => {
        Toast.show({ type: "progress", text1: "Loading spots...", props: { progress: p }, autoHide: false, toastId: "fetchProgress" });
      });

      const data = await fetchSpots("Approved");
      await progressPromise;
      setSpots(data);

      const fetchedCities = await fetchCitiesOnly();
      setCities([...new Set(fetchedCities)]);

      Toast.hide();
      Toast.show({ type: "success", text1: "Spots loaded successfully" });
    } catch (error) {
      console.error("Error fetching spots:", error);
      Toast.hide();
      Toast.show({ type: "error", text1: "Failed to load spots", text2: (error as Error)?.message || "Check connection or API" });
    }
  };

  // LOCATION / DISTANCE
  useEffect(() => {
    if (userLocation && spots.length) {
      const spotsWithDist = spots.map((spot) => ({
        ...spot,
        distance: getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, spot.lat, spot.lng),
      }));
      spotsWithDist.sort((a, b) => a.distance - b.distance);
      setSpotsWithDistance(spotsWithDist);
      setFilteredSpots(spotsWithDist);
    }
  }, [userLocation, spots]);

  useEffect(() => {
    filterSpots();
  }, [spotsWithDistance, selectedCategory, selectedCity, selectedFeatures, searchQuery]);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const filterSpots = () => {
    const newFiltered = spotsWithDistance.filter((spot) => {
      if (selectedCategory !== "All" && spot.category !== selectedCategory) return false;
      if (selectedCity !== "All Cities" && spot.city !== selectedCity) return false;
      if (selectedFeatures.length > 0) {
        const hasAll = selectedFeatures.every((f) => spot[featureFieldMap[f]]);
        if (!hasAll) return false;
      }
      if (searchQuery && !spot.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    setFilteredSpots(newFiltered);
  };

  const handleMarkerPress = async (spot: ApprovedSpot) => {
    if (!mapRef.current) return;
    const point = await mapRef.current.pointForCoordinate({
      latitude: spot.lat,
      longitude: spot.lng,
    });
    setSelectedSpot(spot);
    setOverlayPos(point);
  };

  // PICKER HANDLING
  const openPicker = (field: "category" | "city") => {
    setActiveField(field);
    setShowPickerInputModal(true);
  };

  const handlePickerSelect = (value: any) => {
    if (activeField === "category") setSelectedCategory(value);
    if (activeField === "city") setSelectedCity(value);
    setShowPickerInputModal(false);
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const getSelectedDisplay = (field: "category" | "city") => {
    if (field === "category") return selectedCategory;
    if (field === "city") return selectedCity;
    return "";
  };

  const renderSpotCard = ({ item }: { item: SpotWithDistance }) => (
    <TouchableOpacity style={styles.spotCard} onPress={() => { setSelectedSpot(item); setShowSpotDetails(true); }}>
      <Text style={styles.spotName}>{item.isFavorite ? "★ " : ""}{item.name}</Text>
      <Image source={{ uri: item.photos[0]?.url }} style={styles.spotImage} resizeMode="cover" transition={300} cachePolicy="memory-disk" />
      <View style={styles.distanceBadge}><Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text></View>
    </TouchableOpacity>
  );

  const initialRegion = {
    latitude: userLocation?.latitude || 50.8798,
    longitude: userLocation?.longitude || 4.7005,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const memoizedMarkers = useMemo(
    () => filteredSpots.map((spot) => <SpotMarker key={spot.id} spot={spot} onPress={handleMarkerPress} />),
    [filteredSpots]
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar + filters */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search" size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: "#888" }}>Search spots...</Text>
        </TouchableOpacity>

        {/* Filters row */}
        <ScrollView horizontal style={styles.filtersRow} contentContainerStyle={{ gap: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={() => openPicker("category")} style={styles.filterRow}>
            <Text style={styles.filterText}>{getSelectedDisplay("category")} <Ionicons name="chevron-down" size={16} /></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker("city")} style={styles.filterRow}>
            <Text style={styles.filterText}>{getSelectedDisplay("city")} <Ionicons name="chevron-down" size={16} /></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFeatureModal(true)} style={styles.filterRow}>
            <Text style={styles.filterText}>
              {selectedFeatures.length > 0 ? `${selectedFeatures.length} Features` : "Select Features"}{" "}
              <Ionicons name="chevron-down" size={16} />
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <SpotSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        spots={spotsWithDistance}
        onSelectSpot={(spot) => {
          setSearchModalVisible(false);
          mapRef.current?.animateToRegion(
            {
              latitude: spot.lat,
              longitude: spot.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            500
          );
          setTimeout(() => handleMarkerPress(spot as ApprovedSpot), 600);
        }}
      />

      <MultiSelectModal
        visible={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        options={Object.keys(featureFieldMap)}
        selected={selectedFeatures}
        onSelect={(selected) => setSelectedFeatures(selected)}
        title="Select Features"
      />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass={true}
        showsMyLocationButton={true}
        onRegionChangeStart={() => setSelectedSpot(null)}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && memoizedMarkers}
      </MapView>

      {overlayPos && selectedSpot && (
        <View style={styles.overlay}>
          <TouchableOpacity onPress={() => setShowSpotDetails(true)}>
            <TouchableOpacity
              onPress={() => { setOverlayPos(null); setSelectedSpot(null); }}
              style={{ position: "absolute", top: 4, right: 4, zIndex: 10 }}
            >
              <Ionicons name="close" size={16} />
            </TouchableOpacity>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>{selectedSpot.name}</Text>
            <Image source={{ uri: selectedSpot.photos[0]?.url }} style={{ width: "100%", height: 80, borderRadius: 6, marginTop: 4 }} cachePolicy="memory-disk" />
          </TouchableOpacity>
        </View>
      )}

      {showList && (
        <View style={styles.listContainer}>
          <Text style={{ ...globalStyles.title, color: "white", marginBottom: 20 }}>Nearby spots</Text>
          <FlatList
            data={filteredSpots}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSpotCard}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <SpotDetailsOverlay spot={selectedSpot!} visible={showSpotDetails} onClose={() => setShowSpotDetails(false)} />

      <PickerInputModal
        visible={showPickerInputModal}
        options={
          activeField === "city"
            ? ["All Cities", ...cities].map((v) => ({ label: v, value: v }))
            : activeField === "category"
              ? ["All", ...Object.values(Category)].map((cat) => ({ label: cat, value: cat }))
              : []
        }
        title={activeField === "category" ? "Select Type" : "Select City"}
        onClose={() => setShowPickerInputModal(false)}
        selectedValue={activeField === "category" ? selectedCategory : selectedCity}
        onSelect={handlePickerSelect}
      />
    </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  map: { width, height, zIndex: -2 },
  searchContainer: { backgroundColor: ambrasGreen, width: "100%", paddingTop: 35, paddingBottom: 10, zIndex: 10 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 8, paddingHorizontal: 10, height: 40, width: "95%", alignSelf: "center" },
  filtersRow: { marginTop: 10, width: "100%", paddingHorizontal: 5 },
  filterRow: { flexDirection: "row", justifyContent: "center", borderWidth: 1, borderColor: "white", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20,  },
  filterText: { color: "white", fontWeight: "500", fontSize: 14 },
  goToLocationButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "white",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 20,
  },
  floatingIcon: { width: 20, height: 20, resizeMode: "contain" },
  listContainer: { position: "absolute", bottom: 0, left: 0, right: 0, height: height * 0.4, backgroundColor: ambrasGreen, padding: 10 },
  spotCard: { width: 240, height: 200, marginRight: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "white" },
  spotName: { padding: 10, fontWeight: "bold", fontSize: 18, textAlign: "center" },
  spotImage: { width: "100%", flex: 1 },
  distanceBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  distanceText: { color: "white", fontSize: 12 },
  overlay: { zIndex: 100, position: "absolute", left: width / 2 - 75, top: height / 2 - 75, width: 150, backgroundColor: "white", padding: 8, borderRadius: 8, borderColor: ambrasGreen, borderWidth: 2 },
});

export default SpotmapScreen;
