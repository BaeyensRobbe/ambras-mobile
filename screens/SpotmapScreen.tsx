import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Switch } from "react-native";
import { Image } from "expo-image";
import { useRef } from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useState } from "react";
import { fetchSpots } from "../api/spots";
import { simulateProgress } from "../utils/toastHelperFunctions";
import Toast from "react-native-toast-message";
import Header from "../components/Header";
import { LocationContext } from "../components/location/LocationContext";
import { SpotMarker } from "../components/spotmap/Marker";
import { ApprovedSpot, Category, Spot } from "../types/types";
import { ambrasGreen, styles as globalStyles } from "../styles";
import SpotDetailsOverlay from "../components/SpotDetailsOverlay";
import { PickerInputModal } from "../components/PickerInputModal";
import { fetchCitiesOnly } from "../utils/spotHelperFunctions";

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

  const mapRef = useRef<MapView>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number, y: number } | null>(null);

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
      const uniqueCities = [...new Set(fetchedCities)];
      setCities(uniqueCities);

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
    if (!spotsWithDistance.length) return;

    const newFiltered = spotsWithDistance.filter((spot) => {
      if (selectedCategory !== "All" && spot.category !== selectedCategory) return false;
      if (selectedCity !== "All Cities" && spot.city !== selectedCity) return false;
      if (selectedFeatures.length > 0) {
        const hasAll = selectedFeatures.every((f) => spot[featureFieldMap[f]]);
        if (!hasAll) return false;
      }
      return true;
    });

    setFilteredSpots(newFiltered);
  }, [spotsWithDistance, selectedCategory, selectedCity, selectedFeatures]);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  // FILTERED SPOTS
  const getFilteredSpots = () => {
    return spotsWithDistance.filter((spot) => {
      if (selectedCategory !== "All" && spot.category !== selectedCategory) return false;
      if (selectedCity !== "All Cities" && spot.city !== selectedCity) return false;
      if (selectedFeatures.length > 0) {
        const hasAll = selectedFeatures.every((f) => spot[featureFieldMap[f]]);
        if (!hasAll) return false;
      }
      return true;
    });
  };

  const handleMarkerPress = async (spot: ApprovedSpot) => {
    if (!mapRef.current) return;

    const point = await mapRef.current.pointForCoordinate({
      latitude: spot.lat,
      longitude: spot.lng,
    });

    // Now you have the screen position
    console.log("Screen coordinates:", point);

    setSelectedSpot(spot);
    setOverlayPos(point); // save for your custom callout
  };

  // MAP / MARKERS
  const memoizedMarkers = useMemo(
    () => filteredSpots.map((spot) => <SpotMarker key={spot.id} spot={spot} onPress={handleMarkerPress} />),
    [filteredSpots]
  );

  if (!userLocation) return <View style={styles.center}><Text>Fetching your location...</Text></View>;

  const initialRegion = {
    latitude: userLocation.latitude || 50.8798,
    longitude: userLocation.longitude || 4.7005,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // PICKER HANDLING
  const openPicker = (field: "category" | "city") => {
    setActiveField(field);
    setShowPickerInputModal(true);
  };

  const handlePickerSelect = (value: any) => {
    if (activeField === "category") setSelectedCategory(value);
    if (activeField === "city") setSelectedCity(value);
    setShowPickerInputModal(false); // close modal
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

  // SPOT CARD
  const renderSpotCard = ({ item }: { item: SpotWithDistance }) => (
    <TouchableOpacity style={styles.spotCard} onPress={() => { setSelectedSpot(item); setShowSpotDetails(true); }}>
      <Text style={styles.spotName}>{item.isFavorite ? "★ " : ""}{item.name}</Text>
      <Image source={{ uri: item.photos[0]?.url }} style={styles.spotImage} resizeMode="cover" transition={300} cachePolicy="memory-disk" />
      <View style={styles.distanceBadge}><Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text></View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header title="Spotmap" rightButton={{ icon: "filter", onPress: () => setShowFilters(!showFilters) }} />
      <MapView ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE} onRegionChangeStart={() => setSelectedSpot(null)} initialRegion={initialRegion} showsUserLocation onMapReady={() => setMapReady(true)}>
        {mapReady && memoizedMarkers}
      </MapView>

      {showFilters && (
        <View style={styles.filterOverlay}>
          {/* <View style={globalStyles.flexRow}>
            <Text style={{...globalStyles.modalTitle, marginBottom: 5}}>Filters</Text>
            <Ionicons name="close" size={24} onPress={() => setShowFilters(false)} />
          </View> */}

          <View style={{ flexDirection: "column", gap: 15, marginTop: 10 }}>
              <Text style={globalStyles.darkTitle}>Type</Text>
            <TouchableOpacity onPress={() => openPicker("category")} style={styles.filterRow}>
              <Text style={globalStyles.darkTitle}>{getSelectedDisplay("category")} <Ionicons name="chevron-down" size={16} style={{ fontWeight: 600 }} /></Text>
            </TouchableOpacity>

              <Text style={globalStyles.darkTitle}>City</Text>

            <TouchableOpacity onPress={() => openPicker("city")} style={styles.filterRow}>
              <Text style={globalStyles.darkTitle}>{getSelectedDisplay("city")} </Text>
            <Ionicons name="chevron-down" size={16} style={{ fontWeight: 600 }} />
            </TouchableOpacity>

            {/* Features as checkboxes */}
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.darkTitle}>Features</Text>
              {Object.keys(featureFieldMap).map((f) => (
                <TouchableOpacity key={f} onPress={() => toggleFeature(f)}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 0, borderBottomWidth: 1, borderBottomColor: "#eeeeeeff" }}>
                    <Text style={{fontSize: 16, marginVertical: 8}}>{featureFieldMap[f]}</Text>
                    <Ionicons   
                      name={selectedFeatures.includes(f) ? "checkmark-circle" : "radio-button-off"}
                      size={30}
                      color={selectedFeatures.includes(f) ? ambrasGreen : "#999"}
                    />

                    {/* <Switch value={selectedFeatures.includes(f)} onValueChange={() => toggleFeature(f)} />
                  <Text style={{ marginLeft: 8 }}>{f}</Text> */}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
      )}

      {/* Floating button */}
      {mapReady && (
        <View style={[styles.floatingButtonContainer, { bottom: showList ? height * 0.4 : 0 }]}>
          <Ionicons
            name={showList ? "chevron-down" : "chevron-up"}
            size={24}
            color="white"
            style={styles.floatingButton}
            onPress={() => setShowList(!showList)}
          />
        </View>
      )}

      {overlayPos && selectedSpot && (
        <View style={{ zIndex: -1, position: "absolute", left: width / 2 - 75, top: height / 2 - 75, width: 150, backgroundColor: "white", padding: 8, borderRadius: 8, borderColor: ambrasGreen, borderWidth: 2 }}>
          <TouchableOpacity onPress={() => { setShowSpotDetails(true) }}>
            <TouchableOpacity
              onPress={() => {
                setOverlayPos(null);
                setSelectedSpot(null);
              }}
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
            key={filteredSpots.map(s => s.id).join(',')}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSpotCard}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <SpotDetailsOverlay spot={selectedSpot!} visible={showSpotDetails} onClose={() => setShowSpotDetails(false)} />
    </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  map: { width, height, zIndex: -2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterOverlay: { position: "absolute", top: 70, width: "100%", backgroundColor: "white", padding: 10, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  filterRow: { ...globalStyles.flexRow, borderWidth: 1, borderBottomWidth: 1, borderBottomColor: ambrasGreen, padding: 6, justifyContent: "space-between"},
  floatingButtonContainer: { position: "absolute", alignSelf: "center", zIndex: 10 },
  floatingButton: { width: 140, height: 30, backgroundColor: ambrasGreen, borderTopLeftRadius: 20, borderTopRightRadius: 20, textAlign: "center", textAlignVertical: "center" },
  listContainer: { position: "absolute", bottom: 0, left: 0, right: 0, height: height * 0.4, backgroundColor: ambrasGreen, padding: 10 },
  spotCard: { width: 240, height: 200, marginRight: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "white" },
  spotName: { padding: 10, fontWeight: "bold", fontSize: 18, textAlign: "center" },
  spotImage: { width: "100%", flex: 1 },
  distanceBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  distanceText: { color: "white", fontSize: 12 },
});

export default SpotmapScreen;
