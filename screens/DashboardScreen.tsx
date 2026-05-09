import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles, ambrasGreen } from "../styles";
import Header from "../components/Header";
import {
  fetchR2StorageUsage,
  getPendingSpots,
  getTotalSpots,
} from "../utils/spotHelperFunctions";

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalApprovedSpots: 0,
    pendingSpots: 0,
    r2Storage: 0,
  });

  const navigation = useNavigation();

  React.useEffect(() => {
    getStats();
  }, []);

  const getStats = async () => {
    const totalSpots = await getTotalSpots();
    const pendingSpots = await getPendingSpots();
    const r2Storage = await fetchR2StorageUsage();
    setStats({ totalApprovedSpots: totalSpots, pendingSpots, r2Storage });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8f5" }}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.title}>{stats.totalApprovedSpots}</Text>
            <Text style={styles.statLabel}>Total Spots</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.title}>{stats.pendingSpots}</Text>
            <Text style={styles.statLabel}>Pending Spots</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.title}>{`${stats.r2Storage} / 10`}</Text>
            <Text style={styles.statLabel}>R2 Storage</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            (navigation as any).navigate("Spots", { addSpotModal: true });
          }}
        >
          <View
            style={{
              backgroundColor: ambrasGreen,
              borderRadius: 16,
              marginHorizontal: 20,
              marginVertical: 20,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", textAlign: "center", padding: 10 }}>
              Add new spot
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
