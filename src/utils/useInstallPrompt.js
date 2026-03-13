import { useState, useEffect, useCallback } from "react";

/**
 * Detects the user's platform from the user-agent string.
 * Used only for showing relevant install instructions first - not for feature gating.
 */
function detectPlatform() {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * Custom hook that encapsulates all PWA install prompt logic.
 *
 * Returns:
 *   platform - "ios" | "android" | "desktop"
 *   isInstalled - true if already running as installed PWA
 *   canPrompt - true if the browser's native install prompt is available
 *   promptInstall() - triggers the native install prompt (only when canPrompt is true)
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    // Check if already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone
    ) {
      setIsInstalled(true);
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    platform,
    isInstalled,
    canPrompt: !!deferredPrompt,
    promptInstall,
  };
}
