import { z } from 'zod';

const usernamePattern = /^[a-z0-9_]+$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email or username is required.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(30)
      .regex(usernamePattern, 'Use letters, numbers, and underscores only.'),
    email: z.string().trim().toLowerCase().email(),
    role: z.enum(['student', 'instructor']),
    password: z
      .string()
      .min(8)
      .regex(
        strongPasswordPattern,
        'Use uppercase, lowercase, number, and special character.',
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms to continue.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match.',
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
