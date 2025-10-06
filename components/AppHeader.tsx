import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HeaderButton = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type Props = {
  title?: string;
  leftButton?: HeaderButton;
  rightButtons?: HeaderButton[];
  style?: object;
};

const AppHeader: React.FC<Props> = ({ title, leftButton, rightButtons, style }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        paddingTop: 40,
        backgroundColor: "#1F3B28",
        ...style,
      }}
    >
      {leftButton ? (
        <TouchableOpacity onPress={leftButton.onPress}>
          <Ionicons name={leftButton.icon} size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} /> // placeholder spacing
      )}

      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          {title || ""}
        </Text>
      </View>

      <View style={{ flexDirection: "row" }}>
        {rightButtons?.map((btn, idx) => (
          <TouchableOpacity key={idx} onPress={btn.onPress} style={{ marginLeft: 10 }}>
            <Ionicons name={btn.icon} size={24} color="white" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AppHeader;
