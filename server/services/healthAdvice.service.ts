import { z } from 'zod';
import { buildHealthAdvicePrompt } from '../llm/prompts/health-advice';
import { llmClient } from '../llm/client';
import { LlmResponseError } from '../llm/errors';
import { resolveStatus } from '../llm/scoreRanges';

export type HealthAdviceInput = {
  steps: number;
  foodScore: number;
  bmi: number;
  stzi: number;
};

const MAX_SUMMARY_LENGTH = 100;
const MAX_ISSUES = 3;
const MAX_ACTIONS = 4;

/**
 * Deliberately permissive: length/count limits are prompt guidance, not a
 * contract. Enforcing them here would turn a slightly-too-long but perfectly
 * usable answer into a failed request, so they are normalised below instead.
 */
const healthAdviceSchema = z.object({
  status: z.enum(['low', 'medium', 'good']),
  summary: z.string().min(1),
  issues: z.array(z.string()),
  actions: z.array(z.string()),
});

export type HealthAdviceResponse = z.infer<typeof healthAdviceSchema>;

/** Strip markdown fences and any prose surrounding the JSON object. */
const extractJson = (text: string): string => {
  const withoutFences = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return withoutFences;

  return withoutFences.slice(start, end + 1);
};

const parseAdvice = (text: string): HealthAdviceResponse | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    return null;
  }

  const validated = healthAdviceSchema.safeParse(parsed);
  return validated.success ? validated.data : null;
};

const cleanList = (items: string[], limit: number): string[] =>
  items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, limit);

/** Truncate on a word boundary so the UI never receives an oversized summary. */
const truncateSummary = (summary: string): string => {
  const trimmed = summary.trim();
  if (trimmed.length <= MAX_SUMMARY_LENGTH) return trimmed;

  const cut = trimmed.slice(0, MAX_SUMMARY_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > MAX_SUMMARY_LENGTH / 2 ? cut.slice(0, lastSpace) : cut).trimEnd();
};

export const healthAdviceService = {
  async generate(data: HealthAdviceInput): Promise<HealthAdviceResponse> {
    const prompt = buildHealthAdvicePrompt(data);

    // `status` is a pure function of stzi, so the model's answer is never trusted.
    const status = resolveStatus(data.stzi);

    const attempt: { advice: HealthAdviceResponse | null } = { advice: null };

    const response = await llmClient.generateText({
      model: 'gpt-4.1-mini',
      prompt,
      temperature: 0.2,
      maxTokens: 500,
      timeoutMs: 30_000,
      maxAttempts: 2,
      jsonMode: true,
      validate: (text) => {
        attempt.advice = parseAdvice(text);
        return attempt.advice !== null;
      },
    });

    // A cache hit skips `validate`, so parse here too.
    const parsed = attempt.advice ?? parseAdvice(response.text);

    if (!parsed) {
      throw new LlmResponseError(
        'AI response did not match the expected schema.',
        response.text
      );
    }

    return {
      status,
      summary: truncateSummary(parsed.summary),
      issues: status === 'good' ? [] : cleanList(parsed.issues, MAX_ISSUES),
      actions: cleanList(parsed.actions, MAX_ACTIONS),
    };
  },
};
