import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { Container } from '../components/common/Container';
import { Logo } from '../components/common/Logo';
import { cn } from '../utils/cn';

const publicLinks = [
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/login', label: 'Log in', icon: LogIn },
  { to: '/register', label: 'Register', icon: UserPlus },
];

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-page-background text-text-primary">
      <header className="border-b border-slate-200 bg-surface/95 backdrop-blur">
        <Container className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Logo />
          <nav aria-label="Public navigation" className="flex flex-wrap gap-1">
            {publicLinks.map(({ icon: Icon, label, to }) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-text-secondary transition hover:bg-slate-100 hover:text-text-primary',
                    isActive && 'bg-primary-50 text-brand-blue',
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
        </Container>
      </header>
      <Outlet />
    </div>
  );
}
