import React, { useState, useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { styles, ambrasGreen } from "../styles";
import { VaultItem } from "../types/vaultTypes";
import { Ionicons } from "@expo/vector-icons";

interface EditNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedNote: VaultItem) => void;
  note: VaultItem;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({ visible, onClose, onSave, note }) => {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");

  useEffect(() => {
    if (visible) {
      setTitle(note.title || "");
      setContent(note.content || "");
    }
  }, [visible, note]);

  const handleSave = () => {
    if (!title.trim()) return alert("Title cannot be empty");
    onSave({ ...note, title, content });
    onClose();
  };

const handleArrowBack = () => {
  if (title !== note.title || content !== note.content) {
    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. Discard them?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => onClose() },
      ],
      { cancelable: true }
    );
  } else {
    onClose();
  }
};
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
  <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View style={noteStyles.header}>
        <TouchableOpacity onPress={handleArrowBack} style={noteStyles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={ambrasGreen} />
        </TouchableOpacity>
        <TextInput
          style={noteStyles.headerTitle}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={handleSave} style={noteStyles.iconButton}>
          <Ionicons name="checkmark" size={28} color={ambrasGreen} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          justifyContent: "space-between", // pushes input up
          paddingBottom: 40, // gives 2 lines of space above keyboard
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1 }}>
          <TextInput
            style={noteStyles.contentInput}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholder="Start writing your note..."
            placeholderTextColor="#aaa"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
</Modal>


  );
};

const noteStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconButton: {
    padding: 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: ambrasGreen,
  },
  contentInput: {
  fontSize: 16,
  color: "#000",
  minHeight: 300, // ensures scroll even with short text
},
});

export default EditNoteModal;
