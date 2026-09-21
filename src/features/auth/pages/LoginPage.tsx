import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Container } from '@/components/common';
import { useUserAuth } from '@/context/UserAuthContext';
import { loginUser, googleSignIn } from '@/services/userAuth.service';
import { GoogleSignInError, promptGoogleSignIn } from '@/lib/googleAuth';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || ROUTES.HOME;
  const { setUser } = useUserAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handlePostLogin = (user: { role: string }, targetRedirect: string) => {
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(decodeURIComponent(targetRedirect));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setUser(user);
      toast.success('Welcome back!');
      handlePostLogin(user, redirectTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const credential = await promptGoogleSignIn();
      const user = await googleSignIn(credential);
      setUser(user);
      toast.success('Signed in with Google!');
      handlePostLogin(user, redirectTo);
    } catch (error) {
      if (error instanceof GoogleSignInError) {
        // Friendly, actionable message (config missing, blocked, dismissed…)
        toast.error(error.userMessage);
      } else {
        toast.error(getApiErrorMessage(error, 'Google sign-in failed'))
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)]">
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="sm" className="relative z-10 py-16">
        <Link
          to={ROUTES.HOME}
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal">
            Log In
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Welcome back. Your reviews are still anonymous.
          </p>
        </header>

        <div
          className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]"
          style={{ boxShadow: '8px 8px 0px 0px var(--color-text)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm font-medium tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] outline-none focus:border-[var(--color-text)] dark:focus:border-[var(--color-text)]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 text-sm font-medium tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] outline-none focus:border-[var(--color-text)] dark:focus:border-[var(--color-text)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[var(--color-text)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t-2 border-stone-200 dark:border-[var(--color-border)]" />
            <span className="text-[10px] font-medium tracking-normal text-stone-400 dark:text-[var(--color-text-secondary)]">
              OR
            </span>
            <div className="flex-1 border-t-2 border-stone-200 dark:border-[var(--color-border)]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-[var(--color-surface)] font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link
            to={`${ROUTES.REGISTER}${redirectTo !== ROUTES.HOME ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="font-medium text-[var(--color-text)] dark:text-[var(--color-text)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Container>
    </div>
  );
}
