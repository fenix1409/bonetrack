import type { WalkingCondition, NutritionChoice } from '../types/bone';

/**
 * Pure helper for rounding to 2 decimal places.
 */
const round2 = (num: number): number => Math.round(num * 100) / 100;

/**
 * Clamps a number between min and max.
 */
export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

/*
 * Canonical score ranges — the single source of truth for the whole app.
 *
 * Mirrored in `server/llm/scoreRanges.ts` (the packages are independent, with
 * no shared workspace). Anything that needs to bound a score imports from here
 * rather than re-typing the numbers, which is how the client previously ended
 * up clamping foodScore to ±3 against a real range of −7…+11.
 */
export const FOOD_SCORE_MIN = -7;
export const FOOD_SCORE_MAX = 11;

export const STZI_MIN = 0;
export const STZI_MAX = 2;

export const BMI_MIN = 10;
export const BMI_MAX = 80;

export const STEPS_MIN = 0;
export const STEPS_MAX = 100_000;

/**
 * 1. Calculate BMI
 * Returns actual BMI clamped to 10-80.
 */
export const calculateBMI = (heightCm: number, weightKg: number): number => {
  if (heightCm <= 0 || weightKg <= 0) return 10;
  const heightM = heightCm / 100;
  if (heightM === 0) return 10; // ✅ Division by zero protection
  const bmi = weightKg / (heightM * heightM);
  return clamp(round2(bmi), 10, 80);
};

export const validateProfile = (data: { age?: number; height?: number; weight?: number; gender?: string }): string | null => {
  if (data.age == null || !Number.isFinite(data.age) || data.age < 1 || data.age > 120) {
    return 'Ёш 1 dan 120 гача бўлиши керак';
  }
  if (data.height == null || !Number.isFinite(data.height) || data.height < 50 || data.height > 250) {
    return 'Бўй 50-250 см оралиғида бўлиши керак';
  }
  if (data.weight == null || !Number.isFinite(data.weight) || data.weight < 10 || data.weight > 300) {
    return 'Вазн 10-300 кг оралиғида бўлиши керак';
  }
  if (!data.gender) {
    return 'Жинсингизни танланг';
  }
  return null;
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
 * ✅ Clamped to valid range
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

  // ✅ Clamp to valid range (-7 to +11)
  const clamped = clamp(score, FOOD_SCORE_MIN, FOOD_SCORE_MAX);
  return round2(clamped);
};

/**
 * 4. Get Step Score
 * ✅ Corrected ranges from document:
 * <500 = 0
 * 500–1499 = 1
 * 1500–2499 = 1.5
 * 2500–3499 = 2
 * 3500–4499 = 2.5
 * 4500–5499 = 3
 * ≥5500 = 4
 */
export const getStepScore = (steps: number): number => {
  const s = Math.max(0, steps);
  if (s >= 5500) return 4;
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
    if (isIdealTime) return 2;
    if (timeOfDay === 'evening') return 1;
    return 0;
  }

  if (frequency === 'sometimes') {
    if (isIdealTime) return 0.5;
    if (timeOfDay === 'evening') return 0.25;
    return 0;
  }

  return 0;
};

/**
 * 6. Get Age Coefficient (ЁK)
 * ✅ Fixed: 20 yoshdan past bo'lsa 0.5 default
 * 20–35 ёш → 1.0
 * 36–50 ёш → 0.75
 * 51–60 ёш → 0.5
 * 61+ → 0.25
 * <20 → 0.5 (default)
 */
export const getAgeCoefficient = (age: number): number => {
  const a = clamp(age, 1, 120);
  if (a >= 20 && a <= 35) return 1.0;
  if (a >= 36 && a <= 50) return 0.75;
  if (a >= 51 && a <= 60) return 0.5;
  if (a >= 61) return 0.25;
  return 0.5; // ✅ Default for age < 20
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

export type RecommendationType = 'critical' | 'warning' | 'improve';

export interface Recommendation {
  text: string;
  type: RecommendationType;
}

export const getRecommendations = (data: {
  steps: number;
  foodScore: number;
  bmiScore: number;
  stzi: number;
  isSmoker?: boolean;
}): Recommendation[] => {
  const { steps, foodScore, bmiScore, stzi, isSmoker } = data;
  const recommendations: Recommendation[] = [];

  // ✅ Smoking recommendation (if applicable)
  if (isSmoker) {
    recommendations.push({
      text: 'Чекишни ташлаш суяк зичлигини яхшилашга ёрдам беради.',
      type: 'critical',
    });
  }

  // Critical issues
  if (stzi === 0) {
    recommendations.push({ 
      text: 'Шифокор билан маслаҳатлашиш тавсия этилади.', 
      type: 'critical' 
    });
  }

  // Warnings
  if (bmiScore === 0) {
    recommendations.push({ 
      text: 'Вазнингизни назорат қилинг.', 
      type: 'warning' 
    });
  }

  if (foodScore < 0) {
    recommendations.push({ 
      text: 'Зарарли маҳсулотларни камайтиринг.', 
      type: 'warning' 
    });
  }

  if (steps < 1000) {
    recommendations.push({ 
      text: 'Кунига камида 5000 қадам юришга ҳаракат қилинг.', 
      type: 'warning' 
    });
  } else if (steps < 5000) {
    recommendations.push({ 
      text: 'Қадамлар сонини аста-секин ошириб боринг.', 
      type: 'improve' 
    });
  }

  // Improvements
  if (foodScore < 3) {
    recommendations.push({ 
      text: 'Кальций ва D витаминига бой озиқ-овқатларни кўпайтиринг.', 
      type: 'improve' 
    });
  }

  if (stzi > 0 && stzi < 1) {
    recommendations.push({ 
      text: 'Қуёш нурида бўлиш ва D витамини қўшимчасини қўллаш суяклар учун фойдали.', 
      type: 'improve' 
    });
  }

  // Sort by priority and deduplicate
  const priorityMap: Record<RecommendationType, number> = {
    critical: 0,
    warning: 1,
    improve: 2,
  };

  const uniqueRecommendations = Array.from(
    new Map(recommendations.map((item) => [item.text, item])).values()
  );

  return uniqueRecommendations
    .sort((a, b) => priorityMap[a.type] - priorityMap[b.type])
    .slice(0, 5);
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