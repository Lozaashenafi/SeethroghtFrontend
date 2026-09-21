import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';
import { MainLayout } from '@/components/layout';
import { DashboardLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProtectedUserRoute } from '@/features/auth/components/ProtectedUserRoute';
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
import { LoginPage as UserLoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { NotFoundPage } from '@/routes/NotFoundPage';

// Lazy-loaded admin pages — public visitors never pay the bundle cost.
const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AdminCompanyDetailPage = lazy(() => import('@/features/admin/pages/AdminCompanyDetailPage').then(m => ({ default: m.AdminCompanyDetailPage })));
const AdminReviewDetailPage = lazy(() => import('@/features/admin/pages/AdminReviewDetailPage').then(m => ({ default: m.AdminReviewDetailPage })));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin border-2 border-[var(--color-text)] border-t-transparent" />
    </div>
  );
}

export function AppRouter() {
  // SPA page-view tracking: React Router navigations don't reload the page,
  // so Google Analytics needs an explicit page_view per route change.
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

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
          <Route
            path={ROUTES.CREATE_REVIEW}
            element={<ProtectedUserRoute><CreateReviewPage /></ProtectedUserRoute>}
          />
          <Route path={ROUTES.REVIEW_DETAIL} element={<ReviewDetailPage />} />
          <Route
            path={ROUTES.EDIT_REVIEW}
            element={<ProtectedUserRoute><EditReviewPage /></ProtectedUserRoute>}
          />
          <Route path={ROUTES.PROFILE} element={<ProtectedUserRoute><ProfilePage /></ProtectedUserRoute>} />
          <Route path={ROUTES.CREATE_COMPANY} element={<CreateCompanyPage />} />
          <Route path={ROUTES.LOGIN} element={<UserLoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        </Route>
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
