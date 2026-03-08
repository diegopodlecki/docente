const CACHE_NAME = 'agenda-docente-v8';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/storage.js',
    './js/ui.js',
    './js/app.js',
    './manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './js/calendario.js',
    './js/estadisticas.js',
    './js/exportar.js',
    './js/backup.js',
    './js/inteligente.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network-first strategy: always try to get the latest version from the server.
// Only use the cache as a fallback when offline.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response and update the cache with the fresh version
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Network failed, fall back to cache (offline mode)
                return caches.match(event.request);
            })
    );
});
