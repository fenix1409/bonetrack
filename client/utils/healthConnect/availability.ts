import { Linking, Platform } from 'react-native';
import { SdkAvailabilityStatus } from 'react-native-health-connect';

export type HealthConnectAvailability =
  | 'available'
  | 'installRequired'
  | 'unsupported'
  | 'nativeUnavailable';

const HEALTH_CONNECT_PACKAGE = 'com.google.android.apps.healthdata';
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${HEALTH_CONNECT_PACKAGE}`;
const MARKET_URL = `market://details?id=${HEALTH_CONNECT_PACKAGE}`;

export const isAndroid = (): boolean => Platform.OS === 'android';

export const mapHealthConnectAvailability = (status: number): HealthConnectAvailability => {
  if (!isAndroid()) return 'unsupported';
  if (status === SdkAvailabilityStatus.SDK_AVAILABLE) return 'available';
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    return 'installRequired';
  }
  return 'unsupported';
};

export const openHealthConnectInstallPage = async (): Promise<void> => {
  if (!isAndroid()) return;
  try {
    await Linking.openURL(MARKET_URL);
  } catch {
    await Linking.openURL(PLAY_STORE_URL);
  }
};
