import { Schema, model } from "mongoose";

import type { IReview, ReviewModel } from "../types/review.js";

const reviewSchema = new Schema<IReview, ReviewModel>(
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
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [1, "Rating cannot be below 1."],
      max: [5, "Rating cannot exceed 5."],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer.",
      },
    },
    comment: {
      type: String,
      required: [true, "Comment is required."],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters long."],
      maxlength: [1000, "Comment cannot exceed 1000 characters."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ student: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ course: 1, rating: -1 });
reviewSchema.index({ student: 1, createdAt: -1 });

export const Review = model<IReview, ReviewModel>("Review", reviewSchema);
