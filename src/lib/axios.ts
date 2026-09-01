import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';

// Mirrors the key used in services/auth.service.ts to avoid a circular import.
const AUTH_ADMIN_KEY = 'see-through-admin-user';

const isAdminRoute = (pathname: string): boolean =>
  pathname === '/admin' || pathname.startsWith('/admin/');

// Read the CSRF token from the cookie set by the backend.
function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Methods that require CSRF protection.
const STATE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    // Attach CSRF token for state-changing requests.
    if (STATE_METHODS.has(reqConfig.method?.toLowerCase() ?? '')) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        reqConfig.headers.set('X-CSRF-Token', csrfToken);
      }
    }
    return reqConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('[AUTH] 401 on', error.config?.url, '→', error.response?.data);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_ADMIN_KEY);

        const { pathname } = window.location;
        if (isAdminRoute(pathname) && !pathname.startsWith('/admin/login')) {
          const redirect = encodeURIComponent(pathname);
          window.location.replace(`/admin/login?redirect=${redirect}`);
        }
      }
    }
    return Promise.reject(error);
  },
);

export { apiClient };
