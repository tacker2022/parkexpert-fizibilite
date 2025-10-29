// Parkexpert Fizibilite - Service Worker
// Version 1.0.0

const CACHE_NAME = 'parkexpert-v1.0.0';
const CACHE_URLS = [
  '/parkexpert-fizibilite/',
  '/parkexpert-fizibilite/index.html',
  '/parkexpert-fizibilite/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

// Install - Cache resources
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          console.log('📦 Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Network request
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the new response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Offline fallback
          return new Response(
            '<h1>🚫 Offline</h1><p>İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.</p>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      })
  );
});

// Background Sync (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);

  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncCalculations());
  }
});

async function syncCalculations() {
  // Placeholder for future sync functionality
  console.log('📊 Syncing calculations...');
}

// Push Notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Yeni bildirim',
    icon: '/parkexpert-fizibilite/icon-192.png',
    badge: '/parkexpert-fizibilite/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Parkexpert', options)
  );
});

console.log('✨ Service Worker loaded successfully!');
