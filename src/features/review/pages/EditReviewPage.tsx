import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common';
import { TornSkeleton } from '@/components/ui';
import { ReviewForm, type ReviewFormValues } from '../components/ReviewForm';
import { useMyReview, useUpdateReview, useReviewTags } from '@/hooks';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

export function EditReviewPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();

  // Load the review through the author-scoped endpoint so pending/rejected
  // content (hidden from the public feed) can still be edited, regardless of
  // how many reviews the identity has written.
  const { data: review, isLoading: reviewsLoading, error } = useMyReview(publicId);
  const { data: tagIds, isLoading: tagsLoading } = useReviewTags(publicId);
  const updateReview = useUpdateReview(publicId);

  const isLoading = reviewsLoading || tagsLoading;

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)]">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="sm" className="relative z-10 py-24 text-center">
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] text-sm tracking-normal">
            Review not found. It may have been removed.
          </p>
          <Link to={ROUTES.PROFILE} className="mt-6 inline-block">
            <span className="inline-flex items-center gap-2 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} /> Back to My Profile
            </span>
          </Link>
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)]">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="md" className="relative z-10 py-16">
          <TornSkeleton count={1} height="h-96" />
        </Container>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)]">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="sm" className="relative z-10 py-24 text-center">
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] text-sm tracking-normal">
            Review not found. It may have been removed.
          </p>
          <Link to={ROUTES.PROFILE} className="mt-6 inline-block">
            <span className="inline-flex items-center gap-2 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} /> Back to My Profile
            </span>
          </Link>
        </Container>
      </div>
    );
  }

  const initialValues: Partial<ReviewFormValues> = {
    companySlug: review.companySlug ?? '',
    companyName: review.companyName ?? '',
    title: review.title,
    pros: review.pros ?? '',
    cons: review.cons ?? '',
    workLifeBalance: review.workLifeBalance,
    culture: review.culture,
    management: review.management,
    compensation: review.compensation,
    opportunities: review.opportunities,
    isCurrentEmployee: review.isCurrentEmployee ?? false,
    employmentStatus: (review.employmentStatus ?? '') as ReviewFormValues['employmentStatus'],
    jobTitle: review.jobTitle ?? '',
    tagIds: tagIds ?? [],
    showName: review.showName ?? false,
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        <Link
          to={ROUTES.PROFILE}
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to My Profile
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            Edit Review
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Update your review for {review.companyName ?? 'this company'}.
          </p>
        </header>

        {review.status !== 'published' && (
          <div className="mb-8 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] px-5 py-4">
            <p className="text-[11px] font-medium tracking-normal text-orange-700 dark:text-orange-400">
              This review is currently {review.status}. After your edit it will stay {review.status} until an admin reviews it.
            </p>
          </div>
        )}

        <ReviewForm
          mode="edit"
          initialValues={initialValues}
          cancelHref={ROUTES.PROFILE}
          onSubmit={async (payload) => {
            await updateReview.mutateAsync(payload as Parameters<typeof updateReview.mutateAsync>[0]);
            toast.success('Your review has been updated');
            navigate(ROUTES.PROFILE);
          }}
          submitLabel="Save Changes"
          submitPendingLabel="Saving..."
        />
      </Container>
    </div>
  );
}
