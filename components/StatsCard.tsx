import React from "react";
import { View, Text } from "react-native";
import { styles, ambrasGreen } from "../styles";

interface StatsCardProps {
  title: string;
  value: string | number;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  color = ambrasGreen,
}) => {
  return (
    <View style={[styles.card, styles.card]}>
      <Text style={[styles.darkTitle, { color: ambrasGreen }]}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
};

export default StatsCard;
