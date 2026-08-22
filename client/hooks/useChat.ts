import { useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useHistory, useProfile } from '@/store/useBoneStore';
import { calculateBMI } from '@/utils/calculations';
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
} from '@/utils/stzi-system';
import { getApiBaseUrl, getMissingApiUrlError } from '@/utils/api';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isError?: boolean;
}

const generateId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const generateUuid = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    const hex = char === 'x' ? value : (value & 0x3) | 0x8;
    return hex.toString(16);
  });
};

const TIMEOUT_MS = 40_000;

/**
 * Module-level so the id survives the screen unmounting (tab switches), which
 * is what keeps server-side conversation history addressable across the
 * session. A cold app start intentionally begins a fresh conversation.
 */
let sessionConversationId: string | null = null;

const getConversationId = () => {
  sessionConversationId ??= generateUuid();
  return sessionConversationId;
};

export function useChat() {
  const profile = useProfile();
  const history = useHistory();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Ассалому алайкум! Мен сизнинг суяк саломатлиги бўйича ёрдамчингизман. Қандай саволларингиз бор?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationId = useRef(getConversationId());
  const lastUserText = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const sendRequest = useCallback(async (text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    setLoading(true);
    setError(null);

    const latestLog = history[0];
    const bmi = profile ? calculateBMI(profile.height, profile.weight) : 0;

    // Ranges come from the score generators, never re-typed as literals: the
    // previous hardcoded [-3, 10] / [0, 5] silently truncated a good diet and
    // told the model a top-band STZI of 1.8 was mid-scale.
    const normalizedHealthContext = {
      steps: clamp(latestLog?.steps ?? 0, STEPS_MIN, STEPS_MAX),
      foodScore: clamp(latestLog?.foodScore ?? 0, FOOD_SCORE_MIN, FOOD_SCORE_MAX),
      bmi: clamp(bmi, BMI_MIN, BMI_MAX),
      stzi: clamp(latestLog?.stzi ?? 0, STZI_MIN, STZI_MAX),
    };

    const apiBaseUrl = getApiBaseUrl();

    try {
      if (!apiBaseUrl) {
        throw new Error(getMissingApiUrlError());
      }

      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          conversationId: conversationId.current,
          healthContext: normalizedHealthContext,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `Server error: ${response.status}`);
      }

      if (!data || typeof data.message !== 'string') {
        throw new Error('Invalid chat response.');
      }

      const botMessage: Message = {
        id: generateId(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('So\'rov vaqti tugadi. Qayta urinib ko\'ring.');
      } else {
        setError((err as Error).message || 'Сервер билан боғланишда хатолик юз берди.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [history, profile]);

  const sendMessage = useCallback(
    async (input: string) => {
      const text = input.trim();
      if (!text || loading) return;

      lastUserText.current = text;

      const userMessage: Message = {
        id: generateId(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await sendRequest(text);
    },
    [loading, sendRequest]
  );

  const retry = useCallback(() => {
    if (!lastUserText.current || loading) return;
    sendRequest(lastUserText.current);
  }, [loading, sendRequest]);

  return { messages, loading, error, sendMessage, retry };
}
