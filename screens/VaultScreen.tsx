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
import { fetchVaultItems, addVaultItem, decryptVaultPassword, deleteVaultItem, updateVaultItem, fetchSignedUrl } from "../utils/vaultHelperFunctions";
import AddVaultItemModal from "../components/addVaultItemModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditNoteModal from "../components/EditNoteModal";

type Folder = { id: string; name: string; type: VaultItem["type"]; items: VaultItem[] };

const initialFolders: Folder[] = [
  { id: "1", name: "Notes", type: "note", items: [] },
  { id: "2", name: "Links", type: "link", items: [] },
  { id: "3", name: "Passwords", type: "password", items: [] },
  { id: "4", name: "Images", type: "image", items: [] },
];

const VaultScreen = () => {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [currentFolderId, setCurrentFolderId] = useState(initialFolders[0].id);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

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

const handleFetchImages = async (items: VaultItem[]) => {
  const updatedFolders = await Promise.all(
    initialFolders.map(async (folder) => {
      if (folder.type !== "image") {
        return { ...folder, items: items.filter(i => i.type === folder.type) };
      }

      const updatedItems = await Promise.all(
        items
          .filter(i => i.type === "image")
          .map(async (item) => {
            if (item.image_url) {
              const fileName = item.image_url.split("/").pop(); // Extract file name
              const signedUrl = await fetchSignedUrl(fileName!);
              return signedUrl ? { ...item, image_url: signedUrl } : item;
            }
            return item;
          })
      );

      return { ...folder, items: updatedItems };
    })
  );

  return updatedFolders;
};


useEffect(() => {
  const fetchItemsAndImages = async () => {
    try {
      setLoading(true);
      const items = await fetchVaultItems();
      const foldersWithImages = await handleFetchImages(items);
      console.log("Folders with images", foldersWithImages[3].items);
      setFolders(foldersWithImages);
    } catch (err) {
      console.error(err);
      Alert.alert("Error loading vault items");
    } finally {
      setLoading(false);
    }
  };

  fetchItemsAndImages();
}, []);


  const currentFolder = folders.find(f => f.id === currentFolderId) || folders[0];

  const handleAddItem = async (item: Omit<VaultItem, "id">) => {
    const newItem = await addVaultItem(item);
    if (!newItem) return Alert.alert("Error adding vault item");
    setFolders(prev => prev.map(f => f.id === currentFolderId ? { ...f, items: [...f.items, newItem] } : f));
    setModalVisible(false);
  };

  const handleAddNewNote = () => {
  const newNote: VaultItem = {
    id: null,          // no ID yet
    type: "note",
    title: "",
    content: "",
  };
  setSelectedItem(newNote);
  setEditNoteModalVisible(true);
};

  const handlePressItem = async (item: VaultItem) => {
    console.log("Pressed item", item);
    if (item.type === "password") {
      const decrypted = await decryptVaultPassword(item.id);
      console.log("decrypted", decrypted);
      if (decrypted) {
        handleCopy(decrypted, "Password");
      }
    }
    if (item.type === "link" && item.url) {
      handleCopy(item.url, "Link");
    }
    if (item.type === "note" && item.content) {
      console.log("Editing note", item);
      setSelectedItem(item);
      setEditNoteModalVisible(true);
    }
    if (item.type === "image" && item.image_url) {
      // Optionally implement image viewing
    }
  }

  const handleCopy = (text: string | null, label: string) => {
    if (!text) return;
    Clipboard.setString(text);
  };

  const handleShowDeleteConfirmation = (item: VaultItem) => {
    setConfirmDeleteModal(true);
    setSelectedItem(item);
  }

  const handleEditNote = async (updatedNote: VaultItem) => {
  if (!updatedNote.title.trim()) return Alert.alert("Title is required");

  try {
    if (updatedNote.id) {
      // Existing note → update
      await updateVaultItem(updatedNote.id, { title: updatedNote.title, content: updatedNote.content });
    } else {
      // New note → add
      const newItem = await addVaultItem({ type: "note", title: updatedNote.title, content: updatedNote.content });
      // Replace temporary note in folder with real one from backend
      setFolders(prev =>
        prev.map(f =>
          f.type === "note"
            ? { ...f, items: [...f.items, newItem] }
            : f
        )
      );
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Error saving note");
  }

  setEditNoteModalVisible(false);
  setSelectedItem(null);
  loadItems();
};

  const handleDelete = async (item: VaultItem) => {
    try {
      await deleteVaultItem(item.id.toString());
    } catch (err) {
      console.error(err);
      Alert.alert("Error deleting item");
      return;
    }
    // implement later
    setSelectedItem(null);
    loadItems();
    setConfirmDeleteModal(false);

  }

  const renderItem = ({ item }: { item: VaultItem }) => (
    <TouchableOpacity onPress={() => {handlePressItem(item)}} key={item.id} activeOpacity={0.8}>
    <View style={vaultStyles.card}>
      <View style={vaultStyles.cardHeader}>
        <Text style={vaultStyles.title}>{item.title}</Text>
        <View style={{ flexDirection: "column", gap: 15 }}>
        <TouchableOpacity onPress={() => handleShowDeleteConfirmation(item)}>
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
        </View>
      </View>

      {item.type === "password" && <>
        <Text style={vaultStyles.title}>{item.username}</Text>
        <Text style={vaultStyles.password}>{item.password ? "••••••••" : ""}</Text>
      </>}

      {item.type === "note" && <Text style={vaultStyles.note} numberOfLines={4}>{item.content}</Text>}
      {item.type === "link" && <Text style={[vaultStyles.note, { color: ambrasGreen }]}>{item.url}</Text>}
      {item.type === "image" && item.image_url && (
        <Image source={{ uri: item.image_url }} style={vaultStyles.image} />
      )}
    </View>
    </TouchableOpacity>
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

      <TouchableOpacity
  style={vaultStyles.addButton}
  onPress={() => {
    if (currentFolder.type === "note") {
      handleAddNewNote();
    } else {
      setModalVisible(true);
    }
  }}
>
  <Text style={{ color: "white", fontWeight: "600" }}>Add New Item</Text>
</TouchableOpacity>


      <AddVaultItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddItem}
        defaultType={currentFolder.type}
      />
      <ConfirmDeleteModal
        visible={confirmDeleteModal}
        onCancel={() => setConfirmDeleteModal(false)}
        onConfirm={() => {
          handleDelete(selectedItem!);
        }}
        item={selectedItem!}
      />
     {selectedItem?.type === "note" && (
  <EditNoteModal
    visible={editNoteModalVisible}
    onClose={() => setEditNoteModalVisible(false)}
    onSave={handleEditNote}
    note={selectedItem}
  />
)}


    </View>
  );
};

const vaultStyles = StyleSheet.create({
  folderTabs: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  folderText: { fontWeight: "600", fontSize: 16 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 15, marginVertical: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 0},
  title: { fontWeight: "bold", fontSize: 16 },
  subtitle: { color: "#666", fontSize: 14, marginBottom: 5 },
  password: { fontSize: 16, color: "#333", marginBottom: 5 },
  note: { fontSize: 14, color: "#333" },
  image: { width: "100%", height: 150, borderRadius: 10, marginTop: 10 },
  addButton: { backgroundColor: ambrasGreen, borderRadius: 16, margin: 20, padding: 15, alignItems: "center" },
});

export default VaultScreen;
