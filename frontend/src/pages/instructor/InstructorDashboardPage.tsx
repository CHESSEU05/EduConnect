import { Presentation } from 'lucide-react';

import { EmptyState } from '../../components/feedback/EmptyState';

export function InstructorDashboardPage() {
  return (
    <main>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
          Instructor
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">
          Instructor dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Course management tools will appear here after the instructor
          milestones.
        </p>
      </header>
      <EmptyState
        action={
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
            <Presentation aria-hidden="true" className="h-4 w-4" />
            Instructor route guard active
          </span>
        }
        message="This protected placeholder confirms the instructor route is wired for future authentication."
        title="Instructor area ready"
      />
    </main>
  );
}
