import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import {
  useAdminReports,
  useAdminUpdateReportStatus,
} from '@/hooks/useAdmin';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import type { Report } from '@/types';

const statusBadgeVariant: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  resolved: 'success',
  dismissed: 'error',
};

function ReportCard({ report, onUpdate }: { report: Report; onUpdate: (publicId: string, status: 'resolved' | 'dismissed') => void }) {
  return (
    <motion.div variants={fadeInUp}>
      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error/5">
                <Flag size={18} className="text-error" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text capitalize">{report.reason}</p>
                  <Badge variant={statusBadgeVariant[report.status]} dot>
                    {report.status}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary/60">
                  {formatDate(report.createdAt)}
                  {report.resolvedAt && ` · Resolved ${formatDate(report.resolvedAt)}`}
                </p>
              </div>
            </div>
            {report.description && (
              <p className="text-sm text-text-secondary leading-relaxed pl-12">{report.description}</p>
            )}
          </div>
          {report.status === 'pending' && (
            <div className="flex shrink-0 gap-2">
              <Button variant="primary" size="sm" onClick={() => onUpdate(report.publicId, 'resolved')}
                leftIcon={<CheckCircle size={14} />} className="bg-success hover:brightness-110">
                Accept
              </Button>
              <Button variant="outline" size="sm" onClick={() => onUpdate(report.publicId, 'dismissed')}
                leftIcon={<XCircle size={14} />} className="text-error border-error hover:bg-error/5">
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function ReportsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminReports({ status: statusFilter || undefined, page, limit: 10 });
  const updateStatus = useAdminUpdateReportStatus();
  const reports = data?.reports ?? [];
  const pagination = data?.pagination;

  const handleUpdate = async (publicId: string, status: 'resolved' | 'dismissed') => {
    try {
      await toast.promise(
        updateStatus.mutateAsync({ publicId, status }),
        {
          loading: status === 'resolved' ? 'Accepting report...' : 'Dismissing report...',
          success: `Report ${status === 'resolved' ? 'accepted' : 'dismissed'}`,
          error: 'Failed to update report',
        },
      );
    } catch {
      // toast.promise already surfaced the error
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 border-b-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] pb-4">
        {['pending', 'resolved', 'dismissed', 'all'].map((filter) => (
          <button key={filter} onClick={() => { setStatusFilter(filter === 'all' ? '' : filter); setPage(1); }}
            className={`rounded-none border-2 px-4 py-2 text-[10px] font-medium tracking-normal transition-colors ${
              (filter === 'all' && !statusFilter) || statusFilter === filter
                ? 'border-[var(--color-text)] bg-[var(--color-text)] text-white dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]'
                : 'border-[var(--color-text)]/30 text-stone-500 dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)] hover:border-[var(--color-text)] hover:text-[var(--color-text)] dark:hover:border-[var(--color-text)] dark:hover:text-[var(--color-text)]'
            }`}
          >
            {filter === 'all' ? 'All Reports' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-6"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : error ? (
        <Card padding="lg" className="text-center"><AlertTriangle size={24} className="mx-auto mb-3 text-error" /><p className="text-text-secondary">Failed to load reports.</p></Card>
      ) : reports.length === 0 ? (
        <Card padding="lg" className="text-center"><CheckCircle size={24} className="mx-auto mb-3 text-success" /><h3 className="font-medium text-text">All Clear</h3><p className="text-sm text-text-secondary">No reports to review.</p></Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-text-secondary">Showing {reports.length} of {pagination?.total ?? 0} report{pagination?.total !== 1 ? 's' : ''}</p>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {reports.map(report => <ReportCard key={report.publicId} report={report} onUpdate={handleUpdate} />)}
          </motion.div>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} leftIcon={<ChevronLeft size={14} />}>Previous</Button>
              <span className="text-sm text-text-secondary">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} rightIcon={<ChevronRight size={14} />}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
