import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Industry } from '@/types';

export async function getIndustries(): Promise<Industry[]> {
  const { data } = await apiClient.get<ApiResponse<Industry[]>>(API_ENDPOINTS.INDUSTRIES);
  return data.data ?? [];
}
