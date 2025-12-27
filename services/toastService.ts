import Toast from "react-native-toast-message";

type Step = {
  text: string;
  action?: () => Promise<void>;
};

export const runWithProgress = async (steps: Step[], toastId = "progress") => {
  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      Toast.show({
        type: "progress",
        text1: step.text,
        props: { progress: (i + 1) / steps.length },
        autoHide: false,
        toastId,
      });
      if (step.action) await step.action();
    }
    Toast.hide();
    Toast.show({ type: "success", text1: "Operation completed successfully" });
  } catch (err) {
    Toast.hide();
    Toast.show({
      type: "error",
      text1: "Operation failed",
      text2: (err as Error)?.message || "Unexpected error",
    });
    throw err;
  }
};
