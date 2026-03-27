// Cross-platform storage — localStorage on web, AsyncStorage on mobile
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    const AS = await import('@react-native-async-storage/async-storage');
    return AS.default.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    const AS = await import('@react-native-async-storage/async-storage');
    return AS.default.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    const AS = await import('@react-native-async-storage/async-storage');
    return AS.default.removeItem(key);
  },
};
