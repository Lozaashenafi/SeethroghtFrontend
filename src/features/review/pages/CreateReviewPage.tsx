import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/common';
import { cardShadow } from '@/constants/brand';
import { ReviewForm } from '../components/ReviewForm';
import { useCreateReview, useCompany } from '@/hooks';
import { useUserAuth } from '@/context/UserAuthContext';

import { toast } from 'sonner';

export function CreateReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillCompanySlug = searchParams.get('company');
  const { data: prefillCompany } = useCompany(prefillCompanySlug ?? undefined);
  const { isAuthenticated } = useUserAuth();

  const createReview = useCreateReview();

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-8 sm:py-12 lg:py-16">
        <Link
          to="/review"
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Reviews
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            Write a Review
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Share your anonymous experience. No retaliation, no regrets.
          </p>
        </header>

        {!isAuthenticated && (
          <div className="mb-8 flex items-start gap-3 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] p-4" style={{ ...cardShadow }}>
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[var(--color-text)] dark:text-[var(--color-text)]" />
            <p className="text-xs leading-relaxed text-[var(--color-text)] dark:text-[var(--color-text)]">
              <span className="font-medium">No account needed.</span> Post anonymously right
              now — your review is held for a quick moderation check before it goes
              live. We never ask for your name or email.
            </p>
          </div>
        )}

        <ReviewForm
          mode="create"
          presetCompanyName={prefillCompany?.name}
          initialValues={{ companySlug: prefillCompanySlug ?? '' }}
          onSubmit={async (payload) => {
            const review = await createReview.mutateAsync(payload as Parameters<typeof createReview.mutateAsync>[0]);
            if (isAuthenticated) {
              toast.success('Your review has been posted!');
              navigate(`/review/${review.publicId}`);
              return;
            }
            // Anonymous reviews are held for moderation, so their detail page is
            // not public yet — send the author back to the reviews hub instead.
            toast.success(
              'Thanks! Your review is awaiting moderation and will appear once approved.',
            );
            navigate('/review');
          }}
          submitLabel="Post Review"
          submitPendingLabel="Posting..."
        />
      </Container>
    </div>
  );
}
