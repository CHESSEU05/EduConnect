import { ArrowRight, CheckCircle2, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Container } from '../../components/common/Container';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { useApiHealth } from '../../hooks/useApiHealth';

type ApiStatus = 'checking' | 'connected' | 'unavailable';

const statusContent: Record<ApiStatus, { label: string; className: string }> = {
  checking: {
    label: 'Checking API...',
    className: 'border-slate-200 bg-surface text-text-secondary',
  },
  connected: {
    label: 'API connected',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  unavailable: {
    label: 'API unavailable',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
};

export function HomePage() {
  const { data, errorMessage, status: healthStatus } = useApiHealth();
  const apiStatus: ApiStatus =
    healthStatus === 'loading'
      ? 'checking'
      : healthStatus === 'success'
        ? 'connected'
        : 'unavailable';

  const status = statusContent[apiStatus];

  return (
    <main>
      <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="max-w-3xl">
          <div
            className={`mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold shadow-sm ${status.className}`}
            title={errorMessage ?? data?.message ?? undefined}
          >
            {apiStatus === 'checking' ? (
              <LoadingSpinner label="Checking API" />
            ) : null}
            {apiStatus === 'connected' ? (
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            ) : null}
            {apiStatus === 'unavailable' ? (
              <WifiOff aria-hidden="true" className="h-4 w-4" />
            ) : null}
            <span>{status.label}</span>
          </div>

          <h1 className="max-w-2xl text-4xl font-bold text-brand-navy sm:text-5xl">
            Practical learning for Cameroonian students and instructors.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            EduConnect is being prepared as a mobile-first course platform for
            learners, tutors, instructors, and small training organisations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
              to="/courses"
            >
              Browse courses
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-slate-300 bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-brand-blue hover:text-brand-blue sm:w-auto"
              to="/register"
            >
              Create account
            </Link>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary">
            MVP foundation
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-text-secondary">
            <li>Public course discovery routes are ready.</li>
            <li>Student and instructor route guards are scaffolded.</li>
            <li>API calls flow through one Axios client.</li>
          </ul>
        </aside>
      </Container>
    </main>
  );
}
