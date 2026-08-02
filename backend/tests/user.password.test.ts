import type { Express } from 'express';
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

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
  } | null;
};

type RepositoryMock = {
  [Key in keyof typeof userRepositoryMock]: Mock;
};

const repository = userRepositoryMock as RepositoryMock;
const userId = '64f1a2b3c4d5e6f789012345';
const oldPassword = 'OldStrong1!';
const newPassword = 'NewStrong1!';

let storedPasswordHash = '';

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
    passwordHash: storedPasswordHash,
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

const validPayload = () => ({
  currentPassword: oldPassword,
  newPassword,
  confirmNewPassword: newPassword,
});

describe('PATCH /api/v1/users/change-password', () => {
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

  beforeEach(async () => {
    vi.clearAllMocks();

    storedPasswordHash = await bcrypt.hash(oldPassword, 10);

    repository.findById.mockResolvedValue(createUserDocument());
    repository.findByIdWithPasswordHash.mockImplementation(() =>
      Promise.resolve(createUserDocument()),
    );
    repository.updatePasswordHash.mockImplementation(
      (_updatedUserId: string, passwordHash: string) => {
        storedPasswordHash = passwordHash;

        return Promise.resolve(createUserDocument());
      },
    );
    repository.findByEmailOrUsernameWithPasswordHash.mockImplementation(() =>
      Promise.resolve(createUserDocument()),
    );
    repository.updateLastLogin.mockResolvedValue(createUserDocument());
  });

  it('changes the password successfully', async () => {
    const response = await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload())
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body).toEqual({
      success: true,
      message: 'Password changed successfully',
      data: null,
    });
    expect(repository.updatePasswordHash).toHaveBeenCalledTimes(1);
  });

  it('rejects an incorrect current password', async () => {
    const response = await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validPayload(),
        currentPassword: 'WrongStrong1!',
      })
      .expect(401);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Current password is incorrect');
    expect(repository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('rejects a weak new password', async () => {
    const response = await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: 'weakpass',
        confirmNewPassword: 'weakpass',
      })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
    expect(repository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('rejects mismatched confirmation', async () => {
    const response = await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword,
        confirmNewPassword: 'Different1!',
      })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Validation failed');
    expect(repository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('rejects using the current password as the new password', async () => {
    const response = await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: oldPassword,
        confirmNewPassword: oldPassword,
      })
      .expect(400);
    const body = response.body as ApiResponse;

    expect(body.message).toBe(
      'New password must be different from the current password',
    );
    expect(repository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('stores the new password as a hash', async () => {
    await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload())
      .expect(200);

    expect(storedPasswordHash).not.toBe(newPassword);
    await expect(bcrypt.compare(newPassword, storedPasswordHash)).resolves.toBe(
      true,
    );
  });

  it('does not allow the old password after change', async () => {
    await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload())
      .expect(200);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'amina@example.com',
        password: oldPassword,
      })
      .expect(401);
    const body = response.body as ApiResponse;

    expect(body.message).toBe('Invalid email, username, or password');
  });

  it('allows the new password during subsequent login', async () => {
    await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload())
      .expect(200);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'amina@example.com',
        password: newPassword,
      })
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.success).toBe(true);
    expect(typeof body.data?.accessToken).toBe('string');
  });

  it('does not include passwordHash in the response', async () => {
    const response = await request(app)
      .patch('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload())
      .expect(200);

    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });
});
