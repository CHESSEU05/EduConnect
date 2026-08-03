import { RefreshToken } from '../models/refresh-token.model.js';
import type { RefreshTokenDocument } from '../types/refresh-token.js';
import { toObjectId } from '../utils/object-id.js';

export type CreateRefreshTokenInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export class RefreshTokenRepository {
  public async create(
    input: CreateRefreshTokenInput,
  ): Promise<RefreshTokenDocument> {
    return RefreshToken.create({
      user: toObjectId(input.userId),
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      replacedByTokenHash: null,
    });
  }

  public async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenDocument | null> {
    return RefreshToken.findOne({ tokenHash }).exec();
  }

  public async revokeByTokenHash(
    tokenHash: string,
    replacedByTokenHash?: string,
  ): Promise<RefreshTokenDocument | null> {
    return RefreshToken.findOneAndUpdate(
      { tokenHash },
      {
        $set: {
          revokedAt: new Date(),
          replacedByTokenHash: replacedByTokenHash ?? null,
        },
      },
      { new: true },
    ).exec();
  }

  public async revokeActiveForUser(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      {
        user: userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    ).exec();
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
