import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, getReviewByPublicId, createReview } from '@/services';
import type { CreateReviewInput } from '@/types';

interface UseReviewsParams {
  companySlug?: string;
  sortBy?: 'recent' | 'engagement';
  page?: number;
  limit?: number;
}

export function useReviews(params: UseReviewsParams = {}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => getReviews(params),
  });
}

export function useReview(publicId: string | undefined) {
  return useQuery({
    queryKey: ['review', publicId],
    queryFn: () => getReviewByPublicId(publicId!),
    enabled: !!publicId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
