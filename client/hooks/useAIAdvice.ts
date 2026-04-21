import { useCallback, useState } from 'react';
import {
  AIAdviceInput,
  AIAdviceResponse,
  getAIAdvice,
} from '@/utils/aiAdvice';

const FALLBACK_ADVICE: AIAdviceResponse = {
  status: 'medium',
  summary: 'AI advice is unavailable right now. Your saved steps, food score, BMI, and STZI can still be reviewed in the app.',
  issues: ['AI service unavailable'],
  actions: ['Check your internet connection and try again'],
};

export function useAIAdvice() {
  const [advice, setAdvice] = useState<AIAdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAdvice = useCallback(async (data: AIAdviceInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAIAdvice(data);
      setAdvice(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load AI advice.';
      setError(message);
      setAdvice(FALLBACK_ADVICE);
      return FALLBACK_ADVICE;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    advice,
    loading,
    error,
    loadAdvice,
  };
}
