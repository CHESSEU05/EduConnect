import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../../components/common/Button';

export function LoginPage() {
  return (
    <>
      <LogIn aria-hidden="true" className="mb-4 h-8 w-8 text-brand-blue" />
      <h1 className="text-2xl font-bold text-brand-navy">Log in</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Authentication forms will be connected in a later milestone. This route
        is ready for the future login workflow.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button disabled className="w-full">
          Login placeholder
        </Button>
        <Link
          className="text-center text-sm font-semibold text-brand-blue hover:text-primary-700"
          to="/register"
        >
          Need an account?
        </Link>
      </div>
    </>
  );
}
