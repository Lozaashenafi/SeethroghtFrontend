import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const colStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapStyles = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-8',
};

export function Grid({
  children,
  cols = 1,
  gap = 'md',
  className,
  ...props
}: GridProps) {
  return (
    <div
      className={cn('grid', colStyles[cols], gapStyles[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}
