self.addEventListener('fetch', event => {
  console.log('[SW] Fetching:', event.request.url);

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] 🟢 Serving from cache:', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' ||
          networkResponse.redirected
        ) {
          console.warn('[SW] ⚠️ Network response invalid or redirected:', event.request.url);
          return networkResponse;
        }

        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          if (
            event.request.url.endsWith('.html') ||
            event.request.url.endsWith('.css') ||
            event.request.url.endsWith('.js') ||
            event.request.url.endsWith('.png') ||
            event.request.url.endsWith('.mp3')
          ) {
            console.log('[SW] 💾 Caching network response:', event.request.url);
            cache.put(event.request, responseClone).catch(err => {
              console.error('[SW] ❌ Failed to put in cache:', event.request.url, err);
            });
          }
        });

        return networkResponse;
      }).catch(error => {
        console.error('[SW] ❌ Fetch failed for:', event.request.url, error);

        // 👇 OFFLINE FALLBACK HIER:
        if (event.request.destination === 'document') {
          if (event.request.url.includes('/game')) {
            return caches.match('/game/game.html');
          }
          return caches.match('/index.html');
        }

        // für andere Typen:
        return new Response('Offline', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    }).catch(cacheError => {
      console.error('[SW] ❌ Cache.match failed:', event.request.url, cacheError);
    })
  );
});
