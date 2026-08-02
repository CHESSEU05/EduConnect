import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getProfileRequest, updateProfileRequest } from '../../api/profile.api';
import { ProfileForm } from '../../components/forms/ProfileForm';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { ProfileFormValues } from '../../schemas/profile.schemas';
import type { ProfileUser } from '../../types/user';
import { getErrorMessage } from '../../utils/errors';

export function StudentProfilePage() {
  useDocumentTitle('Student Profile');
  const { refreshCurrentUser } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setStatus('loading');
    try {
      setUser(await getProfileRequest());
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (status === 'loading') {
    return <PageLoader message="Loading profile" />;
  }

  if (status === 'error' || !user) {
    return (
      <ErrorMessage
        action={<Button onClick={() => void load()}>Retry</Button>}
        message={error ?? 'Profile could not be loaded.'}
        title="Unable to load profile"
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-brand-navy">Profile</h1>
        <p className="mt-2 text-text-secondary">Keep your EduConnect profile up to date.</p>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <ProfileForm
          isSubmitting={isSubmitting}
          onSubmit={async (values: ProfileFormValues) => {
            setIsSubmitting(true);
            try {
              const updatedUser = await updateProfileRequest({
                ...values,
                avatarUrl: values.avatarUrl || null,
                bio: values.bio || null,
                phoneNumber: values.phoneNumber || null,
              });
              setUser(updatedUser);
              await refreshCurrentUser();
              toast.success('Profile updated successfully.');
            } catch (updateError) {
              toast.error(getErrorMessage(updateError));
            } finally {
              setIsSubmitting(false);
            }
          }}
          user={user}
        />
      </section>
    </div>
  );
}
