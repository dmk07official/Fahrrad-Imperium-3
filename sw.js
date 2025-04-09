const CACHE_NAME = 'my-cf-game-v2';
const urlsToCache = [
  '/',
  '/game/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/index/main-theme.mp3',
  '/index/tap.mp3',
  '/index/discord-logo.png',
  '/index/logo.png',
  '/index/tiktok-logo.png',
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
  '/manifest.json',
  '/sw.js',
];

// INSTALL
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Caching files manually...');
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (response.ok && !response.redirected) {
            // Check if it's HTML before caching
            if (url.endsWith('.html')) {
              console.log('[SW] Caching HTML:', url);
            }
            await cache.put(url, response.clone());
            console.log('[SW] Cached:', url);
          } else {
            console.warn('[SW] Skipped (bad or redirected):', url, response.status);
          }
        } catch (err) {
          console.error('[SW] Failed to fetch & cache:', url, err);
        }
      }
    }).catch(err => {
      console.error('[SW] Error opening cache during install:', err);
    })
  );
  self.skipWaiting(); // Instantly activate the SW without waiting
});

// FETCH
self.addEventListener('fetch', event => {
  console.log('[SW] Fetching:', event.request.url);

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Serving from cache:', event.request.url);
        return cachedResponse;
      }

      console.log('[SW] 🔄 Not in cache, fetching from network:', event.request.url);

      return fetch(event.request).then(networkResponse => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' ||
          networkResponse.redirected
        ) {
          console.warn('[SW] ⚠️ Network response invalid or redirected:', event.request.url);
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
            console.log('[SW] 💾 Caching network response:', event.request.url);
            cache.put(event.request, responseClone).catch(err => {
              console.error('[SW] ❌ Failed to put in cache:', event.request.url, err);
            });
          }
        });

        return networkResponse;
      }).catch(error => {
        console.error('[SW] ❌ Fetch failed for:', event.request.url, error);

        // 🧭 CATCH-ALL FALLBACK BEI OFFLINE
        if (event.request.mode === 'navigate') {
          const url = new URL(event.request.url);
          if (url.pathname.startsWith('/game')) {
            return caches.match('/game/game.html');
          }
          return caches.match('/index.html');
        }
      });
    }).catch(cacheError => {
      console.error('[SW] ❌ Cache.match failed:', event.request.url, cacheError);
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
            console.log('[SW] 🧹 Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Activation complete. Clients now controlled.');
      return self.clients.claim();
    })
  );
});
