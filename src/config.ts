import { Platform } from 'react-native';

// The Android emulator reaches the host machine via 10.0.2.2; the iOS simulator shares the host's localhost.
const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
