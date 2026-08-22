import OpenAI from 'openai';
import type { ChatTurn } from '../repositories/conversation.repository';

type GenerateTextOptions = {
  model?: string;
  prompt: string;
  instructions?: string;
  /** Prior turns, oldest first. Sent before `prompt` so the model has context. */
  history?: ChatTurn[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Total number of attempts, not additional retries. Minimum 1. */
  maxAttempts?: number;
  cacheKey?: string;
  /** Ask the model for a JSON object (OpenAI `response_format`). */
  jsonMode?: boolean;
  /**
   * Called with the raw completion before it is cached or returned. Returning
   * false discards the completion, triggers another attempt, and prevents an
   * unusable response from being cached for the whole TTL.
   */
  validate?: (text: string) => boolean;
};

type GenerateTextResult = {
  id: string;
  text: string;
  cached?: boolean;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_SIZE = 500;

const cache = new Map<string, { text: string; createdAt: number }>();

function getCacheKey(
  prompt: string,
  instructions?: string,
  history?: ChatTurn[]
): string {
  // History must be part of the key: the same question asked at two different
  // points in a conversation is a different request and deserves its own entry.
  const historyKey = (history ?? [])
    .map((turn) => `${turn.role}:${turn.content}`)
    .join('|');

  const combined = `${prompt}|${instructions || ''}|${historyKey}`;
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
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { text, createdAt: Date.now() });
}

function createTimeoutError(timeoutMs: number): Error {
  const error = new Error(`Request timeout after ${timeoutMs}ms`);
  error.name = 'TimeoutError';
  return error;
}

const getOpenAIClient = (() => {
  let client: OpenAI | null = null;
  return () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    client ??= new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 0,
      timeout: 30_000,
    });
    return client;
  };
})();

/** Runs `fn` up to `maxAttempts` times (so `maxAttempts: 1` means no retry). */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  const attempts = Math.max(1, maxAttempts);
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = i === attempts - 1;
      if (isLastAttempt) break;

      const delayMs = baseDelayMs * Math.pow(2, i);
      console.warn(`[LLM] Attempt ${i + 1}/${attempts} failed, retrying in ${delayMs}ms`, err);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  throw lastError;
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
        throw createTimeoutError(timeoutMs);
      }
      throw err;
    });
}

export const llmClient = {
  async generateText({
    model = 'gpt-4.1-mini',
    prompt,
    instructions,
    history,
    temperature = 0.2,
    maxTokens = 500,
    timeoutMs = 30_000,
    maxAttempts = 1,
    cacheKey: userCacheKey,
    jsonMode = false,
    validate,
  }: GenerateTextOptions): Promise<GenerateTextResult> {
    const cacheKey = userCacheKey || getCacheKey(prompt, instructions, history);
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
                ...(history ?? []).map((turn) => ({
                  role: turn.role,
                  content: turn.content,
                })),
                { role: 'user' as const, content: prompt },
              ],
              temperature,
              max_tokens: maxTokens,
              stream: false,
              ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
            },
            { signal, timeout: timeoutMs }
          );

          const content = response.choices[0]?.message?.content?.trim();

          if (!content) {
            throw new Error('Empty response from OpenAI');
          }

          // Validate before the result escapes the retry loop, so an unusable
          // completion is resampled instead of being cached for the full TTL.
          if (validate && !validate(content)) {
            throw new Error('OpenAI response failed caller validation');
          }

          return content;
        }, timeoutMs),
      maxAttempts,
      1000
    );

    setInCache(cacheKey, text);

    return {
      id: 'openai-' + Date.now(),
      text,
      cached: false,
    };
  },

  getCacheStats() {
    return {
      size: cache.size,
      maxSize: CACHE_MAX_SIZE,
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