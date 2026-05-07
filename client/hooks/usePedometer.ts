import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEPS_KEY = 'pedometer_steps_data';

interface PedometerState {
  steps: number | null;
  available: boolean;
  loading: boolean;
  permissionDenied: boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getStartOfDay = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
};

const loadCachedSteps = async (): Promise<number | null> => {
  try {
    const raw = await AsyncStorage.getItem(STEPS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // ✅ Faqat bugungi sana uchun
    return parsed.date === getTodayString() ? parsed.steps : null;
  } catch {
    return null;
  }
};

const saveSteps = async (steps: number) => {
  try {
    await AsyncStorage.setItem(STEPS_KEY, JSON.stringify({
      steps,
      date: getTodayString(),
    }));
  } catch {}
};

const fetchCurrentSteps = async (): Promise<number> => {
  const now = new Date();
  const result = await Pedometer.getStepCountAsync(getStartOfDay(), now);
  return result.steps;
};

export function usePedometer(): PedometerState {
  const [state, setState] = useState<PedometerState>({
    steps: null,
    available: false,
    loading: true,
    permissionDenied: false,
  });

  // ✅ Interval ref — cleanup uchun
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      try {
        // 1. Permission
        const { status } = await Pedometer.requestPermissionsAsync();
        if (!isMountedRef.current) return;

        if (status !== 'granted') {
          setState({ steps: null, available: false, loading: false, permissionDenied: true });
          return;
        }

        // 2. Availability
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isMountedRef.current) return;

        if (!isAvailable) {
          setState({ steps: null, available: false, loading: false, permissionDenied: false });
          return;
        }

        // 3. Cache dan oldin ko'rish — tez ko'rinsin
        const cached = await loadCachedSteps();
        if (!isMountedRef.current) return;

        if (cached !== null) {
          setState({ steps: cached, available: true, loading: false, permissionDenied: false });
        }

        // 4. Sensor dan haqiqiy qiymat
        const current = await fetchCurrentSteps();
        if (!isMountedRef.current) return;

        setState({ steps: current, available: true, loading: false, permissionDenied: false });
        await saveSteps(current);

        // 5. ✅ watchStepCount YO'Q — har 30 soniyada getStepCountAsync chaqiramiz
        // Bu to'g'ri total qiymatni qaytaradi, delta muammosi yo'q
        intervalRef.current = setInterval(async () => {
          if (!isMountedRef.current) return;
          try {
            const fresh = await fetchCurrentSteps();
            if (!isMountedRef.current) return;
            setState(prev => ({ ...prev, steps: fresh }));
            await saveSteps(fresh);
          } catch {}
        }, 30_000); // 30 soniya

      } catch {
        if (!isMountedRef.current) return;
        setState({ steps: null, available: false, loading: false, permissionDenied: false });
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return state;
}