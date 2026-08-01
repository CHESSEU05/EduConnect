import { Link } from 'react-router-dom';

import { Container } from '../../components/common/Container';

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-page-background">
      <Container className="grid min-h-screen place-items-center py-10">
        <section className="w-full max-w-lg text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Page not found
          </h1>
          <p className="mt-3 text-text-secondary">
            The page you requested does not exist in the current EduConnect
            route foundation.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              to="/"
            >
              Return home
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
