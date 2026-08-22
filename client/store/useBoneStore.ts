import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
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
  updateStepsOnly: (steps: number) => void;
  recalculateTodayLog: (newProfile: UserProfile) => void;
  resetStore: () => void;
}

const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * `profile` holds health data — age, height, weight, gender, smoking status —
 * so it is kept in Keystore/Keychain-backed storage rather than AsyncStorage,
 * which is plaintext and readable from a device backup or a rooted device.
 *
 * `history` stays in AsyncStorage: SecureStore has a hard 2048-byte value limit
 * that a growing log array would blow through, and the daily logs are far less
 * sensitive than the profile.
 */
const SECURE_PROFILE_KEY = 'bonetrack_profile_v1';

const isSecureStoreUsable = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Splits the persisted payload: `profile` goes to SecureStore, everything else
 * to AsyncStorage. Both are read back and recombined on hydration.
 */
const createNativeStorage = (): StateStorage => ({
  getItem: async (name) => {
    const [bulk, secureProfile] = await Promise.all([
      AsyncStorage.getItem(name),
      SecureStore.getItemAsync(SECURE_PROFILE_KEY).catch(() => null),
    ]);

    if (!bulk) return null;

    try {
      const parsed = JSON.parse(bulk);
      if (secureProfile) {
        parsed.state = { ...parsed.state, profile: JSON.parse(secureProfile) };
      }
      return JSON.stringify(parsed);
    } catch {
      // Corrupt payload: treat as no stored state rather than crashing on boot.
      return null;
    }
  },

  setItem: async (name, value) => {
    let profile: UserProfile | null = null;
    let bulk = value;

    try {
      const parsed = JSON.parse(value);
      profile = parsed.state?.profile ?? null;
      // Strip the profile out of the AsyncStorage copy so it exists in exactly
      // one place — leaving it in both would defeat the encryption entirely.
      parsed.state = { ...parsed.state, profile: null };
      bulk = JSON.stringify(parsed);
    } catch {
      // Fall through and store the payload as-is.
    }

    await Promise.all([
      AsyncStorage.setItem(name, bulk),
      profile
        ? SecureStore.setItemAsync(SECURE_PROFILE_KEY, JSON.stringify(profile))
        : SecureStore.deleteItemAsync(SECURE_PROFILE_KEY).catch(() => undefined),
    ]);
  },

  removeItem: async (name) => {
    await Promise.all([
      AsyncStorage.removeItem(name),
      SecureStore.deleteItemAsync(SECURE_PROFILE_KEY).catch(() => undefined),
    ]);
  },
});

const getStorage = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return createJSONStorage(() => ({
        getItem: (key: string) => localStorage.getItem(key) ?? null,
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: (key: string) => localStorage.removeItem(key),
      }));
    }
    return createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => { },
      removeItem: () => { },
    }));
  }

  if (!isSecureStoreUsable) return createJSONStorage(() => AsyncStorage);

  return createJSONStorage(createNativeStorage);
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

      updateStepsOnly: (steps) => {
        const { profile, history } = get();
        if (!profile || !Number.isFinite(steps) || steps < 0) return;

        const today = getTodayDate();
        const existingIndex = history.findIndex((l) => l.date === today);

        if (existingIndex >= 0) {
          const existingLog = history[existingIndex];
          if (existingLog.steps === steps) return;

          const newHistory = [...history];
          newHistory[existingIndex] = buildDailyLog({
            date: today,
            profile,
            steps,
            foods: existingLog.selectedFoodIds ?? [],
            walkingCondition: existingLog.walkingCondition ?? {
              season: 'spring_summer',
              timeOfDay: 'morning',
              frequency: 'always',
            },
          });
          set({ history: sortLogsByDateDesc(newHistory) });
          return;
        }

        set({
          history: sortLogsByDateDesc([
            buildDailyLog({
              date: today,
              profile,
              steps,
              foods: [],
              walkingCondition: {
                season: 'spring_summer',
                timeOfDay: 'morning',
                frequency: 'always',
              },
            }),
            ...history,
          ]),
        });
      },

      recalculateTodayLog: (newProfile) => {
        const { history } = get();
        const today = getTodayDate();
        const existingIndex = history.findIndex((l) => l.date === today);

        if (existingIndex >= 0) {
          const existingLog = history[existingIndex];
          const newHistory = [...history];
          newHistory[existingIndex] = buildDailyLog({
            date: today,
            profile: newProfile,
            steps: existingLog.steps,
            foods: existingLog.selectedFoodIds ?? [],
            walkingCondition: existingLog.walkingCondition ?? {
              season: 'spring_summer',
              timeOfDay: 'morning',
              frequency: 'always',
            },
          });
          set({ history: sortLogsByDateDesc(newHistory) });
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

/*
 * Selector hooks.
 *
 * Calling `useBoneStore()` with no selector subscribes the component to every
 * field, so a step sync writing `history` re-renders everything that only reads
 * `profile` — including the root layout, and with it the whole navigation tree.
 * Each hook below subscribes to exactly one slice.
 *
 * Actions are stable references created once, so components that select only
 * actions never re-render on state changes at all.
 */

export const useProfile = () => useBoneStore((s) => s.profile);
export const useHistory = () => useBoneStore((s) => s.history);
export const useIsFirstLaunch = () => useBoneStore((s) => s.isFirstLaunch);
export const useHasHydrated = () => useBoneStore((s) => s._hasHydrated);

export const useSetProfile = () => useBoneStore((s) => s.setProfile);
export const useCompleteOnboarding = () => useBoneStore((s) => s.completeOnboarding);
export const useAddDailyLog = () => useBoneStore((s) => s.addDailyLog);
export const useUpdateStepsOnly = () => useBoneStore((s) => s.updateStepsOnly);
export const useRecalculateTodayLog = () => useBoneStore((s) => s.recalculateTodayLog);
export const useResetStore = () => useBoneStore((s) => s.resetStore);
