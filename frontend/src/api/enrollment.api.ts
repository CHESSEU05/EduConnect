import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  Enrollment,
  EnrollmentListData,
  InstructorEnrollmentListData,
  StudentEnrollmentQuery,
} from '../types/enrollment';

const toSearchParams = (query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return params;
};

export const listMyEnrollmentsRequest = async (
  query: StudentEnrollmentQuery = {},
): Promise<EnrollmentListData> => {
  const response = await apiClient.get<ApiResponse<EnrollmentListData>>(
    '/students/me/enrollments',
    {
      params: toSearchParams(query),
    },
  );

  return response.data.data;
};

export const getMyEnrollmentRequest = async (
  courseId: string,
): Promise<Enrollment> => {
  const response = await apiClient.get<ApiResponse<{ enrollment: Enrollment }>>(
    `/students/me/enrollments/${courseId}`,
  );

  return response.data.data.enrollment;
};

export const updateMyEnrollmentProgressRequest = async (
  courseId: string,
  progressPercentage: number,
): Promise<Enrollment> => {
  const response = await apiClient.patch<ApiResponse<{ enrollment: Enrollment }>>(
    `/students/me/enrollments/${courseId}/progress`,
    {
      progressPercentage,
    },
  );

  return response.data.data.enrollment;
};

export const listInstructorCourseEnrollmentsRequest = async (
  courseId: string,
  query: StudentEnrollmentQuery = {},
): Promise<InstructorEnrollmentListData> => {
  const response = await apiClient.get<ApiResponse<InstructorEnrollmentListData>>(
    `/instructor/courses/${courseId}/enrollments`,
    {
      params: toSearchParams(query),
    },
  );

  return response.data.data;
};
