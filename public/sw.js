/* See Through — service worker.
 *
 * Strategy:
 *  - App shell (/, /index.html, /offline.html, manifest, icons) is precached on
 *    install so the app opens instantly and works offline after the first visit.
 *  - Navigations are network-first with a cached-shell fallback, then the
 *    branded /offline.html page.
 *  - Vite's hashed /assets/ files are immutable, so they are cache-first.
 *  - Other same-origin statics + web fonts use stale-while-revalidate.
 *  - /api/ requests always go to the network: review data and auth must never
 *    be served stale from the cache.
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `see-through-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `see-through-assets-${CACHE_VERSION}`;
const FONT_CACHE = `see-through-fonts-${CACHE_VERSION}`;
const KEEP_CACHES = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE];

const OFFLINE_URL = '/offline.html';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/lightlogo.png',
  '/darklogo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Individually so one bad/missing URL cannot abort the whole install.
      await Promise.all(
        SHELL_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => (KEEP_CACHES.includes(name) ? undefined : caches.delete(name))),
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => undefined);
      }
      await self.clients.claim();
    })(),
  );
});

/** Cache-first: immutable hashed build output. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

/** Stale-while-revalidate: serve cache, refresh in the background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

/** Network-first for navigations, falling back to the cached app shell. */
async function handleNavigation(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;

    const network = await fetch(event.request);
    const cache = await caches.open(SHELL_CACHE);
    if (network && network.ok) {
      // Keep the shell entry fresh for future offline launches.
      cache.put('/index.html', network.clone());
    }
    return network;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const shell = (await cache.match('/index.html')) || (await cache.match('/'));
    return shell || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache API traffic — reviews, auth and votes must stay live.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/assets/')) {
      event.respondWith(cacheFirst(request, ASSET_CACHE));
      return;
    }
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // Cross-origin web fonts only.
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
  }
});

// Allow the page to trigger an immediate update check.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
