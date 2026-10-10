// ============================================================
// Service Worker - MiPyme Chile
// Permite que la app funcione sin internet
// ============================================================

const CACHE_NAME = 'mipyme-v2';
const URLS_TO_CACHE = [
  '/mipyme-chile/',
  '/mipyme-chile/index.html',
  '/mipyme-chile/styles.css',
  '/mipyme-chile/script.js',
  '/mipyme-chile/manifest.json',
  '/mipyme-chile/icons/icon.svg',
  '/mipyme-chile/icons/icon-maskable.svg',
  '/mipyme-chile/icons/icon-192.png',
  '/mipyme-chile/icons/icon-512.png'
];

// Instalar: guarda los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpia cachés viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: responde desde caché, si no hay, va a la red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});