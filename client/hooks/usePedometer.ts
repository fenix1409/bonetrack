import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useBoneStore } from '@/store/useBoneStore';

const STEPS_KEY = 'pedometer_steps_data';
const BACKGROUND_STEP_TASK = 'BACKGROUND_STEP_TASK';

interface PedometerState {
  steps: number | null;
  available: boolean;
  loading: boolean;
  permissionDenied: boolean;
}

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfDay = () => {
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

const saveSteps = async (steps: number) => {
  if (!Number.isFinite(steps) || steps < 0) return;
  try {
    const today = getTodayString();
    const raw = await AsyncStorage.getItem(STEPS_KEY);
    let previousSteps = 0;
    
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        previousSteps = parsed.steps || 0;
      }
    }

    // ✅ Faqat qadamlar soni ko'payganda yoki yangi kun bo'lganda saqlaymiz
    // Bu "1 bo'lib qolish" muammosini oldini oladi
    if (steps >= previousSteps || raw === null || JSON.parse(raw).date !== today) {
      await AsyncStorage.setItem(STEPS_KEY, JSON.stringify({
        steps,
        date: today,
      }));
    }
  } catch {}
};

const fetchCurrentSteps = async (): Promise<number> => {
  try {
    const now = new Date();
    const result = await Pedometer.getStepCountAsync(getStartOfDay(), now);
    return result.steps;
  } catch {
    return 0;
  }
};

// Background Task definition
TaskManager.defineTask(BACKGROUND_STEP_TASK, async () => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) return BackgroundFetch.BackgroundFetchResult.NoData;

    const now = new Date();
    const result = await Pedometer.getStepCountAsync(getStartOfDay(), now);
    const current = result.steps;
    
    await saveSteps(current);
    
    // Zustand store ni ham fonda yangilab qo'yamiz (persist orqali AsyncStorage ga yoziladi)
    try {
      useBoneStore.getState().updateStepsOnly(current);
    } catch {}
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export function usePedometer(): PedometerState {
  const { updateStepsOnly } = useBoneStore();
  const [state, setState] = useState<PedometerState>({
    steps: null,
    available: false,
    loading: true,
    permissionDenied: false,
  });

  const isMountedRef = useRef(true);

  // Qadamlar o'zgarganda AsyncStorage ga saqlash
  useEffect(() => {
    if (state.steps !== null) {
      saveSteps(state.steps);
    }
  }, [state.steps]);

  useEffect(() => {
    isMountedRef.current = true;
    let subscription: { remove: () => void } | null = null;

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
          // Xatolikni kamaytirish uchun: Agar cached ma'lumot bo'lsa, uni ko'rsatamiz
          const cached = await loadCachedSteps();
          setState({ steps: cached, available: false, loading: false, permissionDenied: false });
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

        // ✅ Agar cached qiymat kattaroq bo'lsa, uni ishlatamiz (sensor hali "isib" ulgurmagan bo'lishi mumkin)
        const finalSteps = Math.max(current, cached || 0);

        setState({ steps: finalSteps, available: true, loading: false, permissionDenied: false });
        await saveSteps(finalSteps);
        updateStepsOnly(finalSteps);

        // Register Background Task
        try {
          const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_STEP_TASK);
          if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_STEP_TASK, {
              minimumInterval: 15 * 60, // 15 minut
              stopOnTerminate: false,
              startOnBoot: true,
            });
          }
        } catch (err) {}

        // 5. ✅ Real-time kuzatish (watchStepCount orqali)
        subscription = Pedometer.watchStepCount(async () => {
          if (!isMountedRef.current) return;
          try {
            const fresh = await fetchCurrentSteps();
            if (!isMountedRef.current) return;
            setState(prev => ({ ...prev, steps: Math.max(fresh, prev.steps || 0) }));
          } catch {}
        });

      } catch {
        if (!isMountedRef.current) return;
        setState({ steps: null, available: false, loading: false, permissionDenied: false });
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
      subscription?.remove();
    };
  }, []);

  return state;
}