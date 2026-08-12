import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Company, Review, Pagination, Report } from '@/types';

interface AnonymousIdentity {
  publicId: string;
  nickname: string | null;
  nicknameRegeneratedAt: string | null;
  tempBlockedUntil: string | null;
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

// ─── Anonymous Identities (admin-only) ───

interface ListIdentitiesResponse {
  identities: AnonymousIdentity[];
  pagination: Pagination;
}

export async function adminListIdentities(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<ListIdentitiesResponse> {
  const { data } = await apiClient.get<ApiResponse<ListIdentitiesResponse>>(API_ENDPOINTS.ANONYMOUS_ADMIN_LIST, {
    params,
  });
  return data.data ?? { identities: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

interface ActivityPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CommentActivityItem {
  publicId: string;
  reviewPublicId: string | null;
  reviewTitle: string | null;
  companyName: string | null;
  content: string;
  helpfulCount: number;
  createdAt: string;
}

interface VoteActivityItem {
  reviewPublicId: string | null;
  reviewTitle: string | null;
  companyName: string | null;
  voteType: string;
  createdAt: string;
}

interface ReportActivityItem {
  publicId: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  reviewPublicId: string | null;
  reviewTitle: string | null;
  commentPublicId: string | null;
  commentContent: string | null;
}

interface UserActivityResponse {
  identity: AnonymousIdentity;
  reviews: { data: Review[]; pagination: ActivityPagination };
  comments: { data: CommentActivityItem[]; pagination: ActivityPagination };
  votes: { data: VoteActivityItem[]; pagination: ActivityPagination };
  reports: { data: ReportActivityItem[]; pagination: ActivityPagination };
}

export async function adminGetUserActivity(publicId: string, params: { page?: number; limit?: number } = {}): Promise<UserActivityResponse> {
  const { data } = await apiClient.get<ApiResponse<UserActivityResponse>>(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}/activity`, {
    params,
  });
  if (!data.data) throw new Error('User not found');
  return data.data;
}

export async function adminGetUserAllReviews(publicId: string): Promise<Review[]> {
  const { data } = await apiClient.get<ApiResponse<{ reviews: Review[] }>>(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}/reviews`);
  return data.data?.reviews ?? [];
}

export async function adminBlockIdentity(publicId: string): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}/block`, {});
}

/** Permanently delete an identity and ALL of its content (reviews, comments, votes, reports). */
export async function adminDeleteIdentity(publicId: string): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}`);
}

export async function adminUnblockIdentity(publicId: string): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}/unblock`, {});
}

export async function adminTempBlockIdentity(publicId: string, hours: number): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}/temp-block`, { hours });
}

export async function adminClearTempBlockIdentity(publicId: string): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.ANONYMOUS_ADMIN}/${publicId}/clear-temp-block`, {});
}
