import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Search, Building2, MessageSquareText, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';
import { ROUTES } from '@/constants';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: 'Home', href: ROUTES.HOME, icon: Home },
  { label: 'Search', href: ROUTES.SEARCH, icon: Search },
  { label: 'Companies', href: ROUTES.COMPANY, icon: Building2 },
  { label: 'Reviews', href: ROUTES.REVIEW, icon: MessageSquareText },
];

const actionLinks = [
  { label: 'Write a Review', href: ROUTES.CREATE_REVIEW, icon: Pencil, highlight: true },
  { label: 'Add Company', href: ROUTES.CREATE_COMPANY, icon: Plus, highlight: false },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-surface shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="font-semibold text-brand-olive dark:text-brand-cream">
                Menu
              </span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="rounded-lg p-2.5 text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Action buttons */}
              <div className="mb-6 space-y-2">
                {actionLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors',
                        link.highlight
                          ? 'bg-brand-olive text-brand-cream dark:bg-brand-cream dark:text-brand-olive'
                          : 'border border-border text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5',
                      )}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Navigation links */}
              <div className="border-t pt-4">
                <p className="mb-2 text-[11px] font-medium tracking-normal text-text-secondary/50">
                  Browse
                </p>
                <ul className="space-y-0.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium',
                            'text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5',
                            'transition-colors duration-200',
                          )}
                        >
                          <Icon size={18} />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
