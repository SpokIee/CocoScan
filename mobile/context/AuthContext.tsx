import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '@/services';
import { setAuthToken } from '@/services/api/client';
import { IS_DEMO } from '@/services/config';
import { setDemoUser, userIdFromDemoToken } from '@/services/demo';
import { readJson, removeKey, secure, writeJson, cachedUser } from '@/services/storage';
import type { AuthSession, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** true while the stored session is being restored on cold start */
  isRestoring: boolean;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string, name?: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(session: AuthSession | null): void {
  setAuthToken(session?.token ?? null);
  if (IS_DEMO) setDemoUser(session ? (userIdFromDemoToken(session.token) ?? session.user.id) : null);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setRestoring] = useState(true);

  // Restore a persisted session on app start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedToken = await secure.getToken();
        if (!storedToken) return;
        const storedUser = await readJson<User | null>(cachedUser.key, null);
        applySession(storedUser ? { token: storedToken, user: storedUser } : null);
        let freshUser = storedUser;
        try {
          freshUser = await authService.me(storedToken);
          await writeJson(cachedUser.key, freshUser);
        } catch (e) {
          // Network failure: keep cached user. Auth failure: drop the session.
          const code = (e as { code?: string }).code;
          if (code === 'auth') {
            await secure.clearToken();
            await removeKey(cachedUser.key);
            applySession(null);
            freshUser = null;
          }
        }
        if (!cancelled && freshUser) {
          applySession({ token: storedToken, user: freshUser });
          setToken(storedToken);
          setUser(freshUser);
        }
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (session: AuthSession) => {
    applySession(session);
    await secure.setToken(session.token);
    await writeJson(cachedUser.key, session.user);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authService.login(email.trim(), password);
      await persist(session);
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const session = await authService.register(email.trim(), password, name);
      await persist(session);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    const current = token;
    setUser(null);
    setToken(null);
    applySession(null);
    await secure.clearToken();
    await removeKey(cachedUser.key);
    if (current) await authService.logout(current);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isRestoring, isAuthenticated: !!user && !!token, login, register, logout }),
    [user, token, isRestoring, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
