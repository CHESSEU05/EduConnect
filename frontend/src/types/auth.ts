import type { UserRole, UserStatus } from './user';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Extract<UserRole, 'student' | 'instructor'>;
};

export type LoginResponseData = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
};

export type RegisterResponseData = {
  user: AuthUser & {
    emailVerified: boolean;
    createdAt: string;
  };
};
