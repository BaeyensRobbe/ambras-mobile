import React from "react";
import { ScrollView, Text } from "react-native";
import StatsCard from "../components/StatsCard";
import TaskCard from "../components/TaskCard";
import { styles, ambrasGreen } from "../styles";

const DashboardScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Social Stats */}
      <StatsCard title="Instagram Followers" value="1.2k" iconName="logo-instagram" />
      <StatsCard title="YouTube Subscribers" value="3.5k" iconName="logo-youtube" />
      <StatsCard title="Podcast Listeners" value="850" iconName="mic" />

      <Text style={styles.subtitle}>Upcoming Tasks</Text>

      {/* Tasks */}
      <TaskCard task="Edit new video" due="2025-10-05" />
      <TaskCard task="Update social posts" due="2025-10-03" />
      <TaskCard task="Approve spotmap" due="2025-10-07" />
    </ScrollView>
  );
};

export default DashboardScreen;
