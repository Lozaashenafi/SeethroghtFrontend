import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Check,
  ExternalLink,
  MessageSquare,
  Star,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  X,
} from 'lucide-react';
import { Card, Badge, Button, BrandStarRating, ConfirmDialog } from '@/components/ui';
import { useComments, useAdminReview, useAdminModerateReview, useAdminDeleteReview } from '@/hooks';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import type { Review } from '@/types';

function SubRating({ label, rating }: { label: string; rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-200 dark:border-[var(--color-border)] last:border-0">
      <span className="text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">{label}</span>
      <BrandStarRating rating={rating} size={10} />
    </div>
  );
}

function StatusBadge({ status }: { status?: Review['status'] }) {
  if (!status) return null;
  const map: Record<NonNullable<Review['status']>, { label: string; variant: 'success' | 'warning' | 'error' }> = {
    published: { label: 'Published', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'error' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function AdminReviewDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();

  const [deleteReviewTarget, setDeleteReviewTarget] = useState<Review | null>(null);

  const { data: review, isLoading, isError } = useAdminReview(publicId);
  const { data: commentsData, isLoading: commentsLoading } = useComments(publicId);
  const deleteReview = useAdminDeleteReview();
  const moderate = useAdminModerateReview();

  const handleDeleteReview = async () => {
    if (!deleteReviewTarget) return;
    try {
      await toast.promise(
        deleteReview.mutateAsync(deleteReviewTarget.publicId),
        { loading: 'Deleting review...', success: 'Review deleted', error: 'Failed to delete review' },
      );
      setDeleteReviewTarget(null);
      navigate('/admin/reviews');
    } catch {
      // toast.promise already surfaced the error
    }
  };

  const handleModerate = async (status: 'published' | 'rejected') => {
    if (!review) return;
    try {
      await toast.promise(
        moderate.mutateAsync({ publicId: review.publicId, status }),
        {
          loading: status === 'published' ? 'Approving review...' : 'Rejecting review...',
          success: status === 'published' ? 'Review approved' : 'Review rejected',
          error: 'Failed to update review status',
        },
      );
    } catch {
      // toast.promise already surfaced the error
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4">
            <div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !review) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-text-secondary">Couldn&rsquo;t load this review. It may have been deleted.</p>
        <Link to="/admin/reviews" className="mt-4 inline-block">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to Reviews</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/reviews"
          className="inline-flex items-center gap-2 text-xs font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Reviews
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
            <MessageSquare size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
                {review.title}
              </h1>
              {review.isVerified && <Badge variant="success" dot>Verified</Badge>}
              <StatusBadge status={review.status} />
              {review.overallRating && (
                <span className="flex items-center gap-1 text-xs">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  {review.overallRating}/5
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
              {review.nickname && <span>{review.nickname}</span>}
              {review.companySlug && (
                <Link
                  to={`/admin/companies/${review.companySlug}`}
                  className="flex items-center gap-1 hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
                >
                  <Building2 size={10} />
                  {review.companyName ?? review.companySlug}
                </Link>
              )}
              {review.jobTitle && <span>{review.jobTitle}</span>}
              {review.employmentStatus && <span>{review.employmentStatus}</span>}
              {review.isCurrentEmployee && <span>Current employee</span>}
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {review.status === 'pending' && (
            <>
              <Button variant="outline" size="sm" className="text-success hover:bg-success/5"
                onClick={() => handleModerate('published')}
                disabled={moderate.isPending}
                leftIcon={<Check size={14} />}
              >
                Approve
              </Button>
              <Button variant="outline" size="sm" className="text-error hover:bg-error/5"
                onClick={() => handleModerate('rejected')}
                disabled={moderate.isPending}
                leftIcon={<X size={14} />}
              >
                Reject
              </Button>
            </>
          )}
          <Link to={`/review/${review.publicId}`}>
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>View Public Page</Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-error hover:bg-error/5"
            onClick={() => setDeleteReviewTarget(review)}
            leftIcon={<Trash2 size={14} />}
          />
        </div>
      </div>

      {/* Ratings */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card padding="md" torn={false} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            <Star size={20} className="fill-amber-400 text-amber-400" />
            {review.overallRating ? `${review.overallRating}/5` : 'N/A'}
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            Overall Rating
          </p>
        </Card>
        <Card padding="md" torn={false} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            <ThumbsUp size={20} />
            {review.helpfulCount}
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            Helpful Votes
          </p>
        </Card>
        <Card padding="md" torn={false} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            <ThumbsDown size={20} />
            {review.unhelpfulCount}
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            Unhelpful Votes
          </p>
        </Card>
      </div>

      {/* Sub ratings */}
      <Card padding="md" className="mb-6">
        <p className="mb-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
          Rating Breakdown
        </p>
        <SubRating label="Work/Life Balance" rating={review.workLifeBalance} />
        <SubRating label="Culture" rating={review.culture} />
        <SubRating label="Management" rating={review.management} />
        <SubRating label="Compensation" rating={review.compensation} />
        <SubRating label="Opportunities" rating={review.opportunities} />
      </Card>

      {/* Pros & Cons */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {review.pros && (
          <Card padding="md">
            <span className="block mb-2 text-[10px] font-medium tracking-normal text-emerald-700 dark:text-emerald-400 underline decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">
              The Good
            </span>
            <p className="text-sm leading-relaxed text-stone-600 dark:text-[var(--color-text-secondary)]">{review.pros}</p>
          </Card>
        )}
        {review.cons && (
          <Card padding="md">
            <span className="block mb-2 text-[10px] font-medium tracking-normal text-orange-700 dark:text-orange-400 underline decoration-orange-200 dark:decoration-orange-900 underline-offset-4">
              The Bad
            </span>
            <p className="text-sm leading-relaxed text-stone-600 dark:text-[var(--color-text-secondary)]">{review.cons}</p>
          </Card>
        )}
      </div>

      {/* Meta */}
      <Card padding="md" className="mb-6">
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Created</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">{formatDate(review.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Last Updated</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">{formatDate(review.updatedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Verified</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">{review.isVerified ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Status</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)] capitalize">{review.status ?? 'published'}</p>
          </div>
        </div>
      </Card>

      {/* Comments */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
        <h2 className="flex items-center gap-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          <MessageSquare size={14} />
          Comments
        </h2>
        <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {commentsData?.comments.length ?? 0} shown
        </span>
      </div>

      {commentsLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : !commentsData?.comments.length ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">No comments on this review.</p></Card>
      ) : (
        <div className="space-y-2">
          {commentsData.comments.map(comment => (
            <Card key={comment.publicId} padding="sm">
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[var(--color-text-secondary)]">{comment.content}</p>
              <p className="mt-2 text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
                Anonymous · {formatDate(comment.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteReviewTarget}
        title="Delete review"
        description={`Delete "${deleteReviewTarget?.title}"? This will permanently remove the review and all of its comments and reports. This cannot be undone.`}
        isLoading={deleteReview.isPending}
        onConfirm={handleDeleteReview}
        onClose={() => setDeleteReviewTarget(null)}
      />
    </div>
  );
}
