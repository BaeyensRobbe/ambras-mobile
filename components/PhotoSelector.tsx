import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Photo } from "../types/types";
import { styles, ambrasGreen } from "../styles";

interface PhotoSelectorModalProps {
  visible: boolean;
  photos: Photo[];
  spot: any;
  onClose: () => void;
  onChange: (updatedPhotos: (string | Photo)[]) => void;
}

const PhotoSelectorModal: React.FC<PhotoSelectorModalProps> = ({
  visible,
  photos = [],
  spot,
  onClose,
  onChange,
}) => {
  const [localPhotos, setLocalPhotos] = useState<(string | Photo)[]>([]);

  useEffect(() => {
    if (spot?.status === "Approved") {
      const sorted = [...photos].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      setLocalPhotos(sorted);
    } else {
      setLocalPhotos(photos);
    }
  }, [photos, spot]);

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setLocalPhotos((prev) => [...prev, ...newUris]);
    }
  };

  const handleDeletePhoto = (photoToDelete: string | Photo) => {
    const uriToDelete =
      typeof photoToDelete === "string" ? photoToDelete : photoToDelete.url;

    setLocalPhotos((prev) =>
      prev.filter(
        (photo) =>
          (typeof photo === "string" ? photo : photo.url) !== uriToDelete
      )
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    setLocalPhotos((prev) => {
      const newPhotos = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newPhotos.length) return prev;

      const temp = newPhotos[index];
      newPhotos[index] = newPhotos[targetIndex];
      newPhotos[targetIndex] = temp;

      // If Approved, also update order fields
      if (spot?.status === "Approved") {
        newPhotos.forEach((p, i) => {
          if (typeof p !== "string") p.order = i + 1;
        });
      }
      return newPhotos;
    });
  };

  const handleSave = () => {
    if (spot?.status === "Approved") {
      const withOrder = localPhotos.map((p, i) =>
        typeof p === "string" ? p : { ...p, order: i + 1 }
      );
      onChange(withOrder);
    } else {
      onChange(localPhotos);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.flexRow}>
          <Text style={styles.modalTitle}>Manage Photos</Text>
          <TouchableOpacity
            style={{
              alignItems: "center",
              padding: 0,
              margin: 0,
              position: "relative",
            }}
            onPress={handleAddPhoto}
          >
            <Ionicons name="add-circle" size={50} color={ambrasGreen} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={localPhotos}
          keyExtractor={(item, index) =>
            typeof item === "string"
              ? `${item}-${index}`
              : item.id?.toString() || item.url
          }
          numColumns={2}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item, index }) => {
            const uri = typeof item === "string" ? item : item.url;
            return (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri }}
                  style={styles.image}
                  contentFit="cover"
                  cachePolicy="disk"
                />

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(item)}
                >
                  <Text style={styles.buttonText}>×</Text>
                </TouchableOpacity>

                {spot?.status === "Approved" && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      flexDirection: "column",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleMove(index, "up")}
                      disabled={index === 0}
                      style={{
                        backgroundColor: index === 0 ? "#aaa" : ambrasGreen,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>↑</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleMove(index, "down")}
                      disabled={index === photos.length - 1}
                      style={{
                        backgroundColor: index === photos.length - 1 ? "#aaa" : ambrasGreen,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>↓</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.statLabel}>No photos yet</Text>
          }
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "gray" }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: ambrasGreen }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PhotoSelectorModal;
