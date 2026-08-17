import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common';
import { ReviewForm } from '../components/ReviewForm';
import { useCreateReview, useCompany } from '@/hooks';
import { useAnonymous } from '@/context/AnonymousContext';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

export function CreateReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillCompanySlug = searchParams.get('company');
  const { data: prefillCompany } = useCompany(prefillCompanySlug ?? undefined);

  const createReview = useCreateReview();
  const { identity } = useAnonymous();

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        <Link
          to="/review"
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Reviews
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            Write a Review
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Share your anonymous experience. No retaliation, no regrets.
          </p>
        </header>

        {identity?.nickname && (
          <div className="mb-8 bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" style={{ boxShadow: '8px 8px 0px 0px var(--color-text)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
                  YOU ARE POSTING AS
                </p>
                <p className="mt-1 text-lg font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                  {identity.nickname}
                </p>
              </div>
              {!identity.nicknameRegeneratedAt && (
                <Link
                  to={ROUTES.PROFILE}
                  className="inline-flex items-center gap-2 px-4 py-2 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors"
                >
                  Change display name
                </Link>
              )}
            </div>
            <p className="mt-2 text-[11px] text-stone-400 dark:text-[var(--color-text-secondary)]">
              {identity.nicknameRegeneratedAt
                ? 'Your display name can only be changed once.'
                : 'This name is shown next to your review. You can change it once from your profile.'}
            </p>
          </div>
        )}

        <ReviewForm
          mode="create"
          presetCompanyName={prefillCompany?.name}
          initialValues={{ companySlug: prefillCompanySlug ?? '' }}
          onSubmit={async (payload) => {
            const review = await createReview.mutateAsync(payload as Parameters<typeof createReview.mutateAsync>[0]);
            toast.success('Your review has been posted!');
            navigate(`/review/${review.publicId}`);
          }}
          submitLabel="Post Review"
          submitPendingLabel="Posting..."
        />
      </Container>
    </div>
  );
}
