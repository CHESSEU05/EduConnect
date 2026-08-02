import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { CourseStatus } from '../types/course';
import type { SafeUserProfile } from '../types/user';

export type InstructorDashboardData = {
  totalCourses: number;
  draftCourses: number;
  publishedCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  totalReviews: number;
  averageRating: number;
  recentEnrollments: Array<{
    id: string;
    student: SafeUserProfile;
    courseId: string;
    enrolledAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    student: SafeUserProfile;
    courseId: string;
    createdAt: string;
  }>;
  topCourses: Array<{
    id: string;
    title: string;
    slug: string;
    status: CourseStatus;
    enrollmentCount: number;
    averageRating: number;
    reviewCount: number;
  }>;
};

export const getInstructorDashboardRequest =
  async (): Promise<InstructorDashboardData> => {
    const response = await apiClient.get<
      ApiResponse<{ dashboard: InstructorDashboardData }>
    >('/instructor/dashboard');

    return response.data.data.dashboard;
  };
