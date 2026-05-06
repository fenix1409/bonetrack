import type { WalkingCondition, NutritionChoice } from '../types/bone';

/**
 * Pure helper for rounding to 2 decimal places.
 */
const round2 = (num: number): number => Math.round(num * 100) / 100;

/**
 * Clamps a number between min and max.
 */
const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

/**
 * 1. Calculate BMI
 * Returns actual BMI clamped to 10-80.
 */
export const calculateBMI = (heightCm: number, weightKg: number): number => {
  if (heightCm <= 0 || weightKg <= 0) return 10; // Minimum clamped value
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return clamp(round2(bmi), 10, 80);
};

/**
 * 2. Get BMI Score
 * Input: bmi (10-80)
 * Output: score (0-2)
 * BMI = вазн (кг) / (бўй (м))²
 * 18.5 – 25 → 2 балл
 * 25 – 30 → 1 балл
 * <18.5 ёки >30 → 0 балл
 */
export const getBMIScore = (bmi: number): number => {
  const b = clamp(bmi, 10, 80);
  if (b >= 18.5 && b <= 25) return 2;
  if (b > 25 && b <= 30) return 1;
  return 0;
};

/**
 * 3. Get Food Score
 * Range: -7 to +11 (based on document)
 * Smoking is NOT included here, handled via subtract logic if needed or separately.
 * In this app, smoking is usually in NutritionChoice but we filter it.
 */
export const getFoodScore = (selectedFoods: NutritionChoice[]): number => {
  let score = 0;
  if (!selectedFoods || selectedFoods.length === 0) return 0;

  selectedFoods.forEach(food => {
    if (food.category === 'harmful') {
      score -= 1;
    }
    else if (food.category === 'good') {
      score += 1;
    }
    else if (food.category === 'medium') {
      score += 0.5;
    }
  });

  return round2(score);
};

/**
 * 4. Get Step Score
 * Ranges (from Word doc):
 * <500 = 0
 * 500–1000 = 1
 * 1500–2000 = 1.5
 * 2500–3000 = 2
 * 3500–4000 = 2.5
 * 4500–5000 = 3
 * >5500 = 4
 */
export const getStepScore = (steps: number): number => {
  const s = Math.max(0, steps);
  if (s > 5500) return 4;
  if (s >= 4500) return 3;
  if (s >= 3500) return 2.5;
  if (s >= 2500) return 2;
  if (s >= 1500) return 1.5;
  if (s >= 500) return 1;
  return 0;
};

/**
 * 5. Get Environment Score (Walking Condition)
 * Based on Word doc:
 * Summer/Spring (05:00-09:00) AND Autumn/Winter (10:00-15:00) always -> +2
 * Summer/Spring (05:00-09:00) only -> +0.5
 * Autumn/Winter (10:00-15:00) only -> +0.5
 * Evening any season -> +1
 * Summer/Spring evening -> +0.25
 * Autumn/Winter evening -> +0.25
 * Sometimes -> +0
 * Sedentary -> -2
 */
export const getEnvironmentScore = (condition: WalkingCondition | null | undefined): number => {
  if (!condition) return 0;

  const { season, timeOfDay, frequency } = condition;

  // Kam harakatlilik → -2
  if (frequency === 'sedentary') return -2;

  // Pora-pora (rare) → 0
  if (frequency === 'rare') return 0;

  // Ideal vaqt: yoz/bahor ertalab YOKI qish/kuz kunduz
  const isIdealTime =
      (season === 'spring_summer' && timeOfDay === 'morning') ||
      (season === 'autumn_winter' && timeOfDay === 'day');

  if (frequency === 'always') {
    if (isIdealTime)           return 2;
    if (timeOfDay === 'evening') return 1;
    return 0;
  }

  if (frequency === 'sometimes') {
    if (isIdealTime)           return 0.5;
    if (timeOfDay === 'evening') return 0.25;
    return 0;
  }

  return 0;
};

/**
 * 6. Get Age Coefficient (ЁK)
 * 20–35 ёш → 1.0
 * 36–50 ёш → 0.75
 * 51–60 ёш → 0.5
 * 61–75 → 0.25
 */
export const getAgeCoefficient = (age: number): number => {
  const a = clamp(age, 0, 120);
  if (a >= 20 && a <= 35) return 1.0;
  if (a >= 36 && a <= 50) return 0.75;
  if (a >= 51 && a <= 60) return 0.5;
  if (a >= 61) return 0.25;
  return 1.0;
};

/**
 * 7. Final STZI Formula
 * STZI = (bmiScore + foodScore + stepScore + environmentScore) * ageCoeff / 10
 * Final range: 0–2
 */
export const calculateSTZI = (params: {
  bmiScore: number;
  foodScore: number;
  stepScore: number;
  environmentScore: number;
  ageCoeff: number;
}): number => {
  const { bmiScore, foodScore, stepScore, environmentScore, ageCoeff } = params;
  
  const sum = bmiScore + foodScore + stepScore + environmentScore;
  const stzi = (Math.max(0, sum) * ageCoeff) / 10;

  return clamp(round2(stzi), 0, 2);
};

/**
 * Status determination
 * 1.6 – 2.0 → Аъло (good)
 * 1.0 – 1.59 → Ўрта (medium)
 * <1.0 → Паст (low)
 */
export const getSTZIStatus = (stzi: number): 'low' | 'medium' | 'good' => {
  if (stzi >= 1.6) return 'good';
  if (stzi >= 1.0) return 'medium';
  return 'low';
};

/**
 * Monthly average
 */
export const calculateMonthlyAverageSTZI = (dailyValues: (number | null | undefined)[]): number => {
  if (!dailyValues || dailyValues.length === 0) return 0;

  const validValues = dailyValues.filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return round2(sum / validValues.length);
};
