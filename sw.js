const CACHE_NAME = 'my-cf-game-v-1';
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
  '/game/game.html',  // Game HTML immer mit rein
  '/game/game.js',
  '/game/gold-arrow.png',
  '/game/green-arrow.png',
  '/game/prestige.png',
  '/game/tap.png',
  '/game/work.png',
  '/global-css-variables.css',
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
          const response = await fetch(url);
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
  const request = event.request;

  // Handle navigations (z.B. URL direkt im Browser eingegeben)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response => {
        return response || fetch('/index.html');
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit:', request.url);
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        // Optional: Cache neue Sachen nach Bedarf (nur bestimmte Typen)
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (request.url.match(/\.(html|js|css|png|mp3)$/)) {
            cache.put(request, responseClone);
          }
        });

        return networkResponse;
      }).catch(() => {
        // Bei Offline: gib gecachte Version zurück (falls vorhanden)
        return caches.match(request);
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
