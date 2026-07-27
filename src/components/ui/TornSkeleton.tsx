import { cn } from '@/lib/cn';
import { tornEffect } from '@/constants/brand';

interface TornSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export function TornSkeleton({ count = 3, height = 'h-80', className }: TornSkeletonProps) {
  return (
    <div className={cn('grid gap-12', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('w-full bg-stone-200 dark:bg-[var(--color-card)] animate-pulse border border-stone-300 dark:border-[var(--color-border)]', height)}
          style={tornEffect}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
