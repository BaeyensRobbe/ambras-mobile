import React, { useState, useEffect } from "react";
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity, FlatList } from "react-native";

interface PickerInputModalProps<T> {
  visible: boolean;
  options: { label: string; value: T }[];
  selectedValue?: T | null;
  title?: string;
  onClose: () => void;
  onSelect: (value: T) => void;
}

export const PickerInputModal = <T,>({
  visible,
  options,
  selectedValue,
  title = "Select an option",
  onClose,
  onSelect,
}: PickerInputModalProps<T>) => {

  const handleSelect = (value: T) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelect(item.value)}
              >
                <Text style={[
                  styles.optionText,
                  item.value === selectedValue && styles.selectedOption
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#006400",
  },
  optionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOption: {
    color: "#006400",
    fontWeight: "700",
  },
});
