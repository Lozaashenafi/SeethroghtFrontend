import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, MapPin, Plus, ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton, CompanyLogo } from '@/components/ui';
import { useCompanies } from '@/hooks';
import { formatNumber } from '@/utils';
import { ROUTES } from '@/constants';
import { tornEffect, cardShadow } from '@/constants/brand';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(query);

  const { data, isLoading, isError } = useCompanies(
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
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        {/* Header */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal mb-2 text-[var(--color-text)] dark:text-[var(--color-text)]">
            Search Companies
          </h1>
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] text-base">
            Find companies and read unfiltered employee reviews.
          </p>
        </header>

        {/* Sharp Search Bar */}
        <div className="flex border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] mb-12 shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
          <div className="flex-1 flex items-center px-6 border-r-4 border-[var(--color-text)] dark:border-[var(--color-text)]">
            <Search size={20} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-4 shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search a company..."
              className="w-full py-5 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
            />
            {inputValue && (
              <button onClick={clearSearch} className="ml-2 p-1 hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
          <Link to={ROUTES.CREATE_COMPANY} className="hidden sm:block">
            <button className="h-full px-8 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal hover:opacity-90 transition-colors flex items-center gap-2">
              <Plus size={16} /> Add
            </button>
          </Link>
        </div>

        {/* Results */}
        {!query ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
              <Search size={32} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <p className=" text-stone-500 dark:text-[var(--color-text-secondary)] text-sm">
              Enter a company name to find reviews and insights.
            </p>
          </div>
        ) : isLoading ? (
          <TornSkeleton count={3} height="h-24" />
        ) : isError ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <p className=" text-stone-500 dark:text-[var(--color-text-secondary)] text-sm tracking-normal">
              Couldn&rsquo;t load search results right now.
            </p>
            <p className="mt-3 text-xs text-stone-400 dark:text-[var(--color-text-secondary)] tracking-normal">
              Please try again in a moment.
            </p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <p className=" text-stone-500 dark:text-[var(--color-text-secondary)] text-sm tracking-normal">
              No companies found for <span className="font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">&ldquo;{query}&rdquo;</span>
            </p>
            <p className="mt-3 text-xs text-stone-400 dark:text-[var(--color-text-secondary)] tracking-normal">
              Try a different search term.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-8 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
              <p className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                Found <span className="">{formatNumber(data?.pagination?.total ?? 0)}</span> result{(data?.pagination?.total ?? 0) !== 1 ? 's' : ''}
              </p>
              <span className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)] break-words">
                for &ldquo;{query}&rdquo;
              </span>
            </div>

            <div className="grid gap-4">
              {companies.map((company) => (
                <Link key={company.id} to={`/company/${company.slug}`} state={{ from: 'search' }} className="group block">
                  <div
                    className="relative bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
                    style={tornEffect}
                  >
                    <div className="flex items-center gap-5">
                      <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] truncate text-sm">
                            {company.name}
                          </h3>
                          {company.verified && (
                            <span className="shrink-0 px-2 py-0.5 border border-[var(--color-text)] dark:border-[var(--color-text)] text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                          {(company.city || company.country) && (
                            <span className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-[var(--color-text-secondary)] ">
                              <MapPin size={10} />
                              {company.city ?? company.country}
                            </span>
                          )}
                          {company.averageRating && (
                            <BrandStarRating rating={Math.round(Number(company.averageRating))} size={10} />
                          )}
                          <span className="text-[11px] text-stone-500 dark:text-[var(--color-text-secondary)] ">
                            {formatNumber(company.reviewCount)} review{company.reviewCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] dark:group-hover:text-[var(--color-text)] transition-colors shrink-0" size={18} />
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
