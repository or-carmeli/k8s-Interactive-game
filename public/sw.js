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

// Install - pre-cache shell assets and activate immediately
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate - delete all old caches, then take control of all clients
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
//  - Navigation: network-first with cache:"no-store" (never serve stale HTML)
//  - /assets/*:  cache-first (Vite hashed filenames are immutable)
//  - Everything else: network-first with cache fallback
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  // ── Navigation - always hit network for fresh HTML ──
  if (e.request.mode === "navigate") {
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

  // ── Hashed Vite assets (/assets/*) - cache first ──
  // Vite output filenames contain a content hash (e.g. index-abc123.js).
  // These are immutable: if the content changes, the filename changes.
  // Cache-first avoids redundant network requests for unchanged bundles.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // ── Other sub-resources - network first, cache fallback ──
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Allow the app to trigger immediate SW activation
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
