import React from "react";
import { ScrollView, Text, Touchable, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // for icons
import { useNavigation } from "@react-navigation/native";
import TaskCard from "../components/TaskCard";
import { styles, ambrasGreen } from "../styles";
import Header from "../components/Header";
import {
  fetchNextEvent,
  fetchUpcomingTasks,
} from "../api/events";
import {
  fetchR2StorageUsage,
  getPendingSpots,
  getTotalSpots,
} from "../utils/spotHelperFunctions";
import { Event, Task } from "../types/types";

const DashboardScreen: React.FC = () => {
  const [nextEvent, setNextEvent] = React.useState<Event | null>(null);
  const [upcomingTasks, setUpcomingTasks] = React.useState<Task[]>([]);
  const [stats, setStats] = React.useState({
    totalApprovedSpots: 0,
    pendingSpots: 0,
    r2Storage: 0,
  });

  const navigation = useNavigation();

  React.useEffect(() => {
    getNextEvent();
    getUpcomingTasks();
    getStats();
  }, []);

  const getStats = async () => {
    const totalSpots = await getTotalSpots();
    const pendingSpots = await getPendingSpots();
    const r2Storage = await fetchR2StorageUsage();
    setStats({ totalApprovedSpots: totalSpots, pendingSpots, r2Storage });
  };

  const getNextEvent = async () => {
    const event = await fetchNextEvent();
    setNextEvent(event);
  };

  const getUpcomingTasks = async () => {
    const tasks = await fetchUpcomingTasks();
    setUpcomingTasks(tasks.slice(0, 3));
  };

  const formatEventTime = (start: string, end: string) => {
    if (!start || !end) return "";

    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    const isToday = startDate.toDateString() === now.toDateString();
    const isTomorrow =
      new Date(now.setDate(now.getDate() + 1)).toDateString() ===
      startDate.toDateString();

    const dayLabel = isToday
      ? "Today"
      : isTomorrow
      ? "Tomorrow"
      : startDate.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "short",
        });

const startTime = startDate.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const endTime = endDate.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});


    return `${dayLabel} • ${startTime} – ${endTime}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8f5" }}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={{ marginBottom: 0 }}>
          <Text style={styles.title}>Next Event</Text>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginTop: 10,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              borderLeftWidth: 4,
              borderLeftColor: ambrasGreen,
            }}
          >
            {nextEvent ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={ambrasGreen}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#222",
                    }}
                  >
                    {nextEvent.title}
                  </Text>
                </View>
                {nextEvent.description && (
                <Text
                  style={{
                    marginTop: 0,
                    fontSize: 14,
                    color: "#444",
                  }}
                >
                  {nextEvent.description}
                </Text>
                )}

                <Text
                  style={{
                    marginTop: 10,
                    color: ambrasGreen,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {formatEventTime(
                    nextEvent.start_time,
                    nextEvent.end_time
                  )}
                </Text>

                {nextEvent.location && (
                  <Text
                    style={{
                      marginTop: 6,
                      color: "#777",
                      fontSize: 13,
                    }}
                  >
                    📍 {nextEvent.location}
                  </Text>
                )}
              </>
            ) : (
              <Text style={{ color: "#777" }}>No upcoming events</Text>
            )}
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.subtitle}>Upcoming Tasks</Text>
          {upcomingTasks.length === 0 && (
            <Text style={{ marginBottom: 0, color: "#555" }}>
              No upcoming tasks
            </Text>
          )}
          {upcomingTasks.map((task) => (
            <TaskCard key={task.id} task={task.title} due={task.due_date} />
          ))}
        </View>

       <View style={styles.statsContainer}>
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{stats.totalApprovedSpots}</Text>
    <Text style={styles.statLabel}>Total Spots</Text>
  </View>

  <View style={styles.statCard}>
    <Text style={styles.statValue}>{stats.pendingSpots}</Text>
    <Text style={styles.statLabel}>Pending Spots</Text>
  </View>

  <View style={styles.statCard}>
    <Text style={styles.statValue}>{`${stats.r2Storage} / 10`}</Text>
    <Text style={styles.statLabel}>R2 Storage</Text>
  </View>
</View>

<View>
  <TouchableOpacity
  onPress={() => {
    navigation.navigate("Spots", {addSpotModal: true});
  }}
  > 
    <View 
      style={{
        backgroundColor: ambrasGreen, 
        borderRadius: 16,
        marginHorizontal: 20,
        marginVertical: 20,
      }}>
      <Text style={{ color: "white", fontWeight: "600", textAlign: "center", padding: 10 }}>
        Add new spot
      </Text>
    </View>
  </TouchableOpacity>
</View>



      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
