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
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

const getEndOfDay = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
};

const loadCachedSteps = async (): Promise<number | null> => {
  try {
    const raw = await AsyncStorage.getItem(STEPS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Bug fix: Sana tekshiruvi qat'iyroq bo'lishi kerak
    if (parsed.date !== getTodayString()) return null;
    return typeof parsed.steps === 'number' ? parsed.steps : null;
  } catch {
    return null;
  }
};

const saveSteps = async (steps: number): Promise<void> => {
  if (typeof steps !== 'number' || !Number.isFinite(steps) || steps < 0) return;
  try {
    await AsyncStorage.setItem(STEPS_KEY, JSON.stringify({
      steps: Math.floor(steps),
      date: getTodayString(),
    }));
  } catch {}
};

const fetchCurrentSteps = async (): Promise<number> => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) return 0;
    
    const start = getStartOfDay();
    const end = new Date(); // Hozirgi vaqt
    const result = await Pedometer.getStepCountAsync(start, end);
    return result?.steps ?? 0;
  } catch (error) {
    console.error('[usePedometer] Error fetching steps:', error);
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
  const subscriptionRef = useRef<Pedometer.PedometerSubscription | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      let cleanup: (() => void) | null = null;
      try {
        // 1. Availability & Permission check
        const isAvailable = await Pedometer.isAvailableAsync();
        console.log('[usePedometer] Pedometer availability:', isAvailable);
        
        // Androidda ACTIVITY_RECOGNITION so'rash kerak bo'lishi mumkin
        const { status } = await Pedometer.getPermissionsAsync();
        console.log('[usePedometer] Initial permission status:', status);

        let finalStatus = status;
        if (status !== 'granted') {
          const request = await Pedometer.requestPermissionsAsync();
          finalStatus = request.status;
          console.log('[usePedometer] Permission requested. New status:', finalStatus);
        }
        
        if (!isMountedRef.current) return;

        if (finalStatus !== 'granted') {
          console.warn('[usePedometer] Permission not granted:', finalStatus);
          setState(prev => ({ ...prev, available: isAvailable, loading: false, permissionDenied: true }));
          return;
        }

        if (!isAvailable) {
          console.warn('[usePedometer] Pedometer not available on this device');
          const cached = await loadCachedSteps();
          setState({ steps: cached, available: false, loading: false, permissionDenied: false });
          return;
        }

        // 2. Initial Fetch
        const cached = await loadCachedSteps();
        const current = await fetchCurrentSteps();
        console.log('[usePedometer] Data fetched - Cached:', cached, 'Current:', current);

        const initialSteps = Math.max(current, cached ?? 0);
        setState({ steps: initialSteps, available: true, loading: false, permissionDenied: false });
        if (initialSteps > 0) await saveSteps(initialSteps);

        // 3. Real-time tracking using watchStepCount
        // Bu foydalanuvchi yurganda darhol yangilanishini ta'minlaydi
        let isFetching = false;
        subscriptionRef.current = Pedometer.watchStepCount((result) => {
          if (!isMountedRef.current || isFetching) return;
          console.log('[usePedometer] watchStepCount event:', result);
          
          isFetching = true;
          fetchCurrentSteps().then(freshSteps => {
            if (!isMountedRef.current) return;
            console.log('[usePedometer] freshSteps from watch event:', freshSteps);
            setState(prev => {
              const next = Math.max(freshSteps, prev.steps ?? 0);
              if (next !== prev.steps) saveSteps(next);
              return { ...prev, steps: next };
            });
          }).finally(() => {
            isFetching = false;
          });
        });

        // 4. Backup interval (watchStepCount ba'zi Androidlarda backgroundda yoki to'xtab qolsa ishlaydi)
        const backupInterval = setInterval(async () => {
          if (!isMountedRef.current || isFetching) return;
          const freshSteps = await fetchCurrentSteps();
          if (!isMountedRef.current) return;
          setState(prev => {
            const next = Math.max(freshSteps, prev.steps ?? 0);
            if (next !== prev.steps) saveSteps(next);
            return { ...prev, steps: next };
          });
        }, 60000); // Har bir daqiqada bir marta tekshirish

        cleanup = () => {
          clearInterval(backupInterval);
          if (subscriptionRef.current) {
            subscriptionRef.current.remove();
          }
        };

      } catch (error) {
        console.error('[usePedometer] Init error:', error);
        if (!isMountedRef.current) return;
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
      if (cleanup) cleanup();
    };
  }, []);

  return state;
}