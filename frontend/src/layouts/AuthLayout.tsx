import { BookOpenCheck, GraduationCap, ShieldCheck, Wifi } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Logo } from '../components/common/Logo';

export function AuthLayout() {
  return (
    <main className="app-shell grid min-h-screen p-4 text-text-primary lg:grid-cols-[0.9fr_1.1fr]">
      <section className="auth-showcase hidden overflow-hidden rounded-lg p-8 lg:flex lg:flex-col lg:justify-between">
        <Logo size="large" />
        <div className="reveal-up">
          <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700 ring-1 ring-emerald-100">
            Learn. Grow. Succeed.
          </p>
          <p className="mt-4 max-w-md text-4xl font-extrabold leading-tight text-brand-navy">
            Join a practical learning community built for Cameroon.
          </p>
          <p className="mt-4 max-w-md text-text-secondary">
            Discover courses, teach what you know, and keep learning even on
            smaller screens and unstable networks.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="elevated-card rounded-lg border border-slate-200 bg-white p-4">
              <BookOpenCheck className="h-6 w-6 text-brand-blue" />
              <p className="mt-3 text-xl font-extrabold text-brand-navy">80+</p>
              <p className="mt-1 text-xs font-bold uppercase text-text-secondary">
                Courses planned
              </p>
            </div>
            <div className="elevated-card rounded-lg border border-slate-200 bg-white p-4">
              <GraduationCap className="h-6 w-6 text-brand-green" />
              <p className="mt-3 text-xl font-extrabold text-brand-navy">2k+</p>
              <p className="mt-1 text-xs font-bold uppercase text-text-secondary">
                Learner goal
              </p>
            </div>
          </div>
          <div className="mt-5 max-w-md rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-brand-blue">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-brand-navy">Secure learning access</p>
                <p className="text-sm text-text-secondary">
                  Profiles, dashboards, and course access stay role-aware.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3">
          <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
            <Wifi className="h-4 w-4 text-brand-green" />
            Optimized for mobile and unstable networks.
            </div>
          </div>
        </div>
      </section>
      <section className="grid place-items-center py-6">
        <div className="soft-panel reveal-up w-full max-w-3xl rounded-lg p-5 sm:p-6">
          <div className="mb-8 lg:hidden">
            <Logo size="large" />
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
