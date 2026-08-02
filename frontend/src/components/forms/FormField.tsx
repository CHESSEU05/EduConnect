import type { PropsWithChildren, ReactNode } from 'react';

type FormFieldProps = PropsWithChildren<{
  error?: string;
  hint?: string;
  label: string;
  htmlFor: string;
  action?: ReactNode;
}>;

export function FormField({
  action,
  children,
  error,
  hint,
  htmlFor,
  label,
}: FormFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-text-primary" htmlFor={htmlFor}>
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-text-secondary">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>
      ) : null}
    </div>
  );
}
