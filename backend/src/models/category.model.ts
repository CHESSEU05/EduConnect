import { Schema, model } from "mongoose";

import type { CategoryModel, ICategory } from "../types/category.js";

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters long."],
      maxlength: [80, "Category name cannot exceed 80 characters."],
    },
    slug: {
      type: String,
      required: [true, "Category slug is required."],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Category description cannot exceed 300 characters."],
      default: null,
    },
    icon: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    displayOrder: {
      type: Number,
      required: true,
      min: [0, "Display order cannot be negative."],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Display order must be an integer.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1, displayOrder: 1 });

export const Category = model<ICategory, CategoryModel>(
  "Category",
  categorySchema,
);
