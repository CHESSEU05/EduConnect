import { BookOpen } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { Container } from '../../components/common/Container';
import { EmptyState } from '../../components/feedback/EmptyState';

export function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <main>
      <Container className="py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
            Course details
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Course overview
          </h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Route parameter: {courseId ?? 'unknown'}
          </p>
        </header>
        <EmptyState
          action={
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              Public details route ready
            </span>
          }
          message="Detailed course content will be loaded after the course API milestone."
          title="Course details placeholder"
        />
      </Container>
    </main>
  );
}
