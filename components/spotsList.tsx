// SpotsList.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { styles } from "../styles";
import { Spot } from "../types/types";

type Props = {
  isVisible: boolean;
  spots: Spot[];
  mode: 'suggestions' | 'approvals';
  loading?: boolean;
  onApprove?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh?: () => void;
};

const SpotsList: React.FC<Props> = ({ spots, mode, loading, onApprove, onEdit, onDelete, onRefresh }) => {

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
        <ActivityIndicator size="large" color="#006400" />
        <Text style={{ marginTop: 10, color: "#006400", fontSize: 16 }}>Loading spots...</Text>
      </View>
    );
  }

  if (!spots.length && !loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
        <Text style={{ fontSize: 16, color: "#333" }}>No spots available</Text>
      </View>
    );
  }


  return (
    <FlatList
      data={spots}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 0 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      renderItem={({ item: spot }) => (
        <View key={spot.id} style={styles.card}>
          {spot.photos && spot.photos.length > 0 && (
            <Image
              source={{ uri: spot.photos[0].url }}
              style={{ width: "100%", height: 180, borderRadius: 8, marginBottom: 8 }}
              resizeMode="cover"
            />
          )}

          <Text style={styles.darkTitle}>{spot.name}</Text>
            <Text
            style={{
              color: spot.category ? "#555" : "red",
              marginBottom: 4,
            }}
            >
            {spot.category ?? "Needs category"}
            </Text>
          {spot.notes && <Text style={{ color: "#444", marginBottom: 6 }}>{spot.notes}</Text>}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            {onEdit && (
              <>
              <TouchableOpacity
                onPress={() => onEdit(spot.id)}
                style={{
                backgroundColor: "blue",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 6,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Edit</Text>
              </TouchableOpacity>
              {mode === 'suggestions' && spot.category !== null && spot.photos.length > 0 && (
                <TouchableOpacity
                onPress={() => onApprove(spot.id)}
                style={{
                  backgroundColor: "#006400",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                }}
                >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Approve</Text>
                </TouchableOpacity>
              )}
              </>
            )}
            <TouchableOpacity
              onPress={() => onDelete(spot.id)}
              style={{
              backgroundColor: "red",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
              marginLeft: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
            </TouchableOpacity>
            </View>
        </View>
      )}
    />
  );
};

export default SpotsList;
