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
  '/game/game.html',  // Game HTML immer mit rein
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
  const requestURL = new URL(event.request.url);
  
  // Überprüfen, ob es sich um die eigene Domain handelt
  if (requestURL.origin !== location.origin) return;

  const cleanPath = requestURL.pathname.replace(/\/+$/, '');  // Entfernen von Slashes, falls vorhanden

  event.respondWith(
    caches.match(cleanPath).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Serving from cache:', cleanPath);
        return cachedResponse;  // Antworte direkt aus dem Cache
      }

      console.log('[SW] 🔄 Not cached, fetching:', cleanPath);

      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            console.warn('[SW] ⚠️ Bad response:', cleanPath);
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then(cache => {
            // Sicherstellen, dass HTML-Dateien wie `game.html` immer gecacht werden
            if (cleanPath.endsWith('.html') || cleanPath.endsWith('.css') || cleanPath.endsWith('.js') || cleanPath.endsWith('.png')) {
              console.log('[SW] 💾 Caching network response:', cleanPath);
              cache.put(cleanPath, responseClone).catch(err => {
                console.error('[SW] ❌ Failed to cache:', cleanPath, err);
              });
            }
          });

          return networkResponse;  // Rückgabe der Netzwerkantwort
        })
        .catch(error => {
          console.error('[SW] ❌ Fetch failed for:', cleanPath, error);
          // Stelle sicher, dass bei Offline-Zugriff die gecachte Version zurückgegeben wird
          return caches.match(cleanPath);  // Falls offline, die gecachte Version zurückgeben
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
