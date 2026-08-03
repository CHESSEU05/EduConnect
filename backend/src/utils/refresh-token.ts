import { createHash, randomBytes } from 'crypto';

import { env } from '../config/env.js';

export type RefreshTokenPair = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const createRefreshTokenPair = (): RefreshTokenPair => {
  const token = randomBytes(64).toString('hex');

  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(
      Date.now() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    ),
  };
};
