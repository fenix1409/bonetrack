export interface UserProfile {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female';
  isSmoker: boolean;
}

export type WalkingSeason = 'spring_summer' | 'autumn_winter' | 'always';
export type WalkingTimeOfDay = 'morning' | 'day' | 'evening' | 'ideal' | 'sometimes' | 'sedentary';

export interface WalkingCondition {
  season: WalkingSeason;
  timeOfDay: WalkingTimeOfDay;
  frequency: 'always' | 'sometimes' | 'rare' | 'sedentary';
}

export interface NutritionChoice {
  id: string;
  category: 'good' | 'medium' | 'harmful';
}

export interface DailyLog {
  date: string; // Year-Month-Day
  stzi: number;
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  conditionScore: number;
  lifestyleRiskScore?: number;
  steps: number;
  selectedFoodIds?: string[];
  walkingCondition?: WalkingCondition;
}
