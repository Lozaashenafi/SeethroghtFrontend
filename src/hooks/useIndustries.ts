import { useQuery } from '@tanstack/react-query';
import { getIndustries } from '@/services';

export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: () => getIndustries(),
    staleTime: 1000 * 60 * 30, // 30 minutes — industries rarely change
  });
}
