import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowUpRight,
  Flag,
  Building2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Container } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants';

const adminQuickLinks = [
  { label: 'Reports', href: ROUTES.admin.ROOT, icon: Flag },
  { label: 'Companies', href: ROUTES.admin.COMPANIES, icon: Building2 },
  { label: 'Reviews', href: ROUTES.admin.REVIEWS, icon: MessageSquare },
  { label: 'Users', href: ROUTES.admin.USERS, icon: Users },
];

export function AdminFooter() {
  const { admin } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t-4 border-[var(--color-text)] bg-[var(--color-paper-warm)] pt-12 pb-8 dark:border-[var(--color-text)] dark:bg-[var(--color-bg)]"
      role="contentinfo"
    >
      <Container size="lg">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-[var(--color-text)] p-1.5 dark:bg-[var(--color-text)]">
                <Shield size={16} className="text-white dark:text-[var(--color-bg)]" />
              </div>
              <span className="text-xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                Admin Console
              </span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-stone-500 dark:text-[var(--color-text-secondary)]">
              Internal moderation console for the See Through platform. Reports,
              companies, reviews &amp; users &mdash; all in one place.
            </p>
            <Link
              to={ROUTES.HOME}
              className="mt-5 inline-flex items-center gap-2 border-2 border-[var(--color-text)] bg-[var(--color-text)] px-4 py-2.5 text-[10px] font-medium tracking-normal text-white transition-all hover:opacity-90 active:translate-y-0.5 dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]"
            >
              <ArrowUpRight size={14} />
              Back to Public Site
            </Link>
          </div>

          {/* Section links */}
          <div>
            <h3 className="mb-5 border-b border-[var(--color-text)]/20 pb-2 text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:border-[var(--color-border)] dark:text-[var(--color-text)]">
              Sections
            </h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {adminQuickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2 text-xs font-medium text-stone-500 transition-colors hover:text-[var(--color-text)] dark:text-[var(--color-text-secondary)] dark:hover:text-[var(--color-text)]"
                    >
                      <Icon
                        size={13}
                        className="transition-transform group-hover:-translate-y-0.5"
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Access status */}
          <div>
            <h3 className="mb-5 border-b border-[var(--color-text)]/20 pb-2 text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:border-[var(--color-border)] dark:text-[var(--color-text)]">
              Access
            </h3>
            <div className="border-2 border-[var(--color-text)]/20 bg-white p-4 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
              {admin ? (
                <p className="flex items-center gap-2 text-[10px] font-medium tracking-normal text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 animate-pulse bg-emerald-600 dark:bg-emerald-400" />
                  Authenticated Session
                </p>
              ) : (
                <p className="flex items-center gap-2 text-[10px] font-medium tracking-normal text-orange-700 dark:text-orange-400">
                  <span className="h-2 w-2 bg-orange-600 dark:bg-orange-400" />
                  Restricted Access
                </p>
              )}
              <p className="mt-2 text-[10px] tracking-normal text-stone-400 dark:text-[var(--color-text-secondary)]">
                Restricted to authorized administrators only.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom ledger line */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-2 border-[var(--color-text)] pt-6 md:flex-row dark:border-[var(--color-text)]">
          <div className="text-[10px] font-medium tracking-normal text-stone-400 dark:text-[var(--color-text-secondary)]">
            Log Number: {year}-ADM-CONSOLE
          </div>
          <div className="text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            &copy; {year} See Through Ledger. Internal Use Only.
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-4 bg-[var(--color-text)] dark:bg-[var(--color-text)]" />
            <div className="h-4 w-4 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" />
            <div className="h-4 w-4 bg-stone-300 dark:bg-[var(--color-card)]" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
