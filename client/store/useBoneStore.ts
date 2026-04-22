import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyLog } from '../types/bone';
import type { WalkingCondition } from '../components/input/WalkingConditionPicker';
import {
  calculateBMI,
  getBMIScore,
  getFoodScore,
  getStepsScore,
  CONDITIONS,
  calculateSTZI
} from '../utils/calculations';
import { getWalkingConditionScore } from '../utils/walkingConditionScore';

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

const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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

        const bmi = calculateBMI(profile.weight, profile.height);
        const bmiScore = getBMIScore(bmi);
        const foodScore = getFoodScore(foods);
        const stepsScore = getStepsScore(steps);
        const conditionScore = getWalkingConditionScore(walkingCondition);

        const stzi = calculateSTZI({
          bmiScore,
          foodScore,
          stepsScore,
          conditionKey: 'summer',
          age: profile.age,
        });

        const today = getTodayDate();
        const newLog: DailyLog = {
          date: today,
          stzi,
          bmiScore,
          foodScore,
          stepsScore,
          conditionScore,
          steps,
          selectedFoodIds: foods,
          walkingCondition,
          conditionKey: 'summer',
        };

        const existingIndex = history.findIndex((l) => l.date === today);
        if (existingIndex >= 0) {
          const newHistory = [...history];
          newHistory[existingIndex] = newLog;
          set({ history: newHistory });
        } else {
          set({ history: [newLog, ...history] });
        }
      },

      resetStore: () => set({ profile: null, history: [], isFirstLaunch: true }),
    }),
    {
      name: 'bonetrack-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
    }
  )
);
