import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '../util/storage';
import * as api from '../api/client';

interface User {
  user_id: string;
  email: string;
  tenant_id: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string) => Promise<string | null>;
  googleLogin: (idToken: string) => Promise<string | null>;
  logout: () => Promise<void>;
  finishOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  needsOnboarding: false,
  login: async () => null,
  signup: async () => null,
  googleLogin: async () => null,
  logout: async () => {},
  finishOnboarding: () => {},
});

const TOKEN_KEY = 'agent_session_token';
const USER_KEY = 'agent_user';
const ONBOARDING_KEY = 'agent_onboarding_done';

async function checkOnboarding(tenantId: string): Promise<boolean> {
  try {
    const onboardRes = await api.getOnboardingStatus(tenantId);
    if (onboardRes.data && onboardRes.data.completed) {
      await storage.set(ONBOARDING_KEY, 'true');
      return false;
    }
    if (!onboardRes.error) return true;
  } catch {}
  // Fallback: check agents
  const agentsRes = await api.listAgents(tenantId);
  if (!agentsRes.data || agentsRes.data.length === 0) return true;
  await storage.set(ONBOARDING_KEY, 'true');
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    loadStoredSession();
  }, []);

  async function loadStoredSession() {
    try {
      const storedToken = await storage.get(TOKEN_KEY);
      if (storedToken) {
        api.setToken(storedToken);

        // Try to restore user from stored data first for instant load
        const storedUser = await storage.getJSON<User>(USER_KEY);
        if (storedUser) {
          setUser(storedUser);
          setIsLoading(false);

          // Validate session in background
          const { data } = await api.getSession();
          if (!data) {
            // Session expired — clear everything
            api.setToken(null);
            setUser(null);
            await storage.remove(TOKEN_KEY);
            await storage.remove(USER_KEY);
            await storage.remove(ONBOARDING_KEY);
            return;
          }
          const userData = { user_id: data.user_id, email: data.email, tenant_id: data.tenant_id };
          setUser(userData);
          await storage.setJSON(USER_KEY, userData);

          // Check onboarding via API
          const onboardingDone = await storage.get(ONBOARDING_KEY);
          if (!onboardingDone) {
            const needsOnboard = await checkOnboarding(storedUser.tenant_id);
            if (needsOnboard) setNeedsOnboarding(true);
          }
          return;
        }

        // No stored user — validate session first
        const { data } = await api.getSession();
        if (data) {
          const userData = { user_id: data.user_id, email: data.email, tenant_id: data.tenant_id };
          setUser(userData);
          await storage.setJSON(USER_KEY, userData);

          const onboardingDone = await storage.get(ONBOARDING_KEY);
          if (!onboardingDone) {
            const needsOnboard = await checkOnboarding(data.tenant_id);
            if (needsOnboard) setNeedsOnboarding(true);
          }
        } else {
          api.setToken(null);
          await storage.remove(TOKEN_KEY);
          await storage.remove(USER_KEY);
          await storage.remove(ONBOARDING_KEY);
        }
      }
    } catch {
      // Network error — if we have a stored user, keep using it
    } finally {
      setIsLoading(false);
    }
  }

  const loginFn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await api.login(email, password);
    if (error || !data) {
      return error || 'Erro ao fazer login';
    }

    const userData = { user_id: data.user.id, email: data.user.email, tenant_id: data.tenant_id };
    setUser(userData);
    await storage.set(TOKEN_KEY, data.token);
    await storage.setJSON(USER_KEY, userData);

    const onboardingDone = await storage.get(ONBOARDING_KEY);
    if (!onboardingDone) {
      const needsOnboard = await checkOnboarding(data.tenant_id);
      if (needsOnboard) setNeedsOnboarding(true);
    }

    return null;
  }, []);

  const signupFn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await api.signup(email, password);
    if (error || !data) {
      return error || 'Erro ao criar conta';
    }
    return loginFn(email, password);
  }, [loginFn]);

  const googleLoginFn = useCallback(async (idToken: string): Promise<string | null> => {
    const { data, error } = await api.googleLogin(idToken);
    if (error || !data) {
      return error || 'Erro ao fazer login com Google';
    }

    const userData = { user_id: data.user.id, email: data.user.email, tenant_id: data.tenant_id };
    setUser(userData);
    await storage.set(TOKEN_KEY, data.token);
    await storage.setJSON(USER_KEY, userData);

    const onboardingDone = await storage.get(ONBOARDING_KEY);
    if (!onboardingDone) {
      const needsOnboard = await checkOnboarding(data.tenant_id);
      if (needsOnboard) setNeedsOnboarding(true);
    }

    return null;
  }, []);

  const logoutFn = useCallback(async () => {
    try { await api.logout(); } catch {}
    api.setToken(null);
    setUser(null);
    setNeedsOnboarding(false);
    await storage.remove(TOKEN_KEY);
    await storage.remove(USER_KEY);
    await storage.remove(ONBOARDING_KEY);
  }, []);

  const finishOnboardingFn = useCallback(async () => {
    setNeedsOnboarding(false);
    await storage.set(ONBOARDING_KEY, 'true');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsOnboarding,
        login: loginFn,
        signup: signupFn,
        googleLogin: googleLoginFn,
        logout: logoutFn,
        finishOnboarding: finishOnboardingFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
