import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

export interface AnonymousIdentity {
  publicId: string;
  nickname: string | null;
  nicknameRegeneratedAt: string | null;
  tempBlockedUntil: string | null;
  status: string;
  riskScore: number;
  isBlocked: boolean;
  createdAt: string;
  lastSeenAt: string;
}

/**
 * Fetches (and, on first visit, mints) the anonymous identity cookie pair.
 * Called once at app boot so the HttpOnly identity cookies exist before the
 * user interacts with anything.
 */
export async function getAnonymousIdentity(): Promise<AnonymousIdentity> {
  const { data } = await apiClient.get<ApiResponse<AnonymousIdentity>>(API_ENDPOINTS.ANONYMOUS_SELF);
  if (!data.data) throw new Error('Failed to load anonymous identity');
  return data.data;
}

export async function regenerateNickname(): Promise<AnonymousIdentity> {
  const { data } = await apiClient.patch<ApiResponse<AnonymousIdentity>>(`${API_ENDPOINTS.ANONYMOUS_SELF}/nickname`);
  if (!data.data) throw new Error('Failed to regenerate nickname');
  return data.data;
}
