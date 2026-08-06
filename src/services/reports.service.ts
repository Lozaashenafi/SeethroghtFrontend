import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Report, CreateReportInput } from '@/types';

export async function createReport(input: CreateReportInput): Promise<Report> {
  const { data } = await apiClient.post<ApiResponse<Report>>(API_ENDPOINTS.REPORTS, input);
  if (!data.data) throw new Error('Failed to submit report');
  return data.data;
}
