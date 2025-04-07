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
        cacheNames.filter((name) => name !== CACHE_NAME) // Lösche alle anderen Caches
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

      // Versuch aus dem Netz zu laden
      return fetch(event.request).then((networkResponse) => {
        console.log(`[SW] Aus Netz geladen: ${url}`);
        return networkResponse;
      }).catch((error) => {
        console.warn(`[SW] ❌ Datei nicht gefunden (offline?): ${url}`);
        
        // Schöne Error-Seite zurückgeben
        const msg = `
          <h1 style="font-family:sans-serif;color:#D33">🚫 Datei nicht verfügbar</h1>
          <p>Die Datei konnte nicht geladen werden:</p>
          <code>${url}</code>
          <p>Grund: Kein Netz oder nie heruntergeladen.</p>
          <p>👉 Starte das Spiel einmal mit Internet und klick auf "Offline speichern".</p>
        `;

        return new Response(msg, {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      });
    })
  );
});
