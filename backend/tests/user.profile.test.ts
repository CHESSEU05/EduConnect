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

import type { IUser, UserDocument } from '../src/types/user.js';

const userRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByEmailOrUsernameWithPasswordHash: vi.fn(),
  findByIdWithPasswordHash: vi.fn(),
  findByUsername: vi.fn(),
  exists: vi.fn(),
  update: vi.fn(),
  updateProfile: vi.fn(),
  updatePasswordHash: vi.fn(),
  delete: vi.fn(),
  updateLastLogin: vi.fn(),
}));

vi.mock('../src/repositories/user.repository.js', () => ({
  userRepository: userRepositoryMock,
  UserRepository: class UserRepository {},
}));

type ProfileUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  passwordHash?: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    user: ProfileUserResponse;
  };
};

type RepositoryMock = {
  [Key in keyof typeof userRepositoryMock]: Mock;
};

const repository = userRepositoryMock as RepositoryMock;
const userId = '64f1a2b3c4d5e6f789012345';

const createUserDocument = (
  overrides: Partial<IUser> = {},
  documentId = userId,
): UserDocument =>
  ({
    _id: {
      toString: () => documentId,
    },
    firstName: 'Amina',
    lastName: 'Ndi',
    username: 'amina_ndi',
    email: 'amina@example.com',
    passwordHash: '$2b$10$hashed-password-value',
    role: 'student',
    status: 'active',
    emailVerified: false,
    avatarUrl: null,
    bio: null,
    phoneNumber: null,
    lastLoginAt: new Date('2026-02-20T08:45:00.000Z'),
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-02-01T12:00:00.000Z'),
    ...overrides,
  }) as UserDocument;

describe('user profile endpoints', () => {
  let app: Express;
  let accessToken: string;

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/educonnect-test');
    vi.stubEnv('BCRYPT_SALT_ROUNDS', '10');
    vi.stubEnv(
      'JWT_ACCESS_SECRET',
      'test-access-secret-with-at-least-32-characters',
    );
    vi.stubEnv('JWT_ACCESS_EXPIRES_IN', '15m');

    const [{ app: importedApp }, { generateAccessToken }] = await Promise.all([
      import('../src/app.js'),
      import('../src/utils/jwt.js'),
    ]);

    app = importedApp;
    accessToken = generateAccessToken({
      userId,
      email: 'amina@example.com',
      role: 'student',
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    repository.findById.mockResolvedValue(createUserDocument());
    repository.findByUsername.mockResolvedValue(null);
    repository.updateProfile.mockResolvedValue(
      createUserDocument({
        firstName: 'Updated',
        username: 'updated_name',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Learning every day.',
        phoneNumber: '+237600000000',
      }),
    );
  });

  it('retrieves the authenticated profile', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body).toEqual({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: userId,
          firstName: 'Amina',
          lastName: 'Ndi',
          username: 'amina_ndi',
          email: 'amina@example.com',
          role: 'student',
          status: 'active',
          avatarUrl: null,
          bio: null,
          phoneNumber: null,
          lastLoginAt: '2026-02-20T08:45:00.000Z',
          createdAt: '2026-01-15T10:30:00.000Z',
          updatedAt: '2026-02-01T12:00:00.000Z',
        },
      },
    });
  });

  it('rejects profile retrieval without a token', async () => {
    const response = await request(app).get('/api/v1/users/profile').expect(401);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Authentication is required');
  });

  it('does not include passwordHash in the profile response', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.user.passwordHash).toBeUndefined();
  });

  it('updates a partial profile successfully', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Updated',
        avatarUrl: 'https://example.com/avatar.png',
      })
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Profile updated successfully');
    expect(repository.updateProfile).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        firstName: 'Updated',
        avatarUrl: 'https://example.com/avatar.png',
      }),
    );
    expect(body.data?.user.passwordHash).toBeUndefined();
  });

  it('normalizes username updates', async () => {
    await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ username: ' UPDATED_NAME ' })
      .expect(200);

    expect(repository.findByUsername).toHaveBeenCalledWith('updated_name');
    expect(repository.updateProfile).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        username: 'updated_name',
      }),
    );
  });

  it('rejects a duplicate username', async () => {
    repository.findByUsername.mockResolvedValue(
      createUserDocument(
        {
          username: 'taken_name',
          email: 'other@example.com',
        },
        '64f1a2b3c4d5e6f789012346',
      ),
    );

    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ username: 'taken_name' })
      .expect(409);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('This username is already taken');
    expect(repository.updateProfile).not.toHaveBeenCalled();
  });

  it('converts username duplicate-key errors to HTTP 409', async () => {
    const duplicateKeyError = Object.assign(new Error('duplicate key'), {
      code: 11000,
      keyPattern: {
        username: 1,
      },
    });

    repository.updateProfile.mockRejectedValue(duplicateKeyError);

    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ username: 'available_name' })
      .expect(409);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('This username is already taken');
  });

  it('rejects an empty update body', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
  });

  it('rejects unsupported fields', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ unsupported: 'value' })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
  });

  it('rejects an invalid avatar URL', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ avatarUrl: 'not-a-url' })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
  });

  it('rejects a bio longer than 500 characters', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bio: 'a'.repeat(501) })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
  });

  it('rejects attempts to change role, status, or email', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'new@example.com',
        role: 'instructor',
        status: 'suspended',
      })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
    expect(repository.updateProfile).not.toHaveBeenCalled();
  });
});
