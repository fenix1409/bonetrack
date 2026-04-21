import { getApiBaseUrl, getMissingApiUrlError } from './api';

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

const REQUEST_TIMEOUT_MS = 12_000;

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

export async function getAIAdvice(data: AIAdviceInput, signal: AbortSignal): Promise<AIAdviceResponse> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error(getMissingApiUrlError());
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(json?.error || `Server error: ${response.status}`);
    }

    if (!isAdviceResponse(json)) {
      throw new Error('Invalid AI advice response.');
    }

    return json;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The AI advice request took too long. Please try again.');
    }

    throw error instanceof Error
      ? error
      : new Error('Unable to load AI advice. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}
