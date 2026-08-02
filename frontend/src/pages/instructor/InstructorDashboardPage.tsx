import { Archive, BookOpen, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getInstructorDashboardRequest,
  type InstructorDashboardData,
} from '../../api/instructor.api';
import { StatCard } from '../../components/dashboard/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../utils/errors';

export function InstructorDashboardPage() {
  useDocumentTitle('Instructor Dashboard');
  const { user } = useAuth();
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setStatus('loading');
    setError(null);

    try {
      setData(await getInstructorDashboardRequest());
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <header className="soft-panel reveal-up mb-6 flex flex-wrap items-start justify-between gap-4 rounded-lg p-5">
        <div>
          <p className="text-sm font-bold uppercase text-brand-blue">Instructor dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Welcome back, {user?.firstName ?? 'instructor'}
          </h1>
          <p className="mt-2 text-text-secondary">
            Manage courses, students, reviews, and publishing progress.
          </p>
        </div>
        <Link
          className="btn-primary-polish shine inline-flex min-h-11 items-center rounded-md bg-brand-blue px-4 text-sm font-bold text-white"
          to="/instructor/courses/new"
        >
          Create course
        </Link>
      </header>
      {status === 'loading' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock className="h-28" key={index} />
          ))}
        </div>
      ) : null}
      {status === 'error' ? (
        <ErrorMessage
          action={<Button onClick={() => void load()}>Retry</Button>}
          message={error ?? 'Dashboard could not be loaded.'}
          title="Unable to load dashboard"
        />
      ) : null}
      {status === 'success' && data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Total courses" value={data.totalCourses} />
            <StatCard icon={Users} label="Total enrolments" tone="green" value={data.totalEnrollments} />
            <StatCard icon={Archive} label="Drafts / archived" tone="amber" value={`${data.draftCourses}/${data.archivedCourses}`} />
            <StatCard icon={Star} label="Average rating" tone="navy" value={data.averageRating.toFixed(1)} />
          </section>
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-brand-navy">Top courses</h2>
              <div className="mt-4 space-y-3">
                {data.topCourses.length === 0 ? (
                  <EmptyState message="Create and publish a course to see performance." title="No courses yet" />
                ) : (
                  data.topCourses.map((course) => (
                    <Link
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 hover:border-brand-blue"
                      key={course.id}
                      to={`/instructor/courses/${course.id}`}
                    >
                      <div>
                        <p className="font-bold text-brand-navy">{course.title}</p>
                        <p className="text-sm text-text-secondary">
                          {course.enrollmentCount} students · {course.reviewCount} reviews
                        </p>
                      </div>
                      <Badge tone={course.status === 'published' ? 'green' : 'amber'}>
                        {course.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-brand-navy">Recent reviews</h2>
              <div className="mt-4 space-y-3">
                {data.recentReviews.length === 0 ? (
                  <EmptyState message="Student reviews will appear here." title="No reviews yet" />
                ) : (
                  data.recentReviews.map((review) => (
                    <article className="rounded-md border border-slate-200 p-3" key={review.id}>
                      <p className="font-bold text-brand-navy">
                        {review.student.firstName} {review.student.lastName}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">{review.comment}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
