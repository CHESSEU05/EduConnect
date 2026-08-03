import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  getMyEnrollmentRequest,
  updateMyEnrollmentProgressRequest,
} from '../../api/enrollment.api';
import {
  createCourseReviewRequest,
  deleteMyCourseReviewRequest,
  listCourseReviewsRequest,
  updateMyCourseReviewRequest,
} from '../../api/review.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { CourseModule } from '../../types/course';
import type { Enrollment } from '../../types/enrollment';
import type { Review } from '../../types/review';
import { getErrorMessage } from '../../utils/errors';

export function LearningPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [ownReview, setOwnReview] = useState<Review | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  useDocumentTitle(enrollment?.course.title ?? 'Learning');

  const modules = useMemo(() => enrollment?.course.modules ?? [], [enrollment]);
  const selectedModule = useMemo<CourseModule | undefined>(
    () => modules.find((module) => module.id === selectedModuleId) ?? modules[0],
    [modules, selectedModuleId],
  );
  const selectedModuleProgress = useMemo(() => {
    const selectedIndex = modules.findIndex(
      (module) => module.id === selectedModule?.id,
    );

    if (selectedIndex < 0 || modules.length === 0) {
      return enrollment?.progressPercentage ?? 0;
    }

    return Math.round(((selectedIndex + 1) / modules.length) * 100);
  }, [enrollment?.progressPercentage, modules, selectedModule?.id]);

  const load = useCallback(async () => {
    if (!courseId) {
      setError('Course id is missing.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const data = await getMyEnrollmentRequest(courseId);
      const reviewData = await listCourseReviewsRequest(data.course.id);
      setEnrollment(data);
      setOwnReview(
        reviewData.reviews.find((review) => review.student.id === user?.id) ?? null,
      );
      setSelectedModuleId(data.course.modules?.[0]?.id ?? null);
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateProgress = async (progressPercentage: number) => {
    if (!courseId) {
      return;
    }

    setIsUpdatingProgress(true);

    try {
      const updatedEnrollment = await updateMyEnrollmentProgressRequest(
        courseId,
        progressPercentage,
      );
      setEnrollment(updatedEnrollment);
      toast.success(
        progressPercentage >= 100
          ? 'Course marked as completed.'
          : 'Learning progress updated.',
      );
    } catch (progressError) {
      toast.error(getErrorMessage(progressError));
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (status === 'loading') {
    return <PageLoader message="Loading learning content" />;
  }

  if (status === 'error' || !enrollment) {
    return (
      <ErrorMessage
        action={<Button onClick={() => void load()}>Retry</Button>}
        message={error ?? 'Learning content could not be loaded.'}
        title="Unable to load course"
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <Badge tone="green">{enrollment.progressPercentage}% complete</Badge>
        <h1 className="mt-3 text-3xl font-bold text-brand-navy">
          {enrollment.course.title}
        </h1>
        <p className="mt-2 text-text-secondary">{enrollment.course.shortDescription}</p>
        <div className="mt-5 max-w-2xl">
          <div className="flex items-center justify-between text-sm font-bold text-text-secondary">
            <span>Course progress</span>
            <span>{enrollment.progressPercentage}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
            <span
              className="block h-full rounded-full bg-brand-green transition-all"
              style={{ width: `${enrollment.progressPercentage}%` }}
            />
          </div>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="px-2 py-2 text-sm font-bold uppercase text-text-secondary">
            Modules
          </h2>
          <div className="space-y-2">
            {modules.map((module) => (
              <button
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${
                  selectedModule?.id === module.id
                    ? 'bg-brand-blue text-white'
                    : 'text-text-secondary hover:bg-slate-100'
                }`}
                key={module.id}
                onClick={() => setSelectedModuleId(module.id)}
                type="button"
              >
                {module.title}
              </button>
            ))}
          </div>
        </aside>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-bold text-brand-navy">
            {selectedModule?.title ?? 'No module selected'}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
            {selectedModule?.textContent ??
              selectedModule?.description ??
              'This module has no text content yet.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {selectedModule?.videoUrl ? (
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-bold text-brand-blue"
                href={selectedModule.videoUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open video <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            {selectedModule?.resourceUrl ? (
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-bold text-brand-blue"
                href={selectedModule.resourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open resource <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
            <Button
              disabled={isUpdatingProgress || modules.length === 0}
              onClick={() => void updateProgress(selectedModuleProgress)}
              variant="outline"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark module complete
            </Button>
            <Button
              disabled={isUpdatingProgress || enrollment.progressPercentage >= 100}
              onClick={() => void updateProgress(100)}
            >
              {isUpdatingProgress ? 'Updating...' : 'Mark course complete'}
            </Button>
          </div>
        </section>
      </div>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-brand-navy">Review this course</h2>
        {ownReview ? (
          <p className="mt-2 text-sm text-text-secondary">
            You already reviewed this course. Update your rating or delete your
            review if your feedback changed.
          </p>
        ) : null}
        <div className="mt-4">
          <ReviewForm
            initialValues={
              ownReview
                ? { rating: ownReview.rating, comment: ownReview.comment }
                : undefined
            }
            isSubmitting={isReviewing}
            onSubmit={async (values) => {
              setIsReviewing(true);
              try {
                const savedReview = ownReview
                  ? await updateMyCourseReviewRequest(enrollment.course.id, values)
                  : await createCourseReviewRequest(enrollment.course.id, values);
                setOwnReview(savedReview);
                toast.success(
                  ownReview
                    ? 'Review updated successfully.'
                    : 'Review submitted successfully.',
                );
              } catch (reviewError) {
                toast.error(getErrorMessage(reviewError));
              } finally {
                setIsReviewing(false);
              }
            }}
            submitLabel={ownReview ? 'Update review' : 'Submit review'}
          />
          {ownReview ? (
            <Button
              className="mt-3"
              onClick={() => setIsDeleteOpen(true)}
              variant="ghost"
            >
              Delete my review
            </Button>
          ) : null}
        </div>
      </section>
      <ConfirmDialog
        confirmLabel="Delete review"
        isLoading={isReviewing}
        isOpen={isDeleteOpen}
        message="This removes your course review. You can write a new one later."
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsReviewing(true);
          void deleteMyCourseReviewRequest(enrollment.course.id)
            .then(() => {
              setOwnReview(null);
              setIsDeleteOpen(false);
              toast.success('Review deleted successfully.');
            })
            .catch((deleteError) => toast.error(getErrorMessage(deleteError)))
            .finally(() => setIsReviewing(false));
        }}
        title="Delete review?"
      />
    </div>
  );
}
