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
// Inline storage — no native modules, works on web and mobile
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k: string) => { try { localStorage.removeItem(k); } catch {} },
};
import type { User, UserRole, ChildProfile } from '../types';
import { api } from '../services/api';

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
  // Child info
  username: string;
  displayName: string;
  age: number;
  role: UserRole;
  avatar?: string;
  // Parent info (required for real signup)
  parentEmail?: string;
  parentName?: string;
  password?: string;
  parentPin?: string;
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
        const storedUserVal     = store.get(STORAGE_KEYS.USER);
        const storedTokenVal    = store.get(STORAGE_KEYS.AUTH_TOKEN);
        const storedConsentVal  = store.get(STORAGE_KEYS.PARENT_CONSENT);
        const storedSafeModeVal = store.get(STORAGE_KEYS.SAFE_MODE);
        const storedOnboardedVal = store.get(STORAGE_KEYS.HAS_ONBOARDED);

        if (!mounted) return;

        if (storedUserVal) setUser(JSON.parse(storedUserVal) as User);
        if (storedTokenVal) {
          setToken(storedTokenVal);
          api.setAuthToken(storedTokenVal);
          // Ping streak once per app open (fire-and-forget)
          api.streakPing().catch(() => {});
        }
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
    // Detect child (username + PIN) vs parent (email + password) by presence of @
    const isParent = params.username.includes('@');
    const result = isParent
      ? await api.authLogin({ email: params.username, password: params.password })
      : await api.authChildLogin({ username: params.username, pin: params.password });

    api.setAuthToken(result.token);
    const userData = { ...result.user, avatar: (result.user as any).avatar ?? 'robot' };
    store.set(STORAGE_KEYS.USER, JSON.stringify(userData));
    store.set(STORAGE_KEYS.AUTH_TOKEN, result.token);
    setUser(userData as User);
    setToken(result.token);
    // Ping streak on every login (fire-and-forget)
    api.streakPing().catch(() => {});
  }, []);

  // ---- Signup ----
  // 3-step flow: create parent account → create child profile → child login
  const signup = useCallback(async (params: SignupParams) => {
    if (!params.parentEmail || !params.password || !params.parentPin) {
      throw new Error('Missing parent credentials');
    }

    // Step 1: Create parent account
    const parentUsername = (params.parentEmail.split('@')[0] + Date.now())
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);

    const parentResult = await api.authSignup({
      email: params.parentEmail,
      password: params.password,
      username: parentUsername,
      displayName: params.parentName ?? params.parentEmail.split('@')[0],
      role: 'parent',
    });

    // Step 2: Create child profile (requires parent token)
    api.setAuthToken(parentResult.token);
    await api.authParentConsent({
      childUsername: params.username,
      childDisplayName: params.displayName,
      childAge: params.age,
      pin: params.parentPin,
      consentGiven: true,
    });

    // Step 3: Log in as child to get child token
    const childResult = await api.authChildLogin({
      username: params.username,
      pin: params.parentPin,
    });

    api.setAuthToken(childResult.token);
    const childUser = {
      ...childResult.user,
      avatar: params.avatar ?? 'robot',
      level: 1, xp: 0, totalXp: 0, streak: 0, badges: [],
      promptsCreated: 0, projectsCreated: 0,
      createdAt: new Date().toISOString(),
    };

    store.set(STORAGE_KEYS.USER, JSON.stringify(childUser));
    store.set(STORAGE_KEYS.AUTH_TOKEN, childResult.token);
    setUser(childUser as User);
    setToken(childResult.token);
  }, []);

  // ---- Logout ----
  const logout = useCallback(async () => {
    store.del(STORAGE_KEYS.USER);
    store.del(STORAGE_KEYS.AUTH_TOKEN);
    api.clearAuthToken();
    setUser(null);
    setToken(null);
  }, []);

  // ---- Parent Consent ----
  const setParentConsent = useCallback(async (granted: boolean) => {
    store.set(STORAGE_KEYS.PARENT_CONSENT, String(granted));
    setParentConsentGiven(granted);
  }, []);

  // ---- Safe Mode ----
  const setSafeMode = useCallback(async (enabled: boolean) => {
    store.set(STORAGE_KEYS.SAFE_MODE, String(enabled));
    setSafeModeState(enabled);
  }, []);

  // ---- Complete Onboarding ----
  const completeOnboarding = useCallback(async () => {
    store.set(STORAGE_KEYS.HAS_ONBOARDED, 'true');
    setHasOnboarded(true);
  }, []);

  // ---- Update User ----
  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      store.set(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
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
