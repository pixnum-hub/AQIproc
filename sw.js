const CACHE_NAME = "aqiproc-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/aqi-192.png",
  "./icons/aqi-512.png"
];

// Install: cache assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy + fallback to network
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // AQI API request handling
  if (url.hostname.includes("air-quality-api.open-meteo.com")) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request)) // offline fallback
    );
    return;
  }

  // Static assets cache-first
  event.respondWith(
    caches.match(event.request).then(cacheRes => cacheRes || fetch(event.request))
  );
});
