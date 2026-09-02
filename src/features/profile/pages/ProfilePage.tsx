import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, CheckCircle, AlertCircle, Loader2, Mail, MessageSquareText, LogOut, Eye, EyeOff } from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import { useMyReviews } from '@/hooks';
import { useUserAuth } from '@/context/UserAuthContext';
import { resendVerification, updateShowDisplayName } from '@/services/userAuth.service';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import { tornEffect, cardShadow } from '@/constants/brand';
import type { Review } from '@/types';

const statusMeta: Record<Review['status'] & string, { label: string; className: string }> = {
  published: {
    label: 'Published',
    className: 'bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)]',
  },
  pending: {
    label: 'Under review',
    className: 'border border-[var(--color-text)] dark:border-[var(--color-text)] text-[var(--color-text)] dark:text-[var(--color-text)]',
  },
  rejected: {
    label: 'Not approved',
    className: 'border border-orange-700 dark:border-orange-400 text-orange-700 dark:text-orange-400',
  },
};

function ReviewRow({ review }: { review: Review }) {
  const status = statusMeta[review.status ?? 'published'];
  const isPublished = (review.status ?? 'published') === 'published';

  return (
    <div
      className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)] flex flex-col md:flex-row md:items-center gap-5"
      style={tornEffect}
    >
      <div className="h-12 w-12 shrink-0 flex items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] text-lg font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
        {review.companyName?.charAt(0) || 'R'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {isPublished ? (
            <Link
              to={`/review/${review.publicId}`}
              className="font-medium tracking-normal text-sm text-[var(--color-text)] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity"
            >
              {review.title}
            </Link>
          ) : (
            <span className="font-medium tracking-normal text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
              {review.title}
            </span>
          )}
          <span className={`px-2 py-0.5 text-[10px] font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)]">
          {review.companyName} {review.jobTitle ? `// ${review.jobTitle}` : ''} // {formatDate(review.createdAt)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <BrandStarRating rating={review.overallRating} size={10} />
          <span className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
            {review.overallRating ? `${review.overallRating}/5` : 'No rating'}
          </span>
        </div>
      </div>

      <Link
        to={`/review/${review.publicId}/edit`}
        className="inline-flex shrink-0 items-center gap-2 px-5 py-2.5 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors"
      >
        <Pencil size={13} />
        Edit
      </Link>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout, setUser } = useUserAuth();
  const { data, isLoading } = useMyReviews({ page: 1, limit: 100 });
  const [resending, setResending] = useState(false);

  const reviews = data?.reviews ?? [];

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Failed to send verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  const handleToggleShowName = async () => {
    if (!user) return;
    try {
      const updated = await updateShowDisplayName(!user.showDisplayName);
      setUser(updated);
      toast.success(
        updated.showDisplayName
          ? 'Your name will now appear on new reviews'
          : 'Your reviews will now show as Anonymous'
      );
    } catch {
      toast.error('Failed to update preference');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Your account, your reviews — all anonymous, all yours.
          </p>
        </header>

        {/* Account Info Card */}
        <div className="mb-8 bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" style={cardShadow}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
                ACCOUNT
              </p>
              <p className="mt-2 text-lg font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                {user.displayName}
              </p>
              <p className="text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-normal text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle size={12} />
                  Verified
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-normal text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertCircle size={12} />
                    Not verified
                  </span>
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors disabled:opacity-40"
                  >
                    {resending ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <>
                        <Mail size={10} />
                        Verify
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
            Your account is private — it will never be shown on your reviews.
          </p>

          {/* Show Name Toggle */}
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-[var(--color-border)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.showDisplayName ? (
                  <Eye size={14} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
                ) : (
                  <EyeOff size={14} className="text-stone-400 dark:text-[var(--color-text-secondary)]" />
                )}
                <div>
                  <p className="text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Show my name on reviews
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                    {user.showDisplayName
                      ? `New reviews will show as "${user.displayName}"`
                      : 'New reviews will show as "Anonymous"'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleShowName}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  user.showDisplayName
                    ? 'bg-[var(--color-text)] dark:bg-[var(--color-text)]'
                    : 'bg-stone-300 dark:bg-stone-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    user.showDisplayName ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-[var(--color-border)]">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] border border-stone-200 dark:border-[var(--color-border)] hover:border-[var(--color-text)] dark:hover:border-[var(--color-text)] transition-colors"
            >
              <LogOut size={12} />
              Log Out
            </button>
          </div>
        </div>

        {/* My Reviews */}
        <div className="flex items-center justify-between mb-6 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
          <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            My Reviews
          </h2>
          <Link
            to={ROUTES.CREATE_REVIEW}
            className="text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity"
          >
            + Write a new review
          </Link>
        </div>

        {isLoading ? (
          <TornSkeleton count={3} height="h-24" />
        ) : reviews.length === 0 ? (
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
              <MessageSquareText size={24} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <p className="font-medium text-sm tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              You haven't written any reviews yet.
            </p>
            <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)] tracking-normal">
              Your honest experience could help someone decide where to work.
            </p>
            <Link to={ROUTES.CREATE_REVIEW} className="mt-6 inline-block">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity">
                Write your first review
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <ReviewRow key={review.publicId} review={review} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
