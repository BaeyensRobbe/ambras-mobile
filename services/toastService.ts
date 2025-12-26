import Toast from 'react-native-toast-message';

type StepFunc = () => Promise<void>;

interface ProgressToastOptions {
  id: string;
  title: string;
}

export class ProgressToast {
  private id: string;
  private stepCount: number = 0;
  private totalSteps: number = 0;

  constructor(options: ProgressToastOptions) {
    this.id = options.id;
  }

  start(totalSteps: number, title: string) {
    this.totalSteps = totalSteps;
    this.stepCount = 0;
    Toast.show({
      type: 'progress',
      text1: title,
      props: { progress: 0 },
      autoHide: false,
      toastId: this.id,
    });
  }

  async step(text: string, fn?: StepFunc) {
    this.stepCount++;
    const progress = Math.min(this.stepCount / this.totalSteps, 1);
    Toast.show({
      type: 'progress',
      text1: text,
      props: { progress },
      autoHide: false,
      toastId: this.id,
    });
    if (fn) await fn();
  }

  complete(successText?: string) {
    Toast.hide();
    if (successText) {
      Toast.show({ type: 'success', text1: successText });
    }
  }

  error(errorText: string) {
    Toast.hide();
    Toast.show({ type: 'error', text1: errorText });
  }
}
