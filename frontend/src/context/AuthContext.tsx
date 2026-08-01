import {
  type PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { AuthContext, type AuthContextValue } from './auth-context';
import type { AuthUser, LoginPlaceholderInput } from '../types/auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback((input: LoginPlaceholderInput): void => {
    setUser(input.user);
    setAccessToken(input.accessToken);
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      role: user?.role ?? null,
      login,
      logout,
    }),
    [accessToken, isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
