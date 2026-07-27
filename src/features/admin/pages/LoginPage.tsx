import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, LogIn } from 'lucide-react';
import { Container } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { tornEffect, cardShadow } from '@/constants/brand';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/admin';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="sm" className="relative z-10 flex min-h-[80vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-10 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-[#2b2f23] dark:border-[var(--color-text)]">
                <Shield size={36} className="text-[#2b2f23] dark:text-[var(--color-text)]" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#2b2f23] dark:text-[var(--color-text)] italic">
                Admin Login
              </h1>
              <p className="mt-2 text-sm font-serif text-stone-500 dark:text-[var(--color-text-secondary)]">
                Sign in to manage the platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                  Email
                </label>
                <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@seethrough.com"
                    autoComplete="email"
                    autoFocus
                    className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                  Password
                </label>
                <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!email.trim() || !password.trim() || isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest border-4 border-[#2b2f23] dark:border-[var(--color-text)] shadow-[6px_6px_0px_0px_#2b2f23] dark:shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in...</>
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono text-stone-400 dark:text-[var(--color-text-secondary)] uppercase">
              <Eye size={12} />
              <span>Default: admin@seethrough.com / admin123</span>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
