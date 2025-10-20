import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Spot } from "../../types/types";
import { ambrasGreen } from "../../styles";
import { styles as globalStyles} from "../../styles";

interface SpotSearchModalProps {
  visible: boolean;
  onClose: () => void;
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

const SpotSearchModal: React.FC<SpotSearchModalProps> = ({
  visible,
  onClose,
  spots,
  onSelectSpot,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Filter spots based on search query
  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return spots;
    const query = searchQuery.toLowerCase();
    return spots.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.city?.toLowerCase().includes(query) ||
        s.category?.toLowerCase().includes(query)
    );
  }, [spots, searchQuery]);

  // Reset search when modal closes
  useEffect(() => {
    if (!visible) setSearchQuery("");
  }, [visible]);

  // Automatically focus keyboard when modal opens
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // wait a bit for modal animation
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search spots..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredSpots}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.spotRow}
              onPress={() => {
                onSelectSpot(item);
                onClose();
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Image source={{ uri: item.photos[0]?.url }}   style={{ width: 60, height: 60, borderRadius: 6 }}  />
              <View>
              <Text style={styles.spotName}>{item.name}</Text>
              <Text style={styles.spotDetails}>
                {item.city} • {item.category}
              </Text>
              </View>
              </View>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "black",
    opacity: 0.9,
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    maxWidth: "95%",
    alignSelf: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
    marginTop: 10,
  },
  input: { flex: 1, fontSize: 16, height: 40 },
  spotRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  spotName: { fontSize: 16, fontWeight: "500", color: "white" },
  spotDetails: { fontSize: 12, color: "white" },
});

export default SpotSearchModal;
