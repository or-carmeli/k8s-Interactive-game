# Startup Incident Postmortem: Stuck Loading Screen

**Date**: March 2026
**Severity**: High - app unusable for returning users in normal browser profiles
**Status**: Resolved

---

## Summary

KubeQuest users experienced a stuck loading screen (infinite spinner) in their
normal browser profile after deploying new versions. The app worked fine in
Incognito mode and on fresh profiles. Unregistering the Service Worker did not
fix the issue.

## Root Cause

**Supabase v2 auth lock deadlock via the Navigator Web Locks API.**

Supabase v2 (`@supabase/auth-js`) uses `navigator.locks.request()` with an
**infinite timeout** (`acquireTimeout = -1`) for cross-tab auth session
synchronization. The lock name is `lock:sb-{projectRef}-auth-token`.

When a browser tab is closed or crashes while holding this lock, the lock can
become orphaned. On the next page load, Supabase's `initialize()` method calls
`_acquireLock()` which waits **forever** for the orphaned lock to release.
Since `INITIAL_SESSION` only fires after initialization completes, the auth
callback never fires, `authChecked` stays `false`, and the loading gate never
opens.

This explains all observed symptoms:
- **Works in Incognito**: No prior locks exist in a fresh profile.
- **Fails in normal profile**: Orphaned lock from a previous session.
- **Unregistering SW doesn't fix it**: Navigator Locks are independent of
  Service Workers.
- **Happens after repeated refreshes**: Rapid refreshes increase the chance of
  leaving an orphaned lock.

### Contributing Factors

1. **No `getSession()` fallback**: The auth flow relied solely on
   `onAuthStateChange(INITIAL_SESSION)`, which is downstream of the lock.
2. **Stale Supabase auth tokens**: Expired tokens in localStorage caused
   Supabase to attempt token refresh inside the lock, further extending the
   deadlock window.
3. **Service Worker reload during boot**: The SW `updatefound` handler could
   trigger a `location.reload()` during the first seconds of boot, interrupting
   the auth initialization.

### Reference

- <https://github.com/supabase/supabase-js/issues/1594>
- <https://github.com/supabase/supabase-js/issues/2111>
- <https://github.com/supabase/supabase-js/issues/2013>

## Fix

### Primary: Custom Lock Function with Finite Timeout

Pass a custom `lock` function to `createClient()` that wraps
`navigator.locks.request()` with a **5-second max timeout** via
`AbortController`. On timeout, the function proceeds **without the lock**
rather than hanging forever.

```js
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { lock: supabaseLock }
});
```

This is safe because:
- Cross-tab lock coordination is a nice-to-have, not a correctness requirement.
- Running without the lock may cause a brief double-refresh in multi-tab
  scenarios, but will never deadlock.

### Defense-in-Depth Layers (10 total)

| # | Layer | Timeout | What it does |
|---|-------|---------|--------------|
| 1 | `supabaseLock` | 5 s | Custom lock with finite timeout, falls back to no-lock |
| 2 | `createClient({ auth: { lock } })` | - | Wires custom lock into Supabase |
| 3 | Stale token cleanup | - | Clears Supabase auth tokens expired >24h at module load |
| 4 | Auth hard timeout | 3 s | Forces `authChecked=true` if `INITIAL_SESSION` never fires |
| 5 | `loadUserData` guard | 5 s | Prevents concurrent calls, has own timeout |
| 6 | Loading gate safety net | 5 s | Force-unblocks all gate flags, clears stale user |
| 7 | Debug panel | 2 s | Shows gate values + Navigator Lock diagnostics |
| 8 | `data-kq-rendered` attr | - | All 3 render paths (loading/auth/app) set this attribute |
| 9 | HTML safety net | 8 s | Injects recovery UI if React never renders visible content |
| 10 | SW reload deferral | 5 s | Prevents SW-triggered reload during boot |

### Timeout Cascade

```
0 s   createClient() - supabaseLock starts (max 5 s)
0.5 s minLoadElapsed = true
2 s   Debug panel appears on loading screen
3 s   Auth hard timeout fires (if INITIAL_SESSION still pending)
3 s   Recovery buttons appear ("Continue to login" / "Clear data")
5 s   Loading gate safety net fires (nuclear: clears user, forces all flags)
5 s   supabaseLock timeout fires (if lock was stuck)
8 s   HTML safety net fires (if React never rendered anything)
```

## Files Changed

- `src/App.jsx` - Custom `supabaseLock` function, `createClient()` config,
  debug panel with lock diagnostics, stale token cleanup, auth flow rewrite,
  loading gate safety net, `data-kq-rendered` attributes
- `src/main.jsx` - Bootstrap try/catch with fallback UI
- `src/utils/storage.js` - Safe localStorage wrappers, version check, nuclear
  recovery function
- `src/components/ErrorBoundary.jsx` - "Clear app data & reload" recovery
- `index.html` - 8s safety net, SW reload deferral, boot time marker
- `public/sw.js` - Build-stamped cache name, `cache: "no-store"` for
  navigations
- `vite.config.js` - SW cache version stamping plugin
- `vercel.json` - Cache-control headers for `/` and `sw.js`

## Lessons Learned

1. **Third-party libraries can use browser APIs with surprising defaults.**
   Supabase's infinite-timeout Navigator Lock is not documented prominently and
   caused a deadlock that was extremely difficult to diagnose.

2. **"Works in Incognito, fails in normal profile" is a strong signal** for
   persisted browser state issues beyond just localStorage and cookies - 
   Navigator Locks, IndexedDB, Cache Storage, and Web Locks are all candidates.

3. **Defense-in-depth with timeout cascades** ensures that even if the primary
   fix fails, the user sees a recoverable state within seconds rather than a
   permanent blank screen.

4. **A visible debug panel during stuck states** dramatically speeds up
   diagnosis by showing exactly which gate condition is blocking.
