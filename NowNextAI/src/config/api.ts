import { Platform } from 'react-native';

const ANDROID_LOCALHOST = '10.0.2.2';
const IOS_LOCALHOST = '127.0.0.1';
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function normalizeBaseUrl(rawUrl: string): string {
  const withoutSlash = rawUrl.replace(/\/+$/, '');
  if (withoutSlash.endsWith('/api')) {
    return withoutSlash;
  }
  return `${withoutSlash}/api`;
}

export const API_BASE_URL =
  configuredBaseUrl && configuredBaseUrl.length > 0
    ? normalizeBaseUrl(configuredBaseUrl)
    : Platform.OS === 'android'
      ? `http://${ANDROID_LOCALHOST}:5000/api`
      : `http://${IOS_LOCALHOST}:5000/api`;
