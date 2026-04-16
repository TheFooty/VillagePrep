// Service Worker for VillagePrep - no caching for always fresh content
const CACHE_NAME = 'villageprep-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip all caching - always serve fresh
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(fetch(request));
});
