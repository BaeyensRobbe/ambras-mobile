// TextInputModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { ambrasGreen, styles } from "../styles";

interface TextInputModalProps {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
  title?: string;
  placeholder?: string;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  visible,
  value,
  onClose,
  onSave,
  title = "Edit Value",
  placeholder = "Enter value",
}) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value); // reset when modal opens
  }, [value, visible]);

  const handleSave = () => {
    onSave(text);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={[styles.input, { width: "100%" }]}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            autoFocus
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "gray" }]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: ambrasGreen }]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
