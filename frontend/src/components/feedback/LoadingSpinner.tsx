import { LoaderCircle } from 'lucide-react';

type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <span
      aria-label={label}
      className="inline-flex items-center justify-center text-brand-blue"
      role="status"
    >
      <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
    </span>
  );
}
