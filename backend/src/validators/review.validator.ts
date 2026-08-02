import { z } from "zod";

export const createReviewSchema = z.strictObject({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z
  .strictObject({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(10).max(1000).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one review field must be provided.",
  });

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const reviewListQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z
    .enum(["newest", "oldest", "highest", "lowest"])
    .optional()
    .default("newest"),
});

export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
