import { BookOpen, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getInstructorCourseRequest } from '../../api/course.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Course } from '../../types/course';
import { formatXaf } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';

export function InstructorCourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  useDocumentTitle(course?.title ?? 'Instructor Course');

  const load = async () => {
    if (!courseId) {
      setError('Course id is missing.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      setCourse(await getInstructorCourseRequest(courseId));
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, [courseId]);

  if (status === 'loading') {
    return <PageLoader message="Loading course" />;
  }

  if (status === 'error' || !course) {
    return (
      <ErrorMessage
        action={<Button onClick={() => void load()}>Retry</Button>}
        message={error ?? 'Course could not be loaded.'}
        title="Unable to load course"
      />
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge tone={course.status === 'published' ? 'green' : 'amber'}>
            {course.status}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-brand-navy">{course.title}</h1>
          <p className="mt-2 text-text-secondary">{course.shortDescription}</p>
        </div>
        <Link className="inline-flex min-h-11 items-center rounded-md bg-brand-blue px-4 text-sm font-bold text-white" to={`/instructor/courses/${course.id}/edit`}>
          Edit course
        </Link>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <Users className="h-5 w-5 text-brand-blue" />
          <p className="mt-2 text-2xl font-bold text-brand-navy">{course.enrollmentCount}</p>
          <p className="text-sm text-text-secondary">Students</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <BookOpen className="h-5 w-5 text-brand-green" />
          <p className="mt-2 text-2xl font-bold text-brand-navy">{course.moduleCount}</p>
          <p className="text-sm text-text-secondary">Modules</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-brand-navy">
            {course.isFree ? 'Free' : formatXaf(course.price)}
          </p>
          <p className="text-sm text-text-secondary">Price</p>
        </div>
      </section>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-brand-navy">Modules</h2>
        <div className="mt-4 space-y-3">
          {course.modules?.map((module) => (
            <article className="rounded-md border border-slate-200 p-3" key={module.id}>
              <h3 className="font-bold text-brand-navy">{module.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{module.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
