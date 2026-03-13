// ── Startup Resilience (2026-03) ────────────────────────────────────────────
//
// Problem: After deploys users saw blank pages - stale SW cache served old
// index.html referencing deleted JS bundles, and corrupt/incompatible
// localStorage could crash the React tree.
//
// Defence layers:
//  1. SW cache busting - public/sw.js cache name is build-stamped via
//     vite.config.js closeBundle plugin; old caches purged on activate.
//  2. Navigation cache bypass - SW uses { cache: "no-store" } for navigation
//     fetches so the browser HTTP cache can't serve stale index.html.
//  3. Cache-Control headers - vercel.json sets no-cache on / and sw.js.
//  4. Safe storage reads - safeGetItem / safeGetJSON wrap every localStorage
//     read; corrupt JSON is auto-removed and replaced with fallback defaults.
//  5. Data versioning - checkDataVersion() compares __APP_DATA_VERSION__
//     (bumped only on schema breaks) and clears transient keys on mismatch
//     while preserving user progress.
//  6. ErrorBoundary recovery - components/ErrorBoundary.jsx catches render
//     errors and offers "Clear app data & reload" which calls clearAppData().
//  7. Deferred SW reload - index.html SW updatefound handler checks
//     window.__KQ_QUIZ_ACTIVE__ and defers page reload until the user
//     finishes an active quiz or incident.
// ─────────────────────────────────────────────────────────────────────────────

const DATA_VERSION_KEY = "kq_data_version";

// All known KubeQuest localStorage keys.
const KQ_STORAGE_KEYS = [
  "kq_theme",
  "kq_screen_v1",
  "gender_v1",
  "topicStats_v1",
  "isInterviewMode_v1",
  "a11y_v1",
  "daily_streak_v1",
  "bookmarks_v1",
  "k8s_progress_v2",
  "k8s_quest_guest",
  "k8s_guest_session",
  "scoredFreeKeys_v1",
  "incident_progress_v1",
  "k8s_quiz_inprogress_v1",
  "resumeDismissedAt",
];

// Keys safe to clear on version mismatch - transient/reconstructible data only.
// User progress (k8s_progress_v2, k8s_quest_guest, bookmarks_v1, daily_streak_v1) is preserved.
const CLEARABLE_ON_VERSION_BUMP = [
  "kq_screen_v1",
  "topicStats_v1",
  "isInterviewMode_v1",
  "a11y_v1",
  "scoredFreeKeys_v1",
  "incident_progress_v1",
  "k8s_quiz_inprogress_v1",
  "resumeDismissedAt",
];

/**
 * Safe localStorage.getItem with fallback.
 */
export function safeGetItem(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON.parse(localStorage.getItem(...)) with fallback.
 * Auto-removes corrupt values to prevent repeated parse failures.
 */
export function safeGetJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    console.warn(`[KubeQuest] Removed corrupt localStorage key: ${key}`);
    return fallback;
  }
}

/**
 * Check if persisted data version matches current build.
 * On mismatch, clear schema-dependent keys (preserving user progress).
 * Call once at app startup before other localStorage reads.
 */
export function checkDataVersion() {
  const currentVersion = typeof __APP_DATA_VERSION__ !== "undefined"
    ? __APP_DATA_VERSION__
    : 0;

  try {
    const stored = parseInt(localStorage.getItem(DATA_VERSION_KEY), 10);

    if (!isNaN(stored) && stored === currentVersion) {
      console.info(`[KubeQuest] Data version OK: ${currentVersion}`);
      return;
    }

    if (!isNaN(stored) && stored < currentVersion) {
      console.warn(
        `[KubeQuest] Data version mismatch: stored=${stored}, current=${currentVersion}. Clearing stale keys.`
      );
      for (const key of CLEARABLE_ON_VERSION_BUMP) {
        try { localStorage.removeItem(key); } catch {}
      }
    }

    localStorage.setItem(DATA_VERSION_KEY, String(currentVersion));
  } catch {
    // localStorage entirely unavailable
  }
}

/**
 * Nuclear recovery: clear all KubeQuest data, unregister SW, wipe caches, reload.
 * Used by ErrorBoundary as last resort.
 */
export async function clearAppData() {
  for (const key of KQ_STORAGE_KEYS) {
    try { localStorage.removeItem(key); } catch {}
  }
  try { localStorage.removeItem(DATA_VERSION_KEY); } catch {}
  try { sessionStorage.clear(); } catch {}

  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    } catch {}
  }

  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch {}
  }

  window.location.reload();
}
