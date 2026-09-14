import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  Company,
  Review,
  Pagination,
  Report,
  AdminUser,
  AdminUserDetail,
  AdminUserActivity,
} from '@/types';

// ─── Reports (admin-only) ───

interface ListReportsResponse {
  reports: Report[];
  pagination: Pagination;
}

export async function adminGetReports(params: { status?: string; page?: number; limit?: number } = {}): Promise<ListReportsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListReportsResponse>>(API_ENDPOINTS.REPORTS, {
    params,
  });
  return data.data ?? { reports: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function adminUpdateReportStatus(publicId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.REPORTS}/${publicId}/status`, { status });
}

// ─── Companies (admin-only: update, delete) ───

export async function adminUpdateCompany(slug: string, input: Partial<{
  name: string;
  website: string | null;
  logoUrl: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  verified: boolean;
}>): Promise<Company> {
  const { data } = await apiClient.put<ApiResponse<Company>>(`${API_ENDPOINTS.COMPANIES}/${slug}`, input);
  if (!data.data) throw new Error('Failed to update company');
  return data.data;
}

export async function adminDeleteCompany(slug: string): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.COMPANIES}/${slug}`);
}

// ─── Reviews (admin-only) ───

interface ListAllReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

export async function adminListAllReviews(params: { page?: number; limit?: number; status?: string } = {}): Promise<ListAllReviewsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListAllReviewsResponse>>(API_ENDPOINTS.REVIEWS_ADMIN_ALL, {
    params,
  });
  return data.data ?? { reviews: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function adminDeleteReview(publicId: string): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${publicId}`);
}

export async function adminGetReview(publicId: string): Promise<Review> {
  const { data } = await apiClient.get<ApiResponse<Review>>(`${API_ENDPOINTS.REVIEWS}/admin/${publicId}`);
  if (!data.data) throw new Error('Review not found');
  return data.data;
}

export async function adminModerateReview(publicId: string, status: 'published' | 'rejected'): Promise<Review> {
  const { data } = await apiClient.patch<ApiResponse<Review>>(`${API_ENDPOINTS.REVIEWS}/admin/${publicId}/status`, { status });
  if (!data.data) throw new Error('Failed to update review status');
  return data.data;
}

// ─── Users (admin-only) ───

const emptyPagination: Pagination = { total: 0, page: 1, limit: 20, totalPages: 0 };

export async function adminListUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin' | 'all';
  status?: 'active' | 'blocked' | 'restricted' | 'all';
} = {}): Promise<{ users: AdminUser[]; pagination: Pagination }> {
  const { data } = await apiClient.get<ApiResponse<{ users: AdminUser[]; pagination: Pagination }>>(
    API_ENDPOINTS.ADMIN_USERS,
    { params },
  );
  return data.data ?? { users: [], pagination: emptyPagination };
}

export async function adminGetUser(userId: string): Promise<AdminUserDetail> {
  const { data } = await apiClient.get<ApiResponse<AdminUserDetail>>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`);
  if (!data.data) throw new Error('User not found');
  return data.data;
}

export async function adminGetUserActivity(
  userId: string,
  params: { page?: number; limit?: number } = {},
): Promise<AdminUserActivity> {
  const { data } = await apiClient.get<ApiResponse<AdminUserActivity>>(
    `${API_ENDPOINTS.ADMIN_USERS}/${userId}/activity`,
    { params },
  );
  if (!data.data) throw new Error('User not found');
  return data.data;
}

export async function adminGetUserAllReviews(userId: string): Promise<Review[]> {
  const { data } = await apiClient.get<ApiResponse<{ reviews: Review[] }>>(
    `${API_ENDPOINTS.ADMIN_USERS}/${userId}/reviews`,
  );
  return data.data?.reviews ?? [];
}

export async function adminBlockUser(userId: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
    `${API_ENDPOINTS.ADMIN_USERS}/${userId}/block`,
  );
  if (!data.data) throw new Error('Failed to block user');
  return data.data;
}

export async function adminUnblockUser(userId: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
    `${API_ENDPOINTS.ADMIN_USERS}/${userId}/unblock`,
  );
  if (!data.data) throw new Error('Failed to unblock user');
  return data.data;
}

export async function adminTempBlockUser(userId: string, hours: number): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
    `${API_ENDPOINTS.ADMIN_USERS}/${userId}/temp-block`,
    { hours },
  );
  if (!data.data) throw new Error('Failed to restrict user');
  return data.data;
}

export async function adminClearTempBlockUser(userId: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
    `${API_ENDPOINTS.ADMIN_USERS}/${userId}/clear-temp-block`,
  );
  if (!data.data) throw new Error('Failed to lift restriction');
  return data.data;
}

/** Permanently delete a user and ALL of their content (reviews, comments, votes, reports). */
export async function adminDeleteUser(userId: string): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`);
}
