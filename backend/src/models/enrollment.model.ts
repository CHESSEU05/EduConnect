import { Schema, model } from "mongoose";

import {
  enrollmentStatuses,
  type EnrollmentModel,
  type IEnrollment,
} from "../types/enrollment.js";

const enrollmentSchema = new Schema<IEnrollment, EnrollmentModel>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required."],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required."],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: enrollmentStatuses,
        message: "Enrollment status is invalid.",
      },
      default: "active",
    },
    progressPercentage: {
      type: Number,
      required: true,
      min: [0, "Progress cannot be below 0."],
      max: [100, "Progress cannot exceed 100."],
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    enrolledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, createdAt: -1 });
enrollmentSchema.index({ course: 1, createdAt: -1 });
enrollmentSchema.index({ course: 1, status: 1 });

export const Enrollment = model<IEnrollment, EnrollmentModel>(
  "Enrollment",
  enrollmentSchema,
);
