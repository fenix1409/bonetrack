import { NutritionChoice, UserProfile } from '../types/bone';

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

export type FoodItemId = keyof typeof FOOD_ITEMS;

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

const NORMALIZATION_FACTOR = 10;
const MIN_TOTAL_SCORE = 0;

type StatusColors = {
  excellent: string;
  excellentBg: string;
  medium: string;
  mediumBg: string;
  low: string;
  lowBg: string;
};

export const validateProfile = (data: Partial<UserProfile>): string | null => {
  if (data.age == null || !Number.isFinite(data.age) || data.age < 1 || data.age > 120) {
    return 'Ёш 1 дан 120 гача бўлиши керак';
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

export const getFoodScore = (foodIds: string[]): number => {
  if (!Array.isArray(foodIds)) return 0;

  const rawScore = foodIds.reduce((total, id) => {
    const item = FOOD_ITEMS[id];
    if (!item) return total;
    return total + FOOD_SCORES[item.category];
  }, 0);

  return Math.min(FOOD_SCORE_LIMITS.MAX, Math.max(FOOD_SCORE_LIMITS.MIN, rawScore));
};

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

export const getAgeCoef = (age: number): number => {
  if (!Number.isFinite(age)) return 1.0;
  if (age >= 1 && age <= 19) return 1.2;
  if (age >= 20 && age <= 39) return 1.0;
  if (age >= 40 && age <= 59) return 0.8;
  if (age >= 60) return 0.6;
  return 1.0;
};

export const calculateSTZI = (params: {
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  conditionScore: number;
  age: number;
}): number => {
  const { bmiScore, foodScore, stepsScore, conditionScore, age } = params;
  const safeBmiScore = Number.isFinite(bmiScore) ? bmiScore : 0;
  const safeFoodScore = Number.isFinite(foodScore) ? foodScore : 0;
  const safeStepsScore = Number.isFinite(stepsScore) ? stepsScore : 0;
  const safeConditionScore = Number.isFinite(conditionScore) ? conditionScore : 0;
  const totalRaw = safeBmiScore + safeFoodScore + safeStepsScore + safeConditionScore;
  const total = Math.max(MIN_TOTAL_SCORE, totalRaw);
  const stzi = (total * getAgeCoef(age)) / NORMALIZATION_FACTOR;
  const clamped = Math.min(STZI_LIMITS.MAX, Math.max(STZI_LIMITS.MIN, stzi));

  return Math.round(clamped * 100) / 100;
};

export const getSTZIText = (stzi: number): 'Аъло' | 'Ўртача' | 'Паст' => {
  if (stzi >= 1.6) return 'Аъло';
  if (stzi >= 1.0) return 'Ўртача';
  return 'Паст';
};

export const getSTZIExplanation = (stzi: number | null | undefined): string => {
  const val = stzi ?? 0;

  if (val >= 1.6) {
    return 'Суяк зичлигингиз юқори. Соғлом турмуш тарзини давом эттиринг.';
  }

  if (val >= 1.0) {
    return 'Суяк зичлиги меъёрида. Фаоллик ва овқатланишни сақланг.';
  }

  if (val > 0) {
    return 'Суяк зичлиги паст. Кальций ва қуёш нурига эътибор беринг.';
  }

  return 'Кўрсаткич жуда паст. Шифокор билан маслаҳатлашиш тавсия этилади.';
};

export const getStatusColors = (stzi: number | null | undefined, colors: StatusColors) => {
  const val = stzi ?? 0;

  if (val >= 1.6) {
    return { label: 'Аъло', color: colors.excellent, bg: colors.excellentBg };
  }

  if (val >= 1.0) {
    return { label: 'Ўртача', color: colors.medium, bg: colors.mediumBg };
  }

  return { label: 'Паст', color: colors.low, bg: colors.lowBg };
};

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

  if (stzi === 0) {
    recommendations.push({ text: 'Шифокор билан маслаҳатлашиш тавсия этилади.', type: 'critical' });
  }

  if (bmiScore === 0) {
    recommendations.push({ text: 'Вазнингизни назорат қилинг.', type: 'warning' });
  }

  if (foodScore < 0) {
    recommendations.push({ text: 'Зарарли маҳсулотларни камайтиринг.', type: 'warning' });
  }

  if (steps < 1000) {
    recommendations.push({ text: 'Кунига камида 5000 қадам юришга ҳаракат қилинг.', type: 'warning' });
  } else if (steps < 5000) {
    recommendations.push({ text: 'Қадамлар сонини аста-секин ошириб боринг.', type: 'improve' });
  }

  if (foodScore < 3) {
    recommendations.push({ text: 'Кальций ва D витаминига бой овқатларни кўпайтиринг.', type: 'improve' });
  }

  if (stzi > 0 && stzi < 1) {
    recommendations.push({ text: 'Қуёш нури ва фаол ҳаракатни кўпайтиринг.', type: 'improve' });
  }

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
