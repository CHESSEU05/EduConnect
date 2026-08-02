import { Star } from 'lucide-react';

import { cn } from '../../utils/cn';

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
};

export function StarRatingInput({ onChange, value }: StarRatingInputProps) {
  return (
    <div aria-label="Choose rating" className="flex gap-1" role="radiogroup">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;

        return (
          <button
            aria-checked={value === rating}
            aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
            className="rounded p-1 focus:outline-none focus:ring-4 focus:ring-amber-100"
            key={rating}
            onClick={() => onChange(rating)}
            role="radio"
            type="button"
          >
            <Star
              aria-hidden="true"
              className={cn(
                'h-6 w-6',
                rating <= value
                  ? 'fill-brand-amber text-brand-amber'
                  : 'fill-slate-100 text-slate-300',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
