import { getApiBaseUrl, getMissingApiUrlError } from './api';
import {
  BMI_MAX,
  BMI_MIN,
  FOOD_SCORE_MAX,
  FOOD_SCORE_MIN,
  STEPS_MAX,
  STEPS_MIN,
  STZI_MAX,
  STZI_MIN,
  clamp,
} from './stzi-system';

export type AIAdviceInput = {
  steps: number;
  foodScore: number;
  bmi: number;
  stzi: number;
};

export type AIAdviceStatus = 'low' | 'medium' | 'good';

export type AIAdviceResponse = {
  status: AIAdviceStatus;
  summary: string;
  issues: string[];
  actions: string[];
};

const REQUEST_TIMEOUT_MS = 40_000;

const combineAbortSignals = (signals: AbortSignal[]) => {
  const controller = new AbortController();

  const abort = () => controller.abort();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }

    signal.addEventListener('abort', abort, { once: true });
  }

  return controller.signal;
};

const isAdviceResponse = (value: unknown): value is AIAdviceResponse => {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<AIAdviceResponse>;

  return (
    (data.status === 'low' || data.status === 'medium' || data.status === 'good') &&
    typeof data.summary === 'string' &&
    Array.isArray(data.issues) &&
    data.issues.length <= 3 &&
    data.issues.every((item) => typeof item === 'string') &&
    Array.isArray(data.actions) &&
    data.actions.length <= 4 &&
    data.actions.every((item) => typeof item === 'string')
  );
};

export async function getAIAdvice(
  data: AIAdviceInput,
  signal?: AbortSignal
): Promise<AIAdviceResponse> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error(getMissingApiUrlError());
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const combinedSignal = combineAbortSignals([
    timeoutController.signal,
    ...(signal ? [signal] : []),
  ]);

  const normalizedData: AIAdviceInput = {
    steps: clamp(Math.floor(data.steps), STEPS_MIN, STEPS_MAX),
    foodScore: clamp(data.foodScore, FOOD_SCORE_MIN, FOOD_SCORE_MAX),
    bmi: clamp(data.bmi, BMI_MIN, BMI_MAX),
    stzi: clamp(data.stzi, STZI_MIN, STZI_MAX),
  };

  try {
    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedData),
      signal: combinedSignal,
    });

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new Error('Сервер жавоби JSON ўлчамида эмас.');
    }

    if (!response.ok) {
      const errorMsg =
        typeof json === 'object' && json !== null && 'error' in json
          ? (json as { error?: string }).error
          : `Сервер хатолиги: ${response.status}`;
      throw new Error(errorMsg);
    }

    if (!isAdviceResponse(json)) {
      console.warn('Invalid AI response structure:', json);
      throw new Error('Нотўғри AI маслаҳати жавоби. Қайта уриннг.');
    }

    return json;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const isTimeout =
        timeoutController.signal.aborted &&
        !signal?.aborted;

      throw new Error(
        isTimeout
          ? 'AI маслаҳати сўрови жуда узоқ вақт олди. Қайта уриннг.'
          : 'AI маслаҳати сўрови бекор қилинди.'
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('AI маслаҳатини юклаб бўлмади. Қайта уриннг.');
  } finally {
    clearTimeout(timeoutId);
  }
}
