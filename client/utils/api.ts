import { Platform } from 'react-native';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }

  return null;
};

export const getMissingApiUrlError = () =>
  'Server URL is not configured. Set EXPO_PUBLIC_API_URL for production builds.';
