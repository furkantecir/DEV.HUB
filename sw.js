// ============================================
// SERVICE WORKER - PWA OFFLINE SUPPORT
// ============================================

const CACHE_NAME = 'web-tool-hub-v2.1-network-first';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/utilities.html',
    '/settings.html',
    '/profile.html',
    '/module-library.html',
    '/settings.js',
    '/utilities.js',
    '/js/global-search.js',
    '/js/usage-stats.js',
    '/css/global-search.css',
    '/diff-checker.html',
    '/code-playground.html',
    '/cron-generator.html',
    // Add more critical assets as needed
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - Network First for HTML, Cache First for assets
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;

    // Determine strategy based on file type
    const isHTML = event.request.destination === 'document' || event.request.url.endsWith('.html');

    if (isHTML) {
        // NETWORK FIRST STRATEGY (For HTML Pages)
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Update cache with new version
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if offline
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        // Fallback to index if/when specific page not cached
                        return caches.match('/index.html');
                    });
                })
        );
    } else {
        // CACHE FIRST STRATEGY (For Images, CSS, JS, Fonts)
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(event.request).then((response) => {
                        if (!response || response.status !== 200 || response.type === 'error') return response;
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        return response;
                    });
                })
        );
    }
});

// Message event - for cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
