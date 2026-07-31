import { useParams, Link } from 'react-router-dom';
import { Globe, MapPin, ArrowLeft, ThumbsUp, Briefcase, Pencil, MessageSquareText } from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import { useCompany, useReviews } from '@/hooks';
import { formatDate } from '@/utils';
import { ROUTES } from '@/constants';
import { tornEffect, cardShadow } from '@/constants/brand';

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(slug);
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({ companySlug: slug, limit: 20 });

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="lg" className="relative z-10 py-16">
          <TornSkeleton count={1} height="h-64" />
        </Container>
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="sm" className="relative z-10 py-24 text-center">
          <p className="font-mono text-stone-500 dark:text-[var(--color-text-secondary)] uppercase text-sm tracking-wider">
            Company not found.
          </p>
          <Link to="/company" className="mt-6 inline-block">
            <span className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[#2b2f23] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} /> Back to Companies
            </span>
          </Link>
        </Container>
      </div>
    );
  }

  const avgRating = company.averageRating ? Math.round(Number(company.averageRating)) : null;

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="lg" className="relative z-10 py-16">
        {/* Back link */}
        <Link
          to="/company"
          className="mb-8 inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[#2b2f23] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Companies
        </Link>

        {/* Company Hero */}
        <div className="mb-10">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 flex items-center justify-center border-4 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shrink-0">
              <span className="text-4xl font-black text-[#2b2f23] dark:text-[var(--color-text)]">
                {company.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-[#2b2f23] dark:text-[var(--color-text)] italic leading-none">
                  {company.name}
                </h1>
                {company.verified && (
                  <span className="px-3 py-1 border-2 border-[#2b2f23] dark:border-[var(--color-text)] text-[10px] font-black uppercase text-[#2b2f23] dark:text-[var(--color-text)]">
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
                {(company.city || company.country) && (
                  <span className="flex items-center gap-1.5 font-mono uppercase text-xs tracking-wider">
                    <MapPin size={14} />
                    {[company.city, company.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono uppercase text-xs tracking-wider hover:text-[#2b2f23] dark:hover:text-[var(--color-text)] transition-colors"
                  >
                    <Globe size={14} />
                    Website
                  </a>
                )}
                {company.reviewCount > 0 && (
                  <span className="flex items-center gap-1.5 font-mono uppercase text-xs tracking-wider">
                    <Briefcase size={14} />
                    {company.reviewCount} review{company.reviewCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
              <div className="text-3xl font-black text-[#2b2f23] dark:text-[var(--color-text)]">
                {avgRating ? `${avgRating}/5` : 'N/A'}
              </div>
              {avgRating && <BrandStarRating rating={avgRating} size={14} className="justify-center mt-2" />}
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-[var(--color-text-secondary)]">
                Overall Rating
              </p>
            </div>
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
              <div className="text-3xl font-black text-[#2b2f23] dark:text-[var(--color-text)]">
                {company.reviewCount}
              </div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-[var(--color-text-secondary)]">
                Total Reviews
              </p>
            </div>
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
              <div className="flex items-center justify-center gap-2 text-3xl font-black text-[#2b2f23] dark:text-[var(--color-text)]">
                <ThumbsUp size={24} />
                {company.recommendationRate}
              </div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-[var(--color-text-secondary)]">
                Recommended %
              </p>
            </div>
          </div>

          {company.description && (
            <div className="mt-8 bg-[#FCFAF7] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <p className="font-serif text-stone-600 dark:text-[var(--color-text-secondary)] leading-relaxed italic">
                "{company.description}"
              </p>
            </div>
          )}
        </div>

        {/* Write Review CTA */}
        <Link to={`${ROUTES.CREATE_REVIEW}?company=${company.slug}`} className="block mb-12">
          <div className="flex items-center justify-center gap-3 py-5 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-sm uppercase tracking-widest border-4 border-[#2b2f23] dark:border-[var(--color-text)] shadow-[8px_8px_0px_0px_#2b2f23] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity">
            <Pencil size={18} />
            Write a Review for {company.name}
          </div>
        </Link>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)] pb-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#2b2f23] dark:text-[var(--color-text)]">
              Employee Reviews
            </h2>
            <span className="text-[10px] font-mono text-stone-400 dark:text-[var(--color-text-secondary)] uppercase">
              {reviewsData?.reviews.length ?? 0} entries
            </span>
          </div>

          {reviewsLoading ? (
            <TornSkeleton count={3} height="h-48" />
          ) : reviewsData?.reviews.length === 0 ? (
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
              <p className="font-serif text-stone-500 dark:text-[var(--color-text-secondary)]">
                No reviews yet for this company. Be the first.
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {reviewsData?.reviews.map((review) => (
                <Link key={review.publicId} to={`/review/${review.publicId}`} className="group block">
                  <div
                    className="relative bg-[#FCFAF7] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
                    style={tornEffect}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 flex items-center justify-center border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] text-base font-black text-[#2b2f23] dark:text-[var(--color-text)]">
                          {review.companyName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black uppercase tracking-tight text-sm text-[#2b2f23] dark:text-[var(--color-text)]">{review.title}</h3>
                          <p className="text-[10px] font-mono text-stone-500 dark:text-[var(--color-text-secondary)] mt-0.5 uppercase">
                            {review.jobTitle} // {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      {review.isVerified && (
                        <span className="shrink-0 px-2 py-0.5 border border-[#2b2f23] dark:border-[var(--color-text)] text-[10px] font-black uppercase text-[#2b2f23] dark:text-[var(--color-text)]">
                          Verified
                        </span>
                      )}
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
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] text-[10px] font-black uppercase">
                          {review.employmentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
