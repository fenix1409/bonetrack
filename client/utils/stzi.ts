import type { DailyLog, UserProfile, WalkingCondition } from '@/types/bone';
import { calculateBMI, calculateSTZI, getBMIScore, getFoodScore, getStepsScore } from '@/utils/calculations';
import { getWalkingConditionScore } from '@/utils/walkingConditionScore';

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
}

export function calculateDailySTZI(input: DailySTZIInput): DailySTZIResult {
  const bmi = calculateBMI(input.profile.weight, input.profile.height);
  const bmiScore = getBMIScore(bmi);
  const foodScore = getFoodScore(input.foods);
  const stepsScore = getStepsScore(input.steps);
  const conditionScore = getWalkingConditionScore(input.walkingCondition);
  const stzi = calculateSTZI({
    bmiScore,
    foodScore,
    stepsScore,
    conditionScore,
    age: input.profile.age,
  });

  return {
    stzi,
    bmiScore,
    foodScore,
    stepsScore,
    conditionScore,
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
