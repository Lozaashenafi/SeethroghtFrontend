import { useState } from 'react';
import { cn } from '@/lib/cn';

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  /** Tailwind sizing for the square container, e.g. "h-12 w-12" */
  size?: string;
  /** Font size for the fallback initial, e.g. "text-lg" */
  fallbackTextSize?: string;
  className?: string;
}

/**
 * Renders a company logo image with the site's harsh, bordered style.
 * Falls back to the company's initial when there is no logo or the remote
 * image fails to load (hotlink protection, dead URL, etc.).
 */
export function CompanyLogo({
  name,
  logoUrl,
  size = 'h-12 w-12',
  fallbackTextSize = 'text-lg',
  className,
}: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const showImage = !!logoUrl && !failed;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]',
        size,
        className,
      )}
    >
      {showImage ? (
        <img
          src={logoUrl ?? undefined}
          alt={`${name} logo`}
          loading="lazy"
          // "no-referrer" bypasses referrer-based hotlink blocking on most CDNs.
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <span
          className={cn(
            'font-medium text-[var(--color-text)] dark:text-[var(--color-text)]',
            fallbackTextSize,
          )}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
