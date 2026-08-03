import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Search,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { Page, Container } from '@/components/common';
import { Button } from '@/components/ui';
import { WelcomeModal } from '@/components/onboarding';
import type { Review } from '@/types';
import { useReviews, useVoteOnReview } from '@/hooks';
import { formatDate } from '@/utils';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

const tornEffect = {
  clipPath: `polygon(0% 0%, 100% 0%, 100% 96%, 98% 98%, 95% 96%, 92% 99%, 89% 96%, 85% 98%, 80% 95%, 75% 99%, 70% 96%, 65% 98%, 60% 95%, 55% 99%, 50% 96%, 45% 98%, 40% 95%, 35% 99%, 30% 96%, 25% 98%, 20% 95%, 15% 99%, 10% 96%, 5% 98%, 0% 95%)`
};

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={`h-3 w-3 rotate-45 border ${
            star <= rating 
              ? 'bg-[#2b2f23] border-[#2b2f23] dark:bg-[var(--color-text)] dark:border-[var(--color-text)]' 
              : 'bg-transparent border-stone-300 dark:border-[var(--color-border)]'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const vote = useVoteOnReview();

  const handleVote = async (e: React.MouseEvent) => {
    // Keep the vote from bubbling up to the card's <Link> navigation.
    e.preventDefault();
    e.stopPropagation();
    if (vote.isPending) return;
    try {
      await vote.mutateAsync({ reviewPublicId: review.publicId, voteType: 'helpful' });
      toast.success('Vote recorded');
    } catch {
      toast.error('Failed to record vote');
    }
  };

  return (
    <div className="group relative">
      {/* Shadow element - uses primary color with low opacity instead of black */}
      <div className="absolute inset-0 translate-x-1 translate-y-1 bg-[#2b2f23]/10 dark:bg-black/20" style={tornEffect} />
      
      <Link
        to={`/review/${review.publicId}`}
        className="relative block bg-[#FCFAF7] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)] transition-transform duration-300 hover:-translate-y-1"
        style={tornEffect}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-4">
            <div className="h-14 w-14 flex items-center justify-center border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] text-xl font-black text-[#2b2f23] dark:text-[var(--color-text)]">
              {review.companyName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-[#2b2f23] dark:text-[var(--color-text)] leading-none">
                {review.companyName}
              </h2>
              <p className="text-xs font-mono text-stone-500 dark:text-[var(--color-text-secondary)] mt-1 uppercase">
                {review.jobTitle} // {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <ArrowUpRight className="text-stone-400 dark:text-[var(--color-text-secondary)] group-hover:text-[#2b2f23] dark:group-hover:text-[var(--color-text)] transition-colors" />
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-serif text-[#2b2f23] dark:text-[var(--color-text)] mb-4 leading-tight">
            "{review.title}"
          </h3>
          <StarRating rating={review.overallRating} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-200 dark:bg-[var(--color-border)] border border-stone-200 dark:border-[var(--color-border)] mb-8">
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-surface)] p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-2 underline decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">The Good</span>
            <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">{review.pros}</p>
          </div>
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-surface)] p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700 dark:text-orange-400 block mb-2 underline decoration-orange-200 dark:decoration-orange-900 underline-offset-4">The Bad</span>
            <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">{review.cons}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-stone-200 dark:border-[var(--color-border)]">
          <div className="flex gap-6">
             <button
                type="button"
                onClick={handleVote}
                disabled={vote.isPending}
                aria-label="Mark review as helpful"
                className="flex items-center gap-2 text-xs font-mono font-bold text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
             >
                <ThumbsUp size={14} /> {review.helpfulCount || 0}
             </button>
             <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-500 dark:text-[var(--color-text-secondary)]">
                <MessageSquareText size={14} /> DISCUSS
             </div>
          </div>
          <div className="flex gap-2">
            {review.isVerified && (
               <span className="px-2 py-0.5 border border-[#2b2f23] dark:border-[var(--color-text)] text-[10px] font-black uppercase text-[#2b2f23] dark:text-[var(--color-text)]">Verified Dept.</span>
            )}
            <span className="px-2 py-0.5 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] text-[10px] font-black uppercase">
              {review.employmentStatus}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'engagement' | 'recent'>('engagement');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useReviews({ sortBy, page, limit: 10 });
  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  return (
    <Page className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid Pattern - color based on theme text */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

      <WelcomeModal />

      <Container size="lg" className="relative z-10 py-16">
        

        <main className="max-w-4xl mx-auto">
          {/* Sharp Search Bar - Using Primary Light for the border/button */}
          <div className="flex border-4 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] mb-16 shadow-[8px_8px_0px_0px_#2b2f23] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
            <div className="flex-1 flex items-center px-6 border-r-4 border-[#2b2f23] dark:border-[var(--color-text)]">
              <Search size={20} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="FIND A COMPANY..."
                className="w-full py-5 text-sm font-black uppercase tracking-widest outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${searchInputRef.current?.value}`)}
              />
            </div>
            <Link to={ROUTES.CREATE_REVIEW} className="hidden sm:block">
              <button className="h-full px-8 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-colors flex items-center gap-2">
                <Plus size={16} /> Post Review
              </button>
            </Link>
          </div>

          {/* Filtering Header */}
          <div className="flex items-center justify-between mb-12 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)] pb-4">
            <div className="flex gap-8">
              {(['engagement', 'recent'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => { setSortBy(sort); setPage(1); }}
                  className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                    sortBy === sort 
                      ? 'text-[#2b2f23] dark:text-[var(--color-text)]' 
                      : 'text-stone-400 dark:text-[var(--color-text-secondary)] hover:text-stone-600 dark:hover:text-[var(--color-text)]'
                  }`}
                >
                  {sort === 'recent' ? 'Latest' : 'Trending'}
                  {sortBy === sort && <div className="absolute -bottom-[18px] left-0 right-0 h-1 bg-[#2b2f23] dark:bg-[var(--color-text)]" />}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-mono text-stone-400 dark:text-[var(--color-text-secondary)] uppercase">
              Viewing {reviews.length} entries
            </div>
          </div>

          <div className="grid gap-12">
            {isLoading ? (
              <div className="grid gap-12">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-80 w-full bg-stone-200 dark:bg-[var(--color-card)] animate-pulse border border-stone-300 dark:border-[var(--color-border)]" style={tornEffect} />
                ))}
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewItem key={review.publicId} review={review} />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-20 flex items-center justify-center gap-12 border-t-2 border-stone-200 dark:border-[var(--color-border)] pt-12">
              <Button
                variant="ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[#2b2f23] dark:text-[var(--color-text)]"
              >
                <ChevronLeft className="mr-2" /> Previous
              </Button>
              <div className="font-mono text-sm font-bold bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] px-4 py-1">
                {pagination.page} / {pagination.totalPages}
              </div>
              <Button
                variant="ghost"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= pagination.totalPages}
                className="font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-[var(--color-card)] text-[#2b2f23] dark:text-[var(--color-text)]"
              >
                Next <ChevronRight className="ml-2" />
              </Button>
            </div>
          )}
        </main>
      </Container>
    </Page>
  );
}