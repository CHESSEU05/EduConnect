import { LoadingSpinner } from './LoadingSpinner';
import { SkeletonBlock } from './SkeletonBlock';

type LoadingStateProps = {
  lines?: number;
  title?: string;
  message?: string;
};

export function LoadingState({
  lines = 3,
  message = 'Please wait while the page data is loading.',
  title = 'Loading content',
}: LoadingStateProps) {
  return (
    <section
      aria-busy="true"
      className="rounded-lg border border-slate-200 bg-surface p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <LoadingSpinner label={title} />
        <div>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-sm text-text-secondary">{message}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock
            className={index % 2 === 0 ? 'h-4 w-11/12' : 'h-4 w-8/12'}
            key={`loading-line-${index}`}
          />
        ))}
        <SkeletonBlock className="h-20 w-full" />
      </div>
    </section>
  );
}
