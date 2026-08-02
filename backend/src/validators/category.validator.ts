import { z } from "zod";

export const categorySlugParamsSchema = z.strictObject({
  slug: z.string().trim().min(1),
});

export type CategorySlugParams = z.infer<typeof categorySlugParamsSchema>;
