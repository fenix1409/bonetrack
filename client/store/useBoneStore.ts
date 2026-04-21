import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyLog } from '../types/bone';
import { 
  calculateBMI, 
  getBMIScore, 
  getFoodScore, 
  getStepsScore, 
  CONDITIONS, 
  calculateSTZI 
} from '../utils/calculations';

interface BoneState {
  profile: UserProfile | null;
  history: DailyLog[];
  isFirstLaunch: boolean;
  _hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  setHasHydrated: (state: boolean) => void;
<<<<<<< HEAD
  addDailyLog: (data: { steps: number; foods: string[]; condition: keyof typeof CONDITIONS }) => void;
=======
  addDailyLog: (data: { steps: number; foods: string[]; condition: string }) => void;
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
  resetStore: () => void;
}

const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

<<<<<<< HEAD
const isConditionKey = (value: string): value is keyof typeof CONDITIONS =>
  Object.prototype.hasOwnProperty.call(CONDITIONS, value);

=======
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
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

      addDailyLog: ({ steps, foods, condition }) => {
        const { profile, history } = get();
        if (!profile) return;

<<<<<<< HEAD
        if (!Number.isFinite(steps) || steps < 0 || !isConditionKey(condition)) return;

        const bmi = calculateBMI(profile.weight, profile.height);
        const bmiScore = getBMIScore(bmi);
        const foodScore = getFoodScore(foods);
        const stepsScore = getStepsScore(steps);
        const conditionScore = CONDITIONS[condition];

        const stzi = calculateSTZI({
          bmiScore,
          foodScore,
          stepsScore,
          conditionKey: condition,
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
          conditionKey: condition,
        };

        const existingIndex = history.findIndex((l) => l.date === today);
        if (existingIndex >= 0) {
          const newHistory = [...history];
          newHistory[existingIndex] = newLog;
          set({ history: newHistory });
        } else {
          set({ history: [newLog, ...history] }); 
=======
        try {
          const bmi = calculateBMI(profile.weight, profile.height);
          const bmiScore = getBMIScore(bmi);
          const foodScore = getFoodScore(foods);
          const stepsScore = getStepsScore(steps);
          const conditionScore = CONDITIONS[condition as keyof typeof CONDITIONS] || 0;

          const stzi = calculateSTZI({
            bmiScore,
            foodScore,
            stepsScore,
            conditionKey: condition as any,
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
            conditionKey: condition,
          };

          const existingIndex = history.findIndex((l) => l.date === today);
          if (existingIndex >= 0) {
            const newHistory = [...history];
            newHistory[existingIndex] = newLog;
            set({ history: newHistory });
          } else {
            set({ history: [newLog, ...history] }); // Prepend new logs
          }
        } catch (error) {
          console.error('Failed to add daily log:', error);
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
        }
      },

      resetStore: () => set({ profile: null, history: [], isFirstLaunch: true }),
    }),
    {
<<<<<<< HEAD
      name: 'bonetrack-storage-v2', 
=======
      name: 'bonetrack-storage-v2', // Versioned name to avoid conflicts with old data
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
    }
  )
);
