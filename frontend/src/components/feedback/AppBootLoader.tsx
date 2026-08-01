import eduConnectLogo from '../../assets/educonnect-logo.png';

export function AppBootLoader() {
  return (
    <div
      aria-label="EduConnect is loading"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-page-background px-6 [animation:educonnect-boot-fade_180ms_ease-out]"
      role="status"
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-2xl border border-brand-blue/50 [animation:educonnect-logo-ring_1.2s_ease-out_infinite]" />
          <span className="absolute inset-3 rounded-2xl bg-primary-100" />
          <img
            alt=""
            className="relative h-16 w-16 rounded-2xl object-contain shadow-lg [animation:educonnect-logo-float_1.8s_ease-in-out_infinite]"
            src={eduConnectLogo}
          />
        </div>
        <p className="font-display mt-5 text-2xl font-bold text-brand-navy">
          EduConnect
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Preparing your learning space
        </p>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
          <span className="block h-full w-1/3 rounded-full bg-brand-green [animation:educonnect-progress_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
