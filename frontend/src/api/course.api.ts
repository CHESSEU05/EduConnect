import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  Course,
  CourseFormRequest,
  CourseListData,
  InstructorCourseQuery,
  PublicCourseQuery,
} from '../types/course';

const toSearchParams = (query: Record<string, string | number | boolean | undefined>) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return params;
};

export const listPublicCoursesRequest = async (
  query: PublicCourseQuery,
): Promise<CourseListData> => {
  const response = await apiClient.get<ApiResponse<CourseListData>>('/courses', {
    params: toSearchParams(query),
  });

  return response.data.data;
};

export const getPublicCourseRequest = async (slug: string): Promise<Course> => {
  const response = await apiClient.get<ApiResponse<{ course: Course }>>(
    `/courses/${slug}`,
  );

  return response.data.data.course;
};

export const listInstructorCoursesRequest = async (
  query: InstructorCourseQuery,
): Promise<CourseListData> => {
  const response = await apiClient.get<ApiResponse<CourseListData>>(
    '/instructor/courses',
    {
      params: toSearchParams(query),
    },
  );

  return response.data.data;
};

export const getInstructorCourseRequest = async (
  courseId: string,
): Promise<Course> => {
  const response = await apiClient.get<ApiResponse<{ course: Course }>>(
    `/instructor/courses/${courseId}`,
  );

  return response.data.data.course;
};

export const createInstructorCourseRequest = async (
  input: CourseFormRequest,
): Promise<Course> => {
  const response = await apiClient.post<ApiResponse<{ course: Course }>>(
    '/instructor/courses',
    input,
  );

  return response.data.data.course;
};

export const updateInstructorCourseRequest = async (
  courseId: string,
  input: Partial<CourseFormRequest>,
): Promise<Course> => {
  const response = await apiClient.patch<ApiResponse<{ course: Course }>>(
    `/instructor/courses/${courseId}`,
    input,
  );

  return response.data.data.course;
};

export const publishInstructorCourseRequest = async (
  courseId: string,
): Promise<Course> => {
  const response = await apiClient.patch<ApiResponse<{ course: Course }>>(
    `/instructor/courses/${courseId}/publish`,
  );

  return response.data.data.course;
};

export const archiveInstructorCourseRequest = async (
  courseId: string,
): Promise<Course> => {
  const response = await apiClient.patch<ApiResponse<{ course: Course }>>(
    `/instructor/courses/${courseId}/archive`,
  );

  return response.data.data.course;
};

export const deleteInstructorCourseRequest = async (
  courseId: string,
): Promise<void> => {
  await apiClient.delete(`/instructor/courses/${courseId}`);
};

export const enrollInCourseRequest = async (
  courseId: string,
): Promise<{ id: string }> => {
  const response = await apiClient.post<ApiResponse<{ enrollment: { id: string } }>>(
    `/courses/${courseId}/enroll`,
  );

  return response.data.data.enrollment;
};
