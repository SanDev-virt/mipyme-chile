// ============================================================
// Service Worker - MiPyme Chile
// Con actualización automática
// ============================================================

const CACHE_NAME = 'mipyme-v6'; // antes v5
const URLS_TO_CACHE = [
  '/mipyme-chile/',
  '/mipyme-chile/index.html',
  '/mipyme-chile/styles.css',
  '/mipyme-chile/script.js',
  '/mipyme-chile/xlsx.full.min.js',   // ⬅️ NUEVO
  '/mipyme-chile/manifest.json',
  '/mipyme-chile/icons/icon-1024.png',
  '/mipyme-chile/icons/icon-maskable-1024.png'
];

// ---------- INSTALL ----------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting()) // Activa inmediatamente
  );
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// ---------- FETCH ----------
// Estrategia:
//   - HTML/JS/CSS/JSON → network first (siempre lo más nuevo)
//   - Imágenes → cache first (más rápido)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar peticiones que no son del mismo origen
  if (url.origin !== self.location.origin) return;

  const esCodigo =
    event.request.destination === 'document' ||
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    url.pathname.endsWith('.json');

  if (esCodigo) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Imágenes u otros: caché primero
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ---------- MENSAJE DESDE LA APP ----------
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});