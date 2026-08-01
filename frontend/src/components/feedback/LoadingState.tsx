import { LoadingSpinner } from './LoadingSpinner';
import { SkeletonBlock } from './SkeletonBlock';

type LoadingStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({
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
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-8/12" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
    </section>
  );
}
