import { cn } from '@/lib/cn';

interface StarRatingProps {
  rating: number | null;
  size?: number;
  className?: string;
}

export function BrandStarRating({ rating, size = 12, className }: StarRatingProps) {
  if (!rating) return null;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          style={{ width: size, height: size }}
          className={cn(
            'rotate-45 border',
            star <= rating
              ? 'bg-[#2b2f23] border-[#2b2f23] dark:bg-[var(--color-text)] dark:border-[var(--color-text)]'
              : 'bg-transparent border-stone-300 dark:border-[var(--color-border)]',
          )}
        />
      ))}
    </div>
  );
}
