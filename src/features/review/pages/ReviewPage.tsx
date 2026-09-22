import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ThumbsUp,
  ArrowUpRight,
} from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import type { Review } from '@/types';
import { useReviews, useCompanies, useDebounce } from '@/hooks';
import { formatDate } from '@/utils';
import { tornEffect, cardShadow } from '@/constants/brand';

function ReviewCard({ review }: { review: Review }) {
  return (
    <Link to={`/review/${review.publicId}`} className="group block">
      <div
        className="relative bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
        style={tornEffect}
      >
        <div className="flex justify-between items-start gap-3 mb-5">
          <div className="flex gap-4 min-w-0 flex-1">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] text-base font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
              {review.companyName?.charAt(0) || 'R'}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium tracking-normal text-sm text-[var(--color-text)] dark:text-[var(--color-text)] leading-none break-words">
                {review.title}
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)] mt-1 break-words">                  Anonymous @ {review.companyName} // {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <ArrowUpRight className="text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] dark:group-hover:text-[var(--color-text)] transition-colors shrink-0" size={18} />
        </div>

        <BrandStarRating rating={review.overallRating} size={12} className="mb-4" />

        {review.pros && (
          <div className="mb-3">
            <span className="text-[10px] font-medium tracking-normal text-emerald-700 dark:text-emerald-400 underline decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">
              The Good
            </span>
            <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mt-1">{review.pros}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-[var(--color-border)] mt-4">
          <div className="flex items-center gap-4 text-xs font-medium text-stone-500 dark:text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5">
              <ThumbsUp size={12} /> {review.helpfulCount || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquareText size={12} /> DISCUSS
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] text-[10px] font-medium ">
            {review.employmentStatus}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ReviewPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data: companyData } = useCompanies(
    debouncedSearch ? { search: debouncedSearch, limit: 5 } : undefined,
  );
  const searchResults = companyData?.companies ?? [];

  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | undefined>();
  const [selectedCompanyName, setSelectedCompanyName] = useState('');

  const { data, isLoading, error } = useReviews({
    companySlug: selectedCompanySlug,
    page,
    limit: 10,
  });

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const selectCompany = (slug: string, name: string) => {
    setSelectedCompanySlug(slug);
    setSelectedCompanyName(name);
    setSearch('');
    setPage(1);
  };

  const clearFilter = () => {
    setSelectedCompanySlug(undefined);
    setSelectedCompanyName('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        {/* Header */}
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal mb-2 text-[var(--color-text)] dark:text-[var(--color-text)] break-words">
            Recent Reviews
          </h1>
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] text-base">
            The latest dispatches from the front lines of corporate culture.
          </p>
        </header>

        {/* Search by company name */}
        <div className="mb-10">
          {selectedCompanyName ? (
            <div className="flex items-center gap-3 bg-[var(--color-paper)] dark:bg-[var(--color-card)] px-5 py-4 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
              <Building2 size={16} className="text-[var(--color-text)] dark:text-[var(--color-text)] shrink-0" />
              <span className="text-sm text-stone-500 dark:text-[var(--color-text-secondary)] flex-1 min-w-0">
                Showing reviews for <strong className="text-[var(--color-text)] dark:text-[var(--color-text)] break-words">{selectedCompanyName}</strong>
              </span>
              <button
                onClick={clearFilter}
                className="p-1 shrink-0 hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
                <div className="flex-1 flex items-center px-5">
                  <Search size={18} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-3 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by company name..."
                    className="w-full py-4 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                  />
                </div>
              </div>
              {search && searchResults.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-[var(--color-card)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
                  {searchResults.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => selectCompany(company.slug, company.name)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-stone-100 dark:hover:bg-[var(--color-surface)] transition-colors border-b border-stone-200 dark:border-[var(--color-border)] last:border-0"
                    >
                      <div className="h-7 w-7 flex items-center justify-center border border-[var(--color-text)] dark:border-[var(--color-text)] text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                        {company.name.charAt(0)}
                      </div>
                      <span className="font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                        {company.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <TornSkeleton count={3} height="h-48" />
        ) : error ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <p className=" text-sm text-stone-500 dark:text-[var(--color-text-secondary)] tracking-normal">
              Failed to load reviews.
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
              <MessageSquareText size={24} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <p className="font-medium text-sm tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              {selectedCompanyName
                ? `No reviews for ${selectedCompanyName} yet.`
                : 'No reviews posted yet.'}
            </p>
            <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)] tracking-normal">
              {selectedCompanyName ? 'Be the first to share your experience.' : 'Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
              <p className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                Showing {reviews.length} entries
              </p>
            </div>
            <div className="grid gap-8">
              {reviews.map((review) => (
                <ReviewCard key={review.publicId} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3 sm:gap-8 border-t-2 border-stone-200 dark:border-[var(--color-border)] pt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="font-medium text-xs tracking-normal hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[var(--color-text)] dark:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className=" text-sm font-medium bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] px-4 py-1">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="font-medium text-xs tracking-normal hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[var(--color-text)] dark:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
