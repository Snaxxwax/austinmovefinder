// Service Worker for caching and performance optimization
const CACHE_NAME = "austin-move-finder-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/quote",
  "/privacy",
  "/terms",
  "/hero-background.webp",
  "/icon-form.webp",
  "/icon-quotes.webp",
  "/icon-mover.webp",
  "/icon-trusted.webp",
  "/icon-save-money.webp",
  "/icon-no-obligation.webp",
  "/favicon.ico",
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  "/api/",
  "https://challenges.cloudflare.com",
  "https://static.cloudflareinsights.com",
];

// Cache-first resources (try cache first, fallback to network)
const CACHE_FIRST = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE,
            )
            .map((cacheName) => caches.delete(cacheName)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return;

  // Network-first strategy
  if (NETWORK_FIRST.some((pattern) => request.url.includes(pattern))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy
  if (CACHE_FIRST.some((pattern) => request.url.includes(pattern))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for HTML pages
  if (request.headers.get("accept").includes("text/html")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Cache-first for images and static assets
  if (
    request.headers.get("accept").includes("image/") ||
    url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("Offline", { status: 503 });
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response("Offline", { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "quote-form") {
    event.waitUntil(submitPendingForms());
  }
});

async function submitPendingForms() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();

  const formRequests = requests.filter(
    (request) =>
      request.url.includes("/api/quote") && request.method === "POST",
  );

  for (const request of formRequests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.log("Failed to submit form:", error);
    }
  }
}
