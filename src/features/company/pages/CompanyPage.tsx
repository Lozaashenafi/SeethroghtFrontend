import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, MapPin, Plus, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating } from '@/components/ui';
import { useCompanies, useDebounce } from '@/hooks';
import { formatNumber } from '@/utils';
import { tornEffect, cardShadow } from '@/constants/brand';

export function CompanyPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useCompanies({ search: debouncedSearch || undefined, page, limit: 12 });

  const companies = data?.companies ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="lg" className="relative z-10 py-16">
        {/* Header */}
        <header className="mb-12 max-w-2xl">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-[var(--color-text)] dark:text-[var(--color-text)]">
            Companies
          </h1>
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] font-serif text-base">
            Browse the ledger — read unfiltered reviews from employees.
          </p>
        </header>

        {/* Search + Add Company */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="flex-1 flex border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)] max-w-md">
            <div className="flex-1 flex items-center px-5">
              <Search size={18} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="FIND COMPANY..."
                className="w-full py-4 text-sm font-black uppercase tracking-widest outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
              />
            </div>
          </div>
          <Link to="/company/new">
            <button className="px-6 py-4 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-colors flex items-center gap-2 border-4 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[6px_6px_0px_0px_var(--color-text)] dark:shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)]">
              <Plus size={16} /> Add Company
            </button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 w-full bg-stone-200 dark:bg-[var(--color-card)] animate-pulse border border-stone-300 dark:border-[var(--color-border)]" style={tornEffect} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <p className="font-mono text-sm text-stone-500 dark:text-[var(--color-text-secondary)] uppercase tracking-wider">
              Failed to load companies. Try again later.
            </p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
              <Building2 size={24} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <p className="font-black uppercase text-sm tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
              {search ? 'No companies found' : 'No companies added yet'}
            </p>
            <p className="mt-2 text-xs font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase tracking-wide">
              {search ? 'Try a different search term.' : 'Be the first to add one.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text)] dark:text-[var(--color-text)]">
                Showing {companies.length} entries
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Link key={company.id} to={`/company/${company.slug}`} className="group block">
                  <div
                    className="relative bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1 h-full"
                    style={tornEffect}
                  >
                    <div className="flex flex-col gap-4 h-full">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shrink-0">
                          <span className="text-lg font-black text-[var(--color-text)] dark:text-[var(--color-text)]">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black uppercase tracking-tight text-[var(--color-text)] dark:text-[var(--color-text)] truncate text-sm">
                              {company.name}
                            </h3>
                            {company.verified && (
                              <span className="shrink-0 px-2 py-0.5 border border-[var(--color-text)] dark:border-[var(--color-text)] text-[10px] font-black uppercase text-[var(--color-text)] dark:text-[var(--color-text)]">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {(company.city || company.country) && (
                              <span className="flex items-center gap-1 text-[11px] font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase">
                                <MapPin size={10} />
                                {company.city ?? company.country}
                              </span>
                            )}
                            {company.averageRating && (
                              <BrandStarRating rating={Math.round(Number(company.averageRating))} size={10} />
                            )}
                            <span className="text-[11px] font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase">
                              {formatNumber(company.reviewCount)} review{company.reviewCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto flex justify-end">
                        <ArrowUpRight className="text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] dark:group-hover:text-[var(--color-text)] transition-colors" size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-8 border-t-2 border-stone-200 dark:border-[var(--color-border)] pt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[var(--color-text)] dark:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="font-mono text-sm font-bold bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] px-4 py-1">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[var(--color-text)] dark:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 flex items-center gap-2"
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
