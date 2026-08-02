import { z } from 'zod';

export const reviewFormSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
