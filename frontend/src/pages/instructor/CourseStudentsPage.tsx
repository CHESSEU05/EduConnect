import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { listInstructorCourseEnrollmentsRequest } from '../../api/enrollment.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Pagination } from '../../components/common/Pagination';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type {
  EnrollmentStatus,
  InstructorEnrollmentListData,
} from '../../types/enrollment';
import { formatDate } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';

export function CourseStudentsPage() {
  useDocumentTitle('Course Students');
  const { courseId } = useParams<{ courseId: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | EnrollmentStatus>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InstructorEnrollmentListData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const load = async () => {
    if (!courseId) {
      setError('Course id is missing.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      setData(
        await listInstructorCourseEnrollmentsRequest(courseId, {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
        }),
      );
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, [courseId, debouncedSearch, page, statusFilter]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-brand-navy">Enrolled students</h1>
        <p className="mt-2 text-text-secondary">View learners enrolled in this course.</p>
      </header>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students..."
            value={search}
          />
        </div>
        <Select
          aria-label="Enrollment status"
          onChange={(event) => setStatusFilter(event.target.value as '' | EnrollmentStatus)}
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
            <SkeletonBlock className="h-20" key={index} />
          ))}
        </div>
      ) : null}
      {status === 'error' ? (
        <ErrorMessage
          action={<Button onClick={() => void load()}>Retry</Button>}
          message={error ?? 'Students could not be loaded.'}
          title="Unable to load students"
        />
      ) : null}
      {status === 'success' && data?.enrollments.length === 0 ? (
        <EmptyState message="No students match this view yet." title="No students found" />
      ) : null}
      {status === 'success' && data && data.enrollments.length > 0 ? (
        <div className="space-y-3">
          {data.enrollments.map((enrollment) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={enrollment.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-brand-navy">
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Enrolled {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge>{enrollment.progressPercentage}%</Badge>
                  <Badge tone={enrollment.status === 'completed' ? 'green' : 'blue'}>
                    {enrollment.status}
                  </Badge>
                </div>
              </div>
            </article>
          ))}
          <Pagination onPageChange={setPage} pagination={data.pagination} />
        </div>
      ) : null}
    </div>
  );
}
