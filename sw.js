const CACHE_NAME = 'my-cache-v1';
const filesToCache = [
  'index.html',
  'index.css',
  'index.js',
  'index/main-theme.mp3',
  'index/tap.mp3',
  'index/discord-logo.png',
  'index/logo.png',
  'game/background-game.mp3',
  'game/coin.png',
  'game/coin_disabled.png',
  'game/game-server.js',
  'game/game.css',
  'game/game.html',
  'game/game.js',
  'game/gold-arrow.png',
  'game/green-arrow.png',
  'game/prestige.png',
  'game/tap.png',
  'game/work.png',
  'global-css-variables.css',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'sw.js'
];

// Installiere den Service Worker und cache alle Dateien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(filesToCache);
    })
  );
});

// Aktivierungsereignis - Alte Caches löschen
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Lösche alten Cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch-Ereignis - Stellt sicher, dass der Service Worker die gecachten Dateien liefert
self.addEventListener('fetch', (event) => {
  // Falls die Anfrage nach einer Seite (navigate) kommt, gebe immer die gecachte index.html zurück
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cachedResponse) => {
        // Wenn die index.html im Cache ist, gebe sie zurück
        if (cachedResponse) {
          return cachedResponse;
        }
        // Falls die index.html nicht im Cache ist, gebe eine Fallback-Seite zurück (optional)
        return caches.match('index.html'); // Alternativ könnte hier eine Fehlerseite kommen
      })
    );
  } else {
    // Für andere Anfragen wie Bilder oder Skripte, hole sie entweder aus dem Cache oder vom Netzwerk
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).catch(() => {
          // Falls die Datei nicht im Cache ist und keine Netzwerkverbindung besteht, gebe die index.html zurück
          return caches.match('index.html');
        });
      })
    );
  }
});
