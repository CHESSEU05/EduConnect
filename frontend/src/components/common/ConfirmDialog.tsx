import { AlertTriangle } from 'lucide-react';

import { Button } from './Button';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  isLoading = false,
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-brand-amber">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2
              className="text-lg font-bold text-brand-navy"
              id="confirm-dialog-title"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isLoading} onClick={onCancel} variant="outline">
            {cancelLabel}
          </Button>
          <Button disabled={isLoading} onClick={onConfirm}>
            {isLoading ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
