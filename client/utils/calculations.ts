import { NutritionChoice, UserProfile, WalkingCondition, WalkingFrequency } from '@/types/bone';
import {
  calculateBMI as _calculateBMI,
  getBMIScore as _getBMIScore,
  getFoodScore as _getFoodScore,
  getStepScore as _getStepScore,
  getEnvironmentScore as _getEnvironmentScore,
  getAgeCoefficient as _getAgeCoefficient,
  calculateSTZI as _calculateSTZI,
  calculateMonthlyAverageSTZI,
  getRecommendations as _getRecommendations,
  validateProfile as _validateProfile,
  getSTZIStatus as _getSTZIStatus,
  STZI_MAX,
  STZI_MIN,
  Recommendation,
  RecommendationType
} from './stzi-system';

/** Derived, not re-declared: this was a fourth copy of the canonical STZI range. */
export const STZI_LIMITS = {
  MIN: STZI_MIN,
  MAX: STZI_MAX,
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

type StatusColors = {
  excellent: string;
  excellentBg: string;
  medium: string;
  mediumBg: string;
  low: string;
  lowBg: string;
};

export const validateProfile = _validateProfile;
export const calculateBMI = _calculateBMI;
export const getBMIScore = _getBMIScore;

export const getFoodScore = (foodIds: string[]): number => {
  const selectedFoods = foodIds
    .map(id => FOOD_ITEMS[id])
    .filter((item): item is NutritionChoice => item !== undefined);

  return _getFoodScore(selectedFoods);
}

export const getLifestyleRiskScore = (foodIds: string[], isSmoker: boolean): number => {
  const harmfulFoodsCount = foodIds
    .map(id => FOOD_ITEMS[id])
    .filter(item => item !== undefined && item.category === 'harmful')
    .length;

  let risk = harmfulFoodsCount;
  if (isSmoker) risk += 2;
  return risk;
};

export const getStepsScore = _getStepScore;

export const stepsToKm = (steps: number): number => {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  return Math.round(((steps * 0.75) / 1000) * 100) / 100;
};

export const getAgeCoef = _getAgeCoefficient;

export const calculateSTZI = (params: {
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  age: number;
  condition: WalkingCondition;
}): number => {
  return _calculateSTZI({
    bmiScore: params.bmiScore,
    foodScore: params.foodScore,
    stepScore: params.stepsScore,
    environmentScore: _getEnvironmentScore(params.condition),
    ageCoeff: _getAgeCoefficient(params.age)
  });
};

export const calculateMonthlySTZI = calculateMonthlyAverageSTZI;

/*
 * The three helpers below all branch on the STZI status bands. They used to
 * re-type `>= 1.6` / `>= 1.0` locally — three more copies of a boundary that
 * also lives in `getSTZIStatus` and, on the server, in `resolveStatus`. The
 * server sends the advice card its own `status`, so a threshold changed in one
 * copy and not the others would colour the dashboard "Аъло" while the AI card
 * argued the user was "low".
 */
export const getSTZIText = (stzi: number): string => {
  const status = _getSTZIStatus(stzi);
  if (status === 'good') return 'Аъло';
  if (status === 'medium') return 'Ўрта (ОВКАТЛАНИШ РАЦИОНИ ВА ҚАДАМЛАР КЎПАЙТИРИШ)';
  return 'Паст (хавф бор ДАВОЛОВЧИ ШИФОКОРГА МУРОЖОАТ ҚИЛИШ)';
};

export const getSTZIExplanation = (stzi: number | null | undefined): string => {
  const status = _getSTZIStatus(stzi ?? 0);
  if (status === 'good') return 'Сизнинг суяк зичлиги индексингиз жуда яхши. Шу тарзда давом эттиринг 👍';
  if (status === 'medium') return 'Рационни яхшилаш ва қадамлар сонини ошириш (5000+) тавсия этилади.';
  return 'Диққат! Сизда суяк заифлашиши хавфи мавжуд. Шифокор билан маслаҳатлашинг.';
};

export const getStatusColors = (stzi: number | null | undefined, colors: StatusColors) => {
  const status = _getSTZIStatus(stzi ?? 0);
  if (status === 'good') return { label: 'Аъло', color: colors.excellent, bg: colors.excellentBg };
  if (status === 'medium') return { label: 'Ўртача', color: colors.medium, bg: colors.mediumBg };
  return { label: 'Паст', color: colors.low, bg: colors.lowBg };
};

export { Recommendation, RecommendationType };

export const getRecommendations = (data: {
  steps: number;
  foodScore: number;
  bmiScore: number;
  stzi: number;
  isSmoker?: boolean;
}): Recommendation[] => {
  return _getRecommendations(data);
};

export const getFrequencyFromSteps = (steps: number): WalkingFrequency => {
  if (steps >= 7_500) return 'always';
  if (steps >= 4_000) return 'sometimes';
  if (steps >= 1_000) return 'rare';
  return 'sedentary';
};