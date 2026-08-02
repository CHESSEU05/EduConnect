import { z } from 'zod';

export const courseFormSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    shortDescription: z.string().trim().min(20).max(200),
    description: z.string().trim().min(50).max(5000),
    categoryId: z.string().trim().min(1, 'Choose a category.'),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'all-levels']),
    language: z.string().trim().min(2).max(50),
    thumbnailUrl: z.string().trim().url().or(z.literal('')),
    isFree: z.boolean(),
    price: z.coerce.number().min(0),
    modules: z.array(
      z.object({
        title: z.string().trim().min(3).max(120),
        description: z.string().trim().max(500).or(z.literal('')),
        textContent: z.string().trim().or(z.literal('')),
        videoUrl: z.string().trim().url().or(z.literal('')),
        resourceUrl: z.string().trim().url().or(z.literal('')),
        isPreview: z.boolean(),
      }),
    ),
  })
  .superRefine((data, context) => {
    if (data.isFree && data.price !== 0) {
      context.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Free courses must have a price of 0.',
      });
    }

    if (!data.isFree && data.price <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Paid courses must have a price greater than 0.',
      });
    }

    data.modules.forEach((module, index) => {
      if (!module.textContent && !module.videoUrl && !module.resourceUrl) {
        context.addIssue({
          code: 'custom',
          path: ['modules', index, 'textContent'],
          message: 'Add text content, a video URL, or a resource URL.',
        });
      }
    });
  });

export type CourseFormValues = z.infer<typeof courseFormSchema>;
