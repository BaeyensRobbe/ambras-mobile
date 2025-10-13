import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ambrasGreen } from "../styles";

interface NotesInputModalProps {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
  title?: string;
}

const NotesInputModal: React.FC<NotesInputModalProps> = ({
  visible,
  value,
  onClose,
  onSave,
  title = "Edit Notes",
}) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    if (visible) setText(value);
  }, [visible, value]);

  const handleSave = () => {
    onSave(text.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            width: "100%",
            maxHeight: "85%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: ambrasGreen,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {title}
          </Text>

          <ScrollView
            style={{ flexGrow: 0, maxHeight: 400 }}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={{
                minHeight: 200,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                textAlignVertical: "top",
                lineHeight: 22,
              }}
              multiline
              placeholder="Write your notes here..."
              value={text}
              onChangeText={setText}
            />
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: "#ccc",
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ color: "#000", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: ambrasGreen,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NotesInputModal;
