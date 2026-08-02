import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { Review, ReviewListData, ReviewRequest } from '../types/review';

export const listCourseReviewsRequest = async (
  courseId: string,
  page = 1,
): Promise<ReviewListData> => {
  const response = await apiClient.get<ApiResponse<ReviewListData>>(
    `/courses/${courseId}/reviews`,
    {
      params: { page },
    },
  );

  return response.data.data;
};

export const createCourseReviewRequest = async (
  courseId: string,
  input: ReviewRequest,
): Promise<Review> => {
  const response = await apiClient.post<ApiResponse<{ review: Review }>>(
    `/courses/${courseId}/reviews`,
    input,
  );

  return response.data.data.review;
};

export const updateMyCourseReviewRequest = async (
  courseId: string,
  input: Partial<ReviewRequest>,
): Promise<Review> => {
  const response = await apiClient.patch<ApiResponse<{ review: Review }>>(
    `/courses/${courseId}/reviews/me`,
    input,
  );

  return response.data.data.review;
};

export const deleteMyCourseReviewRequest = async (
  courseId: string,
): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/reviews/me`);
};

export const listInstructorCourseReviewsRequest = async (
  courseId: string,
  page = 1,
): Promise<ReviewListData> => {
  const response = await apiClient.get<ApiResponse<ReviewListData>>(
    `/instructor/courses/${courseId}/reviews`,
    {
      params: { page },
    },
  );

  return response.data.data;
};
