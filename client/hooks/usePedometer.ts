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
    let isMounted = true;
    let pastSteps = 0; 

    const getStartOfDay = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    };

    const init = async () => {
      try {
        const { status } = await Pedometer.requestPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setState({ steps: null, available: false, loading: false, permissionDenied: true });
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isMounted) return;

        if (!isAvailable) {
          setState({ steps: null, available: false, loading: false, permissionDenied: false });
          return;
        }

        try {
          const now = new Date();
          const result = await Pedometer.getStepCountAsync(getStartOfDay(), now);
          pastSteps = result.steps || 0;
        } catch (error) {
          pastSteps = 0;
        }

        if (!isMounted) return;
        setState({ steps: pastSteps, available: true, loading: false, permissionDenied: false });

        subscription = Pedometer.watchStepCount((result) => {
          if (!isMounted) return;
          
          setState(prev => ({ 
            ...prev, 
            steps: pastSteps + result.steps 
          }));
        });

      } catch (error) {
        if (!isMounted) return;
        setState({ steps: null, available: false, loading: false, permissionDenied: false });
      }
    };

    init();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return state;
}