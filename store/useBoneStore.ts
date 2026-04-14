import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female';
}

export interface NutritionChoice {
  id: string;
  category: 'good' | 'medium' | 'harmful';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  stzi: number;
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  conditionScore: number;
  steps: number;
  selectedFoodIds?: string[];
  conditionKey?: string;
}

interface BoneState {
  profile: UserProfile | null;
  history: DailyLog[];
  isFirstLaunch: boolean;
  _hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  setHasHydrated: (state: boolean) => void;
  addDailyLog: (data: { steps: number; foods: string[]; condition: string }) => void;
}

export const FOOD_ITEMS: Record<string, NutritionChoice> = {
  dairy: { id: 'dairy', category: 'good' },
  green_veggies: { id: 'green_veggies', category: 'good' },
  nuts_seeds: { id: 'nuts_seeds', category: 'good' },
  legumes: { id: 'legumes', category: 'good' },
  bony_fish: { id: 'bony_fish', category: 'good' },
  fatty_fish: { id: 'fatty_fish', category: 'good' },
  fish_oil: { id: 'fish_oil', category: 'good' },
  egg_yolk: { id: 'egg_yolk', category: 'good' },
  sun_mushrooms: { id: 'sun_mushrooms', category: 'good' },
  calcium_supp: { id: 'calcium_supp', category: 'good' },
  vit_d_supp: { id: 'vit_d_supp', category: 'good' },
  fruits: { id: 'fruits', category: 'medium' },
  grains: { id: 'grains', category: 'medium' },
  meat_poultry: { id: 'meat_poultry', category: 'medium' },
  normal_veggies: { id: 'normal_veggies', category: 'medium' },
  veg_oils: { id: 'veg_oils', category: 'medium' },
  caffeine: { id: 'caffeine', category: 'harmful' },
  alcohol: { id: 'alcohol', category: 'harmful' },
  high_salt: { id: 'high_salt', category: 'harmful' },
  smoking: { id: 'smoking', category: 'harmful' },
  phytates: { id: 'phytates', category: 'harmful' },
  oxalates: { id: 'oxalates', category: 'harmful' },
  low_fat: { id: 'low_fat', category: 'harmful' },
  soda: { id: 'soda', category: 'harmful' },
};

export const CONDITIONS: Record<string, number> = {
  summer: 2,
  winter: 2,
  evening: 1,
  sedentary: -2
};


// --- Calculation Utilities ---

export function calculateBMI(weight: number, heightCm: number) {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export function getBMIScore(bmi: number) {
  if (bmi >= 18.5 && bmi <= 25) return 2;
  if (bmi > 25 && bmi <= 30) return 1;
  return 0;
}

export function getFoodScore(foods: string[]) {
  let score = 0;
  foods.forEach(foodId => {
    const item = FOOD_ITEMS[foodId];
    if (item) {
      if (item.category === 'good') score += 1;
      else if (item.category === 'medium') score += 0.5;
      else if (item.category === 'harmful') score -= 1.5;
    }
  });
  return score;
}

export function getStepsScore(steps: number) {
  if (steps < 500) return 0;
  if (steps < 1000) return 1;
  if (steps < 2500) return 2;
  if (steps < 5000) return 3;
  if (steps < 7500) return 4;
  return 5;
}

export function stepsToKm(steps: number) {
  // O'rtacha qadam uzunligi 0.75 metr (75 sm) deb olinsa
  return (steps * 0.75) / 1000;
}

export function getAgeCoef(age: number, gender: 'male' | 'female') {
  if (gender === 'female') {
    if (age >= 45 && age <= 59) return 0.7; // Earlier risk for women (menopause)
    if (age >= 60) return 0.5;
  } else {
    if (age >= 50 && age <= 64) return 0.8;
    if (age >= 65) return 0.6;
  }
  return 1.0;
}

export function getSTZIText(stzi: number) {
  if (stzi >= 1.6) return 'Аъло';
  if (stzi >= 1.0) return 'Ўрта';
  return 'Паст';
}

export function calculateSTZI(scores: { 
  bmiScore: number; 
  foodScore: number; 
  stepsScore: number; 
  conditionScore: number; 
  age: number;
  gender: 'male' | 'female';
}) {
  const sum = scores.bmiScore + scores.foodScore + scores.stepsScore + scores.conditionScore;
  const coef = getAgeCoef(scores.age, scores.gender);
  return (sum * coef) / 10;
}

// --- Store ---

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
        
        const bmi = calculateBMI(profile.weight, profile.height);
        const bmiScore = getBMIScore(bmi);
        const foodScore = getFoodScore(foods);
        const stepsScore = getStepsScore(steps);
        const conditionScore = CONDITIONS[condition] || 0;
        
        const stzi = calculateSTZI({
          bmiScore,
          foodScore,
          stepsScore,
          conditionScore,
          age: profile.age,
          gender: profile.gender
        });
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        const newLog: DailyLog = {
          date: today,
          stzi: Number(stzi.toFixed(2)),
          bmiScore,
          foodScore,
          stepsScore,
          conditionScore,
          steps,
          selectedFoodIds: foods,
          conditionKey: condition
        };
        
        const existingIndex = history.findIndex(l => l.date === today);
        if (existingIndex >= 0) {
          const newHistory = [...history];
          newHistory[existingIndex] = newLog;
          set({ history: newHistory });
        } else {
          set({ history: [...history, newLog] });
        }
      }
    }),
    {
      name: 'bonetrack-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
    }
  )
);
