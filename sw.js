const CACHE_NAME = 'my-cf-game-v2';
const urlsToCache = [
  '/',
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
  '/game/game.html',  // Die HTML-Dateien explizit sicherstellen
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
      const cachePromises = urlsToCache.map(async url => {
        try {
          const response = await fetch(url, { cache: 'reload' }); // Stelle sicher, dass keine Caching-Fehler auftreten
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log('[SW] Cached:', url);
          } else {
            console.warn('[SW] Skipped (bad response):', url, response.status);
          }
        } catch (err) {
          console.error('[SW] Failed to fetch & cache:', url, err);
        }
      });

      await Promise.all(cachePromises);
    }).catch(err => {
      console.error('[SW] Error opening cache during install:', err);
    })
  );
  self.skipWaiting(); // Sofort aktivieren ohne warten
});

// FETCH
self.addEventListener('fetch', event => {
  console.log('[SW] Fetching:', event.request.url);

  // Sicherstellen, dass HTML-Dateien auch im Cache verarbeitet werden
  event.respondWith(
    caches.match(event.request).then(async cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Serving from cache:', event.request.url);
        return cachedResponse;
      }

      console.log('[SW] 🔄 Not in cache, fetching from network:', event.request.url);

      try {
        const networkResponse = await fetch(event.request);
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' ||
          networkResponse.redirected
        ) {
          console.warn('[SW] ⚠️ Network response invalid or redirected:', event.request.url);
          return networkResponse;
        }

        // Sicherstellen, dass HTML-Dateien und andere Dateien auch gecacht werden
        const responseClone = networkResponse.clone();
        const url = new URL(event.request.url);

        // Cache nur, wenn die Datei einer bestimmten Kategorie entspricht (HTML, CSS, JS, etc.)
        if (url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.png') || url.pathname.endsWith('.mp3')) {
          caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] 💾 Caching network response:', event.request.url);
            cache.put(event.request, responseClone);
          }).catch(err => {
            console.error('[SW] ❌ Failed to put in cache:', event.request.url, err);
          });
        }

        return networkResponse;
      } catch (error) {
        console.error('[SW] ❌ Fetch failed for:', event.request.url, error);

        // 🧭 Fallback-Mechanismus, wenn offline
        if (event.request.mode === 'navigate') {
          const url = new URL(event.request.url);
          if (url.pathname.startsWith('/game')) {
            return caches.match('/game/game.html');
          }
          return caches.match('/index.html');
        }
      }
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
