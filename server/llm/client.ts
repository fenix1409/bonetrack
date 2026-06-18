import OpenAI from 'openai';
import { Ollama } from 'ollama';
import summarizePrompt from '../llm/prompts/summarize-reviews.txt';

type GenerateTextOptions = {
  model?: string;
  prompt: string;
  instructions?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  cacheKey?: string;        
};

type GenerateTextResult = {
  id: string;
  text: string;
  cached?: boolean;            
};

const cache = new Map<string, { text: string; createdAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; 

function getCacheKey(prompt: string, instructions?: string): string {
  const combined = `${prompt}|${instructions || ''}`;
  return Buffer.from(combined).toString('base64');
}

function getFromCache(key: string): string | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return cached.text;
}

function setInCache(key: string, text: string): void {
  cache.set(key, { text, createdAt: Date.now() });
}

const getOpenAIClient = (() => {
  let client: OpenAI | null = null;
  return () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    client ??= new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,                    
      timeout: 30_000,                  
    });
    return client;
  };
})();

const ollamaClient = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});


async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLastRetry = i === maxRetries - 1;
      if (isLastRetry) throw err;

      const delayMs = baseDelayMs * Math.pow(2, i);
      console.warn(`[LLM] Retry ${i + 1}/${maxRetries} after ${delayMs}ms`, err);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Max retries exceeded');
}

function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fn(controller.signal)
    .finally(() => clearTimeout(timer))
    .catch((err) => {
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw err;
    });
}

export const llmClient = {
  async generateText({
    model = 'gpt-4.1-mini',
    prompt,
    instructions,
    temperature = 0.2,
    maxTokens = 500,
    timeoutMs = 15_000,
    cacheKey: userCacheKey,
  }: GenerateTextOptions): Promise<GenerateTextResult> {
    const cacheKey = userCacheKey || getCacheKey(prompt, instructions);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return {
        id: 'cached',
        text: cached,
        cached: true,
      };
    }

    const text = await retryWithBackoff(
      () =>
        withTimeout(async (signal) => {
          const response = await getOpenAIClient().chat.completions.create(
            {
              model,
              messages: [
                ...(instructions
                  ? [{ role: 'system' as const, content: instructions }]
                  : []),
                { role: 'user' as const, content: prompt },
              ],
              temperature,
              max_tokens: maxTokens,
              stream: false,
            },
            { signal, timeout: timeoutMs }
          );

          const content = response.choices[0]?.message?.content?.trim();

          if (!content) {
            throw new Error('Empty response from OpenAI');
          }

          return content;
        }, timeoutMs),
      3,          
      1000        
    );

    setInCache(cacheKey, text);

    return {
      id: 'openai-' + Date.now(),
      text,
      cached: false,
    };
  },

  async summarizeReviews(reviews: string): Promise<string> {
    const cacheKey = getCacheKey('summarize', reviews.substring(0, 100));
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const text = await retryWithBackoff(
      () =>
        withTimeout(async (signal) => {
          const response = await ollamaClient.chat({
            model: 'tinyllama',
            messages: [
              { role: 'system', content: summarizePrompt },
              { role: 'user', content: reviews },
            ],
            options: {
              num_predict: 300,
              temperature: 0.3,          
            },
            stream: false,
          });

          const content = response.message?.content?.trim();

          if (!content) {
            throw new Error('Empty response from Ollama');
          }

          return content;
        }, 30_000),
      2,
      2000
    );

    setInCache(cacheKey, text);

    return text;
  },

  getCacheStats() {
    return {
      size: cache.size,
      entries: Array.from(cache.entries()).map(([key, value]) => ({
        key: key.substring(0, 20) + '...',
        age: Date.now() - value.createdAt,
      })),
    };
  },

  clearCache() {
    cache.clear();
  },
};