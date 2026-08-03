import bcrypt from 'bcrypt';

import { env } from '../config/env.js';
import {
  refreshTokenRepository,
  type RefreshTokenRepository,
} from '../repositories/refresh-token.repository.js';
import { userRepository, type UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';
import {
  getDuplicateKeyField,
  isDuplicateKeyError,
} from '../utils/mongo-errors.js';
import { generateAccessToken } from '../utils/jwt.js';
import {
  createRefreshTokenPair,
  hashRefreshToken,
} from '../utils/refresh-token.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';
import type { UserDocument, UserStatus } from '../types/user.js';

export type RegisteredUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: RegisterInput['role'];
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
};

type AuthenticatedUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserDocument['role'];
  status: UserStatus;
  lastLoginAt: string;
};

type CurrentUserResponse = AuthenticatedUserResponse & {
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUserResponse;
};

const invalidCredentialsMessage = 'Invalid email, username, or password';
const invalidRefreshSessionMessage = 'Refresh session is invalid or expired';

export class AuthService {
  public constructor(
    private readonly users: UserRepository = userRepository,
    private readonly refreshTokens: RefreshTokenRepository = refreshTokenRepository,
  ) {}

  public async getCurrentUser(userId: string): Promise<CurrentUserResponse> {
    const user = await this.users.findById(userId);

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

    return this.toCurrentUserResponse(user);
  }

  public async login(
    input: LoginInput,
  ): Promise<LoginResponse & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const user = await this.users.findByEmailOrUsernameWithPasswordHash(
      input.identifier,
    );

    if (!user) {
      throw new AppError(invalidCredentialsMessage, 401);
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError(invalidCredentialsMessage, 401);
    }

    if (user.status === 'inactive') {
      throw new AppError('Account is inactive.', 403);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended.', 403);
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshTokenPair = createRefreshTokenPair();

    await this.refreshTokens.create({
      userId: user._id.toString(),
      tokenHash: refreshTokenPair.tokenHash,
      expiresAt: refreshTokenPair.expiresAt,
    });

    const lastLoginAt = new Date();
    const updatedUser = await this.users.updateLastLogin(user._id.toString());

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshToken: refreshTokenPair.token,
      refreshTokenExpiresAt: refreshTokenPair.expiresAt,
      user: this.toAuthenticatedUserResponse(
        updatedUser ?? user,
        updatedUser?.lastLoginAt ?? lastLoginAt,
      ),
    };
  }

  public async refreshSession(
    refreshToken: string,
  ): Promise<LoginResponse & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const currentTokenHash = hashRefreshToken(refreshToken);
    const storedToken = await this.refreshTokens.findByTokenHash(currentTokenHash);

    if (!storedToken) {
      throw new AppError(invalidRefreshSessionMessage, 401);
    }

    if (storedToken.revokedAt || storedToken.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokens.revokeActiveForUser(storedToken.user.toString());
      throw new AppError(invalidRefreshSessionMessage, 401);
    }

    const user = await this.users.findById(storedToken.user.toString());

    if (!user) {
      await this.refreshTokens.revokeByTokenHash(currentTokenHash);
      throw new AppError(
        'The account associated with this token no longer exists',
        401,
      );
    }

    if (user.status !== 'active') {
      await this.refreshTokens.revokeActiveForUser(user._id.toString());
      throw new AppError(
        'This account is not permitted to access the platform',
        403,
      );
    }

    const nextRefreshTokenPair = createRefreshTokenPair();
    await this.refreshTokens.create({
      userId: user._id.toString(),
      tokenHash: nextRefreshTokenPair.tokenHash,
      expiresAt: nextRefreshTokenPair.expiresAt,
    });
    await this.refreshTokens.revokeByTokenHash(
      currentTokenHash,
      nextRefreshTokenPair.tokenHash,
    );

    return {
      accessToken: generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      }),
      tokenType: 'Bearer',
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshToken: nextRefreshTokenPair.token,
      refreshTokenExpiresAt: nextRefreshTokenPair.expiresAt,
      user: this.toAuthenticatedUserResponse(
        user,
        user.lastLoginAt ?? user.updatedAt,
      ),
    };
  }

  public async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.refreshTokens.revokeByTokenHash(hashRefreshToken(refreshToken));
  }

  public async register(input: RegisterInput): Promise<RegisteredUserResponse> {
    const existingEmailUser = await this.users.findByEmail(input.email);

    if (existingEmailUser) {
      throw new AppError('Email is already registered.', 409);
    }

    const existingUsernameUser = await this.users.findByUsername(input.username);

    if (existingUsernameUser) {
      throw new AppError('Username is already taken.', 409);
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      env.BCRYPT_SALT_ROUNDS,
    );

    try {
      const user = await this.users.create({
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.email,
        passwordHash,
        role: input.role,
        status: 'active',
        emailVerified: false,
      });

      return this.toRegisteredUserResponse(user, input.role);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw this.createDuplicateKeyConflict(error);
      }

      throw error;
    }
  }

  private toRegisteredUserResponse(
    user: UserDocument,
    role: RegisterInput['role'],
  ): RegisteredUserResponse {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private toAuthenticatedUserResponse(
    user: UserDocument,
    lastLoginAt: Date,
  ): AuthenticatedUserResponse {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: lastLoginAt.toISOString(),
    };
  }

  private toCurrentUserResponse(user: UserDocument): CurrentUserResponse {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? '',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private createDuplicateKeyConflict(error: Parameters<typeof getDuplicateKeyField>[0]): AppError {
    const field = getDuplicateKeyField(error);

    if (field === 'email') {
      return new AppError('Email is already registered.', 409);
    }

    if (field === 'username') {
      return new AppError('Username is already taken.', 409);
    }

    return new AppError('Duplicate value already exists.', 409);
  }
}

export const authService = new AuthService();
