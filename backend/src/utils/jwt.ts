import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { env } from '../config/env.js';
import { userRoles, type UserRole } from '../types/user.js';

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  email: string;
  role: UserRole;
};

type GenerateAccessTokenInput = {
  userId: string;
  email: string;
  role: UserRole;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && userRoles.includes(value as UserRole);

const isAccessTokenPayload = (value: unknown): value is AccessTokenPayload =>
  isRecord(value) &&
  typeof value.sub === 'string' &&
  typeof value.email === 'string' &&
  isUserRole(value.role);

export const generateAccessToken = ({
  userId,
  email,
  role,
}: GenerateAccessTokenInput): string => {
  const payload: AccessTokenPayload = {
    sub: userId,
    email,
    role,
  };

  const signOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, signOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decodedToken = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (!isAccessTokenPayload(decodedToken)) {
    throw new Error('Invalid access token payload');
  }

  return decodedToken;
};
