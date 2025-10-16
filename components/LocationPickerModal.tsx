// LocationPickerModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList, Dimensions, Keyboard } from "react-native";
import MapView, { Marker, MapEvent, AnimatedRegion } from "react-native-maps";
import { ambrasGreen, styles } from "../styles";
import { MAPS_API_KEY } from "@env";
import axios from "axios";


interface LocationPickerModalProps {
  visible: boolean;
  lat?: number;
  lng?: number;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

const { width, height } = Dimensions.get("window");

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  lat,
  lng,
  onClose,
  onSelect,
}) => {
  // States
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const mapRef = React.useRef<MapView | null>(null);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
  if (marker && mapRef.current) {
    mapRef.current.animateToRegion(
      {
        latitude: marker.lat,
        longitude: marker.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500 // duration in ms
    );
  }
}, [marker]);


  // Handlers
  const handlePress = (e: MapEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
  };

  const handleSave = () => {
    if (marker) {
      onSelect(marker.lat, marker.lng);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1}}>
        <Text style={styles.title}>Select Location</Text>
        <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search location..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={async (text) => {
            setSearchText(text);
            if (text.length > 2) {
              try {
                const res = await axios.get(
                  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${MAPS_API_KEY}&language=en`
                );
                setSuggestions(res.data.predictions || []);
              } catch (err) {
                console.error("Places error:", err);
              }
            } else {
              setSuggestions([]);
            }
          }}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={async () => {
                  Keyboard.dismiss();
                  setSearchText(item.description);
                  setSuggestions([]);
                  try {
                    const detailsRes = await axios.get(
                      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${MAPS_API_KEY}`
                    );
                    const loc = detailsRes.data.result.geometry.location;
                    setMarker({ lat: loc.lat, lng: loc.lng });
                  } catch (err) {
                    console.error("Details error:", err);
                  }
                }}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}
                  </View>

        <MapView
          style={styles.map}
          ref={mapRef}
          mapType={mapType}
          initialRegion={{
            latitude: lat || 51.2194, // default center (e.g., Antwerp)
            longitude: lng || 4.4025,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handlePress}
          showsUserLocation={true}
        >
          {marker && <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />}
        </MapView>

        <TouchableOpacity
  style={styles.mapTypeToggle}
  onPress={() =>
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"))
  }
>
  <Text style={styles.buttonText}>
    {mapType === "standard" ? "Satellite" : "Standard"}
  </Text>
</TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "gray" }]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: ambrasGreen }]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPickerModal;


