// Intercept and cache TeXLive requests
// Reduces engine start up time from 30-60 seconds to ~1 second

const CACHE_NAME = 'texlive-cache-v1';
const TEXLIVE_URL_PATTERN = /texlive.*\.(?:swiftlatex|resumecorgi)\.com\/pdftex\//;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('TexLive cache service worker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('TexLive cache service worker activated');
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept TexLive requests
  if (TEXLIVE_URL_PATTERN.test(url.href)) {
    console.log('Intercepting TexLive request:', url.href);
    event.respondWith(
      cacheFirst(event.request, event)
    );
  }
});

async function cacheFirst(request, event) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try to get from cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('Serving from cache:', request.url);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  try {
    console.log('Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Clone the response to save in cache
    const responseToCache = networkResponse.clone();
    
    // Cache the response (async)
    event.waitUntil(
      cache.put(request, responseToCache)
        .then(() => console.log('Cached successfully:', request.url))
        .catch(err => console.error('Cache error:', err))
    );
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}