import { z } from "zod";

import { enrollmentStatuses } from "../types/enrollment.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const courseIdParamsSchema = z.strictObject({
  courseId: z.string().trim().regex(objectIdPattern, "Course id is invalid."),
});

export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;

export const studentEnrollmentQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  status: z.enum(enrollmentStatuses).optional(),
  search: z.string().trim().optional(),
  sort: z
    .enum(["newest", "oldest", "recently-accessed", "progress"])
    .optional()
    .default("newest"),
});

export type StudentEnrollmentQuery = z.infer<
  typeof studentEnrollmentQuerySchema
>;

export const instructorEnrollmentQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  status: z.enum(enrollmentStatuses).optional(),
  search: z.string().trim().optional(),
  sort: z
    .enum(["newest", "oldest", "progress"])
    .optional()
    .default("newest"),
});

export type InstructorEnrollmentQuery = z.infer<
  typeof instructorEnrollmentQuerySchema
>;

export const updateEnrollmentProgressSchema = z.strictObject({
  progressPercentage: z.number().min(0).max(100),
});

export type UpdateEnrollmentProgressInput = z.infer<
  typeof updateEnrollmentProgressSchema
>;
