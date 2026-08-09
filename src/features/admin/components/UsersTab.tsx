import { useState } from 'react';
import { Users, Ban, Check } from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import {
  useAdminIdentities,
  useAdminBlockIdentity,
  useAdminUnblockIdentity,
} from '@/hooks/useAdmin';
import { formatDate } from '@/utils';
import { toast } from 'sonner';

interface PendingAction {
  publicId: string;
  action: 'block' | 'unblock';
}

export function UsersTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminIdentities({ page, limit: 10 });
  const blockUser = useAdminBlockIdentity();
  const unblockUser = useAdminUnblockIdentity();
  const identities = data?.identities ?? [];
  const pagination = data?.pagination;
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const isActionPending = blockUser.isPending || unblockUser.isPending;

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { publicId, action } = pendingAction;
    try {
      if (action === 'block') {
        await toast.promise(
          blockUser.mutateAsync(publicId),
          {
            loading: 'Blocking user...',
            success: 'User blocked',
            error: 'Failed to block user',
          },
        );
      } else {
        await toast.promise(
          unblockUser.mutateAsync(publicId),
          {
            loading: 'Unblocking user...',
            success: 'User unblocked',
            error: 'Failed to unblock user',
          },
        );
      }
      setPendingAction(null);
    } catch {
      // toast.promise already surfaced the error
    }
  };

  return (
    <div>
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
                    <div className="flex items-center gap-2">
                      <span className=" text-xs text-text">{identity.publicId.slice(0, 16)}...</span>
                      {identity.isBlocked && <Badge variant="error" dot className="shrink-0">Blocked</Badge>}
                      {!identity.isBlocked && <Badge variant="success" dot className="shrink-0">Active</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary/60 mt-0.5">
                      Risk score: {identity.riskScore} · Last seen: {formatDate(identity.lastSeenAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
        title={pendingAction?.action === 'unblock' ? 'Unblock user' : 'Block user'}
        description={
          pendingAction?.action === 'unblock'
            ? 'This user will be able to post reviews, comments, and votes again. You can block them again at any time.'
            : 'This user will no longer be able to post reviews, comments, or votes. Their existing content will remain visible. This can be undone later.'
        }
        confirmLabel={pendingAction?.action === 'unblock' ? 'Unblock' : 'Block'}
        isLoading={isActionPending}
        onConfirm={handleConfirm}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
}
