import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  Plus,
  ArrowUpRight,
  Building2,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Page, Container } from '@/components/common';
import { BrandStarRating, CompanyLogo } from '@/components/ui';
import { WelcomeModal } from '@/components/onboarding';
import type { Company } from '@/types';
import { useCompanies } from '@/hooks';
import { formatNumber } from '@/utils';
import { ROUTES } from '@/constants';
import { tornEffect } from '@/constants/brand';
import { staggerContainer, fadeInUp } from '@/lib/animations';

function CompanyItem({ company }: { company: Company }) {
  const avgRating = company.averageRating ? Math.round(Number(company.averageRating)) : null;

  return (
    <div className="group relative w-full min-w-0">
      {/* Shadow element - uses primary color with low opacity instead of black */}
      <div
        className="absolute inset-0 translate-x-1 translate-y-1 bg-[var(--color-text)]/10 dark:bg-black/20"
        style={tornEffect}
      />

      <Link
        to={`/company/${company.slug}`}
        state={{ from: 'home' }}
        className="relative block w-full min-w-0 bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 sm:p-8 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
        style={tornEffect}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 sm:mb-7">
          <div className="flex items-center gap-4 min-w-0">
            <CompanyLogo
              name={company.name}
              logoUrl={company.logoUrl}
              size="h-14 w-14"
              fallbackTextSize="text-xl"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none truncate">
                  {company.name}
                </h2>
                {company.verified && (
                  <span className="shrink-0 px-2 py-0.5 border border-[var(--color-text)] dark:border-[var(--color-text)] text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-[var(--color-text-secondary)] mt-1 flex items-center gap-1.5 min-w-0 break-words">
                {(company.city || company.country) && (
                  <>
                    <MapPin size={12} className="shrink-0" />
                    <span className="min-w-0 break-words">{[company.city, company.country].filter(Boolean).join(', ')}</span>
                  </>
                )}
                {!company.city && !company.country && `${formatNumber(company.reviewCount)} review${company.reviewCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <ArrowUpRight className="shrink-0 text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] dark:group-hover:text-[var(--color-text)] transition-colors" />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-text)] dark:text-[var(--color-text)] mb-5 sm:mb-6 min-w-0 break-words">
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-medium">{avgRating ? `${avgRating}/5` : 'N/A'}</span>
            {avgRating && <BrandStarRating rating={avgRating} size={9} />}
            <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">Rating</span>
          </span>
          <span className="h-4 w-px bg-stone-300 dark:bg-[var(--color-border)]" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-medium">{formatNumber(company.reviewCount)}</span>
            <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">Review{company.reviewCount !== 1 ? 's' : ''}</span>
          </span>
          <span className="h-4 w-px bg-stone-300 dark:bg-[var(--color-border)]" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-medium">{company.recommendationRate}%</span>
            <span className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">Recommend</span>
          </span>
        </div>

        {company.description && (
          <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mb-6 min-w-0 break-words">
            {company.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 sm:pt-5 border-t border-stone-200 dark:border-[var(--color-border)]">
          <span className="text-[10px] font-medium tracking-[0.2em] text-[var(--color-text)] dark:text-[var(--color-text)] uppercase">
            Read employee reviews
          </span>
          <span className="text-[10px] font-medium tracking-normal text-stone-400 dark:text-[var(--color-text-secondary)]">
            {company.verified ? 'Verified company' : 'Employee-led'}
          </span>
        </div>
      </Link>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);


  const { data, isLoading, isError } = useCompanies({ limit: 10 });
  const companies = data?.companies ?? [];
  const pagination = data?.pagination;
  const totalCompanies = pagination?.total ?? 0;

  const goSearch = () =>
    navigate(`/search?q=${encodeURIComponent(searchInputRef.current?.value ?? '')}`);

  return (
    <Page className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid Pattern - color based on theme text */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      {/* Keyed by resetKey (bumps ONLY when the browser is handed a brand-new
          identity, e.g. after an admin deleted the previous one) so the modals
          remount and re-read the reset onboarding flags. On a normal load the
          key stays stable and the modals are never remounted mid-flow. */}
      <WelcomeModal />

      <Container size="lg" className="relative z-10">
        {/* ─── Hero ─── */}
        <section className="pt-14 pb-14 md:pt-20 md:pb-16 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-2 text-[10px] font-medium tracking-[0.25em] text-[var(--color-text)] dark:text-[var(--color-text)] uppercase"
            >
              <ShieldCheck size={13} />
              Anonymous workplace reviews
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
              className="mt-6 text-3xl leading-tight sm:text-5xl md:text-6xl sm:leading-[1.05] font-medium tracking-tight text-balance text-[var(--color-text)] dark:text-[var(--color-text)]"
            >
              Honest insights from the people who actually work there.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
              className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-stone-600 dark:text-[var(--color-text-secondary)]"
            >
              See Through is a ledger of workplaces — real employees sharing what the
              interview never told you. Verified accounts. Anonymous voices. No filter.
            </motion.p>
          </div>

          {/* Search */}            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
              className="mt-6 sm:mt-10 flex flex-col-reverse sm:flex-row items-stretch gap-3"
            >
            <div className="flex flex-1 min-w-0 border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
              <div className="flex flex-1 items-center gap-3 px-3 sm:px-5 min-w-0">
                <Search size={18} className="shrink-0 text-stone-400 dark:text-[var(--color-text-secondary)]" />
                <input
                  ref={searchInputRef}
                  type="search"
                  inputMode="search"
                  placeholder={`Search ${totalCompanies ? formatNumber(totalCompanies) : ''} companies...`}
                  className="h-12 w-full min-w-0 text-base font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)] sm:text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && goSearch()}
                />
              </div>
            </div>
            <Link
              to={ROUTES.CREATE_REVIEW}
              className="inline-flex h-14 shrink-0 items-center justify-center gap-1.5 px-4 sm:h-auto bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-4 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Post a review
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-medium tracking-[0.2em] uppercase text-stone-500 dark:text-[var(--color-text-secondary)]"
          >
            <span className="flex items-center gap-2">
              <Building2 size={12} />
              {formatNumber(totalCompanies)} companies in the ledger
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={12} />
              Fully anonymous
            </span>
            <span className="flex items-center gap-2">
              <Eye size={12} />
              Sign up to post
            </span>
          </motion.div>
        </section>

        {/* ─── Feed ─── */}
        <section className="py-14 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 sm:mb-10 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-4">
            <div>
              <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-500 dark:text-[var(--color-text-secondary)]">
                The ledger
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                Browse companies
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                Viewing {companies.length} of {formatNumber(totalCompanies)}
              </span>
              <Link
                to={ROUTES.COMPANY}
                className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--color-text)] dark:text-[var(--color-text)] underline underline-offset-4 decoration-stone-400 dark:decoration-[var(--color-border)] hover:opacity-70 transition-opacity"
              >
                View all
              </Link>
            </div>
          </div>

          <motion.div
            className="grid gap-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <div className="grid gap-10">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 w-full bg-stone-200 dark:bg-[var(--color-card)] animate-pulse border border-stone-300 dark:border-[var(--color-border)]"
                    style={tornEffect}
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 sm:p-8 text-center" style={tornEffect}>
                <p className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                  Couldn&rsquo;t load companies right now.
                </p>
                <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
                  Please try again in a moment.
                </p>
              </div>
            ) : companies.length === 0 ? (
              <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 sm:p-8 text-center" style={tornEffect}>
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                  <Building2 size={24} />
                </div>
                <p className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                  No companies yet.
                </p>
                <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
                  Be the first to add one.
                </p>
              </div>
            ) : (
              companies.map((company) => (
                <motion.div key={company.id} variants={fadeInUp} className="min-w-0">
                  <CompanyItem company={company} />
                </motion.div>
              ))
            )}
          </motion.div>
        </section>
      </Container>
    </Page>
  );
}