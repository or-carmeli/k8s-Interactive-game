// CACHE_VERSION is replaced at build time by the vite swCacheVersion plugin.
// Falls back to a static name if the replacement didn't run (dev mode).
const CACHE_VERSION = "__SW_CACHE_VERSION__";
const CACHE = CACHE_VERSION.startsWith("__") ? "k8s-quest-dev" : CACHE_VERSION;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png"
];

// Install - pre-cache shell assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate - delete every cache that isn't the current version
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  const isNavigate = e.request.mode === "navigate";

  if (isNavigate) {
    // CRITICAL: Bypass browser HTTP cache for navigation requests.
    // Without this, fetch() can return a stale index.html from HTTP cache
    // that references JS bundles that no longer exist after a deploy.
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Sub-resources (JS, CSS, images): network-first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Allow the app to trigger immediate SW activation
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
