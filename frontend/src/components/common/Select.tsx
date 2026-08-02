import type { SelectHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function Select({ className, hasError = false, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:border-slate-400 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100',
        hasError ? 'border-danger' : 'border-slate-300',
        className,
      )}
      {...props}
    />
  );
}
