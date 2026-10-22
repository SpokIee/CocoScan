/**
 * Thin persistence helpers.
 *  - SecureStore for the auth token (encrypted on device).
 *  - AsyncStorage for non-sensitive JSON documents (demo users, scans, updates).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'cocoscan.auth.token';
const USER_KEY = 'cocoscan.auth.user';

export const secure = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY);
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.setItem(TOKEN_KEY, token);
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken(): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(TOKEN_KEY);
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export const cachedUser = {
  key: USER_KEY,
};

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
