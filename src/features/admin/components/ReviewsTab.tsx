import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink, Star, Trash2 } from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import { useAdminReviews, useAdminDeleteReview } from '@/hooks/useAdmin';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import type { Review } from '@/types';

export function ReviewsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminReviews({ page, limit: 10 });
  const deleteReview = useAdminDeleteReview();
  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await toast.promise(
        deleteReview.mutateAsync(deleteTarget.publicId),
        {
          loading: 'Deleting review...',
          success: 'Review deleted',
          error: 'Failed to delete review',
        },
      );
      setDeleteTarget(null);
    } catch {
      // toast.promise already surfaced the error
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : isError ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">Couldn&rsquo;t load reviews. Please try again.</p></Card>
      ) : reviews.length === 0 ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">No reviews found.</p></Card>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => (
            <Card key={review.publicId} padding="sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <MessageSquare size={18} className="shrink-0 text-text-secondary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text truncate">{review.title}</span>
                      {review.isVerified && <Badge variant="success" dot className="shrink-0" />}
                      {review.overallRating && (
                        <span className="flex items-center gap-1 text-xs shrink-0">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {review.overallRating}/5
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary/60 mt-0.5">
                      {review.jobTitle && <>{review.jobTitle} · </>}
                      {formatDate(review.createdAt)} · {review.helpfulCount} helpful
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/admin/reviews/${review.publicId}`}><Button variant="outline" size="sm">View</Button></Link>
                  <Link to={`/review/${review.publicId}`}><Button variant="ghost" size="sm"><ExternalLink size={14} /></Button></Link>
                  <Button variant="ghost" size="sm" className="text-error hover:bg-error/5"
                    onClick={() => setDeleteTarget(review)}
                    leftIcon={<Trash2 size={14} />}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
          <span className="text-sm text-text-secondary">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>Next</Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete review"
        description={`Delete "${deleteTarget?.title}"? This will permanently remove the review and all of its comments and reports. This cannot be undone.`}
        isLoading={deleteReview.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
