import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const defaultRateLimitMaxRequests =
  process.env.NODE_ENV === 'production' ? 100 : 1000;

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().trim().min(1, 'MONGODB_URI is required'),
  CORS_ORIGIN: z.string().trim().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .default(defaultRateLimitMaxRequests),
  JSON_BODY_LIMIT: z.string().trim().default('1mb'),
  URL_ENCODED_BODY_LIMIT: z.string().trim().default('1mb'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  JWT_ACCESS_SECRET: z
    .string()
    .trim()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().trim().min(1).default('15m'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const messages = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${messages}`);
}

export const env = parsedEnvironment.data;

export type Environment = typeof env;
