const CACHE_NAME = 'my-cf-game-v16';
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
          // Aggressiver Fetch mit cache und redirect follow
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

// FETCH - Aggressive Redirect-Strategie
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Wir fangen die Requests ab und bearbeiten sie
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Wenn der Cache einen Treffer liefert, verwenden wir ihn
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit:', url.pathname);
        return cachedResponse;
      }

      // Aggressiv den Request aus dem Netzwerk holen und Redirects folgen lassen
      return fetch(request, { redirect: 'follow' }).then(response => {
        // Wenn es ein Redirect ist, folgen wir ihm.
        if (response.redirected) {
          console.log('[SW] 🔄 Followed Redirect:', url.pathname);
        }

        // Wenn die Antwort gut ist, speichern wir sie im Cache und geben sie zurück
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
              cache.put(request, cloned);
              console.log('[SW] 🔄 Cached new asset:', url.pathname);
            }
          });
        }

        return response;
      }).catch(error => {
        console.warn('[SW] 🛑 Network fail:', url.pathname, error);

        // 📦 OFFLINE FALLBACK für HTML-Dateien
        if (url.pathname.endsWith('.html')) {
          if (url.pathname.startsWith('/game')) {
            return caches.match('/game/game.html'); // Game Offline Fallback
          }
          return caches.match('/index.html'); // Index Offline Fallback
        }

        return new Response('⚠️ Offline & file not cached', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

// ACTIVATE - Entfernen des alten Caches
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
