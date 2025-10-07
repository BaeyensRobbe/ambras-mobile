// src/utils/notify.ts
import Toast from "react-native-toast-message";

export const notify = {
  success: (title: string, message?: string) =>
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3000,
    }),

  error: (title: string, message?: string) =>
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 5000,
    }),

  loading: (title: string, progress: number) =>
    Toast.show({
      type: "progress",
      text1: title,
      props: { progress },
      autoHide: false,
      position: "top",
    }),

  hide: () => Toast.hide(),
};
