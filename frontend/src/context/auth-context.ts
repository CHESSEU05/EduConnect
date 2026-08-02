import { createContext } from 'react';

import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import type { UserRole } from '../types/user';

export type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (input: LoginRequest) => Promise<AuthUser>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<AuthUser | null>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
