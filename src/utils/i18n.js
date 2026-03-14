// ── i18n utilities - centralized localized content access ────────────────────
//
// Design principles:
// - One helper for all localized content: getLocalized / getLocalizedField
// - Never silently fall back to Hebrew in English mode
// - Dev-mode warnings for missing translations and Hebrew chars in English text
// - Explicit warnIfHebrew for array content (options) checks

const HE_CHARS = /[\u05D0-\u05EA]/;
const IS_DEV = import.meta.env.DEV;

// Track warnings to avoid flooding the console with the same message
const warnedKeys = new Set();

function warnOnce(key, msg) {
  if (!IS_DEV || warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(msg);
}

/**
 * Get localized content by language from a { he, en } object.
 *
 * If the requested language value is missing:
 *   - Logs a warning in dev mode (once per context)
 *   - Falls back to whichever language IS available
 *
 * If lang === "en" and the returned string contains Hebrew characters,
 * logs a dev warning to catch mixed-language bugs.
 *
 * @param {{ he?: any, en?: any } | any} field - bilingual object or passthrough
 * @param {"he"|"en"} lang
 * @param {string} [context] - field name for dev warnings
 * @returns {any}
 */
export function getLocalized(field, lang, context) {
  if (
    field != null &&
    typeof field === "object" &&
    !Array.isArray(field) &&
    ("he" in field || "en" in field)
  ) {
    const val = field[lang];
    if (val == null || val === "") {
      if (lang === "en") {
        warnOnce(
          `missing-en:${context || "?"}`,
          `[i18n] Missing English text${context ? ` for "${context}"` : ""}`
        );
      }
      // Fall back, but we warned - this is not silent
      return field.he ?? field.en;
    }
    // Dev safeguard: warn if English string contains Hebrew characters
    if (lang === "en" && typeof val === "string" && HE_CHARS.test(val)) {
      warnOnce(
        `he-in-en:${context || "?"}:${val.slice(0, 30)}`,
        `[i18n] Hebrew chars in English text${context ? ` (${context})` : ""}: "${val.slice(0, 80)}${val.length > 80 ? "..." : ""}"`
      );
    }
    return val;
  }
  return field;
}

/**
 * Get a localized field from an object, auto-detecting the naming convention.
 *
 * Supports both naming patterns found in the codebase:
 *   - Hebrew-default:  obj.name (he) + obj.nameEn (en)
 *   - English-default: obj.title (en) + obj.titleHe (he)
 *
 * @param {object} obj - source object
 * @param {string} field - base field name
 * @param {"he"|"en"} lang
 * @returns {any}
 */
export function getLocalizedField(obj, field, lang) {
  if (!obj) return undefined;
  const enKey = field + "En";
  const heKey = field + "He";
  if (enKey in obj) {
    // Hebrew-default pattern: field = Hebrew, fieldEn = English
    return getLocalized({ he: obj[field], en: obj[enKey] }, lang, field);
  }
  if (heKey in obj) {
    // English-default pattern: field = English, fieldHe = Hebrew
    return getLocalized({ he: obj[heKey], en: obj[field] }, lang, field);
  }
  return obj[field];
}

/**
 * Dev-mode safeguard: warn if text rendered in English mode contains Hebrew.
 * Use this for array items (options) or values not going through getLocalized.
 *
 * @param {string} text
 * @param {"he"|"en"} lang
 * @param {string} [context]
 */
export function warnIfHebrew(text, lang, context) {
  if (IS_DEV && lang === "en" && typeof text === "string" && HE_CHARS.test(text)) {
    warnOnce(
      `he-detect:${context || "?"}:${text.slice(0, 30)}`,
      `[i18n] Hebrew characters in English mode${context ? ` (${context})` : ""}: "${text.slice(0, 80)}${text.length > 80 ? "..." : ""}"`
    );
  }
}
