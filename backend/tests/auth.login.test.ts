import type { Express } from 'express';
import type { verifyAccessToken as verifyAccessTokenFunction } from '../src/utils/jwt.js';
import bcrypt from 'bcrypt';
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

type LoginPayload = {
  identifier: string;
  password: string;
};

type LoginUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt: string;
  passwordHash?: string;
};

type LoginApiResponse = {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: string;
    user: LoginUserResponse;
  };
};

type RepositoryMock = {
  [Key in keyof typeof userRepositoryMock]: Mock;
};

const repository = userRepositoryMock as RepositoryMock;

const plainPassword = 'StrongPass1!';
const userId = '64f1a2b3c4d5e6f789012345';

const createUserDocument = async (
  overrides: Partial<IUser> = {},
): Promise<UserDocument> =>
  ({
    _id: {
      toString: () => userId,
    },
    firstName: 'Amina',
    lastName: 'Ndi',
    username: 'amina_ndi',
    email: 'amina@example.com',
    passwordHash: await bcrypt.hash(plainPassword, 10),
    role: 'student',
    status: 'active',
    emailVerified: false,
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-01-15T10:30:00.000Z'),
    ...overrides,
  }) as UserDocument;

const validPayload = (
  overrides: Partial<LoginPayload> = {},
): LoginPayload => ({
  identifier: 'amina@example.com',
  password: plainPassword,
  ...overrides,
});

describe('POST /api/v1/auth/login', () => {
  let app: Express;
  let verifyAccessToken: typeof verifyAccessTokenFunction;

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/educonnect-test');
    vi.stubEnv('BCRYPT_SALT_ROUNDS', '10');
    vi.stubEnv(
      'JWT_ACCESS_SECRET',
      'test-access-secret-with-at-least-32-characters',
    );
    vi.stubEnv('JWT_ACCESS_EXPIRES_IN', '15m');

    ({ app } = await import('../src/app.js'));
    ({ verifyAccessToken } = await import('../src/utils/jwt.js'));
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const user = await createUserDocument();
    const updatedUser = await createUserDocument({
      lastLoginAt: new Date('2026-02-20T08:45:00.000Z'),
    });

    repository.findByEmailOrUsernameWithPasswordHash.mockResolvedValue(user);
    repository.updateLastLogin.mockResolvedValue(updatedUser);
  });

  it('logs in using email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload({ identifier: ' AMINA@EXAMPLE.COM ' }))
      .expect(200);

    const body = response.body as LoginApiResponse;

    expect(repository.findByEmailOrUsernameWithPasswordHash).toHaveBeenCalledWith(
      'amina@example.com',
    );
    expect(body).toMatchObject({
      success: true,
      message: 'Login successful',
      data: {
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: {
          id: userId,
          firstName: 'Amina',
          lastName: 'Ndi',
          username: 'amina_ndi',
          email: 'amina@example.com',
          role: 'student',
          status: 'active',
          lastLoginAt: '2026-02-20T08:45:00.000Z',
        },
      },
    });
    expect(typeof body.data?.accessToken).toBe('string');
  });

  it('logs in using username', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload({ identifier: ' AMINA_NDI ' }))
      .expect(200);

    const body = response.body as LoginApiResponse;

    expect(repository.findByEmailOrUsernameWithPasswordHash).toHaveBeenCalledWith(
      'amina_ndi',
    );
    expect(body.data?.user.username).toBe('amina_ndi');
  });

  it('rejects an invalid password with a generic response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload({ password: 'WrongPass1!' }))
      .expect(401);

    const body = response.body as LoginApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Invalid email, username, or password',
    });
    expect(repository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('rejects a nonexistent account with the same generic response', async () => {
    repository.findByEmailOrUsernameWithPasswordHash.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload())
      .expect(401);

    const body = response.body as LoginApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Invalid email, username, or password',
    });
    expect(repository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('rejects a missing identifier', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: plainPassword })
      .expect(400);

    const body = response.body as LoginApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Validation failed');
    expect(repository.findByEmailOrUsernameWithPasswordHash).not.toHaveBeenCalled();
  });

  it('rejects a missing password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'amina@example.com' })
      .expect(400);

    const body = response.body as LoginApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Validation failed');
    expect(repository.findByEmailOrUsernameWithPasswordHash).not.toHaveBeenCalled();
  });

  it('rejects a suspended account', async () => {
    repository.findByEmailOrUsernameWithPasswordHash.mockResolvedValue(
      await createUserDocument({ status: 'suspended' }),
    );

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload())
      .expect(403);

    const body = response.body as LoginApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Account is suspended.');
    expect(repository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('rejects an inactive account', async () => {
    repository.findByEmailOrUsernameWithPasswordHash.mockResolvedValue(
      await createUserDocument({ status: 'inactive' }),
    );

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload())
      .expect(403);

    const body = response.body as LoginApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Account is inactive.');
    expect(repository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('does not include passwordHash in the response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload())
      .expect(200);

    const body = response.body as LoginApiResponse;

    expect(body.data?.user.passwordHash).toBeUndefined();
  });

  it('returns a JWT containing expected claims', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload())
      .expect(200);

    const body = response.body as LoginApiResponse;
    const accessToken = body.data?.accessToken;

    expect(typeof accessToken).toBe('string');

    if (!accessToken) {
      throw new Error('Expected accessToken in response');
    }

    const claims = verifyAccessToken(accessToken);

    expect(claims.sub).toBe(userId);
    expect(claims.email).toBe('amina@example.com');
    expect(claims.role).toBe('student');
  });

  it('updates lastLoginAt after successful login', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send(validPayload())
      .expect(200);

    expect(repository.updateLastLogin).toHaveBeenCalledWith(userId);
  });
});
