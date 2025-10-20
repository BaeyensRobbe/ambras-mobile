import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ApprovedSpot, Photo } from "../types/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ambrasGreen } from "../styles";
import ImageViewing from "react-native-image-viewing";


interface SpotDetailsOverlayProps {
  spot: ApprovedSpot;
  visible: boolean;
  onClose: () => void;
  onShowOnMap?: () => void;
}

const { width, height } = Dimensions.get("window");

const SpotDetailsOverlay: React.FC<SpotDetailsOverlayProps> = ({
  spot,
  visible,
  onClose,
  onShowOnMap,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);


  const photos: Photo[] = spot?.photos || [];

  // Lazy preload current, previous, next images
  useEffect(() => {
  if (!visible || photos.length === 0) return;
    console.log(photos)
  const preloadIndexes = [
    currentPhotoIndex,
    (currentPhotoIndex + 1) % photos.length,
    (currentPhotoIndex - 1 + photos.length) % photos.length,
  ];

  preloadIndexes.forEach((i) => {
    photos[i]?.url && Image.prefetch(photos[i].url);
  });
}, [currentPhotoIndex, photos, visible]);

  useEffect(() => {
  setCurrentPhotoIndex(0);
}, [spot]);

  if (!visible || !spot) return null;

  const prevPhoto = () =>
    setCurrentPhotoIndex((idx) =>
      idx === 0 ? photos.length - 1 : idx - 1
    );
  const nextPhoto = () =>
    setCurrentPhotoIndex((idx) =>
      idx === photos.length - 1 ? 0 : idx + 1
    );

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {spot.isFavorite && (
              <Text style={{ color: "#F2C94C" }}>★ </Text>
            )}
            <Text style={{ color: "white" }}>{spot.name}</Text>
          </Text>
          <TouchableOpacity onPress={() => {
    setCurrentPhotoIndex(0); // reset photo index
    onClose();                // call the parent close function
  }}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.cityContainer}>
          <Ionicons
            name="location-sharp"
            size={20}
            color="red"
            style={{ marginRight: 4, position: "relative", top: 3 }}
          />
          <Text style={styles.city}>{spot.city}</Text>
        </View>

        {/* Photo carousel */}
        {photos.length > 0 ? (
          <View style={styles.carouselContainer}>
            <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
  <Image
    source={{ uri: `${photos[currentPhotoIndex].url}?v=${Date.now()}` || undefined }}
    style={styles.image}
    resizeMode="cover"
    cachePolicy="memory-disk"
  />
</TouchableOpacity>

<ImageViewing
  images={photos.map((p) => ({ uri: p.url }))}
  imageIndex={currentPhotoIndex}
  visible={isViewerVisible}
  onRequestClose={() => setIsViewerVisible(false)}
  backgroundColor="black"
/>

            {photos.length > 1 && (
              <>
                <TouchableOpacity style={styles.prevButton} onPress={prevPhoto}>
                  <Ionicons
                    name="chevron-back-circle"
                    size={40}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={nextPhoto}>
                  <Ionicons
                    name="chevron-forward-circle"
                    size={40}
                    color="white"
                  />
                </TouchableOpacity>
                <View style={styles.carouselCounter}>
                  <Text style={styles.counterText}>
                    {currentPhotoIndex + 1} / {photos.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.noPhoto}>
            <Text style={{ color: "#666" }}>No photos available</Text>
          </View>
        )}

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "80%",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity style={{ flexDirection: "column", alignItems: "center" }}>
            <Image
              source={require("../assets/icons/share.png")}
              style={{ width: 30, height: 30, tintColor: "#00C4CC" }}
            />
            <Text style={{ color: "white" }}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: "column", alignItems: "center" }}>
            <Image
              source={require("../assets/icons/directions.png")}
              style={{ width: 30, height: 30, tintColor: "#00C4CC" }}
            />
            <Text style={{ color: "white" }}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: "column", alignItems: "center" }}>
            <Image
              source={require("../assets/icons/feedback.png")}
              style={{ width: 30, height: 30, tintColor: "#00C4CC" }}
            />
            <Text style={{ color: "white" }}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Spot info */}
        <View style={styles.infoContainer}>
          <Text style={styles.notes}>{spot.notes || "No notes available."}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={onShowOnMap}>
            <Text style={styles.mapButtonText}>Show on Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SpotDetailsOverlay;

// styles remain the same as your snippet


const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: ambrasGreen,
    zIndex: 999,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  carouselContainer: {
    width: "90%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  prevButton: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  nextButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  carouselCounter: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: "white",
    fontSize: 14,
  },
  noPhoto: {
    width: "90%",
    height: 300,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1F3B28",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  infoContainer: {
    width: "90%",
  },
  cityContainer: {
    width: "90%",
    flexDirection: "row",
  },
  city: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
  },
  notes: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 25,
  },
  mapButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
    marginBottom: 20,
  },
  mapButtonText: {
    color: "ambrasGreen",
    fontWeight: "bold",
    fontSize: 16,
  },
});
