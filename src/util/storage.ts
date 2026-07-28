import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore doesn't persist across F5 on web.
// On web we use AsyncStorage (localStorage-based) for everything.
// On native we use SecureStore for tokens and AsyncStorage for app data.

const isWeb = Platform.OS === 'web';

export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      }
      // Try SecureStore first (only available on native)
      const val = await SecureStore.getItemAsync(key);
      if (val !== null) return val;
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch {
      return AsyncStorage.getItem(key);
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
        return;
      }
      // On native, try SecureStore first. If it fails (e.g. value too large), use AsyncStorage
      try {
        await SecureStore.setItemAsync(key, value);
      } catch {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
      await AsyncStorage.removeItem(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  async setJSON(key: string, value: any): Promise<void> {
    await this.set(key, JSON.stringify(value));
  },
};
