import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Search, Building2, MessageSquareText, Info, Pencil, Plus, User, Bell } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';
import { ROUTES } from '@/constants';
import { useUnreadCount } from '@/hooks';
import { useUserAuth } from '@/context/UserAuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: 'Home', href: ROUTES.HOME, icon: Home },
  { label: 'Search', href: ROUTES.SEARCH, icon: Search },
  { label: 'Companies', href: ROUTES.COMPANY, icon: Building2 },
  { label: 'Reviews', href: ROUTES.REVIEW, icon: MessageSquareText },
  { label: 'About', href: ROUTES.ABOUT, icon: Info },
  { label: 'My Profile', href: ROUTES.PROFILE, icon: User },
];

const actionLinks = [
  { label: 'Write a Review', href: ROUTES.CREATE_REVIEW, icon: Pencil, highlight: true },
  { label: 'Add Company', href: ROUTES.CREATE_COMPANY, icon: Plus, highlight: false },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const location = useLocation();
  const { isAuthenticated } = useUserAuth();
  const { data: unreadCount } = useUnreadCount();

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
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col border-l-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] shadow-[-8px_0px_0px_0px_var(--color-text)] dark:shadow-[-8px_0px_0px_0px_rgba(255,239,205,0.2)]"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] px-5 py-4">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-text)] dark:text-[var(--color-text)]">
                Menu
              </span>
              <div className="flex items-center gap-2">
                {isAuthenticated && (unreadCount ?? 0) > 0 && (
                  <Link
                    to={ROUTES.PROFILE}
                    onClick={onClose}
                    className="relative border-2 border-[var(--color-text)] dark:border-[var(--color-text)] p-2 text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)] transition-colors"
                  >
                    <Bell size={18} />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount! > 9 ? '9+' : unreadCount}
                    </span>
                  </Link>
                )}
                <ThemeToggle className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)] transition-colors" />
                <button
                  onClick={onClose}
                  className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] p-2 text-[var(--color-text)] dark:text-[var(--color-text)] active:bg-[var(--color-text)] active:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Action buttons */}
              <div className="mb-6 space-y-3">
                {actionLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-normal transition-colors',
                        link.highlight
                          ? 'border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] shadow-[4px_4px_0px_0px_var(--color-text)] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90'
                          : 'border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)]',
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Navigation links */}
              <div className="border-t-2 border-[var(--color-text)]/15 dark:border-[var(--color-border)] pt-5">
                <p className="mb-2 px-1 text-[10px] font-medium tracking-[0.2em] uppercase text-stone-500 dark:text-[var(--color-text-secondary)]">
                  Browse
                </p>
                <ul className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-normal transition-colors',
                            isActive
                              ? 'bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)]'
                              : 'text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)]',
                          )}
                        >
                          <Icon size={18} className="shrink-0" />
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
