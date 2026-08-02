import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiClientError } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Checkbox } from '../../components/common/Checkbox';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { FormField } from '../../components/forms/FormField';
import { useAuth } from '../../hooks/useAuth';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '../../schemas/auth.schemas';

export function RegisterPage() {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromQuery = searchParams.get('role');
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      role: 'student',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    resolver: zodResolver(registerFormSchema),
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (roleFromQuery === 'student' || roleFromQuery === 'instructor') {
      setValue('role', roleFromQuery, { shouldValidate: true });
    }
  }, [roleFromQuery, setValue]);

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);

    try {
      await createAccount({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
      });
      toast.success('Account created successfully. You can now log in.');
      navigate('/login', { replace: true, state: { registeredEmail: values.email } });
    } catch (error) {
      if (error instanceof ApiClientError) {
        Object.entries(error.fieldErrors ?? {}).forEach(([field, messages]) => {
          if (
            [
              'firstName',
              'lastName',
              'username',
              'email',
              'password',
              'confirmPassword',
              'role',
            ].includes(field)
          ) {
            setError(field as keyof RegisterFormValues, { message: messages[0] });
          }
        });
        setApiError(error.message);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="reveal-up">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-brand-green ring-1 ring-emerald-100">
        <UserPlus aria-hidden="true" className="h-6 w-6" />
      </span>
      <h1 className="text-3xl font-extrabold text-brand-navy">Create your account</h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Join as a student to discover courses or as an instructor to teach and
        manage learning content.
      </p>
      {apiError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {apiError}
        </div>
      ) : null}
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <FormField error={errors.firstName?.message} htmlFor="firstName" label="First name">
          <Input id="firstName" {...register('firstName')} />
        </FormField>
        <FormField error={errors.lastName?.message} htmlFor="lastName" label="Last name">
          <Input id="lastName" {...register('lastName')} />
        </FormField>
        <FormField error={errors.username?.message} htmlFor="username" label="Username">
          <Input id="username" {...register('username')} />
        </FormField>
        <FormField error={errors.email?.message} htmlFor="email" label="Email">
          <Input autoComplete="email" id="email" type="email" {...register('email')} />
        </FormField>
        <FormField error={errors.role?.message} htmlFor="role" label="Role">
          <Select id="role" {...register('role')}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </Select>
        </FormField>
        <div className="elevated-card rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          {selectedRole === 'student' ? (
            <div className="flex gap-2">
              <GraduationCap className="h-5 w-5 text-brand-green" />
              <span>
                <Badge tone="green">Student</Badge> discover and enrol in courses.
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Users className="h-5 w-5 text-brand-blue" />
              <span>
                <Badge tone="blue">Instructor</Badge> create and manage courses.
              </span>
            </div>
          )}
        </div>
        <FormField error={errors.password?.message} htmlFor="password" label="Password">
          <Input
            autoComplete="new-password"
            id="password"
            type="password"
            {...register('password')}
          />
        </FormField>
        <FormField
          error={errors.confirmPassword?.message}
          htmlFor="confirmPassword"
          label="Confirm password"
        >
          <Input
            autoComplete="new-password"
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
          />
        </FormField>
        <label className="flex items-start gap-2 text-sm text-text-secondary md:col-span-2">
          <Checkbox {...register('acceptTerms')} />
          <span>I agree to the EduConnect terms and privacy policy.</span>
        </label>
        {errors.acceptTerms?.message ? (
          <p className="text-xs font-semibold text-danger md:col-span-2">
            {errors.acceptTerms.message}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </div>
      </form>
      <p className="mt-5 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link className="font-bold text-brand-blue" to="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
