import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-olive/10 text-brand-olive dark:bg-brand-cream/10 dark:text-brand-cream',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-brand-navy/10 text-brand-navy dark:bg-brand-navy-light/10 dark:text-brand-navy-light',
  outline: 'border border-current/20 bg-transparent text-current',
};

export function Badge({
  children,
  variant = 'default',
  dot = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'default' && 'bg-current',
            variant === 'success' && 'bg-current',
            variant === 'warning' && 'bg-current',
            variant === 'error' && 'bg-current',
            variant === 'info' && 'bg-current',
            variant === 'outline' && 'bg-current',
          )}
        />
      )}
      {children}
    </span>
  );
}
