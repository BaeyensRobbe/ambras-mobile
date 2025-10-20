import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ambrasGreen } from "../styles";

interface MultiSelectModalProps {
  visible: boolean;
  options: string[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  onClose: () => void;
  title?: string;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  visible,
  options,
  selected,
  onSelect,
  onClose,
  title = "Select Options",
}) => {
  const [tempSelected, setTempSelected] = useState<string[]>(selected);

  useEffect(() => {
    if (visible) setTempSelected(selected);
  }, [visible]);

  const toggleOption = (option: string) => {
    setTempSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>

          <ScrollView style={{ maxHeight: 300 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.optionRow}
                onPress={() => toggleOption(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
                <Ionicons
                  name={
                    tempSelected.includes(opt)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={22}
                  color={
                    tempSelected.includes(opt) ? ambrasGreen : "#ccc"
                  }
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonsRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSelect(tempSelected);
                onClose();
              }}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 16 },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ambrasGreen,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: ambrasGreen,
  },
  cancelText: { textAlign: "center", color: ambrasGreen, fontWeight: "500" },
  confirmText: { textAlign: "center", color: "white", fontWeight: "500" },
});

export default MultiSelectModal;
