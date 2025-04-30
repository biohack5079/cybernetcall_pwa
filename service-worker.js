// /home/my/d/cybernetcall/cncservice-worker.js
// Service worker with pre-caching for local assets and external libraries

// Define a unique name for the cache, including a version number
const CACHE_NAME = 'cybernetcall-cache-v5'; // Keep or increment version as needed

// List of URLs to pre-cache when the service worker installs
const urlsToCache = [
  // Core application shell
  '/', // The main HTML page
  'manifest.json',
  'app.js',
  'style.css',
  // Icons used by manifest and potentially HTML
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'icons/icon-maskable-512x512.png', // Also cache maskable icon
  // External libraries loaded from CDNs in index.html
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
  'https://unpkg.com/idb@7/build/umd.js',
  'https://unpkg.com/html5-qrcode' // Note:unpkg might redirect, consider specific version URL if issues arise
];

// Event listener for the 'install' event
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event');
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  // Pre-cache the defined URLs
  event.waitUntil(
    caches.open(CACHE_NAME) // Open the specified cache
      .then(cache => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // Add all URLs from urlsToCache to the cache
        return cache.addAll(urlsToCache)
          .catch(err => {
            // Log errors if any URL fails to cache (e.g., network error)
            console.error('[Service Worker] Failed to cache one or more resources during install:', err);
            // Optional: You might want to throw the error to fail the installation
            // if core assets couldn't be cached.
            // throw err;
          });
      })
  );
});

// Event listener for the 'activate' event
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(keys =>
      // Wait for all promises to resolve (deleting old caches)
      Promise.all(keys.map(key => {
        // If a cache key doesn't match the current CACHE_NAME, delete it
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Deleting old cache:', key);
          return caches.delete(key);
        }
      }))
    ).then(() => {
      // Take control of uncontrolled clients (pages) immediately
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Event listener for the 'fetch' event (intercepting network requests)
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    // console.log('[Service Worker] Ignoring non-GET request:', event.request.method, event.request.url);
    return;
  }

  // Network falling back to cache strategy
  event.respondWith(
    // 1. Try to fetch the resource from the network
    fetch(event.request)
      .then(networkResponse => {
        // console.log('[Service Worker] Fetched from network:', event.request.url);
        return networkResponse;
      })
      .catch(() => {
        // 2. If network fetch fails (e.g., offline), try to get it from the cache
        console.log('[Service Worker] Network failed, trying cache for:', event.request.url);
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving from cache:', event.request.url);
            } else {
              console.log('[Service Worker] Not found in cache:', event.request.url);
              // Optional: Return a custom offline fallback page/response here if needed
            }
            return cachedResponse; // Returns the cached response or undefined if not found
          });
      })
  );
});

