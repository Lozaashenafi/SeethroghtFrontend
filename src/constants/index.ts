export const APP_NAME = 'See Through';
export const APP_TAGLINE = 'Honest insights. Anonymous voices.';

export * from './api';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SEARCH: '/search',
  COMPANY: '/company',
  COMPANY_DETAIL: '/company/:slug',
  REVIEW: '/review',
  REVIEW_DETAIL: '/review/:publicId',
  EDIT_REVIEW: '/review/:publicId/edit',
  CREATE_REVIEW: '/review/new',
  PROFILE: '/profile',
  CREATE_COMPANY: '/company/new',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  admin: {
    ROOT: '/admin',
    COMPANIES: '/admin/companies',
    COMPANY_DETAIL: '/admin/companies/:slug',
    REVIEWS: '/admin/reviews',
    REVIEW_DETAIL: '/admin/reviews/:publicId',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:publicId',
  },
  NOT_FOUND: '/404',
} as const;

export const THEME_STORAGE_KEY = 'see-through-theme';
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes
export const QUERY_CACHE_TIME = 1000 * 60 * 30; // 30 minutes
