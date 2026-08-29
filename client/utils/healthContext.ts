import type { DailyLog, UserProfile } from '@/types/bone';
import {
  BMI_MAX,
  BMI_MIN,
  FOOD_SCORE_MAX,
  FOOD_SCORE_MIN,
  STEPS_MAX,
  STEPS_MIN,
  STZI_MAX,
  STZI_MIN,
  calculateBMI,
  clamp,
  validateProfile,
} from './stzi-system';

/**
 * The health payload both AI endpoints accept — `POST /chat` (advice) validates
 * it as the whole body, `POST /api/chat` (chatbot) as `healthContext`.
 *
 * Mirrored by `healthContextSchema` in `server/llm/healthContext.ts`; the bounds
 * on both sides come from the constants above and from `server/llm/scoreRanges.ts`.
 * `bun run check:contract` in the server package fails if the two drift apart.
 */
export type HealthContext = {
  steps: number;
  foodScore: number;
  bmi: number;
  stzi: number;
};

export const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * BMI for a profile that is actually complete, or null.
 *
 * Returning null rather than a number is the point: `calculateBMI` has to return
 * something for every input, so an absent profile used to become BMI 10 — a
 * severely-underweight reading the model then gave real weight advice about.
 * Callers must decide what to do with "no data" instead of being handed a guess.
 */
export const resolveBmi = (profile: UserProfile | null | undefined): number | null => {
  if (!profile) return null;
  if (validateProfile(profile) !== null) return null;

  const bmi = calculateBMI(profile.height, profile.weight);
  return Number.isFinite(bmi) ? bmi : null;
};

/** The log for today, or null if the newest log is from an earlier day. */
export const getTodayLog = (history: DailyLog[] | null | undefined): DailyLog | null => {
  const latestLog = history?.[0];
  if (!latestLog || latestLog.date !== getTodayDate()) return null;
  return latestLog;
};

/**
 * Builds the request payload, or returns null when the app does not hold enough
 * data to describe the user honestly — an incomplete profile, or no log for
 * today. Every caller sending health data to the server goes through here, so
 * the two features can no longer disagree about what they send.
 */
export const buildHealthContext = (params: {
  profile: UserProfile | null | undefined;
  history: DailyLog[] | null | undefined;
}): HealthContext | null => {
  const bmi = resolveBmi(params.profile);
  if (bmi === null) return null;

  const todayLog = getTodayLog(params.history);
  if (!todayLog) return null;

  return {
    steps: clamp(todayLog.steps ?? 0, STEPS_MIN, STEPS_MAX),
    foodScore: clamp(todayLog.foodScore ?? 0, FOOD_SCORE_MIN, FOOD_SCORE_MAX),
    bmi: clamp(bmi, BMI_MIN, BMI_MAX),
    stzi: clamp(todayLog.stzi ?? 0, STZI_MIN, STZI_MAX),
  };
};
