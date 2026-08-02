import type { InputHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={cn(
        'h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-4 focus:ring-blue-100',
        className,
      )}
      type="checkbox"
      {...props}
    />
  );
}
