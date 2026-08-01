import { Search } from 'lucide-react';

import { Container } from '../../components/common/Container';
import { EmptyState } from '../../components/feedback/EmptyState';

export function CourseCataloguePage() {
  return (
    <main>
      <Container className="py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
            Courses
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Course catalogue
          </h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Published courses will appear here once course APIs and catalogue
            data are implemented.
          </p>
        </header>
        <EmptyState
          action={
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
              <Search aria-hidden="true" className="h-4 w-4" />
              Catalogue placeholder
            </span>
          }
          message="Search, filters, and course cards will be connected in a later course milestone."
          title="No courses loaded yet"
        />
      </Container>
    </main>
  );
}
