import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Tag } from '@/types';

export async function getTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<ApiResponse<Tag[]>>(API_ENDPOINTS.TAGS);
  return data.data ?? [];
}
