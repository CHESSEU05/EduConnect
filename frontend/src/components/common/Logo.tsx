import { Link } from 'react-router-dom';

import eduConnectLogo from '../../assets/educonnect-logo.png';
import { cn } from '../../utils/cn';

type LogoProps = {
  className?: string;
  linkClassName?: string;
  size?: 'default' | 'large';
};

export function Logo({ className, linkClassName, size = 'large' }: LogoProps) {
  const imageSize = size === 'large' ? 'h-16 w-16' : 'h-12 w-12';
  const textSize = size === 'large' ? 'text-2xl' : 'text-xl';

  return (
    <Link
      aria-label="EduConnect home"
      className={cn('inline-flex items-center gap-3', linkClassName)}
      to="/"
    >
      <img
        alt=""
        className={cn(imageSize, 'rounded-xl object-contain', className)}
        src={eduConnectLogo}
      />
      <span className={cn('font-display font-bold text-brand-navy', textSize)}>
        EduConnect
      </span>
    </Link>
  );
}
