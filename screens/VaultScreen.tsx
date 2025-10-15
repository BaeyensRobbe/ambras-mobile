import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  Clipboard,
} from "react-native";
import { ambrasGreen } from "../styles";
import Header from "../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { VaultItem } from "../types/vaultTypes";
import { fetchVaultItems, addVaultItem, decryptVaultPassword } from "../utils/vaultHelperFunctions";
import AddVaultItemModal from "../components/addVaultItemModal";

type Folder = { id: string; name: string; type: VaultItem["type"]; items: VaultItem[] };

const initialFolders: Folder[] = [
  { id: "1", name: "Passwords", type: "password", items: [] },
  { id: "2", name: "Notes", type: "note", items: [] },
  { id: "3", name: "Links", type: "link", items: [] },
  { id: "4", name: "Images", type: "image", items: [] },
];

const VaultScreen = () => {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [currentFolderId, setCurrentFolderId] = useState(initialFolders[0].id);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const items = await fetchVaultItems();
      setFolders(initialFolders.map(f => ({ ...f, items: items.filter(i => i.type === f.type) })));
    } catch (err) {
      console.error(err);
      Alert.alert("Error fetching vault items");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadItems(); }, []);

  const currentFolder = folders.find(f => f.id === currentFolderId) || folders[0];

  const handleAddItem = async (item: Omit<VaultItem, "id">) => {
    const newItem = await addVaultItem(item);
    if (!newItem) return Alert.alert("Error adding vault item");
    setFolders(prev => prev.map(f => f.id === currentFolderId ? { ...f, items: [...f.items, newItem] } : f));
    setModalVisible(false);
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert(`${label} copied!`);
  };

  const handleShowPassword = async (item: VaultItem) => {
    if (!item.id) return;
    const decrypted = await decryptVaultPassword(item.id);
    if (decrypted) Alert.alert("Password", decrypted);
    else Alert.alert("Failed to decrypt password");
  };

  const renderItem = ({ item }: { item: VaultItem }) => (
    <View style={vaultStyles.card}>
      <View style={vaultStyles.cardHeader}>
        <Text style={vaultStyles.title}>{item.title}</Text>
        {item.type === "password" && (
          <TouchableOpacity onPress={() => handleShowPassword(item)}>
            <Ionicons name="eye-outline" size={20} color={ambrasGreen} />
          </TouchableOpacity>
        )}
        {item.type === "link" && (
          <TouchableOpacity onPress={() => handleCopy(item.url || "", "Link")}>
            <Ionicons name="link-outline" size={20} color={ambrasGreen} />
          </TouchableOpacity>
        )}
      </View>

      {item.type === "password" && <>
        <Text style={vaultStyles.subtitle}>{item.username}</Text>
        <Text style={vaultStyles.password}>{item.password ? "••••••••" : ""}</Text>
      </>}

      {item.type === "note" && <Text style={vaultStyles.note}>{item.content}</Text>}
      {item.type === "link" && <Text style={[vaultStyles.note, { color: ambrasGreen }]}>{item.url}</Text>}
      {item.type === "image" && item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={vaultStyles.image} />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Header title="Vault" />

      <View style={vaultStyles.folderTabs}>
        {folders.map(folder => (
          <TouchableOpacity key={folder.id} onPress={() => setCurrentFolderId(folder.id)}>
            <Text style={[vaultStyles.folderText, { color: folder.id === currentFolderId ? ambrasGreen : "#555" }]}>{folder.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={currentFolder.items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={loadItems}
      />

      <TouchableOpacity style={vaultStyles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={{ color: "white", fontWeight: "600" }}>Add New Item</Text>
      </TouchableOpacity>

      <AddVaultItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddItem}
        defaultType={currentFolder.type}
      />
    </View>
  );
};

const vaultStyles = StyleSheet.create({
  folderTabs: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  folderText: { fontWeight: "600", fontSize: 16 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 15, marginVertical: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  title: { fontWeight: "bold", fontSize: 16 },
  subtitle: { color: "#666", fontSize: 14, marginBottom: 5 },
  password: { fontSize: 16, color: "#333", marginBottom: 5 },
  note: { fontSize: 14, color: "#333" },
  image: { width: "100%", height: 150, borderRadius: 10, marginTop: 10 },
  addButton: { backgroundColor: ambrasGreen, borderRadius: 16, margin: 20, padding: 15, alignItems: "center" },
});

export default VaultScreen;
