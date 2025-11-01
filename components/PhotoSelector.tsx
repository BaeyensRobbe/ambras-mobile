import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Photo } from "../types/types";
import { styles, ambrasGreen } from "../styles";
import {Image} from "expo-image"


interface PhotoSelectorModalProps {
  visible: boolean;
  photos: Photo[];
  onClose: () => void;
  onChange: (updatedPhotos: (String | Photo)[]) => void;
}

const PhotoSelectorModal: React.FC<PhotoSelectorModalProps> = ({
  visible,
  photos = [],
  onClose,
  onChange,
}) => {
  const [localPhotos, setLocalPhotos] = useState<(String | Photo)[]>(photos);

  // Adds a new photo
  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      const updated = [...localPhotos, ...newUris];
      setLocalPhotos(updated);    }
  };

  const handleSave = () => {
    onChange(localPhotos);
    onClose();
  }

  const handleDeletePhoto = (uri: string) => {
    const updatedPhotos = localPhotos.filter(
      (photo) => (typeof photo === "string" ? photo : photo.url) !== (typeof uri === "string" ? uri : uri.url)
    );
    setLocalPhotos(updatedPhotos);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.flexRow}>

        <Text style={styles.modalTitle}>Manage Photos</Text>
        <TouchableOpacity style={{
              alignItems: "center",
              padding: 0,
              margin: 0,
              position: "relative",
            }}
            onPress={handleAddPhoto}>
          <Ionicons name="add-circle" size={50} color={ambrasGreen} />
        </TouchableOpacity>
        </View>

        <FlatList
          data={localPhotos}
          keyExtractor={(item) => (typeof item === "string" ? item : item.id?.toString() || item.url)}
          numColumns={2}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => {
            const uri = typeof item === "string" ? item : item.url;
            return (
              <View style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} contentFit="cover" cachePolicy="disk" />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(item)}
                >
                  <Text style={styles.buttonText}>×</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.statLabel}>No photos yet</Text>
          }
        />


        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "gray"}]}
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
