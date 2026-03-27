// ==========================================
// PROMPTCRAFT ACADEMY - Auth Context
// ==========================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole, ChildProfile, ParentProfile } from '../types';

// ---- Storage Keys ----
const STORAGE_KEYS = {
  USER: '@promptcraft/user',
  AUTH_TOKEN: '@promptcraft/auth_token',
  PARENT_CONSENT: '@promptcraft/parent_consent',
  SAFE_MODE: '@promptcraft/safe_mode',
  HAS_ONBOARDED: '@promptcraft/has_onboarded',
} as const;

// ---- Auth State ----
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  parentConsentGiven: boolean;
  safeMode: boolean;
}

// ---- Signup Params ----
interface SignupParams {
  username: string;
  displayName: string;
  age: number;
  role: UserRole;
  avatar?: string;
  parentEmail?: string;
}

// ---- Login Params ----
interface LoginParams {
  username: string;
  password: string;
}

// ---- Context Value ----
interface AuthContextValue extends AuthState {
  login: (params: LoginParams) => Promise<void>;
  signup: (params: SignupParams) => Promise<void>;
  logout: () => Promise<void>;
  setParentConsent: (granted: boolean) => Promise<void>;
  setSafeMode: (enabled: boolean) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---- Provider ----
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [parentConsentGiven, setParentConsentGiven] = useState(false);
  const [safeMode, setSafeModeState] = useState(true);

  const isAuthenticated = user !== null && token !== null;

  // ---- Hydrate from AsyncStorage on mount ----
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const [
          storedUserVal,
          storedTokenVal,
          storedConsentVal,
          storedSafeModeVal,
          storedOnboardedVal,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.PARENT_CONSENT),
          AsyncStorage.getItem(STORAGE_KEYS.SAFE_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        ]);

        if (!mounted) return;

        if (storedUserVal) setUser(JSON.parse(storedUserVal) as User);
        if (storedTokenVal) setToken(storedTokenVal);
        setParentConsentGiven(storedConsentVal === 'true');
        setSafeModeState(storedSafeModeVal !== 'false');
        setHasOnboarded(storedOnboardedVal === 'true');
      } catch (error) {
        console.error('[AuthContext] Failed to hydrate auth state:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Login ----
  const login = useCallback(async (params: LoginParams) => {
    try {
      // In production this would call a real API.
      // For now we simulate a successful login with a mock user.
      const mockUser: ChildProfile = {
        id: `user_${Date.now()}`,
        username: params.username,
        displayName: params.username,
        avatar: 'robot',
        role: 'child',
        age: 10,
        level: 1,
        xp: 0,
        totalXp: 0,
        streak: 0,
        badges: [],
        promptsCreated: 0,
        projectsCreated: 0,
        parentId: '',
        createdAt: new Date().toISOString(),
      };
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken),
      ]);

      setUser(mockUser);
      setToken(mockToken);
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  }, []);

  // ---- Signup ----
  const signup = useCallback(async (params: SignupParams) => {
    try {
      const newUser: ChildProfile = {
        id: `user_${Date.now()}`,
        username: params.username,
        displayName: params.displayName,
        avatar: params.avatar ?? 'robot',
        role: 'child',
        age: params.age,
        level: 1,
        xp: 0,
        totalXp: 0,
        streak: 0,
        badges: [],
        promptsCreated: 0,
        projectsCreated: 0,
        parentId: '',
        createdAt: new Date().toISOString(),
      };
      const newToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken),
      ]);

      setUser(newUser);
      setToken(newToken);
    } catch (error) {
      console.error('[AuthContext] Signup failed:', error);
      throw error;
    }
  }, []);

  // ---- Logout ----
  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
      throw error;
    }
  }, []);

  // ---- Parent Consent ----
  const setParentConsent = useCallback(async (granted: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.PARENT_CONSENT, String(granted));
    setParentConsentGiven(granted);
  }, []);

  // ---- Safe Mode ----
  const setSafeMode = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SAFE_MODE, String(enabled));
    setSafeModeState(enabled);
  }, []);

  // ---- Complete Onboarding ----
  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true');
    setHasOnboarded(true);
  }, []);

  // ---- Update User ----
  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    },
    [user],
  );

  // ---- Memoised context value ----
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      hasOnboarded,
      parentConsentGiven,
      safeMode,
      login,
      signup,
      logout,
      setParentConsent,
      setSafeMode,
      completeOnboarding,
      updateUser,
    }),
    [
      user,
      token,
      isLoading,
      isAuthenticated,
      hasOnboarded,
      parentConsentGiven,
      safeMode,
      login,
      signup,
      logout,
      setParentConsent,
      setSafeMode,
      completeOnboarding,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---- Hook ----
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
