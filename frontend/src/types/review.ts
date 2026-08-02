import type { Pagination } from './api';
import type { SafeUserProfile } from './user';

export type Review = {
  id: string;
  rating: number;
  comment: string;
  student: SafeUserProfile;
  createdAt: string;
  updatedAt: string;
};

export type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
  ratingCounts?: Record<string, number>;
};

export type ReviewListData = {
  reviews: Review[];
  summary: ReviewSummary;
  pagination: Pagination;
};

export type ReviewRequest = {
  rating: number;
  comment: string;
};
