self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return new Response("Offline & Datei nicht im Cache 😬", {
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
