import type { HydratedDocument, Model, Types } from "mongoose";

export const enrollmentStatuses = ["active", "completed", "cancelled"] as const;

export type EnrollmentStatus = (typeof enrollmentStatuses)[number];

export interface IEnrollment {
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: EnrollmentStatus;
  progressPercentage: number;
  lastAccessedAt?: Date | null;
  completedAt?: Date | null;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type EnrollmentDocument = HydratedDocument<IEnrollment>;

export type EnrollmentModel = Model<IEnrollment>;
