const CACHE_NAME = 'my-cf-game-v19';
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
          console.log(`[SW] Fetching and caching: ${url}`);
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

// FETCH - Fetch und Redirects ohne follow behandeln
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  console.log(`[SW] Fetching request: ${url.pathname}`);

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Cache hit for:', url.pathname);
        return cachedResponse;
      }

      // Wenn keine Cache-Antwort vorhanden ist, fetchen wir den Request
      return fetch(request).then(response => {
        // Wenn die Antwort umgeleitet wurde, loggen wir dies und holen die finale URL
        if (response.redirected) {
          console.log('[SW] 🔄 Redirect detected, URL:', response.url);
          
          // Versuche, den Response direkt zu verwenden (ohne Follow), da die URL die finale ist
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
              cache.put(request, cloned);
              console.log('[SW] 🔄 Cached redirected asset:', url.pathname);
            }
          });
          return response; // Gib die weitergeleitete Antwort zurück
        }

        // Wenn keine Weiterleitung, speichern wir sie im Cache
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
        console.error('[SW] ❌ Fetch failed:', err);

        // Wenn offline, versuche Dateien aus dem Cache zu servieren
        if (url.pathname.endsWith('.html')) {
          console.log('[SW] ⚠️ Fallback to cached HTML file');
          if (url.pathname.startsWith('/game')) {
            return caches.match('/game/game.html');
          }
          return caches.match('/index.html');
        }

        // Andere Dateien bei Offline nicht verfügbar, Rückgabe einer Offline-Nachricht
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
  console.log('[SW] Activating new Service Worker...');
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
