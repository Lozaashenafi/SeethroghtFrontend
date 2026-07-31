import { useState } from 'react';
import { Users, Ban, Check } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import {
  useAdminIdentities,
  useAdminBlockIdentity,
  useAdminUnblockIdentity,
} from '@/hooks/useAdmin';
import { formatDate } from '@/utils';
import { toast } from 'sonner';

export function UsersTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminIdentities({ page, limit: 10 });
  const blockUser = useAdminBlockIdentity();
  const unblockUser = useAdminUnblockIdentity();
  const identities = data?.identities ?? [];
  const pagination = data?.pagination;

  const handleBlock = async (publicId: string) => {
    try {
      await blockUser.mutateAsync(publicId);
      toast.success('User blocked');
    } catch { toast.error('Failed to block user'); }
  };

  const handleUnblock = async (publicId: string) => {
    try {
      await unblockUser.mutateAsync(publicId);
      toast.success('User unblocked');
    } catch { toast.error('Failed to unblock user'); }
  };

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl bg-surface p-4"><div className="h-5 w-48 rounded bg-border" /></div>)}</div>
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
                      <span className="font-mono text-xs text-text">{identity.publicId.slice(0, 16)}...</span>
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
                    <Button variant="outline" size="sm" onClick={() => handleUnblock(identity.publicId)}
                      leftIcon={<Check size={14} />} className="text-success border-success hover:bg-success/5">
                      Unblock
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleBlock(identity.publicId)}
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
    </div>
  );
}
