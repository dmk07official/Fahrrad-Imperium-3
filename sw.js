const CACHE_NAME = 'my-cf-game-v7';
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
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching initial files:');
      console.table(urlsToCache);
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error('[SW] Error during install cache.addAll():', err);
    })
  );
  self.skipWaiting(); // sofort aktivieren
});

// FETCH
self.addEventListener('fetch', event => {
  console.log('[SW] Fetching:', event.request.url);

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      console.log('[SW] Not in cache, fetching from network:', event.request.url);

      return fetch(event.request).then(networkResponse => {
        // Sicherstellen, dass die Response klonbar ist
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          console.warn('[SW] Network response invalid:', event.request.url, networkResponse);
          return networkResponse;
        }

        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          if (
            event.request.url.endsWith('.html') ||
            event.request.url.endsWith('.css') ||
            event.request.url.endsWith('.js') ||
            event.request.url.endsWith('.png') ||
            event.request.url.endsWith('.mp3')
          ) {
            console.log('[SW] Caching fetched file:', event.request.url);
            cache.put(event.request, responseClone);
          }
        });

        return networkResponse;
      }).catch(error => {
        console.error('[SW] Network fetch failed for:', event.request.url, error);
      });
    }).catch(cacheError => {
      console.error('[SW] Cache match failed:', event.request.url, cacheError);
    })
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('[SW] Activating new Service Worker...');

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete. Clients now controlled.');
      return self.clients.claim();
    })
  );
});
