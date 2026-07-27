import { useQuery } from '@tanstack/react-query';
import { getCompanies, getCompanyBySlug } from '@/services';
import type { Company } from '@/types';

interface UseCompaniesParams {
  search?: string;
  industry?: string;
  page?: number;
  limit?: number;
}

export function useCompanies(params: UseCompaniesParams = {}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => getCompanies(params),
  });
}

export function useCompany(slug: string | undefined) {
  return useQuery({
    queryKey: ['company', slug],
    queryFn: () => getCompanyBySlug(slug!),
    enabled: !!slug,
  });
}
