import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { safeGetJSON } from "./utils/storage.js";

const STORAGE_KEY = "a11y_v1";

const DEFAULTS = {
  textSize: "default",
  highContrast: false,
  reduceMotion: false,
  largeTapTargets: false,
  focusHighlight: false,
  autoRead: false,
};

function loadInitial() {
  const saved = safeGetJSON(STORAGE_KEY);
  const base = { ...DEFAULTS };

  if (saved) {
    // migrate old shape: fontSize → textSize
    if (saved.fontSize && !saved.textSize) {
      const map = { normal: "default", large: "large", xl: "xlarge" };
      base.textSize = map[saved.fontSize] || "default";
    } else if (saved.textSize) {
      base.textSize = saved.textSize;
    }
    if (typeof saved.highContrast === "boolean") base.highContrast = saved.highContrast;
    if (typeof saved.reduceMotion === "boolean") base.reduceMotion = saved.reduceMotion;
    if (typeof saved.largeTapTargets === "boolean") base.largeTapTargets = saved.largeTapTargets;
    if (typeof saved.focusHighlight === "boolean") base.focusHighlight = saved.focusHighlight;
    if (typeof saved.autoRead === "boolean") base.autoRead = saved.autoRead;
    return base;
  }

  // detect system preferences
  base.reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  base.highContrast = window.matchMedia?.("(prefers-contrast: more)").matches ?? false;
  return base;
}

const A11yContext = createContext({
  a11y: DEFAULTS,
  updateA11y: () => {},
  resetAccessibility: () => {},
});

export function AccessibilityProvider({ children }) {
  const [a11y, setA11y] = useState(loadInitial);

  // sync body data-attributes whenever state changes
  useEffect(() => {
    const b = document.body;
    b.dataset.textSize = a11y.textSize;
    b.dataset.highContrast = String(a11y.highContrast);
    b.dataset.reduceMotion = String(a11y.reduceMotion);
    b.dataset.largeTap = String(a11y.largeTapTargets);
    b.dataset.focusVisible = String(a11y.focusHighlight);
  }, [a11y]);

  // persist to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a11y)); } catch {}
  }, [a11y]);

  const updateA11y = useCallback((key, val) => {
    setA11y(prev => ({ ...prev, [key]: val }));
  }, []);

  const resetAccessibility = useCallback(() => {
    const defaults = { ...DEFAULTS };
    setA11y(defaults);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <A11yContext.Provider value={{ a11y, updateA11y, resetAccessibility }}>
      {children}
    </A11yContext.Provider>
  );
}

export const useAccessibility = () => useContext(A11yContext);
