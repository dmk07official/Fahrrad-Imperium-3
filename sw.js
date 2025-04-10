const CACHE_NAME = 'my-cf-game-v-5';
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
  '/game.css',
  '/game.html',
  '/game.js',
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
  console.log('[SW] 🚀 Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(async url => {
          try {
            const response = await fetch(url);
            if (response && response.ok) {
              await cache.put(url, response.clone());
              console.log('[SW] ✅ Cached:', url);
            } else {
              console.warn('[SW] ⚠️ Skipped (bad response):', url);
            }
          } catch (err) {
            console.error('[SW] ❌ Failed to fetch for cache:', url, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// FETCH
self.addEventListener('fetch', event => {
  const { request } = event;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Served from cache:', request.url);
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === 'opaque'
          ) {
            console.warn('[SW] ⚠️ Bad or opaque response:', request.url);
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then(cache => {
            if (request.url.match(/\.(html|css|js|mp3|png|json)$/)) {
              cache.put(request, responseClone).catch(err => {
                console.error('[SW] ❌ Failed to cache (fetch):', request.url, err);
              });
            }
          });

          return networkResponse;
        })
        .catch(err => {
          console.error('[SW] ❌ Network failed:', request.url, err);
          return caches.match(request).then(offlineResponse => {
            if (offlineResponse) {
              console.log('[SW] 💾 Served offline from cache:', request.url);
              return offlineResponse;
            } else {
              return new Response('<h1>Offline 😭</h1>', {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          });
        });
    })
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('[SW] ✅ Activating...');
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
