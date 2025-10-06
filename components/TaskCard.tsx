// components/TaskCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";

interface TaskCardProps {
  task: string;
  due: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, due }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.taskText}>{task}</Text>
      <Text style={styles.taskDue}>Due: {due}</Text>
    </View>
  );
};

export default TaskCard;
