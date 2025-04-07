const CACHE_NAME = 'my-cf-game-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/index/main-theme.mp3',
  '/index/tap.mp3',
  '/index/discord-logo.png',
  '/index/logo.png',
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

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching files during install');
      return cache.addAll(urlsToCache);  // Alle URLs im Cache speichern
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Wenn die Datei im Cache ist, gibt sie zurück
      if (cachedResponse) {
        return cachedResponse;
      }

      // Wenn die Datei nicht im Cache ist, versuche es mit dem Netzwerk
      return fetch(event.request).then((networkResponse) => {
        // Cache die Antwort für zukünftige Zugriffe (insbesondere HTML, CSS, JS, Bilder)
        if (
          event.request.url.endsWith('.html') ||
          event.request.url.endsWith('.css') ||
          event.request.url.endsWith('.js') ||
          event.request.url.endsWith('.png') ||
          event.request.url.endsWith('.mp3')
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()); // Datei in den Cache legen
          });
        }
        return networkResponse;
      }).catch(() => {
        // Falls der Netzwerkaufruf fehlschlägt, kann optional etwas anderes zurückgegeben werden
        // Da du aber keine offline.html verwendest, lassen wir das hier aus
        console.log("Netzwerkfehler beim Abrufen von:", event.request.url);
      });
    })
  );
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Lösche alten Cache:', key);
            return caches.delete(key);  // Lösche alte Caches, die nicht mehr aktuell sind
          }
        })
      );
    })
  );
});
