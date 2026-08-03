import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listMyEnrollmentsRequest } from '../../api/enrollment.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Enrollment, EnrollmentListData, EnrollmentStatus } from '../../types/enrollment';
import { getErrorMessage } from '../../utils/errors';

export function MyCoursesPage() {
  useDocumentTitle('My Courses');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | EnrollmentStatus>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<EnrollmentListData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const result = await listMyEnrollmentsRequest({
        page,
        limit: 8,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sort: 'recently-accessed',
      });
      setData(result);
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  }, [debouncedSearch, page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <header className="soft-panel reveal-up mb-6 rounded-lg p-5">
        <p className="text-sm font-bold uppercase text-brand-blue">Learning</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-brand-navy sm:text-3xl">
          My courses
        </h1>
      </header>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search enrolled courses..."
            value={search}
          />
        </div>
        <Select
          aria-label="Enrollment status"
          onChange={(event) => {
            setStatusFilter(event.target.value as '' | EnrollmentStatus);
            setPage(1);
          }}
          value={statusFilter}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>
      {status === 'loading' ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock className="h-24" key={index} />
          ))}
        </div>
      ) : null}
      {status === 'error' ? (
        <ErrorMessage
          action={<Button onClick={() => void load()}>Retry</Button>}
          message={error ?? 'Courses could not be loaded.'}
          title="Unable to load courses"
        />
      ) : null}
      {status === 'success' && data?.enrollments.length === 0 ? (
        <EmptyState
          action={<Link className="font-bold text-brand-blue" to="/courses">Browse courses</Link>}
          message="Enroll in a published course to see it here."
          title="No enrolled courses"
        />
      ) : null}
      {status === 'success' && data && data.enrollments.length > 0 ? (
        <div className="space-y-3">
          {data.enrollments.map((enrollment: Enrollment) => (
            <article
              className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[92px_1fr_auto] md:items-center"
              key={enrollment.id}
            >
              <div className="aspect-video overflow-hidden rounded-md bg-brand-navy">
                {enrollment.course.thumbnailUrl ? (
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={enrollment.course.thumbnailUrl}
                  />
                ) : null}
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={enrollment.status === 'completed' ? 'green' : 'blue'}>
                    {enrollment.status}
                  </Badge>
                  <Badge>{enrollment.progressPercentage}% complete</Badge>
                </div>
                <h2 className="mt-2 font-bold text-brand-navy">{enrollment.course.title}</h2>
                <p className="text-sm text-text-secondary">
                  {enrollment.course.instructor.firstName}{' '}
                  {enrollment.course.instructor.lastName}
                </p>
                <div className="mt-3 max-w-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                    <span>
                      {enrollment.status === 'completed' ? 'Completed' : 'Progress'}
                    </span>
                    <span>{enrollment.progressPercentage}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
                    <span
                      className={`block h-full rounded-full transition-all ${
                        enrollment.status === 'completed'
                          ? 'bg-brand-green'
                          : 'bg-brand-blue'
                      }`}
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link
                className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-bold text-white ${
                  enrollment.status === 'completed'
                    ? 'bg-brand-green'
                    : 'bg-brand-blue'
                }`}
                to={`/student/courses/${enrollment.course.id}/learn`}
              >
                {enrollment.status === 'completed' ? 'View course' : 'Continue'}
              </Link>
            </article>
          ))}
          <Pagination onPageChange={setPage} pagination={data.pagination} />
        </div>
      ) : null}
    </div>
  );
}
