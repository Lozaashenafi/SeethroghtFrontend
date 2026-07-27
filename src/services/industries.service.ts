import { apiClient } from '@/lib/axios';
import type { ApiResponse, Industry } from '@/types';

export async function getIndustries(): Promise<Industry[]> {
  const { data } = await apiClient.get<ApiResponse<Industry[]>>('/api/v1/industries');
  return data.data ?? [];
}
