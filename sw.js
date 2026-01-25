const CACHE_NAME = "aqiproc-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/aqi-192.png",
  "./icons/aqi-512.png"
];

/* 🔧 INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ♻ ACTIVATE */
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

/* 🌐 FETCH STRATEGY */
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // AQI API → Network first
  if (url.hostname.includes("open-meteo.com")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Static files → Cache first
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
