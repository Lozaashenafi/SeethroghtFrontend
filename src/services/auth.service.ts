import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

interface LoginResponse {
  token: string;
  admin: {
    id: number;
    email: string;
    name: string;
  };
}

interface AdminProfile {
  id: number;
  email: string;
  name: string;
}

const AUTH_TOKEN_KEY = 'see-through-admin-token';
const AUTH_ADMIN_KEY = 'see-through-admin-user';

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', { email, password });
  if (!data.data) throw new Error('Login failed');
  return data.data;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.get<ApiResponse<AdminProfile>>('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!data.data) throw new Error('Failed to get profile');
  return data.data;
}

export function getAdminToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
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

export function setAdminAuth(token: string, admin: AdminProfile): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(admin));
}

export function clearAdminAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ADMIN_KEY);
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

// Add token to admin API requests
export function getAdminHeaders(): Record<string, string> {
  const token = getAdminToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
