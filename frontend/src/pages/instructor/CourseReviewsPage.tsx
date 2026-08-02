import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { listInstructorCourseReviewsRequest } from '../../api/review.api';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { RatingSummary } from '../../components/reviews/RatingSummary';
import { ReviewList } from '../../components/reviews/ReviewList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { ReviewListData } from '../../types/review';
import { getErrorMessage } from '../../utils/errors';

export function CourseReviewsPage() {
  useDocumentTitle('Course Reviews');
  const { courseId } = useParams<{ courseId: string }>();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewListData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!courseId) {
      setError('Course id is missing.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      setData(await listInstructorCourseReviewsRequest(courseId, page));
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, [courseId, page]);

  if (status === 'loading') {
    return <PageLoader message="Loading reviews" />;
  }

  if (status === 'error' || !data) {
    return (
      <ErrorMessage
        action={<Button onClick={() => void load()}>Retry</Button>}
        message={error ?? 'Reviews could not be loaded.'}
        title="Unable to load reviews"
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-brand-navy">Course reviews</h1>
        <p className="mt-2 text-text-secondary">View student feedback for this course.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <RatingSummary summary={data.summary} />
        <div>
          <ReviewList reviews={data.reviews} />
          <div className="mt-5">
            <Pagination onPageChange={setPage} pagination={data.pagination} />
          </div>
        </div>
      </div>
    </div>
  );
}
