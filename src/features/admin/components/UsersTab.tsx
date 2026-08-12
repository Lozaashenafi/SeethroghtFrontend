import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Ban, Check, TimerReset, Trash2, Search } from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import {
  useAdminIdentities,
  useAdminBlockIdentity,
  useAdminUnblockIdentity,
  useAdminTempBlockIdentity,
  useAdminClearTempBlockIdentity,
  useAdminDeleteIdentity,
} from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/utils';
import { toast } from 'sonner';

interface PendingAction {
  publicId: string;
  action: 'block' | 'unblock' | 'temp-block' | 'clear-temp-block' | 'delete';
}

export function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useAdminIdentities({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });
  const blockUser = useAdminBlockIdentity();
  const unblockUser = useAdminUnblockIdentity();
  const tempBlock = useAdminTempBlockIdentity();
  const clearTempBlock = useAdminClearTempBlockIdentity();
  const deleteUser = useAdminDeleteIdentity();
  const identities = data?.identities ?? [];
  const pagination = data?.pagination;
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const isActionPending =
    blockUser.isPending || unblockUser.isPending || tempBlock.isPending || clearTempBlock.isPending || deleteUser.isPending;

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { publicId, action } = pendingAction;
    try {
      if (action === 'block') {
        await toast.promise(
          blockUser.mutateAsync(publicId),
          { loading: 'Blocking user...', success: 'User blocked', error: 'Failed to block user' },
        );
      } else if (action === 'unblock') {
        await toast.promise(
          unblockUser.mutateAsync(publicId),
          { loading: 'Unblocking user...', success: 'User unblocked', error: 'Failed to unblock user' },
        );
      } else if (action === 'temp-block') {
        await toast.promise(
          tempBlock.mutateAsync({ publicId, hours: 24 }),
          { loading: 'Restricting user...', success: 'User restricted for 24 hours', error: 'Failed to restrict user' },
        );
      } else if (action === 'clear-temp-block') {
        await toast.promise(
          clearTempBlock.mutateAsync(publicId),
          { loading: 'Lifting restriction...', success: 'Restriction lifted', error: 'Failed to lift restriction' },
        );
      } else {
        await toast.promise(
          deleteUser.mutateAsync(publicId),
          { loading: 'Deleting user...', success: 'User deleted', error: 'Failed to delete user' },
        );
      }
      setPendingAction(null);
    } catch {
      // toast.promise already surfaced the error
    }
  };

  // Captured once per mount (lazy initializer keeps Date.now out of the render
  // path so a pure-function lint rule is satisfied) and used only for display.
  const [now] = useState(() => Date.now());

  const isTempBlocked = (identity: typeof identities[number]) =>
    !!identity.tempBlockedUntil && new Date(identity.tempBlockedUntil).getTime() > now;

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by nickname or ID"
          className="w-full border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-text)] dark:focus:border-[var(--color-text)] transition-colors"
        />
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : isError ? (
        <Card padding="lg" className="text-center"><Users size={24} className="mx-auto mb-3 text-text-secondary" /><p className="text-text-secondary">Couldn&rsquo;t load users. Please try again.</p></Card>
      ) : identities.length === 0 ? (
        <Card padding="lg" className="text-center"><Users size={24} className="mx-auto mb-3 text-text-secondary" /><p className="text-text-secondary">No users found.</p></Card>
      ) : (
        <div className="space-y-2">
          {identities.map(identity => (
            <Card key={identity.publicId} padding="sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Users size={18} className="shrink-0 text-text-secondary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/admin/users/${identity.publicId}`}
                        className="text-xs text-text font-medium hover:underline underline-offset-2"
                      >
                        {identity.nickname ?? identity.publicId.slice(0, 16) + '...'}
                      </Link>
                      {identity.isBlocked && <Badge variant="error" dot className="shrink-0">Blocked</Badge>}
                      {!identity.isBlocked && isTempBlocked(identity) && <Badge variant="warning" dot className="shrink-0">Temp restricted</Badge>}
                      {!identity.isBlocked && !isTempBlocked(identity) && <Badge variant="success" dot className="shrink-0">Active</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary/60 mt-0.5">
                      Risk score: {identity.riskScore} · Last seen: {formatDate(identity.lastSeenAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {!identity.isBlocked && isTempBlocked(identity) && (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ publicId: identity.publicId, action: 'clear-temp-block' })}
                      leftIcon={<TimerReset size={14} />} className="text-warning border-warning hover:bg-warning/5">
                      Lift Restriction
                    </Button>
                  )}
                  {!identity.isBlocked && !isTempBlocked(identity) && (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ publicId: identity.publicId, action: 'temp-block' })}
                      leftIcon={<TimerReset size={14} />} className="text-warning border-warning hover:bg-warning/5">
                      Restrict 24h
                    </Button>
                  )}
                  {identity.isBlocked ? (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ publicId: identity.publicId, action: 'unblock' })}
                      leftIcon={<Check size={14} />} className="text-success border-success hover:bg-success/5">
                      Unblock
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ publicId: identity.publicId, action: 'block' })}
                      leftIcon={<Ban size={14} />} className="text-error border-error hover:bg-error/5">
                      Block
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setPendingAction({ publicId: identity.publicId, action: 'delete' })}
                    leftIcon={<Trash2 size={14} />} className="text-error border-error hover:bg-error/5" aria-label="Delete user">
                    Delete
                  </Button>
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
              ? 'This user will no longer be able to post reviews, comments, or votes. Their existing content will remain visible. This can be undone later.'
              : pendingAction?.action === 'temp-block'
                ? 'This user will be temporarily restricted from posting for 24 hours. They can still browse. This can be lifted early.'
                : pendingAction?.action === 'delete'
                  ? 'This permanently removes the user and ALL of their reviews, comments, votes, and reports. This cannot be undone — the same browser will return as a brand-new anonymous user.'
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
