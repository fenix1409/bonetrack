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
    let isMounted = true; // ✅ Unmount bo'lgandan keyin state update oldini oladi

    const getStartOfDay = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    };

    const fetchSteps = async (): Promise<number | null> => {
      try {
        const now = new Date();
        const result = await Pedometer.getStepCountAsync(getStartOfDay(), now);
        return result.steps;
      } catch {
        return null;
      }
    };

    const init = async () => {
      try {
        // 1. Permission
        const { status } = await Pedometer.requestPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setState({ steps: null, available: false, loading: false, permissionDenied: true });
          return;
        }

        // 2. Availability
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isMounted) return;

        if (!isAvailable) {
          setState({ steps: null, available: false, loading: false, permissionDenied: false });
          return;
        }

        // 3. Bugungi qadamlar
        const steps = await fetchSteps();
        if (!isMounted) return;

        setState({ steps, available: true, loading: false, permissionDenied: false });

        // 4. Real-time yangilanish
        // ✅ watchStepCount delta qaytaradi — shuning uchun getStepCountAsync qayta chaqiramiz
        // Toza total qiymat olish uchun, ikki marta qo'shib yubormaslik uchun
        subscription = Pedometer.watchStepCount(async () => {
          if (!isMounted) return;
          const fresh = await fetchSteps();
          if (!isMounted) return;
          if (fresh !== null) {
            setState(prev => ({ ...prev, steps: fresh }));
          }
        });
      } catch {
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