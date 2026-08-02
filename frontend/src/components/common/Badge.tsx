import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../utils/cn';

type BadgeTone = 'blue' | 'green' | 'amber' | 'slate' | 'red';

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
  }
>;

const toneStyles: Record<BadgeTone, string> = {
  blue: 'bg-blue-50 text-brand-blue ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  red: 'bg-red-50 text-red-700 ring-red-100',
};

export function Badge({
  children,
  className,
  tone = 'slate',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
