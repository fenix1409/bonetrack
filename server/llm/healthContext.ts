import { z } from 'zod';
import {
   BMI_MAX,
   BMI_MIN,
   FOOD_SCORE_MAX,
   FOOD_SCORE_MIN,
   STEPS_MAX,
   STEPS_MIN,
   STZI_MAX,
   STZI_MIN,
} from './scoreRanges';

/**
 * The one health-data contract both AI endpoints validate against:
 * `POST /chat` takes it as the whole body, `POST /api/chat` as an optional
 * `healthContext`. Previously each controller declared its own object and the
 * chat one had drifted — `bmi` was still a hardcoded `.min(0).max(100)` while
 * the client clamped to 10…80 and the advice endpoint enforced BMI_MIN…BMI_MAX.
 *
 * Every bound comes from `scoreRanges.ts`; nothing here is a literal. Mirrored
 * client-side by `client/utils/healthContext.ts`, and `bun run check:contract`
 * fails if the two packages' constants drift apart.
 *
 * No field carries a `.default()`. Zod validates the substituted default too,
 * so a `.default(0)` under `.min(BMI_MIN)` would reject its own fallback — and
 * defaulting health data to zero is what let a missing profile reach the model
 * as a real reading in the first place. The client sends all four fields or
 * omits the object entirely.
 */
export const healthContextSchema = z.object({
   steps: z.number().min(STEPS_MIN).max(STEPS_MAX),
   foodScore: z.number().min(FOOD_SCORE_MIN).max(FOOD_SCORE_MAX),
   bmi: z.number().min(BMI_MIN).max(BMI_MAX),
   stzi: z.number().min(STZI_MIN).max(STZI_MAX),
});

export type HealthContext = z.infer<typeof healthContextSchema>;
