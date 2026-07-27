export const APP_NAME = 'See Through';
export const APP_TAGLINE = 'Honest insights. Anonymous voices.';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  COMPANY: '/company',
  COMPANY_DETAIL: '/company/:slug',
  REVIEW: '/review',
  REVIEW_DETAIL: '/review/:publicId',
  CREATE_REVIEW: '/review/new',
  CREATE_COMPANY: '/company/new',
  admin: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    COMPANIES: '/admin/companies',
    REVIEWS: '/admin/reviews',
    USERS: '/admin/users',
  },
  NOT_FOUND: '/404',
} as const;

export const THEME_STORAGE_KEY = 'see-through-theme';
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes
export const QUERY_CACHE_TIME = 1000 * 60 * 30; // 30 minutes
