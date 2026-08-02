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

type RegisterPayload = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'instructor';
};

type UserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'student' | 'instructor';
  status: 'active';
  emailVerified: false;
  createdAt: string;
  passwordHash?: string;
  password?: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    user: UserResponse;
  };
};

type RepositoryMock = {
  [Key in keyof typeof userRepositoryMock]: Mock;
};

const repository = userRepositoryMock as RepositoryMock;

const createUserDocument = (
  overrides: Partial<IUser> = {},
): UserDocument =>
  ({
    _id: {
      toString: () => '64f1a2b3c4d5e6f789012345',
    },
    firstName: 'Amina',
    lastName: 'Ndi',
    username: 'amina_ndi',
    email: 'amina@example.com',
    passwordHash: '$2b$10$hashed-password-value',
    role: 'student',
    status: 'active',
    emailVerified: false,
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-01-15T10:30:00.000Z'),
    ...overrides,
  }) as UserDocument;

const validPayload = (
  overrides: Partial<RegisterPayload> = {},
): RegisterPayload => ({
  firstName: 'Amina',
  lastName: 'Ndi',
  username: 'amina_ndi',
  email: 'amina@example.com',
  password: 'StrongPass1!',
  confirmPassword: 'StrongPass1!',
  role: 'student',
  ...overrides,
});

describe('POST /api/v1/auth/register', () => {
  let app: Express;

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
  });

  beforeEach(() => {
    vi.clearAllMocks();

    repository.findByEmail.mockResolvedValue(null);
    repository.findByUsername.mockResolvedValue(null);
    repository.create.mockResolvedValue(createUserDocument());
  });

  it('registers a student successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload())
      .expect(201);

    const body = response.body as ApiResponse;

    expect(body).toEqual({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: '64f1a2b3c4d5e6f789012345',
          firstName: 'Amina',
          lastName: 'Ndi',
          username: 'amina_ndi',
          email: 'amina@example.com',
          role: 'student',
          status: 'active',
          emailVerified: false,
          createdAt: '2026-01-15T10:30:00.000Z',
        },
      },
    });
  });

  it('registers an instructor successfully', async () => {
    repository.create.mockResolvedValue(
      createUserDocument({
        role: 'instructor',
        username: 'math_tutor',
        email: 'tutor@example.com',
      }),
    );

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(
        validPayload({
          role: 'instructor',
          username: 'math_tutor',
          email: 'tutor@example.com',
        }),
      )
      .expect(201);

    const body = response.body as ApiResponse;

    expect(body.data?.user.role).toBe('instructor');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'instructor',
        status: 'active',
        emailVerified: false,
      }),
    );
  });

  it('rejects an invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload({ email: 'not-an-email' }))
      .expect(400);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Validation failed');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects a weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(
        validPayload({
          password: 'weakpass',
          confirmPassword: 'weakpass',
        }),
      )
      .expect(400);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects a password mismatch', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload({ confirmPassword: 'Different1!' }))
      .expect(400);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid role', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validPayload(), role: 'admin' })
      .expect(400);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate email', async () => {
    repository.findByEmail.mockResolvedValue(createUserDocument());

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload())
      .expect(409);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Email is already registered.');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate username', async () => {
    repository.findByUsername.mockResolvedValue(createUserDocument());

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload())
      .expect(409);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Username is already taken.');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('converts MongoDB duplicate-key errors to HTTP 409', async () => {
    const duplicateKeyError = Object.assign(new Error('duplicate key'), {
      code: 11000,
      keyPattern: {
        email: 1,
      },
    });

    repository.create.mockRejectedValue(duplicateKeyError);

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload())
      .expect(409);

    const body = response.body as ApiResponse;

    expect(body.success).toBe(false);
    expect(body.message).toBe('Email is already registered.');
  });

  it('does not include password fields in the response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload())
      .expect(201);

    const body = response.body as ApiResponse;

    expect(body.data?.user.password).toBeUndefined();
    expect(body.data?.user.passwordHash).toBeUndefined();
  });

  it('stores the password as a bcrypt hash', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validPayload())
      .expect(201);

    expect(repository.create).toHaveBeenCalledTimes(1);

    const [createdUser] = repository.create.mock.calls[0] as [
      { passwordHash: string; confirmPassword?: string },
    ];

    expect(createdUser.confirmPassword).toBeUndefined();
    expect(createdUser.passwordHash).not.toBe('StrongPass1!');
    await expect(bcrypt.compare('StrongPass1!', createdUser.passwordHash)).resolves.toBe(
      true,
    );
  });
});
