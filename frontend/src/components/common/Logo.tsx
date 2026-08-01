import { Link } from 'react-router-dom';

import eduConnectLogo from '../../assets/educonnect-logo.png';
import { cn } from '../../utils/cn';

type LogoProps = {
  className?: string;
  linkClassName?: string;
};

export function Logo({ className, linkClassName }: LogoProps) {
  return (
    <Link
      aria-label="EduConnect home"
      className={cn('inline-flex items-center gap-3', linkClassName)}
      to="/"
    >
      <img
        alt=""
        className={cn('h-10 w-10 rounded-lg object-contain', className)}
        src={eduConnectLogo}
      />
      <span className="font-display text-lg font-bold text-brand-navy">
        EduConnect
      </span>
    </Link>
  );
}
