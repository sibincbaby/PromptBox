// PromptBox Service Worker
const CACHE_NAME = 'promptbox-cache-v1';
const APP_VERSION = '1.0.0'; // This should match your app version

// Files to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/icon.png',
  // Add other static assets you want to cache
];

// Install event - cache basic files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing service worker version:', APP_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache install error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new service worker version:', APP_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Immediately claim clients to take control
  return self.clients.claim();
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache responses with errors
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();
        
        // Update the cache with new response
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          })
          .catch((error) => {
            console.error('[Service Worker] Error updating cache:', error);
          });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache if network request fails
        return caches.match(event.request);
      })
  );
});

// Listen for messages from clients (like skip waiting)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting and activate immediately');
    self.skipWaiting();
  }
});