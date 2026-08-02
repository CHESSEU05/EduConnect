import { BookOpen, GraduationCap, LogIn, Menu, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/common/Button';
import { Container } from '../components/common/Container';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const publicLinks = [
  { to: '/courses', label: 'Courses' },
];

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dashboardPath = role === 'instructor' ? '/instructor' : '/student';

  return (
    <div className="app-shell min-h-screen text-text-primary">
      <header className="glass-nav sticky top-0 z-40 border-b border-white/70 backdrop-blur-xl">
        <Container className="flex min-h-22 items-center justify-between gap-3 py-2">
          <Logo size="large" />
          <nav
            aria-label="Public navigation"
            className="hidden items-center gap-1 md:flex"
          >
            <NavLink className="nav-link" end to="/">
              Home
            </NavLink>
            {publicLinks.map(({ label, to }) => (
              <NavLink
                className={({ isActive }) =>
                  cn('nav-link', isActive && 'bg-primary-50 text-brand-blue')
                }
                key={to}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <NavLink
                className="btn-primary-polish shine inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-blue px-4 text-sm font-bold text-white hover:bg-primary-700"
                to={dashboardPath}
              >
                <GraduationCap aria-hidden="true" className="h-4 w-4" />
                Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-text-secondary transition hover:bg-primary-50 hover:text-brand-blue"
                  to="/login"
                >
                  <LogIn aria-hidden="true" className="h-4 w-4" />
                  Log in
                </NavLink>
                <NavLink
                  className="btn-primary-polish shine inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-blue px-4 text-sm font-bold text-white hover:bg-primary-700"
                  to="/register"
                >
                  <UserPlus aria-hidden="true" className="h-4 w-4" />
                  Sign up
                </NavLink>
              </>
            )}
          </div>
          <Button
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            className="md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            variant="ghost"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </Button>
        </Container>
        {isMenuOpen ? (
          <Container className="grid gap-2 pb-4 md:hidden">
            <NavLink
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              to="/"
            >
              Home
            </NavLink>
            <NavLink
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              to="/courses"
            >
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              Courses
            </NavLink>
            <NavLink
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              to={isAuthenticated ? dashboardPath : '/login'}
            >
              {isAuthenticated ? 'Dashboard' : 'Log in'}
            </NavLink>
          </Container>
        ) : null}
      </header>
      <Outlet />
      <footer className="border-t border-slate-200 bg-white/90 backdrop-blur">
        <Container className="grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Logo size="default" />
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Mobile-first online learning for Cameroonian students,
              independent learners, tutors, and small training organisations.
            </p>
          </div>
          <p className="text-sm font-semibold text-text-secondary">
            Learn. Grow. Succeed.
          </p>
        </Container>
      </footer>
    </div>
  );
}
