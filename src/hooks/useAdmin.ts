import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminListAllReviews,
  adminDeleteReview,
  adminListIdentities,
  adminBlockIdentity,
  adminUnblockIdentity,
  adminDeleteCompany,
  adminGetReports,
  adminUpdateReportStatus,
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

export function useAdminReviews(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin-reviews-list', params],
    queryFn: () => adminListAllReviews(params),
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

// ─── Anonymous Identities (admin) ───

export function useAdminIdentities(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['admin-identities', params],
    queryFn: () => adminListIdentities(params),
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
