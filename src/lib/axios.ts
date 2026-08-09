import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';

// Mirrors the key used in services/auth.service.ts to avoid a circular import.
const AUTH_ADMIN_KEY = 'see-through-admin-user';

const isAdminRoute = (pathname: string): boolean =>
  pathname === '/admin' || pathname.startsWith('/admin/');

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
      console.error('Unauthorized access detected. Logging out admin user and redirecting to login page.', error);
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
