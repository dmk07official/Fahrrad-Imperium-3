const CACHE_NAME = 'my-cache-v1'; // Version des Caches
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

// Aktivierungsereignis - Alte Caches löschen, wenn sie nicht mehr gebraucht werden
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

// Fetch-Ereignis - Wenn der Nutzer offline ist, serve die gecachten Dateien
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Wenn die Antwort im Cache vorhanden ist, nutze sie
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Andernfalls, versuche die Anfrage über das Netzwerk zu holen
      return fetch(event.request).catch(() => {
        // Falls der Benutzer offline ist und keine Netzwerkanfrage funktioniert, hole die gecachten Dateien
        return caches.match('index.html'); // Beispiel: Stelle sicher, dass die index.html geladen wird
      });
    })
  );
});
