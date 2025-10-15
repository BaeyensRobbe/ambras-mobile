import React, { memo } from "react";
import { Marker, Callout } from "react-native-maps";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { ApprovedSpot } from "../../types/types";
import { getIconByCategory } from "../../utils/spotmap";

interface SpotMarkerProps {
  spot: ApprovedSpot;
  onPress?: (spot: ApprovedSpot) => void; // callback when tapping the callout
}

export const SpotMarker: React.FC<SpotMarkerProps> = memo(({ spot, onPress }) => (
  <Marker
    coordinate={{
      latitude: spot.lat,
      longitude: spot.lng,
    }}
    image={getIconByCategory(spot.category || "")}
    tracksViewChanges={false}
  >
    <Callout tooltip onPress={() => onPress && onPress(spot)}>
      <TouchableOpacity style={styles.calloutContainer}>
        {/* Spot image */}
        {spot.photos[0]?.url && (
          <Image source={{ uri: spot.photos[0].url }} style={styles.calloutImage} />
        )}

        {/* Spot name */}
        <Text style={styles.calloutTitle}>{spot.name}</Text>
      </TouchableOpacity>
    </Callout>
  </Marker>
));

const styles = StyleSheet.create({
  calloutContainer: {
    width: 140,
    padding: 6,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
  },
  calloutImage: {
    width: 120,
    height: 80,
    borderRadius: 6,
    marginBottom: 4,
  },
  calloutTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },
});
