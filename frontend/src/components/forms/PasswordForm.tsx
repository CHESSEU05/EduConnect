import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FormField } from './FormField';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '../../schemas/profile.schemas';

type PasswordFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
};

export function PasswordForm({ isSubmitting, onSubmit }: PasswordFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    resolver: zodResolver(changePasswordFormSchema),
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        error={errors.currentPassword?.message}
        htmlFor="currentPassword"
        label="Current password"
      >
        <Input
          autoComplete="current-password"
          id="currentPassword"
          type="password"
          {...register('currentPassword')}
        />
      </FormField>
      <FormField
        error={errors.newPassword?.message}
        htmlFor="newPassword"
        label="New password"
      >
        <Input
          autoComplete="new-password"
          id="newPassword"
          type="password"
          {...register('newPassword')}
        />
      </FormField>
      <FormField
        error={errors.confirmNewPassword?.message}
        htmlFor="confirmNewPassword"
        label="Confirm new password"
      >
        <Input
          autoComplete="new-password"
          id="confirmNewPassword"
          type="password"
          {...register('confirmNewPassword')}
        />
      </FormField>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Changing...' : 'Change password'}
      </Button>
    </form>
  );
}
