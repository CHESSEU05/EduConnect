import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-brand-blue bg-brand-blue text-white shadow-sm hover:bg-primary-700 focus-visible:outline-brand-amber',
  secondary:
    'border border-brand-green bg-brand-green text-white shadow-sm hover:bg-secondary-600 focus-visible:outline-brand-amber',
  outline:
    'border border-slate-300 bg-surface text-text-primary shadow-sm hover:border-brand-blue hover:text-brand-blue',
  ghost: 'text-text-secondary hover:bg-slate-100 hover:text-text-primary',
};

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
