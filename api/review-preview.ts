/**
 * Share-preview endpoint: GET /r/:publicId → rewritten to this function.
 *
 * Social/chat crawlers (WhatsApp, Telegram, X, iMessage, Slack, Facebook…) do
 * not run JavaScript, so they can never see meta tags rendered by the SPA.
 * This function serves them static HTML with Open Graph + Twitter card tags
 * for the review, while real people are instantly redirected to the actual
 * review page in the SPA.
 *
 * Reviewer anonymity: only already-public fields (title, company, ratings,
 * pros excerpt) are ever exposed — the same data the review page itself shows.
 */

export const config = { runtime: 'edge' };

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'https://seethroght-backend.vercel.app';

interface ReviewData {
  publicId: string;
  title: string;
  companyName: string | null;
  companySlug: string | null;
  pros: string | null;
  cons: string | null;
  overallRating: number | null;
  jobTitle: string | null;
  employmentStatus: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function originOf(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const proto = req.headers.get('x-forwarded-proto') ?? 'https';
    return `${proto}://${forwardedHost}`;
  }
  return new URL(req.url).origin;
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

function renderHtml(review: ReviewData | null, origin: string, publicId: string): string {
  const reviewUrl = `${origin}/review/${publicId}`;
  const shareUrl = `${origin}/r/${publicId}`;
  const ogImage = `${origin}/api/review-og${review ? `?publicId=${encodeURIComponent(publicId)}` : ''}`;

  const title = review
    ? `${review.title} — ${review.companyName ?? 'Anonymous workplace review'} | See Through`
    : 'See Through — Anonymous Workplace Reviews';
  const description = review
    ? truncate(
        [
          review.overallRating ? `Rated ${review.overallRating}/5 by an anonymous employee` : 'Anonymous employee review',
          review.pros ? `— ${review.pros}` : null,
        ]
          .filter(Boolean)
          .join(' '),
        200,
      )
    : 'Honest, anonymous workplace reviews. Read what employees really say before you join.';

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeOgImage = escapeHtml(ogImage);
  const safeReviewUrl = escapeHtml(reviewUrl);
  const safeShareUrl = escapeHtml(shareUrl);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}" />
<meta property="og:site_name" content="See Through" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:url" content="${safeReviewUrl}" />
<meta property="og:image" content="${safeOgImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
<meta name="twitter:image" content="${safeOgImage}" />
<meta http-equiv="refresh" content="0;url=${safeReviewUrl}" />
</head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#FFFDF7;color:#1c1917;display:flex;align-items:center;justify-content:center;min-height:100vh">
<p style="padding:2rem;text-align:center">Opening this review… <a href="${safeReviewUrl}" style="color:inherit">Continue to See&nbsp;Through</a></p>
<script>location.replace(${JSON.stringify(safeReviewUrl)});</script>
<!-- canonical share link: ${safeShareUrl} -->
</body>
</html>`;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const publicId = url.searchParams.get('publicId') ?? '';
  const origin = originOf(req);

  // Unknown/missing id → plain site card, still redirect to reviews list.
  if (!publicId || !/^[A-Za-z0-9_-]{1,64}$/.test(publicId)) {
    return new Response(renderHtml(null, origin, ''), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=600',
      },
    });
  }

  const review = await fetchReview(publicId);
  return new Response(renderHtml(review, origin, publicId), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Shared links get hammered right after posting — cache aggressively.
      'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
