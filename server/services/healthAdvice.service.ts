import { z } from 'zod';
import { buildHealthAdvicePrompt } from '../llm/prompts/health-advice';
import { llmClient } from '../llm/client';

export type HealthAdviceInput = {
  steps: number;
  foodScore: number;
  bmi: number;
  stzi: number;
};

const healthAdviceSchema = z.object({
  status: z.enum(['low', 'medium', 'good']),
  summary: z.string(),
  issues: z.array(z.string()),
  actions: z.array(z.string()),
});

export type HealthAdviceResponse = z.infer<typeof healthAdviceSchema>;

export const healthAdviceService = {
  async generate(data: HealthAdviceInput): Promise<HealthAdviceResponse> {
    const prompt = await buildHealthAdvicePrompt(data);

    const response = await llmClient.generateText({
      model: 'gpt-4.1-mini',
      prompt,
      temperature: 0.2,
      maxTokens: 500,
      timeoutMs: 30_000,
      maxRetries: 1,
    });

    let parsed: unknown;
    try {
      const clean = response.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error('AI response did not match the expected schema.');
    }

    const validated = healthAdviceSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error('AI response did not match the expected schema.');
    }

    return validated.data;
  },
};