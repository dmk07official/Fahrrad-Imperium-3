const CACHE_NAME = 'my-cf-game-v11'; // neue Version!
const urlsToCache = [
  '/', // wichtig: root
  '/index.html',
  '/index.css',
  '/index.js',
  '/index/main-theme.mp3',
  '/index/tap.mp3',
  '/index/discord-logo.png',
  '/index/logo.png',
  '/index/tiktok.png',
  '/game/game.html',
  '/game/game.js',
  '/game/game.css',
  '/game/game-server.js',
  '/game/background-game.mp3',
  '/game/coin.png',
  '/game/coin_disabled.png',
  '/game/gold-arrow.png',
  '/game/green-arrow.png',
  '/game/prestige.png',
  '/game/tap.png',
  '/game/work.png',
  '/global-css-variables.css',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/sw.js'
];

// INSTALL
self.addEventListener('install', event => {
  console.log('[SW] Install...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('[SW] Activate...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// FETCH
self.addEventListener('fetch', event => {
  console.log('[SW] Fetching:', event.request.url);

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      if (response) {
        console.log('[SW] ✅ Serving from cache:', event.request.url);
        return response;
      }

      return fetch(event.request)
        .then(networkResponse => {
          // valid response
          if (
            !networkResponse || 
            networkResponse.status !== 200 || 
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          // Cache the new resource
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(error => {
          console.warn('[SW] ⚠️ Network error:', event.request.url, error);

          // Offline fallback ONLY for HTML documents
          if (event.request.destination === 'document') {
            if (event.request.url.includes('/game')) {
              return caches.match('/game/game.html');
            }
            return caches.match('/index.html');
          }

          // Optional: fallback image/sound/text
          return new Response('⚠️ Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});
