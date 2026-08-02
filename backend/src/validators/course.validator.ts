import { z } from "zod";

import { courseLevels, courseStatuses } from "../types/course.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const optionalUrl = z
  .union([z.string().trim().url("URL must be valid."), z.literal("")])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    return value === "" ? null : value;
  });

const moduleSchema = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(3, "Module title must be at least 3 characters long.")
      .max(120, "Module title cannot exceed 120 characters."),
    description: z
      .union([
        z.string().trim().max(500, "Module description cannot exceed 500 characters."),
        z.literal(""),
      ])
      .optional()
      .transform((value) => (value === "" ? null : value)),
    textContent: z
      .union([z.string().trim(), z.literal("")])
      .optional()
      .transform((value) => (value === "" ? null : value)),
    videoUrl: optionalUrl,
    resourceUrl: optionalUrl,
    order: z.number().int().min(0).optional(),
    isPreview: z.boolean().optional().default(false),
  })
  .refine(
    (data) => Boolean(data.textContent || data.videoUrl || data.resourceUrl),
    {
      message: "Module must include text content, a video URL, or a resource URL.",
    },
  );

const pricingRefinement = <Schema extends z.ZodType>(schema: Schema): Schema =>
  schema.superRefine((value, context) => {
    const data = value as {
      isFree?: boolean;
      price?: number;
    };

    if (data.price !== undefined && data.price < 0) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Price cannot be negative.",
      });
    }

    if (data.isFree === true && data.price !== undefined && data.price !== 0) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Free courses must have a price of 0.",
      });
    }

    if (data.isFree === false && data.price !== undefined && data.price <= 0) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Paid courses must have a price greater than 0.",
      });
    }
  }) as Schema;

export const createCourseSchema = pricingRefinement(
  z.strictObject({
    title: z.string().trim().min(5).max(120),
    shortDescription: z.string().trim().min(20).max(200),
    description: z.string().trim().min(50).max(5000),
    categoryId: z.string().trim().regex(objectIdPattern, "Category id is invalid."),
    level: z.enum(courseLevels),
    language: z.string().trim().min(2).max(50),
    thumbnailUrl: optionalUrl,
    isFree: z.boolean(),
    price: z.number().min(0),
    modules: z.array(moduleSchema).optional().default([]),
  }),
);

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = pricingRefinement(
  z
    .strictObject({
      title: z.string().trim().min(5).max(120).optional(),
      shortDescription: z.string().trim().min(20).max(200).optional(),
      description: z.string().trim().min(50).max(5000).optional(),
      categoryId: z
        .string()
        .trim()
        .regex(objectIdPattern, "Category id is invalid.")
        .optional(),
      level: z.enum(courseLevels).optional(),
      language: z.string().trim().min(2).max(50).optional(),
      thumbnailUrl: optionalUrl,
      isFree: z.boolean().optional(),
      price: z.number().min(0).optional(),
      modules: z.array(moduleSchema).optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: "At least one course field must be provided.",
    }),
);

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const courseIdParamsSchema = z.strictObject({
  courseId: z.string().trim().regex(objectIdPattern, "Course id is invalid."),
});

export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;

export const instructorCourseQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  status: z.enum(courseStatuses).optional(),
  search: z.string().trim().optional(),
});

export type InstructorCourseQuery = z.infer<typeof instructorCourseQuerySchema>;

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const publicCourseQuerySchema = z
  .strictObject({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(12),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    level: z.enum(courseLevels).optional(),
    isFree: booleanQuery.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    language: z.string().trim().optional(),
    sort: z
      .enum(["newest", "oldest", "price-asc", "price-desc", "rating", "popular"])
      .optional()
      .default("newest"),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      path: ["minPrice"],
      message: "minPrice cannot be greater than maxPrice.",
    },
  );

export type PublicCourseQuery = z.infer<typeof publicCourseQuerySchema>;

export const courseSlugParamsSchema = z.strictObject({
  slug: z.string().trim().min(1),
});

export type CourseSlugParams = z.infer<typeof courseSlugParamsSchema>;
