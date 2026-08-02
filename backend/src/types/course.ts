import type { HydratedDocument, Model, Types } from "mongoose";

export const courseLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "all-levels",
] as const;

export const courseStatuses = ["draft", "published", "archived"] as const;

export const courseCurrencies = ["XAF"] as const;

export type CourseLevel = (typeof courseLevels)[number];

export type CourseStatus = (typeof courseStatuses)[number];

export type CourseCurrency = (typeof courseCurrencies)[number];

export interface ICourseModule {
  _id?: Types.ObjectId;
  title: string;
  description?: string | null;
  textContent?: string | null;
  videoUrl?: string | null;
  resourceUrl?: string | null;
  order: number;
  isPreview: boolean;
}

export interface ICourse {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: Types.ObjectId;
  instructor: Types.ObjectId;
  level: CourseLevel;
  language: string;
  thumbnailUrl?: string | null;
  isFree: boolean;
  price: number;
  currency: CourseCurrency;
  status: CourseStatus;
  modules: ICourseModule[];
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseDocument = HydratedDocument<ICourse>;

export type CourseModel = Model<ICourse>;
