import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Flag,
  Building2,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Ban,
  Check,
  Plus,
  ExternalLink,
  Search,
  Globe,
  MapPin,
  Star,
} from 'lucide-react';
import { Page, Container, Section } from '@/components/common';
import { Card, Badge, Button, Input } from '@/components/ui';
import { useCompanies, useIndustries, useDebounce } from '@/hooks';
import {
  useAdminReports,
  useAdminUpdateReportStatus,
  useAdminReviews,
  useAdminDeleteReview,
  useAdminIdentities,
  useAdminBlockIdentity,
  useAdminUnblockIdentity,
  useAdminDeleteCompany,
} from '@/hooks/useAdmin';
import { adminUpdateCompany } from '@/services/admin.service';
import { createCompany } from '@/services/companies.service';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { formatDate, formatNumber } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { Report, Review, Company } from '@/types';

// ─── Tab Config ───

type Tab = 'reports' | 'companies' | 'reviews' | 'users';

const tabs: { id: Tab; label: string; icon: typeof Flag }[] = [
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'users', label: 'Users', icon: Users },
];

// ─── Sub-Components ───

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

function ReportsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminReports({ status: statusFilter || undefined, page, limit: 10 });
  const updateStatus = useAdminUpdateReportStatus();
  const reports = data?.reports ?? [];
  const pagination = data?.pagination;

  const handleUpdate = async (publicId: string, status: 'resolved' | 'dismissed') => {
    try {
      await updateStatus.mutateAsync({ publicId, status });
      toast.success(`Report ${status === 'resolved' ? 'accepted' : 'dismissed'}`);
    } catch { toast.error('Failed to update report'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 border-b pb-4">
        {['pending', 'resolved', 'dismissed', 'all'].map((filter) => (
          <button key={filter} onClick={() => { setStatusFilter(filter === 'all' ? '' : filter); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              (filter === 'all' && !statusFilter) || statusFilter === filter
                ? 'bg-brand-olive text-brand-cream dark:bg-brand-cream dark:text-brand-olive'
                : 'text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5'
            }`}
          >
            {filter === 'all' ? 'All Reports' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl bg-surface p-6"><div className="h-5 w-48 rounded bg-border" /></div>)}</div>
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

function CompaniesTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useCompanies({ search: debouncedSearch || undefined, page, limit: 10 });
  const deleteCompany = useAdminDeleteCompany();
  const companies = data?.companies ?? [];
  const pagination = data?.pagination;

  const handleDelete = async (slug: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCompany.mutateAsync(slug);
      toast.success('Company deleted');
    } catch { toast.error('Failed to delete company'); }
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
                    onClick={() => handleDelete(company.slug, company.name)}
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
    </div>
  );
}

function ReviewsTab() {
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

function UsersTab() {
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

// ─── Main AdminPage (Tab Router) ───

export function AdminPage() {
  const location = useLocation();

  // Determine active tab from URL path
  const getActiveTab = (): Tab => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/reviews')) return 'reviews';
    if (location.pathname.includes('/companies')) return 'companies';
    return 'reports';
  };

  const activeTab = getActiveTab();

  const tabConfig = tabs.find(t => t.id === activeTab)!;
  const TabIcon = tabConfig.icon;

  return (
    <Page title={`Admin - ${tabConfig.label}`} description="Manage the See Through platform.">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-olive/5 dark:bg-brand-cream/5">
            <Shield size={22} className="text-brand-olive dark:text-brand-cream" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-brand-olive dark:text-brand-cream">
              {tabConfig.label}
            </h1>
            <p className="text-sm text-text-secondary">Manage the See Through platform</p>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'companies' && <CompaniesTab />}
      {activeTab === 'reviews' && <ReviewsTab />}
      {activeTab === 'users' && <UsersTab />}
    </Page>
  );
}
