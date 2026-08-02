import { Schema, model } from "mongoose";

import {
  courseCurrencies,
  courseLevels,
  courseStatuses,
  type CourseModel,
  type ICourse,
  type ICourseModule,
} from "../types/course.js";

const urlPattern = /^https?:\/\/.+/i;

const optionalUrl = {
  validator(value: string | null | undefined): boolean {
    return !value || urlPattern.test(value);
  },
  message: "URL must be a valid HTTP or HTTPS URL.",
};

const courseModuleSchema = new Schema<ICourseModule>(
  {
    title: {
      type: String,
      required: [true, "Module title is required."],
      trim: true,
      minlength: [3, "Module title must be at least 3 characters long."],
      maxlength: [120, "Module title cannot exceed 120 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Module description cannot exceed 500 characters."],
      default: null,
    },
    textContent: {
      type: String,
      trim: true,
      default: null,
    },
    videoUrl: {
      type: String,
      trim: true,
      validate: optionalUrl,
      default: null,
    },
    resourceUrl: {
      type: String,
      trim: true,
      validate: optionalUrl,
      default: null,
    },
    order: {
      type: Number,
      required: [true, "Module order is required."],
      min: [0, "Module order cannot be negative."],
      validate: {
        validator: Number.isInteger,
        message: "Module order must be an integer.",
      },
    },
    isPreview: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const courseSchema = new Schema<ICourse, CourseModel>(
  {
    title: {
      type: String,
      required: [true, "Course title is required."],
      trim: true,
      minlength: [5, "Course title must be at least 5 characters long."],
      maxlength: [120, "Course title cannot exceed 120 characters."],
    },
    slug: {
      type: String,
      required: [true, "Course slug is required."],
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required."],
      trim: true,
      minlength: [
        20,
        "Short description must be at least 20 characters long.",
      ],
      maxlength: [200, "Short description cannot exceed 200 characters."],
    },
    description: {
      type: String,
      required: [true, "Course description is required."],
      trim: true,
      minlength: [50, "Description must be at least 50 characters long."],
      maxlength: [5000, "Description cannot exceed 5000 characters."],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required."],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required."],
    },
    level: {
      type: String,
      required: [true, "Course level is required."],
      enum: {
        values: courseLevels,
        message: "Course level is invalid.",
      },
    },
    language: {
      type: String,
      required: [true, "Course language is required."],
      trim: true,
      minlength: [2, "Language must be at least 2 characters long."],
      maxlength: [50, "Language cannot exceed 50 characters."],
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      validate: optionalUrl,
      default: null,
    },
    isFree: {
      type: Boolean,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Course price is required."],
      min: [0, "Course price cannot be negative."],
    },
    currency: {
      type: String,
      required: true,
      enum: {
        values: courseCurrencies,
        message: "Currency must be XAF.",
      },
      default: "XAF",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: courseStatuses,
        message: "Course status is invalid.",
      },
      default: "draft",
    },
    modules: {
      type: [courseModuleSchema],
      default: [],
      validate: {
        validator(modules: ICourseModule[]): boolean {
          return modules.every(
            (module) =>
              Boolean(module.textContent) ||
              Boolean(module.videoUrl) ||
              Boolean(module.resourceUrl),
          );
        },
        message:
          "Each module must include text content, a video URL, or a resource URL.",
      },
    },
    averageRating: {
      type: Number,
      required: true,
      min: [0, "Average rating cannot be negative."],
      max: [5, "Average rating cannot exceed 5."],
      default: 0,
    },
    reviewCount: {
      type: Number,
      required: true,
      min: [0, "Review count cannot be negative."],
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      required: true,
      min: [0, "Enrollment count cannot be negative."],
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

type ValidatableCourse = ICourse & {
  invalidate(path: string, message: string): void;
};

courseSchema.pre("validate", function validatePricing() {
  const course = this as unknown as ValidatableCourse;

  if (course.price < 0) {
    return;
  }

  if (course.isFree && course.price !== 0) {
    course.invalidate("price", "Free courses must have a price of 0.");
  }

  if (!course.isFree && course.price <= 0) {
    course.invalidate("price", "Paid courses must have a price greater than 0.");
  }
});

courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ instructor: 1, createdAt: -1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ level: 1, status: 1 });
courseSchema.index({ isFree: 1, price: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({
  title: "text",
  shortDescription: "text",
  description: "text",
});

export const Course = model<ICourse, CourseModel>("Course", courseSchema);
