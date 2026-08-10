import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminListAllReviews,
  adminDeleteReview,
  adminGetReview,
  adminModerateReview,
  adminListIdentities,
  adminBlockIdentity,
  adminUnblockIdentity,
  adminTempBlockIdentity,
  adminClearTempBlockIdentity,
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
    },
  });
}

// ─── Anonymous Identities (admin) ───

export function useAdminIdentities(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['admin-identities', params],
    queryFn: () => adminListIdentities(params),
  });
}

export function useAdminUserActivity(publicId: string | undefined, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin-user-activity', publicId, params],
    queryFn: () => adminGetUserActivity(publicId!, params),
    enabled: !!publicId,
  });
}

export function useAdminUserAllReviews(publicId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-all-reviews', publicId],
    queryFn: () => adminGetUserAllReviews(publicId!),
    enabled: !!publicId,
  });
}

export function useAdminBlockIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => adminBlockIdentity(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
    },
  });
}

export function useAdminUnblockIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => adminUnblockIdentity(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
    },
  });
}

export function useAdminTempBlockIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, hours }: { publicId: string; hours: number }) =>
      adminTempBlockIdentity(publicId, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
    },
  });
}

export function useAdminClearTempBlockIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => adminClearTempBlockIdentity(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
    },
  });
}
