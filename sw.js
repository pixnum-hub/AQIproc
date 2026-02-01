const CACHE_NAME = "aqiproc-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./style.css",
  "./icons/aqi-192.png",
  "./icons/aqi-512.png"
];

// Install: cache all assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if(key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

// Fetch: serve cache first, then network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    }).catch(() => {
      // Fallback: optional offline page
      if(event.request.mode === "navigate") return caches.match("./index.html");
    })
  );
});
