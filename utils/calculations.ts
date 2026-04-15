import { NutritionChoice, UserProfile } from '../types/bone';

/* ================================
   CONFIG (SOURCE OF TRUTH)
================================ */

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

export const FOOD_SCORES = {
  good: 1,
  medium: 0.5,
  harmful: -1,
} as const;

export const STEPS_RANGES = [
  { max: 500, score: 0 },
  { max: 1000, score: 1 },
  { max: 2500, score: 2 },
  { max: 5000, score: 3 },
  { max: 7500, score: 4 },
  { max: Infinity, score: 5 },
];

export const CONDITIONS = {
  summer: 2,
  winter: 2,
  evening: 1,
  sedentary: -2,
} as const;

/* ================================
   TYPES
================================ */

type Gender = 'male' | 'female';

type StatusColors = {
  excellent: string;
  excellentBg: string;
  medium: string;
  mediumBg: string;
  low: string;
  lowBg: string;
};

/* ================================
   VALIDATION
================================ */

export const validateProfile = (data: Partial<UserProfile>): string | null => {
  if (data.age == null || data.age < 1 || data.age > 120) {
    return 'Please enter a valid age (1-120)';
  }

  if (data.height == null || data.height < 50 || data.height > 250) {
    return 'Please enter a valid height (50-250cm)';
  }

  if (data.weight == null || data.weight < 10 || data.weight > 300) {
    return 'Please enter a valid weight (10-300kg)';
  }

  if (!data.gender) {
    return 'Please select a gender';
  }

  return null;
};

/* ================================
   BMI
================================ */

export const calculateBMI = (weight: number, heightCm: number): number => {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(2));
};

export const getBMIScore = (bmi: number): number => {
  if (bmi >= 18.5 && bmi <= 25) return 2;
  if (bmi > 25 && bmi <= 30) return 1;
  return 0;
};

/* ================================
   FOOD
================================ */

export const getFoodScore = (foodIds: string[]): number => {
  return foodIds.reduce((total, id) => {
    const item = FOOD_ITEMS[id];
    if (!item) return total;
    return total + FOOD_SCORES[item.category];
  }, 0);
};

/* ================================
   STEPS
================================ */

export const getStepsScore = (steps: number): number => {
  for (const range of STEPS_RANGES) {
    if (steps < range.max) return range.score;
  }
  return 0;
};

export const stepsToKm = (steps: number): number => {
  return Number(((steps * 0.75) / 1000).toFixed(2));
};

/* ================================
   AGE COEFFICIENT (SPEC BASED)
================================ */

export const getAgeCoef = (age: number): number => {
  if (age >= 20 && age <= 39) return 1.0;
  if (age >= 40 && age <= 59) return 0.8;
  if (age >= 60) return 0.6;
  return 1.0;
};

/* ================================
   FINAL CALCULATION
================================ */

export const calculateSTZI = (params: {
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  conditionKey: keyof typeof CONDITIONS;
  age: number;
}): number => {
  const { bmiScore, foodScore, stepsScore, conditionKey, age } = params;

  const conditionScore = CONDITIONS[conditionKey];

  const total = bmiScore + foodScore + stepsScore + conditionScore;
  const coef = getAgeCoef(age);

  return Number(((total * coef) / 10).toFixed(2));
};

/* ================================
   RESULT INTERPRETATION
================================ */

export const getSTZIText = (stzi: number): 'Аъло' | 'Ўрта' | 'Паст' => {
  if (stzi >= 1.6) return 'Аъло';
  if (stzi >= 1.0) return 'Ўрта';
  return 'Паст';
};

export const getStatusColors = (stzi: number, colors: StatusColors) => {
  if (stzi >= 1.6) {
    return { label: 'Аъло', color: colors.excellent, bg: colors.excellentBg };
  }
  if (stzi >= 1.0) {
    return { label: 'Ўрта', color: colors.medium, bg: colors.mediumBg };
  }
  return { label: 'Паст', color: colors.low, bg: colors.lowBg };
};