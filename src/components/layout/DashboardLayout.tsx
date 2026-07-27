import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Flag,
  Building2,
  MessageSquare,
  Users,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
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
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-8">
        <Container size="full" className="px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <nav className="sticky top-24 space-y-1" aria-label="Dashboard navigation">
                <div className="mb-4 flex items-center justify-between px-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Admin Panel
                  </p>
                </div>

                {admin && (
                  <div className="mb-4 rounded-lg bg-surface px-4 py-3">
                    <p className="text-sm font-medium text-text truncate">{admin.name}</p>
                    <p className="text-xs text-text-secondary truncate">{admin.email}</p>
                  </div>
                )}

                {adminNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === '/admin'
                      ? location.pathname === '/admin' || location.pathname === '/admin/dashboard'
                      : location.pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-olive text-brand-cream dark:bg-brand-cream dark:text-brand-olive'
                          : 'text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5',
                      )}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-error hover:bg-error/5 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </nav>
            </aside>

            {/* Mobile sidebar toggle */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {adminNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === '/admin'
                      ? location.pathname === '/admin' || location.pathname === '/admin/dashboard'
                      : location.pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-olive text-brand-cream dark:bg-brand-cream dark:text-brand-olive'
                          : 'bg-surface text-text-secondary hover:text-text',
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
      <Footer />
    </div>
  );
}
