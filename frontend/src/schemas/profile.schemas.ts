import { z } from 'zod';

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const profileFormSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Use letters, numbers, and underscores only.'),
  avatarUrl: z.string().trim().url().or(z.literal('')),
  bio: z.string().trim().max(500).or(z.literal('')),
  phoneNumber: z.string().trim().max(20).or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8)
      .regex(
        strongPasswordPattern,
        'Use uppercase, lowercase, number, and special character.',
      ),
    confirmNewPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords must match.',
  });

export type ChangePasswordFormValues = z.infer<
  typeof changePasswordFormSchema
>;
