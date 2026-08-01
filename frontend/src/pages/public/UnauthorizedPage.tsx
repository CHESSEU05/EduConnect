import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Container } from '../../components/common/Container';

export function UnauthorizedPage() {
  return (
    <main>
      <Container className="grid min-h-[70vh] place-items-center py-10">
        <section className="w-full max-w-lg text-center">
          <ShieldAlert
            aria-hidden="true"
            className="mx-auto mb-4 h-10 w-10 text-brand-amber"
          />
          <h1 className="text-3xl font-bold text-brand-navy">
            You do not have access
          </h1>
          <p className="mt-3 text-text-secondary">
            This route is protected by role-based access rules.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand-blue hover:text-brand-blue"
              to="/"
            >
              Go home
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
