import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  ArrowUpRight,
  Flag,
  Building2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants';

const adminNavLinks = [
  { label: 'Reports', href: ROUTES.admin.ROOT, icon: Flag },
  { label: 'Companies', href: ROUTES.admin.COMPANIES, icon: Building2 },
  { label: 'Reviews', href: ROUTES.admin.REVIEWS, icon: MessageSquare },
  { label: 'Users', href: ROUTES.admin.USERS, icon: Users },
];

export function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const isActive = (href: string) =>
    href === ROUTES.admin.ROOT
      ? location.pathname === href
      : location.pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)]">
      {/* Admin accent strip */}
      <div className="flex items-center justify-between bg-[var(--color-text)] px-4 py-1 text-white dark:bg-[var(--color-text)] dark:text-[var(--color-bg)] sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 whitespace-nowrap text-[9px] font-medium tracking-[0.25em]">
          <Shield size={10} />
          Admin Console &middot; Restricted Access
        </p>
        <p className="hidden whitespace-nowrap text-[9px] font-medium tracking-[0.25em] sm:block">
          Authorized Personnel Only
        </p>
      </div>

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand + Admin badge */}
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]"
          >
            <img src="/logo.jpg" alt="See Through Logo" className="h-8 w-8" />
            <span className="hidden sm:inline">See Through</span>
          </Link>
          <span className="flex items-center gap-1.5 border-2 border-[var(--color-text)] bg-[var(--color-text)] px-2.5 py-1 text-[10px] font-medium tracking-normal text-white shadow-[3px_3px_0px_0px_rgba(43,47,35,0.25)] dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)] dark:shadow-[3px_3px_0px_0px_rgba(255,239,205,0.15)]">
            <Shield size={12} />
            Admin
          </span>
        </div>

        {/* Desktop section nav */}
        {admin && (
          <div className="hidden h-full items-center gap-8 md:flex">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative flex h-full items-center gap-1.5 text-xs font-medium tracking-normal transition-colors duration-200',
                    active
                      ? 'text-[var(--color-text)] dark:text-[var(--color-text)]'
                      : 'text-stone-400 hover:text-[var(--color-text)] dark:text-[var(--color-text-secondary)] dark:hover:text-[var(--color-text)]',
                  )}
                >
                  <Icon size={14} />
                  {link.label}
                  {active && (
                    <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-[var(--color-text)] dark:bg-[var(--color-text)]" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.HOME}
            className="hidden items-center gap-1.5 border-2 border-[var(--color-text)]/30 px-3 py-2 text-[10px] font-medium tracking-normal text-stone-500 transition-colors hover:border-[var(--color-text)] hover:text-[var(--color-text)] dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)] dark:hover:border-[var(--color-text)] dark:hover:text-[var(--color-text)] md:flex"
          >
            <ArrowUpRight size={13} />
            View Site
          </Link>

          <ThemeToggle className="border-2 border-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-white dark:border-[var(--color-text)] dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)]" />

          {admin && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border-2 border-[var(--color-text)] bg-[var(--color-text)] px-4 py-2 text-[10px] font-medium tracking-normal text-white transition-all hover:opacity-90 active:translate-y-0.5 dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
