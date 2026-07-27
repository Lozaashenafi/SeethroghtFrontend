import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment } from '@/services';
import type { CreateCommentInput } from '@/types';

export function useComments(reviewPublicId: string | undefined, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['comments', reviewPublicId, params],
    queryFn: () => getComments(reviewPublicId!, params),
    enabled: !!reviewPublicId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}
