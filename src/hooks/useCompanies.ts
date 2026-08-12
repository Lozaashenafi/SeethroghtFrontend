import { useQuery } from '@tanstack/react-query';
import { getCompanies, getCompanyBySlug, checkCompanyDuplicate } from '@/services';

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

/**
 * Debounced duplicate check for the Add Company form. Pass the debounced
 * name/website values; the query only runs once either is meaningful.
 */
export function useCompanyDuplicateCheck(website: string, name: string) {
  const trimmedName = name.trim();
  const trimmedWebsite = website.trim();
  const enabled = trimmedName.length >= 2 || trimmedWebsite.length >= 3;

  return useQuery({
    queryKey: ['company-duplicate-check', trimmedName, trimmedWebsite],
    queryFn: () =>
      checkCompanyDuplicate({
        name: trimmedName || undefined,
        website: trimmedWebsite || undefined,
      }),
    enabled,
    // Non-blocking check — failures shouldn't block adding a company
    retry: false,
  });
}
