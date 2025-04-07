const CACHE_NAME = 'my-game-cache-v2';

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installiert');
  self.skipWaiting(); // Direkt aktiv
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Aktiviert');
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

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;

  // Nur GETs cachen
  if (method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[SW] Aus Cache geladen: ${url}`);
        return cachedResponse;
      }

      console.log(`[SW] Versuche, ${url} aus dem Netz zu laden...`);

      // Versuch, die Datei aus dem Netz zu laden
      return fetch(event.request).then((networkResponse) => {
        console.log(`[SW] Aus Netz geladen: ${url}`);
        return networkResponse;
      }).catch((error) => {
        console.error(`[SW] Fehler beim Laden von ${url}:`, error);

        // Wenn das Netz nicht erreichbar ist, zeige eine detaillierte Fehlermeldung
        const errorMessage = `
          <html>
            <head><title>Offline Fehler</title></head>
            <body>
              <h1>Fehler: Die Datei konnte nicht geladen werden 🚫</h1>
              <p>Die angeforderte Datei konnte nicht geladen werden:</p>
              <code>${url}</code>
              <p>Grund: ${error.message}</p>
              <p>Bitte überprüfe deine Internetverbindung oder versuche es später erneut.</p>
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
