// Cross-platform key-value storage
// Uses localStorage on web, AsyncStorage on native.
// Safe to import anywhere — native module is never loaded on web.

type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

// Detect web at module load time (no imports needed)
const IS_WEB = typeof localStorage !== 'undefined';

const webStore: Storage = {
  getItem:    async (key) => { try { return localStorage.getItem(key); }    catch { return null; } },
  setItem:    async (key, val) => { try { localStorage.setItem(key, val); } catch {} },
  removeItem: async (key) => { try { localStorage.removeItem(key); }        catch {} },
};

// Lazy native store — only resolved on first call on a native platform
let _native: Storage | null = null;
const nativeStore: Storage = {
  getItem:    async (key) => { const s = await getNative(); return s.getItem(key); },
  setItem:    async (key, val) => { const s = await getNative(); return s.setItem(key, val); },
  removeItem: async (key) => { const s = await getNative(); return s.removeItem(key); },
};

async function getNative(): Promise<Storage> {
  if (_native) return _native;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AS = require('@react-native-async-storage/async-storage').default;
  _native = {
    getItem:    (key) => AS.getItem(key),
    setItem:    (key, val) => AS.setItem(key, val),
    removeItem: (key) => AS.removeItem(key),
  };
  return _native;
}

export const storage: Storage = IS_WEB ? webStore : nativeStore;
