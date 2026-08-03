import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Flag,
  Building2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { AdminHeader, AdminFooter } from '@/components/navigation';
import { Container } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';

const adminNavLinks = [
  { label: 'Reports', href: '/admin', icon: Flag },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Users', href: '/admin/users', icon: Users },
];

export function DashboardLayout() {
  const location = useLocation();
  const { admin } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex-1 py-8">
        <Container size="full" className="px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28 space-y-1" aria-label="Dashboard navigation">
                <div className="mb-4 flex items-center justify-between px-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 dark:text-[var(--color-text-secondary)]">
                    Admin Console
                  </p>
                </div>

                {admin && (
                  <div className="mb-4 border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-[#FCFAF7] dark:bg-[var(--color-card)] px-4 py-3 shadow-[4px_4px_0px_0px_#2b2f23] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.15)]">
                    <p className="text-sm font-black uppercase tracking-wide text-[#2b2f23] dark:text-[var(--color-text)] truncate">{admin.name}</p>
                    <p className="mt-0.5 text-[11px] font-mono text-stone-500 dark:text-[var(--color-text-secondary)] truncate">{admin.email}</p>
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
                        'flex items-center gap-3 rounded-none border-2 px-3 py-2.5 text-xs font-black uppercase tracking-widest transition-colors',
                        isActive
                          ? 'border-[#2b2f23] bg-[#2b2f23] text-white dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]'
                          : 'border-transparent text-stone-500 dark:text-[var(--color-text-secondary)] hover:border-[#2b2f23]/30 hover:text-[#2b2f23] dark:hover:border-[var(--color-text)]/30 dark:hover:text-[var(--color-text)]',
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
            <div className="md:hidden mb-4">
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
                        'flex shrink-0 items-center gap-2 rounded-none border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors',
                        isActive
                          ? 'border-[#2b2f23] bg-[#2b2f23] text-white dark:border-[var(--color-text)] dark:bg-[var(--color-text)] dark:text-[var(--color-bg)]'
                          : 'border-[#2b2f23]/30 bg-[#FCFAF7] dark:border-[var(--color-border)] dark:bg-[var(--color-card)] text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[#2b2f23] dark:hover:text-[var(--color-text)]',
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
