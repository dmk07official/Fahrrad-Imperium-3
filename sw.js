const CACHE_NAME = 'my-cf-game-v12';
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
  const requestURL = new URL(event.request.url);

  // Überprüfen, ob es sich um die eigene Domain handelt
  if (requestURL.origin !== location.origin) return;

  const cleanPath = requestURL.pathname.replace(/\/+$/, '');  // Entfernen von Slashes

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Serving from cache:', event.request.url);
        return cachedResponse;  // Antworte direkt aus dem Cache
      }

      // Wenn keine gecachte Antwort da ist und offline, dann fallback
      if (!navigator.onLine) {
        console.warn('[SW] ⚠️ Offline und keine gecachte Antwort, versuche es später.');
        return caches.match('/offline.html');  // Optional: eine Offline-Fehlerseite
      }

      console.log('[SW] 🔄 Not cached, fetching:', event.request.url);
      return fetch(event.request);
    }).catch(err => {
      console.error('[SW] ❌ Fetch failed for:', cleanPath, err);
      // Stelle sicher, dass bei Offline-Zugriff die gecachte Version zurückgegeben wird
      return caches.match(cleanPath);  // Falls offline, die gecachte Version zurückgeben
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

