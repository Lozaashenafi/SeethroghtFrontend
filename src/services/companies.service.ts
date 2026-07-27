import { apiClient } from '@/lib/axios';
import type { ApiResponse, Company, Pagination } from '@/types';

interface ListCompaniesParams {
  search?: string;
  industry?: string;
  country?: string;
  city?: string;
  page?: number;
  limit?: number;
}

interface ListCompaniesResponse {
  companies: Company[];
  pagination: Pagination;
}

export async function getCompanies(params: ListCompaniesParams = {}): Promise<ListCompaniesResponse> {
  const { data } = await apiClient.get<ApiResponse<ListCompaniesResponse>>('/api/v1/companies', { params });
  return data.data ?? { companies: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getCompanyBySlug(slug: string): Promise<Company> {
  const { data } = await apiClient.get<ApiResponse<Company>>(`/api/v1/companies/${slug}`);
  if (!data.data) throw new Error('Company not found');
  return data.data;
}

export async function createCompany(input: {
  name: string;
  slug: string;
  industryId: string;
  website?: string;
  country?: string;
  city?: string;
  description?: string;
}): Promise<Company> {
  const { data } = await apiClient.post<ApiResponse<Company>>('/api/v1/companies', input);
  if (!data.data) throw new Error('Failed to create company');
  return data.data;
}
