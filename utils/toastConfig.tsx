// src/utils/toastConfig.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ToastConfig } from "react-native-toast-message";

type ProgressProps = { progress?: number };

// simple, safe toast config that returns React nodes directly
export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.container, styles.success]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View style={[styles.container, styles.error]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),

  // progress toast: shows a small horizontal progress bar + percentage
  progress: ({ text1, props }: any) => {
    const progress = Math.max(0, Math.min(1, props?.progress ?? 0));
    return (
      <View style={[styles.container, styles.progressContainer]}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>{text1}</Text>
          <Text style={styles.message}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  success: { backgroundColor: "#1b3924" },
  error: { backgroundColor: "#3a1919" },
  progressContainer: { flexDirection: "row", alignItems: "center" },
  title: { color: "#fff", fontWeight: "600", fontSize: 14 },
  message: { color: "#ddd", fontSize: 12 },
  progressBarBackground: {
    width: 48,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#21d4ff",
  },
});
