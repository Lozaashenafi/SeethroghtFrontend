import { apiClient } from '@/lib/axios';
import type { ApiResponse, Report, CreateReportInput } from '@/types';

export async function createReport(input: CreateReportInput): Promise<Report> {
  const { data } = await apiClient.post<ApiResponse<Report>>('/api/v1/reports', input);
  if (!data.data) throw new Error('Failed to submit report');
  return data.data;
}
