import {
  Bell,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const studentLinks = [
  { to: '/student', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/student/my-courses', label: 'My Courses', shortLabel: 'Courses', icon: BookOpen, end: true },
  { to: '/student/profile', label: 'Profile', shortLabel: 'Profile', icon: UserRound },
  { to: '/student/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

const instructorLinks = [
  { to: '/instructor', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/instructor/courses', label: 'My Courses', shortLabel: 'Courses', icon: BookOpen, end: true },
  { to: '/instructor/courses/new', label: 'Create Course', shortLabel: 'Create', icon: PenLine, end: true },
  { to: '/instructor/profile', label: 'Profile', shortLabel: 'Profile', icon: UserRound },
  { to: '/instructor/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const { logout, role, user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const links = role === 'instructor' ? instructorLinks : studentLinks;
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'EduConnect user';
  const roleLabel =
    role === 'instructor' ? 'Instructor account' : role === 'student' ? 'Student account' : 'EduConnect account';

  const requestLogout = () => {
    setIsDrawerOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const nav = (
    <nav aria-label="Dashboard navigation" className="flex flex-col gap-1">
      {links.map(({ end, icon: Icon, label, to }) => (
        <NavLink
          className={({ isActive }) =>
            cn(
              'dashboard-nav-item inline-flex min-h-11 items-center gap-3 rounded-md px-3 pl-5 text-sm font-bold text-blue-100 transition hover:bg-white/10 hover:text-white',
              isActive &&
                'dashboard-nav-active bg-brand-blue text-white shadow-sm ring-1 ring-white/20 hover:bg-brand-blue hover:text-white',
            )
          }
          end={end}
          key={to}
          onClick={() => setIsDrawerOpen(false)}
          to={to}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  const accountPanel = (
    <div className="mt-6 rounded-lg border border-white/15 bg-white/10 p-3 text-white shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-brand-blue">
          <UserRound aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">{fullName}</p>
          <p className="text-xs font-bold text-blue-100">{roleLabel}</p>
        </div>
      </div>
      <Button
        className="mt-3 w-full justify-start border border-white/15 bg-white/10 pl-3 text-blue-50 hover:bg-white/15 hover:text-white"
        onClick={requestLogout}
        variant="ghost"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );

  return (
    <div className="app-shell min-h-screen pb-20 text-text-primary lg:grid lg:grid-cols-[260px_1fr] lg:pb-0">
      <aside className="dashboard-sidebar hidden min-h-screen flex-col p-4 text-white lg:flex">
        <Logo linkClassName="[&_span]:text-white" size="default" />
        <div className="mt-8 flex-1">{nav}</div>
        {accountPanel}
      </aside>
      <div className="min-w-0">
        <header className="glass-nav sticky top-0 z-30 border-b border-white/70 backdrop-blur-xl">
          <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              aria-expanded={isDrawerOpen}
              aria-label="Open dashboard navigation"
              className="lg:hidden"
              onClick={() => setIsDrawerOpen(true)}
              variant="ghost"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </Button>
            <div className="hidden items-center gap-2 text-sm font-semibold text-text-secondary sm:flex">
              <GraduationCap aria-hidden="true" className="h-4 w-4 text-brand-green" />
              Ready to continue your learning journey?
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button aria-label="Notifications" variant="ghost">
                <Bell aria-hidden="true" className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsDrawerOpen(false)}
            type="button"
          />
          <aside className="dashboard-sidebar relative h-full w-72 p-4 text-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <Logo linkClassName="[&_span]:text-white" size="default" />
                <Button
                  aria-label="Close navigation"
                  className="text-blue-100 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsDrawerOpen(false)}
                  variant="ghost"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-8 flex-1">{nav}</div>
              {accountPanel}
            </div>
          </aside>
        </div>
      ) : null}
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden">
        {links.slice(0, 4).map(({ end, icon: Icon, shortLabel, to }) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold text-text-secondary transition hover:bg-primary-50 hover:text-brand-blue',
                isActive && 'bg-brand-blue text-white shadow-sm hover:bg-brand-blue hover:text-white',
              )
            }
            end={end}
            key={to}
            to={to}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{shortLabel}</span>
          </NavLink>
        ))}
      </nav>
      <ConfirmDialog
        confirmLabel="Log out"
        isOpen={isLogoutConfirmOpen}
        message="You will need to log in again to access your dashboard and courses."
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
        title="Log out of EduConnect?"
      />
    </div>
  );
}
