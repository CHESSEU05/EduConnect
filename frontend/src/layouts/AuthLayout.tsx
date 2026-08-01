import { Outlet } from 'react-router-dom';

import { Container } from '../components/common/Container';
import { Logo } from '../components/common/Logo';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-page-background text-text-primary">
      <Container className="flex min-h-screen flex-col py-6">
        <Logo />
        <main className="grid flex-1 place-items-center py-8">
          <section className="w-full max-w-md rounded-xl border border-slate-200 bg-surface p-6 shadow-sm">
            <Outlet />
          </section>
        </main>
      </Container>
    </div>
  );
}
