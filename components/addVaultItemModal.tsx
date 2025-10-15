import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ambrasGreen } from "../styles";
import { VaultItem } from "../types/vaultTypes";
import { PickerInputModal } from "./PickerInputModal";
import { VERCEL_URL } from "@env";
import { styles } from "../styles";

const apiUrl = VERCEL_URL.startsWith("http") ? VERCEL_URL : `https://${VERCEL_URL}`;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<VaultItem, "id">) => void;
  defaultType?: VaultItem["type"];
};

const AddVaultItemModal: React.FC<Props> = ({ visible, onClose, onSubmit, defaultType }) => {
  const [type, setType] = useState<VaultItem["type"]>(defaultType || "note");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const typeOptions = [
    { label: "Password", value: "password" },
    { label: "Note", value: "note" },
    { label: "Link", value: "link" },
    { label: "Image", value: "image" },
  ] as const;

  const clearFields = () => {
    setTitle("");
    setUsername("");
    setPassword("");
    setContent("");
    setUrl("");
    setImageUri("");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission denied");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // Upload image to backend, return image_url
  const uploadImage = async (uri: string): Promise<string | null> => {
    const fileName = uri.split("/").pop() || "image.jpg";
    const fileType = `image/${fileName.split(".").pop()}`;

    const formData = new FormData();
    formData.append("image", { uri, name: fileName, type: fileType } as any);

    try {
      const res = await fetch(`${apiUrl}/vault/upload`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.image_url; // must match backend
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title) return Alert.alert("Title is required");

    let imageDbUrl = "";
    if (type === "image") {
      if (!imageUri) return Alert.alert("Select an image");
      setUploading(true);
      const uploadedUrl = await uploadImage(imageUri);
      setUploading(false);
      if (!uploadedUrl) return;
      imageDbUrl = uploadedUrl;
    }

    const item: Omit<VaultItem, "id"> = { type, title };
    if (type === "password") { item.username = username; item.password = password; }
    if (type === "note") item.content = content;
    if (type === "link") item.url = url;
    if (type === "image") item.imageUri = imageDbUrl;

    onSubmit(item);
    clearFields();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.heading}>Add Vault Item</Text>
          <ScrollView>
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              style={styles.pickerButton}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerText}>
                {type ? ` ${type}` : "Select type..."}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            {type === "password" && <>
              <Text style={styles.label}>Username</Text>
              <TextInput style={styles.input} value={username} onChangeText={setUsername} />
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            </>}

            {type === "note" && <>
              <Text style={styles.label}>Content</Text>
              <TextInput style={[styles.input, { height: 100 }]} value={content} onChangeText={setContent} multiline />
            </>}

            {type === "link" && <>
              <Text style={styles.label}>URL</Text>
              <TextInput style={styles.input} value={url} onChangeText={setUrl} />
            </>}

            {type === "image" && <>
              <Text style={styles.label}>Select Image</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: ambrasGreen }]} onPress={pickImage}>
                <Text style={{ color: "white", fontWeight: "600" }}>{uploading ? "Uploading..." : "Pick from files"}</Text>
              </TouchableOpacity>
              {imageUri && <Image source={{ uri: imageUri }} style={{ width: "100%", height: 150, marginTop: 10, borderRadius: 8 }} />}
            </>}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: ambrasGreen }]} onPress={handleSubmit} disabled={uploading}>
              <Text style={{ color: "white", fontWeight: "600" }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#ccc" }]} onPress={onClose}>
              <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <PickerInputModal
            visible={pickerVisible}
            title="Select Type"
            options={typeOptions}
            selectedValue={type}
            onClose={() => setPickerVisible(false)}
            onSelect={setType}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddVaultItemModal;
