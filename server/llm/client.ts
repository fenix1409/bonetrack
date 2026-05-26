import OpenAI from 'openai';
import { Ollama } from 'ollama';
import summarizePrompt from '../llm/prompts/summarize-reviews.txt';

// ─── Clients ─────────────────────────────────────────────────────────────────

const getOpenAIClient = (() => {
  let client: OpenAI | null = null;
  return () => {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
    client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return client;
  };
})();

const ollamaClient = new Ollama();

type GenerateTextOptions = {
  model?:        string;
  prompt:        string;
  instructions?: string;
  temperature?:  number;
  maxTokens?:    number;
  timeoutMs?:    number;
};

type GenerateTextResult = {
  id:   string;
  text: string;
};

function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fn(controller.signal).finally(() => clearTimeout(timer));
}

export const llmClient = {
  async generateText({
    model       = 'gpt-4o-mini',
    prompt,
    instructions,
    temperature = 0.2,
    maxTokens   = 500,
    timeoutMs   = 15_000,
  }: GenerateTextOptions): Promise<GenerateTextResult> {
    return withTimeout(async (signal) => {
      const response = await getOpenAIClient().chat.completions.create(
        {
          model,
          messages: [
            ...(instructions ? [{ role: 'system' as const, content: instructions }] : []),
            { role: 'user' as const, content: prompt },
          ],
          temperature,
          max_tokens:  maxTokens,
          stream: false,
        },
        { signal, timeout: timeoutMs }
      );

      const text = response.choices[0]?.message?.content?.trim() ?? '';

      if (!text) throw new Error('Empty response from LLM');

      return { id: response.id, text };
    }, timeoutMs);
  },

  async summarizeReviews(reviews: string): Promise<string> {
    return withTimeout(async (signal) => {
      const response = await ollamaClient.chat({
        model: 'tinyllama',
        messages: [
          { role: 'system', content: summarizePrompt },
          { role: 'user',   content: reviews },
        ],
        options: { num_predict: 300 },
      });

      return response.message.content?.trim() ?? '';
    }, 20_000); 
  },
};