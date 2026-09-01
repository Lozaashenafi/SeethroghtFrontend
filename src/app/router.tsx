import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { DashboardLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/constants';

import { HomePage } from '@/features/home/pages/HomePage';
import { AboutPage } from '@/features/about/pages/AboutPage';
import { SearchPage } from '@/features/search/pages/SearchPage';
import { CompanyPage } from '@/features/company/pages/CompanyPage';
import { CompanyDetailPage } from '@/features/company/pages/CompanyDetailPage';
import { ReviewPage } from '@/features/review/pages/ReviewPage';
import { ReviewDetailPage } from '@/features/review/pages/ReviewDetailPage';
import { CreateReviewPage } from '@/features/review/pages/CreateReviewPage';
import { EditReviewPage } from '@/features/review/pages/EditReviewPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { CreateCompanyPage } from '@/features/company/pages/CreateCompanyPage';
import { NotFoundPage } from '@/routes/NotFoundPage';

// Lazy-loaded admin pages — public visitors never pay the bundle cost.
const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AdminCompanyDetailPage = lazy(() => import('@/features/admin/pages/AdminCompanyDetailPage').then(m => ({ default: m.AdminCompanyDetailPage })));
const AdminReviewDetailPage = lazy(() => import('@/features/admin/pages/AdminReviewDetailPage').then(m => ({ default: m.AdminReviewDetailPage })));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })));
const LoginPage = lazy(() => import('@/features/admin/pages/LoginPage').then(m => ({ default: m.LoginPage })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin border-2 border-[var(--color-text)] border-t-transparent" />
    </div>
  );
}

export function AppRouter() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path={ROUTES.COMPANY} element={<CompanyPage />} />
          <Route path={ROUTES.COMPANY_DETAIL} element={<CompanyDetailPage />} />
          <Route path={ROUTES.REVIEW} element={<ReviewPage />} />
          <Route path={ROUTES.CREATE_REVIEW} element={<CreateReviewPage />} />
          <Route path={ROUTES.REVIEW_DETAIL} element={<ReviewDetailPage />} />
          <Route path={ROUTES.EDIT_REVIEW} element={<EditReviewPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.CREATE_COMPANY} element={<CreateCompanyPage />} />
        </Route>
        <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><LoginPage /></Suspense>} />
        <Route
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        >
          <Route path={ROUTES.admin.ROOT} element={<Suspense fallback={<AdminFallback />}><AdminPage /></Suspense>} />
          <Route path={ROUTES.admin.COMPANIES} element={<Suspense fallback={<AdminFallback />}><AdminPage /></Suspense>} />
          <Route path={ROUTES.admin.COMPANY_DETAIL} element={<Suspense fallback={<AdminFallback />}><AdminCompanyDetailPage /></Suspense>} />
          <Route path={ROUTES.admin.REVIEWS} element={<Suspense fallback={<AdminFallback />}><AdminPage /></Suspense>} />
          <Route path={ROUTES.admin.REVIEW_DETAIL} element={<Suspense fallback={<AdminFallback />}><AdminReviewDetailPage /></Suspense>} />
          <Route path={ROUTES.admin.USERS} element={<Suspense fallback={<AdminFallback />}><AdminPage /></Suspense>} />
          <Route path={ROUTES.admin.USER_DETAIL} element={<Suspense fallback={<AdminFallback />}><AdminUserDetailPage /></Suspense>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
