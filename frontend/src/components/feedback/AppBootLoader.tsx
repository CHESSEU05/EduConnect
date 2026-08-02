import eduConnectLogo from '../../assets/educonnect-logo.png';

export function AppBootLoader() {
  return (
    <div
      aria-label="EduConnect is loading"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-page-background px-6 [animation:educonnect-boot-fade_180ms_ease-out]"
      role="status"
    >
      <div className="absolute left-[-10rem] top-[-10rem] h-80 w-80 rounded-full bg-primary-100" />
      <div className="absolute bottom-[-9rem] right-[-8rem] h-72 w-72 rounded-full bg-secondary-100" />
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative grid h-40 w-40 place-items-center">
          <span className="absolute inset-0 rounded-3xl border border-brand-blue/50 [animation:educonnect-logo-ring_1.2s_ease-out_infinite]" />
          <span className="absolute inset-3 rounded-3xl bg-primary-100 shadow-inner" />
          <img
            alt=""
            className="relative h-32 w-32 rounded-3xl object-contain shadow-xl [animation:educonnect-logo-float_1.8s_ease-in-out_infinite]"
            src={eduConnectLogo}
          />
        </div>
        <p className="font-display mt-6 text-3xl font-bold text-brand-navy">
          EduConnect
        </p>
        <p className="mt-2 text-base text-text-secondary">
          Preparing your learning space...
        </p>
        <div className="mt-7 h-2 w-full overflow-hidden rounded-full bg-primary-100">
          <span className="block h-full w-1/3 rounded-full bg-brand-green [animation:educonnect-progress_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
