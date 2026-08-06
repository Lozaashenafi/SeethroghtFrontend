const API_PREFIX = '/api/v1';

/**
 * Single source of truth for the backend API paths.
 * Keep paramatized suffixes (e.g. `/${slug}`) inline in services.
 */
export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_PREFIX}/auth/login`,
  AUTH_LOGOUT: `${API_PREFIX}/auth/logout`,
  COMPANIES: `${API_PREFIX}/companies`,
  COMPANIES_SCRAPE: `${API_PREFIX}/companies/scrape`,
  REVIEWS: `${API_PREFIX}/reviews`,
  REVIEWS_ADMIN_ALL: `${API_PREFIX}/reviews/admin/all`,
  COMMENTS: `${API_PREFIX}/comments`,
  VOTES: `${API_PREFIX}/votes`,
  REPORTS: `${API_PREFIX}/reports`,
  INDUSTRIES: `${API_PREFIX}/industries`,
  TAGS: `${API_PREFIX}/tags`,
  ANONYMOUS_ADMIN: `${API_PREFIX}/anonymous/admin`,
  ANONYMOUS_ADMIN_LIST: `${API_PREFIX}/anonymous/admin/list`,
  ANONYMOUS_SELF: `${API_PREFIX}/anonymous/me`,
} as const;