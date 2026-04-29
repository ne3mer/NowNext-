import { Platform } from 'react-native';

const ANDROID_LOCALHOST = '10.0.2.2';
const IOS_LOCALHOST = '127.0.0.1';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://${ANDROID_LOCALHOST}:5000/api`
    : `http://${IOS_LOCALHOST}:5000/api`;
