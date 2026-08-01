import { GraduationCap, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/common/Button';
import { Container } from '../components/common/Container';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const dashboardLinks = [
  { to: '/student', label: 'Student', icon: GraduationCap },
  { to: '/instructor', label: 'Instructor', icon: LayoutDashboard },
];

export function DashboardLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-page-background text-text-primary">
      <header className="border-b border-slate-200 bg-surface/95 backdrop-blur">
        <Container className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Logo />
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-text-secondary">
              <UserRound aria-hidden="true" className="h-4 w-4" />
              {user?.fullName ?? 'Authenticated user'}
            </span>
            <Button aria-label="Log out" onClick={logout} variant="ghost">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </Container>
      </header>
      <Container className="grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Dashboard navigation"
          className="flex gap-2 overflow-x-auto lg:flex-col"
        >
          {dashboardLinks.map(({ icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold text-text-secondary transition hover:bg-slate-100 hover:text-text-primary',
                  isActive &&
                    'bg-brand-navy text-white hover:bg-brand-navy hover:text-white',
                )
              }
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </Container>
    </div>
  );
}
