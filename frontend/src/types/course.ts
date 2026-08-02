import type { Pagination } from './api';
import type { SafeUserProfile } from './user';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all-levels';

export type CourseStatus = 'draft' | 'published' | 'archived';

export type CourseSort =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'popular';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export type CourseModule = {
  id: string;
  title: string;
  description: string | null;
  textContent?: string | null;
  videoUrl?: string | null;
  resourceUrl?: string | null;
  order: number;
  isPreview: boolean;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  category: Category;
  instructor: SafeUserProfile;
  level: CourseLevel;
  language: string;
  thumbnailUrl: string | null;
  isFree: boolean;
  price: number;
  currency: 'XAF';
  status?: CourseStatus;
  modules?: CourseModule[];
  moduleCount: number;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CourseListData = {
  courses: Course[];
  pagination: Pagination;
};

export type PublicCourseQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: CourseLevel;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  sort?: CourseSort;
};

export type InstructorCourseQuery = {
  page?: number;
  limit?: number;
  status?: CourseStatus;
  search?: string;
};

export type CourseModuleInput = {
  title: string;
  description?: string | null;
  textContent?: string | null;
  videoUrl?: string | null;
  resourceUrl?: string | null;
  isPreview: boolean;
};

export type CourseFormRequest = {
  title: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  language: string;
  thumbnailUrl?: string | null;
  isFree: boolean;
  price: number;
  modules: CourseModuleInput[];
};
