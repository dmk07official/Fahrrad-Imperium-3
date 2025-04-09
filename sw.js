const CACHE_NAME = 'my-cf-game-v13';

// Alle Dateien, die gecacht werden sollen
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

// 🛠 INSTALL
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching all files...');
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('[SW] All files cached successfully.');
      self.skipWaiting(); // Directly activate without waiting
    }).catch(err => {
      console.error('[SW] Error caching files:', err);
    })
  );
});

// ⚡️ FETCH
self.addEventListener('fetch', event => {
  const request = event.request;

  // Wenn die Anfrage online nicht verfügbar ist, gebe aus dem Cache zurück
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] Cache hit for:', request.url);
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            console.log('[SW] New file cached:', request.url);
          });
        }
        return networkResponse;
      }).catch(() => {
        console.warn('[SW] No network, serving from cache (if available).');
        return caches.match(request); // serve from cache on failure
      });
    })
  );
});

// ♻️ ACTIVATE
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
      console.log('[SW] Service Worker activated and controlling the clients.');
      return self.clients.claim();
    })
  );
});
