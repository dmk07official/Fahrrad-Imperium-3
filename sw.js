const CACHE_NAME = 'my-cf-game-v11';
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
          const response = await fetch(url, { cache: 'no-cache' }); // umgeht evtl. redirect cache
          if (response.ok) {
            const cleanURL = new URL(url, self.location).pathname;
            await cache.put(cleanURL, response.clone());
            console.log('[SW] ✅ Cached:', cleanURL);
          } else {
            console.warn('[SW] ⚠️ Skipped (not ok):', url, response.status);
          }
        } catch (err) {
          console.error('[SW] ❌ Error fetching:', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// FETCH
self.addEventListener('fetch', event => {
  const reqURL = new URL(event.request.url);

  if (reqURL.origin !== location.origin) return;

  const cleanPath = reqURL.pathname;

  event.respondWith(
    caches.match(cleanPath).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit:', cleanPath);
        return cachedResponse;
      }

      console.log('[SW] 🔄 Cache miss, fetching:', cleanPath);
      return fetch(event.request)
        .then(networkResponse => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.redirected
          ) {
            console.warn('[SW] ⚠️ Bad response:', cleanPath);
            return networkResponse;
          }

          const responseClone = networkResponse.clone(); // ✅ FIX

          caches.open(CACHE_NAME).then(cache => {
            cache.put(cleanPath, responseClone).catch(err => {
              console.error('[SW] ❌ Failed to cache:', cleanPath, err);
            });
          });

          return networkResponse; // Original untouched
        })
        .catch(error => {
          console.error('[SW] ❌ Fetch failed:', cleanPath, error);
          return new Response('<h1>Offline 💀</h1><p>Diese Seite ist offline nicht verfügbar.</p>', {
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
            console.log('[SW] 🧹 Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});
