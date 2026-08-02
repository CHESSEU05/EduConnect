import type { InputHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm font-medium text-text-primary shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100',
        hasError ? 'border-danger' : 'border-slate-300',
        className,
      )}
      {...props}
    />
  );
}
