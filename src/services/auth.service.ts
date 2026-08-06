import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

interface AdminProfile {
  id: number;
  email: string;
  name: string;
}

interface LoginResponse {
  admin: AdminProfile;
}

const AUTH_ADMIN_KEY = 'see-through-admin-user';

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.AUTH_LOGIN, { email, password });
  if (!data.data) throw new Error('Login failed');
  return data.data;
}

export async function adminLogout(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
}

export function getAdminUser(): AdminProfile | null {
  const stored = localStorage.getItem(AUTH_ADMIN_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setAdminUser(admin: AdminProfile): void {
  localStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(admin));
}

export function clearAdminAuth(): void {
  localStorage.removeItem(AUTH_ADMIN_KEY);
}
