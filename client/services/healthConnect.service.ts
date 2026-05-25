import { aggregateRecord, getGrantedPermissions, getSdkStatus, initialize, openHealthConnectSettings, requestPermission, } from 'react-native-health-connect';
import { getTodayTimeRange } from '@/utils/healthConnect/dateRange';
import { HealthConnectAvailability, isAndroid, mapHealthConnectAvailability, openHealthConnectInstallPage, } from '@/utils/healthConnect/availability';
import { STEP_READ_PERMISSION, hasStepReadPermission } from '@/utils/healthConnect/permissions';

export type HealthConnectErrorCode =
  | 'unsupported'
  | 'installRequired'
  | 'permissionDenied'
  | 'initializationFailed'
  | 'nativeUnavailable'
  | 'readFailed';

export class HealthConnectServiceError extends Error {
  constructor(
    public readonly code: HealthConnectErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'HealthConnectServiceError';
  }
}

export interface HealthConnectSyncResult {
  steps: number;
  syncedAt: string;
  dataOrigins: string[];
}

const toServiceError = (
  code: HealthConnectErrorCode,
  message: string,
  error?: unknown
): HealthConnectServiceError =>
  error instanceof HealthConnectServiceError ? error : new HealthConnectServiceError(code, message, error);

const ensureAndroid = (): void => {
  if (!isAndroid()) {
    throw new HealthConnectServiceError('unsupported', 'Health Connect фақат Android-да мавжуд.');
  }
};

const checkAvailability = async (): Promise<HealthConnectAvailability> => {
  if (!isAndroid()) return 'unsupported';
  try {
    return mapHealthConnectAvailability(await getSdkStatus());
  } catch (error) {
    console.warn('[HealthConnect] SDK status check failed', error);
    return 'nativeUnavailable';
  }
};

export const healthConnectService = {
  checkAvailability,

  async initializeClient(): Promise<void> {
    ensureAndroid();
    const available = await checkAvailability();
    if (available === 'installRequired') {
      throw new HealthConnectServiceError('installRequired', 'Health Connect ўрнатилган ёки янгиланган бўлиши керак.');
    }
    if (available !== 'available') {
      throw new HealthConnectServiceError('nativeUnavailable', 'Health Connect ички модули мавжуд эмас.');
    }

    try {
      const initialized = await initialize();
      if (!initialized) {
        throw new HealthConnectServiceError('initializationFailed', 'Health Connect инициализация бажарилмади.');
      }
    } catch (error) {
      throw toServiceError('initializationFailed', 'Health Connect инициализация бажарилмади.', error);
    }
  },

  async hasStepPermission(): Promise<boolean> {
    ensureAndroid();
    try {
      return hasStepReadPermission(await getGrantedPermissions());
    } catch (error) {
      throw toServiceError('permissionDenied', 'Health Connect рухсатларини ўқиб бўлмади.', error);
    }
  },

  async requestStepPermission(): Promise<boolean> {
    ensureAndroid();
    try {
      return hasStepReadPermission(await requestPermission([STEP_READ_PERMISSION]));
    } catch (error) {
      throw toServiceError('permissionDenied', 'Health Connect рухсат сўрови бажарилмади.', error);
    }
  },

  async readTodaySteps(): Promise<HealthConnectSyncResult> {
    ensureAndroid();
    try {
      const result = await aggregateRecord({
        recordType: 'Steps',
        timeRangeFilter: {
          operator: 'between',
          ...getTodayTimeRange(),
        },
      });

      return {
        steps: Math.max(0, Math.floor(result.COUNT_TOTAL ?? 0)),
        syncedAt: new Date().toISOString(),
        dataOrigins: result.dataOrigins ?? [],
      };
    } catch (error) {
      throw toServiceError('readFailed', 'Health Connect дан бугунги қадамларни ўқиб бўлмади.', error);
    }
  },

  openSettings(): void {
    if (!isAndroid()) return;
    try {
      openHealthConnectSettings();
    } catch (error) {
      console.warn('[HealthConnect] Unable to open settings', error);
    }
  },

  openInstallPage: openHealthConnectInstallPage,
};
