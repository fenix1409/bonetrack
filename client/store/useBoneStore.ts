import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, DailyLog, WalkingCondition } from '../types/bone';
import { buildDailyLog } from '../utils/stzi';
import { sortLogsByDateDesc } from '../utils/statistics';
import { Platform } from 'react-native';

interface BoneState {
  profile: UserProfile | null;
  history: DailyLog[];
  isFirstLaunch: boolean;
  _hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  setHasHydrated: (state: boolean) => void;
  addDailyLog: (data: { steps: number; foods: string[]; walkingCondition: WalkingCondition }) => void;
  resetStore: () => void;
}

const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Use appropriate storage based on platform
const getStorage = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return createJSONStorage(() => ({
        getItem: (key: string) => localStorage.getItem(key) ?? null,
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: (key: string) => localStorage.removeItem(key),
      }));
    }
    // Fallback for SSR/build time
    return createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => { },
      removeItem: () => { },
    }));
  }
  // Native platforms use AsyncStorage
  return createJSONStorage(() => AsyncStorage);
};

export const useBoneStore = create<BoneState>()(
  persist(
    (set, get) => ({
      profile: null,
      history: [],
      isFirstLaunch: true,
      _hasHydrated: false,

      setProfile: (profile) => set({ profile }),

      completeOnboarding: () => set({ isFirstLaunch: false }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addDailyLog: ({ steps, foods, walkingCondition }) => {
        const { profile, history } = get();
        if (!profile) return;

        if (!Number.isFinite(steps) || steps < 0) return;

        const today = getTodayDate();
        const newLog = buildDailyLog({
          date: today,
          profile,
          steps,
          foods,
          walkingCondition,
        });

        const existingIndex = history.findIndex((l) => l.date === today);
        if (existingIndex >= 0) {
          const newHistory = [...history];
          newHistory[existingIndex] = newLog;
          set({ history: sortLogsByDateDesc(newHistory) });
        } else {
          set({ history: sortLogsByDateDesc([newLog, ...history]) });
        }
      },

      resetStore: () => set({ profile: null, history: [], isFirstLaunch: true }),
    }),
    {
      name: 'bonetrack-storage-v2',
      storage: getStorage(),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
    }
  )
);
