import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  Review,
  Pagination,
  CreateReviewInput,
  UpdateReviewInput,
} from '@/types';

interface ListReviewsParams {
  companySlug?: string;
  sortBy?: 'recent' | 'engagement';
  page?: number;
  limit?: number;
}

interface ListReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

export async function getReviews(params: ListReviewsParams = {}): Promise<ListReviewsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListReviewsResponse>>(API_ENDPOINTS.REVIEWS, { params });
  return data.data ?? { reviews: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getReviewByPublicId(publicId: string): Promise<Review> {
  const { data } = await apiClient.get<ApiResponse<Review>>(`${API_ENDPOINTS.REVIEWS}/${publicId}`);
  if (!data.data) throw new Error('Review not found');
  return data.data;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { data } = await apiClient.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS, input);
  if (!data.data) throw new Error('Failed to create review');
  return data.data;
}

export async function updateReview(
  publicId: string,
  input: UpdateReviewInput,
): Promise<Review> {
  const { data } = await apiClient.put<ApiResponse<Review>>(
    `${API_ENDPOINTS.REVIEWS}/${publicId}`,
    input,
  );
  if (!data.data) throw new Error('Failed to update review');
  return data.data;
}

/** The caller's own reviews (any moderation status) — powers the profile page. */
export async function getMyReviews(
  params: { page?: number; limit?: number } = {},
): Promise<ListReviewsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListReviewsResponse>>(
    API_ENDPOINTS.USER_MY_REVIEWS,
    { params },
  );
  return data.data ?? { reviews: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

/** Tag ids attached to a review (used to prefill the edit form). */
export async function getReviewTags(publicId: string): Promise<number[]> {
  const { data } = await apiClient.get<ApiResponse<{ tagIds: number[] }>>(
    `${API_ENDPOINTS.REVIEWS}/${publicId}/tags`,
  );
  return data.data?.tagIds ?? [];
}

/**
 * One of the caller's own reviews by publicId (any moderation status).
 * Author-scoped, so it works for deep links regardless of how many reviews
 * the identity has written or what moderation state the review is in.
 */
export async function getMyReview(publicId: string): Promise<Review> {
  const { data } = await apiClient.get<ApiResponse<Review>>(
    `${API_ENDPOINTS.USER_MY_REVIEWS}/${publicId}`,
  );
  if (!data.data) throw new Error('Review not found');
  return data.data;
}
