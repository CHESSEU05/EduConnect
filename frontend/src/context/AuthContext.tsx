import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  getCurrentUserRequest,
  loginRequest,
  registerRequest,
} from '../api/auth.api';
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

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
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
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      await refreshCurrentUser();

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
