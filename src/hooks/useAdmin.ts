import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminListAllReviews,
  adminDeleteReview,
  adminGetReview,
  adminModerateReview,
  adminListUsers,
  adminGetUser,
  adminBlockUser,
  adminUnblockUser,
  adminTempBlockUser,
  adminClearTempBlockUser,
  adminDeleteUser,
  adminDeleteCompany,
  adminGetReports,
  adminUpdateReportStatus,
  adminGetUserActivity,
  adminGetUserAllReviews,
} from '@/services/admin.service';

// ─── Reports (admin) ───

export function useAdminReports(params: { status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin-reports', params],
    queryFn: () => adminGetReports(params),
  });
}

export function useAdminUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: 'resolved' | 'dismissed' }) =>
      adminUpdateReportStatus(publicId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
}

// ─── Companies (admin: update, delete) ───

export function useAdminDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => adminDeleteCompany(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

// ─── Reviews (admin) ───

export function useAdminReviews(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['admin-reviews-list', params],
    queryFn: () => adminListAllReviews(params),
  });
}

export function useAdminReview(publicId: string | undefined) {
  return useQuery({
    queryKey: ['admin-review', publicId],
    queryFn: () => adminGetReview(publicId!),
    enabled: !!publicId,
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => adminDeleteReview(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useAdminModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: 'published' | 'rejected' }) =>
      adminModerateReview(publicId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

// ─── Users (admin) ───

export function useAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin' | 'all';
  status?: 'active' | 'blocked' | 'restricted' | 'all';
} = {}) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminListUsers(params),
  });
}

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminGetUser(userId!),
    enabled: !!userId,
  });
}

export function useAdminUserActivity(userId: string | undefined, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin-user-activity', userId, params],
    queryFn: () => adminGetUserActivity(userId!, params),
    enabled: !!userId,
  });
}

export function useAdminUserAllReviews(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-all-reviews', userId],
    queryFn: () => adminGetUserAllReviews(userId!),
    enabled: !!userId,
  });
}

/** Every user mutation refreshes the list and the detail view it may affect. */
function useUserMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-all-reviews'] });
    },
  });
}

export function useAdminBlockUser() {
  return useUserMutation((userId: string) => adminBlockUser(userId));
}

export function useAdminUnblockUser() {
  return useUserMutation((userId: string) => adminUnblockUser(userId));
}

export function useAdminTempBlockUser() {
  return useUserMutation(({ userId, hours }: { userId: string; hours: number }) =>
    adminTempBlockUser(userId, hours),
  );
}

export function useAdminClearTempBlockUser() {
  return useUserMutation((userId: string) => adminClearTempBlockUser(userId));
}

export function useAdminDeleteUser() {
  return useUserMutation((userId: string) => adminDeleteUser(userId));
}
