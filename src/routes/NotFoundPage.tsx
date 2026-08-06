import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common';
import { ROUTES } from '@/constants';
import { tornEffect } from '@/constants/brand';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="sm" className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          {/* Torn-edge card */}
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-12 border border-stone-200 dark:border-[var(--color-border)]" style={tornEffect}>
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border-4 border-[var(--color-text)] dark:border-[var(--color-text)]">
              <Eye size={40} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-[var(--color-text)] dark:text-[var(--color-text)] mb-4">
              404
            </h1>
            <p className="font-serif text-base text-stone-500 dark:text-[var(--color-text-secondary)] mb-2">
              "This page isn't visible through our lens."
            </p>
            <p className="text-xs font-mono text-stone-400 dark:text-[var(--color-text-secondary)] uppercase tracking-wider mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to={ROUTES.HOME}>
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest border-4 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[6px_6px_0px_0px_var(--color-text)] dark:shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity">
                <ArrowLeft size={16} /> Back to Home
              </span>
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
