import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  MessageSquare,
  Star,
  Trash2,
  ThumbsUp,
  Pencil,
} from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import { useCompany, useReviews, useIndustries, useAdminDeleteCompany, useAdminDeleteReview } from '@/hooks';
import { formatDate, formatNumber } from '@/utils';
import { toast } from 'sonner';
import type { Company, Review } from '@/types';
import { CompanyEditModal } from '../components/CompanyEditModal';

export function AdminCompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteCompanyTarget, setDeleteCompanyTarget] = useState<Company | null>(null);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<Review | null>(null);

  const { data: company, isLoading: companyLoading, isError: companyError } = useCompany(slug);
  const { data: reviewsData, isLoading: reviewsLoading, isError: reviewsError } = useReviews({ companySlug: slug, limit: 20 });
  const { data: industries } = useIndustries();

  const deleteCompany = useAdminDeleteCompany();
  const deleteReview = useAdminDeleteReview();

  const industryName = company ? industries?.find(i => i.id === company.industryId)?.name : undefined;

  const handleCompanySaved = () => {
    setEditingCompany(null);
  };

  const handleDeleteCompany = async () => {
    if (!deleteCompanyTarget) return;
    try {
      await toast.promise(
        deleteCompany.mutateAsync(deleteCompanyTarget.slug),
        { loading: 'Deleting company...', success: 'Company deleted', error: 'Failed to delete company' },
      );
      setDeleteCompanyTarget(null);
      navigate('/admin/companies');
    } catch {
      // toast.promise already surfaced the error
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewTarget) return;
    try {
      await toast.promise(
        deleteReview.mutateAsync(deleteReviewTarget.publicId),
        { loading: 'Deleting review...', success: 'Review deleted', error: 'Failed to delete review' },
      );
      setDeleteReviewTarget(null);
    } catch {
      // toast.promise already surfaced the error
    }
  };

  if (companyLoading) {
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

  if (companyError || !company) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-text-secondary">Couldn&rsquo;t load this company. It may have been deleted.</p>
        <Link to="/admin/companies" className="mt-4 inline-block">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to Companies</Button>
        </Link>
      </Card>
    );
  }

  const avgRating = company.averageRating ? Number(company.averageRating) : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/companies"
          className="inline-flex items-center gap-2 text-xs font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Companies
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
            <Building2 size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
                {company.name}
              </h1>
              {company.verified && <Badge variant="success" dot>Verified</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
              <span className="font-mono">/{company.slug}</span>
              {industryName && <span>{industryName}</span>}
              {(company.city || company.country) && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {[company.city, company.country].filter(Boolean).join(', ')}
                </span>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors">
                  <Globe size={10} />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/company/${company.slug}`}>
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>View Public Page</Button>
          </Link>
          <Button variant="ghost" size="sm" leftIcon={<Pencil size={14} />} onClick={() => setEditingCompany(company)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-error hover:bg-error/5"
            onClick={() => setDeleteCompanyTarget(company)}
            leftIcon={<Trash2 size={14} />}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card padding="md" torn={false} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            <Star size={20} className="fill-amber-400 text-amber-400" />
            {avgRating ? avgRating.toFixed(1) : 'N/A'}
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            Average Rating
          </p>
        </Card>
        <Card padding="md" torn={false} className="text-center">
          <div className="text-3xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            {formatNumber(company.reviewCount)}
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            Total Reviews
          </p>
        </Card>
        <Card padding="md" torn={false} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            <ThumbsUp size={20} />
            {company.recommendationRate}
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            Recommended %
          </p>
        </Card>
      </div>

      {/* Details */}
      {company.description && (
        <Card padding="md" className="mb-6">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[var(--color-text-secondary)]">
            {company.description}
          </p>
        </Card>
      )}

      <Card padding="md" className="mb-6">
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Created</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">{formatDate(company.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Last Updated</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">{formatDate(company.updatedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">Verified</p>
            <p className="mt-0.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">{company.verified ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </Card>

      {/* Reviews */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
        <h2 className="flex items-center gap-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          <MessageSquare size={14} />
          Reviews
        </h2>
        <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {reviewsData?.reviews.length ?? 0} shown
        </span>
      </div>

      {reviewsLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="animate-pulse border-2 border-[var(--color-text)]/20 dark:border-[var(--color-border)] bg-surface p-4"><div className="h-5 w-48 bg-[var(--color-text)]/10 dark:bg-[var(--color-border)]" /></div>)}</div>
      ) : reviewsError ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">Couldn&rsquo;t load reviews. Please try again.</p></Card>
      ) : !reviewsData?.reviews.length ? (
        <Card padding="lg" className="text-center"><p className="text-text-secondary">No reviews for this company yet.</p></Card>
      ) : (
        <div className="space-y-2">
          {reviewsData.reviews.map(review => (
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
                    onClick={() => setDeleteReviewTarget(review)}
                    leftIcon={<Trash2 size={14} />}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editingCompany && (
        <CompanyEditModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSaved={handleCompanySaved}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteCompanyTarget}
        title="Delete company"
        description={`Delete "${deleteCompanyTarget?.name}"? This will permanently remove the company and all of its reviews, comments, and reports. This cannot be undone.`}
        isLoading={deleteCompany.isPending}
        onConfirm={handleDeleteCompany}
        onClose={() => setDeleteCompanyTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteReviewTarget}
        title="Delete review"
        description={`Delete "${deleteReviewTarget?.title}"? This will permanently remove the review and all of its comments and reports. This cannot be undone.`}
        isLoading={deleteReview.isPending}
        onConfirm={handleDeleteReview}
        onClose={() => setDeleteReviewTarget(null)}
      />
    </div>
  );
}
