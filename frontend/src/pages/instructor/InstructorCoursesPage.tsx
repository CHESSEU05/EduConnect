import { Edit, Eye, RotateCcw, Search, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import {
  archiveInstructorCourseRequest,
  deleteInstructorCourseRequest,
  listInstructorCoursesRequest,
  publishInstructorCourseRequest,
  restoreInstructorCourseRequest,
} from '../../api/course.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
import { Pagination } from '../../components/common/Pagination';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Course, CourseListData, CourseStatus } from '../../types/course';
import { formatXaf } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';

type ConfirmAction = {
  type: 'publish' | 'archive' | 'restore' | 'delete';
  course: Course;
} | null;

const getActionLabel = (type: NonNullable<ConfirmAction>['type']) => {
  const labels: Record<NonNullable<ConfirmAction>['type'], string> = {
    publish: 'Publish',
    archive: 'Archive',
    restore: 'Restore',
    delete: 'Delete',
  };

  return labels[type];
};

export function InstructorCoursesPage() {
  useDocumentTitle('Instructor Courses');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | CourseStatus>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CourseListData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isMutating, setIsMutating] = useState(false);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const result = await listInstructorCoursesRequest({
        page,
        limit: 8,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
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

  const runConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    setIsMutating(true);

    try {
      if (confirmAction.type === 'publish') {
        await publishInstructorCourseRequest(confirmAction.course.id);
        toast.success('Course published successfully.');
      }

      if (confirmAction.type === 'archive') {
        await archiveInstructorCourseRequest(confirmAction.course.id);
        toast.success('Course archived successfully.');
      }

      if (confirmAction.type === 'restore') {
        await restoreInstructorCourseRequest(confirmAction.course.id);
        toast.success('Course restored to draft successfully.');
      }

      if (confirmAction.type === 'delete') {
        await deleteInstructorCourseRequest(confirmAction.course.id);
        toast.success('Course deleted successfully.');
      }

      setConfirmAction(null);
      await load();
    } catch (actionError) {
      toast.error(getErrorMessage(actionError));
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div>
      <header className="soft-panel reveal-up mb-6 flex flex-wrap items-start justify-between gap-4 rounded-lg p-5">
        <div>
          <p className="text-sm font-bold uppercase text-brand-blue">Course management</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">My courses</h1>
        </div>
        <Link className="btn-primary-polish shine inline-flex min-h-11 items-center rounded-md bg-brand-blue px-4 text-sm font-bold text-white" to="/instructor/courses/new">
          Create new course
        </Link>
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
            placeholder="Search your courses..."
            value={search}
          />
        </div>
        <Select
          aria-label="Course status"
          onChange={(event) => {
            setStatusFilter(event.target.value as '' | CourseStatus);
            setPage(1);
          }}
          value={statusFilter}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
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
      {status === 'success' && data?.courses.length === 0 ? (
        <EmptyState
          action={<Link className="font-bold text-brand-blue" to="/instructor/courses/new">Create course</Link>}
          message="Draft and published courses will appear here."
          title="No instructor courses"
        />
      ) : null}
      {status === 'success' && data && data.courses.length > 0 ? (
        <div className="space-y-3">
          {data.courses.map((course) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={course.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={course.status === 'published' ? 'green' : course.status === 'archived' ? 'red' : 'amber'}>
                      {course.status}
                    </Badge>
                    <Badge>{course.isFree ? 'Free' : formatXaf(course.price)}</Badge>
                  </div>
                  <h2 className="mt-2 font-bold text-brand-navy">{course.title}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{course.shortDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="icon-action" to={`/instructor/courses/${course.id}`} title="View">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link className="icon-action" to={`/instructor/courses/${course.id}/edit`} title="Edit">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Link className="icon-action" to={`/instructor/courses/${course.id}/students`} title="Students">
                    <Users className="h-4 w-4" />
                  </Link>
                  {course.status === 'draft' ? (
                    <Button onClick={() => setConfirmAction({ type: 'publish', course })} variant="outline">
                      Publish
                    </Button>
                  ) : null}
                  {course.status === 'draft' || course.status === 'published' ? (
                    <Button onClick={() => setConfirmAction({ type: 'archive', course })} variant="outline">
                      Archive
                    </Button>
                  ) : null}
                  {course.status === 'archived' ? (
                    <Button onClick={() => setConfirmAction({ type: 'restore', course })} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  ) : null}
                  {course.status === 'draft' && course.enrollmentCount === 0 ? (
                    <Button onClick={() => setConfirmAction({ type: 'delete', course })} variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          <Pagination onPageChange={setPage} pagination={data.pagination} />
        </div>
      ) : null}
      <ConfirmDialog
        confirmLabel={confirmAction ? getActionLabel(confirmAction.type) : 'Confirm'}
        isLoading={isMutating}
        isOpen={Boolean(confirmAction)}
        message={`This will ${confirmAction?.type ?? 'update'} "${confirmAction?.course.title ?? 'this course'}".`}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void runConfirmAction()}
        title="Confirm course action"
      />
    </div>
  );
}
