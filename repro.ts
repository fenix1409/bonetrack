import { calculateSTZI, getFoodScore, getStepsScore, calculateBMI, getBMIScore } from './utils/calculations';

// Simulating user inputs:
// Steps: 10,000
// Food: all "good" items
// BMI score: 2

const steps = 10000;
const foodIds = [
  'dairy', 'green_veggies', 'nuts_seeds', 'legumes', 'bony_fish',
  'fatty_fish', 'fish_oil', 'egg_yolk', 'sun_mushrooms', 'calcium_supp', 'vit_d_supp'
];
const age = 18; // To get age coef 1.2
const conditionKey = 'summer'; // 2 points

const foodScore = getFoodScore(foodIds);
const stepsScore = getStepsScore(steps);
const bmiScore = 2; // User said BMI 2

const stzi = calculateSTZI({
  bmiScore,
  foodScore,
  stepsScore,
  conditionKey: 'summer' as any,
  age
});

console.log('--- Test Results ---');
console.log(`Food Score: ${foodScore}`);
console.log(`Steps Score: ${stepsScore}`);
console.log(`BMI Score: ${bmiScore}`);
console.log(`Final STZI: ${stzi}`);

if (stzi > 2.0) {
  console.error('FAIL: STZI exceeds 2.0');
} else {
  console.log('PASS: STZI is within limits');
}
