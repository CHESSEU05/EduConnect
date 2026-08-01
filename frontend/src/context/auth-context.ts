import { createContext } from 'react';

import type { AuthUser, LoginPlaceholderInput, UserRole } from '../types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (input: LoginPlaceholderInput) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
