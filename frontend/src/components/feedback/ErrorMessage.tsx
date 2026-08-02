import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type ErrorMessageProps = {
  message: string;
  title?: string;
  action?: ReactNode;
};

export function ErrorMessage({ action, message, title }: ErrorMessageProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          {title ? <p className="font-bold">{title}</p> : null}
          <p className={title ? 'mt-1' : ''}>{message}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
