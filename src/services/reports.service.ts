import { apiClient } from '@/lib/axios';
import type { ApiResponse, Report, CreateReportInput, Pagination } from '@/types';

interface ListReportsResponse {
  reports: Report[];
  pagination: Pagination;
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const { data } = await apiClient.post<ApiResponse<Report>>('/api/v1/reports', input);
  if (!data.data) throw new Error('Failed to submit report');
  return data.data;
}

export async function getReports(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ListReportsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListReportsResponse>>('/api/v1/reports', { params });
  return data.data ?? { reports: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function updateReportStatus(publicId: string, status: 'resolved' | 'dismissed'): Promise<Report> {
  const { data } = await apiClient.patch<ApiResponse<Report>>(`/api/v1/reports/${publicId}/status`, { status });
  if (!data.data) throw new Error('Failed to update report status');
  return data.data;
}
