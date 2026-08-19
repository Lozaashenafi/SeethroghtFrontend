import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  ExternalLink,
  Trash2,
  MapPin,
  Star,
  Search,
} from 'lucide-react';
import { Card, Badge, Button, Input, ConfirmDialog } from '@/components/ui';
import { useCompanies, useDebounce } from '@/hooks';
import { useAdminDeleteCompany } from '@/hooks/useAdmin';
import { formatNumber } from '@/utils';
import { toast } from 'sonner';
import type { Company } from '@/types';
import { CompanyEditModal } from './CompanyEditModal';

export function CompaniesTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useCompanies({ search: debouncedSearch || undefined, page, limit: 10 });
  const deleteCompany = useAdminDeleteCompany();
  const companies = data?.companies ?? [];
  const pagination = data?.pagination;
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const handleModalSaved = (updated: Company | null) => {
    // Reflect the create/edit in the list immediately — otherwise the admin
    // table shows stale data until a manual refetch.
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    if (updated?.slug) {
      queryClient.invalidateQueries({ queryKey: ['company', updated.slug] });
    }
    setShowCreateModal(false);
    setEditingCompany(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await toast.promise(
        deleteCompany.mutateAsync(deleteTarget.slug),
        {
          loading: 'Deleting company...',
          success: 'Company deleted',
          error: 'Failed to delete company',
        },
      );
      setDeleteTarget(null);
    } catch {
      // toast.promise already surfaced the error
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input leftIcon={<Search size={16} />} placeholder="Search companies..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} className="flex-1 max-w-sm" />
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreateModal(true)}
          className="sm:w-auto justify-center">
          Add Company
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : isError ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">Couldn&rsquo;t load companies. Please try again.</p></Card>
      ) : companies.length === 0 ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">No companies found.</p></Card>
      ) : (
        <div className="space-y-2">
          {companies.map(company => (
            <Card key={company.id} padding="sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Building2 size={18} className="shrink-0 text-text-secondary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text truncate">{company.name}</span>
                      {company.verified && <Badge variant="success" dot className="shrink-0" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mt-0.5">
                      {(company.city || company.country) && <span className="flex items-center gap-1"><MapPin size={10} />{company.city ?? company.country}</span>}
                      {company.averageRating && <span className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" />{Number(company.averageRating).toFixed(1)}</span>}
                      <span>{formatNumber(company.reviewCount)} reviews</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link to={`/admin/companies/${company.slug}`}><Button variant="outline" size="sm">View</Button></Link>
                  <Link to={`/company/${company.slug}`}><Button variant="ghost" size="sm"><ExternalLink size={14} /></Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => setEditingCompany(company)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-error hover:bg-error/5"
                    onClick={() => setDeleteTarget(company)}
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

      {(showCreateModal || editingCompany) && (
        <CompanyEditModal
          company={editingCompany}
          onClose={() => { setShowCreateModal(false); setEditingCompany(null); }}
          onSaved={handleModalSaved}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete company"
        description={`Delete "${deleteTarget?.name}"? This will permanently remove the company and all of its reviews, comments, and reports. This cannot be undone.`}
        isLoading={deleteCompany.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
