import fs from 'fs/promises';
import path from 'path';
import type { HealthAdviceInput } from '../../services/healthAdvice.service';

let boneTrackInfo: string | null = null;

async function getBoneTrackInfo(): Promise<string> {
  if (boneTrackInfo) return boneTrackInfo;
  boneTrackInfo = await fs.readFile(
    path.join(__dirname, 'BoneTrack.md'),
    'utf-8'
  );
  return boneTrackInfo;
}

export const buildHealthAdvicePrompt = async (data: HealthAdviceInput): Promise<string> => {
  const info = await getBoneTrackInfo();

  const status =
    data.stzi < 1 ? 'low' : data.stzi <= 1.6 ? 'medium' : 'good';

  const stepTarget = data.steps < 5000
    ? Math.min(data.steps + 1000, 5000)
    : null;

  return `
${info}

You are an AI assistant inside a lifestyle tracking app.

INPUT:
- steps: ${data.steps}
- foodScore: ${data.foodScore}
- bmi: ${data.bmi}
- stzi: ${data.stzi}
- resolvedStatus: ${status}
${stepTarget !== null ? `- stepTarget: ${stepTarget} (suggest THIS exact number, not ${data.steps}, not 5000)` : '- stepTarget: null (steps already at goal)'}

TASK:
Analyze the user lifestyle score and generate SHORT practical feedback.

--------------------------------
OUTPUT (STRICT JSON ONLY):
{
  "status": "${status}",
  "summary": "string",
  "issues": ["string"],
  "actions": ["string"]
}
--------------------------------

STATUS RULE (already resolved, use resolvedStatus):
- stzi < 1 → low
- 1 ≤ stzi ≤ 1.6 → medium
- stzi > 1.6 → good

STZI threshold: 1.6 is "medium". Only stzi strictly greater than 1.6 is "good".

ISSUE RULES:
- "good" status → issues: [] (empty array, no issues)
- "medium" or "low" → Choose MAXIMUM 2 issues

Allowed issues:
- "Кунлик қадамлар кам" (only if steps < 5000)
- "Овқатланиш баҳолаши паст" (only if foodScore < 5)
- "BMI меъёрдан ташқари" (only if bmi < 18.5 or bmi > 25)

DO NOT generate any other issue.

ACTION RULES BY STATUS:

If status === "good":
  - actions: EXACTLY 1 action
  - ONLY allowed: "Ҳозирги турмуш тарзингизни сақлаб қолинг"
  - DO NOT suggest any improvements

If status === "medium":
  - actions: MAXIMUM 2 actions
  - focus ONLY on the weakest metric

If status === "low":
  - actions: MAXIMUM 3 actions
  - address the most critical issues only

ACTION RULES FOR STEPS (medium/low only):
${stepTarget !== null
      ? `- steps < 5000: use EXACTLY "Кунига ${stepTarget} қадам юришга ҳаракат қилинг"
  - DO NOT use any other number — not ${data.steps}, not 5000, not any other value
  - stepTarget is already calculated: ${stepTarget}`
      : '- steps >= 5000: DO NOT suggest increasing steps'}

ACTION RULES FOR FOOD (medium/low only):
- If foodScore < 5: "Ҳар куни 2 порция сабзавот истеъмол қилинг"
- If foodScore < 5: "Ширин ичимликларни камайтиринг"

STRICTLY FORBIDDEN in actions:
- Any mention of: суяк, суяк соғлиги, мустаҳкамлаш, машқ, жисмоний машқ,
  даволаш, касаллик, тиббий ташхис, витамин тавсияси, кальций, остеопороз
- Medical recommendations
- Exercise programs
- Motivational text or explanations
- Suggesting more steps/food when status is "good"

LANGUAGE RULES:
- Uzbek Cyrillic ONLY
- No Latin letters
- No emojis

STYLE:
- concise
- mobile-app friendly
- natural Uzbek wording

CRITICAL:
- Return VALID JSON only
- No markdown
- No extra text
- "status" field MUST equal resolvedStatus: "${status}"
`;
};