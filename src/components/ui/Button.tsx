import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { hoverLift } from '@/lib/animations';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[4px_4px_0px_0px_var(--color-text)] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90',
  secondary:
    'bg-[var(--color-paper)] dark:bg-[var(--color-surface)] text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-[var(--color-text)]/5 dark:hover:bg-[var(--color-text)]/10',
  outline:
    'border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-text)]/5 dark:hover:bg-[var(--color-text)]/10',
  ghost:
    'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-text)]/5 dark:hover:bg-[var(--color-text)]/10',
  danger:
    'bg-error text-white border-2 border-error shadow-[4px_4px_0px_0px_rgba(220,38,38,0.35)] hover:brightness-110',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // Variants with a hard offset shadow collapse it on press (brutalist press effect)
    const hardShadowVariants: ButtonVariant[] = ['primary', 'danger'];
    const motionProps: HTMLMotionProps<'button'> = {
      whileHover: disabled ? undefined : { scale: 1.02 },
      whileTap: disabled
        ? undefined
        : hardShadowVariants.includes(variant)
          ? { scale: 0.97, boxShadow: '0px 0px 0px 0px rgba(0,0,0,0)' }
          : { scale: 0.98 },
      transition: hoverLift,
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'relative inline-flex items-center justify-center rounded-none font-black uppercase tracking-widest',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...motionProps}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span className={cn(isLoading && 'opacity-0')}>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
