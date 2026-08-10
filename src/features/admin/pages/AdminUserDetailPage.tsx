import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  Check,
  Flag,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  TimerReset,
  Users,
} from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import {
  useAdminUserActivity,
  useAdminUserAllReviews,
  useAdminBlockIdentity,
  useAdminUnblockIdentity,
  useAdminTempBlockIdentity,
  useAdminClearTempBlockIdentity,
} from '@/hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/utils';
import { toast } from 'sonner';

interface PendingAction {
  action: 'block' | 'unblock' | 'temp-block' | 'clear-temp-block';
}

const statusVariant: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  flagged: 'warning',
  disabled: 'error',
};

export function AdminUserDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useAdminUserActivity(publicId);
  const { data: allReviews } = useAdminUserAllReviews(publicId);
  const blockUser = useAdminBlockIdentity();
  const unblockUser = useAdminUnblockIdentity();
  const tempBlock = useAdminTempBlockIdentity();
  const clearTempBlock = useAdminClearTempBlockIdentity();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const identity = data?.identity;
  const isActionPending =
    blockUser.isPending || unblockUser.isPending || tempBlock.isPending || clearTempBlock.isPending;

  const [now] = useState(() => Date.now());
  const isTempBlocked = !!identity?.tempBlockedUntil && new Date(identity.tempBlockedUntil).getTime() > now;

  const invalidateActivity = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-user-activity'] });
    queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
  };

  const handleConfirm = async () => {
    if (!pendingAction || !publicId) return;
    const { action } = pendingAction;
    try {
      if (action === 'block') {
        await toast.promise(blockUser.mutateAsync(publicId),
          { loading: 'Blocking user...', success: 'User blocked', error: 'Failed to block user' });
      } else if (action === 'unblock') {
        await toast.promise(unblockUser.mutateAsync(publicId),
          { loading: 'Unblocking user...', success: 'User unblocked', error: 'Failed to unblock user' });
      } else if (action === 'temp-block') {
        await toast.promise(tempBlock.mutateAsync({ publicId, hours: 24 }),
          { loading: 'Restricting user...', success: 'User restricted for 24 hours', error: 'Failed to restrict user' });
      } else {
        await toast.promise(clearTempBlock.mutateAsync(publicId),
          { loading: 'Lifting restriction...', success: 'Restriction lifted', error: 'Failed to lift restriction' });
      }
      invalidateActivity();
      setPendingAction(null);
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

  if (isError || !identity) {
    return (
      <Card padding="lg" className="text-center">
        <Users size={24} className="mx-auto mb-3 text-text-secondary" />
        <p className="text-text-secondary">Couldn&rsquo;t load this user. It may no longer exist.</p>
        <Link to="/admin/users" className="mt-4 inline-block">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to Users</Button>
        </Link>
      </Card>
    );
  }

  const reviews = allReviews ?? data?.reviews?.data ?? [];
  const comments = data?.comments?.data ?? [];
  const votes = data?.votes?.data ?? [];
  const reports = data?.reports?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
            <Users size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
                {identity.nickname ?? identity.publicId}
              </h1>
              {identity.isBlocked ? (
                <Badge variant="error" dot>Blocked</Badge>
              ) : isTempBlocked ? (
                <Badge variant="warning" dot>Temp restricted</Badge>
              ) : (
                <Badge variant="success" dot>Active</Badge>
              )}
              <Badge variant="outline">{identity.publicId}</Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
              <span>Risk score: {identity.riskScore}</span>
              <span>Status: {identity.status}</span>
              <span>Created: {formatDate(identity.createdAt)}</span>
              <span>Last seen: {formatDate(identity.lastSeenAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!identity.isBlocked && isTempBlocked && (
            <Button variant="outline" size="sm" className="text-warning border-warning hover:bg-warning/5"
              onClick={() => setPendingAction({ action: 'clear-temp-block' })} leftIcon={<TimerReset size={14} />}>
              Lift Restriction
            </Button>
          )}
          {!identity.isBlocked && !isTempBlocked && (
            <Button variant="outline" size="sm" className="text-warning border-warning hover:bg-warning/5"
              onClick={() => setPendingAction({ action: 'temp-block' })} leftIcon={<TimerReset size={14} />}>
              Restrict 24h
            </Button>
          )}
          {identity.isBlocked ? (
            <Button variant="outline" size="sm" className="text-success border-success hover:bg-success/5"
              onClick={() => setPendingAction({ action: 'unblock' })} leftIcon={<Check size={14} />}>
              Unblock
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="text-error border-error hover:bg-error/5"
              onClick={() => setPendingAction({ action: 'block' })} leftIcon={<Ban size={14} />}>
              Block
            </Button>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
        <h2 className="flex items-center gap-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          <MessageSquare size={14} />
          Reviews (all time)
        </h2>
        <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {reviews.length} total
        </span>
      </div>
      {reviews.length === 0 ? (
        <Card padding="lg" className="mb-6 text-center"><p className="text-text-secondary">No reviews.</p></Card>
      ) : (
        <div className="mb-6 space-y-2">
          {reviews.map(review => (
            <Card key={review.publicId} padding="sm">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/reviews/${review.publicId}`} className="text-sm font-medium text-[var(--color-text)] hover:underline underline-offset-2">
                      {review.title}
                    </Link>
                    {review.overallRating != null && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {review.overallRating}/5
                      </span>
                    )}
                    {review.status && statusVariant[review.status] && (
                      <Badge variant={statusVariant[review.status]} dot>{review.status}</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary/70">
                    {review.companyName ?? 'Unknown company'} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><ThumbsUp size={12} />{review.helpfulCount}</span>
                  <span className="flex items-center gap-1"><ThumbsDown size={12} />{review.unhelpfulCount}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Comments */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
        <h2 className="flex items-center gap-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          <MessageSquare size={14} />
          Comments
        </h2>
        <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {data?.comments.pagination.total ?? 0} total
        </span>
      </div>
      {comments.length === 0 ? (
        <Card padding="lg" className="mb-6 text-center"><p className="text-text-secondary">No comments.</p></Card>
      ) : (
        <div className="mb-6 space-y-2">
          {comments.map(comment => (
            <Card key={comment.publicId} padding="sm">
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[var(--color-text-secondary)]">{comment.content}</p>
              <p className="mt-2 text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
                {comment.reviewTitle ?? 'Unknown review'} · {comment.companyName ?? 'Unknown company'} · {formatDate(comment.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Votes */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
        <h2 className="flex items-center gap-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          <ThumbsUp size={14} />
          Votes
        </h2>
        <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {data?.votes.pagination.total ?? 0} total
        </span>
      </div>
      {votes.length === 0 ? (
        <Card padding="lg" className="mb-6 text-center"><p className="text-text-secondary">No votes.</p></Card>
      ) : (
        <div className="mb-6 space-y-2">
          {votes.map((vote, i) => (
            <Card key={i} padding="sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {vote.voteType === 'helpful'
                    ? <ThumbsUp size={14} className="shrink-0 text-success" />
                    : <ThumbsDown size={14} className="shrink-0 text-error" />}
                  <p className="truncate text-sm text-stone-600 dark:text-[var(--color-text-secondary)]">
                    {vote.reviewTitle ?? 'Unknown review'} · {vote.companyName ?? 'Unknown company'}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
                  {formatDate(vote.createdAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reports */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
        <h2 className="flex items-center gap-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          <Flag size={14} />
          Reports Filed
        </h2>
        <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {data?.reports.pagination.total ?? 0} total
        </span>
      </div>
      {reports.length === 0 ? (
        <Card padding="lg" className="mb-6 text-center"><p className="text-text-secondary">No reports filed.</p></Card>
      ) : (
        <div className="space-y-2">
          {reports.map(report => (
            <Card key={report.publicId} padding="sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)]">{report.reason}</p>
                  <p className="mt-0.5 text-xs text-text-secondary/70">
                    {report.reviewTitle ? `Review: ${report.reviewTitle}` : report.commentContent ? `Comment: ${report.commentContent}` : 'Target missing'} · {formatDate(report.createdAt)}
                  </p>
                </div>
                <Badge variant={statusVariant[report.status] ?? 'default'} dot className="shrink-0">
                  {report.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingAction}
        title={
          pendingAction?.action === 'unblock' ? 'Unblock user'
            : pendingAction?.action === 'block' ? 'Block user'
            : pendingAction?.action === 'temp-block' ? 'Restrict user' : 'Lift restriction'
        }
        description={
          pendingAction?.action === 'unblock'
            ? 'This user will be able to post reviews, comments, and votes again. You can block them again at any time.'
            : pendingAction?.action === 'block'
              ? 'This user will no longer be able to post reviews, comments, or votes. Their existing content will remain visible. This can be undone later.'
              : pendingAction?.action === 'temp-block'
                ? 'This user will be temporarily restricted from posting for 24 hours. They can still browse. This can be lifted early.'
                : 'This user will be able to post reviews, comments, and votes again immediately.'
        }
        confirmLabel={
          pendingAction?.action === 'unblock' ? 'Unblock'
            : pendingAction?.action === 'block' ? 'Block'
            : pendingAction?.action === 'temp-block' ? 'Restrict' : 'Lift'
        }
        isLoading={isActionPending}
        onConfirm={handleConfirm}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
}
