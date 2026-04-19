const CACHE_NAME = 'patnasuvidha-v2-premium';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.jpeg',
  '/og-preview.png',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&display=swap',
  'https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css',
  'https://unpkg.com/@phosphor-icons/web@2.0.3/src/fill/style.css',
  'https://unpkg.com/@phosphor-icons/web@2.0.3/src/bold/style.css'
];

// Install Event: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching shell and main assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase/Vercel API calls to avoid issues with caching Auth/DB
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || url.hostname.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found, but also fetch from network in background to update cache
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache successful standard responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails and no cache, maybe return an offline page here if we had one
        return null;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
