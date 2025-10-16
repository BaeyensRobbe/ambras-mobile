import React, { memo } from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, Image, StyleSheet, View } from "react-native";
import { ApprovedSpot } from "../../types/types";
import { getIconByCategory } from "../../utils/spotmap";

interface SpotMarkerProps {
  spot: ApprovedSpot;
  onPress?: (spot: ApprovedSpot) => void;
}

export const SpotMarker: React.FC<SpotMarkerProps> = memo(({ spot, onPress }) => (
  <Marker
  coordinate={{ latitude: spot.lat, longitude: spot.lng }}
  image={getIconByCategory(spot.category || "")}
  tracksViewChanges={false}
  onPress={() => onPress?.(spot)}
>
</Marker>

));