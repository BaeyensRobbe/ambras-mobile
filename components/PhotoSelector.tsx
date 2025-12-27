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
interface PhotoWithRotation {
  photo: string | Photo;
  rotation: number; // 0, 90, 180, 270
  clientId: string;
}

const PhotoSelectorModal: React.FC<PhotoSelectorModalProps> = ({
  visible,
  photos = [],
  spot,
  onClose,
  onChange,
}) => {
  const [localPhotos, setLocalPhotos] = useState<PhotoWithRotation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (spot?.status === "Approved") {
      const sorted = [...photos].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      setLocalPhotos(sorted.map(p => ({ photo: p, rotation: 0 })));
    } else {
      setLocalPhotos(photos.map(p => ({ photo: p, rotation: 0 })));
    }
  }, [photos, spot]);

const handleAddPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsMultipleSelection: true,
  });

  if (!result.canceled) {
    const newPhotos = result.assets.map((a, i) => {
      if (spot?.status === "Approved") {
        // Approved: create Photo object
        return {
          photo: {
            id: 0,
            url: a.uri,
            uuid: photos[0]?.uuid || String(spot.id),
            spotId: spot.id,
            order: localPhotos.length + i + 1,
          },
          rotation: 0,
          clientId: `${a.uri}-${Date.now()}`,
        };
      } else {
        // Pending: just store string URI
        return {
          photo: a.uri,
          rotation: 0,
          clientId: `${a.uri}-${Date.now()}`,
        };
      }
    });
    setLocalPhotos((prev) => [...prev, ...newPhotos]);
  }
};


  const handleDeletePhoto = (photoToDelete: string | Photo) => {
    const uriToDelete =
      typeof photoToDelete === "string" ? photoToDelete : photoToDelete.url;

    setLocalPhotos((prev) =>
      prev.filter((item) => {
        const uri = typeof item.photo === "string" ? item.photo : item.photo.url;
        return uri !== uriToDelete;
      })
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
        newPhotos.forEach((item, i) => {
          if (typeof item.photo !== "string") {
            item.photo.order = i + 1;
          }
        });
      }
      return newPhotos;
    });
  };

  const handleRotatePhoto = (index: number) => {
    setLocalPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = {
        ...newPhotos[index],
        rotation: (newPhotos[index].rotation + 90) % 360,
      };
      return newPhotos;
    });
  };

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

  const downloadImage = async (url: string): Promise<string> => {
    // Download remote image to local cache
    const filename = url.split('/').pop() || `temp-${Date.now()}.jpg`;
    const fileUri = `${cacheDirectory}${filename}`;
    
    const downloadResult = await downloadAsync(url, fileUri);
    return downloadResult.uri;
  };

  const processAndRotateImage = async (
    uri: string,
    rotation: number
  ): Promise<string> => {
    if (rotation === 0) return uri;

    // If it's a remote URL, download it first
    let localUri = uri;
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      localUri = await downloadImage(uri);
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      localUri,
      [{ rotate: rotation }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  };

  // Replace the handleSave function in PhotoSelectorModal
const handleSave = async () => {
  setIsProcessing(true);
  try {
    const processedPhotos: (string | Photo)[] = [];

    for (let i = 0; i < localPhotos.length; i++) {
      const item = localPhotos[i];
      const { photo, rotation } = item;

      if (spot?.status === "Approved") {
        // Approved: ensure Photo object with order
        let finalPhoto: Photo = { ...(photo as Photo), order: i + 1 };

        if (rotation !== 0) {
          try {
            const rotatedUri = await processAndRotateImage(photo.url, rotation);
            finalPhoto.url = rotatedUri;
          } catch (err) {
            console.error("Rotation failed:", err);
          }
        }

        processedPhotos.push(finalPhoto);
      } else {
        // Pending: store only URI string
        let uri = typeof photo === "string" ? photo : photo.url;
        if (rotation !== 0) {
          try {
            uri = await processAndRotateImage(uri, rotation);
          } catch (err) {
            console.error("Rotation failed:", err);
          }
        }
        processedPhotos.push(uri);
      }
    }

    onChange(processedPhotos);
    onClose();
  } catch (err) {
    console.error("Error saving photos:", err);
    alert("Failed to save photos");
  } finally {
    setIsProcessing(false);
  }
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
          keyExtractor={(item) => item.clientId || (typeof item.photo === "string" ? item.photo : item.photo.url)}

          numColumns={2}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item, index }) => {
            const uri = typeof item.photo === "string" ? item.photo : item.photo.url;
            const rotation = item.rotation;
            
            return (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri }}
                  style={[
                    styles.image,
                    { transform: [{ rotate: `${rotation}deg` }] }
                  ]}
                  contentFit="cover"
                  cachePolicy="disk"
                />

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(item.photo)}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>×</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.rotateButton}
                  onPress={() => handleRotatePhoto(index)}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>⟳</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={async () => {handleDownloadPhoto(uri)}}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>⬇</Text>

                </TouchableOpacity>

                {rotation !== 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 5,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
                      {rotation}°
                    </Text>
                  </View>
                )}

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