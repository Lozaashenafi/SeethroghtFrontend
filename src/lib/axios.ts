import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';

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
    // Token-based auth will be added here in the future
    return reqConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          break;
        case 403:
          // Handle forbidden
          break;
        case 500:
          // Handle server error
          break;
      }
    }
    return Promise.reject(error);
  },
);

export { apiClient };
