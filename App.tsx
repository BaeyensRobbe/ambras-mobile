// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "./screens/DashboardScreen";
import CalendarScreen from "./screens/CalendarScreen";
import PasswordScreen from "./screens/PasswordScreen";
import SpotScreen from "./screens/SpotScreen";
import Toast from "react-native-toast-message";
import { toastConfig } from "./utils/toastConfig";

const ambrasGreen = "#1F3B28";
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false, // ← hide the default top header
          tabBarActiveTintColor: ambrasGreen,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { height: 60, paddingBottom: 5 },
          tabBarIcon: ({ color, size }) => {
            let iconName: string = "home";
            if (route.name === "Dashboard") iconName = "stats-chart";
            else if (route.name === "Passwords") iconName = "key";
            else if (route.name === "Agenda") iconName = "calendar";
            else if (route.name === "Spots") iconName = "pin";
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Passwords" component={PasswordScreen} />
        <Tab.Screen name="Agenda" component={CalendarScreen} />
        <Tab.Screen name="Spots" component={SpotScreen} />
      </Tab.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
