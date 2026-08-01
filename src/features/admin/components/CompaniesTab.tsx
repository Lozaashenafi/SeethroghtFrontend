import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  ExternalLink,
  Trash2,
  MapPin,
  Star,
  Search,
  Check,
} from 'lucide-react';
import { Card, Badge, Button, Input, ConfirmDialog } from '@/components/ui';
import { useCompanies, useIndustries, useDebounce } from '@/hooks';
import { useAdminDeleteCompany } from '@/hooks/useAdmin';
import { adminUpdateCompany } from '@/services/admin.service';
import { createCompany } from '@/services/companies.service';
import { formatNumber } from '@/utils';
import { toast } from 'sonner';
import type { Company } from '@/types';

function CompanyEditModal({ company, onClose, onSaved }: { company: Company | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(company?.name ?? '');
  const [slug, setSlug] = useState(company?.slug ?? '');
  const [website, setWebsite] = useState(company?.website ?? '');
  const [country, setCountry] = useState(company?.country ?? '');
  const [city, setCity] = useState(company?.city ?? '');
  const [description, setDescription] = useState(company?.description ?? '');
  const [industryId, setIndustryId] = useState(company?.industryId ?? '');
  const [verified, setVerified] = useState(company?.verified ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: industries } = useIndustries();

  const isEditing = !!company;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await toast.promise(
          adminUpdateCompany(company.slug, {
            name: name || undefined,
            website: website || null,
            country: country || null,
            city: city || null,
            description: description || null,
            verified,
          }),
          { loading: 'Updating...', success: 'Company updated!', error: 'Failed to update' }
        );
      } else {
        await toast.promise(
          createCompany({ name, slug, website: website || undefined, country: country || undefined, city: city || undefined, description: description || undefined, industryId }),
          { loading: 'Creating...', success: 'Company created!', error: 'Failed to create' }
        );
      }
      onSaved();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-brand-olive dark:text-brand-cream">
          {isEditing ? `Edit ${company.name}` : 'Add Company'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} required={!isEditing} />
          <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)} required={!isEditing}
            placeholder="my-company" disabled={isEditing} helperText="Lowercase with dashes" />
          <Input label="Website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Country" value={country} onChange={e => setCountry(e.target.value)} />
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-brand-olive dark:text-brand-cream">Industry</label>
              <select value={industryId} onChange={e => setIndustryId(e.target.value)} required
                className="w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              >
                <option value="">Select industry...</option>
                {industries?.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-brand-olive dark:text-brand-cream">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 resize-y"
            />
          </div>
          {isEditing && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setVerified(!verified)}
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                  verified ? 'border-brand-olive bg-brand-olive dark:border-brand-cream dark:bg-brand-cream' : 'border-border'
                }`}
              >
                {verified && <Check size={12} className="text-brand-cream dark:text-brand-olive" />}
              </div>
              <span className="text-sm text-text">Verified company</span>
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>{isEditing ? 'Save Changes' : 'Create Company'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CompaniesTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useCompanies({ search: debouncedSearch || undefined, page, limit: 10 });
  const deleteCompany = useAdminDeleteCompany();
  const companies = data?.companies ?? [];
  const pagination = data?.pagination;
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

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
      <div className="mb-6 flex items-center gap-3">
        <Input leftIcon={<Search size={16} />} placeholder="Search companies..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} className="flex-1 max-w-sm" />
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreateModal(true)}>
          Add Company
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl bg-surface p-4"><div className="h-5 w-48 rounded bg-border" /></div>)}</div>
      ) : companies.length === 0 ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">No companies found.</p></Card>
      ) : (
        <div className="space-y-2">
          {companies.map(company => (
            <Card key={company.id} padding="sm">
              <div className="flex items-center justify-between gap-4">
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
                <div className="flex items-center gap-2 shrink-0">
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
          onSaved={() => { setShowCreateModal(false); setEditingCompany(null); }}
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
