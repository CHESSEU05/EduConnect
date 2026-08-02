import type { Pagination } from './api';
import type { Course } from './course';
import type { SafeUserProfile } from './user';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export type Enrollment = {
  id: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  course: Course;
};

export type EnrollmentListData = {
  enrollments: Enrollment[];
  pagination: Pagination;
};

export type StudentEnrollmentQuery = {
  page?: number;
  limit?: number;
  status?: EnrollmentStatus;
  search?: string;
  sort?: 'newest' | 'oldest' | 'recently-accessed' | 'progress';
};

export type InstructorEnrollment = {
  id: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  lastAccessedAt: string | null;
  enrolledAt: string;
  student: SafeUserProfile;
};

export type InstructorEnrollmentListData = {
  enrollments: InstructorEnrollment[];
  pagination: Pagination;
};
