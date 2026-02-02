const CACHE_NAME = "aqi-pro-max-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch (Network first for API, Cache first for app shell)
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // API requests → network first
  if (url.hostname.includes("open-meteo.com")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // App files → cache first
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
