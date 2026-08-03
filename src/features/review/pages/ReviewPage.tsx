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
        className="relative bg-[#FCFAF7] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
        style={tornEffect}
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex gap-4">
            <div className="h-10 w-10 flex items-center justify-center border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] text-base font-black text-[#2b2f23] dark:text-[var(--color-text)]">
              {review.companyName?.charAt(0) || 'R'}
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight text-sm text-[#2b2f23] dark:text-[var(--color-text)] leading-none">
                {review.title}
              </h3>
              <p className="text-[10px] font-mono text-stone-500 dark:text-[var(--color-text-secondary)] mt-1 uppercase">
                {review.companyName} @ {review.jobTitle} // {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <ArrowUpRight className="text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[#2b2f23] dark:group-hover:text-[var(--color-text)] transition-colors shrink-0" size={18} />
        </div>

        <BrandStarRating rating={review.overallRating} size={12} className="mb-4" />

        {review.pros && (
          <div className="mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 underline decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">
              The Good
            </span>
            <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mt-1">{review.pros}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-[var(--color-border)] mt-4">
          <div className="flex items-center gap-4 text-xs font-mono font-bold text-stone-500 dark:text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5">
              <ThumbsUp size={12} /> {review.helpfulCount || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquareText size={12} /> DISCUSS
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] text-[10px] font-black uppercase">
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
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        {/* Header */}
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-[#2b2f23] dark:text-[var(--color-text)]">
            Recent Reviews
          </h1>
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] font-serif text-base">
            The latest dispatches from the front lines of corporate culture.
          </p>
        </header>

        {/* Search by company name */}
        <div className="mb-10">
          {selectedCompanyName ? (
            <div className="flex items-center gap-3 bg-[#FCFAF7] dark:bg-[var(--color-card)] px-5 py-4 border-2 border-[#2b2f23] dark:border-[var(--color-text)]">
              <Building2 size={16} className="text-[#2b2f23] dark:text-[var(--color-text)] shrink-0" />
              <span className="text-sm font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase flex-1">
                Showing reviews for <strong className="text-[#2b2f23] dark:text-[var(--color-text)]">{selectedCompanyName}</strong>
              </span>
              <button
                onClick={clearFilter}
                className="p-1 hover:text-[#2b2f23] dark:hover:text-[var(--color-text)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex border-4 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shadow-[8px_8px_0px_0px_#2b2f23] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
                <div className="flex-1 flex items-center px-5">
                  <Search size={18} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-3 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH BY COMPANY NAME..."
                    className="w-full py-4 text-sm font-black uppercase tracking-widest outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                  />
                </div>
              </div>
              {search && searchResults.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-[var(--color-card)] border-2 border-[#2b2f23] dark:border-[var(--color-text)] shadow-[8px_8px_0px_0px_#2b2f23] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
                  {searchResults.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => selectCompany(company.slug, company.name)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-stone-100 dark:hover:bg-[var(--color-surface)] transition-colors border-b border-stone-200 dark:border-[var(--color-border)] last:border-0"
                    >
                      <div className="h-7 w-7 flex items-center justify-center border border-[#2b2f23] dark:border-[var(--color-text)] text-[10px] font-black text-[#2b2f23] dark:text-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                        {company.name.charAt(0)}
                      </div>
                      <span className="font-black uppercase text-xs tracking-wide text-[#2b2f23] dark:text-[var(--color-text)]">
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
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <p className="font-mono text-sm text-stone-500 dark:text-[var(--color-text-secondary)] uppercase tracking-wider">
              Failed to load reviews.
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-[#2b2f23] dark:border-[var(--color-text)]">
              <MessageSquareText size={24} className="text-[#2b2f23] dark:text-[var(--color-text)]" />
            </div>
            <p className="font-black uppercase text-sm tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
              {selectedCompanyName
                ? `No reviews for ${selectedCompanyName} yet.`
                : 'No reviews posted yet.'}
            </p>
            <p className="mt-2 text-xs font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase tracking-wide">
              {selectedCompanyName ? 'Be the first to share your experience.' : 'Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)] pb-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#2b2f23] dark:text-[var(--color-text)]">
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
              <div className="mt-16 flex items-center justify-center gap-8 border-t-2 border-stone-200 dark:border-[var(--color-border)] pt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[#2b2f23] dark:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="font-mono text-sm font-bold bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] px-4 py-1">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[#2b2f23] dark:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 flex items-center gap-2"
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
