import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { styles, ambrasGreen } from "../styles";
import { deleteSpot } from "../api/spots";
import Toast from "react-native-toast-message";
import { Spot } from "../types/types";

interface DeleteSpotModalProps {
  visible: boolean;
  spot: Spot | null;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteSpotModal: React.FC<DeleteSpotModalProps> = ({
  visible,
  spot,
  onClose,
  onDeleted,
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!spot) return;
    setDeleting(true);
    console.log("Spot ID:", spot.id);
    try {
      await deleteSpot(spot.id);
      Toast.show({
        type: "success",
        text1: "Spot deleted",
        text2: `${spot.name || "Spot"} was removed successfully.`,
      });
      onDeleted();
      onClose();
    } catch (error) {
      console.error("Error deleting spot:", error);
      Toast.show({
        type: "error",
        text1: "Deletion failed",
        text2: (error as Error).message || "Unexpected error occurred",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!spot) return null;

  return (
    <Modal visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <View
          style={{
            width: "85%",
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 10,
              color: "#333",
            }}
          >
            Delete Spot
          </Text>

          {spot.photos?.[0]?.url && (
            <Image
              source={{ uri: spot.photos[0].url }}
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                marginBottom: 20,
              }}
              resizeMode="cover"
            />
          )}

          <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 25 }}>
            Are you sure you want to delete{" "}
            <Text style={{ fontWeight: "bold" }}>{spot.name}</Text>?
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#ccc",
                padding: 12,
                borderRadius: 10,
                marginRight: 8,
                alignItems: "center",
              }}
              disabled={deleting}
            >
              <Text style={{ color: "#000", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flex: 1,
                backgroundColor: "red",
                padding: 12,
                borderRadius: 10,
                marginLeft: 8,
                alignItems: "center",
              }}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteSpotModal;
