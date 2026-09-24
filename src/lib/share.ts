/**
 * Sharing helpers.
 *
 * Two layers of "good-looking shares":
 * 1. Text + link that reads well when pasted into a chat (built here).
 * 2. Rich link previews — when the pasted link is unfurled by WhatsApp /
 *    Telegram / X / iMessage, a serverless function (`/api/review-preview`)
 *    serves Open Graph tags to crawlers, and `/api/review-og` renders the
 *    preview card image. Share targets that only take a URL (Facebook,
 *    LinkedIn) rely entirely on those tags.
 */

import type { Review } from '@/types';

export const SITE_NAME = 'See Through';
export const SITE_TAGLINE = 'Anonymous workplace reviews';
const FALLBACK_ORIGIN = 'https://seethrough.pro.et';

/** Canonical origin — the real deployment domain, or the current one in preview/dev. */
export function getSiteOrigin(): string {
  if (typeof window === 'undefined') return FALLBACK_ORIGIN;
  return window.location.origin || FALLBACK_ORIGIN;
}

export function reviewUrl(publicId: string): string {
  return `${getSiteOrigin()}/review/${publicId}`;
}

/** Tempting one-liner used as the share text. */
export function buildReviewShareText(review: Pick<Review, 'title' | 'companyName' | 'overallRating'>): string {
  const company = review.companyName ?? 'a company';
  const rating = review.overallRating ? ` ⭐ ${review.overallRating}/5` : '';
  return `"${review.title}" — anonymous review of ${company}${rating}`;
}

// ─── Platform URLs ───

export function whatsappShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function xShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/** Facebook and LinkedIn only take a URL — the preview comes from the OG tags. */
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function linkedinShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function emailShareUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ─── Actions ───

/** Web Share API (native sheet on phones). Returns false when unavailable/failed. */
export async function nativeShare(data: { title: string; text: string; url: string }): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share(data);
    return true;
  } catch {
    return false; // user dismissed the sheet, or the API is broken
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without the async clipboard API / non-secure contexts
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function openShareWindow(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520');
}
