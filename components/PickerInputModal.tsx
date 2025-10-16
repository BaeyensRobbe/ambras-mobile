import React, { useState, useEffect } from "react";
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { styles } from "../styles";

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
        <View style={styles.pickerContainer}>
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
                  styles.label,
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
