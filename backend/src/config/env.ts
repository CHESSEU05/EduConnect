import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

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
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  JSON_BODY_LIMIT: z.string().trim().default('1mb'),
  URL_ENCODED_BODY_LIMIT: z.string().trim().default('1mb'),
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
