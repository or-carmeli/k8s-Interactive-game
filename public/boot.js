// KubeQuest boot script - runs synchronously before React module.
// Combines: boot timestamp, blank-screen safety net, and SW registration.

// ── Boot timestamp ──
window.__KQ_BOOT_TIME__ = Date.now();

// ── Blank-screen safety net ──
// If React never renders visible content within 8 s, show recovery UI.
setTimeout(function () {
  var root = document.getElementById("root");
  if (
    root &&
    (root.children.length === 0 ||
      !root.querySelector("[data-kq-rendered]"))
  ) {
    console.error(
      "[KubeQuest:boot] No visible content after 8 s - children:",
      root.children.length,
      "kq-rendered:",
      !!root.querySelector("[data-kq-rendered]")
    );

    root.innerHTML =
      '<div style="min-height:100vh;background:#020817;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:24px">' +
      '<div style="max-width:420px;text-align:center;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 32px">' +
      '<div style="font-size:48px;margin-bottom:16px">&#9888;&#65039;</div>' +
      '<h1 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:0 0 8px">Loading timed out</h1>' +
      '<p style="color:#94a3b8;font-size:14px;margin:0 0 20px;line-height:1.5">The app did not start. This is usually caused by a stale cache.</p>' +
      '<div style="display:flex;gap:12px;justify-content:center">' +
      '<button id="kq-reload" style="padding:10px 22px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;color:#94a3b8;font-size:14px;font-weight:600;cursor:pointer">Reload</button>' +
      '<button id="kq-clear-reload" style="padding:10px 22px;background:linear-gradient(135deg,rgba(0,212,255,0.18),rgba(168,85,247,0.18));border:1px solid rgba(0,212,255,0.45);border-radius:10px;color:#00D4FF;font-size:14px;font-weight:700;cursor:pointer">Clear Cache &amp; Reload</button>' +
      "</div></div></div>";

    // Attach event listeners (CSP-safe, no inline onclick)
    document.getElementById("kq-reload").addEventListener("click", function () {
      location.reload();
    });
    document
      .getElementById("kq-clear-reload")
      .addEventListener("click", function () {
        localStorage.clear();
        sessionStorage.clear();
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function (r) {
            r.forEach(function (s) {
              s.unregister();
            });
          });
        }
        setTimeout(function () {
          location.reload();
        }, 500);
      });
  }
}, 8000);

// ── Service worker registration ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Track whether we already had a controller (i.e. not first install)
    var hadController = !!navigator.serviceWorker.controller;

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then(function (reg) {
        console.log("SW registered:", reg.scope);
        // Check for updates every 60 s
        setInterval(function () {
          reg.update();
        }, 60000);
      })
      .catch(function (e) {
        console.log("SW error:", e);
      });

    // When a new SW takes control, notify the React app (not on first install)
    var reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (reloading) return;
      reloading = true;
      if (!hadController) {
        console.log("[KubeQuest] SW installed for the first time");
        return;
      }
      console.log("[KubeQuest] New SW activated - dispatching update event");
      window.dispatchEvent(new CustomEvent("kq-sw-updated"));
    });
  });
}
