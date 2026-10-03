import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useVoteOnReview } from '@/hooks';
import { useUserAuth } from '@/context/UserAuthContext';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

interface VoteButtonsProps {
  reviewPublicId: string;
  helpfulCount: number;
  unhelpfulCount: number;
  /** 'sm' fits dense list cards; 'md' matches the detail page. */
  size?: 'sm' | 'md';
}

/**
 * Helpful / unhelpful vote buttons for a review.
 *
 * Renders as buttons, not a Link, so it can sit inside a clickable review
 * card without nesting interactive elements. Prevents the click from
 * bubbling to any parent link so voting never navigates the user away.
 * Redirects unauthenticated visitors to login with a return path.
 */
export function VoteButtons({
  reviewPublicId,
  helpfulCount,
  unhelpfulCount,
  size = 'sm',
}: VoteButtonsProps) {
  const vote = useVoteOnReview();
  const { isAuthenticated } = useUserAuth();

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname);
      window.location.href = `${ROUTES.LOGIN}?redirect=${redirect}`;
      return;
    }
    try {
      await vote.mutateAsync({ reviewPublicId, voteType });
      toast.success('Vote recorded');
    } catch {
      toast.error('Failed to record vote');
    }
  };

  const iconSize = size === 'sm' ? 12 : 14;
  const baseClasses =
    'flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50';

  return (
    <span
      className="inline-flex items-center gap-3 sm:gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Mark as helpful"
        disabled={vote.isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleVote('helpful');
        }}
        className={`${baseClasses} ${
          size === 'sm'
            ? 'text-xs text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400'
            : 'text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400'
        }`}
      >
        <ThumbsUp size={iconSize} /> {helpfulCount}
      </button>
      <button
        type="button"
        aria-label="Mark as unhelpful"
        disabled={vote.isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleVote('unhelpful');
        }}
        className={`${baseClasses} ${
          size === 'sm'
            ? 'text-xs text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-orange-700 dark:hover:text-orange-400'
            : 'text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-orange-700 dark:hover:text-orange-400'
        }`}
      >
        <ThumbsDown size={iconSize} /> {unhelpfulCount}
      </button>
    </span>
  );
}
