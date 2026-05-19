import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  healthConnectService,
  HealthConnectServiceError,
  HealthConnectSyncResult,
} from '@/services/healthConnect.service';
import type { HealthConnectAvailability } from '@/utils/healthConnect/availability';

export type HealthConnectStatus =
  | 'idle'
  | 'checking'
  | 'permissionRequired'
  | 'syncing'
  | 'synced'
  | 'installRequired'
  | 'unsupported'
  | 'unavailable'
  | 'error';

export interface HealthConnectState {
  status: HealthConnectStatus;
  availability: HealthConnectAvailability | null;
  steps: number | null;
  lastSyncedAt: string | null;
  dataOrigins: string[];
  error: string | null;
}

const initialState: HealthConnectState = {
  status: 'idle',
  availability: null,
  steps: null,
  lastSyncedAt: null,
  dataOrigins: [],
  error: null,
};

const getUnavailableStatus = (availability: HealthConnectAvailability): HealthConnectStatus => {
  if (availability === 'installRequired') return 'installRequired';
  if (availability === 'unsupported') return 'unsupported';
  return 'unavailable';
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof HealthConnectServiceError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Health Connect sync failed.';
};

export function useHealthConnect(autoSync = true) {
  const [state, setState] = useState<HealthConnectState>(initialState);
  const requestIdRef = useRef(0);

  const applySyncResult = useCallback((result: HealthConnectSyncResult) => {
    setState((prev) => ({
      ...prev,
      status: 'synced',
      steps: result.steps,
      lastSyncedAt: result.syncedAt,
      dataOrigins: result.dataOrigins,
      error: null,
    }));
  }, []);

  const refresh = useCallback(async (requestAccess = false) => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, status: 'checking', error: null }));

    try {
      const availability = await healthConnectService.checkAvailability();
      if (requestId !== requestIdRef.current) return;

      if (availability !== 'available') {
        setState((prev) => ({
          ...prev,
          availability,
          status: getUnavailableStatus(availability),
          error: null,
        }));
        return;
      }

      await healthConnectService.initializeClient();
      const hasPermission = requestAccess
        ? await healthConnectService.requestStepPermission()
        : await healthConnectService.hasStepPermission();

      if (!hasPermission) {
        setState((prev) => ({
          ...prev,
          availability,
          status: 'permissionRequired',
          error: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, availability, status: 'syncing', error: null }));
      const result = await healthConnectService.readTodaySteps();
      if (requestId === requestIdRef.current) applySyncResult(result);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const code = error instanceof HealthConnectServiceError ? error.code : 'readFailed';
      setState((prev) => ({
        ...prev,
        status: code === 'permissionDenied' ? 'permissionRequired' : 'error',
        error: getErrorMessage(error),
      }));
    }
  }, [applySyncResult]);

  const connect = useCallback(() => refresh(true), [refresh]);
  const sync = useCallback(() => refresh(false), [refresh]);

  useEffect(() => {
    if (autoSync) void refresh(false);
  }, [autoSync, refresh]);

  useEffect(() => {
    const onChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && autoSync && state.status !== 'checking' && state.status !== 'syncing') {
        void refresh(false);
      }
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [autoSync, refresh, state.status]);

  return {
    ...state,
    connect,
    sync,
    openSettings: healthConnectService.openSettings,
    openInstallPage: healthConnectService.openInstallPage,
  };
}

export type HealthConnectController = ReturnType<typeof useHealthConnect>;
