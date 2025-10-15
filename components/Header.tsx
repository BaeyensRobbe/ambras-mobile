import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HeaderButton = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type Props = {
  title?: string;
  rightButton?: HeaderButton;
  style?: object;
};

const Header: React.FC<Props> = ({ title, rightButton, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <Text style={styles.title}>{title || ""}</Text>

      {/* Optional right button */}
      {rightButton && (
        <TouchableOpacity onPress={rightButton.onPress} style={styles.rightButton}>
          <Ionicons name={rightButton.icon} size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 15,
    backgroundColor: "#1F3B28",
    height: 80,
  },
  title: {
    flex: 1,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
  },
  rightButton: {
    marginLeft: 10,
  },
});

export default Header;
