import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  MessageSquareText,
  LogOut,
  Eye,
  EyeOff,
  Key,
  Check,
} from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import { useMyReviews } from '@/hooks';
import { useUserAuth } from '@/context/UserAuthContext';
import {
  resendVerification,
  updateDisplayName,
  changePassword,
  setPassword,
} from '@/services/userAuth.service';
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

  // Display name editing
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [nameSaving, setNameSaving] = useState(false);

  // Password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

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

  const handleSaveName = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error('Display name must be at least 2 characters');
      return;
    }
    setNameSaving(true);
    try {
      const updated = await updateDisplayName(displayName.trim());
      setUser(updated);
      setEditingName(false);
      toast.success('Display name updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update name');
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await setPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password set successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to set password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  const isGoogleUser = !user.hasPassword;

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
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
                ACCOUNT
              </p>

              {editingName ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setDisplayName(user.displayName);
                        setEditingName(false);
                      }
                    }}
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-lg font-medium tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    className="p-1.5 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {nameSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setDisplayName(user.displayName);
                      setEditingName(false);
                    }}
                    className="px-3 py-1.5 text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] border border-stone-200 dark:border-[var(--color-border)] hover:border-[var(--color-text)] dark:hover:border-[var(--color-text)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-lg font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    {user.displayName}
                  </p>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1 text-stone-400 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}

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

          {/* Logout */}
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

        {/* Password Section */}
        <div className="mb-8 bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" style={cardShadow}>
          <div className="flex items-center gap-2 mb-4">
            <Key size={14} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              {isGoogleUser ? 'Set Password' : 'Change Password'}
            </h2>
          </div>

          {isGoogleUser ? (
            <p className="text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)] mb-4">
              You signed up with Google. Set a password so you can also log in with email.
            </p>
          ) : null}

          <form onSubmit={isGoogleUser ? handleSetPassword : handleChangePassword} className="space-y-4">
            {!isGoogleUser && (
              <div>
                <label className="block text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-1.5">
                  CURRENT PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required={!isGoogleUser}
                    className="w-full px-3 py-2.5 pr-10 text-sm font-medium tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[var(--color-text)]"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-1.5">
                {isGoogleUser ? 'NEW PASSWORD' : 'NEW PASSWORD'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 pr-10 text-sm font-medium tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] outline-none"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[var(--color-text)]"
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-1.5">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 text-sm font-medium tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] outline-none"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {passwordSaving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Key size={12} />
              )}
              {isGoogleUser ? 'Set Password' : 'Change Password'}
            </button>
          </form>
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
