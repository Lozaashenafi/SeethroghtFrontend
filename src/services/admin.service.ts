import { apiClient } from '@/lib/axios';
import { getAdminHeaders } from './auth.service';
import type { ApiResponse, Company, Review, Pagination, Report } from '@/types';

interface AnonymousIdentity {
  publicId: string;
  status: string;
  riskScore: number;
  isBlocked: boolean;
  createdAt: string;
  lastSeenAt: string;
}

// ─── Reports (admin-only) ───

interface ListReportsResponse {
  reports: Report[];
  pagination: Pagination;
}

export async function adminGetReports(params: { status?: string; page?: number; limit?: number } = {}): Promise<ListReportsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListReportsResponse>>('/api/v1/reports', {
    headers: getAdminHeaders(),
    params,
  });
  return data.data ?? { reports: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function adminUpdateReportStatus(publicId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  await apiClient.patch(`/api/v1/reports/${publicId}/status`, { status }, {
    headers: getAdminHeaders(),
  });
}

// ─── Companies (admin-only: update, delete) ───

export async function adminUpdateCompany(slug: string, input: Partial<{
  name: string;
  website: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  verified: boolean;
}>): Promise<Company> {
  const { data } = await apiClient.put<ApiResponse<Company>>(`/api/v1/companies/${slug}`, input, {
    headers: getAdminHeaders(),
  });
  if (!data.data) throw new Error('Failed to update company');
  return data.data;
}

export async function adminDeleteCompany(slug: string): Promise<void> {
  await apiClient.delete(`/api/v1/companies/${slug}`, {
    headers: getAdminHeaders(),
  });
}

// ─── Reviews (admin-only) ───

interface ListAllReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

export async function adminListAllReviews(params: { page?: number; limit?: number } = {}): Promise<ListAllReviewsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListAllReviewsResponse>>('/api/v1/reviews/admin/all', {
    headers: getAdminHeaders(),
    params,
  });
  return data.data ?? { reviews: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function adminDeleteReview(publicId: string): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/${publicId}`, {
    headers: getAdminHeaders(),
  });
}

// ─── Anonymous Identities (admin-only) ───

interface ListIdentitiesResponse {
  identities: AnonymousIdentity[];
  pagination: Pagination;
}

export async function adminListIdentities(params: { page?: number; limit?: number; status?: string } = {}): Promise<ListIdentitiesResponse> {
  const { data } = await apiClient.get<ApiResponse<ListIdentitiesResponse>>('/api/v1/anonymous/admin/list', {
    headers: getAdminHeaders(),
    params,
  });
  return data.data ?? { identities: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function adminBlockIdentity(publicId: string): Promise<void> {
  await apiClient.patch(`/api/v1/anonymous/admin/${publicId}/block`, {}, {
    headers: getAdminHeaders(),
  });
}

export async function adminUnblockIdentity(publicId: string): Promise<void> {
  await apiClient.patch(`/api/v1/anonymous/admin/${publicId}/unblock`, {}, {
    headers: getAdminHeaders(),
  });
}
