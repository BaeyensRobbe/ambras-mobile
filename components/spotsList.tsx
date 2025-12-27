import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "../styles";
import { Spot } from "../types/types";

type Props = {
  isVisible: boolean;
  spots: Spot[];
  mode: "suggestions" | "approvals";
  loading?: boolean;
  onApprove?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh?: () => void;
};

const SpotsList: React.FC<Props> = ({
  spots,
  mode,
  loading,
  onApprove,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  /* ---------- derived values ---------- */

  const categories = useMemo(
    () =>
      Array.from(
        new Set(spots.map(s => s.category).filter(Boolean))
      ) as string[],
    [spots]
  );

  const cities = useMemo(
    () =>
      Array.from(
        new Set(spots.map(s => s.city).filter(Boolean))
      ) as string[],
    [spots]
  );

  const visibleSpots = useMemo(() => {
    return [...spots]
      .filter(spot => {
        if (categoryFilter !== "all" && spot.category !== categoryFilter) {
          return false;
        }
        if (cityFilter !== "all" && spot.city !== cityFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return sortAsc ? cmp : -cmp;
      });
  }, [spots, sortAsc, categoryFilter, cityFilter]);

  /* ---------- states ---------- */

  if (loading) {
    return (
      <View style={center}>
        <ActivityIndicator size="large" color="#006400" />
        <Text style={loadingText}>Loading spots...</Text>
      </View>
    );
  }

  if (!visibleSpots.length) {
    return (
      <View style={center}>
        <Text>No spots available</Text>
      </View>
    );
  }

  /* ---------- render ---------- */

  return (
    <>
      {/* CONTROLS */}
      <View style={controls}>
        {/* SORT */}
        <TouchableOpacity
          onPress={() => setSortAsc(v => !v)}
          style={sortButton}
        >
          <Text>Sort: Name {sortAsc ? "A–Z ↑" : "Z–A ↓"}</Text>
        </TouchableOpacity>

        {/* FILTERS */}
        <View style={pickerRow}>
          {/* CATEGORY */}
          <View style={pickerColumn}>
            <Text style={label}>Category</Text>
            <View style={pickerWrapper}>
              <Picker
                selectedValue={categoryFilter}
                onValueChange={setCategoryFilter}
                style={picker}
                itemStyle={pickerItem}
              >
                <Picker.Item label="All categories" value="all" />
                {categories.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>

          {/* CITY */}
          <View style={pickerColumn}>
            <Text style={label}>City</Text>
            <View style={pickerWrapper}>
              <Picker
                selectedValue={cityFilter}
                onValueChange={setCityFilter}
                style={picker}
                itemStyle={pickerItem}
              >
                <Picker.Item label="All cities" value="all" />
                {cities.map(city => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={visibleSpots}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item: spot }) => (
          <View style={styles.card}>
            {spot.photos?.length > 0 && (
              <Image
                source={{
                  uri: spot.photos
                    .slice() // avoid mutating original array
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0].url // lowest order first
                }}
                style={image}
                resizeMode="cover"
              />
            )}

            <Text style={styles.darkTitle}>{spot.name}</Text>

            <Text style={meta}>
              {spot.category ?? "Needs category"} ·{" "}
              {spot.city ?? "Unknown city"}
            </Text>

            {spot.notes && <Text style={notes}>{spot.notes}</Text>}

            <View style={row}>
              {onEdit && (
                <>
                  <TouchableOpacity
                    onPress={() => onEdit(spot.id)}
                    style={button("blue")}
                  >
                    <Text style={buttonText}>Edit</Text>
                  </TouchableOpacity>

                  {mode === "suggestions" &&
                    spot.category &&
                    spot.photos.length > 0 && (
                      <TouchableOpacity
                        onPress={() => onApprove?.(spot.id)}
                        style={button("#006400")}
                      >
                        <Text style={buttonText}>Approve</Text>
                      </TouchableOpacity>
                    )}
                </>
              )}

              <TouchableOpacity
                onPress={() => onDelete(spot.id)}
                style={button("red")}
              >
                <Text style={buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </>
  );
};

/* ---------- styles ---------- */

const center = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 20,
};

const loadingText = {
  marginTop: 10,
  color: "#006400",
  fontSize: 16,
};

const controls = {
  padding: 12,
  gap: 12,
};

const sortButton = {
  alignSelf: "flex-start" as const,
  backgroundColor: "#e0e0e0",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
};

const pickerRow = {
  flexDirection: Platform.OS === "ios" ? "row" : "column",
  gap: 12,
};

const pickerColumn = {
  flex: Platform.OS === "ios" ? 1 : undefined,
};

const pickerWrapper = {
  backgroundColor: "#f2f2f2",
  borderRadius: 8,
  overflow: "hidden" as const,
};

const picker = {
  height: Platform.OS === "ios" ? 40 : undefined,
};

const pickerItem =
  Platform.OS === "ios"
    ? {
        height: 40,
        fontSize: 14,
      }
    : undefined;

const label = {
  fontSize: 12,
  color: "#555",
  paddingHorizontal: 8,
  paddingTop: 6,
};

const row = {
  flexDirection: "row" as const,
  gap: 8,
};

const image = {
  width: "100%",
  height: 180,
  borderRadius: 8,
  marginBottom: 8,
};

const meta = {
  color: "#555",
  marginBottom: 4,
};

const notes = {
  color: "#444",
  marginBottom: 6,
};

const button = (color: string) => ({
  backgroundColor: color,
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
});

const buttonText = {
  color: "#fff",
  fontWeight: "600" as const,
};

export default SpotsList;
