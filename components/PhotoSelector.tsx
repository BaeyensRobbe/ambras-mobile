import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { downloadAsync, cacheDirectory } from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Photo } from "../types/types";
import { styles, ambrasGreen } from "../styles";
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

interface PhotoSelectorModalProps {
  visible: boolean;
  photos: Photo[];
  spot: any;
  onClose: () => void;
  onChange: (updatedPhotos: (string | Photo)[]) => void;
}

// Track rotation for each photo
// interface PhotoWithRotation {
//   photo: string | Photo;
//   rotation: number; // 0, 90, 180, 270
//   clientId: string;
// }

const PhotoSelectorModal: React.FC<PhotoSelectorModalProps> = ({
  visible,
  photos = [],
  spot,
  onClose,
  onChange,
}) => {
  const [localPhotos, setLocalPhotos] = useState<Photo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Normalizes photo orders starting from 1
const normalizeOrders = (photos: Photo[]): Photo[] => {
  return photos.map((p, i) => ({ ...p, order: i + 1 }));
};


useEffect(() => {
  console.log("📂 Modal opened with photos:", photos);
  const sortedPhotos = [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  setLocalPhotos(normalizeOrders(sortedPhotos));
}, [photos, spot]);

const handleAddPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsMultipleSelection: true,
  });

  if (!result.canceled) {
    setLocalPhotos((prev) => {
      const newPhotos: Photo[] = result.assets.map((a, i) => ({
        id: 0,
        url: a.uri,
        uuid: String(Date.now()) + '-' + i, // unique per photo
        spotId: spot.id,
        order: prev.length + i + 1,
      }));

      const combined = [...prev, ...newPhotos];
      return normalizeOrders(combined);
    });
  }
};



  const handleDeletePhoto = (photoToDelete: Photo) => {
    console.log("🗑 Deleting photo:", photoToDelete.url);
      setLocalPhotos((prev) =>
    normalizeOrders(prev.filter((p) => p.url !== photoToDelete.url))
  );
  };


const handleMove = (index: number, direction: "up" | "down") => {
  setLocalPhotos((prev) => {
    const newPhotos = [...prev];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newPhotos.length) return prev;

    [newPhotos[index], newPhotos[target]] = [newPhotos[target], newPhotos[index]];

    return normalizeOrders(newPhotos);
  });
};

  // const handleRotatePhoto = (index: number) => {
  //   setLocalPhotos((prev) => {
  //     const newPhotos = [...prev];
  //     newPhotos[index] = {
  //       ...newPhotos[index],
  //     };
  //     return newPhotos;
  //   });
  // };

// Add this import at the top of PhotoSelectorModal.tsx


// Replace the handleDownloadPhoto function
const handleDownloadPhoto = async (uri: string) => {
  try {
    let localUri = uri;
    
    // Only download if it's a remote URL
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      console.log('📥 Downloading photo from:', uri);
      const filename = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
      const fileUri = `${cacheDirectory}${filename}`;
      
      const downloadResult = await downloadAsync(uri, fileUri);
      
      if (!downloadResult || !downloadResult.uri) {
        throw new Error('Download failed - no URI returned');
      }
      
      localUri = downloadResult.uri;
    } else {
      console.log('📁 Using local photo:', uri);
    }
    
    // Request permission to save to media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status === 'granted') {
      // Save to device's photo library
      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync('Ambras', asset, false);
      alert('✅ Photo saved to your gallery!');
    } else {
      // Fallback: use share sheet if permission denied
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Save Photo',
        });
      } else {
        alert('❌ Unable to save photo. Please check permissions.');
      }
    }
  } catch (error) {
    console.error("Error downloading photo:", error);
    alert("❌ Failed to download photo. Please try again.");
  }
};

  // Replace the handleSave function in PhotoSelectorModal
const handleSave = () => {
    console.log("💾 Saving photos:", localPhotos);
    onChange(localPhotos);
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
            disabled={isProcessing}
          >
            <Ionicons name="add-circle" size={50} color={isProcessing ? "#aaa" : ambrasGreen} />
          </TouchableOpacity>
        </View>

        {isProcessing && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="large" color={ambrasGreen} />
            <Text style={{ marginTop: 10, color: "#666" }}>
              Processing photos...
            </Text>
          </View>
        )}

        <FlatList
          data={localPhotos}
          keyExtractor={(item) => typeof item === "string" ? item : item.url}

          numColumns={2}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item, index }) => {
            const uri = typeof item === "string" ? item : item.url;
            // const rotation = item.rotation;
            
            return (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri }}
                  style={[
                    styles.image,
                  ]}
                  contentFit="cover"
                  cachePolicy="disk"
                />

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(item)}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>×</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={async () => {handleDownloadPhoto(uri)}}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>⬇</Text>

                </TouchableOpacity>

              
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
                      disabled={index === 0 || isProcessing}
                      style={{
                        backgroundColor: (index === 0 || isProcessing) ? "#aaa" : ambrasGreen,
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
                      disabled={index === localPhotos.length - 1 || isProcessing}
                      style={{
                        backgroundColor: (index === localPhotos.length - 1 || isProcessing) ? "#aaa" : ambrasGreen,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>↓</Text>
                    </TouchableOpacity>
                  </View>
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
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isProcessing ? "#aaa" : ambrasGreen }
            ]}
            onPress={handleSave}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? "Processing..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PhotoSelectorModal;