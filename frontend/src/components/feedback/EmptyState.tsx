import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ action, message, title }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-surface px-4 py-8 text-center shadow-sm">
      <Inbox
        aria-hidden="true"
        className="mx-auto mb-4 h-8 w-8 text-text-secondary"
      />
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
