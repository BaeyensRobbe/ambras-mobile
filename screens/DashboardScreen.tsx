import React from "react";
import { ScrollView, Text, View } from "react-native";
import StatsCard from "../components/StatsCard";
import TaskCard from "../components/TaskCard";
import { styles, ambrasGreen } from "../styles";
import Header from "../components/Header";
import { fetchNextEvent, fetchUpcomingTasks } from "../api/events";
import { Event, Task } from "../types/types";
import { fetchR2StorageUsage, getPendingSpots, getTotalSpots } from "../utils/spotHelperFunctions";

const DashboardScreen: React.FC = () => {
  const [nextEvent, setNextEvent] = React.useState<Event | null>(null);
  const [upcomingTasks, setUpcomingTasks] = React.useState<Task[]>([]);
  const [stats, setStats] = React.useState({
    totalApprovedSpots: 0,
    pendingSpots: 0,
    r2Storage: 0,
  });

  React.useEffect(() => {
    getNextEvent();
    getUpcomingTasks();
    getStats();
  }, []);

  const getStats = async () => {

    const totalSpots = await getTotalSpots();
    const pendingSpots = await getPendingSpots();
    const r2Storage = await fetchR2StorageUsage();
    // get total spots
    setStats({
      totalApprovedSpots: totalSpots,
      pendingSpots,
      r2Storage,
    });
  }

  const getNextEvent = async () => {
    const event = await fetchNextEvent();
    setNextEvent(event);
  };

  const getUpcomingTasks = async () => {
    const tasks = await fetchUpcomingTasks();
    setUpcomingTasks(tasks.slice(0, 3));
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View>
          <Text style={styles.title}>Next event:</Text>
          <View style={styles.card}>
            <Text style={{ fontWeight: "bold" }}>{nextEvent?.title}</Text>
            <Text>{nextEvent?.description}</Text>
            <Text>{nextEvent?.start_time ? new Date(nextEvent.start_time).toLocaleString() : ""}</Text>
            <Text>{nextEvent?.end_time ? new Date(nextEvent.end_time).toLocaleString() : ""}</Text>
            <Text>{nextEvent?.location}</Text>
          </View>
            <Text style={styles.subtitle}>Upcoming Tasks</Text>
            {upcomingTasks.length === 0 && (
            <Text style={{ marginBottom: 20, color: "#555" }}>No upcoming tasks</Text>
            )}
            {upcomingTasks.map((task) => (
            <TaskCard key={task.id} task={task.title} due={task.due_date} />
            ))}
        </View>
        <View>
          <Text style={styles.title}>Statistics:</Text>
          <StatsCard title="Total Spots" value={stats.totalApprovedSpots} color={ambrasGreen} />
          <StatsCard title="Pending Spots" value={stats.pendingSpots} color="#FF9800" />
          <StatsCard title="R2 storage" value={`${stats.r2Storage} / 10 GB`} color="#2196F3" />
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
