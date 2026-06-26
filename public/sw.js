// ============================================================
// Saurus API — Service Worker v5
// Strategy:
//   HTML pages  → Network-First (always fresh, fallback cache)
//   Assets      → Stale-While-Revalidate (fast + background update)
//   API calls   → Never cached
// Auto-update: SW activates immediately via skipWaiting + clients.claim
// ============================================================

// ⚡ Bump this version on EVERY deploy to bust old caches
const CACHE_VERSION = 'Saurus-v5-' + '20260607';

const HTML_ROUTES = [
  '/', '/docs', '/profile', '/snippet', '/apk',
  '/tourl', '/anime', '/donghua', '/manga', '/manhwa',
  '/film', '/music', '/panel', '/ai', '/cs',
  '/favicon.svg', '/manifest.json',
];

// ── INSTALL ────────────────────────────────────────────────
self.addEventListener('install', e => {
  // skipWaiting immediately — don't wait for old SW to die
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      // Cache all routes in background — don't block install on failures
      Promise.allSettled(HTML_ROUTES.map(url => cache.add(url)))
    )
  );
});

// ── ACTIVATE ───────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim()) // Take over ALL open tabs immediately
  );
});

// ── FETCH ──────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Never intercept: API calls, external domains, chrome extensions
  if (
    url.pathname.startsWith('/api/') ||
    url.origin !== self.location.origin ||
    url.href.includes('firebasedatabase') ||
    url.href.includes('googleapis') ||
    url.href.includes('gstatic') ||
    url.href.includes('cdn.') ||
    url.href.includes('unpkg.') ||
    url.href.includes('fonts.')
  ) return;

  // HTML pages → Network-First: always try network, fall back to cache
  const isHTML = (
    url.pathname === '/' ||
    HTML_ROUTES.includes(url.pathname) ||
    url.pathname.endsWith('.html') === false && !url.pathname.includes('.')
  );

  if (isHTML) {
    e.respondWith(networkFirst(e.request));
  } else {
    // Static assets (JS, CSS, images, fonts) → Stale-While-Revalidate
    e.respondWith(staleWhileRevalidate(e.request));
  }
});

// Network-First: try network → on fail use cache
async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const networkRes = await fetch(request);
    if (networkRes && networkRes.status === 200) {
      cache.put(request, networkRes.clone()); // update cache in background
    }
    return networkRes;
  } catch {
    const cached = await cache.match(request);
    return cached || cache.match('/');
  }
}

// Stale-While-Revalidate: serve cache instantly, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(res => {
      if (res && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || fetchPromise;
}

// ── MESSAGE ────────────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
