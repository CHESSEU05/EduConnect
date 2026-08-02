import type { Express, Request, Response } from 'express';
import express from 'express';
import jwt from 'jsonwebtoken';
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

vi.mock('../src/repositories/user.repository.js', () => ({
  userRepository: userRepositoryMock,
  UserRepository: class UserRepository {},
}));

type MeUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  passwordHash?: string;
};

type MeApiResponse = {
  success: boolean;
  message: string;
  data?: {
    user: MeUserResponse;
  };
};

type AuthenticatedUserProbeResponse = {
  success: true;
  data: {
    authenticatedUser: {
      id: string;
      email: string;
      role: string;
      status: string;
    };
  };
};

type RepositoryMock = {
  [Key in keyof typeof userRepositoryMock]: Mock;
};

const repository = userRepositoryMock as RepositoryMock;

const jwtSecret = 'test-access-secret-with-at-least-32-characters';
const userId = '64f1a2b3c4d5e6f789012345';

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

describe('GET /api/v1/auth/me', () => {
  let app: Express;
  let probeApp: Express;
  let accessToken: string;

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/educonnect-test');
    vi.stubEnv('BCRYPT_SALT_ROUNDS', '10');
    vi.stubEnv('JWT_ACCESS_SECRET', jwtSecret);
    vi.stubEnv('JWT_ACCESS_EXPIRES_IN', '15m');

    const [{ app: importedApp }, { authenticate }, { asyncHandler }, { errorHandler }] =
      await Promise.all([
        import('../src/app.js'),
        import('../src/middleware/authenticate.js'),
        import('../src/utils/async-handler.js'),
        import('../src/middleware/error-handler.js'),
      ]);

    app = importedApp;
    probeApp = express();
    probeApp.get(
      '/probe',
      asyncHandler(authenticate),
      (req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            authenticatedUser: req.authenticatedUser,
          },
        });
      },
    );
    probeApp.use(errorHandler);
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const { generateAccessToken } = await import('../src/utils/jwt.js');

    accessToken = generateAccessToken({
      userId,
      email: 'amina@example.com',
      role: 'student',
    });

    repository.findById.mockResolvedValue(createUserDocument());
  });

  it('returns the current user for a valid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body as MeApiResponse;

    expect(body).toEqual({
      success: true,
      message: 'Authenticated user retrieved successfully',
      data: {
        user: {
          id: userId,
          firstName: 'Amina',
          lastName: 'Ndi',
          username: 'amina_ndi',
          email: 'amina@example.com',
          role: 'student',
          status: 'active',
          lastLoginAt: '2026-02-20T08:45:00.000Z',
          createdAt: '2026-01-15T10:30:00.000Z',
          updatedAt: '2026-02-01T12:00:00.000Z',
        },
      },
    });
    expect(repository.findById).toHaveBeenCalledWith(userId);
  });

  it('rejects a missing Authorization header', async () => {
    const response = await request(app).get('/api/v1/auth/me').expect(401);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Authentication is required',
    });
  });

  it('rejects a malformed Authorization header', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken} extra`)
      .expect(401);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Invalid authorization header',
    });
  });

  it('rejects a non-Bearer authorization scheme', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Basic ${accessToken}`)
      .expect(401);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Invalid authorization header',
    });
  });

  it('rejects an invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Invalid access token',
    });
  });

  it('rejects an expired token', async () => {
    const expiredToken = jwt.sign(
      {
        sub: userId,
        email: 'amina@example.com',
        role: 'student',
      },
      jwtSecret,
      {
        expiresIn: -1,
      },
    );

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Access token has expired',
    });
  });

  it('rejects a token for a deleted user', async () => {
    repository.findById.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'The account associated with this token no longer exists',
    });
  });

  it('rejects a suspended user', async () => {
    repository.findById.mockResolvedValue(createUserDocument({ status: 'suspended' }));

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'This account is not permitted to access the platform',
    });
  });

  it('rejects an inactive user', async () => {
    repository.findById.mockResolvedValue(createUserDocument({ status: 'inactive' }));

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
    const body = response.body as MeApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'This account is not permitted to access the platform',
    });
  });

  it('does not include passwordHash in the response', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = response.body as MeApiResponse;

    expect(body.data?.user.passwordHash).toBeUndefined();
  });

  it('attaches authenticatedUser to the request', async () => {
    const response = await request(probeApp)
      .get('/probe')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = response.body as AuthenticatedUserProbeResponse;

    expect(body.data.authenticatedUser).toEqual({
      id: userId,
      email: 'amina@example.com',
      role: 'student',
      status: 'active',
    });
  });

  it('returns current database values instead of stale JWT profile data', async () => {
    const staleToken = jwt.sign(
      {
        sub: userId,
        email: 'old-email@example.com',
        role: 'student',
      },
      jwtSecret,
      {
        expiresIn: '15m',
      },
    );

    repository.findById
      .mockResolvedValueOnce(createUserDocument({ email: 'fresh@example.com' }))
      .mockResolvedValueOnce(
        createUserDocument({
          firstName: 'Fresh',
          email: 'fresh@example.com',
          username: 'fresh_name',
        }),
      );

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${staleToken}`)
      .expect(200);
    const body = response.body as MeApiResponse;

    expect(body.data?.user).toMatchObject({
      firstName: 'Fresh',
      username: 'fresh_name',
      email: 'fresh@example.com',
    });
  });
});
