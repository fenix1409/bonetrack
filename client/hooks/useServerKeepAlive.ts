import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getApiBaseUrl } from '@/utils/api';

const PING_INTERVAL_MS = 10 * 60 * 1000;
const PING_TIMEOUT_MS = 5_000;

/**
 * Keeps a free-tier API host warm, but only while the app is actually in the
 * foreground and online.
 *
 * The previous implementation installed a bare `setInterval` at root mount and
 * never cleared it, so it kept firing while backgrounded and while offline —
 * burning radio wake-ups on a request that could not succeed. On a health app
 * people leave open all day that is a measurable battery and mobile-data cost.
 */
export function useServerKeepAlive() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnlineRef = useRef(true);

  useEffect(() => {
    const ping = () => {
      // Cheap guards first: never spend a request we know will fail.
      if (!isOnlineRef.current) return;

      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

      fetch(`${apiBaseUrl}/health`, { method: 'GET', signal: controller.signal })
        .catch(() => {
          if (__DEV__) console.log('[KeepAlive] Ping failed');
        })
        .finally(() => clearTimeout(timeoutId));
    };

    const start = () => {
      if (timerRef.current) return;
      ping();
      timerRef.current = setInterval(ping, PING_INTERVAL_MS);
    };

    const stop = () => {
      if (!timerRef.current) return;
      clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      const wasOffline = !isOnlineRef.current;
      isOnlineRef.current = isOnline;

      // Coming back online while foregrounded: ping immediately rather than
      // waiting out the rest of the interval.
      if (isOnline && wasOffline && AppState.currentState === 'active') ping();
    });

    const onAppStateChange = (next: AppStateStatus) => {
      if (next === 'active') start();
      else stop();
    };

    const appStateSub = AppState.addEventListener('change', onAppStateChange);
    if (AppState.currentState === 'active') start();

    return () => {
      stop();
      appStateSub.remove();
      unsubscribeNetInfo();
    };
  }, []);
}
