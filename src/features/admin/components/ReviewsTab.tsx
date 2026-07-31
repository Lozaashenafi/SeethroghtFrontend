import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink, Star, Trash2 } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { useAdminReviews, useAdminDeleteReview } from '@/hooks/useAdmin';
import { formatDate } from '@/utils';
import { toast } from 'sonner';

export function ReviewsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminReviews({ page, limit: 10 });
  const deleteReview = useAdminDeleteReview();
  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const handleDelete = async (publicId: string) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await deleteReview.mutateAsync(publicId);
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  };

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl bg-surface p-4"><div className="h-5 w-48 rounded bg-border" /></div>)}</div>
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
                  <Link to={`/review/${review.publicId}`}><Button variant="ghost" size="sm"><ExternalLink size={14} /></Button></Link>
                  <Button variant="ghost" size="sm" className="text-error hover:bg-error/5"
                    onClick={() => handleDelete(review.publicId)}
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
    </div>
  );
}
