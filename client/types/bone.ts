export interface UserProfile {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female';
}

export type WalkingSeason = 'spring_summer' | 'autumn_winter';
export type WalkingTimeOfDay = 'morning' | 'day' | 'evening';

export interface WalkingCondition {
  season: WalkingSeason;
  timeOfDay: WalkingTimeOfDay;
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
  steps: number;
  selectedFoodIds?: string[];
  walkingCondition?: WalkingCondition;
}
