self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('aconser-shell').then((cache) => cache.addAll(['/manifest.json']))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
