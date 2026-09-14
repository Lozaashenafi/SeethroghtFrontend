import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  Trash2,
  Users,
} from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import {
  useAdminUserActivity,
  useAdminUserAllReviews,
  useAdminBlockUser,
  useAdminUnblockUser,
  useAdminTempBlockUser,
  useAdminClearTempBlockUser,
  useAdminDeleteUser,
} from '@/hooks/useAdmin';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils';
import { toast } from 'sonner';

interface PendingAction {
  action: 'block' | 'unblock' | 'temp-block' | 'clear-temp-block' | 'delete';
}

const statusVariant: Record<string, 'success' | 'warning' | 'error'> = {
  published: 'success',
  pending: 'warning',
  rejected: 'error',
  resolved: 'success',
  dismissed: 'error',
};

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const { data, isLoading, isError } = useAdminUserActivity(userId);
  const { data: allReviews } = useAdminUserAllReviews(userId);
  const blockUser = useAdminBlockUser();
  const unblockUser = useAdminUnblockUser();
  const tempBlock = useAdminTempBlockUser();
  const clearTempBlock = useAdminClearTempBlockUser();
  const deleteUser = useAdminDeleteUser();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const user = data?.user;
  const isSelf = !!user && currentUser?.id === user.id;
  const isActionPending =
    blockUser.isPending || unblockUser.isPending || tempBlock.isPending || clearTempBlock.isPending || deleteUser.isPending;

  const [now] = useState(() => Date.now());
  const isTempBlocked = !!user?.tempBlockedUntil && new Date(user.tempBlockedUntil).getTime() > now;

  const handleConfirm = async () => {
    if (!pendingAction || !userId) return;
    const { action } = pendingAction;
    try {
      if (action === 'block') {
        await toast.promise(blockUser.mutateAsync(userId),
          { loading: 'Blocking user...', success: 'User blocked', error: 'Failed to block user' });
      } else if (action === 'unblock') {
        await toast.promise(unblockUser.mutateAsync(userId),
          { loading: 'Unblocking user...', success: 'User unblocked', error: 'Failed to unblock user' });
      } else if (action === 'temp-block') {
        await toast.promise(tempBlock.mutateAsync({ userId, hours: 24 }),
          { loading: 'Restricting user...', success: 'User restricted for 24 hours', error: 'Failed to restrict user' });
      } else if (action === 'clear-temp-block') {
        await toast.promise(clearTempBlock.mutateAsync(userId),
          { loading: 'Lifting restriction...', success: 'Restriction lifted', error: 'Failed to lift restriction' });
      } else {
        await toast.promise(deleteUser.mutateAsync(userId),
          { loading: 'Deleting user...', success: 'User deleted', error: 'Failed to delete user' });
        navigate('/admin/users');
        return;
      }
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

  if (isError || !user) {
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
                {user.displayName}
              </h1>
              {user.isBlocked ? (
                <Badge variant="error" dot>Blocked</Badge>
              ) : isTempBlocked ? (
                <Badge variant="warning" dot>Temp restricted</Badge>
              ) : (
                <Badge variant="success" dot>Active</Badge>
              )}
              {user.role === 'admin' && <Badge variant="outline">admin</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
              <span>{user.email}</span>
              <span>{user.emailVerified ? 'Email verified' : 'Email unverified'}</span>
              <span>Joined: {formatDate(user.createdAt)}</span>
              {isTempBlocked && <span className="text-warning">Restricted until: {formatDate(user.tempBlockedUntil!)}</span>}
              {user.isBlocked && user.blockedAt && <span>Blocked: {formatDate(user.blockedAt)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* The API refuses to let an admin moderate their own account. */}
          {isSelf ? (
            <span className="px-2 py-1 text-[10px] tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
              Your account
            </span>
          ) : (
            <>
              {!user.isBlocked && isTempBlocked && (
                <Button variant="outline" size="sm" className="text-warning border-warning hover:bg-warning/5"
                  onClick={() => setPendingAction({ action: 'clear-temp-block' })} leftIcon={<TimerReset size={14} />}>
                  Lift Restriction
                </Button>
              )}
              {!user.isBlocked && !isTempBlocked && (
                <Button variant="outline" size="sm" className="text-warning border-warning hover:bg-warning/5"
                  onClick={() => setPendingAction({ action: 'temp-block' })} leftIcon={<TimerReset size={14} />}>
                  Restrict 24h
                </Button>
              )}
              {user.isBlocked ? (
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
              <Button variant="outline" size="sm" className="text-error border-error hover:bg-error/5"
                onClick={() => setPendingAction({ action: 'delete' })} leftIcon={<Trash2 size={14} />}>
                Delete User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Counts */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Reviews', value: reviews.length },
          { label: 'Comments', value: data?.comments.pagination.total ?? 0 },
          { label: 'Votes', value: data?.votes.pagination.total ?? 0 },
          { label: 'Reports filed', value: data?.reports.pagination.total ?? 0 },
        ].map(({ label, value }) => (
          <Card key={label} padding="sm">
            <p className="text-[10px] tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">{label}</p>
            <p className="mt-1 text-lg text-[var(--color-text)] dark:text-[var(--color-text)]">{value}</p>
          </Card>
        ))}
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
                {comment.reviewPublicId ? (
                  <Link to={`/admin/reviews/${comment.reviewPublicId}`} className="hover:underline underline-offset-2">
                    {comment.reviewTitle ?? 'Unknown review'}
                  </Link>
                ) : (
                  'Unknown review'
                )}
                {' · '}
                {comment.companyName ?? 'Unknown company'} · {formatDate(comment.createdAt)}
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
            : pendingAction?.action === 'temp-block' ? 'Restrict user'
            : pendingAction?.action === 'delete' ? 'Delete user permanently'
            : 'Lift restriction'
        }
        description={
          pendingAction?.action === 'unblock'
            ? 'This user will be able to post reviews, comments, and votes again. You can block them again at any time.'
            : pendingAction?.action === 'block'
              ? 'This user will no longer be able to post reviews, comments, or votes. They can still browse and log in, and their existing content stays visible. This can be undone later.'
              : pendingAction?.action === 'temp-block'
                ? 'This user will be temporarily restricted from posting for 24 hours. They can still browse and log in. This can be lifted early.'
                : pendingAction?.action === 'delete'
                  ? 'This permanently removes the user and ALL of their reviews, comments, votes, and reports. This cannot be undone — the same person could still register again with the same email.'
                  : 'This user will be able to post reviews, comments, and votes again immediately.'
        }
        confirmLabel={
          pendingAction?.action === 'unblock' ? 'Unblock'
            : pendingAction?.action === 'block' ? 'Block'
            : pendingAction?.action === 'temp-block' ? 'Restrict'
            : pendingAction?.action === 'delete' ? 'Delete Permanently'
            : 'Lift'
        }
        isLoading={isActionPending}
        onConfirm={handleConfirm}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
}
