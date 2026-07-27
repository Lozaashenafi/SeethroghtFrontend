import { apiClient } from '@/lib/axios';
import type { ApiResponse, Tag } from '@/types';

export async function getTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<ApiResponse<Tag[]>>('/api/v1/tags');
  return data.data ?? [];
}
