import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteOnReview } from '@/services';
import type { CreateVoteInput } from '@/types';

export function useVoteOnReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVoteInput) => voteOnReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}
