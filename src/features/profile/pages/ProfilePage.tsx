import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, ShieldCheck, MessageSquareText, User } from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import { useMyReviews } from '@/hooks';
import { useAnonymous } from '@/context/AnonymousContext';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
import { getApiErrorMessage } from '@/utils';
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

function NameEditor() {
  const { identity, setNickname } = useAnonymous();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!identity) return null;

  const canChange = !identity.nicknameRegeneratedAt;
  const currentName = name || identity.nickname || '';

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Please enter a display name');
      return;
    }
    if (trimmed.length > 30) {
      toast.error('Display name must be 30 characters or fewer');
      return;
    }
    setSaving(true);
    try {
      await setNickname(trimmed);
      setName('');
      toast.success('Your display name has been updated');
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Failed to change display name. It can only be changed once.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" style={cardShadow}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
            YOUR DISPLAY NAME
          </p>
          <p className="mt-2 text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            {identity.nickname ?? 'Anonymous'}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
          <User size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
        </div>
      </div>

      {canChange ? (
        <>
          <p className="mb-4 text-[11px] text-stone-500 dark:text-[var(--color-text-secondary)]">
            This name appears next to your reviews. You can change it <strong className="text-[var(--color-text)] dark:text-[var(--color-text)]">once</strong> — pick something you'll be happy with.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder={currentName || 'Type your display name...'}
                maxLength={30}
                className="w-full px-4 py-3 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-2 border-2 border-stone-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] px-4 py-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <p className="text-[11px] text-stone-500 dark:text-[var(--color-text-secondary)]">
            You already used your one-time name change. Your display name is now permanent so other reviewers can recognize you.
          </p>
        </div>
      )}
    </div>
  );
}

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
  const { isReady } = useAnonymous();
  const { data, isLoading } = useMyReviews({ page: 1, limit: 100 });

  const reviews = data?.reviews ?? [];

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
          <h1 className="text-4xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Your reviews, your alias — all anonymous, all yours.
          </p>
        </header>

        {!isReady ? (
          <TornSkeleton count={1} height="h-40" />
        ) : (
          <div className="mb-12">
            <NameEditor />
          </div>
        )}

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
