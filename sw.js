const CACHE_NAME = 'my-cf-game-v18';
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

// INSTALL - Dateien cachen
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Caching files...');
      for (const url of urlsToCache) {
        try {
          const req = new Request(url, { cache: 'reload' });
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

// FETCH - Redirects und Cache-Handhabung
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Wenn es bereits im Cache ist, holen wir die Datei
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Wenn wir den Cache treffen, gibt es die gecachte Version zurück
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit:', url.pathname);
        return cachedResponse;
      }

      // Wenn keine Cache-Datei existiert, fetchen wir die Datei
      return fetch(request).then(response => {
        // Wenn die Antwort umgeleitet wird, behandeln wir sie
        if (response.redirected) {
          console.log('[SW] 🔄 Redirect detected, fetching final URL:', response.url);
          return fetch(response.url).then(finalResponse => {
            // Wenn die finale Antwort gültig ist, speichern wir sie
            if (finalResponse.ok) {
              const cloned = finalResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
                  cache.put(request, cloned);
                  console.log('[SW] 🔄 Cached final asset:', url.pathname);
                }
              });
            }
            return finalResponse;
          }).catch(err => {
            console.warn('[SW] ❌ Failed to fetch final URL:', err);
            return new Response('Offline Error', { status: 503 });
          });
        }

        // Wenn keine Umleitung vorhanden ist, speichern wir die Antwort im Cache
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
              cache.put(request, cloned);
              console.log('[SW] 💾 Cached:', url.pathname);
            }
          });
        }

        return response;
      }).catch(err => {
        console.warn('[SW] ❌ Network fail:', err);

        // Offline-Fallback für HTML-Dateien
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

// ACTIVATE - Entfernen alter Caches
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
