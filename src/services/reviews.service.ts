import { apiClient } from '@/lib/axios';
import type { ApiResponse, Review, Pagination, CreateReviewInput } from '@/types';

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
  const { data } = await apiClient.get<ApiResponse<ListReviewsResponse>>('/api/v1/reviews', { params });
  return data.data ?? { reviews: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getReviewByPublicId(publicId: string): Promise<Review> {
  const { data } = await apiClient.get<ApiResponse<Review>>(`/api/v1/reviews/${publicId}`);
  if (!data.data) throw new Error('Review not found');
  return data.data;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { data } = await apiClient.post<ApiResponse<Review>>('/api/v1/reviews', input);
  if (!data.data) throw new Error('Failed to create review');
  return data.data;
}
