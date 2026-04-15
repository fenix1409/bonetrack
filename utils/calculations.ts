import { NutritionChoice, UserProfile } from '../types/bone';

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

/**
 * Validates profile data.
 * Returns null if valid, or an error message if invalid.
 */
export const validateProfile = (data: Partial<UserProfile>): string | null => {
  if (!data.age || data.age < 1 || data.age > 120) return 'Please enter a valid age (1-120)';
  if (!data.height || data.height < 50 || data.height > 250) return 'Please enter a valid height (50-250cm)';
  if (!data.weight || data.weight < 10 || data.weight > 300) return 'Please enter a valid weight (10-300kg)';
  if (!data.gender) return 'Please select a gender';
  return null;
};

/**
 * Calculates Body Mass Index (BMI).
 */
export const calculateBMI = (weight: number, heightCm: number): number => {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

/**
 * Returns a score based on BMI.
 */
export const getBMIScore = (bmi: number): number => {
  if (bmi >= 18.5 && bmi <= 25) return 2;
  if (bmi > 25 && bmi <= 30) return 1;
  return 0;
};

/**
 * Calculates a nutrition score based on selected food items.
 */
export const getFoodScore = (foodIds: string[]): number => {
  return foodIds.reduce((score, foodId) => {
    const item = FOOD_ITEMS[foodId];
    if (!item) return score;
    if (item.category === 'good') return score + 1;
    if (item.category === 'medium') return score + 0.5;
    if (item.category === 'harmful') return score - 1.5;
    return score;
  }, 0);
};

/**
 * Returns a score based on daily steps.
 */
export const getStepsScore = (steps: number): number => {
  if (steps < 500) return 0;
  if (steps < 1000) return 1;
  if (steps < 2500) return 2;
  if (steps < 5000) return 3;
  if (steps < 7500) return 4;
  return 5;
};

/**
 * Converts steps to kilometers (estimate).
 */
export const stepsToKm = (steps: number): number => {
  // Average step length of 0.75m
  return (steps * 0.75) / 1000;
};

/**
 * Returns an age coefficient based on age and gender.
 */
export const getAgeCoef = (age: number, gender: 'male' | 'female'): number => {
  if (gender === 'female') {
    if (age >= 45 && age <= 59) return 0.7; // Higher risk earlier for women
    if (age >= 60) return 0.5;
  } else {
    if (age >= 50 && age <= 64) return 0.8;
    if (age >= 65) return 0.6;
  }
  return 1.0;
};

/**
 * Calculates the final STZI score.
 */
export const calculateSTZI = (params: { 
  bmiScore: number; 
  foodScore: number; 
  stepsScore: number; 
  conditionScore: number; 
  age: number;
  gender: 'male' | 'female';
}): number => {
  const { bmiScore, foodScore, stepsScore, conditionScore, age, gender } = params;
  const sum = Math.max(0, bmiScore + foodScore + stepsScore + conditionScore);
  const coef = getAgeCoef(age, gender);
  return Number(((sum * coef) / 10).toFixed(2));
};

/**
 * Translates STZI score to text label.
 */
export const getSTZIText = (stzi: number): 'Аъло' | 'Ўрта' | 'Паст' => {
  if (stzi >= 1.6) return 'Аъло';
  if (stzi >= 1.0) return 'Ўрта';
  return 'Паст';
};

/**
 * Safe status getter for UI.
 */
export const getStatusColors = (stzi: number, colors: any) => {
  if (stzi >= 1.6) return { label: 'Аъло', color: colors.excellent, bg: colors.excellentBg };
  if (stzi >= 1.0) return { label: 'Ўрта', color: colors.medium, bg: colors.mediumBg };
  return { label: 'Паст', color: colors.low, bg: colors.lowBg };
};
