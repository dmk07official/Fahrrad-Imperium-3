const CACHE_NAME = 'my-cf-game-v-final';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/index/main-theme.mp3',
  '/index/tap.mp3',
  '/index/discord-logo.png',
  '/index/logo.png',
  '/index/tiktok.png',
  '/game/background-game.mp3',
  '/game/coin.png',
  '/game/coin_disabled.png',
  '/game/game-server.js',
  '/game/game.css',
  '/game/game.html',
  '/game/game.js',
  '/game/gold-arrow.png',
  '/game/green-arrow.png',
  '/game/prestige.png',
  '/game/tap.png',
  '/game/work.png',
  '/global-css-variables.css',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/sw.js',
];

// INSTALL
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Caching files...');
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url, { redirect: 'follow' });
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log('[SW] ✅ Cached:', url);
          } else {
            console.warn('[SW] ⚠️ Skipped:', url, response.status);
          }
        } catch (err) {
          console.error('[SW] ❌ Failed to cache:', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// FETCH
self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  // Nur eigene Seiten cachen
  if (requestURL.origin !== location.origin) return;

  // Strip trailing slashes und Query-Params
  const cleanPath = requestURL.pathname.replace(/\/+$/, '');

  const cleanRequest = new Request(cleanPath, {
    method: event.request.method,
    headers: event.request.headers,
    mode: event.request.mode,
    credentials: event.request.credentials,
    redirect: 'follow',
    referrer: event.request.referrer,
    integrity: event.request.integrity,
    cache: 'default',
  });

  event.respondWith(
    caches.match(cleanPath).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Serving from cache:', cleanPath);
        return cachedResponse;
      }

      console.log('[SW] 🔄 Not cached, fetching:', cleanPath);

      return fetch(cleanRequest)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            console.warn('[SW] ⚠️ Bad response:', cleanPath);
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(cleanPath, responseClone).catch(err => {
              console.error('[SW] ❌ Caching failed:', cleanPath, err);
            });
          });

          return networkResponse;
        })
        .catch(error => {
          console.error('[SW] ❌ Offline and not cached:', cleanPath, error);
          return new Response(`<h1>⚠️ Offline</h1><p>Die Seite <code>${cleanPath}</code> ist offline nicht verfügbar.</p>`, {
            headers: { 'Content-Type': 'text/html' },
          });
        });
    })
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 🧹 Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});
