import type { Express } from 'express';
import request from 'supertest';
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';

import type { IRefreshToken, RefreshTokenDocument } from '../src/types/refresh-token.js';
import type { IUser, UserDocument } from '../src/types/user.js';

const userRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByEmailOrUsernameWithPasswordHash: vi.fn(),
  findByUsername: vi.fn(),
  exists: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateLastLogin: vi.fn(),
}));

const refreshTokenRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findByTokenHash: vi.fn(),
  revokeByTokenHash: vi.fn(),
  revokeActiveForUser: vi.fn(),
}));

vi.mock('../src/repositories/user.repository.js', () => ({
  userRepository: userRepositoryMock,
  UserRepository: class UserRepository {},
}));

vi.mock('../src/repositories/refresh-token.repository.js', () => ({
  refreshTokenRepository: refreshTokenRepositoryMock,
  RefreshTokenRepository: class RefreshTokenRepository {},
}));

type RepositoryMock<T extends Record<string, unknown>> = {
  [Key in keyof T]: Mock;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: string;
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      passwordHash?: string;
    };
  } | null;
};

const users = userRepositoryMock as RepositoryMock<typeof userRepositoryMock>;
const refreshTokens = refreshTokenRepositoryMock as RepositoryMock<
  typeof refreshTokenRepositoryMock
>;

const userId = '64f1a2b3c4d5e6f789012345';
const refreshToken = 'refresh-token-value';
const cookieName = 'educonnect_refresh_token';

const createUserDocument = (
  overrides: Partial<IUser> = {},
): UserDocument =>
  ({
    _id: {
      toString: () => userId,
    },
    firstName: 'Amina',
    lastName: 'Ndi',
    username: 'amina_ndi',
    email: 'amina@example.com',
    passwordHash: '$2b$10$hashed-password-value',
    role: 'student',
    status: 'active',
    emailVerified: false,
    lastLoginAt: new Date('2026-02-20T08:45:00.000Z'),
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-02-01T12:00:00.000Z'),
    ...overrides,
  }) as UserDocument;

const createRefreshTokenDocument = (
  overrides: Partial<IRefreshToken> = {},
): RefreshTokenDocument =>
  ({
    _id: {
      toString: () => '64f1a2b3c4d5e6f789012346',
    },
    user: {
      toString: () => userId,
    },
    tokenHash: 'stored-token-hash',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    replacedByTokenHash: null,
    createdAt: new Date('2026-02-01T12:00:00.000Z'),
    updatedAt: new Date('2026-02-01T12:00:00.000Z'),
    ...overrides,
  }) as RefreshTokenDocument;

describe('refresh-token authentication workflow', () => {
  let app: Express;
  let verifyAccessToken: (token: string) => { sub: string; email: string; role: string };
  let hashRefreshToken: (token: string) => string;

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/educonnect-test');
    vi.stubEnv('BCRYPT_SALT_ROUNDS', '10');
    vi.stubEnv(
      'JWT_ACCESS_SECRET',
      'test-access-secret-with-at-least-32-characters',
    );
    vi.stubEnv('JWT_ACCESS_EXPIRES_IN', '15m');
    vi.stubEnv('REFRESH_TOKEN_COOKIE_NAME', cookieName);
    vi.stubEnv('REFRESH_TOKEN_EXPIRES_IN_DAYS', '7');

    const [{ app: importedApp }, jwtUtils, refreshTokenUtils] = await Promise.all([
      import('../src/app.js'),
      import('../src/utils/jwt.js'),
      import('../src/utils/refresh-token.js'),
    ]);

    app = importedApp;
    verifyAccessToken = jwtUtils.verifyAccessToken;
    hashRefreshToken = refreshTokenUtils.hashRefreshToken;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    users.findById.mockResolvedValue(createUserDocument());
    refreshTokens.findByTokenHash.mockResolvedValue(createRefreshTokenDocument());
    refreshTokens.create.mockResolvedValue(createRefreshTokenDocument());
    refreshTokens.revokeByTokenHash.mockResolvedValue(createRefreshTokenDocument());
    refreshTokens.revokeActiveForUser.mockResolvedValue(undefined);
  });

  it('rotates the refresh token and returns a new access token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${cookieName}=${refreshToken}`])
      .expect(200);
    const body = response.body as AuthResponse;

    expect(body.message).toBe('Session refreshed successfully');
    expect(body.data?.tokenType).toBe('Bearer');
    expect(body.data?.expiresIn).toBe('15m');
    expect(body.data?.user.passwordHash).toBeUndefined();
    expect(response.headers['set-cookie']?.[0]).toContain(`${cookieName}=`);
    expect(refreshTokens.findByTokenHash).toHaveBeenCalledWith(
      hashRefreshToken(refreshToken),
    );
    expect(refreshTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId }),
    );
    expect(refreshTokens.revokeByTokenHash).toHaveBeenCalledWith(
      hashRefreshToken(refreshToken),
      expect.any(String),
    );

    if (!body.data?.accessToken) {
      throw new Error('Expected accessToken in refresh response');
    }

    const claims = verifyAccessToken(body.data.accessToken);
    expect(claims.sub).toBe(userId);
    expect(claims.email).toBe('amina@example.com');
    expect(claims.role).toBe('student');
  });

  it('rejects refresh without the refresh cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .expect(401);
    const body = response.body as AuthResponse;

    expect(body.message).toBe('Refresh session is required');
    expect(refreshTokens.findByTokenHash).not.toHaveBeenCalled();
  });

  it('rejects an expired refresh token and revokes active sessions', async () => {
    refreshTokens.findByTokenHash.mockResolvedValueOnce(
      createRefreshTokenDocument({ expiresAt: new Date(Date.now() - 1000) }),
    );

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${cookieName}=${refreshToken}`])
      .expect(401);
    const body = response.body as AuthResponse;

    expect(body.message).toBe('Refresh session is invalid or expired');
    expect(refreshTokens.revokeActiveForUser).toHaveBeenCalledWith(userId);
  });

  it('rejects a revoked refresh token and revokes active sessions', async () => {
    refreshTokens.findByTokenHash.mockResolvedValueOnce(
      createRefreshTokenDocument({ revokedAt: new Date() }),
    );

    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${cookieName}=${refreshToken}`])
      .expect(401);

    expect(refreshTokens.revokeActiveForUser).toHaveBeenCalledWith(userId);
  });

  it('rejects refresh when the user no longer exists', async () => {
    users.findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${cookieName}=${refreshToken}`])
      .expect(401);
    const body = response.body as AuthResponse;

    expect(body.message).toBe(
      'The account associated with this token no longer exists',
    );
    expect(refreshTokens.revokeByTokenHash).toHaveBeenCalledWith(
      hashRefreshToken(refreshToken),
    );
  });

  it('rejects refresh for a suspended user', async () => {
    users.findById.mockResolvedValueOnce(
      createUserDocument({ status: 'suspended' }),
    );

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${cookieName}=${refreshToken}`])
      .expect(403);
    const body = response.body as AuthResponse;

    expect(body.message).toBe('This account is not permitted to access the platform');
    expect(refreshTokens.revokeActiveForUser).toHaveBeenCalledWith(userId);
  });

  it('revokes the current refresh token on logout and clears the cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [`${cookieName}=${refreshToken}`])
      .expect(200);
    const body = response.body as AuthResponse;

    expect(body).toEqual({
      success: true,
      message: 'Logout successful',
      data: null,
    });
    expect(refreshTokens.revokeByTokenHash).toHaveBeenCalledWith(
      hashRefreshToken(refreshToken),
    );
    expect(response.headers['set-cookie']?.[0]).toContain(`${cookieName}=;`);
  });
});
