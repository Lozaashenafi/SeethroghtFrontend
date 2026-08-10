import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { DashboardLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROUTES } from '@/constants';

import { HomePage } from '@/features/home/pages/HomePage';
import { AboutPage } from '@/features/about/pages/AboutPage';
import { SearchPage } from '@/features/search/pages/SearchPage';
import { CompanyPage } from '@/features/company/pages/CompanyPage';
import { CompanyDetailPage } from '@/features/company/pages/CompanyDetailPage';
import { ReviewPage } from '@/features/review/pages/ReviewPage';
import { ReviewDetailPage } from '@/features/review/pages/ReviewDetailPage';
import { CreateReviewPage } from '@/features/review/pages/CreateReviewPage';
import { AdminPage } from '@/features/admin/pages/AdminPage';
import { AdminCompanyDetailPage } from '@/features/admin/pages/AdminCompanyDetailPage';
import { AdminReviewDetailPage } from '@/features/admin/pages/AdminReviewDetailPage';
import { LoginPage } from '@/features/admin/pages/LoginPage';
import { CreateCompanyPage } from '@/features/company/pages/CreateCompanyPage';
import { NotFoundPage } from '@/routes/NotFoundPage';

export function AppRouter() {
  return (
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
        <Route path={ROUTES.CREATE_COMPANY} element={<CreateCompanyPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.admin.ROOT} element={<AdminPage />} />
        <Route path={ROUTES.admin.COMPANIES} element={<AdminPage />} />
        <Route path={ROUTES.admin.COMPANY_DETAIL} element={<AdminCompanyDetailPage />} />
        <Route path={ROUTES.admin.REVIEWS} element={<AdminPage />} />
        <Route path={ROUTES.admin.REVIEW_DETAIL} element={<AdminReviewDetailPage />} />
        <Route path={ROUTES.admin.USERS} element={<AdminPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
