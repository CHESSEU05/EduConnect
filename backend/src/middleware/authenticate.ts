import type { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

const { TokenExpiredError, JsonWebTokenError } = jsonwebtoken;

const getBearerToken = (authorizationHeader: string): string => {
  const parts = authorizationHeader.trim().split(/\s+/);

  if (parts.length !== 2) {
    throw new AppError('Invalid authorization header', 401);
  }

  const [scheme, token] = parts;

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Invalid authorization header', 401);
  }

  return token;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorizationHeader = req.get('authorization');

  if (!authorizationHeader) {
    throw new AppError('Authentication is required', 401);
  }

  let payload: ReturnType<typeof verifyAccessToken>;

  try {
    payload = verifyAccessToken(getBearerToken(authorizationHeader));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof TokenExpiredError) {
      throw new AppError('Access token has expired', 401);
    }

    if (error instanceof JsonWebTokenError || error instanceof Error) {
      throw new AppError('Invalid access token', 401);
    }

    throw error;
  }

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new AppError(
      'The account associated with this token no longer exists',
      401,
    );
  }

  if (user.status !== 'active') {
    throw new AppError(
      'This account is not permitted to access the platform',
      403,
    );
  }

  req.authenticatedUser = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    status: user.status,
  };

  next();
};
