import { cn } from '../../utils/cn';

type SkeletonBlockProps = {
  className?: string;
  label?: string;
};

export function SkeletonBlock({
  className,
  label = 'Loading content',
}: SkeletonBlockProps) {
  return (
    <div
      aria-label={label}
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-100',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:content-[""] after:[animation:educonnect-shimmer_1.4s_infinite]',
        className,
      )}
      role="status"
    />
  );
}
