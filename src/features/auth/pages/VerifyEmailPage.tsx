import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Container } from '@/components/common';
import { verifyEmail, resendVerification } from '@/services/userAuth.service';
import { useUserAuth } from '@/context/UserAuthContext';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'no-token';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, refreshProfile } = useUserAuth();
  const [status, setStatus] = useState<VerificationStatus>(token ? 'verifying' : 'no-token');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(async () => {
        setStatus('success');
        // Refresh the profile to get updated emailVerified status
        await refreshProfile();
        toast.success('Email verified successfully!');
      })
      .catch(() => {
        setStatus('error');
        toast.error('Verification failed. The link may be expired or invalid.');
      });
  }, [token, refreshProfile]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)]">
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="sm" className="relative z-10 py-16">
        <Link
          to={ROUTES.HOME}
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal">
            {status === 'success' && 'Email Verified'}
            {status === 'error' && 'Verification Failed'}
            {status === 'no-token' && 'Verify Your Email'}
            {status === 'verifying' && 'Verifying...'}
          </h1>
        </header>

        <div
          className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]"
          style={{ boxShadow: '8px 8px 0px 0px var(--color-text)' }}
        >
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 size={32} className="animate-spin text-[var(--color-text)]" />
              <p className="text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
                Verifying your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle size={48} className="text-green-600" />
              <div className="text-center">
                <p className="text-sm text-[var(--color-text)]">
                  Your email has been verified. You can now post reviews.
                </p>
                {user && (
                  <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
                    Signed in as {user.email}
                  </p>
                )}
              </div>
              <Link
                to={ROUTES.HOME}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] hover:opacity-90 transition-opacity"
              >
                Go to Home
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <XCircle size={48} className="text-red-600" />
              <div className="text-center">
                <p className="text-sm text-[var(--color-text)]">
                  The verification link is invalid or has expired.
                </p>
                <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
                  Verification links expire after 24 hours.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3 w-full">
                {user && !user.emailVerified && (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Mail size={14} />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                )}
                <Link
                  to={user ? ROUTES.HOME : ROUTES.LOGIN}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[var(--color-surface)] font-medium text-xs tracking-normal text-[var(--color-text)] border-2 border-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors"
                >
                  {user ? 'Go to Home' : 'Go to Login'}
                </Link>
              </div>
            </div>
          )}

          {status === 'no-token' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Mail size={48} className="text-stone-400" />
              <div className="text-center">
                <p className="text-sm text-[var(--color-text)]">
                  No verification token provided.
                </p>
                <p className="mt-2 text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
                  Check your email for the verification link, or request a new one.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3 w-full">
                {user && !user.emailVerified && (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Mail size={14} />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                )}
                <Link
                  to={user ? ROUTES.HOME : ROUTES.LOGIN}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[var(--color-surface)] font-medium text-xs tracking-normal text-[var(--color-text)] border-2 border-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors"
                >
                  {user ? 'Go to Home' : 'Go to Login'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
