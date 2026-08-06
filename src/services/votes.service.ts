import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, CreateVoteInput } from '@/types';

interface VoteResponse {
  reviewId: number;
  voteType: 'helpful' | 'unhelpful';
  createdAt: string;
}

export async function voteOnReview(input: CreateVoteInput): Promise<VoteResponse> {
  const { data } = await apiClient.post<ApiResponse<VoteResponse>>(API_ENDPOINTS.VOTES, input);
  if (!data.data) throw new Error('Failed to record vote');
  return data.data;
}
