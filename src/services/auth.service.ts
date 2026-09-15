import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
}

interface LoginResponse {
  user: AuthUser;
}

const AUTH_USER_KEY = 'see-through-auth-user';

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.USER_LOGIN, { email, password });
  if (!data.data) throw new Error('Login failed');
  return data.data;
}

export async function adminLogout(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
}

export function getAdminUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setAdminUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}
