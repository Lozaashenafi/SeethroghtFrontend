import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Flag,
  Building2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { AdminHeader, AdminFooter } from '@/components/navigation';
import { Container } from '@/components/common';
import { useUserAuth } from '@/context/UserAuthContext';
import { cn } from '@/lib/cn';

const adminNavLinks = [
  { label: 'Reports', href: '/admin', icon: Flag },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Users', href: '/admin/users', icon: Users },
];

export function DashboardLayout() {
  const location = useLocation();
  const { user } = useUserAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)]">
      <AdminHeader />
      <div className="flex-1 py-4 sm:py-8">
        <Container size="full" className="px-3 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28 space-y-1" aria-label="Dashboard navigation">
                <div className="mb-4 flex items-center justify-between px-3">
                  <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
                    Admin Console
                  </p>
                </div>

                {user && (
                  <div className="mb-4 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] px-4 py-3 shadow-[4px_4px_0px_0px_var(--color-text)] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.15)]">
                    <p className="text-sm font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] truncate">{user.displayName}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500 dark:text-[var(--color-text-secondary)] truncate">{user.email}</p>
                  </div>
                )}

                {adminNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === '/admin'
                      ? location.pathname === '/admin'
                      : location.pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-none border-2 px-3 py-2.5 text-xs font-medium tracking-normal transition-colors',
                        isActive
                          ? 'border-[var(--color-text)] bg-[var(--color-text)] text-white dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]'
                          : 'border-transparent text-stone-500 dark:text-[var(--color-text-secondary)] hover:border-[var(--color-text)]/30 hover:text-[var(--color-text)] dark:hover:border-[var(--color-text)]/30 dark:hover:text-[var(--color-text)]',
                      )}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}

              </nav>
            </aside>

            {/* Mobile sidebar toggle */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {adminNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === '/admin'
                      ? location.pathname === '/admin'
                      : location.pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'flex shrink-0 items-center gap-2 rounded-none border-2 px-4 py-2 text-[10px] font-medium tracking-normal transition-colors',
                        isActive
                          ? 'border-[var(--color-text)] bg-[var(--color-text)] text-white dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]'
                          : 'border-[var(--color-text)]/30 bg-[var(--color-paper)] dark:border-[var(--color-border)] dark:bg-[var(--color-card)] text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)]',
                      )}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <main>
              <Outlet />
            </main>
          </div>
        </Container>
      </div>
      <AdminFooter />
    </div>
  );
}
