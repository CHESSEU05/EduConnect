import type { Request, Response } from 'express';

import { env } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

const refreshCookieOptions = (expiresAt: Date) => ({
  expires: expiresAt,
  httpOnly: true,
  path: '/api/v1/auth',
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
});

const parseCookieHeader = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, item) => {
    const separatorIndex = item.indexOf('=');

    if (separatorIndex < 0) {
      return cookies;
    }

    const key = item.slice(0, separatorIndex).trim();
    const value = item.slice(separatorIndex + 1).trim();

    if (key) {
      cookies[key] = decodeURIComponent(value);
    }

    return cookies;
  }, {});
};

const getRefreshTokenFromRequest = (req: Request): string | undefined => {
  const cookies = parseCookieHeader(req.headers.cookie);

  return cookies[env.REFRESH_TOKEN_COOKIE_NAME];
};

const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  expiresAt: Date,
): void => {
  res.cookie(
    env.REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    refreshCookieOptions(expiresAt),
  );
};

const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    path: '/api/v1/auth',
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.authenticatedUser) {
    throw new AppError('Authentication is required', 401);
  }

  const user = await authService.getCurrentUser(req.authenticatedUser.id);

  res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    data: {
      user,
    },
  });
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
): Promise<void> => {
  const data = await authService.login(req.body);
  const { refreshToken, refreshTokenExpiresAt, ...responseData } = data;

  setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: responseData,
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    throw new AppError('Refresh session is required', 401);
  }

  const data = await authService.refreshSession(refreshToken);
  const { refreshToken: nextRefreshToken, refreshTokenExpiresAt, ...responseData } =
    data;

  setRefreshTokenCookie(res, nextRefreshToken, refreshTokenExpiresAt);

  res.status(200).json({
    success: true,
    message: 'Session refreshed successfully',
    data: responseData,
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await authService.logout(getRefreshTokenFromRequest(req));
  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
    data: null,
  });
};

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
): Promise<void> => {
  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user,
    },
  });
};
