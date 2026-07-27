import { type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
  className,
  ...props
}: CardProps) {
  const motionProps: HTMLMotionProps<'div'> = hover
    ? {
        whileHover: { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }
    : {};

  return (
    <motion.div
      className={cn(
        'rounded-xl border bg-card shadow-sm',
        paddingStyles[padding],
        'transition-colors duration-200',
        className,
      )}
      {...motionProps}
      {...(props as HTMLMotionProps<'div'>)}
    >
      {children}
    </motion.div>
  );
}
