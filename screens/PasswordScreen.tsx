import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { styles } from "../styles";
import AppHeader from "../components/AppHeader"; // ← import your custom header
import { VERCEL_URL } from "@env";

const PasswordScreen = () => {
  const [passwords, setPasswords] = useState<{ name: string; username: string; password: string }[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const response = await fetch(`http://${VERCEL_URL}:4000/passwords`);
        const data = await response.json();
        console.log("Fetch response:", data);
        setPasswords(data);
      } catch (error) {
        console.error("Error fetching passwords:", error);
      }
    };
    fetchPasswords();
  }, []);

  const handleCopy = (platform: string) => {
    Alert.alert(`${platform} password copied!`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Use your custom AppHeader */}
      <AppHeader title="Passwords" style={{ justifyContent: "flex-start" }} />

      <View style={styles.screen}>
        {passwords.map((item, index) => (
          <View style={styles.card} key={index}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleCopy(item.name)}>
                <Text style={{ color: "#007AFF", marginLeft: 10 }}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text>{item.username}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>{showPassword ? item.password : "••••••••"}</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ marginLeft: 10 }}
              >
                <Text style={{ color: "#007AFF" }}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PasswordScreen;
