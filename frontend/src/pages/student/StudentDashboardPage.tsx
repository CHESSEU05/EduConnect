import { GraduationCap } from 'lucide-react';

import { EmptyState } from '../../components/feedback/EmptyState';

export function StudentDashboardPage() {
  return (
    <main>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
          Student
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">
          Student dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Enrolled courses and learning progress will appear here later.
        </p>
      </header>
      <EmptyState
        action={
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
            <GraduationCap aria-hidden="true" className="h-4 w-4" />
            Student route guard active
          </span>
        }
        message="This protected placeholder confirms the student route is wired for future authentication."
        title="Student area ready"
      />
    </main>
  );
}
