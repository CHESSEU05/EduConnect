import { Route, Routes } from 'react-router-dom';

import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { InstructorDashboardPage } from '../pages/instructor/InstructorDashboardPage';
import { CourseCataloguePage } from '../pages/public/CourseCataloguePage';
import { CourseDetailsPage } from '../pages/public/CourseDetailsPage';
import { HomePage } from '../pages/public/HomePage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<CourseCataloguePage />} path="courses" />
        <Route element={<CourseDetailsPage />} path="courses/:courseId" />
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
          </Route>
          <Route element={<RoleRoute allowedRoles={['instructor']} />}>
            <Route element={<InstructorDashboardPage />} path="instructor" />
          </Route>
        </Route>
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
