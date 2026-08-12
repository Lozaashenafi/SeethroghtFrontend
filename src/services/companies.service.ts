import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
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
  const { data } = await apiClient.get<ApiResponse<ListCompaniesResponse>>(API_ENDPOINTS.COMPANIES, { params });
  return data.data ?? { companies: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getCompanyBySlug(slug: string): Promise<Company> {
  const { data } = await apiClient.get<ApiResponse<Company>>(`${API_ENDPOINTS.COMPANIES}/${slug}`);
  if (!data.data) throw new Error('Company not found');
  return data.data;
}

export async function createCompany(input: {
  name: string;
  slug: string;
  industryId: string;
  website?: string;
  logoUrl?: string | null;
  country?: string;
  city?: string;
  description?: string;
}): Promise<Company> {
  const { data } = await apiClient.post<ApiResponse<Company>>(API_ENDPOINTS.COMPANIES, input);
  if (!data.data) throw new Error('Failed to create company');
  return data.data;
}

export interface DuplicateCheckResult {
  websiteMatches: Company[];
  nameMatches: Array<{ company: Company; similarity: number }>;
}

export async function checkCompanyDuplicate(params: {
  website?: string;
  name?: string;
}): Promise<DuplicateCheckResult> {
  const { data } = await apiClient.get<ApiResponse<DuplicateCheckResult>>(API_ENDPOINTS.COMPANIES_CHECK, {
    params,
  });
  return data.data ?? { websiteMatches: [], nameMatches: [] };
}

export interface ScrapedCompanyData {
  name: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  industrySlug: string | null;
  logoUrl: string | null;
}

export async function scrapeCompanyWebsite(website: string): Promise<ScrapedCompanyData> {
  const { data } = await apiClient.post<ApiResponse<ScrapedCompanyData>>(API_ENDPOINTS.COMPANIES_SCRAPE, {
    website,
  });
  if (!data.data) throw new Error('Failed to scrape website');
  return data.data;
}
