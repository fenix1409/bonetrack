export interface UserProfile {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female';
}

export interface NutritionChoice {
  id: string;
  category: 'good' | 'medium' | 'harmful';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  stzi: number;
  bmiScore: number;
  foodScore: number;
  stepsScore: number;
  conditionScore: number;
  steps: number;
  selectedFoodIds?: string[];
  conditionKey?: string;
}
