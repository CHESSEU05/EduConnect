import { Navigate, Outlet } from 'react-router-dom';

import { PageLoader } from '../components/feedback/PageLoader';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

type RoleRouteProps = {
  allowedRoles: UserRole[];
};

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { isLoading, role } = useAuth();

  if (isLoading) {
    return <PageLoader message="Checking your access" />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate replace to="/unauthorized" />;
  }

  return <Outlet />;
}
