import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '../../components/common/Button';
import { Checkbox } from '../../components/common/Checkbox';
import { Input } from '../../components/common/Input';
import { FormField } from '../../components/forms/FormField';
import { useAuth } from '../../hooks/useAuth';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../../schemas/auth.schemas';
import { ApiClientError } from '../../api/client';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: true,
    },
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);

    try {
      const user = await login({
        identifier: values.identifier,
        password: values.password,
      });
      const state = location.state as LocationState | null;
      const fallbackPath = user.role === 'instructor' ? '/instructor' : '/student';
      toast.success('Welcome back to EduConnect.');
      navigate(state?.from?.pathname ?? fallbackPath, { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        Object.entries(error.fieldErrors ?? {}).forEach(([field, messages]) => {
          if (field === 'identifier' || field === 'password') {
            setError(field, { message: messages[0] });
          }
        });
        setApiError(error.message);
      } else {
        setApiError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-md reveal-up">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-primary-50 text-brand-blue ring-1 ring-blue-100">
        <LogIn aria-hidden="true" className="h-6 w-6" />
      </span>
      <h1 className="text-3xl font-extrabold text-brand-navy">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Log in with your email or username to continue learning or managing
        your courses.
      </p>
      {apiError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {apiError}
        </div>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={errors.identifier?.message}
          htmlFor="identifier"
          label="Email or username"
        >
          <Input
            autoComplete="username"
            hasError={Boolean(errors.identifier)}
            id="identifier"
            {...register('identifier')}
          />
        </FormField>
        <FormField
          action={
            <button
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              <Eye aria-hidden="true" className="h-3.5 w-3.5" />
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
          error={errors.password?.message}
          htmlFor="password"
          label="Password"
        >
          <Input
            autoComplete="current-password"
            hasError={Boolean(errors.password)}
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <Checkbox {...register('rememberMe')} />
          Remember me on this device
        </label>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-text-secondary">
        New to EduConnect?{' '}
        <Link className="font-bold text-brand-blue" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
