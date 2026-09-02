import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  showDisplayName: boolean;
  createdAt: string;
}

interface AuthResponse {
  user: UserProfile;
}

const USER_KEY = 'see-through-user';

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<UserProfile> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.USER_REGISTER,
    { email, password, displayName },
  );
  if (!data.data?.user) throw new Error('Registration failed');
  setUser(data.data.user);
  return data.data.user;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<UserProfile> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.USER_LOGIN,
    { email, password },
  );
  if (!data.data?.user) throw new Error('Login failed');
  setUser(data.data.user);
  return data.data.user;
}

export async function googleSignIn(idToken: string): Promise<UserProfile> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.USER_GOOGLE,
    { idToken },
  );
  if (!data.data?.user) throw new Error('Google sign-in failed');
  setUser(data.data.user);
  return data.data.user;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(
    API_ENDPOINTS.USER_ME,
  );
  if (!data.data) throw new Error('Not authenticated');
  setUser(data.data);
  return data.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.USER_LOGOUT).catch(() => {});
  clearUser();
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.USER_VERIFY_EMAIL, { token });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.USER_FORGOT_PASSWORD, { email });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await apiClient.post(API_ENDPOINTS.USER_RESET_PASSWORD, {
    token,
    password,
  });
}

export async function resendVerification(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.USER_RESEND_VERIFICATION);
}

export async function updateShowDisplayName(
  showDisplayName: boolean,
): Promise<UserProfile> {
  const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
    API_ENDPOINTS.USER_SHOW_DISPLAY_NAME,
    { showDisplayName },
  );
  if (!data.data) throw new Error('Failed to update preference');
  setUser(data.data);
  return data.data;
}

export function getStoredUser(): UserProfile | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}
