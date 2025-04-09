const CACHE_NAME = 'my-cf-game-v14';
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

// INSTALL - Alle Dateien cachen
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Caching files...');
      for (const url of urlsToCache) {
        try {
          const req = new Request(url, { cache: 'reload', redirect: 'follow' }); // fetch mit redirect follow
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
  self.skipWaiting(); // Service Worker sofort aktivieren
});

// FETCH - Cache zuerst, dann Network
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Wenn die Datei im Cache ist, zurückgeben
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit:', url.pathname);
        return cachedResponse;
      }

      // Wenn nicht, aus dem Netz holen
      return fetch(request, { redirect: 'follow' }).then(response => {
        if (!response || response.status !== 200 || response.redirected) {
          return response;
        }

        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Dateien wie HTML, JS, CSS, Bilder, etc. im Cache speichern
          if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
            cache.put(request, cloned);
            console.log('[SW] 🔄 Cached new asset:', url.pathname);
          }
        });

        return response;
      }).catch(error => {
        console.warn('[SW] 🛑 Network fail:', url.pathname, error);

        // 📦 OFFLINE FALLBACK
        if (url.pathname.endsWith('.html')) {
          // Wenn HTML nicht geladen wird, fallback zu Index oder Game HTML
          if (url.pathname.startsWith('/game')) {
            return caches.match('/game/game.html');
          }
          return caches.match('/index.html');
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
