/**
 * Dynamic Open Graph image: GET /api/review-og?publicId=xxx
 *
 * Rendered server-side with @vercel/og (satori) on the Edge runtime and
 * returned as a PNG. Social crawlers fetch this URL from the og:image tag
 * served by /r/:publicId, so shared review links unfurl as a screenshot of
 * the actual review card — same header (company initial + title + anonymous
 * line), diamond rating row, "The Good"/"The Bad" excerpts and meta badges
 * as the site's review detail page. Without a publicId it renders the
 * default site card (used by index.html's site-wide og:image).
 *
 * Only already-public review fields are used — no reviewer identity.
 * Satori notes: flexbox-only layout, every div needs display:'flex',
 * clip-path is used for the brand diamonds (same shape as BrandStarRating).
 */

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'https://seethroght-backend.vercel.app';

/* Light-theme brand tokens — mirrors src/styles/globals.css (crawlers always
   see the light theme, so the dark palette is not needed here). */
const INK = '#2b2f23'; // --color-text
const PAGE = '#f4f1ea'; // --color-paper-warm (page background)
const CARD = '#fcfaf7'; // --color-paper (review card background)
const SURFACE = '#ffffff'; // --color-surface
const BORDER = '#e7e5e4'; // stone-200 hairline
const SECONDARY = '#6b7280'; // --color-text-secondary
const BODY = '#57534e'; // stone-600 body copy
const MUTED = '#d6d3d1'; // stone-300 (empty diamond)
const EMERALD = '#047857'; // emerald-700 "The Good"
const ORANGE = '#c2410c'; // orange-700 "The Bad"

interface ReviewData {
  title: string;
  companyName: string | null;
  overallRating: number | null;
  jobTitle: string | null;
  pros: string | null;
  cons: string | null;
  employmentStatus: string | null;
  isCurrentEmployee: boolean | null;
  isVerified: boolean;
  createdAt: string;
}

function truncate(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Mirrors src/utils/formatDate.ts (en-US long date, e.g. "March 5, 2026"). */
function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return value.slice(0, 10);
  }
}

async function fetchReview(publicId: string): Promise<ReviewData | null> {
  try {
    const res = await fetch(`${BACKEND_ORIGIN}/api/v1/reviews/${encodeURIComponent(publicId)}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data?: ReviewData };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/* Same diamond silhouette as BrandStarRating's rotate-45 square, expressed as
   a clip-path (satori-safe). Empty diamonds get an inner cutout so they read
   as outlined, like `border-stone-300` on the site. */
const DIAMOND_CLIP = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

function Diamond({ size, filled }: { size: number; filled: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        clipPath: DIAMOND_CLIP,
        backgroundColor: filled ? INK : MUTED,
      }}
    >
      {!filled && (
        <div style={{ display: 'flex', width: '100%', height: '100%', padding: Math.max(2, size * 0.09) }}>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              clipPath: DIAMOND_CLIP,
              backgroundColor: CARD,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const hasRating = !!review.overallRating;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '36px 48px 24px',
        backgroundColor: PAGE,
        backgroundImage:
          'radial-gradient(circle, rgba(43,47,35,0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Review card — same structure as ReviewDetailPage */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          backgroundColor: CARD,
          border: `1px solid ${BORDER}`,
          boxShadow: '8px 8px 0px 0px rgba(43,47,35,0.08)',
          padding: 40,
          gap: 26,
        }}
      >
        {/* Header: initial box + title + anonymous line + Verified tag */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${INK}`,
              backgroundColor: SURFACE,
              fontSize: 34,
              fontWeight: 600,
              color: INK,
            }}
          >
            {review.companyName?.charAt(0) ?? 'R'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 36, fontWeight: 600, color: INK, lineHeight: 1.15 }}>
              {truncate(review.title, 70)}
            </span>
            <span style={{ fontSize: 19, color: SECONDARY, marginTop: 8 }}>
              Anonymous Employee{review.jobTitle ? ` // ${truncate(review.jobTitle, 50)}` : ''}
            </span>
          </div>
          {review.isVerified && (
            <div
              style={{
                display: 'flex',
                flexShrink: 0,
                border: `1.5px solid ${INK}`,
                padding: '5px 12px',
                fontSize: 14,
                fontWeight: 600,
                color: INK,
              }}
            >
              Verified
            </div>
          )}
        </div>

        {/* Overall rating: diamond row + N/5 (BrandStarRating equivalent) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {hasRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Diamond key={n} size={30} filled={n <= (review.overallRating ?? 0)} />
              ))}
            </div>
          )}
          <span style={{ fontSize: 26, fontWeight: 700, color: INK }}>
            {hasRating ? `${review.overallRating}/5` : 'N/A'}
          </span>
        </div>

        {/* Pros & cons grid: 1px divider via container background */}
        {(review.pros || review.cons) && (
          <div
            style={{
              display: 'flex',
              border: `1px solid ${BORDER}`,
              backgroundColor: BORDER,
              marginBottom: 24,
            }}
          >
            {review.pros && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: CARD,
                  padding: 26,
                  marginRight: review.cons ? 1 : 0,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: EMERALD,
                    textDecoration: 'underline',
                    marginBottom: 10,
                  }}
                >
                  The Good
                </span>
                <span style={{ fontSize: 21, color: BODY, lineHeight: 1.4 }}>
                  {truncate(review.pros, 150)}
                </span>
              </div>
            )}
            {review.cons && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: CARD,
                  padding: 26,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: ORANGE,
                    textDecoration: 'underline',
                    marginBottom: 10,
                  }}
                >
                  The Bad
                </span>
                <span style={{ fontSize: 21, color: BODY, lineHeight: 1.4 }}>
                  {truncate(review.cons, 150)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Meta: date + employment status badges, pinned to the card bottom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto' }}>
          <span style={{ fontSize: 18, color: SECONDARY }}>{formatDate(review.createdAt)}</span>
          {review.employmentStatus && (
            <div
              style={{
                display: 'flex',
                backgroundColor: INK,
                color: SURFACE,
                padding: '5px 12px',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {review.employmentStatus}
            </div>
          )}
          {review.isCurrentEmployee && (
            <div
              style={{
                display: 'flex',
                border: `1.5px solid ${INK}`,
                color: INK,
                padding: '3.5px 12px',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Current Employee
            </div>
          )}
        </div>
      </div>

      {/* Page ambience below the card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          padding: '0 2px',
        }}
      >
        <span style={{ fontSize: 17, color: SECONDARY }}>See Through — anonymous workplace reviews</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>seethrough.pro.et</span>
      </div>
    </div>
  );
}

function DefaultCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 22,
        padding: 72,
        backgroundColor: PAGE,
        backgroundImage: 'radial-gradient(circle, rgba(43,47,35,0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 58,
            height: 58,
            border: `3px solid ${INK}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            fontWeight: 700,
            color: INK,
          }}
        >
          S
        </div>
        <span style={{ fontSize: 40, fontWeight: 700, color: INK }}>See Through</span>
      </div>
      <span style={{ fontSize: 64, fontWeight: 700, color: INK, lineHeight: 1.1, maxWidth: 980 }}>
        What's it really like to work there?
      </span>
      <span style={{ fontSize: 28, color: SECONDARY }}>
        Honest, anonymous workplace reviews — the truth, no names attached.
      </span>
    </div>
  );
}

export default async function handler(req: Request): Promise<Response> {
  const publicId = new URL(req.url).searchParams.get('publicId');

  let review: ReviewData | null = null;
  if (publicId && /^[A-Za-z0-9_-]{1,64}$/.test(publicId)) {
    review = await fetchReview(publicId);
  }

  const image = new ImageResponse(
    review ? <ReviewCard review={review} /> : <DefaultCard />,
    { width: 1200, height: 630 },
  );

  return new Response(image.body, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
