import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

interface PedometerState {
  steps: number | null;
  available: boolean;
  loading: boolean;
  permissionDenied: boolean;
}

export function usePedometer(): PedometerState {
  const [state, setState] = useState<PedometerState>({
    steps: null,
    available: false,
    loading: true,
    permissionDenied: false,
  });

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    const init = async () => {
      try {
        const { status } = await Pedometer.requestPermissionsAsync();
        if (status !== 'granted') {
          setState({ steps: null, available: false, loading: false, permissionDenied: true });
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable) {
          setState({ steps: null, available: false, loading: false, permissionDenied: false });
          return;
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        setState({ steps: result.steps, available: true, loading: false, permissionDenied: false });

        subscription = Pedometer.watchStepCount(async () => {
          try {
            const updated = new Date();
            const fresh = await Pedometer.getStepCountAsync(startOfDay, updated);
            setState(prev => ({ ...prev, steps: fresh.steps }));
          } catch {
          }
        });
      } catch {
        setState({ steps: null, available: false, loading: false, permissionDenied: false });
      }
    };

    init();
    return () => subscription?.remove();
  }, []);

  return state;
}