import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, User, Bell, MessageSquare, ThumbsUp, CheckCheck, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { ROUTES } from '@/constants';
import { useUnreadCount, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks';
import { useUserAuth } from '@/context/UserAuthContext';
import { useClickOutside } from '@/hooks';
import { formatDate } from '@/utils';

const navLinks: Array<{ label: string; href: string; icon?: LucideIcon }> = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Companies', href: ROUTES.COMPANY },
  { label: 'Reviews', href: ROUTES.REVIEW },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'My Profile', href: ROUTES.PROFILE, icon: User },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  const { data: unreadCount } = useUnreadCount();
  const { data } = useNotifications({ page: 1, limit: 10 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  if (!isAuthenticated) return null;

  const notifications = data?.notifications ?? [];

  const iconForType = (type: string) =>
    type === 'comment' ? <MessageSquare size={12} /> : <ThumbsUp size={12} />;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative border-2  border-[var(--color-text)] dark:border-[var(--color-text)] p-2 text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount! > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] shadow-lg z-50">
          <div className="flex items-center justify-between border-b-2 border-[var(--color-text)]/10 dark:border-[var(--color-border)] px-4 py-3">
            <span className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              Notifications
            </span>
            {(unreadCount ?? 0) > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)]"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-stone-400 dark:text-[var(--color-text-secondary)]">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id);
                  setOpen(false);
                  navigate(`/review/${n.reviewPublicId}`);
                }}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left border-b border-stone-100 dark:border-[var(--color-border)] hover:bg-stone-50 dark:hover:bg-[var(--color-surface)] transition-colors',
                  !n.read && 'bg-stone-50 dark:bg-[var(--color-surface)]',
                )}
              >
                <div className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  n.type === 'comment' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                )}>
                  {iconForType(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'text-xs leading-relaxed',
                    n.read
                      ? 'text-stone-500 dark:text-[var(--color-text-secondary)]'
                      : 'font-medium text-[var(--color-text)] dark:text-[var(--color-text)]',
                  )}>
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-30 border-b-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)]">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
         
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]"
          >
            <Logo className="h-8 w-8" />
            <span>See Through</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative flex h-full items-center gap-1.5 text-xs font-medium tracking-normal transition-colors duration-200',
                    isActive
                      ? 'text-[var(--color-text)] dark:text-[var(--color-text)]'
                      : 'text-stone-400 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)]',
                  )}
                >
                  {link.icon && <link.icon size={13} />}
                  {link.label}
                  {isActive && (
                    <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-[var(--color-text)] dark:bg-[var(--color-text)]" />
                  )}
                </Link>
              );
            })}
            
            <div className="ml-4 h-10 border-l-2 border-[var(--color-text)]/10 dark:border-[var(--color-border)] pl-8 flex items-center">
              <Link to={ROUTES.CREATE_REVIEW}>
                <button className="flex items-center gap-2 bg-[var(--color-text)] dark:bg-[var(--color-text)] px-5 py-2.5 text-[10px] font-medium tracking-normal text-white dark:text-[var(--color-bg)] hover:opacity-90 transition-all active:translate-y-0.5">
                  <Plus size={14} />
                  Write Review
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <ThemeToggle className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)] transition-colors" />
            
            <button
              onClick={() => setMobileOpen(true)}
              className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] p-2 text-[var(--color-text)] dark:text-[var(--color-text)] md:hidden active:bg-[var(--color-text)] active:text-white"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Styling Overrides */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}