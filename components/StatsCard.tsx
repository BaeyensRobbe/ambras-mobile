// components/StatsCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { styles, ambrasGreen } from "../styles";
import { Ionicons } from "@expo/vector-icons";

interface StatsCardProps {
  title: string;
  value: string;
  iconName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, iconName }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {iconName && <Ionicons name={iconName as any} size={24} color={ambrasGreen} style={{ marginRight: 10 }} />}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

export default StatsCard;
