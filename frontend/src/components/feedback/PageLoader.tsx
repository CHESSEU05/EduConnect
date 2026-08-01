import { LoadingSpinner } from './LoadingSpinner';

type PageLoaderProps = {
  message?: string;
};

export function PageLoader({ message = 'Loading page' }: PageLoaderProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-page-background px-4">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-surface px-4 py-3 text-sm font-medium text-text-secondary shadow-sm">
        <LoadingSpinner label={message} />
        <span>{message}</span>
      </div>
    </main>
  );
}
