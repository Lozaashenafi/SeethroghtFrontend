import { type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { tornEffect, cardShadow } from '@/constants/brand';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Use torn-paper edges + offset shadow (homepage look). Defaults to true. */
  torn?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({
  children,
  hover = false,
  padding = 'md',
  torn = true,
  className,
  ...props
}: CardProps) {
  const motionProps: HTMLMotionProps<'div'> = hover
    ? {
        whileHover: { y: -2 },
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }
    : {};

  const base = cn(
    'bg-[var(--color-paper)] dark:bg-[var(--color-card)] transition-colors duration-200',
    paddingStyles[padding],
  );

  if (!torn) {
    return (
      <motion.div
        className={cn('border-2 border-[var(--color-text)] dark:border-[var(--color-text)]', base, className)}
        style={cardShadow}
        {...motionProps}
        {...(props as HTMLMotionProps<'div'>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('relative', className)}
      {...motionProps}
      {...(props as HTMLMotionProps<'div'>)}
    >
      {/* Shadow layer */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1 translate-y-1 bg-[var(--color-text)]/10 dark:bg-black/25"
        style={tornEffect}
      />
      <div
        className={cn('relative border border-stone-200 dark:border-[var(--color-border)]', base)}
        style={tornEffect}
      >
        {children}
      </div>
    </motion.div>
  );
}
