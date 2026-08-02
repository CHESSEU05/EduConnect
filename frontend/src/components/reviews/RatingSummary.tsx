import { RatingStars } from '../common/RatingStars';
import type { ReviewSummary as ReviewSummaryData } from '../../types/review';

type RatingSummaryProps = {
  summary: ReviewSummaryData;
};

export function RatingSummary({ summary }: RatingSummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-text-secondary">Ratings and reviews</p>
      <div className="mt-2 flex items-end gap-3">
        <span className="text-4xl font-bold text-brand-navy">
          {summary.averageRating.toFixed(1)}
        </span>
        <div>
          <RatingStars rating={summary.averageRating} />
          <p className="mt-1 text-sm text-text-secondary">
            {summary.reviewCount} reviews
          </p>
        </div>
      </div>
    </section>
  );
}
