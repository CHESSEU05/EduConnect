import { Award, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { listMyEnrollmentsRequest } from '../../api/enrollment.api';
import { CourseCard } from '../../components/courses/CourseCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Enrollment } from '../../types/enrollment';
import { getErrorMessage } from '../../utils/errors';

export function StudentDashboardPage() {
  useDocumentTitle('Student Dashboard');
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setStatus('loading');
    setError(null);

    try {
      const data = await listMyEnrollmentsRequest({ limit: 6, sort: 'recently-accessed' });
      setEnrollments(data.enrollments);
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const completed = enrollments.filter((item) => item.status === 'completed').length;
    const active = enrollments.filter((item) => item.status === 'active').length;

    return { active, completed, total: enrollments.length };
  }, [enrollments]);

  return (
    <div>
      <header className="soft-panel reveal-up mb-6 rounded-lg p-5">
        <p className="text-sm font-bold uppercase text-brand-blue">Student dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">
          Hi, {user?.firstName ?? 'learner'}
        </h1>
        <p className="mt-2 text-text-secondary">
          Continue your learning journey and track your enrolled courses.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Enrolled courses" value={stats.total} />
        <StatCard icon={Clock} label="Active courses" tone="amber" value={stats.active} />
        <StatCard icon={CheckCircle2} label="Completed" tone="green" value={stats.completed} />
        <StatCard icon={Award} label="Certificates" tone="navy" value={stats.completed} />
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-brand-navy">Continue learning</h2>
          <Link className="text-sm font-bold text-brand-blue" to="/student/my-courses">
            My courses
          </Link>
        </div>
        {status === 'loading' ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <SkeletonBlock className="h-80" key={index} />
            ))}
          </div>
        ) : null}
        {status === 'error' ? (
          <ErrorMessage
            action={<Button onClick={() => void load()}>Retry</Button>}
            message={error ?? 'Enrollments could not be loaded.'}
            title="Unable to load dashboard"
          />
        ) : null}
        {status === 'success' && enrollments.length === 0 ? (
          <EmptyState
            action={
              <Link className="font-bold text-brand-blue" to="/courses">
                Browse courses
              </Link>
            }
            message="Your enrolled courses will appear here after you join a course."
            title="No courses yet"
          />
        ) : null}
        {status === 'success' && enrollments.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {enrollments.slice(0, 3).map((enrollment) => (
              <CourseCard
                actionLabel={
                  enrollment.status === 'completed' ? 'View course' : 'Continue'
                }
                course={enrollment.course}
                enrollmentStatus={enrollment.status}
                href={`/student/courses/${enrollment.course.id}/learn`}
                key={enrollment.id}
                progressPercentage={enrollment.progressPercentage}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
