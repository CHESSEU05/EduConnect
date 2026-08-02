import { useState } from 'react';
import { toast } from 'sonner';

import { changePasswordRequest } from '../../api/profile.api';
import { PasswordForm } from '../../components/forms/PasswordForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { ChangePasswordFormValues } from '../../schemas/profile.schemas';
import { getErrorMessage } from '../../utils/errors';

export function StudentSettingsPage() {
  useDocumentTitle('Student Settings');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-brand-navy">Settings</h1>
        <p className="mt-2 text-text-secondary">
          Change your password. Your current access token remains valid until it expires.
        </p>
      </header>
      <section className="max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <PasswordForm
          isSubmitting={isSubmitting}
          onSubmit={async (values: ChangePasswordFormValues) => {
            setIsSubmitting(true);
            try {
              await changePasswordRequest(values);
              toast.success('Password changed successfully.');
            } catch (error) {
              toast.error(getErrorMessage(error));
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </section>
    </div>
  );
}
