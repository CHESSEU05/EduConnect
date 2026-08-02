import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../utils/cn';

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'elevated-card rounded-lg border border-slate-200 bg-surface p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
