import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#2b2f23] text-white dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]',
  success: 'bg-success/10 text-success border-2 border-success/40',
  warning: 'bg-warning/10 text-warning border-2 border-warning/40',
  error: 'bg-error/10 text-error border-2 border-error/40',
  info: 'bg-brand-navy/10 text-brand-navy border-2 border-brand-navy/40 dark:bg-brand-navy-light/10 dark:text-brand-navy-light dark:border-brand-navy-light/40',
  outline: 'border-2 border-current/40 bg-transparent text-current',
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
        'inline-flex items-center gap-1.5 rounded-none px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
