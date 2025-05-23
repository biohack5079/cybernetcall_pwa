// /home/my/d/cybernetcall/cnc/static/cnc/service-worker.js
// Service worker with pre-caching for local assets and external libraries

// Define a unique name for the cache, including a version number
const CACHE_NAME = 'cybernetcall-cache-v5'; // Keep or increment version as needed

// List of URLs to pre-cache when the service worker installs
const urlsToCache = [
  // Core application shell
  'index.html', // Explicitly cache index.html instead of '/'
  'manifest.json',
  'app.js',
  'style.css',
  // Icons used by manifest and potentially HTML
  'icon-192x192.png', // Assuming icons are in the root folder
  'icon-512x512.png',
  'icon-maskable-512x512.png', // Also cache maskable icon
  // External libraries loaded from CDNs in index.html
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
  'https://unpkg.com/idb@7/build/umd.js',
  'https://unpkg.com/html5-qrcode', // Note:unpkg might redirect, consider specific version URL if issues arise
  'https://unpkg.com/wasm-brotli@0.1.0/wasm_brotli.js' // Brotli Wasm library
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

  // Cache falling back to network strategy (Cache First)
  event.respondWith(
    // 1. Try to get the resource from the cache
    caches.match(event.request)
      .then(cachedResponse => {
        // Return the cached response if found
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // 2. If not in cache, try to fetch from the network
        console.log('[Service Worker] Not in cache, fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Optional: Cache the fetched response for future offline use
            // Be careful with caching dynamic responses or large files
            // let responseToCache = networkResponse.clone();
            // caches.open(CACHE_NAME).then(cache => {
            //   cache.put(event.request, responseToCache);
            // });
            return networkResponse;
          })
          .catch(error => {
            // Handle network errors (e.g., offline and not in cache)
            console.error('[Service Worker] Fetch failed (offline and not in cache?):', error);
            // Optional: Return a custom offline fallback page/response here
            // return new Response("You are offline and this content isn't cached.", { status: 503, statusText: "Service Unavailable" });
          });
      })
  );
});
