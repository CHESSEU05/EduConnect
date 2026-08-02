import { z } from 'zod';

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const usernamePattern = /^[a-z0-9_]+$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters long.')
      .max(50, 'First name cannot exceed 50 characters.')
      .regex(namePattern, 'First name contains unsupported characters.'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters long.')
      .max(50, 'Last name cannot exceed 50 characters.')
      .regex(namePattern, 'Last name contains unsupported characters.'),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Username must be at least 3 characters long.')
      .max(30, 'Username cannot exceed 30 characters.')
      .regex(
        usernamePattern,
        'Username can contain only letters, numbers, and underscores.',
      ),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Email must be a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(
        strongPasswordPattern,
        'Password must contain uppercase, lowercase, number, and special character.',
      ),
    confirmPassword: z.string(),
    role: z.enum(['student', 'instructor'], {
      message: 'Role must be student or instructor.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Confirm password must match password.',
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email or username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
