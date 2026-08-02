import type { Express, Request, RequestHandler } from 'express';
import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { UserRole } from '../src/types/user.js';

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    ok: boolean;
  };
};

const attachAuthenticatedUser =
  (role: UserRole): RequestHandler =>
  (req: Request, _res, next): void => {
    req.authenticatedUser = {
      id: '64f1a2b3c4d5e6f789012345',
      email: `${role}@example.com`,
      role,
      status: 'active',
    };

    next();
  };

describe('authorize middleware', () => {
  let app: Express;

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/educonnect-test');
    vi.stubEnv(
      'JWT_ACCESS_SECRET',
      'test-access-secret-with-at-least-32-characters',
    );

    const [{ authorize }, { errorHandler }] = await Promise.all([
      import('../src/middleware/authorize.js'),
      import('../src/middleware/error-handler.js'),
    ]);

    app = express();
    app.get(
      '/student',
      attachAuthenticatedUser('student'),
      authorize('student'),
      (_req, res) => {
        res.status(200).json({ success: true, data: { ok: true } });
      },
    );
    app.get(
      '/student-only-as-instructor',
      attachAuthenticatedUser('instructor'),
      authorize('student'),
      (_req, res) => {
        res.status(200).json({ success: true, data: { ok: true } });
      },
    );
    app.get(
      '/instructor',
      attachAuthenticatedUser('instructor'),
      authorize('instructor'),
      (_req, res) => {
        res.status(200).json({ success: true, data: { ok: true } });
      },
    );
    app.get(
      '/multiple',
      attachAuthenticatedUser('admin'),
      authorize('instructor', 'admin'),
      (_req, res) => {
        res.status(200).json({ success: true, data: { ok: true } });
      },
    );
    app.get('/missing-user', authorize('student'), (_req, res) => {
      res.status(200).json({ success: true, data: { ok: true } });
    });
    app.use(errorHandler);
  });

  it('allows a student on student-only route logic', async () => {
    const response = await request(app).get('/student').expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.ok).toBe(true);
  });

  it('rejects an instructor on student-only route logic', async () => {
    const response = await request(app)
      .get('/student-only-as-instructor')
      .expect(403);
    const body = response.body as ApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  });

  it('allows an instructor when instructor is allowed', async () => {
    const response = await request(app).get('/instructor').expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.ok).toBe(true);
  });

  it('allows one of multiple permitted roles', async () => {
    const response = await request(app).get('/multiple').expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.ok).toBe(true);
  });

  it('rejects a missing authenticated user', async () => {
    const response = await request(app).get('/missing-user').expect(401);
    const body = response.body as ApiResponse;

    expect(body).toMatchObject({
      success: false,
      message: 'Authentication is required',
    });
  });
});
