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
    <Page title={`Admin - ${tabConfig.label}`} description="Manage the See Through platform.">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-olive/5 dark:bg-brand-cream/5">
            <Shield size={22} className="text-brand-olive dark:text-brand-cream" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-brand-olive dark:text-brand-cream">
              {tabConfig.label}
            </h1>
            <p className="text-sm text-text-secondary">Manage the See Through platform</p>
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
