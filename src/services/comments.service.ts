import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Comment, Pagination, CreateCommentInput } from '@/types';

interface ListCommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export async function getComments(reviewPublicId: string, params: { page?: number; limit?: number } = {}): Promise<ListCommentsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListCommentsResponse>>(`${API_ENDPOINTS.COMMENTS}/review/${reviewPublicId}`, { params });
  return data.data ?? { comments: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const { data } = await apiClient.post<ApiResponse<Comment>>(API_ENDPOINTS.COMMENTS, input);
  if (!data.data) throw new Error('Failed to create comment');
  return data.data;
}
