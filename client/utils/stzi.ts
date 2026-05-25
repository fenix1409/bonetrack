import type { DailyLog, UserProfile, WalkingCondition } from '@/types/bone';
import {
  calculateBMI,
  getBMIScore,
  getFoodScore,
  getStepScore,
  calculateSTZI,
  getEnvironmentScore,
  getAgeCoefficient,
} from './stzi-system';
import { getLifestyleRiskScore, FOOD_ITEMS } from './calculations';

export interface DailySTZIInput {
  profile: UserProfile;
  steps: number;
  foods: string[];
  walkingCondition: WalkingCondition;
}

export interface DailySTZIResult {
  stzi: number;
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  conditionScore: number;
  lifestyleRiskScore: number;
}

export function calculateDailySTZI(input: DailySTZIInput): DailySTZIResult {
  const bmi = calculateBMI(input.profile.height, input.profile.weight);
  const bmiScore = getBMIScore(bmi);

  const selectedFoods = input.foods.map((id) => FOOD_ITEMS[id]).filter((item) => item !== undefined);
  const foodScore = getFoodScore(selectedFoods);

  const stepsScore = getStepScore(input.steps);
  const conditionScore = getEnvironmentScore(input.walkingCondition);
  const ageCoeff = getAgeCoefficient(input.profile.age);

  let finalStzi = calculateSTZI({
    bmiScore,
    foodScore,
    stepScore: stepsScore,
    environmentScore: conditionScore,
    ageCoeff,
  });

  if (input.profile.isSmoker) {
    finalStzi = Math.max(0, finalStzi - 0.1);
  }

  return {
    stzi: finalStzi,
    bmiScore,
    foodScore,
    stepsScore,
    conditionScore,
    lifestyleRiskScore: getLifestyleRiskScore(input.foods, input.profile.isSmoker),
  };
}

export function buildDailyLog(params: DailySTZIInput & { date: string }): DailyLog {
  const score = calculateDailySTZI(params);

  return {
    date: params.date,
    ...score,
    steps: params.steps,
    selectedFoodIds: params.foods,
    walkingCondition: params.walkingCondition,
  };
}
