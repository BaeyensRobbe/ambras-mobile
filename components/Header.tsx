import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "./AppHeader";

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

const Header: React.FC<Props> = ({ title, leftButton, rightButtons, style }) => {
  return (
    <View
      style={{
        padding: 10,
        paddingTop: 40,
        backgroundColor: "#1F3B28",
        ...style,
      }}
    >
      
      <View style={{alignItems: "flex-start" }}>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", textAlign: "left" }}>
          {title || ""}
        </Text>
      </View>
    </View>
  );
};

export default Header;
