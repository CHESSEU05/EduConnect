import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  getCurrentUserRequest,
  loginRequest,
  registerRequest,
} from '../api/auth.api';
import { ApiClientError } from '../api/client';
import { PageLoader } from '../components/feedback/PageLoader';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import {
  clearStoredAuth,
  readAccessToken,
  readStoredUser,
  writeAccessToken,
  writeStoredUser,
} from '../utils/storage';
import { AuthContext, type AuthContextValue } from './auth-context';

const SESSION_REFRESH_COOLDOWN_MS = 30_000;

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastAutomaticRefreshAtRef = useRef(0);
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    readAccessToken(),
  );
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback((): void => {
    setUser(null);
    setAccessToken(null);
    clearStoredAuth();
  }, []);

  const refreshCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    const storedToken = readAccessToken();

    if (!storedToken) {
      clearSession();
      return null;
    }

    setAccessToken(storedToken);

    try {
      const currentUser = await getCurrentUserRequest();
      setUser(currentUser);
      writeStoredUser(currentUser);
      return currentUser;
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearSession();
        return null;
      }

      return readStoredUser();
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      await refreshCurrentUser();
      lastAutomaticRefreshAtRef.current = Date.now();

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [refreshCurrentUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();

      if (!['/login', '/register', '/unauthorized'].includes(location.pathname)) {
        navigate('/login', { replace: true, state: { from: location } });
      }
    };

    window.addEventListener('educonnect:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('educonnect:unauthorized', handleUnauthorized);
    };
  }, [clearSession, location, navigate]);

  useEffect(() => {
    const refreshIfAuthenticated = () => {
      if (!readAccessToken()) {
        return;
      }

      const now = Date.now();

      if (now - lastAutomaticRefreshAtRef.current < SESSION_REFRESH_COOLDOWN_MS) {
        return;
      }

      lastAutomaticRefreshAtRef.current = now;
      void refreshCurrentUser();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshIfAuthenticated();
      }
    };

    window.addEventListener('focus', refreshIfAuthenticated);
    window.addEventListener('storage', refreshIfAuthenticated);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshIfAuthenticated);
      window.removeEventListener('storage', refreshIfAuthenticated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCurrentUser]);

  const login = useCallback(async (input: LoginRequest): Promise<AuthUser> => {
    const data = await loginRequest(input);
    setUser(data.user);
    setAccessToken(data.accessToken);
    writeAccessToken(data.accessToken);
    writeStoredUser(data.user);

    return data.user;
  }, []);

  const register = useCallback(async (input: RegisterRequest): Promise<void> => {
    await registerRequest(input);
  }, []);

  const logout = useCallback((): void => {
    clearSession();
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      role: user?.role ?? null,
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [accessToken, isLoading, login, logout, refreshCurrentUser, register, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <PageLoader message="Restoring your EduConnect session" /> : children}
    </AuthContext.Provider>
  );
}
