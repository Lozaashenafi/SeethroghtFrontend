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

export interface UploadedLogo {
  url: string;
  pathname: string;
  size: number;
}

/**
 * Upload a logo image to Vercel Blob via the backend. Returns the permanent
 * CDN URL to use as `logoUrl`. Works for any visitor — attach the returned
 * URL when creating/updating a company.
 */
export async function uploadCompanyLogo(file: File): Promise<UploadedLogo> {
  const form = new FormData();
  form.append('file', file);
  // Explicit multipart header — overrides the apiClient's global
  // 'application/json' default so multer can parse the file boundary.
  const { data } = await apiClient.post<ApiResponse<UploadedLogo>>(API_ENDPOINTS.UPLOADS_LOGO, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!data.data) throw new Error('Failed to upload logo');
  return data.data;
}

/**
 * Admin-only: upload a logo and attach it to an existing company in one call.
 * The backend swaps the stored URL and cleans up the previous blob.
 */
export async function uploadCompanyLogoFor(slug: string, file: File): Promise<Company> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.put<ApiResponse<Company>>(
    `${API_ENDPOINTS.COMPANIES}/${encodeURIComponent(slug)}/logo`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!data.data) throw new Error('Failed to update company logo');
  return data.data;
}
