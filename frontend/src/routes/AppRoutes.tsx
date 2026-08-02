import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CourseReviewsPage } from '../pages/instructor/CourseReviewsPage';
import { CourseStudentsPage } from '../pages/instructor/CourseStudentsPage';
import { CreateCoursePage } from '../pages/instructor/CreateCoursePage';
import { EditCoursePage } from '../pages/instructor/EditCoursePage';
import { InstructorCourseDetailsPage } from '../pages/instructor/InstructorCourseDetailsPage';
import { InstructorCoursesPage } from '../pages/instructor/InstructorCoursesPage';
import { InstructorDashboardPage } from '../pages/instructor/InstructorDashboardPage';
import { InstructorProfilePage } from '../pages/instructor/InstructorProfilePage';
import { InstructorSettingsPage } from '../pages/instructor/InstructorSettingsPage';
import { CourseCataloguePage } from '../pages/public/CourseCataloguePage';
import { CourseDetailsPage } from '../pages/public/CourseDetailsPage';
import { HomePage } from '../pages/public/HomePage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { LearningPage } from '../pages/student/LearningPage';
import { MyCoursesPage } from '../pages/student/MyCoursesPage';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentSettingsPage } from '../pages/student/StudentSettingsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<CourseCataloguePage />} path="courses" />
        <Route element={<CourseDetailsPage />} path="courses/:slug" />
        <Route element={<UnauthorizedPage />} path="unauthorized" />
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<LoginPage />} path="login" />
        <Route element={<RegisterPage />} path="register" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route element={<StudentDashboardPage />} path="student" />
            <Route element={<MyCoursesPage />} path="student/my-courses" />
            <Route element={<LearningPage />} path="student/courses/:courseId/learn" />
            <Route element={<StudentProfilePage />} path="student/profile" />
            <Route element={<StudentSettingsPage />} path="student/settings" />
          </Route>
          <Route element={<RoleRoute allowedRoles={['instructor']} />}>
            <Route element={<InstructorDashboardPage />} path="instructor" />
            <Route element={<InstructorCoursesPage />} path="instructor/courses" />
            <Route element={<CreateCoursePage />} path="instructor/courses/new" />
            <Route
              element={<InstructorCourseDetailsPage />}
              path="instructor/courses/:courseId"
            />
            <Route
              element={<EditCoursePage />}
              path="instructor/courses/:courseId/edit"
            />
            <Route
              element={<CourseStudentsPage />}
              path="instructor/courses/:courseId/students"
            />
            <Route
              element={<CourseReviewsPage />}
              path="instructor/courses/:courseId/reviews"
            />
            <Route element={<InstructorProfilePage />} path="instructor/profile" />
            <Route element={<InstructorSettingsPage />} path="instructor/settings" />
          </Route>
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="/home" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
