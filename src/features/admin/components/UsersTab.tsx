import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Ban, Check, TimerReset, Trash2, Search } from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import {
  useAdminUsers,
  useAdminBlockUser,
  useAdminUnblockUser,
  useAdminTempBlockUser,
  useAdminClearTempBlockUser,
  useAdminDeleteUser,
} from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import type { AdminUser } from '@/types';

type StatusFilter = 'all' | 'active' | 'blocked' | 'restricted';

interface PendingAction {
  userId: string;
  action: 'block' | 'unblock' | 'temp-block' | 'clear-temp-block' | 'delete';
}

export function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useAdminUsers({
    page,
    limit: 10,
    status,
    search: debouncedSearch || undefined,
  });
  const blockUser = useAdminBlockUser();
  const unblockUser = useAdminUnblockUser();
  const tempBlock = useAdminTempBlockUser();
  const clearTempBlock = useAdminClearTempBlockUser();
  const deleteUser = useAdminDeleteUser();
  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const { user: currentUser } = useAuth();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const isActionPending =
    blockUser.isPending || unblockUser.isPending || tempBlock.isPending || clearTempBlock.isPending || deleteUser.isPending;

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { userId, action } = pendingAction;
    try {
      if (action === 'block') {
        await toast.promise(
          blockUser.mutateAsync(userId),
          { loading: 'Blocking user...', success: 'User blocked', error: 'Failed to block user' },
        );
      } else if (action === 'unblock') {
        await toast.promise(
          unblockUser.mutateAsync(userId),
          { loading: 'Unblocking user...', success: 'User unblocked', error: 'Failed to unblock user' },
        );
      } else if (action === 'temp-block') {
        await toast.promise(
          tempBlock.mutateAsync({ userId, hours: 24 }),
          { loading: 'Restricting user...', success: 'User restricted for 24 hours', error: 'Failed to restrict user' },
        );
      } else if (action === 'clear-temp-block') {
        await toast.promise(
          clearTempBlock.mutateAsync(userId),
          { loading: 'Lifting restriction...', success: 'Restriction lifted', error: 'Failed to lift restriction' },
        );
      } else {
        await toast.promise(
          deleteUser.mutateAsync(userId),
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

  const isTempBlocked = (user: AdminUser) =>
    !!user.tempBlockedUntil && new Date(user.tempBlockedUntil).getTime() > now;

  // A blocked user hides the temp-block controls: block/unblock is the
  // stronger state and the API rejects temp-blocking a blocked account.
  const canBeRestricted = (user: AdminUser) => !user.isBlocked;

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'restricted', label: 'Restricted' },
    { key: 'blocked', label: 'Blocked' },
  ];

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by email or display name"
          className="w-full border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-text)] dark:focus:border-[var(--color-text)] transition-colors"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setStatus(tab.key); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium tracking-normal border-2 transition-colors ${
              status === tab.key
                ? 'bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] border-[var(--color-text)]'
                : 'border-[var(--color-text)]/30 text-stone-500 dark:text-[var(--color-text-secondary)] hover:border-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : isError ? (
        <Card padding="lg" className="text-center"><Users size={24} className="mx-auto mb-3 text-text-secondary" /><p className="text-text-secondary">Couldn&rsquo;t load users. Please try again.</p></Card>
      ) : users.length === 0 ? (
        <Card padding="lg" className="text-center"><Users size={24} className="mx-auto mb-3 text-text-secondary" /><p className="text-text-secondary">No users found.</p></Card>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <Card key={user.id} padding="sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Users size={18} className="shrink-0 text-text-secondary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-xs text-text font-medium hover:underline underline-offset-2"
                      >
                        {user.displayName}
                      </Link>
                      {user.role === 'admin' && <Badge variant="outline" className="shrink-0">admin</Badge>}
                      {user.isBlocked && <Badge variant="error" dot className="shrink-0">Blocked</Badge>}
                      {!user.isBlocked && isTempBlocked(user) && <Badge variant="warning" dot className="shrink-0">Temp restricted</Badge>}
                      {!user.isBlocked && !isTempBlocked(user) && <Badge variant="success" dot className="shrink-0">Active</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary/60 mt-0.5 truncate">
                      {user.email} · {user.emailVerified ? 'Email verified' : 'Email unverified'} · Joined {formatDate(user.createdAt)}
                    </p>
                    {isTempBlocked(user) && (
                      <p className="text-xs text-warning mt-0.5">
                        Restricted until {formatDate(user.tempBlockedUntil!)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* The API refuses to let an admin moderate their own account. */}
                  {currentUser?.id === user.id ? (
                    <span className="px-2 py-1 text-[10px] tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
                      Your account
                    </span>
                  ) : (
                  <>
                  {canBeRestricted(user) && isTempBlocked(user) && (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ userId: user.id, action: 'clear-temp-block' })}
                      leftIcon={<TimerReset size={14} />} className="text-warning border-warning hover:bg-warning/5">
                      Lift Restriction
                    </Button>
                  )}
                  {canBeRestricted(user) && !isTempBlocked(user) && (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ userId: user.id, action: 'temp-block' })}
                      leftIcon={<TimerReset size={14} />} className="text-warning border-warning hover:bg-warning/5">
                      Restrict 24h
                    </Button>
                  )}
                  {user.isBlocked ? (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ userId: user.id, action: 'unblock' })}
                      leftIcon={<Check size={14} />} className="text-success border-success hover:bg-success/5">
                      Unblock
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction({ userId: user.id, action: 'block' })}
                      leftIcon={<Ban size={14} />} className="text-error border-error hover:bg-error/5">
                      Block
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setPendingAction({ userId: user.id, action: 'delete' })}
                    leftIcon={<Trash2 size={14} />} className="text-error border-error hover:bg-error/5" aria-label="Delete user">
                    Delete
                  </Button>
                  </>
                  )}
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
