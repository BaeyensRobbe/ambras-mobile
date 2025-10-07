export const simulateProgress = async (duration: number, updateFn: (progress: number) => void) => {
  const steps = 20; // number of updates
  for (let i = 0; i <= steps; i++) {
    updateFn(i / steps); // progress from 0 to 1
    await new Promise((res) => setTimeout(res, duration / steps));
  }
};
