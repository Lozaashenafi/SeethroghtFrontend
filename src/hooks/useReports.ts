import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport } from '@/services';
import type { CreateReportInput } from '@/types';

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReportInput) => createReport(input),
    onSuccess: () => {
      // Invalidate both public and admin report caches
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
}
