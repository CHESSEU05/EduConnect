import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../../components/common/Button';

export function RegisterPage() {
  return (
    <>
      <UserPlus aria-hidden="true" className="mb-4 h-8 w-8 text-brand-green" />
      <h1 className="text-2xl font-bold text-brand-navy">Create account</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Registration is intentionally not implemented yet. This placeholder
        reserves the screen for student and instructor signup.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button disabled className="w-full" variant="secondary">
          Registration placeholder
        </Button>
        <Link
          className="text-center text-sm font-semibold text-brand-blue hover:text-primary-700"
          to="/login"
        >
          Already have an account?
        </Link>
      </div>
    </>
  );
}
