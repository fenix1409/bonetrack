import { NutritionChoice, UserProfile } from '../types/bone';

/* ================================
   CONFIG (SOURCE OF TRUTH)
================================ */

export const FOOD_SCORE_LIMITS = {
  MIN: -3,
  MAX: 10,
} as const;

export const STZI_LIMITS = {
  MIN: 0.0,
  MAX: 2.0,
} as const;

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

const NORMALIZATION_FACTOR = 10;
const MIN_TOTAL_SCORE = 0;

/* ================================
   TYPES
================================ */

type ConditionKey = keyof typeof CONDITIONS;

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
  if (data.age == null || !Number.isFinite(data.age) || data.age < 1 || data.age > 120) {
    return 'Please enter a valid age (1-120)';
  }

  if (data.height == null || !Number.isFinite(data.height) || data.height < 50 || data.height > 250) {
    return 'Please enter a valid height (50-250cm)';
  }

  if (data.weight == null || !Number.isFinite(data.weight) || data.weight < 10 || data.weight > 300) {
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
  if (!Number.isFinite(weight) || !Number.isFinite(heightCm) || weight <= 0 || heightCm <= 0) {
    throw new Error('Invalid BMI input');
  }
  const heightM = heightCm / 100;
  return Math.round((weight / (heightM * heightM)) * 100) / 100;
};

export const getBMIScore = (bmi: number): number => {
  if (!Number.isFinite(bmi)) return 0;
  if (bmi >= 18.5 && bmi <= 25) return 2;
  if (bmi > 25 && bmi <= 30) return 1;
  return 0;
};

/* ================================
   FOOD
================================ */

export const getFoodScore = (foodIds: string[]): number => {
  if (!Array.isArray(foodIds)) return 0;

  const rawScore = foodIds.reduce((total, id) => {
    const item = FOOD_ITEMS[id];
    if (!item) return total;
    return total + FOOD_SCORES[item.category];
  }, 0);

  // Fix: Clamp food score to safe range [FOOD_SCORE_LIMITS.MIN, FOOD_SCORE_LIMITS.MAX] ([-3, 10])
  return Math.min(
    FOOD_SCORE_LIMITS.MAX,
    Math.max(FOOD_SCORE_LIMITS.MIN, rawScore)
  );
};

/* ================================
   STEPS
================================ */

export const getStepsScore = (steps: number): number => {
  if (!Number.isFinite(steps) || steps < 0) return 0;

  for (const range of STEPS_RANGES) {
    if (steps < range.max) return range.score;
  }

  return 5;
};

export const stepsToKm = (steps: number): number => {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  return Math.round(((steps * 0.75) / 1000) * 100) / 100;
};

/* ================================
   AGE COEF
================================ */

export const getAgeCoef = (age: number): number => {
  if (!Number.isFinite(age)) return 1.0;
  if (age >= 1 && age <= 19) return 1.2;
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
  conditionKey: ConditionKey;
  age: number;
}): number => {
  const { bmiScore, foodScore, stepsScore, conditionKey, age } = params;
  const conditionScore = CONDITIONS[conditionKey as ConditionKey] ?? 0;
  const safeBmiScore = Number.isFinite(bmiScore) ? bmiScore : 0;
  const safeFoodScore = Number.isFinite(foodScore) ? foodScore : 0;
  const safeStepsScore = Number.isFinite(stepsScore) ? stepsScore : 0;

  // Fix: Ensure total score is never below MIN_TOTAL_SCORE (0)
  const totalRaw = safeBmiScore + safeFoodScore + safeStepsScore + conditionScore;
  const total = Math.max(MIN_TOTAL_SCORE, totalRaw);

  const coef = getAgeCoef(age);

  let stzi = (total * coef) / NORMALIZATION_FACTOR;

  // Fix: Clamp final STZI to range [STZI_LIMITS.MIN, STZI_LIMITS.MAX] ([0, 2])
  stzi = Math.min(STZI_LIMITS.MAX, Math.max(STZI_LIMITS.MIN, stzi));

  return Math.round(stzi * 100) / 100;
};

/* ================================
   RESULT INTERPRETATION
================================ */

export const getSTZIText = (stzi: number): 'Аъло' | 'Ўрта' | 'Паст' => {
  if (stzi >= 1.6) return 'Аъло';
  if (stzi >= 1.0) return 'Ўрта';
  return 'Паст';
};

export const getSTZIExplanation = (stzi: number | null | undefined): string => {
  const val = stzi ?? 0;
  if (val >= 1.6) {
    return 'Сизда суяк зичлиги юқори. Соғлом турмуш тарзини давом эттиринг.';
  }
  if (val >= 1.0) {
    return 'Суяк зичлиги меъёрида. Фаоллик ва овқатланишни сақланг.';
  }
  if (val > 0) {
    return 'Суяк зичлиги паст. Калций ва қуёш нури тавсия этилади.';
  }
  return 'Жуда паст кўрсаткич. Шифокорга мурожаат қилиш тавсия этилади.';
};

export const getStatusColors = (stzi: number | null | undefined, colors: StatusColors) => {
  const val = stzi ?? 0;
  if (val >= 1.6) {
    return { label: 'Аъло', color: colors.excellent, bg: colors.excellentBg };
  }
  if (val >= 1.0) {
    return { label: 'Ўрта', color: colors.medium, bg: colors.mediumBg };
  }
  return { label: 'Паст', color: colors.low, bg: colors.lowBg };
};

/* ================================
   RECOMMENDATIONS
================================ */

export type RecommendationType = 'critical' | 'warning' | 'improve';

export interface Recommendation {
  text: string;
  type: RecommendationType;
}

export interface RecommendationInput {
  steps: number;
  foodScore: number;
  bmiScore: number;
  stzi: number;
}

export const getRecommendations = (data: RecommendationInput): Recommendation[] => {
  const { steps, foodScore, bmiScore, stzi } = data;
  const recommendations: Recommendation[] = [];

  // Priority 1: Critical STZI (Medical) - CRITICAL
  if (stzi === 0) {
    recommendations.push({
      text: 'Шифокор билан маслаҳатлашинг.',
      type: 'critical',
    });
  }

  // Priority 2: BMI Warning - WARNING
  if (bmiScore === 0) {
    recommendations.push({
      text: 'Вазнингизни назорат қилинг.',
      type: 'warning',
    });
  }

  // Priority 3: Food Score - Harmful Reduction - WARNING
  if (foodScore < 0) {
    recommendations.push({
      text: 'Зарарли маҳсулотларни камайтиринг.',
      type: 'warning',
    });
  }

  // Priority 4: Steps - Severe inactivity - WARNING/IMPROVE
  if (steps < 1000) {
    recommendations.push({
      text: 'Кунига камида 5000 қадам юринг.',
      type: 'warning',
    });
  } else if (steps < 5000) {
    recommendations.push({
      text: 'Қадамлар сонини ошириб боринг.',
      type: 'improve',
    });
  }

  // Priority 5: Food Score - Healthy addition - IMPROVE
  if (foodScore < 3) {
    recommendations.push({
      text: 'Калций ва витамин D га бой овқатлар енг.',
      type: 'improve',
    });
  }

  // Priority 6: STZI Improvement - IMPROVE
  if (stzi > 0 && stzi < 1) {
    recommendations.push({
      text: 'Қуёш нури ва фаол ҳаракатни кўпайтиринг.',
      type: 'improve',
    });
  }

  // Sort by priority (critical > warning > improve)
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
