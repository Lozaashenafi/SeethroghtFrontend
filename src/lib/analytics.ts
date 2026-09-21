/**
 * Google Analytics 4 helper.
 *
 * The gtag.js script itself is loaded in index.html. This module provides
 * typed helpers for SPA page-view tracking (React Router navigations don't
 * trigger full page loads, so GA needs an explicit `page_view` event per
 * route change) and custom events.
 *
 * The Measurement ID is public config (it ships in the page source either
 * way). VITE_GA_MEASUREMENT_ID, when set at build time, takes precedence.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  'G-ZMC1HLTSZZ';

export const GA_MEASUREMENT_ID = MEASUREMENT_ID;

/** No-op in dev so local sessions don't pollute production analytics. */
function isTrackingEnabled(): boolean {
  return typeof window !== 'undefined' && !import.meta.env.DEV;
}

/** Send a page_view for an SPA route change. */
export function trackPageView(path: string, title?: string): void {
  if (!isTrackingEnabled()) return;
  window.gtag?.('event', 'page_view', {
    page_title: title ?? document.title,
    page_path: path,
    page_location: window.location.href,
  });
}

/** Send a custom analytics event (e.g. 'sign_in_click', 'review_created'). */
export function trackEvent(action: string, params?: Record<string, unknown>): void {
  if (!isTrackingEnabled()) return;
  window.gtag?.('event', action, params);
}
