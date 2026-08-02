import eduConnectLogo from '../../assets/educonnect-logo.png';

type PageLoaderProps = {
  message?: string;
};

export function PageLoader({ message = 'Loading page' }: PageLoaderProps) {
  return (
    <main className="app-shell grid min-h-screen place-items-center px-4">
      <div
        aria-busy="true"
        aria-label={message}
        className="soft-panel w-full max-w-sm rounded-lg px-6 py-8 text-center"
        role="status"
      >
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-2xl border border-brand-blue/40 [animation:educonnect-logo-ring_1.2s_ease-out_infinite]" />
          <img
            alt=""
            className="relative h-20 w-20 rounded-2xl object-contain [animation:educonnect-logo-float_1.8s_ease-in-out_infinite]"
            src={eduConnectLogo}
          />
        </div>
        <p className="mt-5 text-base font-bold text-brand-navy">{message}</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-primary-100">
          <span className="block h-full w-1/3 rounded-full bg-brand-green [animation:educonnect-progress_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </main>
  );
}
