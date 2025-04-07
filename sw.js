const CACHE_NAME = 'my-game-cache-v2';

// Dateien, die cachen werden sollen, kommen dynamisch von `index.js`
let filesToCache = [];

// Service Worker wird aktiviert
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installiert');
  self.skipWaiting(); // Service Worker direkt aktivieren
});

// Service Worker wird aktiviert
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktiviert');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME) // Lösche alte Caches
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return clients.claim(); // Macht den neuen SW aktiv
    })
  );
});

// Empfang von Nachrichten von `index.js`
self.addEventListener('message', (event) => {
  if (event.data.action === 'cacheFiles') {
    filesToCache = event.data.files;  // Die Liste der Dateien zum Cachen setzen
    cacheFiles();
  }
});

// Caching der Dateien
function cacheFiles() {
  if (filesToCache.length > 0) {
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching Files');
      return cache.addAll(filesToCache);
    });
  }
}

// Fallback-Handling beim Abrufen von Dateien
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;

  // Nur GET-Requests behandeln
  if (method !== 'GET') return;

  // Überprüfe den Cache, ob die Datei bereits vorhanden ist
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[SW] Aus Cache geladen: ${url}`);
        return cachedResponse;  // Wenn die Datei im Cache ist, liefere sie zurück
      }

      console.log(`[SW] Versuche, ${url} aus dem Netz zu laden...`);

      // Lade die Datei aus dem Netz, wenn sie nicht im Cache ist
      return fetch(event.request).then((networkResponse) => {
        console.log(`[SW] Aus Netz geladen: ${url}`);
        return networkResponse;
      }).catch((error) => {
        console.error(`[SW] Fehler beim Laden von ${url}:`, error);

        // Im Offline-Modus: Zeige eine detaillierte Offline-Fehlermeldung
        const errorMessage = `
          <html>
            <head><title>Offline Fehler</title></head>
            <body>
              <h1>Fehler: Die Datei konnte nicht geladen werden 🚫</h1>
              <p>Die angeforderte Datei konnte nicht geladen werden:</p>
              <code>${url}</code>
              <p>Grund: Offline und die Datei fehlt im Cache.</p>
            </body>
          </html>
        `;
        return new Response(errorMessage, {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      });
    }).catch((err) => {
      console.error('[SW] Fehler beim Überprüfen des Caches:', err);
      const errorMessage = `
        <html>
          <head><title>Offline Fehler</title></head>
          <body>
            <h1>Fehler beim Zugriff auf den Cache 🚫</h1>
            <p>Ein Fehler ist beim Versuch, die Datei zu laden, aufgetreten:</p>
            <code>${url}</code>
            <p>Fehler: ${err.message}</p>
            <p>Bitte überprüfe deine Internetverbindung oder versuche es später erneut.</p>
          </body>
        </html>
      `;
      return new Response(errorMessage, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    })
  );
});
