import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, MapPin, Plus, ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import { useCompanies } from '@/hooks';
import { formatNumber } from '@/utils';
import { ROUTES } from '@/constants';
import { tornEffect, cardShadow } from '@/constants/brand';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(query);

  const { data, isLoading } = useCompanies(
    query ? { search: query, limit: 20 } : undefined,
  );

  const handleSearch = (value: string) => {
    setInputValue(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setInputValue('');
    setSearchParams({});
  };

  const companies = data?.companies ?? [];

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        {/* Header */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-[#2b2f23] dark:text-[var(--color-text)]">
            Search Companies
          </h1>
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] font-serif text-base">
            Find companies and read unfiltered employee reviews.
          </p>
        </header>

        {/* Sharp Search Bar */}
        <div className="flex border-4 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] mb-12 shadow-[8px_8px_0px_0px_#2b2f23] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
          <div className="flex-1 flex items-center px-6 border-r-4 border-[#2b2f23] dark:border-[var(--color-text)]">
            <Search size={20} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-4 shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="SEARCH COMPANY..."
              className="w-full py-5 text-sm font-black uppercase tracking-widest outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
            />
            {inputValue && (
              <button onClick={clearSearch} className="ml-2 p-1 hover:text-[#2b2f23] dark:hover:text-[var(--color-text)] transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
          <Link to={ROUTES.CREATE_COMPANY} className="hidden sm:block">
            <button className="h-full px-8 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-colors flex items-center gap-2">
              <Plus size={16} /> Add
            </button>
          </Link>
        </div>

        {/* Results */}
        {!query ? (
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-[#2b2f23] dark:border-[var(--color-text)]">
              <Search size={32} className="text-[#2b2f23] dark:text-[var(--color-text)]" />
            </div>
            <p className="font-serif text-stone-500 dark:text-[var(--color-text-secondary)] text-sm">
              Enter a company name to find reviews and insights.
            </p>
          </div>
        ) : isLoading ? (
          <TornSkeleton count={3} height="h-24" />
        ) : companies.length === 0 ? (
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <p className="font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase text-sm tracking-wider">
              No companies found for <span className="font-black text-[#2b2f23] dark:text-[var(--color-text)]">&ldquo;{query}&rdquo;</span>
            </p>
            <p className="mt-3 text-xs text-stone-400 dark:text-[var(--color-text-secondary)] font-mono uppercase tracking-wide">
              Try a different search term.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)] pb-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#2b2f23] dark:text-[var(--color-text)]">
                Found <span className="font-mono">{formatNumber(data?.pagination?.total ?? 0)}</span> result{(data?.pagination?.total ?? 0) !== 1 ? 's' : ''}
              </p>
              <span className="text-[10px] font-mono text-stone-400 dark:text-[var(--color-text-secondary)] uppercase">
                for &ldquo;{query}&rdquo;
              </span>
            </div>

            <div className="grid gap-4">
              {companies.map((company) => (
                <Link key={company.id} to={`/company/${company.slug}`} className="group block">
                  <div
                    className="relative bg-[#FCFAF7] dark:bg-[var(--color-card)] p-5 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
                    style={tornEffect}
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 flex items-center justify-center border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shrink-0">
                        <span className="text-lg font-black text-[#2b2f23] dark:text-[var(--color-text)]">
                          {company.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black uppercase tracking-tight text-[#2b2f23] dark:text-[var(--color-text)] truncate text-sm">
                            {company.name}
                          </h3>
                          {company.verified && (
                            <span className="shrink-0 px-2 py-0.5 border border-[#2b2f23] dark:border-[var(--color-text)] text-[10px] font-black uppercase text-[#2b2f23] dark:text-[var(--color-text)]">
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
                      <ArrowUpRight className="text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[#2b2f23] dark:group-hover:text-[var(--color-text)] transition-colors shrink-0" size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
