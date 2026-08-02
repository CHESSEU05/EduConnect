import { Star } from 'lucide-react';

import { cn } from '../../utils/cn';

type RatingStarsProps = {
  rating: number;
  className?: string;
};

export function RatingStars({ className, rating }: RatingStarsProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index + 1 <= Math.round(rating);

        return (
          <Star
            aria-hidden="true"
            className={cn(
              'h-4 w-4',
              isFilled
                ? 'fill-brand-amber text-brand-amber'
                : 'fill-slate-100 text-slate-300',
            )}
            key={index}
          />
        );
      })}
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}
