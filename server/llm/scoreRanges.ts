/**
 * Scoring bounds and status thresholds shared by the prompt builders,
 * controllers and services.
 *
 * The client is an independent package (no shared workspace), so these values
 * are duplicated here. The source of truth is `client/utils/stzi-system.ts` —
 * `getFoodScore` for the food range and `getSTZIStatus` for the thresholds.
 * Keep both sides in sync.
 */

/** `getFoodScore` clamps to this range. */
export const FOOD_SCORE_MIN = -7;
export const FOOD_SCORE_MAX = 11;

/** `calculateSTZI` clamps to this range. */
export const STZI_MIN = 0;
export const STZI_MAX = 2;

/** `calculateBMI` clamps to this range. */
export const BMI_MIN = 10;
export const BMI_MAX = 80;

export const STEPS_MIN = 0;
export const STEPS_MAX = 100_000;

export type HealthStatus = 'low' | 'medium' | 'good';

/** Mirrors `getSTZIStatus`: >= 1.6 good, >= 1.0 medium, otherwise low. */
export const resolveStatus = (stzi: number): HealthStatus => {
  if (stzi >= 1.6) return 'good';
  if (stzi >= 1.0) return 'medium';
  return 'low';
};
