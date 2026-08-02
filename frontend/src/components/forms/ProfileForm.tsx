import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { FormField } from './FormField';
import {
  profileFormSchema,
  type ProfileFormValues,
} from '../../schemas/profile.schemas';
import type { ProfileUser } from '../../types/user';

type ProfileFormProps = {
  user: ProfileUser;
  isSubmitting: boolean;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
};

export function ProfileForm({ isSubmitting, onSubmit, user }: ProfileFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
      phoneNumber: user.phoneNumber ?? '',
    },
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
      phoneNumber: user.phoneNumber ?? '',
    });
  }, [reset, user]);

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <FormField error={errors.firstName?.message} htmlFor="firstName" label="First name">
        <Input id="firstName" {...register('firstName')} />
      </FormField>
      <FormField error={errors.lastName?.message} htmlFor="lastName" label="Last name">
        <Input id="lastName" {...register('lastName')} />
      </FormField>
      <FormField error={errors.username?.message} htmlFor="username" label="Username">
        <Input id="username" {...register('username')} />
      </FormField>
      <FormField error={errors.phoneNumber?.message} htmlFor="phoneNumber" label="Phone number">
        <Input id="phoneNumber" {...register('phoneNumber')} />
      </FormField>
      <FormField error={errors.avatarUrl?.message} htmlFor="avatarUrl" label="Avatar URL">
        <Input id="avatarUrl" {...register('avatarUrl')} />
      </FormField>
      <div />
      <div className="md:col-span-2">
        <FormField error={errors.bio?.message} htmlFor="bio" label="Bio">
          <Textarea id="bio" {...register('bio')} />
        </FormField>
      </div>
      <div className="md:col-span-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}
