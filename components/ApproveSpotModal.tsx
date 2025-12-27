import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Spot, Photo } from "../types/types";
import { styles, ambrasGreen } from "../styles";
import { Image } from "expo-image";

interface ApproveSpotModalProps {
  visible: boolean;
  spot: Spot | null;
  onClose: () => void;
  onApprove: (updatedSpot: Spot) => void;
}

const { width } = Dimensions.get("window");

const ApproveSpotModal: React.FC<ApproveSpotModalProps> = ({ visible, spot, onClose, onApprove }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);

useEffect(() => {
  if (spot) {
    const sortedPhotos = [...spot.photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setPhotos(sortedPhotos);
  }
}, [spot]);


  if (!spot) return null;

  const fields: { key: keyof Spot; label: string; type: "text" | "check" | "favorite" | "location" }[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "notes", label: "Notes", type: "text" },
    { key: "isPkPark", label: "Parkour park", type: "check" },
    { key: "isCovered", label: "Covered", type: "check" },
    { key: "hasFlipArea", label: "Flip area", type: "check" },
    { key: "hasSwings", label: "Swings", type: "check" },
    { key: "isFavorite", label: "Favorite", type: "favorite" },
    { key: "lat", label: "Location", type: "location" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.modalTitle, { color: ambrasGreen }]}>Approve Spot</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 24 }}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          {fields.map((field) => {
            let value: string | boolean = spot[field.key];
            if (field.type === "check" || field.type === "favorite") value = !!value;
            else if (!value) value = "-";

            const isMultilineField = field.key === "notes";

            return (
              <View
                key={field.key}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                  ...(isMultilineField
                    ? { flexDirection: "column", alignItems: "flex-start" }
                    : { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }),
                }}
              >
                <Text style={{ fontWeight: "600", fontSize: 16 }}>{field.label}</Text>
                {field.type === "check" ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: ambrasGreen,
                      backgroundColor: value ? ambrasGreen : "#fff",
                    }}
                  />
                ) : field.type === "favorite" ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: ambrasGreen,
                      backgroundColor: value ? "yellow" : "#fefefeff",
                    }}
                  />
                ) : field.type === "location" ? (
                  <Text style={{ fontSize: 16, color: "#000" }}>
                    {spot.lat && spot.lng ? `${spot.lat.toFixed(5)}, ${spot.lng.toFixed(5)}` : "-"}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, color: "#000" }}>{value}</Text>
                )}
              </View>
            );
          })}

          {spot.lat && spot.lng && (
            <MapView
              style={{ width: "100%", height: 300, marginVertical: 10, borderRadius: 8 }}
              initialRegion={{
                latitude: spot.lat,
                longitude: spot.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              mapType="satellite"
            >
              <Marker coordinate={{ latitude: spot.lat, longitude: spot.lng }} />
            </MapView>
          )}

          {/* Photos Section */}
          <Text style={[styles.label, { marginBottom: 5, marginTop: 10 }]}>Photos</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {photos.map((photo, index) => (
              <View
                key={photo.id}
                style={{
                  width: (width - 40) / 2,
                  marginBottom: 15,
                  alignItems: "center",
                }}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: photo.url }}
                    style={{
                      width: (width - 40) / 2,
                      height: (width - 40) / 2,
                      borderRadius: 10,
                    }}
                    contentFit="cover"
                    cachePolicy="disk"
                  />
                  
                </View>

                <Text style={{ color: "white", marginTop: 5 }}>#{index + 1}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Approve Button */}
        <View style={{ paddingVertical: 10 }}>
          <TouchableOpacity
            onPress={() =>
              onApprove({
                ...spot,
                photos: photos.map((p) => ({
                  id: p.id,
                  url: p.url,
                  spotId: p.spotId,
                  uuid: p.uuid,
                  order: p.order,
                })),
              })
            }
            style={{
              backgroundColor: ambrasGreen,
              padding: 15,  
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Approve Spot</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ApproveSpotModal;
