import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReviews,
  getReviewByPublicId,
  createReview,
  updateReview,
  getMyReviews,
  getMyReview,
  getReviewTags,
} from '@/services';
import type { CreateReviewInput, UpdateReviewInput } from '@/types';

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
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

/** The current identity's own reviews — shown on the profile page. */
export function useMyReviews(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['my-reviews', params],
    queryFn: () => getMyReviews(params),
  });
}

/** A single own review by publicId (any status) — powers the edit page. */
export function useMyReview(publicId: string | undefined) {
  return useQuery({
    queryKey: ['my-review', publicId],
    queryFn: () => getMyReview(publicId!),
    enabled: !!publicId,
  });
}

export function useUpdateReview(publicId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateReviewInput) =>
      updateReview(publicId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', publicId] });
    },
  });
}

/** Tag ids of a review, used to prefill the edit form. */
export function useReviewTags(publicId: string | undefined) {
  return useQuery({
    queryKey: ['review-tags', publicId],
    queryFn: () => getReviewTags(publicId!),
    enabled: !!publicId,
  });
}
