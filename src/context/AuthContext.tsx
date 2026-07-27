import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
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
  logout: async () => {},
  finishOnboarding: () => {},
});

const TOKEN_KEY = 'agent_session_token';
const USER_KEY = 'agent_user';
const ONBOARDING_KEY = 'agent_onboarding_done';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    loadStoredSession();
  }, []);

  async function loadStoredSession() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        api.setToken(storedToken);
        const { data } = await api.getSession();
        if (data) {
          const userData = { user_id: data.user_id, email: data.email, tenant_id: data.tenant_id };
          setUser(userData);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

          // Check if onboarding already done
          const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_KEY);
          if (!onboardingDone) {
            // Check if user has agents
            const agentsRes = await api.listAgents(data.tenant_id);
            if (!agentsRes.data || agentsRes.data.length === 0) {
              setNeedsOnboarding(true);
            } else {
              await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
            }
          }
        } else {
          api.setToken(null);
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(USER_KEY);
          await SecureStore.deleteItemAsync(ONBOARDING_KEY);
        }
      }
    } catch {
      // Offline or error
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
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

    // Check onboarding
    const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_KEY);
    if (!onboardingDone) {
      const agentsRes = await api.listAgents(data.tenant_id);
      if (!agentsRes.data || agentsRes.data.length === 0) {
        setNeedsOnboarding(true);
      } else {
        await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      }
    }

    return null;
  }, []);

  const signupFn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await api.signup(email, password);
    if (error || !data) {
      return error || 'Erro ao criar conta';
    }
    // After signup, login immediately
    return loginFn(email, password);
  }, [loginFn]);

  const logoutFn = useCallback(async () => {
    await api.logout();
    api.setToken(null);
    setUser(null);
    setNeedsOnboarding(false);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  }, []);

  const finishOnboardingFn = useCallback(async () => {
    setNeedsOnboarding(false);
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
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
