import { useCallback, useEffect, useRef, useState } from 'react';
import type { AIAdviceInput, AIAdviceResponse } from '@/utils/aiAdvice';
import { getAIAdvice } from '@/utils/aiAdvice';

class CacheWithTTL<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

const adviceCache = new CacheWithTTL<AIAdviceResponse>(60 * 60 * 1000);

function getCacheKey(data: AIAdviceInput): string {
  return JSON.stringify({
    steps: Math.floor(data.steps),
    foodScore: Math.round(data.foodScore * 10) / 10,
    bmi: Math.round(data.bmi * 10) / 10,
    stzi: Math.round(data.stzi * 100) / 100,
  });
}

export interface UseAIAdviceReturn {
  advice: AIAdviceResponse | null;
  loading: boolean;
  error: string | null;
  loadAdvice: (data: AIAdviceInput) => Promise<AIAdviceResponse | null>;
  reset: () => void;
  clearCache: () => void;
}

export function useAIAdvice(): UseAIAdviceReturn {
  const [advice, setAdvice] = useState<AIAdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<symbol | null>(null);

  const loadAdvice = useCallback(async (data: AIAdviceInput) => {
    const cacheKey = getCacheKey(data);
    const cached = adviceCache.get(cacheKey);
    if (cached) {
      setAdvice(cached);
      setError(null);
      setLoading(false);
      return cached;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = Symbol();
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const result = await getAIAdvice(data, controller.signal);

      if (controller.signal.aborted || requestIdRef.current !== requestId) {
        return null;
      }

      adviceCache.set(cacheKey, result);
      setAdvice(result);
      setError(null);

      return result;
    } catch (err) {
      if (controller.signal.aborted || requestIdRef.current !== requestId) {
        return null;
      }
      const message =
        err instanceof Error
          ? err.message
          : 'AI maslahatini yuklab bolmadi. Qayta urinib koʻring.';

      setError(message);
      return null;
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
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

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { advice, loading, error, loadAdvice, reset, clearCache, };
}