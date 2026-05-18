import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEPS_KEY = 'pedometer_steps_data';

interface PedometerState {
  steps: number | null;
  available: boolean;
  loading: boolean;
  permissionDenied: boolean;
}

const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getStartOfDay = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
};

const loadCachedSteps = async (): Promise<number | null> => {
  try {
    const raw = await AsyncStorage.getItem(STEPS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayString()) return null;
    return typeof parsed.steps === 'number' ? parsed.steps : null;
  } catch {
    return null;
  }
};

const saveSteps = async (steps: number): Promise<void> => {
  if (!Number.isFinite(steps) || steps < 0) return;
  try {
    await AsyncStorage.setItem(STEPS_KEY, JSON.stringify({
      steps,
      date: getTodayString(),
    }));
  } catch {}
};

const fetchCurrentSteps = async (): Promise<number> => {
  try {
    const now = new Date();
    const result = await Pedometer.getStepCountAsync(getStartOfDay(), now);
    return result.steps ?? 0;
  } catch {
    return 0;
  }
};

export function usePedometer(): PedometerState {
  const [state, setState] = useState<PedometerState>({
    steps: null,
    available: false,
    loading: true,
    permissionDenied: false,
  });

  const isMountedRef = useRef(true);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

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
          // Sensor yo'q — cache dan ko'rsatamiz
          const cached = await loadCachedSteps();
          setState({ steps: cached, available: false, loading: false, permissionDenied: false });
          return;
        }

        // 3. Cache — tez ko'rinsin
        const cached = await loadCachedSteps();
        if (!isMountedRef.current) return;

        if (cached !== null) {
          setState({ steps: cached, available: true, loading: false, permissionDenied: false });
        }

        // 4. Sensor dan haqiqiy qiymat
        const current = await fetchCurrentSteps();
        if (!isMountedRef.current) return;

        // Cache > sensor bo'lsa cache ishlatiladi (sensor "isib" ulgurmagan holat)
        const finalSteps = Math.max(current, cached ?? 0);

        setState({ steps: finalSteps, available: true, loading: false, permissionDenied: false });
        await saveSteps(finalSteps);

        // 5. Har 30 soniyada yangilash — watchStepCount emas, getStepCountAsync
        // Bu delta qo'shilib ketish muammosini hal qiladi
        intervalRef.current = setInterval(async () => {
          if (!isMountedRef.current) return;
          try {
            const fresh = await fetchCurrentSteps();
            if (!isMountedRef.current) return;
            setState(prev => {
              const next = Math.max(fresh, prev.steps ?? 0);
              if (next !== prev.steps) saveSteps(next);
              return { ...prev, steps: next };
            });
          } catch {}
        }, 30_000);

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