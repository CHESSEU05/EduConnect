import { EmptyState } from '../feedback/EmptyState';
import { RatingStars } from '../common/RatingStars';
import type { Review } from '../../types/review';
import { formatDate } from '../../utils/date';

type ReviewListProps = {
  reviews: Review[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        message="Reviews from enrolled students will appear here."
        title="No reviews yet"
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <article className="rounded-lg border border-slate-200 bg-white p-4" key={review.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-brand-navy">
                {review.student.firstName} {review.student.lastName}
              </h3>
              <p className="text-sm text-text-secondary">
                {formatDate(review.createdAt)}
              </p>
            </div>
            <RatingStars rating={review.rating} />
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}
