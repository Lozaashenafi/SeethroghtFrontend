import { apiClient } from '@/lib/axios';
import type { ApiResponse, CreateVoteInput } from '@/types';

interface VoteResponse {
  reviewId: number;
  voteType: 'helpful' | 'unhelpful';
  createdAt: string;
}

export async function voteOnReview(input: CreateVoteInput): Promise<VoteResponse> {
  const { data } = await apiClient.post<ApiResponse<VoteResponse>>('/api/v1/votes', input);
  if (!data.data) throw new Error('Failed to record vote');
  return data.data;
}
