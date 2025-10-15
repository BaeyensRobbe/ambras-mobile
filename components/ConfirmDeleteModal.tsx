import React from "react";
import { Modal, View, Text, TouchableOpacity, Image } from "react-native";
import { VaultItem } from "../types/vaultTypes";
import { styles } from "../styles";

interface ConfirmDeleteModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  item: VaultItem;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  item,
}) => {
  return (
<Modal visible={visible} animationType="slide">
  {item ? (
    <View style={styles.modalContainer}>
      <View style={{ maxHeight: 100, flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../assets/delete-button.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>
        Are you sure you want to delete the following {item.type}?
      </Text>

      <View>
        <Text style={styles.subtitle}>Title: {item.title}</Text>

        {item.type === "password" && (
          <>
            <Text style={styles.subtitle}>Username: {item.username}</Text>
            <Text style={styles.subtitle}>
              Password: {item.password ? "••••••••" : ""}
            </Text>
          </>
        )}

        {item.type === "note" && (
          <Text style={styles.subtitle}>Content: {item.content}</Text>
        )}

        {item.type === "link" && (
          <Text style={styles.subtitle}>URL: {item.url}</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ ...styles.cancelButton, backgroundColor: "red" }}
          onPress={onConfirm}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null}
</Modal>

  );
};



export default ConfirmDeleteModal;
