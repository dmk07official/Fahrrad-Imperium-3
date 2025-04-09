const CACHE_NAME = 'my-cf-game-v15';
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

// INSTALL - Alles cachen
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Caching files...');
      for (const url of urlsToCache) {
        try {
          // Fetch mit redirect follow und cache reload
          const req = new Request(url, { cache: 'reload', redirect: 'follow' });
          const response = await fetch(req);
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log('[SW] ✅ Cached:', url);
          } else {
            console.warn('[SW] ⚠️ Skipped:', url, response.status);
          }
        } catch (err) {
          console.error('[SW] ❌ Failed to fetch:', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// FETCH - Cache und Redirect Handling aggressiv anpassen
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit:', url.pathname);
        return cachedResponse;
      }

      // Aggressives Fetch mit redirect follow
      return fetch(request, { redirect: 'follow' })
        .then(response => {
          // Sicherstellen, dass die Antwort gültig und nicht redirected ist
          if (!response || response.status !== 200 || response.redirected) {
            console.warn('[SW] ⚠️ Redirected Response:', url.pathname);
            return response; // Wenn es ein Redirect ist, direkt zurückgeben
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
              cache.put(request, cloned);
              console.log('[SW] 🔄 Cached new asset:', url.pathname);
            }
          });

          return response;
        })
        .catch(error => {
          console.warn('[SW] 🛑 Network fail:', url.pathname, error);

          // 📦 OFFLINE FALLBACK
          if (url.pathname.endsWith('.html')) {
            if (url.pathname.startsWith('/game')) {
              return caches.match('/game/game.html'); // Game offline fallback
            }
            return caches.match('/index.html'); // Index offline fallback
          }

          return new Response('⚠️ Offline & file not cached', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// ACTIVATE - Altes Cache löschen
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 🔥 Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Now controlling clients.');
      return self.clients.claim();
    })
  );
});
