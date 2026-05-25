import fs from 'fs';
import path from 'path';
import type { HealthAdviceInput } from '../../services/healthAdvice.service';

// Load BoneTrack documentation
const boneTrackInfo = fs.readFileSync(
  path.join(__dirname, 'BoneTrack.md'),
  'utf-8'
);

export const buildHealthAdvicePrompt = (data: HealthAdviceInput) => `
${boneTrackInfo}

You are an AI assistant inside a lifestyle tracking app.

INPUT:
- steps: ${data.steps}
- foodScore: ${data.foodScore}
- bmi: ${data.bmi}
- stzi: ${data.stzi}

TASK:
Analyze the user lifestyle score and generate SHORT practical feedback.

--------------------------------
OUTPUT (STRICT JSON ONLY):
{
  "status": "low | medium | good",
  "summary": "string",
  "issues": ["string"],
  "actions": ["string"]
}
--------------------------------

STATUS RULE:
- stzi < 1 → low
- 1 ≤ stzi ≤ 1.6 → medium
- stzi > 1.6 → good

IMPORTANT ISSUE RULES:
Choose MAXIMUM 2 issues only.

Allowed issues:
- "Кунлик қадамлар кам"
- "Овқатланиш баҳолаши паст"
- "BMI меъёрдан ташқари"

DO NOT generate any other issue.

IMPORTANT ACTION RULES:
- Maximum 3 actions
- Actions MUST be measurable and simple
- Actions MUST relate ONLY to:
  - walking
  - food
  - BMI
- Keep actions short

GOOD examples:
- "Кунига 5000 қадам юринг"
- "Ҳар куни 2 порция сабзавот истеъмол қилинг"
- "Ширин ичимликларни камайтиринг"

STRICTLY FORBIDDEN:
- Any mention of:
  - суяк
  - суяк соғлиги
  - мустаҳкамлаш
  - машқ
  - жисмоний машқ
  - даволаш
  - касаллик
  - тиббий ташхис
  - витамин тавсияси
  - кальций
  - остеопороз

DO NOT:
- invent medical recommendations
- mention exercise programs
- mention strengthening bones
- mention training/workout
- generate motivational text
- generate explanations

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
`;