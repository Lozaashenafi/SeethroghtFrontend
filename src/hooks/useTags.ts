import { useQuery } from '@tanstack/react-query';
import { getTags } from '@/services';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
    staleTime: 1000 * 60 * 30, // 30 minutes — tags rarely change
  });
}
