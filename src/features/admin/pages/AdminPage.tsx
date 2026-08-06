import { useLocation } from 'react-router-dom';
import {
  Shield,
  Flag,
  Building2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Page } from '@/components/common';
import { ReportsTab } from '../components/ReportsTab';
import { CompaniesTab } from '../components/CompaniesTab';
import { ReviewsTab } from '../components/ReviewsTab';
import { UsersTab } from '../components/UsersTab';

// ─── Tab Config ───

type Tab = 'reports' | 'companies' | 'reviews' | 'users';

const tabs: { id: Tab; label: string; icon: typeof Flag }[] = [
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'users', label: 'Users', icon: Users },
];

// ─── Main AdminPage (Tab Router) ───

export function AdminPage() {
  const location = useLocation();

  // Determine active tab from URL path
  const getActiveTab = (): Tab => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/reviews')) return 'reviews';
    if (location.pathname.includes('/companies')) return 'companies';
    return 'reports';
  };

  const activeTab = getActiveTab();

  const tabConfig = tabs.find(t => t.id === activeTab)!;

  return (
    <Page>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-1">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] shadow-[4px_4px_0px_0px_var(--color-text)] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.15)]">
            <Shield size={24} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
              {tabConfig.label}
            </h1>
            <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-[var(--color-text-secondary)]">
              Manage the See Through platform
            </p>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'companies' && <CompaniesTab />}
      {activeTab === 'reviews' && <ReviewsTab />}
      {activeTab === 'users' && <UsersTab />}
    </Page>
  );
}
