import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../utils/cn';

type ContainerProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}
