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

// FETCH - Mit Redirects umgehen und Cache nutzen
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

      // Wenn kein Cache gefunden wird, fetchen wir die Datei
      return fetch(request).then(response => {
        // Wenn die Antwort umgeleitet wurde, loggen wir dies und holen die finale URL
        if (response.redirected) {
          console.log('[SW] 🔄 Redirect detected, URL:', response.url);
          
          // Versuche, der Weiterleitung zu folgen
          return fetch(response.url).then(finalResponse => {
            console.log('[SW] Following redirect, final response:', finalResponse.url);

            if (finalResponse.ok) {
              // Diese finale Antwort speichern wir im Cache
              const cloned = finalResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                if (/\.(html|css|js|png|mp3)$/.test(url.pathname)) {
                  cache.put(request, cloned);
                  console.log('[SW] 🔄 Cached final redirected asset:', url.pathname);
                }
              });
            }
            return finalResponse;
          }).catch(err => {
            console.error('[SW] ❌ Error following redirect:', err);
            return new Response('Error fetching redirected resource.', { status: 503 });
          });
        }

        // Keine Weiterleitung, aber trotzdem im Cache speichern
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
        console.error('[SW] ❌ Network fetch failed:', err);
        
        // Wenn wir offline sind, bieten wir Fallbacks aus dem Cache an
        if (url.pathname.endsWith('.html')) {
          console.log('[SW] ⚠️ Fallback to cached HTML file');
          if (url.pathname.startsWith('/game')) {
            return caches.match('/game/game.html');
          }
          return caches.match('/index.html');
        }

        // Wenn andere Assets fehlen und wir offline sind, geben wir eine Offline-Nachricht zurück
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
