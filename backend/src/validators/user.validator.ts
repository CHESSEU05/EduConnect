import { z } from 'zod';

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const usernamePattern = /^[a-z0-9_]+$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

const nullableTrimmedString = (schema: z.ZodString) =>
  z
    .union([schema, z.literal('')])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value === '' ? null : value;
    });

export const updateProfileSchema = z
  .strictObject({
    firstName: z
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters long.')
      .max(50, 'First name cannot exceed 50 characters.')
      .regex(namePattern, 'First name contains unsupported characters.')
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters long.')
      .max(50, 'Last name cannot exceed 50 characters.')
      .regex(namePattern, 'Last name contains unsupported characters.')
      .optional(),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Username must be at least 3 characters long.')
      .max(30, 'Username cannot exceed 30 characters.')
      .regex(
        usernamePattern,
        'Username can contain only letters, numbers, and underscores.',
      )
      .optional(),
    avatarUrl: nullableTrimmedString(
      z.string().trim().url('Avatar URL must be a valid URL.'),
    ),
    bio: nullableTrimmedString(
      z.string().trim().max(500, 'Bio cannot exceed 500 characters.'),
    ),
    phoneNumber: nullableTrimmedString(
      z
        .string()
        .trim()
        .max(20, 'Phone number cannot exceed 20 characters.'),
    ),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one profile field must be provided.',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .strictObject({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long.')
      .regex(
        strongPasswordPattern,
        'New password must contain uppercase, lowercase, number, and special character.',
      ),
    confirmNewPassword: z.string().min(1, 'Confirm new password is required.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Confirm new password must match new password.',
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
