import { useCallback, useRef, useState } from 'react';
import {
  AIAdviceInput,
  AIAdviceResponse,
  getAIAdvice,
} from '@/utils/aiAdvice';

const TIMEOUT_MS = 15_000;

const adviceCache = new Map<string, AIAdviceResponse>();

function getCacheKey(data: AIAdviceInput): string {
  return JSON.stringify({ ...data, bmi: +data.bmi.toFixed(1) });
}

export function useAIAdvice() {
  const [advice, setAdvice]   = useState<AIAdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadAdvice = useCallback(async (data: AIAdviceInput) => {
    const cacheKey = getCacheKey(data);

    const cached = adviceCache.get(cacheKey);
    if (cached) {
      setAdvice(cached);
      setError(null);
      return cached;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    setLoading(true);
    setError(null);

    try {
      const result = await getAIAdvice(data, controller.signal);

      if (controller.signal.aborted) return null;

      adviceCache.set(cacheKey, result);
      setAdvice(result);
      setError(null);
      return result;
    } catch (err) {
      if (controller.signal.aborted) return null;

      const isTimeout = (err as Error).name === 'AbortError';
      const message = isTimeout
        ? 'So\'rov vaqti tugadi. Qayta urinib ko\'ring.'
        : err instanceof Error
          ? err.message
          : 'Unable to load AI advice.';

      setError(message);
      return null;
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setAdvice(null);
    setError(null);
    setLoading(false);
  }, []);

  const clearCache = useCallback(() => {
    adviceCache.clear();
  }, []);

  return { advice, loading, error, loadAdvice, reset, clearCache };
}