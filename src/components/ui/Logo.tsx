import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  alt?: string;
}

// Renders the brand logo in the variant that matches the current theme. The
// light logo is used on light backgrounds and the dark logo on dark ones, so
// the mark stays legible when the theme toggles.
export function Logo({ className, alt = 'See Through Logo' }: LogoProps) {
  const { theme } = useTheme();

  return (
    <img
      src={theme === 'dark' ? '/darklogo.png' : '/lightlogo.png'}
      alt={alt}
      className={cn('h-8 w-auto object-contain', className)}
    />
  );
}