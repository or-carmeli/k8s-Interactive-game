import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useTheme } from "./ThemeContext";
import WeakAreaCard from "./components/WeakAreaCard";
import RoadmapView from "./components/RoadmapView";
import { ACHIEVEMENTS } from "./topicMeta";
import { TOPICS } from "./content/topics";
import { DAILY_QUESTIONS } from "./content/dailyQuestions";
import { INCIDENTS } from "./content/incidents";
import { CHEATSHEET } from "./content/cheatsheet";
import { saveQuizState, loadQuizState, clearQuizState, isRecentQuizState } from "./utils/quizPersistence";
import { safeGetItem, safeGetJSON, checkDataVersion } from "./utils/storage";
import { fetchQuizQuestions, fetchMixedQuestions, checkQuizAnswer, fetchTheory, fetchDailyQuestions, checkDailyAnswer, fetchIncidents, fetchIncidentSteps, checkIncidentAnswer, fetchLeaderboard, fetchUserRank } from "./api/quiz";
import { fetchSystemStatus, fetchUptimeHistory, fetchIncidentHistory, fetchMaintenanceWindows } from "./api/monitoring";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom lock function: wraps navigator.locks with a FINITE timeout (5 s).
// Supabase v2 defaults to infinite wait (`acquireTimeout = -1`), which can
// deadlock if a Navigator Lock is orphaned by a crashed/closed tab.
// See: https://github.com/supabase/supabase-js/issues/1594
function supabaseLock(name, acquireTimeout, fn) {
  if (typeof navigator === "undefined" || !navigator.locks) {
    // No Web Locks API. Just run without locking (same as Supabase's fallback)
    return fn();
  }
  // Force a max 5 s timeout regardless of what Supabase requests (-1 = infinite)
  const effectiveTimeout = acquireTimeout <= 0 ? 5000 : Math.min(acquireTimeout, 10000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), effectiveTimeout);
  return navigator.locks.request(name, { signal: controller.signal }, async (lock) => {
    clearTimeout(timer);
    if (!lock) throw new Error("Lock not available");
    return await fn();
  }).catch((err) => {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      console.warn(`[KubeQuest] Lock "${name}" timed out after ${effectiveTimeout}ms. Proceeding without lock`);
      // Run without lock to avoid deadlock. Better than hanging forever
      return fn();
    }
    throw err;
  });
}

const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { lock: supabaseLock }
}) : null;
if (!supabase) console.warn("[KubeQuest] Supabase not configured. VITE_SUPABASE_URL:", !!SUPABASE_URL, "VITE_SUPABASE_ANON_KEY:", !!SUPABASE_KEY);

// Run version check before any component mounts. Clears stale keys if data version changed
console.info("[KubeQuest:boot] App.jsx module executing");
checkDataVersion();

// Proactively check Supabase auth token: if the stored session has an expired refresh token,
// clear it now to prevent createClient/getSession from hanging on a doomed refresh attempt.
try {
  const sbUrl = SUPABASE_URL || "";
  const projRef = sbUrl.replace("https://","").split(".")[0];
  if (projRef) {
    const sbKey = `sb-${projRef}-auth-token`;
    const raw = localStorage.getItem(sbKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const expiresAt = parsed?.expires_at; // Unix timestamp (seconds)
      if (expiresAt && expiresAt < Date.now() / 1000 - 86400) {
        // Token expired >24h ago. The refresh token is almost certainly dead too
        console.warn("[KubeQuest:boot] Clearing stale Supabase auth token (expired", Math.round((Date.now()/1000 - expiresAt)/3600), "h ago)");
        localStorage.removeItem(sbKey);
      }
    }
  }
} catch { /* ignore. Token check is best-effort */ }
console.info(
  `[KubeQuest] build: ${typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "dev"}` +
  ` | data-v: ${typeof __APP_DATA_VERSION__ !== "undefined" ? __APP_DATA_VERSION__ : "dev"}` +
  ` | SW: ${"serviceWorker" in navigator ? "supported" : "unsupported"}`
);
console.info("[KubeQuest:boot] App.jsx module-level init complete");

const GUEST_USER = { id: "guest", email: "guest", user_metadata: { username: "Guest" } };

const LEVEL_CONFIG = {
  easy:   { label: "קל",        labelEn: "Easy",             icon: "⚡", color: "#10B981", points: 10 },
  medium: { label: "בינוני",    labelEn: "Medium",           icon: "🔶", color: "#F59E0B", points: 20 },
  hard:   { label: "קשה",      labelEn: "Hard",             icon: "🔥", color: "#EF4444", points: 30 },
  mixed:  { label: "מיקס",     labelEn: "Mixed",            icon: "🎲", color: "#A855F7", points: 15 },
  daily:  { label: "אתגר יומי", labelEn: "Daily Challenge",  icon: "🔥", color: "#F59E0B", points: 15 },
};

const LEVEL_ORDER = ["easy", "medium", "hard"];

// Incident mode difficulty colours (intentionally separate from LEVEL_CONFIG)
const INCIDENT_DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   labelHe: "קל",    color: "#10B981" },
  medium: { label: "Medium", labelHe: "בינוני", color: "#F59E0B" },
  hard:   { label: "Hard",   labelHe: "קשה",   color: "#EF4444" },
};

const INCIDENT_SAVE_KEY = "incident_progress_v1";
// v2.0.0: major: portfolio repo refactor (BSL 1.1, proprietary content extracted)
// v2.1.0: security hardening, scoring fixes, question rebalance, incident history
// v2.2.0: real-time monitoring system (health checks, uptime history, auto-incidents)
// v2.3.0: startup resilience (SW cache, localStorage defence, Supabase lock fix, NaN guards)
// v2.4.0: analytics events, RTL fixes (hyphens, arrows), quiz UX improvements, score display cleanup
const APP_VERSION  = "2.4.0";
const SESSION_START = new Date();

// Resume modal behaviour constants
const RESUME_SESSION_KEY  = "resumeModalSeen";       // sessionStorage: shown once per tab
const RESUME_DISMISS_KEY  = "resumeDismissedAt";     // localStorage: cooldown timestamp
const RESUME_COOLDOWN_MS  = 10 * 60 * 1000;         // 10-minute cooldown after dismiss
const RESUME_MIN_PROGRESS = 0;                        // any answered question → offer resume

const MIXED_TOPIC     = { id: "mixed",     icon: "🎲", name: "Mixed Quiz",        color: "#A855F7", levels: {} };
const DAILY_TOPIC     = { id: "daily",     icon: "🔥", name: "Daily Challenge",    color: "#F59E0B", levels: {} };
const BOOKMARKS_TOPIC = { id: "bookmarks", icon: "🔖", name: "Saved Questions",    color: "#A855F7", levels: {} };

function formatIncidentTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getTodayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function makeQuestionId(topicId, level, qIdx) { return `${topicId}|${level}|${qIdx}`; }

// ── Deterministic daily randomisation ────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TRANSLATIONS = {
  he: {
    tagline: "למדי Kubernetes בצורה כיפית ואינטראקטיבית",
    startPlaying: "⚡ התחילי לשחק עכשיו",
    noRegNoPass: "ללא הרשמה · ללא סיסמה · מיידי",
    saveProgress: "רוצה לשמור את ההתקדמות?",
    username: "שם משתמש", email: "אימייל", password: "סיסמה",
    loginTab: "התחברות", signupTab: "הרשמה",
    loginBtn: "התחברי", signupBtn: "הירשמי", loading: "⏳ רגע...",
    emailAlreadySent: "✅ אימייל אימות כבר נשלח! בדקי את תיבת הדואר שלך.",
    emailSent: "✅ נשלח אימייל אימות! בדקי את תיבת הדואר.",
    otpExpired: "❌ קישור האימות פג תוקף. אנא הירשמי שוב כדי לקבל קישור חדש.",
    wrongCredentials: "אימייל או סיסמה שגויים",
    serviceUnavailable: "השירות אינו זמין כרגע. נסו שוב מאוחר יותר.",
    didntReceive: "לא קיבלת את המייל?", resendBtn: "שלח שוב",
    resendSuccess: "✅ אימייל חדש נשלח! בדקי את תיבת הדואר.",
    resendError: "❌ שגיאה בשליחה מחדש. נסי שוב.",
    forgotPassword: "שכחת סיסמה?",
    resetEmailSent: "✅ נשלח קישור לאיפוס סיסמה! בדקי את תיבת הדואר.",
    resetEmailError: "❌ שגיאה בשליחת קישור איפוס. נסי שוב.",
    sendResetLink: "שלחי קישור איפוס",
    resetPasswordTitle: "איפוס סיסמה",
    greeting: "שלום", playingAsGuest: "· משחקת כאורחת",
    leaderboardBtn: "🏆 דירוג", logout: "יציאה",
    guestBanner: "💡 הירשמי כדי לשמור התקדמות ולהופיע בלוח התוצאות",
    signupNow: "הירשמי",
    score: "XP", accuracy: "דיוק", streak: "Combo", completed: "הושלמו",
    scoreSub: "XP מכל החידונים", accuracySub: "אחוז תשובות נכונות", streakSub: "תשובות נכונות ברצף", completedSub: "רמות שהושלמו",
    leaderboardRankedBy: "מדורג לפי סך הנקודות שנצברו", leaderboardScoreCol: "סה״כ נק׳",
    completionNoImprovement: "התוצאה הטובה שלך בנושא הזה כבר גבוהה יותר", completionAdded: "נוספו לסך שלך",
    freeModeBadge: "סבב בונוס: צוברים נקודות!", freeModeTag: "בונוס",
    pts: "נק׳",
    achievementsTitle: "🏅 הישגים",
    leaderboardTitle: "🏆 לוח תוצאות", noData: "אין נתונים עדיין", anonymous: "אנונימי",
    back: "→ חזרה", theory: "📖 תיאוריה",
    startQuiz: "🎯 התחילי חידון!", ptsPerQ: "נק׳ לשאלה",
    question: "שאלה", of: "/", streakLabel: "רצף",
    confirmAnswer: "✔ אשרי תשובה",
    correct: "✅ נכון!", incorrect: "❌ לא נכון",
    finishTopic: "🎉 סיימי נושא!", nextQuestion: "שאלה הבאה ←",
    correctCount: "נכון", perfect: "מושלם!", points: "נקודות",
    guestSaveHint: "💡 הירשמי כדי לשמור את הניקוד!", signupLink: "הירשמי עכשיו",
    tryAgain: "נסי שוב", restartFullQuiz: "🔄 שחקי מחדש את כל החידון", backToTopics: "חזרי לנושאים",
    nextLevelBtn: "המשיכי לרמה הבאה", locked: "🔒 נעול", completePrevLevel: "סיימו את הרמה הקודמת",
    skipTheory: "⚡ דלגי לחידון",
    timerOn: "⏱ כבי טיימר", timerOff: "⏱ הפעילי טיימר", timeUp: "⏰ הזמן נגמר!",
    reviewBtn: "צפי בסקירה", hideReview: "הסתירי סקירה", reviewTitle: "סקירת שאלות",
    loadingText: "טוען...",
    saveErrorText: "⚠️ הנתונים לא נשמרו – בדקי חיבור לאינטרנט",
    newAchievement: "הישג חדש!", allRightsReserved: "כל הזכויות שמורות ל",
    optionLabels: ["א","ב","ג","ד"], guestName: "אורחת",
    resetProgress: "אפסי התקדמות", resetConfirm: "האם את בטוחה? פעולה זו תמחק את כל ההתקדמות ולא ניתן לבטלה.",
    resetTopic: "אפסי נושא", resetTopicConfirm: "לאפס את ההתקדמות בנושא זה?",
    mixedQuizBtn: "🎲 חידון מיקס", mixedQuizDesc: "10 שאלות אקראיות מכל הנושאים",
    tabTopics: "📚 נושאים", tabRoadmap: "🗺️ מסלול",
    interviewMode: "🎯 מצב ראיון", interviewModeHint: "רמזים כבויים, יש טיימר לכל שאלה",
    dailyChallengeTitle: "אתגר יומי", dailyChallengeNew: "חדש היום",
    dailyChallengeDesc: "5 שאלות מכל הנושאים · מתחלף כל יום",
    roadmapTitle: "ההתקדמות במסלול",
    roadmapAllDone: "🎉 השלמת את כל השלבים!",
    roadmapStage: "את בשלב", roadmapStageOf: "מתוך",
    roadmapCompletedPct: "הושלם",
    roadmapStart: "🗺️ התחילי את המסלול",
    roadmapStartHere: "התחילי כאן",
    roadmapContinue: "▶ המשיכי לשלב הבא",
    roadmapLocked: "🔒 נפתח אחרי השלמת השלב הקודם",
    roadmapDone: "✅ הושלם",
    roadmapContinueHere: "המשיכי מכאן",
    weakAreaTitle: "📉 האזור החלש שלך",
    weakAreaEmpty: "עדיין אין מספיק נתונים, התחילי לענות כדי שנמליץ מה לחזק.",
    allPerfectTitle: "🔥 הכל בשליטה",
    allPerfectMsg: "כל הנושאים עם דיוק מלא. רוצי להמשיך לאתגר הבא?",
    advancedPractice: "לתרגול מתקדם",
    accuracyLabel: "דיוק",
    goBackToTopic: "חזרי לנושא הזה",
    a11yTitle: "♿ נגישות", a11yFontSize: "גודל טקסט", a11yReduceMotion: "הפחת תנועה", a11yHighContrast: "ניגודיות גבוהה",
    readQuestion: "🔊 קראי שאלה", stopSpeech: "⏹ עצרי", autoRead: "קריאה אוטומטית",
    hint: "💡 רמז", eliminate: "❌ הסרי תשובה שגויה",
    shareResult: "שתפי תוצאה",
    readQuestion_m: "🔊 קרא שאלה", stopSpeech_m: "⏹ עצור", autoRead_m: "קריאה אוטומטית",
    hint_m: "💡 רמז", eliminate_m: "❌ הסר תשובה שגויה",
    shareResult_m: "שתף תוצאה",
    // Male-form overrides (used when gender === "m")
    tagline_m: "למד Kubernetes בצורה כיפית ואינטראקטיבית",
    startPlaying_m: "⚡ התחל לשחק עכשיו",
    loginBtn_m: "התחבר", signupBtn_m: "הירשם",
    emailAlreadySent_m: "✅ אימייל אימות כבר נשלח! בדוק את תיבת הדואר שלך.",
    otpExpired_m: "❌ קישור האימות פג תוקף. אנא הירשם שוב כדי לקבל קישור חדש.",
    resendSuccess_m: "✅ אימייל חדש נשלח! בדוק את תיבת הדואר.",
    resendError_m: "❌ שגיאה בשליחה מחדש. נסה שוב.",
    sendResetLink_m: "שלח קישור איפוס",
    resetEmailSent_m: "✅ נשלח קישור לאיפוס סיסמה! בדוק את תיבת הדואר.",
    resetEmailError_m: "❌ שגיאה בשליחת קישור איפוס. נסה שוב.",
    playingAsGuest_m: "· משחק כאורח",
    guestBanner_m: "💡 הרשם כדי לשמור התקדמות ולהופיע בלוח התוצאות",
    signupNow_m: "הרשם",
    back_m: "→ חזרה",
    startQuiz_m: "🎯 התחל חידון!",
    confirmAnswer_m: "✔ אשר תשובה",
    finishTopic_m: "🎉 סיים נושא!",
    guestSaveHint_m: "💡 הרשם כדי לשמור את הניקוד!", signupLink_m: "הרשם עכשיו",
    tryAgain_m: "נסה שוב", restartFullQuiz_m: "🔄 שחק מחדש את כל החידון", backToTopics_m: "חזור לנושאים",
    nextLevelBtn_m: "המשך לרמה הבאה",
    skipTheory_m: "⚡ דלג לחידון",
    timerOn_m: "⏱ כבה טיימר", timerOff_m: "⏱ הפעל טיימר",
    reviewBtn_m: "צפה בסקירה", hideReview_m: "הסתר סקירה",
    saveErrorText_m: "⚠️ הנתונים לא נשמרו – בדוק חיבור לאינטרנט",
    guestName_m: "אורח",
    resetProgress_m: "אפס התקדמות", resetConfirm_m: "האם אתה בטוח? פעולה זו תמחק את כל ההתקדמות ולא ניתן לבטלה.",
    resetTopic_m: "אפס נושא",
    allPerfectMsg_m: "כל הנושאים עם דיוק מלא. רוצה להמשיך לאתגר הבא?",
    roadmapStage_m: "אתה בשלב",
    roadmapStart_m: "התחל את המסלול",
    roadmapStartHere_m: "התחל כאן",
    roadmapContinue_m: "▶ המשך לשלב הבא",
    roadmapContinueHere_m: "המשך מכאן",
    weakAreaEmpty_m: "עדיין אין מספיק נתונים, התחל לענות כדי שנמליץ מה לחזק.",
    goBackToTopic_m: "חזור לנושא הזה",
    resumeTitle: "המשך חידון?", resumeTitle_m: "המשך חידון?",
    resumeBody: "נמצא חידון שלא הסתיים. רוצה להמשיך מאיפה שהפסקת?",
    resumeBody_m: "נמצא חידון שלא הסתיים. רוצה להמשיך מאיפה שהפסקת?",
    resumeBtn: "המשיכי", resumeBtn_m: "המשך",
    resumeHint: "החידון ייפתח מהשאלה שבה עצרת", resumeHint_m: "החידון ייפתח מהשאלה שבה עצרת",
    resumeToast: "ממשיכים מאיפה שהפסקת.", resumeToast_m: "ממשיכים מאיפה שהפסקת.",
    resumeDiscard: "התחילי מחדש", resumeDiscard_m: "התחל מחדש",
    prevQuestion: "→ שאלה קודמת", backToCurrent: "→ חזרי לחידון", backToCurrent_m: "→ חזור לחידון",
    reviewing: "📖 סקירה",
    tryAgainBtn: "🔁 נסי שוב", tryAgainBtn_m: "🔁 נסה שוב",
    tryAgainBadge: "לא נספר לניקוד",
    tryAgainCorrect: "✅ נכון! כל הכבוד",
    tryAgainWrong: "❌ לא נכון",
    exitTryAgain: "חזרי לסקירה", exitTryAgain_m: "חזור לסקירה",
    incidentModeBtn: "🚨 מצב אירוע", incidentModeDesc: "הדמיית אירועי Kubernetes אמיתיים",
    incidentModeBtn_m: "🚨 מצב אירוע",
    incidentListTitle: "בחר אירוע",
    incidentDifficulty: "רמה", incidentSteps: "שלבים", incidentEstTime: "זמן משוער",
    incidentStep: "שלב", incidentScore: "ניקוד", incidentMistakes: "שגיאות", incidentTime: "זמן",
    incidentConfirm: "✔ אשר פעולה", incidentNext: "→ שלב הבא", incidentFinish: "→ סיים אירוע",
    incidentResolved: "האירוע נפתר! 🎉",
    incidentResolved_m: "האירוע נפתר! 🎉",
    incidentCorrect: "✅ נכון!", incidentWrong: "❌ לא נכון",
    incidentTryAnother: "נסי אירוע אחר", incidentTryAnother_m: "נסה אירוע אחר",
    incidentShareBtn: "🔗 שתפי תוצאה", incidentShareBtn_m: "🔗 שתף תוצאה",
    incidentShareCopied: "✓ הועתק! הדבק ב-LinkedIn",
    incidentResumeBanner: "המשיכי את האירוע", incidentResumeBanner_m: "המשך את האירוע",
    incidentDiscard: "נטשי", incidentDiscard_m: "נטוש",
    incidentActiveLabel: "אירוע פעיל", incidentAvailableLabel: "אירועים זמינים",
    incidentHeaderSub: "תרגלו תרחישי Troubleshooting אמיתיים ב-Kubernetes.\nחקרו סימפטומים, זהו את שורש הבעיה ופתרו את האירוע.",
    incidentResumeBtn: "המשיכי את האירוע", incidentResumeBtn_m: "המשך את האירוע",
    reportBtn: "⚑ דווחי על שגיאה", reportBtn_m: "⚑ דווח על שגיאה",
    reportTitle: "דיווח על שגיאה בשאלה",
    reportType1: "התשובה הנכונה שגויה", reportType2: "השאלה לא ברורה",
    reportType3: "שגיאת כתיב/דקדוק",  reportType4: "אחר",
    reportNote: "הערה נוספת (לא חובה)",
    reportSend: "שלחי דיווח", reportSend_m: "שלח דיווח",
    reportThanks: "✓ תודה! הדיווח נשלח.",
    reportCancel: "ביטול",
    savedQuestions: "📌 שאלות שמורות", savedQuestionsTitle: "שאלות שמורות",
    noBookmarks: "עוד לא שמרת שאלות. לחצי על ☆ בזמן חידון כדי לשמור.",
    noBookmarks_m: "עוד לא שמרת שאלות. לחץ על ☆ בזמן חידון כדי לשמור.",
    startSavedQuiz: "▶ תרגלי שאלות שמורות", startSavedQuiz_m: "▶ תרגל שאלות שמורות",
    removeBookmark: "הסרי", removeBookmark_m: "הסר",
    bookmark: "☆ שמרי", bookmarkActive: "★ שמורה",
    bookmark_m: "☆ שמור", bookmarkActive_m: "★ שמור",
    searchBtn: "🔎 חיפוש שאלה", searchPlaceholder: "חפשי לפי מילת מפתח...", searchNoResults: "לא נמצאו תוצאות",
    mistakesBtn: "❌ טעויות שלי", mistakesEmpty: "אין טעויות! כל הכבוד 🎉", mistakesHint: "שאלות שטעית בהן",
    guideBtn: "📘 פקודות", guideSub: "פקודות kubectl מוכנות להעתקה. לחצו לפתיחה", aboutBtn: "ℹ️ אודות האפליקציה",
    shareBtn: "📤 שתפי עם חבר", shareBtn_m: "📤 שתף עם חבר",
    dailyStreak: "ימים ברצף",
  },
  en: {
    tagline: "Learn Kubernetes in a fun and interactive way",
    startPlaying: "⚡ Start Playing Now",
    noRegNoPass: "No registration · No password · Instant",
    saveProgress: "Want to save your progress?",
    username: "Username", email: "Email", password: "Password",
    loginTab: "Login", signupTab: "Sign Up",
    loginBtn: "Sign In", signupBtn: "Register", loading: "⏳ Loading...",
    emailAlreadySent: "✅ Verification email already sent! Check your inbox.",
    emailSent: "✅ Verification email sent! Check your inbox.",
    otpExpired: "❌ Verification link has expired. Please sign up again to receive a new link.",
    wrongCredentials: "Incorrect email or password",
    serviceUnavailable: "Service temporarily unavailable. Please try again later.",
    didntReceive: "Didn't receive the email?", resendBtn: "Resend",
    resendSuccess: "✅ New email sent! Check your inbox.",
    resendError: "❌ Failed to resend. Please try again.",
    forgotPassword: "Forgot password?",
    resetEmailSent: "✅ Password reset link sent! Check your inbox.",
    resetEmailError: "❌ Failed to send reset link. Please try again.",
    sendResetLink: "Send reset link",
    resetPasswordTitle: "Reset Password",
    greeting: "Hello", playingAsGuest: "· Playing as guest",
    leaderboardBtn: "🏆 Leaderboard", logout: "Logout",
    guestBanner: "💡 Sign up to save progress and appear on the leaderboard",
    signupNow: "Sign Up",
    score: "XP", accuracy: "Accuracy", streak: "Combo", completed: "Completed",
    scoreSub: "XP from all quizzes", accuracySub: "Overall correct rate", streakSub: "Correct answers in a row", completedSub: "Topic-levels passed",
    leaderboardRankedBy: "Ranked by total accumulated points", leaderboardScoreCol: "Total Pts",
    completionNoImprovement: "Your best result for this topic was already higher", completionAdded: "added to your total",
    freeModeBadge: "Bonus round: earns points!", freeModeTag: "Bonus",
    pts: "pts",
    achievementsTitle: "🏅 Achievements",
    leaderboardTitle: "🏆 Leaderboard", noData: "No data yet", anonymous: "Anonymous",
    back: "← Return", theory: "📖 Theory",
    startQuiz: "🎯 Start Quiz!", ptsPerQ: "pts per question",
    question: "Question", of: "/", streakLabel: "Streak",
    confirmAnswer: "✔ Confirm Answer",
    correct: "✅ Correct!", incorrect: "❌ Incorrect",
    finishTopic: "🎉 Finish Topic!", nextQuestion: "Next Question →",
    correctCount: "correct", perfect: "Perfect!", points: "points",
    guestSaveHint: "💡 Sign up to save your score!", signupLink: "Sign up now",
    tryAgain: "Try Again", restartFullQuiz: "Restart Full Quiz", backToTopics: "Back to Topics",
    nextLevelBtn: "Next Level", locked: "🔒 Locked", completePrevLevel: "Complete previous level",
    skipTheory: "⚡ Skip to Quiz",
    timerOn: "⏱ Timer On", timerOff: "⏱ Timer Off", timeUp: "⏰ Time's Up!",
    reviewBtn: "View Review", hideReview: "Hide Review", reviewTitle: "Question Review",
    loadingText: "Loading...",
    saveErrorText: "⚠️ Data not saved – check your internet connection",
    newAchievement: "New Achievement!", allRightsReserved: "All rights reserved to",
    optionLabels: ["A","B","C","D"], guestName: "Guest",
    resetProgress: "Reset Progress", resetConfirm: "Are you sure? This will erase all your progress and cannot be undone.",
    resetTopic: "Reset Topic", resetTopicConfirm: "Reset progress for this topic?",
    mixedQuizBtn: "🎲 Mixed Quiz", mixedQuizDesc: "10 random questions from all topics",
    roadmapTitle: "Roadmap Progress",
    roadmapAllDone: "🎉 You completed all stages!",
    roadmapStage: "You're on stage", roadmapStageOf: "of",
    roadmapCompletedPct: "completed",
    roadmapStart: "▶ Start Roadmap",
    roadmapStartHere: "Start here",
    roadmapContinue: "▶ Continue to Next Stage",
    roadmapLocked: "🔒 Unlocks after completing the previous stage",
    roadmapDone: "✅ Completed",
    roadmapContinueHere: "Continue from here",
    weakAreaTitle: "📉 Your Weak Area",
    weakAreaEmpty: "Not enough data yet, start answering to get recommendations.",
    allPerfectTitle: "🔥 All Under Control",
    allPerfectMsg: "All topics at 100% accuracy. Ready for the next challenge?",
    advancedPractice: "Advanced Practice",
    accuracyLabel: "accuracy",
    goBackToTopic: "Go back to this topic",
    tabTopics: "📚 Topics", tabRoadmap: "🗺️ Roadmap",
    interviewMode: "🎯 Interview Mode", interviewModeHint: "Hints off, timer on for every question",
    dailyChallengeTitle: "Daily Challenge", dailyChallengeNew: "NEW DAILY",
    dailyChallengeDesc: "5 mixed questions · resets every day",
    a11yTitle: "♿ Accessibility", a11yFontSize: "Text Size", a11yReduceMotion: "Reduce Motion", a11yHighContrast: "High Contrast",
    readQuestion: "🔊 Read Question", stopSpeech: "⏹ Stop", autoRead: "Auto Read",
    hint: "💡 Hint", eliminate: "❌ Eliminate Wrong",
    shareResult: "Share Result",
    resumeTitle: "Resume Quiz?",
    resumeBody: "You have an unfinished quiz. Continue where you left off?",
    resumeBtn: "Continue",
    resumeHint: "You'll pick up from the exact question you stopped at",
    resumeToast: "Resuming your quiz where you left off.",
    resumeDiscard: "Start Fresh",
    prevQuestion: "← Previous Question", backToCurrent: "Back to Quiz →",
    reviewing: "📖 Review",
    tryAgainBtn: "🔁 Try Again",
    tryAgainBadge: "Won't count toward score",
    tryAgainCorrect: "✅ Correct! Well done",
    tryAgainWrong: "❌ Incorrect",
    exitTryAgain: "Back to Review",
    incidentModeBtn: "🚨 Incident Mode", incidentModeDesc: "Simulate real K8s production incidents",
    incidentListTitle: "Choose an Incident",
    incidentDifficulty: "Difficulty", incidentSteps: "steps", incidentEstTime: "Est. time",
    incidentStep: "Step", incidentScore: "Score", incidentMistakes: "Mistakes", incidentTime: "Time",
    incidentConfirm: "✔ Confirm Action", incidentNext: "Next Step →", incidentFinish: "Resolve Incident →",
    incidentResolved: "🎉 Incident Resolved!",
    incidentCorrect: "✅ Correct!", incidentWrong: "❌ Wrong",
    incidentTryAnother: "Try Another Incident",
    incidentShareBtn: "🔗 Share Result",
    incidentShareCopied: "✓ Copied! Paste in LinkedIn",
    incidentResumeBanner: "Continue Incident",
    incidentDiscard: "Discard",
    incidentActiveLabel: "Active Incident", incidentAvailableLabel: "Available Incidents",
    incidentHeaderSub: "Practice real Kubernetes troubleshooting scenarios.\nInvestigate symptoms, identify the root cause, and resolve the incident.",
    incidentResumeBtn: "Resume Incident",
    reportBtn: "⚑ Report an error",
    reportTitle: "Report a question error",
    reportType1: "Wrong answer marked correct", reportType2: "Question is unclear",
    reportType3: "Typo / grammar error",        reportType4: "Other",
    reportNote: "Additional note (optional)",
    reportSend: "Send report",
    reportThanks: "✓ Thanks! Report sent.",
    reportCancel: "Cancel",
    savedQuestions: "📌 Saved Questions", savedQuestionsTitle: "Saved Questions",
    noBookmarks: "No saved questions yet. Tap ☆ during a quiz to save one.",
    startSavedQuiz: "▶ Practice Saved Questions",
    removeBookmark: "Remove",
    bookmark: "☆ Save", bookmarkActive: "★ Saved",
    searchBtn: "🔎 Search Question", searchPlaceholder: "Search by keyword...", searchNoResults: "No results found",
    mistakesBtn: "❌ My Mistakes", mistakesEmpty: "No mistakes! Great job 🎉", mistakesHint: "Questions you answered incorrectly",
    guideBtn: "📘 Commands", guideSub: "Copy-ready kubectl commands. Tap to expand", aboutBtn: "ℹ️ About the App",
    shareBtn: "📤 Share with a Friend",
    dailyStreak: "day streak",
  },
};

const year = new Date().getFullYear();
const TIMER_DURATIONS    = { easy: 45, medium: 60, hard: 75, mixed: 60, daily: 60 };
const INTERVIEW_DURATIONS = { easy: 30, medium: 45, hard: 55, mixed: 35, daily: 35 };

function Confetti() {
  const colors = ["#00D4FF","#A855F7","#FF6B35","#10B981","#F59E0B","#EC4899"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9000,overflow:"hidden"}}>
      {Array.from({length:60},(_,i)=>{
        const color=colors[i%colors.length];
        const left=Math.round(Math.random()*100);
        const delay=(Math.random()*2).toFixed(2);
        const size=6+Math.round(Math.random()*8);
        const dur=(2+Math.random()*2).toFixed(2);
        const isCircle=Math.random()>0.5;
        return <div key={i} style={{position:"absolute",left:`${left}%`,top:"-20px",width:size,height:size,background:color,borderRadius:isCircle?"50%":"2px",animation:`confettiFall ${dur}s ${delay}s ease-in both`}}/>;
      })}
    </div>
  );
}

function LangSwitcher({ lang, setLang }) {
  return (
    <select value={lang} onChange={e => setLang(e.target.value)}
      style={{background:"var(--glass-4)",border:"1px solid var(--glass-12)",borderRadius:8,color:"var(--text-secondary)",padding:"6px 10px",fontSize:13,cursor:"pointer",direction:"ltr"}}>
      <option value="he">🇮🇱 עברית</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );
}

function GenderToggle({ gender, setGender }) {
  return (
    <div style={{display:"flex",gap:3,background:"var(--glass-4)",border:"1px solid var(--glass-12)",borderRadius:8,padding:2}}>
      {[{v:"f",label:"♀"},{v:"m",label:"♂"}].map(({v,label}) => (
        <button key={v} onClick={()=>setGender(v)}
          style={{width:34,height:30,padding:0,border:"none",borderRadius:6,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"Arial,sans-serif",fontSize:16,lineHeight:"1",
            background:gender===v?"rgba(0,212,255,0.15)":"transparent",
            color:gender===v?"#00D4FF":"var(--text-muted)",fontWeight:gender===v?700:400}}>
          {label}
        </button>
      ))}
    </div>
  );
}

const hasHebrew = (text) => /[\u05D0-\u05EA]/.test(text ?? "");

// Render a question text that may contain \n\n paragraphs and code blocks.
// Paragraphs with inner \n are rendered as monospace code blocks.
function renderQuestion(qText, lang) {
  if (!qText) return null;
  const paragraphs = qText.split(/\n\n+/);
  if (paragraphs.length <= 1) {
    const qDir = hasHebrew(qText) ? (lang === "he" ? "rtl" : "ltr") : "ltr";
    return (
      <div dir={qDir} style={{color:"var(--text-primary)",fontSize:18,fontWeight:700,lineHeight:1.65,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:qDir==="ltr"?"left":"right",unicodeBidi:"isolate"}}>
        {lang==="he"?renderBidi(qText,lang):renderBidiInner(qText,lang,"q")}
      </div>
    );
  }
  const terminalPat = /^(kubectl|NAME\s|READY|STATUS\s|\s{2,}|[a-z0-9]+(-[a-z0-9]+)+\s|FATAL|Error:|Failed|rpc error|unauthorized|Events:|Warning\s|Normal\s|\d+\/\d+\s|\d+[a-z]*\s{2,})/;
  // Pre-process: merge fenced code blocks (```...```) that may have been split across paragraphs
  const merged = [];
  let inFence = false, fenceBuf = [];
  for (const para of paragraphs) {
    if (!inFence && para.trimStart().startsWith("```")) {
      // Check if fence opens and closes in same paragraph
      const fenceCount = (para.match(/```/g) || []).length;
      if (fenceCount >= 2) { merged.push(para); continue; }
      inFence = true; fenceBuf = [para]; continue;
    }
    if (inFence) {
      fenceBuf.push(para);
      if (para.trim().startsWith("```") || para.trim().endsWith("```")) {
        merged.push(fenceBuf.join("\n\n")); inFence = false; fenceBuf = [];
      }
      continue;
    }
    merged.push(para);
  }
  if (fenceBuf.length) merged.push(fenceBuf.join("\n\n"));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {merged.map((para, idx) => {
        // Fenced code block (```...```)
        if (para.trimStart().startsWith("```")) {
          const code = para.replace(/^```[a-z]*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
          return (
            <pre key={idx} style={{margin:0,background:"var(--code-bg)",border:"1px solid var(--glass-7)",borderRadius:10,padding:"14px 16px",fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",fontSize:12.5,color:"var(--code-text)",overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word",textAlign:"left",direction:"ltr",unicodeBidi:"plaintext",lineHeight:1.7}}>
              {code}
            </pre>
          );
        }
        const lines = para.split("\n");
        const nonEmpty = lines.filter(l => l.trim());
        const matchCount = nonEmpty.filter(l => !hasHebrew(l) && terminalPat.test(l)).length;
        const noHebrew = nonEmpty.every(l => !hasHebrew(l));
        const isCode = noHebrew && nonEmpty.length >= 1 && matchCount >= Math.ceil(nonEmpty.length * 0.5);
        if (isCode) {
          return (
            <pre key={idx} style={{margin:0,background:"var(--code-bg)",border:"1px solid var(--glass-8)",borderRadius:10,padding:"14px 16px",fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",fontSize:12.5,color:"var(--code-text)",overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word",textAlign:"left",direction:"ltr",unicodeBidi:"plaintext",lineHeight:1.7}}>
              {para.replace(/^["״"]+|["״"]+$/g, "").trim()}
            </pre>
          );
        }
        const isLast = idx === paragraphs.length - 1;
        const pDir = hasHebrew(para) ? (lang === "he" ? "rtl" : "ltr") : "ltr";
        return (
          <div key={idx} dir={pDir} style={{color:"var(--text-primary)",fontSize:isLast?18:15,fontWeight:isLast?700:400,lineHeight:1.65,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:pDir==="ltr"?"left":"right",unicodeBidi:"isolate"}}>
            {lang==="he"?renderBidi(para,lang):renderBidiInner(para,lang,`p${idx}`)}
          </div>
        );
      })}
    </div>
  );
}

// Shuffle quiz options while tracking the index mapping.
// _optionMap[shuffledIdx] = originalIdx. Used to translate back for server-side validation.
// When q.answer exists (offline mode), it is also remapped to the shuffled position.
function shuffleOptions(questions) {
  return questions.map(q => {
    if (!q.options || q.options.length <= 1) return { ...q, _optionMap: q.options?.map((_, i) => i) || [], _correctText: typeof q.answer === "number" ? q.options[q.answer] : undefined };
    // Capture correct answer text BEFORE shuffling for runtime consistency checks
    const correctText = typeof q.answer === "number" ? q.options[q.answer] : undefined;
    const indices = q.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const result = { ...q, options: indices.map(i => q.options[i]), _optionMap: indices, _correctText: correctText };
    if (typeof q.answer === "number") {
      result.answer = indices.indexOf(q.answer);
      // Verify shuffle consistency: answer text must match after remap
      if (result.options[result.answer] !== correctText) {
        console.error("[QUIZ_DEBUG] SHUFFLE MISMATCH!", { original: q.options, shuffled: result.options, originalAnswer: q.answer, remappedAnswer: result.answer, expectedText: correctText, actualText: result.options[result.answer] });
      }
    }
    return result;
  });
}

// Kubernetes concept terms - highlighted as concept tags (not code).
// These are K8s resource types, states, and service types.
const K8S_CONCEPT_TERMS = new Set([
  // Core resource types
  "pod","node","namespace","deployment","replicaset",
  "statefulset","daemonset","job","cronjob","configmap","secret",
  "ingress","networkpolicy","serviceaccount",
  "service","endpoint","endpoints","selector","label","labels",
  "annotation","annotations","taint","taints","toleration","tolerations",
  "affinity","container","containers","volume","volumes",
  "probe","livenessprobe","readinessprobe","startupprobe",
  // Plurals of common resources
  "replicasets","deployments","services","nodes","namespaces",
  // Storage resources
  "pv","pvc","persistentvolume","persistentvolumeclaim","storageclass",
  // Scaling resources
  "hpa","vpa","pdb","poddisruptionbudget",
  // Pod states & errors
  "oomkilled","crashloopbackoff","imagepullbackoff","errimagepull",
  "containercreating",
  // Service types
  "clusterip","nodeport","loadbalancer","externalname",
  // RBAC & other K8s resources
  "role","clusterrole","rolebinding","clusterrolebinding",
  "resourcequota","limitrange","priorityclass","ingresscontroller",
]);

// CLI tools & infrastructure components - rendered as inline code.
const K8S_CODE_TERMS = new Set([
  "kubectl","helm","docker","kubelet","kubeadm","crictl","etcdctl",
  "api-server","kube-proxy","etcd","coredns",
  "kube-scheduler","kube-controller-manager","containerd","cri-o",
  "flannel","calico","cilium","istio","prometheus","grafana",
]);

// Returns "code", "concept", or null for a given token.
function getTermKind(token) {
  // Flags like --show-labels, --namespace=kube-system, -n, -f → code
  if (/^--?[A-Za-z]/.test(token)) return "code";
  // Dotted paths like spec.containers or securityContext.runAsNonRoot → code
  if (/^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z]/.test(token)) return "code";
  // Label selectors: app=backend, tier=frontend, key=value → code
  if (/^[a-zA-Z][\w.-]*=[^\s]*$/.test(token)) return "code";
  // Slash-paths: /api/v1, /healthz, /etc/kubernetes → code
  if (/^\/[a-zA-Z]/.test(token)) return "code";
  const lower = token.toLowerCase();
  const bare = lower.replace(/s$/, "");
  if (K8S_CODE_TERMS.has(lower) || K8S_CODE_TERMS.has(bare)) return "code";
  if (K8S_CONCEPT_TERMS.has(lower) || K8S_CONCEPT_TERMS.has(bare)) return "concept";
  return null;
}

// Inline-code style for CLI tools, dotted paths, backtick spans
const CODE_SPAN_STYLE = {background:"rgba(0,212,255,0.06)",borderRadius:4,padding:"1px 5px",fontSize:"0.88em",fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",color:"var(--code-text)"};

// Concept tag style for K8s resource types - highlighted but not code
const CONCEPT_TAG_STYLE = {background:"var(--concept-bg)",border:"1px solid var(--concept-border)",borderRadius:6,padding:"1px 6px",fontSize:"0.92em",fontWeight:600,color:"var(--concept-text)"};

// Inner bidi logic: wraps Latin sequences, flags, and arrows in <span dir="ltr">, applies code styling to K8s terms.
function renderBidiInner(text, lang, keyPrefix) {
  if (!text || (!/[A-Za-z]/.test(text) && !/[←]/.test(text) && !/(->|<-)/.test(text))) return text;
  // Normalize ASCII arrows to Unicode, then replace with bidi-safe alternatives:
  // Line-start → (bullet) becomes "· ", mid-text → becomes ":"
  text = text.replace(/-->/g, "\u2192").replace(/<--/g, "\u2190").replace(/->/g, "\u2192").replace(/<-(?!-)/g, "\u2190");
  text = text.replace(/^→\s*/gm, "· ").replace(/\s*→\s*/g, ": ");
  // Split on: flag sequences (--flag, -f), slash-paths (/api/v1), Latin word sequences, or left-arrow
  const parts = text.split(/((?:(?<![\u0590-\u05FF])--?[A-Za-z][\w\-]*(?:=[^\s\u0590-\u05FF]*)?(?:\s+(?=(?:--?)?[A-Za-z]))?)+|(?:\/[A-Za-z][A-Za-z0-9\-_/.:]*)|(?:[A-Za-z](?:[A-Za-z0-9\-_:/=]|\.[A-Za-z0-9])*(?:\s+(?=(?:--?)?[A-Za-z]))?)+|[←])/);
  if (parts.length <= 1) return text;
  const startsWithLatin = /^[A-Za-z]/.test(text) || /^--?[A-Za-z]/.test(text) || /^\/[A-Za-z]/.test(text);
  const isLtrPart = (p) => /^[A-Za-z]/.test(p) || /^--?[A-Za-z]/.test(p) || /^\/[A-Za-z]/.test(p) || /^[←]$/.test(p);
  return parts.map((part, idx) => {
    const k = `${keyPrefix}-${idx}`;
    if (/^[A-Za-z]/.test(part) || /^--?[A-Za-z]/.test(part) || /^\/[A-Za-z]/.test(part)) {
      const kind = getTermKind(part);
      const termStyle = kind === "code" ? CODE_SPAN_STYLE : kind === "concept" ? CONCEPT_TAG_STYLE : undefined;
      return [idx === 0 && startsWithLatin ? "\u200F" : null, <span key={k} dir="ltr" style={{unicodeBidi:"isolate",...termStyle}}>{part}</span>];
    }
    // Left-arrow - wrap in LTR isolation to prevent bidi reordering
    if (/^[←]$/.test(part)) {
      return <span key={k} dir="ltr" style={{unicodeBidi:"isolate",padding:"0 2px"}}>{part}</span>;
    }
    // Non-matched (RTL) text
    let result = part;
    if (idx > 0 && isLtrPart(parts[idx - 1])) result = "\u200F" + result;
    // Anchor trailing Hebrew-hyphen to RTL context (ה-Pod, ב-namespace, ל-Service)
    // so bidi algorithm doesn't visually misplace the hyphen
    if (/[\u0590-\u05FF]-$/.test(part) && idx + 1 < parts.length && isLtrPart(parts[idx + 1])) result += "\u200F";
    return result;
  });
}

// Hebrew prefix+hyphen+English term pattern (ה-Deployment, ב-namespace, ל-Service)
// Renders the Hebrew prefix attached to RTL flow with a non-breaking hyphen,
// followed by the English term in an isolated LTR span with concept/code styling.
const HE_PREFIX_TERM_RE = /([\u0590-\u05FF])-([A-Za-z][A-Za-z0-9\-_./]*)/g;

function renderHebrewPrefixTerms(text, lang, keyPrefix) {
  if (lang !== "he" || !HE_PREFIX_TERM_RE.test(text)) return null;
  HE_PREFIX_TERM_RE.lastIndex = 0;
  const parts = [];
  let last = 0;
  let m;
  while ((m = HE_PREFIX_TERM_RE.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "prefixTerm", prefix: m[1], term: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  if (parts.length <= 1 && parts[0]?.type === "text") return null;
  return parts.map((p, i) => {
    if (p.type === "prefixTerm") {
      const kind = getTermKind(p.term);
      const termStyle = kind === "code" ? CODE_SPAN_STYLE : kind === "concept" ? CONCEPT_TAG_STYLE : CONCEPT_TAG_STYLE;
      return <span key={`${keyPrefix}-hp${i}`}>{p.prefix}{"\u2011"}<span dir="ltr" style={{unicodeBidi:"isolate",...termStyle}}>{p.term}</span></span>;
    }
    return <span key={`${keyPrefix}-ht${i}`}>{renderBidiInner(p.value, lang, `${keyPrefix}h${i}`)}</span>;
  });
}

// Wraps inline English/Latin sequences in <span dir="ltr"> for correct bidi rendering
// in RTL Hebrew paragraphs. K8s terms get inline-code styling.
// Also handles backtick-wrapped inline code (`command`) for consistency.
// Returns text unchanged for English mode.
function renderBidi(text, lang) {
  if (!text || lang !== "he") return text;

  // Handle inline backtick code spans first: `term` → <span dir="ltr" style={code}>term</span>
  if (text.includes("`")) {
    const btParts = text.split(/`([^`]+)`/);
    if (btParts.length > 1) {
      return btParts.map((part, i) => {
        if (i % 2 === 1) {
          // backtick-wrapped content → always render as LTR inline code
          return <span key={`bt-${i}`} dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{part}</span>;
        }
        if (!part) return null;
        // Anchor leading punctuation to RTL context when following an LTR code span
        let seg = part;
        if (i > 0 && /^[\s]*[.,;:!?)}\]>]/.test(seg)) seg = "\u200F" + seg;
        // Process Hebrew-prefix+English-term patterns in text segments
        const prefixed = renderHebrewPrefixTerms(seg, lang, `s${i}`);
        if (prefixed) return <span key={`seg-${i}`}>{prefixed}</span>;
        return <span key={`seg-${i}`}>{renderBidiInner(seg, lang, `s${i}`)}</span>;
      });
    }
  }

  // CLI commands in mixed text: wrap entire command as single inline LTR span
  // to prevent bidi line-wrapping from reordering flags (e.g. -- migrating away from its flag)
  const bare = text.replace(/`[^`]+`/g, "");
  if (CLI_COMMAND_RE.test(bare)) {
    const cliParts = text.split(CLI_COMMAND_RE);
    if (cliParts.length > 1) {
      return cliParts.map((part, i) => {
        if (!part) return null;
        if (i % 2 === 1) return <span key={`cli-${i}`} dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{part}</span>;
        // Anchor leading punctuation to RTL context when following an LTR CLI span
        let trimmed = part.trim();
        if (!trimmed) return null;
        if (i > 0 && /^[.,;:!?)}\]>]/.test(trimmed)) trimmed = "\u200F" + trimmed;
        const prefixed = renderHebrewPrefixTerms(trimmed, lang, `b${i}`);
        if (prefixed) return <span key={`seg-${i}`}>{prefixed}</span>;
        return <span key={`seg-${i}`}>{renderBidiInner(trimmed, lang, `b${i}`)}</span>;
      });
    }
  }

  // Process Hebrew-prefix+English-term patterns before falling back to renderBidiInner
  const prefixed = renderHebrewPrefixTerms(text, lang, "b");
  if (prefixed) return prefixed;

  return renderBidiInner(text, lang, "b");
}

// Regex to detect CLI commands in mixed text.
// Matches: CLI tool name + one or more argument tokens (excludes Hebrew chars and opening parens
// so parenthetical explanations like "(see memory usage)" are not captured as part of the command).
const CLI_COMMAND_RE = /((?:kubectl|docker|helm|aws|git|kubeadm|kubelet|crictl|etcdctl|curl|wget)(?:\s+[^\s\u0590-\u05FF(]+)+)/;

// Splits text on CLI commands and renders commands as LTR code blocks on separate lines.
function splitCliParts(text, lang, keyPrefix) {
  const parts = text.split(CLI_COMMAND_RE);
  if (parts.length <= 1) return renderBidiInner(text, lang, keyPrefix);
  return parts.map((part, i) => {
    if (!part) return null;
    if (i % 2 === 1) return <code key={`${keyPrefix}-c${i}`} dir="ltr" className="cli-command">{part.trim()}</code>;
    const trimmed = part.trim();
    return trimmed ? <span key={`${keyPrefix}-t${i}`}>{renderBidiInner(trimmed, lang, `${keyPrefix}b${i}`)}</span> : null;
  });
}

// Enhanced bidi renderer that detects full CLI commands (kubectl, docker, etc.)
// and renders them as standalone LTR code blocks on a separate line,
// preventing RTL word-reordering of flags like -n, --namespace.
// Falls back to renderBidi for Hebrew text without CLI commands,
// or returns text unchanged for non-Hebrew text without CLI commands.
function renderBidiBlock(text, lang) {
  if (!text) return text;
  // Quick check: does the text contain a CLI command outside backticks?
  const bare = text.replace(/`[^`]+`/g, "");
  const hasCli = CLI_COMMAND_RE.test(bare);
  // No CLI command: for Hebrew fall back to renderBidi; for English return plain text
  if (!hasCli) return lang === "he" ? renderBidi(text, lang) : renderBidiInner(text, lang, "e");
  // CLI command found (any language): handle backtick-wrapped inline code first,
  // then CLI commands in remaining segments
  if (text.includes("`")) {
    const btParts = text.split(/`([^`]+)`/);
    if (btParts.length > 1) {
      return btParts.map((part, i) => {
        if (i % 2 === 1) return <span key={`bt-${i}`} dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{part}</span>;
        if (!part) return null;
        // Anchor leading punctuation to RTL context when following an LTR code span
        let seg = part;
        if (i > 0 && lang === "he" && /^[\s]*[.,;:!?)}\]>]/.test(seg)) seg = "\u200F" + seg;
        return <span key={`seg-${i}`}>{splitCliParts(seg, lang, `s${i}`)}</span>;
      });
    }
  }
  return splitCliParts(text, lang, "b");
}

function Footer({ lang }) {
  const txt = TRANSLATIONS[lang] || TRANSLATIONS.he;
  return (
    <div style={{textAlign:"center",marginTop:28,paddingTop:18,borderTop:"1px solid var(--glass-5)"}}>
      <a href="https://buymeacoffee.com/ocarmeli7n" target="_blank" rel="noopener noreferrer"
        style={{color:"var(--text-dim)",fontSize:11,textDecoration:"none",display:"block",marginBottom:8,transition:"color 0.2s",direction:lang==="en"?"ltr":"rtl"}}
        onMouseEnter={e=>{e.currentTarget.style.color="var(--text-muted)";}}
        onMouseLeave={e=>{e.currentTarget.style.color="var(--text-dim)";}}>
        {lang==="en"?"Enjoying KubeQuest?":"נהנים מ-KubeQuest\u200F?"}<br/>{lang==="en"?"Support the project ☕":"תמכו בפרויקט ☕"}
      </a>
      <p style={{color:"var(--text-dim)",fontSize:12,margin:"0 0 8px 0",direction:lang==="he"?"rtl":"ltr"}}>
        {lang==="en" && `© ${year} `}{txt.allRightsReserved}{" "}
        <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer"
          style={{color:"var(--link-color)",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>{lang==="he" && ` \u200F© ${year}`}
      </p>
      <a href="mailto:ocarmeli7@gmail.com?subject=KubeQuest%20Feedback"
        style={{display:"inline-flex",alignItems:"center",gap:5,color:"var(--text-muted)",fontSize:11,textDecoration:"none",padding:"5px 12px",border:"1px solid var(--glass-7)",borderRadius:20,transition:"color 0.2s,border-color 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.color="var(--text-primary)";e.currentTarget.style.borderColor="var(--glass-20)";}}
        onMouseLeave={e=>{e.currentTarget.style.color="var(--text-muted)";e.currentTarget.style.borderColor="var(--glass-7)";}}>
        ✉ {lang==="en"?"Contact me":"צור קשר"}
      </a>
    </div>
  );
}

export default function K8sQuestApp() {
  console.info("[KubeQuest:boot] K8sQuestApp render");
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang]                   = useState("he");
  const [gender, setGender]               = useState(() => safeGetItem("gender_v1", "m"));
  const handleSetGender = (g) => { setGender(g); localStorage.setItem("gender_v1", g); };
  const t = (key) => {
    if (lang === "he" && gender === "m" && TRANSLATIONS.he[key + "_m"]) return TRANSLATIONS.he[key + "_m"];
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.he[key] ?? key;
  };
  const dir = lang === "he" ? "rtl" : "ltr";

  const [authChecked, setAuthChecked]     = useState(false);
  const [dataLoaded,  setDataLoaded]      = useState(false);
  const [minLoadElapsed, setMinLoadElapsed] = useState(false);
  const [user, setUser]                   = useState(null);
  const [authScreen, setAuthScreen]       = useState("login");
  const authFormRef                       = useRef(null);
  const [authLoading, setAuthLoading]     = useState(false);
  const [authError, setAuthError]         = useState("");
  const [saveError, setSaveError]         = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail]       = useState("");
  const [resetStatus, setResetStatus]     = useState("");

  const [screen, setScreen]               = useState(()=>{
    if (window.location.pathname==="/status" || window.location.hostname==="status.kubequest.online") return "status";
    const s = safeGetItem("kq_screen_v1");
    // "topic" and "incidentComplete" depend on transient React state (selectedTopic, selectedLevel,
    // selectedIncident) that doesn't survive a page refresh.  Restoring to these screens without
    // that state causes a blank content area.  Fall back to "home" and let auto-resume handle it.
    if (s === "topic" || s === "incidentComplete") {
      console.info("[KubeQuest:boot] Screen was", s, "- falling back to home (transient state lost on refresh)");
      return "home";
    }
    if (s && ["home","incidentList","incident"].includes(s)) return s;
    return "home";
  });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [topicScreen, setTopicScreen]     = useState("theory");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted]         = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flash, setFlash]                 = useState(false);
  const [tryAgainActive, setTryAgainActive]   = useState(false);
  const [tryAgainSelected, setTryAgainSelected] = useState(null);

  const topicCorrectRef = useRef(0);
  const isRetryRef = useRef(false);
  const lastSessionScoreRef = useRef(0);
  const bestImprovedRef = useRef(true); // Whether this session improved the topic's best result
  const submittingRef = useRef(false);

  // Refs for browser back-button handler and keyboard shortcuts (avoids stale closures)
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const topicScreenRef = useRef(topicScreen);
  topicScreenRef.current = topicScreen;
  const showExplanationRef = useRef(showExplanation);
  showExplanationRef.current = showExplanation;
  const handleSubmitRef = useRef(null);
  const nextQuestionRef = useRef(null);
  const burgerRef = useRef(null);

  // ── Scoring Model ───────────────────────────────────────────────────────────
  // Two score fields exist. They serve different purposes and must not be mixed.
  //
  // total_score  (user-visible, leaderboard-ranked)
  //   Accumulated permanently: += points on every correct answer.
  //   Never decreases, even on topic reset or replay.
  //   This is the ONLY score shown in UI (dashboard, quiz header, leaderboard).
  //
  // best_score   (internal canonical metric, never shown to users)
  //   Derived from completedTopics via computeScore().
  //   Represents sum(correct * level_points) for each topic's best attempt.
  //   Recalculated at quiz completion, topic reset, and guest merge.
  //   Exists as a tamper-proof audit baseline - not used for ranking.
  //
  // ⚠  Do NOT show best_score in UI or use it for leaderboard ranking.
  // ⚠  Do NOT derive total_score from completedTopics - it is purely accumulated.
  // ─────────────────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total_answered:0, total_correct:0, total_score:0, best_score:0, max_streak:0, current_streak:0,
  });
  const [topicStats, setTopicStats] = useState(() => safeGetJSON("topicStats_v1", {}));
  const [highlightTopic, setHighlightTopic]             = useState(null);
  const [completedTopics, setCompletedTopics]           = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement]             = useState(null);
  const [leaderboard, setLeaderboard]                   = useState([]);
  const [userRank, setUserRank]                         = useState(null);
  const [showLeaderboard, setShowLeaderboard]           = useState(false);
  const [quizHistory, setQuizHistory]                   = useState([]);
  const [showReview, setShowReview]                     = useState(false);
  const [shareCopied, setShareCopied]                   = useState(false);
  const [timerEnabled, setTimerEnabled]                 = useState(false);
  const [timeLeft, setTimeLeft]                         = useState(TIMER_DURATIONS.easy);
  const [isInterviewMode, setIsInterviewMode]           = useState(() => safeGetItem("isInterviewMode_v1") === "true");
  const [homeTab, setHomeTab]                           = useState("roadmap");
  const [showConfetti, setShowConfetti]                 = useState(false);
  const [mixedQuestions, setMixedQuestions]             = useState([]);
  const [sessionScore, setSessionScore]                 = useState(0);
  const [retryMode, setRetryMode]                       = useState(false);
  const [topicQuestions, setTopicQuestions]             = useState([]);
  const [allowNextLevel, setAllowNextLevel]             = useState(false);
  const [showMenu, setShowMenu]                         = useState(false);
  const [dbStatus, setDbStatus]                         = useState(null); // null | "ok" | "error"
  const [monitorServices, setMonitorServices]           = useState(null); // null = loading, [] = loaded
  const [monitorUptime, setMonitorUptime]               = useState(null);
  const [monitorIncidents, setMonitorIncidents]         = useState(null);
  const [maintenanceWindows, setMaintenanceWindows]     = useState(null);
  const [statusTick, setStatusTick]                     = useState(0);    // increments every 1s to keep timer live
  const [searchQuery, setSearchQuery]                   = useState("");
  const [expandedGuideSection, setExpandedGuideSection] = useState(null);
  const [copiedCmd, setCopiedCmd]                       = useState(null);  // tracks last copied command for visual feedback
  const [answerResult, setAnswerResult]                 = useState(null); // { correct, correctIndex, explanation } - set after server-side validation
  const [checkingAnswer, setCheckingAnswer]             = useState(false);
  const [theoryContent, setTheoryContent]               = useState(null);
  const [loadingQuestions, setLoadingQuestions]          = useState(false);
  const [incidentSteps, setIncidentSteps]               = useState(null); // fetched steps for online mode
  const [incidentAnswerResult, setIncidentAnswerResult] = useState(null); // { correct, correctIndex, explanation, explanationHe }
  const [a11y, setA11y] = useState(() => {
    const saved = safeGetJSON("a11y_v1");
    if (saved) return saved;
    return {
      fontSize: "normal",
      reduceMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
      highContrast: window.matchMedia?.("(prefers-contrast: more)").matches ?? false,
      autoRead: false,
    };
  });

  const isGuest = user?.id === "guest";
  const achievementsLoaded = useRef(false);
  const loadingDataRef = useRef(false); // prevents concurrent loadUserData calls
  const quizRunIdRef  = useRef(null);
  const answerCacheRef = useRef({});  // prefetched { [questionId]: { correctIndex, explanation } }
  const liveIndexRef  = useRef(0);   // highest question index reached; never decremented
  const questionRef   = useRef(null); // focus target when question changes
  const nextBtnRef    = useRef(null); // focus target after submitting an answer
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hintVisible, setHintVisible]         = useState(false);
  const [eliminatedOption, setEliminatedOption] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeToast, setResumeToast] = useState(false);
  const pendingQuizStartRef = useRef(null); // stores the quiz-start fn while modal is open
  const autoResumeAttempted = useRef(false); // ensures auto-restore runs only once on page load
  const [dailyStreak, setDailyStreak] = useState(() => safeGetJSON("daily_streak_v1", { date: null, streak: 0 }));
  const [bookmarks, setBookmarks] = useState(() => safeGetJSON("bookmarks_v1", []));
  const [showBookmarks, setShowBookmarks] = useState(false);

  // ── Analytics session tracking ──────────────────────────────────────────────
  const sessionStartRef = useRef(Date.now());
  const quizzesPlayedRef = useRef(0);

  // ── Incident Mode state ───────────────────────────────────────────────────
  const [selectedIncident,   setSelectedIncident]   = useState(null);
  const [incidentStepIndex,  setIncidentStepIndex]  = useState(0);
  const [incidentScore,      setIncidentScore]      = useState(0);
  const [incidentMistakes,   setIncidentMistakes]   = useState(0);
  const [incidentElapsed,    setIncidentElapsed]    = useState(0);   // seconds
  const [incidentAnswer,     setIncidentAnswer]     = useState(null);
  const [incidentSubmitted,  setIncidentSubmitted]  = useState(false);
  const [incidentHistory,    setIncidentHistory]    = useState([]);
  const [incidentResume,     setIncidentResume]     = useState(null); // saved state for resume banner
  const [incidentShareCopied,setIncidentShareCopied]= useState(false);
  const incidentTimerRef = useRef(null);
  const incidentCheckingRef = useRef(false);
  const [reportDialog,  setReportDialog]  = useState(null); // {qText, qIndex} | null
  const [reportType,    setReportType]    = useState("");
  const [reportNote,    setReportNote]    = useState("");
  const [reportSent,    setReportSent]    = useState(false);
  const [reportSending, setReportSending] = useState(false);

  // Shuffle answer options so the correct answer isn't predictably the longest/same position
  const getLevelData = (topic, level) => ({
    theory: lang === "en" ? topic.levels[level].theoryEn : topic.levels[level].theory,
    questions: lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions,
  });

  const isLevelLocked = (topicId, level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx === 0) return false;
    const prevResult = completedTopics[`${topicId}_${LEVEL_ORDER[idx - 1]}`];
    return !prevResult;
  };

  const getNextLevel = (level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  };

  const isFreeMode = (id) => id === "mixed" || id === "daily" || id === "bookmarks";
  const getGameMode = (topic, level) =>
    topic?.id === "mixed" ? "mixed" : topic?.id === "daily" ? "daily"
    : topic?.id === "bookmarks" ? "bookmarks" : isInterviewMode ? "interview" : level || "unknown";

  // Weighted progress % for a single topic - matches Roadmap's stageProgress logic.
  const computeTopicProgress = (topicId) => {
    let score = 0;
    LEVEL_ORDER.forEach(lvl => {
      const r = completedTopics[`${topicId}_${lvl}`];
      if (!r || !r.total) return;
      score += r.retryComplete ? 1 : Math.min(r.correct ?? 0, r.total) / r.total;
    });
    const pct = LEVEL_ORDER.length > 0 ? Math.min(100, Math.round((score / LEVEL_ORDER.length) * 100)) : 0;
    return Number.isFinite(pct) ? pct : 0;
  };

  // Compute best_score (internal canonical metric) from completedTopics.
  // NOT used for user-visible score or leaderboard - those use total_score.
  // best_score = sum(correct * level_points) for each topic's best attempt.
  // Exists as a tamper-proof baseline; never shown in UI.
  // Free-mode keys (mixed_mixed, daily_daily, bookmarks_bookmarks) are excluded.
  const computeScore = (completed) =>
    Object.entries(completed).reduce((sum, [key, res]) => {
      const parts = key.split("_");
      const topicId = parts.slice(0, -1).join("_");
      if (isFreeMode(topicId)) return sum;               // BUG-E fix: skip mixed/daily
      const lvl = parts[parts.length - 1];
      return sum + ((res.correct ?? 0) * (LEVEL_CONFIG[lvl]?.points ?? 0));
    }, 0);
  const currentLevelData = selectedTopic && selectedLevel && !isFreeMode(selectedTopic.id) && !retryMode ? getLevelData(selectedTopic, selectedLevel) : null;
  // SAFETY: never fall back to unshuffled currentLevelData.questions - that would serve
  // raw data with original answer indices, causing answer/option mismatch after shuffle.
  const currentQuestions = isFreeMode(selectedTopic?.id) || retryMode ? mixedQuestions : topicQuestions;

  // These MUST be declared before any useEffect or the loading-gate early return,
  // because useEffect callbacks close over them. If they're declared after the early
  // return, they stay in the Temporal Dead Zone when the loading gate is active,
  // causing "Cannot access X before initialization" in production builds.
  const isInHistoryMode     = questionIndex < liveIndexRef.current;
  const currentQBookmarked  = screen === "topic" && selectedTopic && selectedLevel && currentQuestions[questionIndex]
    ? bookmarks.some(b => b.question_id === makeQuestionId(selectedTopic.id, selectedLevel, questionIndex))
    : false;
  const dispSubmitted       = tryAgainActive ? (tryAgainSelected !== null) : (isInHistoryMode ? true : submitted);
  const dispSelectedAnswer  = tryAgainActive ? (tryAgainSelected ?? -1) : (isInHistoryMode ? (quizHistory[questionIndex]?.chosen ?? -1) : selectedAnswer);
  const dispShowExplanation = tryAgainActive ? (tryAgainSelected !== null) : (isInHistoryMode ? true : showExplanation);
  const accuracy = stats.total_answered > 0 ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;
  const FONT_SCALES = { normal: 1, large: 1, xl: 1 }; // no zoom - original A mode is now the default
  const fs = FONT_SCALES[a11y.fontSize] || 1;
  const dispAnswerResult = (() => {
    const q = currentQuestions[questionIndex];
    if (tryAgainActive) {
      if (tryAgainSelected === null) return null;
      const hist = quizHistory[questionIndex];
      if (hist) return { correct: tryAgainSelected === hist.answer, correctIndex: hist.answer, explanation: hist.explanation };
      if (typeof q?.answer === "number") return { correct: tryAgainSelected === q.answer, correctIndex: q.answer, explanation: q.explanation };
      return null;
    }
    if (isInHistoryMode) {
      const hist = quizHistory[questionIndex];
      if (hist) return { correct: hist.chosen === hist.answer, correctIndex: hist.answer, explanation: hist.explanation };
      if (typeof q?.answer === "number") return { correct: false, correctIndex: q.answer, explanation: q.explanation };
      return null;
    }
    return answerResult;
  })();

  useEffect(() => { const t = setTimeout(() => setMinLoadElapsed(true), 500); return () => clearTimeout(t); }, []);

  // Boot elapsed timer - updates every second while loading gate is active (for debug panel)
  const [bootElapsed, setBootElapsed] = useState(0);
  const [lockInfo, setLockInfo] = useState("");
  useEffect(() => {
    const gateActive = !authChecked || !minLoadElapsed || (!!user && !isGuest && !dataLoaded);
    if (!gateActive) return;
    const iv = setInterval(() => setBootElapsed(s => s + 1), 1000);
    // Query Navigator Locks to diagnose stuck Supabase auth locks
    if (navigator.locks?.query) {
      navigator.locks.query().then(({ held, pending }) => {
        const sbLocks = [...(held || []), ...(pending || [])].filter(l => l.name?.includes("auth-token"));
        setLockInfo(sbLocks.length ? `locks: ${sbLocks.map(l => `${l.mode}${held?.includes(l) ? "(held)" : "(pending)"}`).join(",")}` : "locks: none");
      }).catch(() => setLockInfo("locks: n/a"));
    }
    return () => clearInterval(iv);
  }, [authChecked, minLoadElapsed, user, isGuest, dataLoaded]);

  // Hard safety net: after 5 s on the loading gate, force everything open.
  // If user was set but dataLoaded didn't resolve, clear user to bypass the gate.
  useEffect(() => {
    const gateActive = !authChecked || !minLoadElapsed || (!!user && !isGuest && !dataLoaded);
    if (!gateActive) return;
    const t = setTimeout(() => {
      console.error("[KubeQuest:boot] Loading gate still active after 5 s - force-unblocking");
      console.error("[KubeQuest:boot] State: authChecked:", authChecked, "dataLoaded:", dataLoaded, "user:", !!user, "isGuest:", isGuest);
      setAuthChecked(true);
      setMinLoadElapsed(true);
      setDataLoaded(true);
      // If user is set but data never loaded, the Supabase session may be stale.
      // Force to auth screen - user can log in again.
      if (user && !isGuest && !dataLoaded) {
        console.warn("[KubeQuest:boot] Clearing stale user to unblock UI");
        setUser(null);
        loadingDataRef.current = false;
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [authChecked, minLoadElapsed, user, isGuest, dataLoaded]);

  // Restore progress from local cache immediately on mount (before auth/Supabase resolves)
  useEffect(() => {
    const cached = safeGetJSON("k8s_progress_v2");
    if (!cached) return;
    console.info("[KubeQuest] Restoring progress from local cache");
    if (cached?.completedTopics && typeof cached.completedTopics === "object" && Object.keys(cached.completedTopics).length > 0) {
      setCompletedTopics(cached.completedTopics);
    }
    if (cached?.stats && typeof cached.stats === "object") {
      const s = cached.stats;
      // total_score is accumulated (persisted as-is), best_score is canonical
      setStats(prev => ({
        ...prev,
        total_answered: Number(s.total_answered) || prev.total_answered,
        total_correct:  Number(s.total_correct)  || prev.total_correct,
        total_score:    Number(s.total_score)     || prev.total_score,
        best_score:     Number(s.best_score)      || prev.best_score,
        max_streak:     Number(s.max_streak)      || prev.max_streak,
        current_streak: Number(s.current_streak)  || prev.current_streak,
      }));
    }
    if (Array.isArray(cached?.achievements)) {
      setUnlockedAchievements(cached.achievements);
    }
  }, []);

  useEffect(() => {
    // Detect Supabase error params redirected back via URL hash (e.g. expired confirmation link)
    const hash = window.location.hash;
    if (hash && hash.includes("error=")) {
      const params = new URLSearchParams(hash.slice(1));
      const code = params.get("error_code");
      if (code === "otp_expired" || code === "access_denied") {
        setAuthError(TRANSLATIONS[lang]?.otpExpired || TRANSLATIONS.he.otpExpired);
        setAuthScreen("signup");
      }
      window.history.replaceState(null, "", window.location.pathname);
    }

    // If Supabase is not configured, go straight to guest mode
    if (!supabase) {
      setAuthChecked(true);
      setDataLoaded(true);
      return;
    }

    // Hard timeout: if INITIAL_SESSION never fires, unblock the UI
    const hardTimeout = setTimeout(() => {
      console.warn("[KubeQuest:boot] Auth hard timeout (3 s) - force-unblocking UI");
      setAuthChecked(true);
      setDataLoaded(true);
    }, 3000);

    // Use ONLY onAuthStateChange for session initialization.
    // In Supabase v2, it fires INITIAL_SESSION exactly once when the stored
    // session is resolved. Using getSession() in parallel creates a race
    // where loadUserData() is called twice with independent timeouts.
    console.info("[KubeQuest:boot] subscribing to onAuthStateChange");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.info("[KubeQuest:boot] auth event:", event, "session:", !!session);

      if (event === "INITIAL_SESSION") {
        clearTimeout(hardTimeout);
        if (session) {
          setUser(session.user);
          loadUserData(session.user.id, session.user);
        } else {
          // Restore guest session if user previously chose guest mode
          if (safeGetItem("k8s_guest_session")) setUser(GUEST_USER);
          setDataLoaded(true);
        }
        setAuthChecked(true);
      } else if (event === "SIGNED_IN") {
        setUser(session.user);
        loadUserData(session.user.id, session.user);
        setAuthChecked(true);
      } else if (event === "SIGNED_OUT") {
        setAuthChecked(true);
      } else if (event === "TOKEN_REFRESHED") {
        if (session) setUser(session.user);
      }
    });

    return () => {
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Close any open overlay when the user presses Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (showMenu)        { setShowMenu(false);       return; }
      if (showLeaderboard) { setShowLeaderboard(false); return; }
      if (showResumeModal) { handleResumeDismiss(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showMenu, showLeaderboard, showResumeModal]);

  // Guard browser back button during active quiz/incident sessions
  useEffect(() => {
    if (screen !== "topic" && screen !== "incident") return;
    window.history.pushState({ quiz: true }, "");
    const handlePopState = () => {
      // If explanation is showing, dismiss it and stay in quiz
      if (screenRef.current === "topic" && topicScreenRef.current === "quiz" && showExplanationRef.current) {
        setShowExplanation(false);      }
      // Re-push so the next back press is also caught
      window.history.pushState({ quiz: true }, "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [screen]);

  // ── Analytics: quiz_abandoned + session_ended on page unload ──
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (screenRef.current === "topic" && topicScreenRef.current === "quiz" && liveIndexRef.current > 0) {
        window.va?.track("quiz_abandoned", { topic: selectedTopic?.name || selectedTopic?.id, lastQuestion: liveIndexRef.current + 1 });
      }
      window.va?.track("session_ended", { durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000), quizzesPlayed: quizzesPlayedRef.current });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedTopic]);

  useEffect(() => {
    if (!achievementsLoaded.current) return;
    const newOnes = ACHIEVEMENTS.filter(
      a => !unlockedAchievements.includes(a.id) && a.condition(stats, completedTopics)
    );
    if (newOnes.length > 0) {
      setUnlockedAchievements(p => [...p, ...newOnes.map(a => a.id)]);
      setNewAchievement(newOnes[0]);
      setTimeout(() => setNewAchievement(null), 3000);
    }
  }, [stats, completedTopics]);

  // Load guest progress from localStorage
  const guestLoadedRef = useRef(false);
  useEffect(() => {
    if (!isGuest) { guestLoadedRef.current = false; return; }
    const guestData = safeGetJSON("k8s_quest_guest");
    if (guestData) {
      console.info("[KubeQuest] Restoring guest progress from localStorage");
      const { stats: s, completedTopics: c, unlockedAchievements: u } = guestData;
      if (c) setCompletedTopics(c);
      if (s) setStats(s);
      if (u) setUnlockedAchievements(u);
    }
    guestLoadedRef.current = true;
    achievementsLoaded.current = true;
    setDataLoaded(true);
    // Check for a saved in-progress quiz for the guest session
    const savedQuiz = loadQuizState();
    if (savedQuiz && savedQuiz.userId === "guest") setResumeData(savedQuiz);
  }, [isGuest]);

  // Save guest progress to localStorage - skip until load effect's state updates have rendered
  useEffect(() => {
    if (!isGuest || !guestLoadedRef.current) return;
    try {
      localStorage.setItem("k8s_quest_guest", JSON.stringify({ stats, completedTopics, unlockedAchievements }));
    } catch {}
  }, [stats, completedTopics, unlockedAchievements]);

  // Universal progress cache: persist for ALL users (guest + auth) as local safety net
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem("k8s_progress_v2", JSON.stringify({
        userId: user.id, stats, completedTopics, achievements: unlockedAchievements,
      }));
    } catch {}
  }, [user, stats, completedTopics, unlockedAchievements]);

  // Prefetch answer for current question so submit feedback is instant
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz") return;
    const q = currentQuestions[questionIndex];
    if (!supabase || !q?.id || answerCacheRef.current[q.id]) return;
    const originalIndex = q._optionMap ? q._optionMap[0] : 0;
    const isDaily = selectedTopic?.id === "daily";
    const rpc = isDaily ? checkDailyAnswer : checkQuizAnswer;
    rpc(supabase, q.id, originalIndex).then(res => {
      if (res) {
        const ci = q._optionMap ? q._optionMap.indexOf(res.correct_answer) : res.correct_answer;
        answerCacheRef.current[q.id] = { correctIndex: ci, explanation: res.explanation };
      }
    }).catch(() => {});
  }, [questionIndex, screen, topicScreen]);

  // Move focus to the question container whenever the question changes so screen
  // readers announce the new question automatically.
  useEffect(() => {
    if (screen === "topic" && topicScreen === "quiz") {
      questionRef.current?.focus();
    }
  }, [questionIndex, screen, topicScreen]);

  // After submitting, move focus to the Next/Finish button so keyboard users
  // don't have to hunt for it after the Confirm Answer button disappears.
  useEffect(() => {
    if (submitted && screen === "topic" && topicScreen === "quiz") {
      nextBtnRef.current?.focus();
    }
  }, [submitted]);

  useEffect(() => {
    try { localStorage.setItem("topicStats_v1", JSON.stringify(topicStats)); } catch {}
  }, [topicStats]);

  // Persist in-progress quiz state on every meaningful change so it survives refresh/navigation
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz") return;
    if (!selectedTopic || !selectedLevel || !quizRunIdRef.current) return;
    const isFree = isFreeMode(selectedTopic.id);
    const isRetry = isRetryRef.current;
    saveQuizState({
      quizRunId:     quizRunIdRef.current,
      userId:        user?.id || "guest",
      topicId:       selectedTopic.id,
      topicName:     selectedTopic.name,
      topicColor:    selectedTopic.color,
      topicIcon:     selectedTopic.icon,
      level:         selectedLevel,
      questions:     currentQuestions,
      questionIndex: liveIndexRef.current,
      submitted,
      selectedAnswer,
      showExplanation,
      answerResult,
      quizHistory,
      sessionScore,
      topicCorrect:  topicCorrectRef.current,
      retryMode,
      isRetry,
      timerEnabled,
      isInterviewMode,
      timeLeft,
      // Absolute stats snapshot - used by resume to reconcile without double-counting
      savedStats: {
        total_answered: stats.total_answered,
        total_correct:  stats.total_correct,
        total_score:    stats.total_score,
        current_streak: stats.current_streak,
        max_streak:     stats.max_streak,
      },
      statsDelta: {
        answered:       isFree || isRetry ? 0 : quizHistory.length,
        correct:        isFree || isRetry ? 0 : quizHistory.filter(h => h.chosen === h.answer).length,
        currentStreak:  stats.current_streak,
        maxStreak:      stats.max_streak,
      },
    });
  }, [screen, topicScreen, questionIndex, submitted, selectedAnswer, quizHistory]);

  // Persist in-progress incident state on screen entry and step changes
  useEffect(() => {
    if (screen !== "incident" || !selectedIncident) return;
    saveIncidentProgress(
      selectedIncident, incidentStepIndex, incidentScore,
      incidentMistakes, incidentElapsed, incidentHistory
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, incidentStepIndex, incidentSubmitted]);

  useEffect(() => {
    localStorage.setItem("isInterviewMode_v1", isInterviewMode);
  }, [isInterviewMode]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  // Must be declared before any effect that references it
  const isStatusDomain = window.location.hostname === "status.kubequest.online";

  // Persist current screen to localStorage for refresh resilience
  useEffect(() => {
    if (isStatusDomain) return;
    try { localStorage.setItem("kq_screen_v1", screen); } catch {}
    // Signal to SW update handler whether a quiz/incident is active
    const quizActive = (screen === "topic" && topicScreen === "quiz") || screen === "incident";
    window.__KQ_QUIZ_ACTIVE__ = quizActive;
    // If a SW update was deferred while a quiz was active, reload now -
    // but only on truly idle screens. "topicComplete" and "incidentComplete"
    // depend on transient React state, so reloading there sends the user to
    // home and loses the results screen (looks like "Finish Topic" did nothing).
    const canReload = screen === "home" || screen === "incidentList";
    if (!quizActive && canReload && window.__KQ_PENDING_RELOAD__) {
      window.__KQ_PENDING_RELOAD__ = false;
      window.location.reload();
    }
  }, [screen, topicScreen]);

  // Pre-load saved quiz data when returning home (modal is NOT shown here - only when starting a quiz)
  useEffect(() => {
    if (screen !== "home" || !user) return;
    // Clear the "once per session" gate so the resume modal can reappear if the
    // user leaves a quiz and comes back.  Without this, the second exit-and-return
    // within the same tab skips the modal and starts a fresh quiz (bug).
    try { sessionStorage.removeItem(RESUME_SESSION_KEY); } catch {}
    const saved = loadQuizState();
    if (saved && saved.userId === (user.id || "guest")) setResumeData(saved);
    else setResumeData(null); // Clear stale resume data after quiz completion
    // Do NOT call setShowResumeModal(true) here - req 2
  }, [screen]);

  // Auto-restore session on page load (refresh resilience)
  useEffect(() => {
    if (isStatusDomain) return;
    if (!dataLoaded || !user) return;

    // Load saved quiz from localStorage if resumeData wasn't pre-populated
    // (happens when screen was restored to non-"home" - the home-screen effect
    // that normally sets resumeData never fired).
    if (!resumeData && !autoResumeAttempted.current) {
      const fromStorage = loadQuizState();
      if (fromStorage && fromStorage.userId === (user.id || "guest")) {
        console.info("[KubeQuest:boot] Loading saved quiz state directly from localStorage");
        setResumeData(fromStorage);
        return; // re-runs when resumeData updates
      }
    }

    if (autoResumeAttempted.current) return;
    autoResumeAttempted.current = true;

    // Resume quiz - only if it's a recent refresh (<2 min), not a new session.
    if (resumeData && isRecentQuizState(resumeData)) {
      const answered = resumeData.questionIndex ?? 0;
      const total = resumeData.questions?.length ?? 0;
      if (answered < total) {
        handleResumeQuiz();
        setResumeToast(true);
        setTimeout(() => setResumeToast(false), 3500);
        return;
      }
    }

    // If screen restored to "incident" via localStorage but React state is empty,
    // hydrate incident state from saved progress (or fall back to home)
    if (screen === "incident" && !selectedIncident) {
      try {
        const saved = safeGetJSON(INCIDENT_SAVE_KEY);
        if (saved?.incidentId) {
          const incident = INCIDENTS.find(i => i.id === saved.incidentId);
          if (incident) {
            setSelectedIncident(incident);
            setIncidentStepIndex(saved.stepIndex ?? 0);
            setIncidentScore(saved.score ?? 0);
            setIncidentMistakes(saved.mistakes ?? 0);
            setIncidentElapsed(saved.elapsed ?? 0);
            setIncidentAnswer(null);
            setIncidentSubmitted(false);
            setIncidentAnswerResult(null);
            incidentCheckingRef.current = false;
            setIncidentHistory(saved.history || []);
            setResumeToast(true);
            setTimeout(() => setResumeToast(false), 3500);
            return;
          }
        }
      } catch {}
      setScreen("home"); // no valid saved data - fall back
    }
  }, [dataLoaded, user, resumeData]);

  // Set page title, favicon, and OG metadata for status screen
  useEffect(() => {
    if (screen === "status") {
      document.title = "KubeQuest Status";
      const link = document.querySelector('link[rel="icon"]');
      if (link) link.href = "/favicon-status.svg";

      // Override OG/Twitter metadata for status subdomain
      if (isStatusDomain) {
        const metaUpdates = {
          'meta[property="og:title"]': "KubeQuest Status",
          'meta[property="og:description"]': "Real-time platform and service health for KubeQuest.",
          'meta[property="og:image"]': "https://status.kubequest.online/status-preview.png",
          'meta[property="og:image:secure_url"]': "https://status.kubequest.online/status-preview.png",
          'meta[property="og:image:alt"]': "KubeQuest Status – All Systems Operational",
          'meta[property="og:url"]': "https://status.kubequest.online",
          'meta[name="twitter:title"]': "KubeQuest Status",
          'meta[name="twitter:description"]': "Real-time platform and service health for KubeQuest.",
          'meta[name="twitter:image"]': "https://status.kubequest.online/status-preview.png",
          'meta[name="twitter:image:alt"]': "KubeQuest Status – All Systems Operational",
          'meta[name="description"]': "Live service status, incidents, and maintenance updates for KubeQuest.",
        };
        for (const [sel, val] of Object.entries(metaUpdates)) {
          const el = document.querySelector(sel);
          if (el) el.setAttribute("content", val);
        }
        const canon = document.querySelector('link[rel="canonical"]');
        if (canon) canon.setAttribute("href", "https://status.kubequest.online/");
      }

      return () => {
        document.title = "KubeQuest – Kubernetes Practice Game";
        if (link) link.href = "/favicon.svg";
      };
    }
  }, [screen]);

  // Fetch real monitoring data when status screen opens, poll every 30s
  useEffect(() => {
    if (screen !== "status") return;
    setDbStatus(null);
    setMonitorServices(null);
    setMonitorUptime(null);
    setMonitorIncidents(null);
    setMaintenanceWindows(null);

    if (!supabase) { setDbStatus("error"); return; }

    const load = async () => {
      try {
        const [services, uptime, incidents, maintenance] = await Promise.all([
          fetchSystemStatus(supabase),
          fetchUptimeHistory(supabase, 30),
          fetchIncidentHistory(supabase, 20),
          fetchMaintenanceWindows(supabase),
        ]);
        setMonitorServices(services);
        setMonitorUptime(uptime);
        setMonitorIncidents(incidents);
        setMaintenanceWindows(maintenance);
        const anyDown = services.some(s => s.status === "down");
        setDbStatus(anyDown ? "error" : "ok");
      } catch {
        setDbStatus("error");
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [screen]);

  // Tick every 1s so the "Updated Xs ago" timer stays live
  useEffect(() => {
    if (screen !== "status") return;
    const tick = setInterval(() => setStatusTick(t => t + 1), 1_000);
    return () => clearInterval(tick);
  }, [screen]);

  // Check for a saved in-progress incident whenever we land on home or incident list
  useEffect(() => {
    if (screen !== "home" && screen !== "incidentList") return;
    try {
      const saved = safeGetJSON(INCIDENT_SAVE_KEY);
      if (saved?.incidentId) {
        const incident = INCIDENTS.find(i => i.id === saved.incidentId);
        if (incident) { setIncidentResume({ ...saved, incident }); return; }
      }
    } catch {}
    setIncidentResume(null);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async (userId, sessionUser) => {
    console.info("[KubeQuest:boot] loadUserData starting for", userId);
    if (!supabase) { setDataLoaded(true); return; }

    // Prevent concurrent calls (race between onAuthStateChange and login flows)
    if (loadingDataRef.current) {
      console.info("[KubeQuest:boot] loadUserData skipped - already in progress");
      return;
    }
    loadingDataRef.current = true;

    // Timeout guard: if data loading takes too long, unblock the UI
    const dataTimeout = setTimeout(() => {
      console.warn("[KubeQuest:boot] loadUserData timeout (5 s) - unblocking UI");
      loadingDataRef.current = false;
      setDataLoaded(true);
    }, 5000);

    try {
      const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();

      // Read guest localStorage but ALWAYS discard it once a real account is active.
      // BUG-A fix: only merge guest data into brand-new accounts (no existing Supabase row).
      // Merging into existing accounts causes cross-account contamination when users switch accounts.
      let guestSaved = safeGetJSON("k8s_quest_guest");
      // Always clear guest data & session flag - prevents it leaking into whichever account logs in next
      if (guestSaved) { try { localStorage.removeItem("k8s_quest_guest"); } catch {} }
      try { localStorage.removeItem("k8s_guest_session"); } catch {}

      const base = data || {};
      // Only perform merge for genuinely new accounts (no existing row in Supabase)
      const shouldMerge = guestSaved && !data;
      const gs = shouldMerge ? (guestSaved.stats || {}) : {};
      const gc = shouldMerge ? (guestSaved.completedTopics || {}) : {};
      const ga = shouldMerge ? (guestSaved.unlockedAchievements || []) : [];

      const mergedCompleted = { ...(base.completed_topics || {}) };
      Object.entries(gc).forEach(([key, val]) => {
        if (!mergedCompleted[key] || val.correct > mergedCompleted[key].correct)
          mergedCompleted[key] = val;
      });

      const mergedAch = [...new Set([...(base.achievements || []), ...ga])];

      const mergedStats = {
        total_answered: (base.total_answered || 0) + (gs.total_answered || 0),
        total_correct:  (base.total_correct  || 0) + (gs.total_correct  || 0),
        total_score:    (base.total_score    || 0) + (gs.total_score    || 0),
        best_score:     computeScore(mergedCompleted),
        max_streak:     Math.max(base.max_streak || 0, gs.max_streak || 0),
        current_streak: Math.max(base.current_streak || 0, gs.current_streak || 0),
      };

      setStats(mergedStats);
      setCompletedTopics(mergedCompleted);
      setUnlockedAchievements(mergedAch);

      if (data) {
        // Fix 4: load topic_stats from Supabase for existing accounts (overrides localStorage)
        if (data.topic_stats && Object.keys(data.topic_stats).length > 0) {
          setTopicStats(data.topic_stats);
          try { localStorage.setItem("topicStats_v1", JSON.stringify(data.topic_stats)); } catch {}
        }
      } else {
        // BUG-B fix: use INSERT (not upsert) for new accounts to guarantee one row per user
        const username = sessionUser?.user_metadata?.username || sessionUser?.email?.split("@")[0];
        const cleanNc = Object.fromEntries(
          Object.entries(mergedCompleted).filter(([k]) => !isFreeMode(k.split("_")[0]))
        );
        // Fix 4: carry guest topicStats into the new account row
        let guestTopicStats = {};
        guestTopicStats = safeGetJSON("topicStats_v1", {});
        supabase.from("user_stats").insert({
          user_id: userId, username,
          ...mergedStats, completed_topics: cleanNc, achievements: mergedAch,
          topic_stats: guestTopicStats,
          updated_at: new Date().toISOString(),
        }).then(() => {});  // fire-and-forget - don't block the UI for new account creation
      }

      achievementsLoaded.current = true;
      clearTimeout(dataTimeout);
      loadingDataRef.current = false;
      setDataLoaded(true);
    } catch {
      // Network error or unexpected failure - unblock the UI
      clearTimeout(dataTimeout);
      loadingDataRef.current = false;
      achievementsLoaded.current = true;
      setDataLoaded(true);
    }

    // Check for a saved in-progress quiz belonging to this user
    const savedQuiz = loadQuizState();
    if (savedQuiz && savedQuiz.userId === userId) setResumeData(savedQuiz);
  };

  // Persist stats to Supabase. Writes BOTH total_score and best_score.
  // total_score is passed through as-is (accumulated). best_score is recomputed
  // by the caller via computeScore() before calling this function.
  const saveUserData = async (ns, nc, na) => {
    if (!user || isGuest || !supabase) return;
    setSaveError("");
    // BUG-E fix: strip free-mode entries - they are session-only and must not persist
    const cleanNc = Object.fromEntries(
      Object.entries(nc).filter(([k]) => !isFreeMode(k.split("_")[0]))
    );
    // BUG-B fix: use UPDATE (not upsert) - the row is always created by loadUserData,
    // so upsert here was inserting duplicate rows when user_id had no UNIQUE constraint.
    const { error } = await supabase.from("user_stats").update({
      username: user.user_metadata?.username || user.email?.split("@")[0] || "",
      ...ns, completed_topics: cleanNc, achievements: na,
      topic_stats: topicStats,          // Fix 4: persist weak-area data across devices
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    if (error) {
      setSaveError(t("saveErrorText"));
    }
  };

  const loadLeaderboard = async () => {
    if (!supabase) return;
    try {
      const data = await fetchLeaderboard(supabase, 10);
      if (data) setLeaderboard(data);
    } catch {}

    if (!isGuest && user?.id && user.id !== "guest") {
      try {
        const rankData = await fetchUserRank(supabase, user.id);
        if (rankData) {
          setUserRank(rankData.rank > 10 ? { rank: rankData.rank, score: rankData.score } : null);
        }
      } catch { setUserRank(null); }
    } else {
      setUserRank(null);
    }
  };

  const getFormValues = () => {
    const els = authFormRef.current?.elements;
    return {
      emailVal:    els?.email?.value    || "",
      passwordVal: els?.password?.value || "",
      usernameVal: els?.username?.value || "",
    };
  };

  const handleSignUp = async () => {
    if (!supabase) { setAuthError(t("serviceUnavailable") || "Service temporarily unavailable"); return; }
    setAuthLoading(true); setAuthError("");
    const { emailVal, passwordVal, usernameVal } = getFormValues();
    if (!supabase) { setAuthError(t("serviceUnavailable") || "Service temporarily unavailable"); setAuthLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email: emailVal, password: passwordVal, options: {
        data: { username: usernameVal || emailVal.split("@")[0] },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("already registered") || msg.includes("already been registered"))
        setAuthError(t("emailAlreadySent"));
      else
        setAuthError(error.message);
    } else { setAuthError(t("emailSent")); window.va?.track("signup_completed", { source: "quiz_game" }); }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if (!supabase) { setAuthError(t("serviceUnavailable") || "Service temporarily unavailable"); return; }
    setAuthLoading(true); setAuthError("");
    const { emailVal, passwordVal } = getFormValues();
    if (!supabase) { setAuthError(t("serviceUnavailable") || "Service temporarily unavailable"); setAuthLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passwordVal });
    if (error) {
      setAuthError(t("wrongCredentials"));
    } else if (window.PasswordCredential) {
      try {
        const cred = new window.PasswordCredential({ id: emailVal, password: passwordVal });
        await navigator.credentials.store(cred);
      } catch {}
    }
    setAuthLoading(false);
  };

  const handleResend = async () => {
    setAuthLoading(true);
    const { emailVal } = getFormValues();
    if (!supabase) { setAuthError(t("serviceUnavailable") || "Service temporarily unavailable"); setAuthLoading(false); return; }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailVal,
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthError(error ? t("resendError") : t("resendSuccess"));
    setAuthLoading(false);
  };

  const [resetLoading, setResetLoading] = useState(false);
  const handleResetPassword = async () => {
    if (!supabase || !resetEmail || resetLoading) return;
    setResetStatus("");
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    });
    setResetStatus(error ? t("resetEmailError") : t("resetEmailSent"));
    setResetLoading(false);
  };

  const handleLogout = async () => {
    try { localStorage.removeItem("k8s_guest_session"); } catch {}
    if (isGuest) {
      setUser(null);
      setStats({ total_answered:0, total_correct:0, total_score:0, best_score:0, max_streak:0, current_streak:0 });
      setCompletedTopics({}); setUnlockedAchievements([]);
      achievementsLoaded.current = false;
      loadingDataRef.current = false;
      setDataLoaded(true);
      return;
    }
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    achievementsLoaded.current = false;
    loadingDataRef.current = false;
    setDataLoaded(true);
  };

  const handleResetProgress = async () => {
    if (!window.confirm(t("resetConfirm"))) return;
    const emptyStats = { total_answered:0, total_correct:0, total_score:0, best_score:0, max_streak:0, current_streak:0 };
    setStats(emptyStats);
    setCompletedTopics({});
    setUnlockedAchievements([]);
    setTopicStats({});
    try { localStorage.removeItem("topicStats_v1"); } catch {}
    try { localStorage.removeItem("scoredFreeKeys_v1"); } catch {}
    if (isGuest) {
      try { localStorage.removeItem("k8s_quest_guest"); } catch {}
    } else if (user) {
      // BUG-B fix: update, not upsert
      if (supabase) await supabase.from("user_stats").update({
        username: user.user_metadata?.username || user.email?.split("@")[0] || "",
        ...emptyStats, completed_topics: {}, achievements: [], topic_stats: {},
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    }
  };

  const handleResetTopic = async (topicId) => {
    if (!window.confirm(t("resetTopicConfirm"))) return;
    const newCompleted = { ...completedTopics };
    // Subtract previously-counted questions so resetting then replaying doesn't double-count
    let removedAnswered = 0, removedCorrect = 0;
    LEVEL_ORDER.forEach(lvl => {
      const r = newCompleted[`${topicId}_${lvl}`];
      if (r) { removedAnswered += r.total || 0; removedCorrect += r.correct || 0; }
      delete newCompleted[`${topicId}_${lvl}`];
    });
    const newStats = {
      ...stats,
      // total_score is accumulated and permanent - never deducted on reset
      best_score:     computeScore(newCompleted),
      total_answered: Math.max(0, stats.total_answered - removedAnswered),
      total_correct:  Math.max(0, stats.total_correct  - removedCorrect),
    };
    // Also clear per-topic weak-area data for this topic
    const newTopicStats = { ...topicStats };
    delete newTopicStats[topicId];
    setCompletedTopics(newCompleted);
    setStats(newStats);
    setTopicStats(newTopicStats);
    if (!isGuest && user) {
      await saveUserData(newStats, newCompleted, unlockedAchievements);
    }
  };


  const handleResumeQuiz = () => {
    const saved = resumeData;
    if (!saved) return;
    submittingRef.current = false;

    // Resolve topic object
    let topic = null;
    if (saved.topicId === "mixed")           topic = MIXED_TOPIC;
    else if (saved.topicId === "daily")      topic = DAILY_TOPIC;
    else if (saved.topicId === "bookmarks")  topic = BOOKMARKS_TOPIC;
    else                                     topic = TOPICS.find(tp => tp.id === saved.topicId);
    if (!topic || !saved.questions?.length) { clearQuizState(); setResumeData(null); return; }

    // Restore shuffled question list to the correct state slot
    if (isFreeMode(topic.id) || saved.retryMode) setMixedQuestions(saved.questions);
    else                                          setTopicQuestions(saved.questions);

    setSelectedTopic(topic);
    setSelectedLevel(saved.level);
    setTopicScreen("quiz");
    // Clamp questionIndex to valid range to prevent out-of-bounds after back navigation
    const maxIdx = Math.max(0, saved.questions.length - 1);
    const safeIndex = Math.max(0, Math.min(saved.questionIndex ?? 0, maxIdx));
    setQuestionIndex(safeIndex);
    setSelectedAnswer(saved.selectedAnswer ?? null);
    setSubmitted(saved.submitted ?? false);
    setShowExplanation(saved.showExplanation ?? false);
    setAnswerResult(saved.answerResult || null);
    setQuizHistory(saved.quizHistory || []);
    setSessionScore(Number(saved.sessionScore) || 0);
    setRetryMode(saved.retryMode || false);
    isRetryRef.current  = saved.isRetry  || false;
    topicCorrectRef.current = Number(saved.topicCorrect) || 0;
    quizRunIdRef.current    = saved.quizRunId;
    liveIndexRef.current    = safeIndex;
    answerCacheRef.current  = {};
    setHintVisible(false);
    setEliminatedOption(null);
    setTryAgainActive(false);
    setTryAgainSelected(null);

    // Restore interview mode as it was when the quiz was saved
    const savedInterviewMode = saved.isInterviewMode || false;
    setIsInterviewMode(savedInterviewMode);

    // Timer: if mid-question reset to full, if on explanation screen restore saved value
    const fullTime = savedInterviewMode
      ? (INTERVIEW_DURATIONS[saved.level] || INTERVIEW_DURATIONS.mixed)
      : (TIMER_DURATIONS[saved.level] || 30);
    setTimeLeft(saved.submitted ? (saved.timeLeft ?? fullTime) : fullTime);

    // Reconcile stats: use saved absolute snapshot (Math.max prevents double-counting
    // when reactive caches like k8s_quest_guest already include in-progress answers)
    if (!isFreeMode(topic.id) && !saved.isRetry) {
      const snap = saved.savedStats;
      const delta = saved.statsDelta || {};
      if (snap) {
        // Preferred path: use absolute snapshot with Math.max (idempotent)
        setStats(prev => ({
          ...prev,
          total_answered: Math.max(prev.total_answered, snap.total_answered || 0),
          total_correct:  Math.max(prev.total_correct,  snap.total_correct  || 0),
          total_score:    Math.max(prev.total_score,    snap.total_score    || 0),
          current_streak: Math.max(prev.current_streak, snap.current_streak || 0),
          max_streak:     Math.max(prev.max_streak,     snap.max_streak     || 0),
        }));
      } else if (delta.answered > 0 || delta.correct > 0) {
        // Backward compat: old save states without savedStats - use additive delta
        setStats(prev => ({
          ...prev,
          total_answered: prev.total_answered + (delta.answered || 0),
          total_correct:  prev.total_correct  + (delta.correct  || 0),
          current_streak: Math.max(prev.current_streak, delta.currentStreak || 0),
          max_streak:     Math.max(prev.max_streak,     delta.maxStreak     || 0),
        }));
      }
    }

    setScreen("topic");
    setResumeData(null);
    setShowResumeModal(false);
    pendingQuizStartRef.current = null;
    try { sessionStorage.setItem(RESUME_SESSION_KEY, "true"); } catch {}
    // Keep saving state as user continues - do NOT clearQuizState() here
  };

  const handleDiscardResume = () => {
    clearQuizState();
    setResumeData(null);
    setShowResumeModal(false);
    try { sessionStorage.setItem(RESUME_SESSION_KEY, "true"); } catch {}
    const startFn = pendingQuizStartRef.current;
    pendingQuizStartRef.current = null;
    if (startFn) startFn();
  };

  // Returns true if the resume modal should be shown for the given saved quiz data
  const shouldShowResumeModal = (saved) => {
    if (!saved) return false;
    const answered = saved.questionIndex ?? 0;
    const total    = saved.questions?.length ?? 0;
    if (answered <= 0 || answered >= total) return false;          // req 1
    if (answered / total < RESUME_MIN_PROGRESS) return false;      // req 5: <20% → skip
    try {
      if (sessionStorage.getItem(RESUME_SESSION_KEY)) return false; // req 3: once per session
      const dismissedAt = safeGetItem(RESUME_DISMISS_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt) < RESUME_COOLDOWN_MS) return false; // req 4
    } catch {}
    return true;
  };

  // Wraps a quiz-start function: shows resume modal when applicable, otherwise starts immediately
  const tryStartQuiz = (startFn) => {
    const userId = isGuest ? "guest" : user?.id;
    const saved  = loadQuizState();
    if (saved && saved.userId === userId && shouldShowResumeModal(saved)) {
      setResumeData(saved);
      setShowResumeModal(true);
      pendingQuizStartRef.current = startFn;
    } else {
      startFn();
    }
  };

  // Called when user closes modal without choosing (X, Back, Overlay click)
  const handleResumeDismiss = () => {
    setShowResumeModal(false);
    pendingQuizStartRef.current = null;
    try { localStorage.setItem(RESUME_DISMISS_KEY, Date.now().toString()); } catch {}
  };

  const updateA11y = (key, val) => setA11y(prev => {
    const next = { ...prev, [key]: val };
    try { localStorage.setItem("a11y_v1", JSON.stringify(next)); } catch {}
    return next;
  });

  const buildQuestionText = (qObj) => {
    if (!qObj) return null;
    const labels = lang === "he" ? ["א","ב","ג","ד"] : ["A","B","C","D"];
    const optionsText = (qObj.options || []).map((opt, i) => `${labels[i]}: ${opt}`).join(". ");
    return `${qObj.q}. ${optionsText}`;
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === "he" ? "he-IL" : "en-US";
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const speakQuestion = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const text = buildQuestionText(currentQuestions?.[questionIndex]);
    if (!text) return;
    speakText(text);
  };

  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (a11y.autoRead && screen === "topic" && topicScreen === "quiz") {
      const text = buildQuestionText(currentQuestions?.[questionIndex]);
      if (!text) return;
      speakText(text);
    }
  }, [questionIndex, screen, topicScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAnswer = (idx) => {
    if (submitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || submitted || checkingAnswer || submittingRef.current) return;
    submittingRef.current = true;
    try {
    setSubmitted(true);
    const q = currentQuestions[questionIndex];

    // Resolve answer: prefetch cache → local field → server RPC (last resort)
    let result;
    const cached = supabase && q.id ? answerCacheRef.current[q.id] : null;
    if (cached) {
      result = { correct: selectedAnswer === cached.correctIndex, correctIndex: cached.correctIndex, explanation: cached.explanation };
    } else if (typeof q.answer === "number") {
      result = { correct: selectedAnswer === q.answer, correctIndex: q.answer, explanation: q.explanation };
    } else if (supabase && q.id) {
      // Cache miss and no local answer - fall back to server call
      setCheckingAnswer(true);
      const originalIndex = q._optionMap ? q._optionMap[selectedAnswer] : selectedAnswer;
      const isDaily = selectedTopic?.id === "daily";
      const callRpc = () => isDaily
        ? checkDailyAnswer(supabase, q.id, originalIndex)
        : checkQuizAnswer(supabase, q.id, originalIndex);
      let rpcResult;
      try {
        rpcResult = await callRpc();
      } catch {
        try { rpcResult = await callRpc(); } catch { /* give up */ }
      }
      if (rpcResult) {
        const correctIndex = q._optionMap ? q._optionMap.indexOf(rpcResult.correct_answer) : rpcResult.correct_answer;
        result = { correct: rpcResult.correct, correctIndex, explanation: rpcResult.explanation };
      } else {
        // RPC failed (likely stale question ID after DB re-seed) - clear stale
        // quiz and send user home so they can start fresh with valid questions.
        clearQuizState();
        submittingRef.current = false;
        setCheckingAnswer(false);
        setScreen("home");
        return;
      }
    } else {
      result = { correct: selectedAnswer === q.answer, correctIndex: q.answer, explanation: q.explanation };
    }

    // Runtime consistency check: verify the correct answer text matches expectations
    if (q._correctText && typeof result.correctIndex === "number" && q.options[result.correctIndex] !== q._correctText) {
      console.error("[QUIZ_DEBUG] ANSWER MISMATCH at submit!", {
        question: q.q, correctIndex: result.correctIndex,
        optionAtIndex: q.options[result.correctIndex], expectedText: q._correctText,
        allOptions: q.options, answerField: q.answer,
      });
    }
    console.debug("[QUIZ_DEBUG] handleSubmit", {
      question: q.q?.slice(0, 60), selectedAnswer, selectedText: q.options[selectedAnswer],
      correctIndex: result.correctIndex, correctText: q.options[result.correctIndex],
      storedCorrectText: q._correctText, isCorrect: result.correct,
    });

    setAnswerResult(result);
    setCheckingAnswer(false);
    setShowExplanation(true);

    const correct = result.correct;
    if (correct) {
      topicCorrectRef.current += 1;
      setFlash(true); setTimeout(() => setFlash(false), 600);
      if (!isRetryRef.current) setSessionScore(p => p + (LEVEL_CONFIG[selectedLevel]?.points ?? 0));
    }
    setQuizHistory(prev => {
      if (prev.length > questionIndex) return prev; // guard against double-submit
      return [...prev, { q: q.q, options: q.options, answer: result.correctIndex, chosen: selectedAnswer, explanation: result.explanation }];
    });
    // Immediately persist wrong answer so it survives mid-quiz exits
    const isFree = isFreeMode(selectedTopic?.id);
    if (!correct && !isFree && !isRetryRef.current && selectedTopic && selectedLevel) {
      const key = `${selectedTopic.id}_${selectedLevel}`;
      setCompletedTopics(prev => {
        const existing = prev[key] || { correct: 0, total: 0, wrongQuestions: [], wrongIndices: [] };
        return { ...prev, [key]: { ...existing, wrongQuestions: [...(existing.wrongQuestions || []), { q: q.q, options: q.options, answer: result.correctIndex }], wrongIndices: [...(existing.wrongIndices || []), questionIndex] } };
      });
    }
    // Single atomic setStats call - prevents React batching from clobbering streak
    // total_score accumulates on every correct answer (all modes). It never snaps back.
    // best_score (canonical) is computed separately at quiz completion.
    setStats(prev => {
      if (isRetryRef.current) return prev;
      const streak = correct ? prev.current_streak + 1 : 0;
      const points = correct ? (LEVEL_CONFIG[selectedLevel]?.points ?? 0) : 0;
      return {
        ...prev,
        current_streak: isFree ? prev.current_streak : streak,
        max_streak:     isFree ? prev.max_streak     : Math.max(prev.max_streak, streak),
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        total_correct:  isFree ? prev.total_correct  : (correct ? prev.total_correct + 1 : prev.total_correct),
        total_score:    prev.total_score + points,
      };
    });
    if (!isRetryRef.current && !isFree) {
      setTopicStats(prev => {
        const curr = prev[selectedTopic.id] || { answered: 0, correct: 0 };
        return { ...prev, [selectedTopic.id]: { answered: curr.answered + 1, correct: curr.correct + (correct ? 1 : 0) } };
      });
      if (correct) {
        try {
          const freeKey = currentQuestions[questionIndex].q.slice(0, 100);
          const scored = new Set(safeGetJSON("scoredFreeKeys_v1", []));
          scored.add(freeKey);
          localStorage.setItem("scoredFreeKeys_v1", JSON.stringify([...scored]));
        } catch {}
      }
    }
    // ── Analytics ──
    window.va?.track("question_answered", { questionNumber: questionIndex + 1, correct, topic: selectedTopic?.name || selectedTopic?.id });
    if (!correct) window.va?.track("question_failed", { questionNumber: questionIndex + 1, topic: selectedTopic?.name || selectedTopic?.id });
    if (correct && stats.current_streak === 0) window.va?.track("streak_started", { topic: selectedTopic?.name || selectedTopic?.id });
    } catch (err) {
      console.error("handleSubmit error:", err);
      submittingRef.current = false;
      setCheckingAnswer(false);
    }
  };

  const nextQuestion = async () => {
    console.debug("[FINISH_DEBUG] nextQuestion called", { questionIndex, total: currentQuestions.length, retryMode, isLast: questionIndex >= currentQuestions.length - 1 });
    const isLast = questionIndex >= currentQuestions.length - 1;
    if (isLast) {
      const finalCorrect = topicCorrectRef.current;

      // Retry-wrong-answers mode: if all retried questions answered correctly, mark level 100%
      if (retryMode) {
        setRetryMode(false);
        clearQuizState();
        if (finalCorrect === currentQuestions.length) {
          // Upgrade stored result to 100% (score stays the same - only marks as complete)
          const key = `${selectedTopic.id}_${selectedLevel}`;
          const prevResult = completedTopics[key];
          if (prevResult) {
            const newCompleted = { ...completedTopics, [key]: { ...prevResult, correct: prevResult.total, retryComplete: true, wrongIndices: [], wrongQuestions: [] } };
            setCompletedTopics(newCompleted);
            try { if (!isFreeMode(selectedTopic.id)) await saveUserData(stats, newCompleted, unlockedAchievements); } catch (e) { console.error("[FINISH_DEBUG] saveUserData error (retry):", e.message); }
          }
          setAllowNextLevel(true);
        } else {
          setAllowNextLevel(false);
        }
        submittingRef.current = false;
        updateDailyStreak();
        console.debug("[FINISH_DEBUG] setScreen topicComplete (retry path)");
        setScreen("topicComplete");
        return;
      }

      try {
      const key = `${selectedTopic.id}_${selectedLevel}`;
      const prevResult = completedTopics[key];
      const bestCorrect = prevResult ? Math.min(Math.max(prevResult.correct, finalCorrect), currentQuestions.length) : Math.min(finalCorrect, currentQuestions.length);
      // Signal whether this session improved the stored best result (used by completion screen messaging)
      bestImprovedRef.current = isFreeMode(selectedTopic.id) || !prevResult || finalCorrect > prevResult.correct;
      // Preserve retryComplete so replaying doesn't re-lock the next level
      const keepRetryComplete = prevResult?.retryComplete || bestCorrect === currentQuestions.length;
      const wrongIdx = !isFreeMode(selectedTopic.id) ? quizHistory.map((h,i)=>h.chosen!==h.answer?i:null).filter(v=>v!==null) : (completedTopics[key]?.wrongIndices??[]);
      // Store full wrong-question data so the Mistakes screen doesn't depend on local content order
      const wrongQuestions = !isFreeMode(selectedTopic.id)
        ? quizHistory.filter(h=>h.chosen!==h.answer).map(h=>({q:h.q,options:h.options,answer:h.answer}))
        : (completedTopics[key]?.wrongQuestions??[]);
      const newCompleted = { ...completedTopics, [key]: { correct: bestCorrect, total: currentQuestions.length, wrongIndices: wrongIdx, wrongQuestions, ...(keepRetryComplete ? { retryComplete: true } : {}) } };
      // total_score is already accumulated per-answer - don't override it.
      // best_score tracks the canonical best-topic score separately.
      const newStats = { ...stats, best_score: computeScore(newCompleted) };
      const newAch = [
        ...unlockedAchievements,
        ...ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(newStats, newCompleted)).map(a => a.id),
      ];
      clearQuizState();
      submittingRef.current = false;
      lastSessionScoreRef.current = sessionScore;
      setSessionScore(0);
      setCompletedTopics(newCompleted); setStats(newStats); setUnlockedAchievements(newAch);
      if (!isFreeMode(selectedTopic.id)) {
        try { await saveUserData(newStats, newCompleted, newAch); } catch (e) { console.error("[FINISH_DEBUG] saveUserData error:", e.message); }
        const allPerfect = LEVEL_ORDER.every(lvl => {
          const r = newCompleted[`${selectedTopic.id}_${lvl}`];
          return r && r.correct === r.total;
        });
        if (allPerfect) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }
      }
      updateDailyStreak();
      window.va?.track("quiz_completed", { score: finalCorrect, totalQuestions: currentQuestions.length, topic: selectedTopic?.name || selectedTopic?.id });
      if (finalCorrect < currentQuestions.length) window.va?.track("quiz_failed", { score: finalCorrect, topic: selectedTopic?.name || selectedTopic?.id });
      } catch (err) {
        console.error("[FINISH_DEBUG] nextQuestion error:", err.message);
        submittingRef.current = false;
      }
      console.debug("[FINISH_DEBUG] setScreen topicComplete (normal path)");
      setScreen("topicComplete");
    } else {
      submittingRef.current = false;
      liveIndexRef.current = questionIndex + 1;
      setQuestionIndex(p => p + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowExplanation(false);      setAnswerResult(null);
      if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[selectedLevel] || 25) : (TIMER_DURATIONS[selectedLevel] || 30));
    }
  };
  handleSubmitRef.current = handleSubmit;
  nextQuestionRef.current = nextQuestion;

  const startTopic = async (topic, level) => {
    quizRunIdRef.current = Date.now().toString(36);
    answerCacheRef.current = {};
    liveIndexRef.current = 0;
    submittingRef.current = false;
    clearQuizState();
    isRetryRef.current = false; // Only the explicit "retry wrong answers" flow sets this true
    setAnswerResult(null);
    let rawQs, theory;
    if (supabase) {
      setLoadingQuestions(true);
      try {
        [rawQs, theory] = await Promise.all([
          fetchQuizQuestions(supabase, topic.id, level, lang),
          fetchTheory(supabase, topic.id, level, lang),
        ]);
      } catch {
        rawQs = lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions;
        theory = lang === "en" ? topic.levels[level].theoryEn : topic.levels[level].theory;
      }
      setLoadingQuestions(false);
    } else {
      rawQs = lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions;
      theory = lang === "en" ? topic.levels[level].theoryEn : topic.levels[level].theory;
    }
    setTopicQuestions(shuffleOptions(rawQs || []));
    setTheoryContent(theory);
    // Clear incremental wrong answers from any previous abandoned attempt
    const tKey = `${topic.id}_${level}`;
    setCompletedTopics(prev => {
      const existing = prev[tKey];
      if (!existing) return prev;
      return { ...prev, [tKey]: { ...existing, wrongQuestions: [], wrongIndices: [] } };
    });
    setSelectedTopic(topic); setSelectedLevel(level); setTopicScreen("theory");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);    topicCorrectRef.current = 0;
    lastSessionScoreRef.current = 0; bestImprovedRef.current = true;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[level] || 25) : (TIMER_DURATIONS[level] || 30));
    setScreen("topic");
    if (isGuest) achievementsLoaded.current = true;
    window.va?.track("quiz_started", { topic: topic.name || topic.id, difficulty: level, mode: getGameMode(topic, level) });
    quizzesPlayedRef.current += 1;
    if (isGuest) window.va?.track("guest_play_started", { topic: topic.name || topic.id });
  };

  const startMixedQuiz = async () => {
    quizRunIdRef.current = Date.now().toString(36);
    answerCacheRef.current = {};
    liveIndexRef.current = 0;
    submittingRef.current = false;
    clearQuizState();
    setAnswerResult(null);
    let rawQs;
    if (supabase) {
      setLoadingQuestions(true);
      try {
        rawQs = await fetchMixedQuestions(supabase, lang, 10);
      } catch {
        const all = [];
        TOPICS.forEach(topic => {
          LEVEL_ORDER.forEach(level => {
            const qs = lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions;
            qs.forEach(q => all.push(q));
          });
        });
        for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
        }
        rawQs = all.slice(0, 10);
      }
      setLoadingQuestions(false);
    } else {
      const all = [];
      TOPICS.forEach(topic => {
        LEVEL_ORDER.forEach(level => {
          const qs = lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions;
          qs.forEach(q => all.push(q));
        });
      });
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
      }
      rawQs = all.slice(0, 10);
    }
    setMixedQuestions(shuffleOptions(rawQs));
    isRetryRef.current = false;
    setSelectedTopic(MIXED_TOPIC); setSelectedLevel("mixed"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);    topicCorrectRef.current = 0; lastSessionScoreRef.current = 0; bestImprovedRef.current = true;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? INTERVIEW_DURATIONS.mixed : TIMER_DURATIONS.mixed);
    setScreen("topic");
    window.va?.track("quiz_started", { topic: "Mixed Quiz", difficulty: "mixed", mode: "mixed" });
    quizzesPlayedRef.current += 1;
    if (isGuest) window.va?.track("guest_play_started", { topic: "Mixed Quiz" });
  };

  const startDailyChallenge = async () => {
    quizRunIdRef.current = Date.now().toString(36);
    answerCacheRef.current = {};
    liveIndexRef.current = 0;
    submittingRef.current = false;
    clearQuizState();
    setAnswerResult(null);
    let dailyQs;
    if (supabase) {
      setLoadingQuestions(true);
      try {
        dailyQs = await fetchDailyQuestions(supabase, lang, 5);
      } catch {
        dailyQs = null;
      }
      setLoadingQuestions(false);
    }
    if (!dailyQs) {
      // Offline fallback - annual-seeded shuffle + daily window
      const pool = lang === "en" ? DAILY_QUESTIONS.en : DAILY_QUESTIONS.he;
      const annualSeed = new Date().getFullYear() * 31337;
      const annualRng = mulberry32(annualSeed);
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(annualRng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
      const numWindows = Math.floor(shuffled.length / 5);
      const startIdx = (dayOfYear % numWindows) * 5;
      dailyQs = shuffled.slice(startIdx, startIdx + 5);
    }
    setMixedQuestions(shuffleOptions(dailyQs));
    isRetryRef.current = false;
    setSelectedTopic(DAILY_TOPIC); setSelectedLevel("daily"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);    topicCorrectRef.current = 0; lastSessionScoreRef.current = 0; bestImprovedRef.current = true;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? INTERVIEW_DURATIONS.daily : TIMER_DURATIONS.daily);
    setScreen("topic");
    window.va?.track("quiz_started", { topic: "Daily Challenge", difficulty: "daily", mode: "daily" });
    quizzesPlayedRef.current += 1;
    if (isGuest) window.va?.track("guest_play_started", { topic: "Daily Challenge" });
  };

  // Reset per-question ephemeral state when navigating to a different question
  useEffect(() => {
    setTryAgainActive(false);
    setTryAgainSelected(null);
    setHintVisible(false);
    setEliminatedOption(null);
  }, [questionIndex]);

  const handleEliminate = () => {
    if (eliminatedOption !== null || submitted) return;
    const q = currentQuestions[questionIndex];
    if (typeof q.answer !== "number") return; // Not available in online mode
    const wrong = q.options
      .map((_, i) => i)
      .filter(i => i !== q.answer && (selectedAnswer === null || i !== selectedAnswer));
    if (!wrong.length) return;
    setEliminatedOption(wrong[Math.floor(Math.random() * wrong.length)]);
  };

  const updateDailyStreak = () => {
    const today = getTodayLocal();
    setDailyStreak(prev => {
      if (prev.date === today) return prev; // already played today
      let newStreak = 1;
      if (prev.date) {
        const prevDate = new Date(prev.date + "T12:00:00");
        const todayDate = new Date(today + "T12:00:00");
        const diffDays = Math.round((todayDate - prevDate) / 86400000);
        if (diffDays === 1) newStreak = (prev.streak || 0) + 1;
      }
      const next = { date: today, streak: newStreak };
      try { localStorage.setItem("daily_streak_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleBookmark = () => {
    const q = currentQuestions[questionIndex];
    if (!q || !selectedTopic || !selectedLevel) return;
    const qid = makeQuestionId(selectedTopic.id, selectedLevel, questionIndex);
    setBookmarks(prev => {
      const next = prev.some(b => b.question_id === qid)
        ? prev.filter(b => b.question_id !== qid)
        : [...prev, {
            question_id: qid, topic_id: selectedTopic.id, topic_name: selectedTopic.name,
            topic_color: selectedTopic.color, level: selectedLevel, question_index: questionIndex,
            question_text: q.q, options: q.options, answer: answerResult?.correctIndex ?? q.answer, explanation: answerResult?.explanation ?? q.explanation,
          }];
      try { localStorage.setItem("bookmarks_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const startBookmarksQuiz = () => {
    if (!bookmarks.length) return;
    quizRunIdRef.current = Date.now().toString(36);
    answerCacheRef.current = {};
    liveIndexRef.current = 0;
    submittingRef.current = false;
    clearQuizState();
    const qs = bookmarks.map(b => ({ q: b.question_text, options: b.options, answer: b.answer, explanation: b.explanation }));
    setMixedQuestions(shuffleOptions([...qs]));
    isRetryRef.current = false;
    setSelectedTopic(BOOKMARKS_TOPIC); setSelectedLevel("mixed"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);    topicCorrectRef.current = 0; lastSessionScoreRef.current = 0; bestImprovedRef.current = true;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? INTERVIEW_DURATIONS.mixed : TIMER_DURATIONS.mixed);
    setScreen("topic");
    setShowBookmarks(false);
    window.va?.track("quiz_started", { topic: "Saved Questions", difficulty: "mixed", mode: "bookmarks" });
    quizzesPlayedRef.current += 1;
    if (isGuest) window.va?.track("guest_play_started", { topic: "Saved Questions" });
  };

  // ── Incident Mode: persistence helpers ───────────────────────────────────
  const saveIncidentProgress = (incident, stepIndex, score, mistakes, elapsed, history) => {
    try {
      localStorage.setItem(INCIDENT_SAVE_KEY, JSON.stringify({
        incidentId: incident.id, stepIndex, score, mistakes, elapsed, history,
      }));
    } catch {}
  };
  const clearIncidentProgress = () => { try { localStorage.removeItem(INCIDENT_SAVE_KEY); } catch {} };

  // ── Incident Mode: action functions ──────────────────────────────────────
  const startIncident = async (incident) => {
    clearIncidentProgress();
    setIncidentAnswerResult(null);
    let steps = null;
    if (supabase) {
      try { steps = await fetchIncidentSteps(supabase, incident.id); } catch { steps = null; }
    }
    setIncidentSteps(steps);
    setSelectedIncident(incident);
    setIncidentStepIndex(0);
    setIncidentScore(0);
    setIncidentMistakes(0);
    setIncidentElapsed(0);
    setIncidentAnswer(null);
    setIncidentSubmitted(false);
    incidentCheckingRef.current = false;
    setIncidentHistory([]);
    setScreen("incident");
  };

  // Get the active step data, preferring server-fetched steps when available.
  // Normalizes server column names (prompt_he → promptHe) to match offline format.
  const getIncidentStep = (idx) => {
    if (incidentSteps && incidentSteps[idx]) {
      const s = incidentSteps[idx];
      return { ...s, promptHe: s.prompt_he ?? s.promptHe, optionsHe: s.options_he ?? s.optionsHe };
    }
    return selectedIncident?.steps?.[idx];
  };

  const submitIncidentStep = async (forcedAnswer) => {
    const ans = forcedAnswer !== undefined ? forcedAnswer : incidentAnswer;
    if (ans === null || incidentSubmitted || incidentCheckingRef.current || !selectedIncident) return;
    incidentCheckingRef.current = true;

    const step = getIncidentStep(incidentStepIndex);
    let correct, correctAnswer, result;

    if (supabase && step?.id) {
      try {
        const rpcResult = await checkIncidentAnswer(supabase, step.id, ans);
        correct = rpcResult.correct;
        correctAnswer = rpcResult.correct_answer;
        result = { correct, correctIndex: correctAnswer, explanation: rpcResult.explanation, explanationHe: rpcResult.explanation_he };
      } catch {
        correct = ans === step.answer;
        correctAnswer = step.answer;
        result = { correct, correctIndex: correctAnswer, explanation: step.explanation, explanationHe: step.explanationHe || step.explanation_he };
      }
    } else {
      correct = ans === step.answer;
      correctAnswer = step.answer;
      result = { correct, correctIndex: correctAnswer, explanation: step.explanation, explanationHe: step.explanationHe || step.explanation_he };
    }

    setIncidentAnswer(ans);
    setIncidentSubmitted(true);
    setIncidentAnswerResult(result);
    incidentCheckingRef.current = false;

    const newScore    = incidentScore    + (correct ? 10 : 0);
    const newMistakes = incidentMistakes + (correct ? 0 : 1);
    const newHistory  = [...incidentHistory, { chosen: ans, correct, answer: correctAnswer }];
    setIncidentScore(newScore);
    setIncidentMistakes(newMistakes);
    setIncidentHistory(newHistory);
    saveIncidentProgress(selectedIncident, incidentStepIndex, newScore, newMistakes, incidentElapsed, newHistory);
  };

  const nextIncidentStep = () => {
    const totalSteps = incidentSteps ? incidentSteps.length : selectedIncident.steps.length;
    const isLast = incidentStepIndex >= totalSteps - 1;
    if (isLast) {
      clearIncidentProgress();
      setScreen("incidentComplete");
    } else {
      const nextIdx = incidentStepIndex + 1;
      setIncidentStepIndex(nextIdx);
      setIncidentAnswer(null);
      setIncidentSubmitted(false);
      setIncidentAnswerResult(null);
      incidentCheckingRef.current = false;
      saveIncidentProgress(selectedIncident, nextIdx, incidentScore, incidentMistakes, incidentElapsed, incidentHistory);
    }
  };

  const resumeIncident = () => {
    if (!incidentResume) return;
    const { incident, stepIndex, score, mistakes, elapsed, history } = incidentResume;
    setSelectedIncident(incident);
    setIncidentStepIndex(stepIndex);
    setIncidentScore(score);
    setIncidentMistakes(mistakes);
    setIncidentElapsed(elapsed);
    setIncidentAnswer(null);
    setIncidentSubmitted(false);
    setIncidentHistory(history || []);
    setIncidentResume(null);
    setScreen("incident");
  };

  const buildIncidentShareMsg = () => {
    if (!selectedIncident) return "";
    const maxScore = selectedIncident.steps.length * 10;
    const time = formatIncidentTime(incidentElapsed);
    return `KubeQuest Incident\n${selectedIncident.title}\nScore: ${incidentScore}/${maxScore} · Time: ${time}\n\nhttps://kubequest.online`;
  };

  const handleIncidentShare = () => {
    const msg = buildIncidentShareMsg();
    navigator.clipboard?.writeText(msg).catch(() => {});
    setIncidentShareCopied(true);
    setTimeout(() => setIncidentShareCopied(false), 3000);
  };

  // Keyboard shortcuts: 1-4 to pick answer, Enter to confirm/next
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz" || isInHistoryMode) return;
    const handler = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!submitted) { handleSubmitRef.current(); } else if (showExplanation) { nextQuestionRef.current(); }
        return;
      }
      const idx = ["1","2","3","4"].indexOf(e.key);
      if (!submitted && idx !== -1 && currentQuestions[questionIndex] && idx < currentQuestions[questionIndex].options.length) {
        setSelectedAnswer(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, topicScreen, submitted, selectedAnswer, questionIndex, showExplanation]);

  // Timer countdown
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz" || (!timerEnabled && !isInterviewMode) || submitted || timeLeft <= 0 || isInHistoryMode || tryAgainActive) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, topicScreen, timerEnabled, isInterviewMode, submitted, timeLeft, tryAgainActive]);

  // Timer expired – force-submit as missed
  useEffect(() => {
    if (timeLeft !== 0 || submitted || screen !== "topic" || topicScreen !== "quiz" || (!timerEnabled && !isInterviewMode) || isInHistoryMode || tryAgainActive) return;
    if (submittingRef.current) return; // guard against race with manual submit
    const q = currentQuestions[questionIndex];
    if (!q) return; // guard: stale timer firing during state transition
    submittingRef.current = true;
    setSubmitted(true);

    // Fetch correct answer from server (online) or use local field (offline)
    (async () => {
      let result;
      if (supabase && q.id) {
        try {
          const isDaily = selectedTopic?.id === "daily";
          const rpcResult = isDaily
            ? await checkDailyAnswer(supabase, q.id, 0)
            : await checkQuizAnswer(supabase, q.id, 0);
          const correctIndex = q._optionMap ? q._optionMap.indexOf(rpcResult.correct_answer) : rpcResult.correct_answer;
          result = { correct: false, correctIndex, explanation: rpcResult.explanation };
        } catch {
          result = { correct: false, correctIndex: q.answer ?? 0, explanation: q.explanation || "" };
        }
      } else {
        result = { correct: false, correctIndex: q.answer ?? 0, explanation: q.explanation || "" };
      }
      setAnswerResult(result);
      setShowExplanation(true);
      setQuizHistory(prev => [...prev, { q: q.q, options: q.options, answer: result.correctIndex, chosen: -1, explanation: result.explanation }]);
    })();

    if (!isRetryRef.current) {
      const isFree = isFreeMode(selectedTopic?.id);
      setStats(prev => ({
        ...prev,
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        // Free-mode timer expiry must NOT reset persistent streak
        current_streak: isFree ? prev.current_streak : 0,
      }));
      if (!isFree) {
        setTopicStats(prev => {
          const curr = prev[selectedTopic.id] || { answered: 0, correct: 0 };
          return { ...prev, [selectedTopic.id]: { answered: curr.answered + 1, correct: curr.correct } };
        });
      }
    }
  }, [timeLeft]);

  // Fetch online incident steps after auto-resume (incidentSteps is null on page load)
  useEffect(() => {
    if (screen !== "incident" || !selectedIncident || incidentSteps) return;
    if (!supabase) return;
    fetchIncidentSteps(supabase, selectedIncident.id)
      .then(steps => { if (steps) setIncidentSteps(steps); })
      .catch(() => {}); // silently fall back to offline steps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, selectedIncident]);

  // ── Incident Mode: count-up timer (only runs while on the incident screen) ─
  useEffect(() => {
    if (screen !== "incident") { clearInterval(incidentTimerRef.current); return; }
    incidentTimerRef.current = setInterval(() => setIncidentElapsed(p => p + 1), 1000);
    return () => clearInterval(incidentTimerRef.current);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderTheory = (text) => {
    let inCode = false;
    return text.split('\n').map((line, i) => {
      if (line === 'CODE:') {
        inCode = true;
        return <div key={i} style={{color:"#00D4FF",fontSize:10,fontWeight:800,marginTop:14,marginBottom:4,letterSpacing:2,opacity:0.7,direction:"ltr",textAlign:"left"}}>YAML / BASH</div>;
      }
      if (inCode) return (
        <div key={i} style={{fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",fontSize:11,color:"var(--code-text)",lineHeight:1.8,
          whiteSpace:"pre",direction:"ltr",textAlign:"left"}}>  {line}</div>
      );
      if (line.startsWith('🔹')) {
        const text = line.slice(2).trimStart();
        return (
          <div key={i} style={{display:"flex",flexDirection:dir==="rtl"?"row-reverse":"row",alignItems:"flex-start",gap:6,marginBottom:5}}>
            <span style={{flexShrink:0,fontSize:13,lineHeight:1.6}}>🔹</span>
            <span style={{color:"var(--text-secondary)",fontSize:13,flex:1,lineHeight:1.6,direction:dir,textAlign:dir==="rtl"?"right":"left"}}>{renderBidiBlock(text,lang)}</span>
          </div>
        );
      }
      if (!line.trim()) return <div key={i} style={{height:6}}/>;
      return <div key={i} style={{color:"var(--text-primary)",fontSize:15,fontWeight:700,marginBottom:8}}>{line}</div>;
    });
  };

  // Renders inline backtick code spans: `command` → <code>command</code>
  const renderInline = (text) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 2
        ? <code key={i} style={{fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",fontSize:"0.88em",color:"var(--code-text)",background:"rgba(0,212,255,0.06)",borderRadius:4,padding:"1px 5px",direction:"ltr",unicodeBidi:"isolate"}}>{part.slice(1,-1)}</code>
        : part
    );
  };

  // Renders incident explanation as short paragraphs for readability.
  // Uses renderBidi for proper K8s term styling + backtick handling in Hebrew mode.
  const renderIncidentExplanation = (text) => {
    if (!text) return null;
    const sentences = text.split(/\.\s+(?=[A-Z\u0590-\u05FFa-z`])/).filter(s => s.trim());
    if (sentences.length <= 1) {
      return <div dir={lang==="he"?"rtl":"ltr"} style={{color:"var(--text-secondary)",fontSize:13,lineHeight:1.8,direction:lang==="he"?"rtl":"ltr",textAlign:lang==="he"?"right":"left"}}>{lang === "he" ? renderBidiBlock(text, lang) : renderInline(text)}</div>;
    }
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {sentences.map((s, i) => {
          const cleaned = s.replace(/\.+$/, "") + ".";
          return (
            <div key={i} dir={lang==="he"?"rtl":"ltr"} style={{color:"var(--text-secondary)",fontSize:13,lineHeight:1.8,textAlign:lang==="he"?"right":"left"}}>
              {lang === "he" ? renderBidiBlock(cleaned, lang) : renderInline(cleaned)}
            </div>
          );
        })}
      </div>
    );
  };

  // Renders incident step prompt: title (bold), facts (normal), terminal (monospace), question (amber).
  const renderIncidentPrompt = (text) => {
    if (!text) return null;
    const terminalPat = /^(kubectl|NAME\s|READY|STATUS\s|\s{2,}|[a-z0-9]+(-[a-z0-9]+)+\s|FATAL|Error|Failed|rpc error|unauthorized|  [A-Za-z])/;
    const _hasHe = (s) => /[\u0590-\u05FF]/.test(s);
    const lines = text.split("\n");
    const titleIdx = lines.findIndex(l => l.trim() && !(!_hasHe(l) && terminalPat.test(l)));
    let questionIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) { if (lines[i].trim().endsWith("?")) { questionIdx = i; break; } }
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} style={{height:6}}/>;
      if (!_hasHe(line) && terminalPat.test(line)) {
        return <div key={i} style={{fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",fontSize:12,color:"var(--code-text)",lineHeight:1.9,direction:"ltr",textAlign:"left",whiteSpace:"pre"}}>{line}</div>;
      }
      const isTitle = i === titleIdx;
      const isQ = i === questionIdx && i !== titleIdx;
      const style = isTitle ? {color:"var(--text-bright)",fontSize:15,fontWeight:700,lineHeight:1.6,marginBottom:2} : isQ ? {color:"#fbbf24",fontSize:14,fontWeight:600,lineHeight:1.8,marginTop:4} : {color:"var(--text-primary)",fontSize:14,lineHeight:1.8,marginBottom:4};
      return <div key={i} dir="auto" style={style}>{lang === "he" ? renderBidiBlock(line, lang) : renderInline(line)}</div>;
    });
  };

const displayName = isGuest ? t("guestName") : (user?.user_metadata?.username || user?.email?.split("@")[0] || t("guestName"));

  if (!authChecked || !minLoadElapsed || (!!user && !isGuest && !dataLoaded)) {
    return (
    <div data-kq-rendered="loading" style={{minHeight:"100vh",background:"var(--bg-body)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif"}}>
      <style>{`
        @keyframes lspin  { from { transform: rotate(0deg)   } to { transform: rotate(360deg)  } }
        @keyframes lspin2 { from { transform: rotate(0deg)   } to { transform: rotate(-360deg) } }
        @keyframes lshine { from { background-position: 0% center } to { background-position: -200% center } }
        @keyframes lpulse { 0%,100% { opacity:.5; transform: translate(-50%,-50%) scale(1)   }
                            50%      { opacity:1; transform: translate(-50%,-50%) scale(1.25) } }
      `}</style>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>

        {/* ── Brand ── */}
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <svg width="54" height="54" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
            style={{flexShrink:0,filter:"drop-shadow(0 0 14px rgba(0,212,255,0.45))"}}>
            <defs>
              <radialGradient id="lbg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#020817"/></radialGradient>
              <linearGradient id="lgr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF6B35"/></linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#lbg)"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#lgr)" strokeWidth="4" opacity="0.9"/>
            <g transform="translate(50,50)" stroke="url(#lgr)" strokeWidth="2.8" strokeLinecap="round">
              {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i)=><line key={i} x1="0" y1="-18" x2="0" y2="-34" transform={`rotate(${deg})`}/>)}
            </g>
            <circle cx="50" cy="50" r="10" fill="none" stroke="url(#lgr)" strokeWidth="3"/>
            <circle cx="50" cy="50" r="5" fill="#00D4FF"/>
            {[["#00D4FF",0],["#7B9FF7",51.4],["#A855F7",102.8],["#CC60CC",154.2],["#FF6B35",205.7],["#FF8C35",257.1],["#44AAEE",308.5]].map(([c,deg],i)=><circle key={i} cx="50" cy="16" r="3.5" fill={c} transform={deg?`rotate(${deg},50,50)`:""}/>)}
          </svg>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:27,fontWeight:900,lineHeight:1,letterSpacing:-0.5,
              background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",backgroundSize:"300% auto",
              animation:"lshine 9s linear infinite"}}>KubeQuest</div>
            <div style={{fontSize:11,color:"#475569",letterSpacing:0.4,marginTop:3}}>Train Your Kubernetes Skills</div>
          </div>
        </div>

        {/* ── Spinner ── */}
        <div style={{position:"relative",width:64,height:64}}>
          {/* Outer ring - comet arc, clockwise */}
          <svg width="64" height="64" viewBox="0 0 64 64" style={{position:"absolute",inset:0,animation:"lspin 1.3s linear infinite"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sg1" gradientUnits="userSpaceOnUse" x1="64" y1="0" x2="0" y2="64">
                <stop offset="0%" stopColor="#00D4FF"/>
                <stop offset="100%" stopColor="#00D4FF" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke="url(#sg1)" strokeWidth="3"
              strokeLinecap="round" strokeDasharray="90 86"/>
          </svg>
          {/* Inner ring - comet arc, counter-clockwise */}
          <svg width="64" height="64" viewBox="0 0 64 64" style={{position:"absolute",inset:0,animation:"lspin2 1.9s linear infinite"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sg2" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="64" y2="0">
                <stop offset="0%" stopColor="#A855F7"/>
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5"/>
            <circle cx="32" cy="32" r="18" fill="none" stroke="url(#sg2)" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray="56 57"/>
          </svg>
          {/* Pulsing center dot */}
          <div style={{position:"absolute",top:"50%",left:"50%",width:9,height:9,borderRadius:"50%",
            background:"#00D4FF",boxShadow:"0 0 12px 3px rgba(0,212,255,0.6)",
            animation:"lpulse 1.6s ease-in-out infinite"}}/>
        </div>

        {/* ── Loading text ── */}
        <div style={{color:"var(--text-dim)",fontSize:13,letterSpacing:0.5}}>{t("loadingText")}</div>

        {/* ── Debug panel (visible after 2 s) ── */}
        {bootElapsed >= 2 && (
          <div style={{marginTop:20,fontFamily:"monospace",fontSize:10,color:"var(--text-dim)",textAlign:"left",background:"var(--glass-20)",padding:8,borderRadius:6,lineHeight:1.6}}>
            <div>boot: {bootElapsed}s | gate: auth={String(authChecked)} data={String(dataLoaded)} min={String(minLoadElapsed)}</div>
            <div>user: {user ? (isGuest ? "guest" : user.id?.slice(0,8)) : "null"} | supabase: {supabase ? "ok" : "none"}</div>
            {lockInfo && <div>{lockInfo}</div>}
          </div>
        )}

        {/* ── Recovery buttons (visible after 3 s) ── */}
        {bootElapsed >= 3 && (
          <div style={{marginTop:12,display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={() => { setAuthChecked(true); setDataLoaded(true); setUser(null); loadingDataRef.current = false; }}
              style={{padding:"6px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#94a3b8",fontSize:11,cursor:"pointer"}}>
              Continue to login
            </button>
            <button onClick={() => {try{localStorage.clear();sessionStorage.clear()}catch{} window.location.reload()}}
              style={{padding:"6px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,color:"#ef4444",fontSize:11,cursor:"pointer"}}>
              Clear data &amp; reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
  }

  if (!user && !isStatusDomain) return (
    <div data-kq-rendered="auth" style={{minHeight:"100vh",background:"var(--gradient-body-simple)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,padding:"20px"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.2)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}button,input{font-family:inherit}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #00D4FF;outline-offset:2px;border-radius:4px}.gbtn:hover{background:rgba(0,212,255,0.13)!important;border-color:rgba(0,212,255,0.5)!important;color:#00D4FF!important;transform:translateY(-2px)}`}</style>
      <div style={{width:"100%",maxWidth:400,animation:"fadeIn 0.4s ease"}}>
        {/* Language switcher + theme toggle */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",direction:"ltr",marginBottom:12,gap:8}}>
          {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
          <LangSwitcher lang={lang} setLang={setLang}/>
          <button onClick={toggleTheme} aria-label={theme==="dark"?"Switch to light mode":"Switch to dark mode"}
            style={{background:"var(--glass-4)",border:"1px solid var(--glass-12)",borderRadius:8,color:"var(--text-secondary)",padding:"6px 10px",fontSize:13,cursor:"pointer"}}>
            {theme==="dark"?"☀️":"🌙"}
          </button>
        </div>

        <div style={{textAlign:"center",marginBottom:34}}>
          <svg width="64" height="64" viewBox="0 0 100 100" style={{marginBottom:10,filter:"drop-shadow(0 0 18px rgba(0,212,255,0.45))"}} xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="ibg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#020817"/></radialGradient><linearGradient id="igr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF6B35"/></linearGradient></defs>
            <circle cx="50" cy="50" r="50" fill="url(#ibg)"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#igr)" strokeWidth="4" opacity="0.9"/>
            <g transform="translate(50,50)" stroke="url(#igr)" strokeWidth="2.8" strokeLinecap="round">
              {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i)=><line key={i} x1="0" y1="-18" x2="0" y2="-34" transform={`rotate(${deg})`}/>)}
            </g>
            <circle cx="50" cy="50" r="10" fill="none" stroke="url(#igr)" strokeWidth="3"/>
            <circle cx="50" cy="50" r="5" fill="#00D4FF"/>
            {[["#00D4FF",0],["#7B9FF7",51.4],["#A855F7",102.8],["#CC60CC",154.2],["#FF6B35",205.7],["#FF8C35",257.1],["#44AAEE",308.5]].map(([c,deg],i)=><circle key={i} cx="50" cy="16" r="3.5" fill={c} transform={deg?`rotate(${deg},50,50)`:""}/>)}
          </svg>
          <h1 style={{fontSize:33,fontWeight:900,margin:"0 0 6px",background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"300% auto",animation:"shine 9s linear infinite",filter:"drop-shadow(0 0 18px rgba(0,212,255,0.35))"}}>KubeQuest</h1>
          <p style={{color:"var(--text-secondary)",fontSize:14,margin:0}}>{t("tagline")}</p>
        </div>

        <button className="gbtn" onClick={()=>{setUser(GUEST_USER);try{localStorage.setItem("k8s_guest_session","1")}catch{}}}
          style={{width:"100%",padding:"18px",background:"rgba(0,212,255,0.07)",border:"2px solid rgba(0,212,255,0.3)",borderRadius:14,color:"var(--code-text)",fontSize:17,fontWeight:800,cursor:"pointer",marginBottom:6,transition:"all 0.2s",animation:"pulse 2.8s infinite"}}>
          {t("startPlaying")}
        </button>
        <p style={{textAlign:"center",color:"var(--code-text)",opacity:0.75,fontSize:12,margin:"0 0 26px"}}>{t("noRegNoPass")}</p>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <div style={{flex:1,height:1,background:"var(--glass-10)"}}/>
          <span style={{color:"var(--text-secondary)",fontSize:12,whiteSpace:"nowrap"}}>{t("saveProgress")}</span>
          <div style={{flex:1,height:1,background:"var(--glass-10)"}}/>
        </div>

        <div style={{background:"var(--glass-5)",border:"1px solid var(--glass-12)",borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",marginBottom:16,background:"var(--glass-4)",borderRadius:9,padding:3}}>
            {["login","signup"].map(s=>(
              <button key={s}
                onClick={()=>{ setAuthScreen(s); setAuthError(""); }}
                style={{flex:1,padding:"7px",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:700,
                  background:authScreen===s?"rgba(0,212,255,0.12)":"transparent",
                  color:authScreen===s?"#00D4FF":"var(--text-dim)",transition:"all 0.2s"}}>
                {s==="login"?t("loginTab"):t("signupTab")}
              </button>
            ))}
          </div>
          <form ref={authFormRef} onSubmit={e=>{e.preventDefault();authScreen==="login"?handleLogin():handleSignUp();}} autoComplete="on">
          {authScreen==="signup"&&(
            <div style={{marginBottom:11}}>
              <label htmlFor="auth-username" style={{color:"var(--text-dim)",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("username")}</label>
              <input id="auth-username" name="username" autoComplete="username" defaultValue="" placeholder="K8s Hero"
                style={{width:"100%",padding:"12px 14px",background:"var(--glass-6)",border:"1px solid var(--glass-18)",borderRadius:8,color:"var(--text-primary)",fontSize:14,boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:11}}>
            <label htmlFor="auth-email" style={{color:"var(--text-dim)",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("email")}</label>
            <input id="auth-email" type="email" name="email" autoComplete={authScreen==="login"?"username":"email"} defaultValue="" placeholder="you@example.com"
              style={{width:"100%",padding:"12px 14px",background:"var(--glass-6)",border:"1px solid var(--glass-18)",borderRadius:8,color:"var(--text-primary)",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          <div style={{marginBottom:authScreen==="login"?8:14}}>
            <label htmlFor="auth-password" style={{color:"var(--text-dim)",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("password")}</label>
            <input id="auth-password" type="password" name="password" autoComplete={authScreen==="login"?"current-password":"new-password"} defaultValue="" placeholder="••••••••"
              style={{width:"100%",padding:"12px 14px",background:"var(--glass-6)",border:"1px solid var(--glass-18)",borderRadius:8,color:"var(--text-primary)",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          {authScreen==="login"&&(
            <div style={{textAlign:dir==="rtl"?"right":"left",marginBottom:10}}>
              <button type="button" onClick={()=>{setShowResetModal(true);setResetStatus("");setResetEmail("");}}
                style={{background:"none",border:"none",color:"var(--text-dim)",fontSize:11,cursor:"pointer",padding:0,textDecoration:"underline",opacity:0.8}}>
                {t("forgotPassword")}
              </button>
            </div>
          )}
          {authError&&<div style={{marginBottom:12}}>
            <div role="alert" aria-live="assertive" style={{color:authError.startsWith("✅")?"#10B981":"#EF4444",fontSize:12,padding:"8px 12px",background:authError.startsWith("✅")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:8}}>{authError}</div>
            {authScreen==="signup"&&authError.startsWith("✅")&&<div style={{textAlign:"center",marginTop:8,fontSize:12,color:"var(--text-dim)"}}>
              {t("didntReceive")}{" "}
              <button type="button" onClick={handleResend} disabled={authLoading}
                style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:12,padding:0,textDecoration:"underline"}}>
                {t("resendBtn")}
              </button>
            </div>}
          </div>}
          <button type="submit" disabled={authLoading}
            style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#00D4FF88,#A855F788)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",opacity:authLoading?0.7:1}}>
            {authLoading?t("loading"):authScreen==="login"?t("loginBtn"):t("signupBtn")}
          </button>
          </form>
        </div>
        <p style={{textAlign:"center",color:"var(--text-dim)",fontSize:11,marginTop:22}}>
          © {year} {t("allRightsReserved")}{" "}
          <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer" style={{color:"var(--link-color)",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>
        </p>
      </div>
      {showResetModal&&(
        <div onClick={()=>setShowResetModal(false)} style={{position:"fixed",inset:0,background:"var(--overlay)",zIndex:5010,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}
            style={{background:"var(--bg-card)",border:"1px solid rgba(0,212,255,0.25)",borderRadius:18,padding:"24px 22px",width:"min(380px,100%)",animation:"fadeIn 0.3s ease",direction:dir,position:"relative"}}>
            <button onClick={()=>setShowResetModal(false)} aria-label="Close" style={{position:"absolute",top:12,[dir==="rtl"?"left":"right"]:14,background:"none",border:"none",color:"var(--text-muted)",fontSize:18,cursor:"pointer",lineHeight:1}}>✕</button>
            <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700,color:"var(--text-primary)"}}>{t("resetPasswordTitle")}</h3>
            <label style={{color:"var(--text-dim)",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("email")}</label>
            <input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="you@example.com"
              style={{width:"100%",padding:"12px 14px",background:"var(--glass-6)",border:"1px solid var(--glass-18)",borderRadius:8,color:"var(--text-primary)",fontSize:14,boxSizing:"border-box",direction:"ltr",marginBottom:14}}/>
            {resetStatus&&<div style={{marginBottom:12,fontSize:12,padding:"8px 12px",borderRadius:8,color:resetStatus.includes("\u2705")?"#10B981":"#EF4444",background:resetStatus.includes("\u2705")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)"}}>{resetStatus}</div>}
            <button onClick={handleResetPassword} disabled={!resetEmail||resetLoading}
              style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#00D4FF88,#A855F788)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",opacity:(!resetEmail||resetLoading)?0.5:1}}>
              {resetLoading?t("loading"):t("sendResetLink")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div data-kq-rendered="app" dir={isStatusDomain?"ltr":undefined} style={{minHeight:"100vh",background:"var(--gradient-body)",fontFamily:"Segoe UI, system-ui, sans-serif",direction:isStatusDomain?"ltr":dir,position:"relative",overflowX:"hidden"}}>
      {/* ── Standalone status header (status.kubequest.online only) ── */}
      {isStatusDomain && (
        <header style={{borderBottom:"1px solid var(--glass-5)",padding:"12px 24px"}}>
          <div style={{maxWidth:720,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:14,fontWeight:600,color:"var(--text-primary)",letterSpacing:-0.2}}>KubeQuest Status</div>
            <a href="https://kubequest.online" target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"var(--text-muted)",textDecoration:"none"}}>kubequest.online ↗</a>
          </div>
        </header>
      )}
      {/* Skip-to-content - invisible until focused by keyboard */}
      {!isStatusDomain && <a href="#main-content"
        style={{position:"fixed",top:-100,left:8,zIndex:9999,padding:"8px 16px",background:"#00D4FF",color:"var(--text-bright)",borderRadius:8,fontWeight:700,fontSize:14,textDecoration:"none",transition:"top 0.15s",direction:"ltr"}}
        onFocus={e=>e.currentTarget.style.top="8px"}
        onBlur={e=>e.currentTarget.style.top="-100px"}>
        {lang==="en"?"Skip to content":"דלג לתוכן"}
      </a>}
      <style>{`${a11y.reduceMotion?"*{animation:none!important;transition:none!important}":""}${a11y.highContrast?"#main-content{filter:contrast(1.4) brightness(1.06)}":""}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}@keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes confettiFall{from{top:-20px;transform:rotate(0deg);opacity:1}to{top:100vh;transform:rotate(720deg);opacity:0}}@keyframes pulseHighlight{0%{box-shadow:0 0 0 0 rgba(239,68,68,0)}60%{box-shadow:0 0 0 8px rgba(239,68,68,0.2)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}@keyframes nodePulse{0%,100%{box-shadow:0 0 10px var(--nc,#00D4FF)}50%{box-shadow:0 0 22px var(--nc,#00D4FF)}}.pulseHighlight{animation:pulseHighlight 0.5s ease 3;border-color:rgba(239,68,68,0.45)!important}.card-hover{transition:transform 0.2s;cursor:pointer}.card-hover:hover{transform:translateY(-3px)}.opt-btn{transition:all 0.15s;cursor:pointer}.opt-btn:hover{transform:translateX(-2px)}.explanation-card ul[dir="rtl"]{direction:rtl;text-align:right}.explanation-card ul[dir="rtl"] li::marker{unicode-bidi:isolate}button,input{font-family:inherit}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #00D4FF!important;outline-offset:2px;border-radius:4px}.cli-command{direction:ltr;unicode-bidi:isolate;white-space:pre-wrap;word-break:break-word;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;display:block;background:rgba(0,212,255,0.06);border-radius:6px;padding:4px 10px;color:var(--code-text);font-size:0.88em;margin-top:4px;text-align:left}.cbr-block{background:var(--code-bg-block);border:1px solid var(--glass-6);border-radius:6px;display:flex;align-items:stretch;transition:border-color 0.15s,background 0.15s;overflow:hidden}.cbr-block:hover{border-color:var(--glass-12);background:var(--code-bg-block-hover)}.cbr-code{flex:1;min-width:0;padding:10px 14px;font-family:'SF Mono','Cascadia Code','Fira Code',monospace;font-size:12.5px;color:var(--code-text);line-height:1.6;white-space:pre;overflow-x:auto;direction:ltr}.cbr-copy{flex-shrink:0;display:flex;align-items:center;gap:4px;padding:0 12px;border:none;border-left:1px solid var(--glass-6);background:transparent;color:var(--text-muted);font-size:11px;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-family:inherit;min-width:62px;justify-content:center}.cbr-copy:hover{background:var(--glass-4);color:var(--text-secondary)}.cbr-copy:focus-visible{outline:2px solid #00D4FF!important;outline-offset:-2px}.cbr-copy.copied{color:#10B981;background:rgba(16,185,129,0.08)}@media(max-width:600px){
.stats-grid{grid-template-columns:repeat(2,1fr)!important}
.page-pad{padding:12px 14px!important}
.quiz-bar-right{gap:8px!important}
.quiz-bar-right span,.quiz-bar-right button{font-size:11px!important}
.opt-btn{padding:13px 14px!important;font-size:14px!important;gap:10px!important;min-height:52px!important;line-height:1.7!important}
.incident-opt{padding:12px 12px!important;font-size:13px!important;gap:8px!important;border-radius:9px!important;line-height:1.7!important}
.explanation-card{border-radius:12px!important}
.explanation-card>div:first-child{padding:12px 16px!important}
.explanation-card>div:last-child{padding:16px!important}
.explanation-card ul{padding-inline-start:18px!important;gap:8px!important}
.explanation-card li{font-size:13px!important;line-height:1.8!important}
.home-actions{gap:5px!important}
.home-actions>button{font-size:11px!important;padding:5px 8px!important}
.home-screen{padding:12px 14px!important}
.home-header{flex-direction:column!important;gap:10px!important;min-height:auto!important}
.home-controls{position:static!important;transform:none!important;margin-bottom:4px!important}
.roadmap-row{gap:8px!important}
.roadmap-node-col{width:28px!important}
.roadmap-node-circle{width:28px!important;height:28px!important;font-size:11px!important}
.roadmap-card{padding:10px 12px!important}
.roadmap-icon{width:26px!important;height:26px!important;font-size:14px!important}
.roadmap-title{font-size:12px!important}
.roadmap-pct{min-width:30px!important}
.roadmap-card-header{gap:6px!important}
}
@media(max-width:430px){
.home-logo{width:46px!important;height:46px!important}
.guest-banner{flex-direction:column!important;align-items:stretch!important;gap:8px!important}
.guest-banner-btn{width:100%!important;text-align:center!important}
.action-card{padding:13px 14px!important}
.action-card-inner{gap:8px!important;min-width:0}
.action-emoji{font-size:22px!important;flex-shrink:0}
.action-text{min-width:0}
.topic-card-section{padding:13px 14px!important}
.stats-grid{gap:7px!important}
.stats-cell{padding:11px 6px!important}
.opt-btn{padding:12px 12px!important;font-size:13px!important;gap:8px!important;border-radius:10px!important;min-height:48px!important}
}
@media(max-width:390px){
.home-logo{width:40px!important;height:40px!important}
.home-screen{padding:10px 10px!important}
.page-pad{padding:10px 12px!important}
.topic-card-section{padding:11px 12px!important}
.stats-cell{padding:10px 4px!important;font-size:11px}
.stats-icon{font-size:15px!important}
.stats-value{font-size:17px!important}
.action-card{padding:12px 12px!important}
.action-emoji{font-size:20px!important}
.roadmap-card{padding:8px 10px!important}
.roadmap-node-col{width:24px!important}
.roadmap-node-circle{width:24px!important;height:24px!important;font-size:10px!important}
}
@media(max-width:360px){
.home-logo{width:34px!important;height:34px!important}
.home-screen{padding:8px 8px!important}
.page-pad{padding:8px 10px!important}
.topic-card-section{padding:10px 10px!important}
.stats-grid{gap:5px!important}
.stats-cell{padding:9px 3px!important}
.action-card{padding:11px 10px!important}
}@media(min-width:900px){.page-pad,.home-screen{max-width:1200px!important;padding-left:24px!important;padding-right:24px!important}.topic-card-section{transition:border-color 0.2s,box-shadow 0.2s,opacity 0.2s}.topic-next{border-color:rgba(0,212,255,0.22)!important;box-shadow:0 2px 20px rgba(0,212,255,0.07)!important}.topic-done{opacity:0.78}.home-hero{margin-bottom:10px!important}.home-screen .stats-grid{margin-bottom:18px!important}.home-screen .action-card{margin-bottom:8px!important}.topic-list{gap:10px!important}}[data-theme="light"] .cli-command{background:rgba(0,100,180,0.07)}[data-theme="light"] button:focus-visible,[data-theme="light"] input:focus-visible,[data-theme="light"] a:focus-visible{outline-color:#0284c7!important}[data-theme="light"] .cbr-copy.copied{background:rgba(16,185,129,0.12)}[data-theme="light"] .topic-next{border-color:#E5E7EB!important;box-shadow:0 1px 3px rgba(0,0,0,0.08)!important}[data-theme="light"] .topic-card-section{background:#FFFFFF!important;border-color:#E5E7EB!important;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)!important}[data-theme="light"] .stats-cell{background:#FFFFFF!important;border-color:#E5E7EB!important;box-shadow:0 1px 3px rgba(0,0,0,0.06)!important}[data-theme="light"] .action-card{background:#FFFFFF!important;border-color:#E5E7EB!important;box-shadow:0 1px 3px rgba(0,0,0,0.06)!important}[data-theme="light"] .home-header{background:#FFFFFF;border-bottom:1px solid #E5E7EB;box-shadow:0 1px 2px rgba(0,0,0,0.04)}[data-theme="light"] .roadmap-card{background:#FFFFFF!important;border-color:#E5E7EB!important;box-shadow:0 1px 3px rgba(0,0,0,0.06)!important}[data-theme="light"] .explanation-card{background:#FFFFFF!important;border-color:#E5E7EB!important}[data-theme="light"] .opt-btn{background:#FFFFFF!important;border-color:#E5E7EB!important}`}</style>
      {!isStatusDomain && <>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {flash&&!a11y.reduceMotion&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)",animation:"correctFlash 0.6s ease forwards"}}/>}
      {showConfetti&&!a11y.reduceMotion&&<Confetti/>}
      {newAchievement&&<div role="alert" aria-live="assertive" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,var(--bg-elevated),var(--bg-card))",border:"1px solid #00D4FF55",borderRadius:14,padding:"12px 22px",display:"flex",alignItems:"center",gap:12,zIndex:9999,boxShadow:"0 0 40px rgba(0,212,255,0.3)",animation:"toast 0.4s ease",direction:"ltr"}}><span aria-hidden="true" style={{fontSize:26}}>{newAchievement.icon}</span><div><div style={{color:"#00D4FF",fontWeight:800,fontSize:11,letterSpacing:1}}>{t("newAchievement")}</div><div style={{color:"var(--text-primary)",fontSize:14,fontWeight:700}}>{lang==="en"?newAchievement.nameEn:newAchievement.name}</div></div></div>}
      {saveError&&<div role="alert" aria-live="assertive" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(239,68,68,0.12)",border:"1px solid #EF444455",borderRadius:10,padding:"10px 18px",color:"#EF4444",fontSize:13,zIndex:9999}}>{saveError}</div>}
      {resumeToast&&<div role="status" aria-live="polite" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,var(--bg-elevated),var(--bg-card))",border:"1px solid rgba(0,212,255,0.35)",borderRadius:12,padding:"10px 20px",color:"#00D4FF",fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 0 20px rgba(0,212,255,0.15)",animation:"fadeIn 0.3s ease",whiteSpace:"nowrap"}}>{t("resumeToast")}</div>}

      {showResumeModal&&resumeData&&(()=>{
        const answered = resumeData.questionIndex ?? 0;
        const total    = resumeData.questions?.length ?? 0;
        const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
        return (
        <div onClick={handleResumeDismiss} style={{position:"fixed",inset:0,background:"var(--overlay)",zIndex:5002,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=="Tab")return;const f=[...e.currentTarget.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')];if(!f.length)return;const[first,last]=[f[0],f[f.length-1]];if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}else{if(document.activeElement===last){e.preventDefault();first.focus();}}}} style={{background:"var(--bg-card)",border:"1px solid rgba(0,212,255,0.25)",borderRadius:18,padding:"24px 22px",width:"min(380px,100%)",animation:"fadeIn 0.3s ease",direction:dir,position:"relative"}}>
            <button onClick={handleResumeDismiss} aria-label={lang==="en"?"Close":"סגור"} style={{position:"absolute",top:12,insetInlineEnd:14,background:"none",border:"none",color:"var(--text-muted)",fontSize:18,cursor:"pointer",lineHeight:1}}>✕</button>
            <div style={{fontSize:32,textAlign:"center",marginBottom:10}}>⏸️</div>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:18,marginBottom:8,textAlign:"center"}}>{t("resumeTitle")}</div>
            <div style={{color:"var(--text-secondary)",fontSize:13,marginBottom:16,textAlign:"center"}}>{t("resumeBody")}</div>
            {/* Quiz info pill */}
            <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:12,padding:"10px 14px",marginBottom:8,direction:"ltr"}}>
              <span style={{fontSize:22}}>{resumeData.topicIcon}</span>
              <div style={{flex:1}}>
                <div style={{color:"var(--text-primary)",fontWeight:700,fontSize:14}}>{resumeData.topicName}</div>
                <div style={{color:"var(--text-muted)",fontSize:12}}>
                  {lang==="en"?LEVEL_CONFIG[resumeData.level]?.labelEn:LEVEL_CONFIG[resumeData.level]?.label}
                </div>
              </div>
            </div>
            {/* Progress display - req 6 */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text-muted)",marginBottom:4}}>
                <span>{lang==="en"?"Progress":"התקדמות"}</span>
                <span style={{color:"#00D4FF",fontWeight:700}}>{lang==="en"?`${answered} / ${total} questions answered`:`ענית על ${answered} מתוך ${total} שאלות`}</span>
              </div>
              <div style={{height:6,background:"var(--glass-7)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00D4FF,#A855F7)",borderRadius:4,transition:"width 0.3s ease"}}/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={handleResumeQuiz} autoFocus
                style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,rgba(0,212,255,0.15),rgba(168,85,247,0.15))",border:"1px solid rgba(0,212,255,0.35)",borderRadius:12,color:"#00D4FF",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                {t("resumeBtn")} {dir==="rtl"?"◀":"▶"}
              </button>
              <div style={{color:"var(--text-dim)",fontSize:11,textAlign:"center",marginTop:-4}}>{t("resumeHint")}</div>
              <button onClick={handleDiscardResume}
                style={{width:"100%",padding:"12px",background:"var(--glass-3)",border:"1px solid var(--glass-9)",borderRadius:12,color:"var(--text-muted)",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {t("resumeDiscard")}
              </button>
              <button onClick={handleResumeDismiss}
                style={{width:"100%",padding:"10px",background:"none",border:"none",borderRadius:12,color:"var(--text-dim)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {t("back")}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── REPORT DIALOG ─────────────────────────────────── */}
      {reportDialog&&(
        <div onClick={()=>setReportDialog(null)} style={{position:"fixed",inset:0,background:"var(--overlay)",zIndex:5010,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}
            style={{background:"var(--bg-card)",border:"1px solid var(--glass-12)",borderRadius:18,padding:"22px 20px",width:"min(400px,100%)",animation:"fadeIn 0.25s ease",direction:dir,position:"relative"}}>
            <button onClick={()=>setReportDialog(null)} aria-label={t("reportCancel")}
              style={{position:"absolute",top:12,insetInlineEnd:14,background:"none",border:"none",color:"var(--text-muted)",fontSize:18,cursor:"pointer",lineHeight:1}}>✕</button>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:16,marginBottom:14}}>⚑ {t("reportTitle")}</div>
            {/* Question preview */}
            <div style={{background:"var(--glass-4)",borderRadius:10,padding:"9px 12px",marginBottom:14,color:"var(--text-secondary)",fontSize:12,lineHeight:1.5,direction:"ltr",textAlign:"left",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
              {reportDialog.qText}
            </div>
            {reportSent?(
              <div style={{textAlign:"center",padding:"16px 0",color:"#10B981",fontWeight:700,fontSize:15}}>{t("reportThanks")}</div>
            ):(
              <>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                  {[t("reportType1"),t("reportType2"),t("reportType3"),t("reportType4")].map((label,i)=>(
                    <label key={i} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"9px 12px",borderRadius:9,background:reportType===label?"rgba(0,212,255,0.08)":"var(--glass-3)",border:`1px solid ${reportType===label?"rgba(0,212,255,0.35)":"var(--glass-8)"}`,transition:"all 0.15s"}}>
                      <input type="radio" name="reportType" value={label} checked={reportType===label} onChange={()=>setReportType(label)}
                        style={{accentColor:"#00D4FF",width:15,height:15,flexShrink:0}}/>
                      <span style={{color:reportType===label?"#e2e8f0":"var(--text-secondary)",fontSize:14,fontWeight:reportType===label?700:400}}>{label}</span>
                    </label>
                  ))}
                </div>
                <textarea value={reportNote} onChange={e=>setReportNote(e.target.value)} placeholder={t("reportNote")} rows={2}
                  style={{width:"100%",background:"var(--glass-4)",border:"1px solid var(--glass-12)",borderRadius:9,color:"var(--text-primary)",fontSize:13,padding:"9px 12px",resize:"vertical",boxSizing:"border-box",outline:"none",marginBottom:14,direction:dir,fontFamily:"inherit"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setReportDialog(null)}
                    style={{flex:1,padding:"10px",background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:10,color:"var(--text-muted)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    {t("reportCancel")}
                  </button>
                  <button disabled={!reportType||reportSending} onClick={async()=>{
                    if (!reportType) return;
                    setReportSending(true);
                    try {
                      if (supabase) await supabase.from("question_reports").insert({
                        question_text: reportDialog.qText.slice(0,300),
                        report_type: reportType,
                        note: reportNote||null,
                        user_id: user?.id||null,
                        user_email: user?.email||null,
                        topic: selectedTopic?.id||null,
                        level: selectedLevel||null,
                      });
                    } catch {}
                    try {
                      await fetch("https://formspree.io/f/mjgavyae", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          question: reportDialog.qText.slice(0, 300),
                          type: reportType,
                          note: reportNote || "-",
                          topic: selectedTopic?.id || "-",
                          level: selectedLevel || "-",
                          user: user?.email || "guest",
                        }),
                      });
                    } catch {}
                    setReportSent(true);
                    setReportSending(false);
                    setTimeout(()=>setReportDialog(null), 2000);
                  }}
                    style={{flex:2,padding:"10px",background:reportType?"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.1))":"var(--glass-4)",border:`1px solid ${reportType?"rgba(239,68,68,0.4)":"var(--glass-9)"}`,borderRadius:10,color:reportType?"#EF4444":"var(--text-dim)",fontSize:13,fontWeight:700,cursor:reportType?"pointer":"default",transition:"all 0.15s",opacity:reportSending?0.7:1}}>
                    {reportSending?"...":(t("reportSend"))}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard ranks by total_score (accumulated permanently, never decremented).
           The RPC get_leaderboard orders by total_score DESC.
           best_score is NOT used for ranking - it's a per-topic canonical metric. */}
      {showLeaderboard&&<div onClick={()=>setShowLeaderboard(false)} style={{position:"fixed",inset:0,background:"var(--overlay-light)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center"}}><div role="dialog" aria-modal="true" aria-label={t("leaderboardTitle")} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=="Tab")return;const f=[...e.currentTarget.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')];if(!f.length)return;const[first,last]=[f[0],f[f.length-1]];if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}else{if(document.activeElement===last){e.preventDefault();first.focus();}}}} style={{background:"var(--bg-card)",border:"1px solid var(--glass-10)",borderRadius:16,padding:"20px 14px",width:"min(360px,calc(100vw - 32px))",maxHeight:"90vh",display:"flex",flexDirection:"column",boxSizing:"border-box",animation:"fadeIn 0.3s ease",direction:"ltr",overflowX:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexShrink:0}}><div><h3 style={{margin:0,color:"var(--text-primary)",fontSize:18,fontWeight:800}}>{t("leaderboardTitle")}</h3><div style={{fontSize:11,color:"var(--text-dim)",fontWeight:700,letterSpacing:1.5,marginTop:3}}>{lang==="en"?"TOP 10":"טופ 10"}</div><div style={{fontSize:10,color:"var(--text-dim)",opacity:0.5,fontWeight:400,marginTop:4}}>{t("leaderboardRankedBy")}</div></div><button autoFocus onClick={()=>setShowLeaderboard(false)} aria-label={lang==="en"?"Close leaderboard":"סגור לוח תוצאות"} style={{background:"none",border:"none",color:"var(--text-muted)",fontSize:18,cursor:"pointer"}}>✕</button></div>{leaderboard.length===0?<div style={{color:"var(--text-dim)",textAlign:"center",padding:"20px 0"}}>{t("noData")}</div>:<div style={{flex:1,minHeight:0,overflowY:"auto"}}>{leaderboard.length>0&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"0 10px 4px",marginBottom:4}}><span style={{width:28,flexShrink:0}}></span><div style={{flex:1,fontSize:10,color:"var(--text-dim)",opacity:0.5,fontWeight:600}}>{lang==="en"?"Player":"שחקן"}</div><div style={{fontSize:10,color:"var(--text-dim)",opacity:0.5,fontWeight:600}}>{t("leaderboardScoreCol")}</div></div>}{leaderboard.map((entry,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 10px",background:i===0?"rgba(245,158,11,0.1)":"var(--glass-3)",borderRadius:10,marginBottom:8,border:`1px solid ${i===0?"#F59E0B44":"var(--glass-6)"}`}}><span style={{fontSize:18,width:28,flexShrink:0,textAlign:"center"}}>{["🥇","🥈","🥉"][i]||`${i+1}.`}</span><div style={{flex:1,minWidth:0}}><div style={{color:"var(--text-primary)",fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.username ? (entry.username.includes("@") ? entry.username.split("@")[0] : entry.username) : t("anonymous")}</div><div style={{color:"var(--text-dim)",fontSize:11}}>🔥 {entry.max_streak}</div></div><div style={{color:"#00D4FF",fontWeight:800,fontSize:16,flexShrink:0}}>{entry.total_score}</div></div>)}</div>}{userRank&&<div style={{marginTop:4,paddingTop:12,borderTop:"1px solid var(--glass-7)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"var(--text-secondary)",fontSize:13,fontWeight:600,flexShrink:0}}><span>{lang==="en"?"Your Rank":"הדירוג שלך"}</span><span style={{color:"var(--text-primary)",fontWeight:800}}>#{userRank.rank}</span><span style={{color:"var(--glass-20)"}}>|</span><span>{t("leaderboardScoreCol")}</span><span style={{color:"#00D4FF",fontWeight:800}}>{userRank.score}</span></div>}</div></div>}

      {showBookmarks&&(
        <div onClick={()=>setShowBookmarks(false)} style={{position:"fixed",inset:0,background:"var(--overlay-light)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" aria-label={t("savedQuestionsTitle")} onClick={e=>e.stopPropagation()}
            style={{background:"var(--bg-card)",border:"1px solid var(--glass-10)",borderRadius:16,padding:20,width:"min(400px,calc(100vw - 32px))",maxHeight:"80vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease",direction:dir}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,color:"var(--text-primary)",fontSize:18,fontWeight:800}}>{t("savedQuestionsTitle")}</h3>
              <button autoFocus onClick={()=>setShowBookmarks(false)} aria-label={lang==="en"?"Close":"סגור"} style={{background:"none",border:"none",color:"var(--text-muted)",fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {bookmarks.length === 0 ? (
              <div style={{color:"var(--text-dim)",textAlign:"center",padding:"24px 0",fontSize:13}}>{t("noBookmarks")}</div>
            ) : (<>
              <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {bookmarks.map((b, i) => (
                  <div key={b.question_id} style={{background:"var(--glass-3)",border:"1px solid var(--glass-7)",borderRadius:10,padding:"11px 13px",display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:b.topic_color||"#A855F7",fontWeight:700,marginBottom:4}}>{b.topic_name} · {lang==="en"?LEVEL_CONFIG[b.level]?.labelEn:LEVEL_CONFIG[b.level]?.label}</div>
                      <div dir={dir} style={{color:"var(--text-light)",fontSize:13,lineHeight:1.5}}>{renderBidiBlock(b.question_text, lang)}</div>
                    </div>
                    <button onClick={()=>{
                      setBookmarks(prev=>{const next=prev.filter((_,j)=>j!==i);try{localStorage.setItem("bookmarks_v1",JSON.stringify(next));}catch{}return next;});
                    }} aria-label={t("removeBookmark")} style={{background:"none",border:"none",color:"var(--text-dim)",fontSize:16,cursor:"pointer",padding:4,flexShrink:0,lineHeight:1}}
                      onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}>✕</button>
                  </div>
                ))}
              </div>
              <button onClick={()=>tryStartQuiz(startBookmarksQuiz)}
                style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.1))",border:"1px solid rgba(168,85,247,0.4)",borderRadius:12,color:"#A855F7",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                {t("startSavedQuiz")}
              </button>
            </>)}
          </div>
        </div>
      )}

      {/* Dropdown menu - rendered outside <main> so CSS zoom never affects it */}
      {showMenu&&(()=>{const _br=burgerRef.current?.getBoundingClientRect();const _menuRight=_br?Math.max(8,window.innerWidth-_br.right):8;return(<>
        <div onClick={()=>setShowMenu(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
        <div style={{position:"fixed",top:82,right:_menuRight,background:"var(--bg-card)",border:"1px solid var(--glass-10)",borderRadius:14,padding:"8px 0",zIndex:200,minWidth:234,boxShadow:"var(--shadow-heavy)",animation:"fadeIn 0.15s ease",direction:"ltr",overflowY:"auto",maxHeight:"calc(100dvh - 110px)"}}>

          {/* Language + Gender */}
          <div style={{padding:"8px 14px 10px",borderBottom:"1px solid var(--glass-6)",display:"flex",gap:8,alignItems:"center",justifyContent:"center"}}>
            {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
            <LangSwitcher lang={lang} setLang={setLang}/>
          </div>

          {/* ── 1. Practice ── */}
          <div style={{padding:"10px 16px 4px"}}>
            <span style={{fontSize:10,color:"var(--text-disabled)",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"PRACTICE":"תרגול"}</span>
          </div>
          <button onClick={()=>{setScreen("incidentList");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            🚨 {lang==="en"?"Incident Mode":"מצב אירוע"}
          </button>
          <button onClick={()=>{tryStartQuiz(startMixedQuiz);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("mixedQuizBtn")}
          </button>
          <button onClick={()=>{tryStartQuiz(startDailyChallenge);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            🔥 {t("dailyChallengeTitle")}
          </button>
          <button onClick={()=>{setIsInterviewMode(p=>!p);}} aria-pressed={isInterviewMode} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:isInterviewMode?"#A855F7":"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,fontWeight:isInterviewMode?700:400,direction:dir}}>
            {t("interviewMode")}{isInterviewMode&&<span aria-hidden="true" style={{marginInlineStart:"auto",fontSize:10,color:"#A855F7"}}>ON</span>}
          </button>

          {/* ── 2. Progress ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid var(--glass-6)",marginTop:4}}>
            <span style={{fontSize:10,color:"var(--text-disabled)",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"PROGRESS":"התקדמות"}</span>
          </div>
          <button onClick={()=>{setScreen("home");setHomeTab("categories");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            ⭐ {lang==="en"?"My Stats":"הסטטיסטיקות שלי"}
          </button>
          <button onClick={()=>{setScreen("mistakes");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("mistakesBtn")}
          </button>
          <button onClick={()=>{loadLeaderboard();setShowLeaderboard(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("leaderboardBtn")}
          </button>
          <button onClick={()=>{setShowBookmarks(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,direction:dir}}>
            <span>{t("savedQuestions")}</span>
            {bookmarks.length>0&&<span style={{background:"rgba(168,85,247,0.2)",color:"#A855F7",fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{bookmarks.length}</span>}
          </button>

          {/* ── 3. Learning ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid var(--glass-6)",marginTop:4}}>
            <span style={{fontSize:10,color:"var(--text-disabled)",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"LEARNING":"למידה"}</span>
          </div>
          <button onClick={()=>{setExpandedGuideSection(null);setScreen("guide");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("guideBtn")}
          </button>
          <button onClick={()=>{setSearchQuery("");setScreen("search");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("searchBtn")}
          </button>

          {/* ── 4. Application ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid var(--glass-6)",marginTop:4}}>
            <span style={{fontSize:10,color:"var(--text-disabled)",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"APPLICATION":"האפליקציה"}</span>
          </div>
          <button onClick={()=>{setScreen("status");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            🟢 {lang==="en"?"System Status":"סטטוס מערכת"}
          </button>
          <button onClick={()=>{setScreen("about");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("aboutBtn")}
          </button>
          <button onClick={()=>{
            const url="https://kubequest.online";
            const text=lang==="en"?"KubeQuest – Practice Kubernetes Through Real DevOps Scenarios":"מצאתי דרך נחמדה לתרגל Kubernetes. משחק עם שאלות DevOps ותרחישי troubleshooting אמיתיים";
            if(navigator.share){navigator.share({title:"KubeQuest",text,url}).catch(()=>{});}
            else{navigator.clipboard?.writeText(url);}
            setShowMenu(false);
          }} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("shareBtn")}
          </button>
          <a href="mailto:ocarmeli7@gmail.com?subject=KubeQuest%20Feedback" style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,textDecoration:"none",direction:dir}}>
            <span>✉️</span>{lang==="en"?"Contact":"צור קשר"}
          </a>

          {/* ── 5. Accessibility ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid var(--glass-6)",marginTop:4}}>
            <span style={{fontSize:10,color:"var(--text-disabled)",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"ACCESSIBILITY":"נגישות"}</span>
          </div>
          <div style={{padding:"4px 14px 10px"}}>
            <div style={{display:"flex",gap:4}}>
              {(["highContrast","reduceMotion"]).map((key,i)=>(
                <button key={key} onClick={()=>updateA11y(key,!a11y[key])}
                  aria-pressed={a11y[key]}
                  style={{flex:1,padding:"6px 4px",background:a11y[key]?"rgba(0,212,255,0.1)":"var(--glass-4)",border:`1px solid ${a11y[key]?"rgba(0,212,255,0.35)":"var(--glass-8)"}`,borderRadius:6,color:a11y[key]?"#00D4FF":"var(--text-muted)",fontSize:11,cursor:"pointer",fontWeight:a11y[key]?700:400}}>
                  {i===0?t("a11yHighContrast"):t("a11yReduceMotion")}{a11y[key]?" ✓":""}
                </button>
              ))}
            </div>
            {window.speechSynthesis&&(
              <div style={{display:"flex",gap:4,marginTop:7}}>
                {screen==="topic"&&topicScreen==="quiz"&&(
                  <button onClick={speakQuestion}
                    aria-pressed={isSpeaking}
                    style={{flex:1,padding:"6px 4px",background:isSpeaking?"rgba(0,212,255,0.1)":"var(--glass-4)",border:`1px solid ${isSpeaking?"rgba(0,212,255,0.35)":"var(--glass-8)"}`,borderRadius:6,color:isSpeaking?"#00D4FF":"var(--text-muted)",fontSize:11,cursor:"pointer",fontWeight:isSpeaking?700:400}}>
                    {isSpeaking?t("stopSpeech"):t("readQuestion")}
                  </button>
                )}
                <button onClick={()=>updateA11y("autoRead",!a11y.autoRead)}
                  aria-pressed={a11y.autoRead}
                  style={{flex:1,padding:"6px 4px",background:a11y.autoRead?"rgba(0,212,255,0.1)":"var(--glass-4)",border:`1px solid ${a11y.autoRead?"rgba(0,212,255,0.35)":"var(--glass-8)"}`,borderRadius:6,color:a11y.autoRead?"#00D4FF":"var(--text-muted)",fontSize:11,cursor:"pointer",fontWeight:a11y.autoRead?700:400}}>
                  {t("autoRead")}{a11y.autoRead?" ✓":""}
                </button>
              </div>
            )}
          </div>

          {/* ── Theme toggle ── */}
          <div style={{padding:"6px 14px 8px"}}>
            <button onClick={toggleTheme}
              role="switch"
              aria-checked={theme==="light"}
              aria-label={theme==="dark"?"Switch to light mode":"Switch to dark mode"}
              style={{width:"100%",padding:"8px 12px",background:"var(--glass-3)",border:"1px solid var(--glass-8)",borderRadius:8,cursor:"pointer",display:"flex",alignItems:dir==="rtl"?"center":"center",justifyContent:"space-between",flexDirection:dir==="rtl"?"row-reverse":"row",gap:10}}>
              <span style={{fontSize:12,color:"var(--text-secondary)",fontWeight:600,direction:dir}}>
                {lang==="en"?(theme==="dark"?"Dark Mode":"Light Mode"):(theme==="dark"?"מצב כהה":"מצב בהיר")}
              </span>
              <span style={{position:"relative",width:36,height:20,borderRadius:10,background:theme==="light"?"#F59E0B":"var(--glass-15)",border:`1px solid ${theme==="light"?"rgba(245,158,11,0.4)":"var(--glass-10)"}`,transition:"background 0.2s,border-color 0.2s",flexShrink:0,display:"inline-block"}}>
                <span style={{position:"absolute",top:2,left:theme==="light"?18:2,width:14,height:14,borderRadius:"50%",background:theme==="light"?"#fff":"var(--text-muted)",transition:"left 0.2s,background 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              </span>
            </button>
          </div>

          {/* ── Divider + System ── */}
          <div style={{borderTop:"1px solid var(--glass-6)",marginTop:4,paddingTop:4}}>
            <button onClick={()=>{handleResetProgress();setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10}}>
              <span aria-hidden="true">🗑</span>{t("resetProgress")}
            </button>
            <button onClick={()=>{handleLogout();setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10}}>
              <span aria-hidden="true">🚪</span>{t("logout")}
            </button>
          </div>
        </div>
      </>);})()}
      </>}
      <main id="main-content" style={isStatusDomain ? undefined : {position:"relative",...(fs !== 1 ? {zoom: fs, width: `${+(100/fs).toFixed(4)}%`} : {})}}>
      {!isStatusDomain && <>
      {/* HOME */}
      {screen==="home"&&(
        <div className="page-pad home-screen" style={{maxWidth:700,margin:"0 auto",padding:"16px 12px",animation:"fadeIn 0.4s ease",overflowX:"hidden",direction:dir}}>
          {/* ── Hero - centered, matches loading screen composition ── */}
          <div className="home-hero" style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:16}}>
            {/* Header row: logo+title on one side, burger on the other */}
            {(()=>{
              const logoIcon=(
                <svg className="home-logo" width={54} height={54} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0,filter:"drop-shadow(0 0 14px rgba(0,212,255,0.45))"}}>
                  <defs><radialGradient id="hbg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#020817"/></radialGradient><linearGradient id="hgr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF6B35"/></linearGradient></defs>
                  <circle cx="50" cy="50" r="50" fill="url(#hbg)"/>
                  <circle cx="50" cy="50" r="44" fill="none" stroke="url(#hgr)" strokeWidth="4" opacity="0.9"/>
                  <g transform="translate(50,50)" stroke="url(#hgr)" strokeWidth="2.8" strokeLinecap="round">
                    {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i)=><line key={i} x1="0" y1="-18" x2="0" y2="-34" transform={`rotate(${deg})`}/>)}
                  </g>
                  <circle cx="50" cy="50" r="10" fill="none" stroke="url(#hgr)" strokeWidth="3"/>
                  <circle cx="50" cy="50" r="5" fill="#00D4FF"/>
                  {[["#00D4FF",0],["#7B9FF7",51.4],["#A855F7",102.8],["#CC60CC",154.2],["#FF6B35",205.7],["#FF8C35",257.1],["#44AAEE",308.5]].map(([c,deg],i)=><circle key={i} cx="50" cy="16" r="3.5" fill={c} transform={deg?`rotate(${deg},50,50)`:""}/>)}
                </svg>
              );
              const logoText=(
                <div style={{textAlign:"left"}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:6}}><h1 className="home-title-text" style={{fontSize:28,fontWeight:900,margin:0,lineHeight:1,letterSpacing:-0.5,background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",color:"transparent",backgroundSize:"300% auto",animation:"shine 9s linear infinite",whiteSpace:"nowrap"}}>KubeQuest</h1><span style={{fontSize:11,padding:"2px 6px",borderRadius:6,background:"var(--glass-8)",color:"var(--text-muted)",fontWeight:600,letterSpacing:0.3,lineHeight:1,flexShrink:0}}>Beta</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                    <span style={{fontSize:12,color:"var(--text-muted)",letterSpacing:0.3}}>Train Your Kubernetes Skills</span>
                    <span style={{fontSize:9,color:"var(--text-dim)",background:"var(--glass-5)",borderRadius:4,padding:"1px 5px",fontWeight:600,letterSpacing:0.3}}>v{APP_VERSION}</span>
                  </div>
                </div>
              );
              const logoGroup=(
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  {logoIcon}{logoText}
                </div>
              );
              const burgerBtn=(
                <button ref={burgerRef} onClick={()=>setShowMenu(p=>!p)} aria-label={lang==="en"?"Open menu":"פתח תפריט"} aria-expanded={showMenu} aria-haspopup="menu"
                  style={{flexShrink:0,width:46,height:46,
                    background:showMenu?"rgba(0,212,255,0.1)":"var(--glass-4)",
                    border:`1px solid ${showMenu?"rgba(0,212,255,0.3)":"var(--glass-10)"}`,
                    borderRadius:10,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,
                    transition:"all 0.2s",
                    boxShadow:showMenu?"0 0 12px rgba(0,212,255,0.5), 0 0 24px rgba(0,212,255,0.2)":"0 0 8px rgba(0,212,255,0.15)"}}>
                  {[0,1,2].map(i=><span key={i} aria-hidden="true" style={{display:"block",width:20,height:2,borderRadius:2,background:showMenu?"#00D4FF":"var(--text-secondary)",transition:"background 0.2s"}}/>)}
                </button>
              );
              return (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",direction:"ltr"}}>
                  {logoGroup}{burgerBtn}
                </div>
              );
            })()}
            {/* Separator */}
            <div style={{width:"100%",borderBottom:"1px solid var(--glass-6)",margin:"12px 0 10px"}}/>
            {/* Greeting block - compact */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              {/* Row 1: שלום / Hello + username + optional guest label - all inline */}
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"nowrap",justifyContent:"center",maxWidth:"100%",overflow:"hidden"}}>
                <span style={{color:"var(--text-muted)",fontSize:13,lineHeight:1,direction:dir,flexShrink:0}}>{t("greeting")}</span>
                <span style={{color:"var(--text-primary)",fontSize:13,fontWeight:700,lineHeight:1,direction:"ltr",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{displayName}</span>
              </div>
              {/* Row 2: mode hint */}
              <p style={{color:"var(--text-muted)",fontSize:11,margin:0,lineHeight:1.3,textAlign:"center",direction:dir}}>
                {isInterviewMode?t("interviewModeHint"):(lang==="en"
                  ?`Timer ${timerEnabled?"on":"off"}`
                  :`טיימר ${timerEnabled?"פעיל":"כבוי"}`)}
              </p>
              {/* Row 3: streak */}
              {dailyStreak.streak > 0 && (
                <div style={{background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:"4px 12px",fontSize:12,color:"#F59E0B",fontWeight:700,marginTop:2}}>
                  🔥 {dailyStreak.streak} {t("dailyStreak")}
                </div>
              )}
            </div>
          </div>
          {isGuest&&<div className="guest-banner" style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{color:"#4a9aba",fontSize:13,flex:1,minWidth:0}}>{t("guestBanner")}</span><button className="guest-banner-btn" onClick={()=>{window.va?.track("signup_clicked",{source:"quiz_game"});setAuthScreen("signup");setUser(null);}} style={{padding:"6px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,color:"#00D4FF",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t("signupNow")}</button></div>}
          <div style={{display:"flex",gap:6,marginBottom:18,background:"var(--glass-3)",borderRadius:10,padding:3,direction:"ltr"}}>
            {[{key:"categories",label:t("tabTopics")},{key:"roadmap",label:t("tabRoadmap")}].map(tab=>(
              <button key={tab.key} onClick={()=>setHomeTab(tab.key)} style={{flex:1,padding:"8px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,background:homeTab===tab.key?"rgba(0,212,255,0.12)":"transparent",color:homeTab===tab.key?"#00D4FF":"var(--text-dim)",transition:"all 0.2s"}}>{tab.label}</button>
            ))}
          </div>
          {homeTab==="categories"&&(<>
          {/* Dashboard Stats - total_score is the accumulated permanent score (leaderboard-ranked).
               best_score (canonical topic-best via computeScore()) is separate and not shown here.
               Subtitles clarify each metric's meaning for users. */}
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:22}}>
            {[
              {label:t("score"),value:stats.total_score,icon:"⭐",color:"#F59E0B",sub:t("scoreSub"),premium:true},
              {label:t("accuracy"),value:`${accuracy}%`,icon:"🎯",color:"#10B981",sub:t("accuracySub")},
              {label:t("streak"),value:stats.current_streak,displayValue:`x${stats.current_streak}`,icon:"🔥",color:"#FF6B35",sub:t("streakSub"),premium:true},
              {label:t("completed"),value:Object.keys(completedTopics).filter(k=>!isFreeMode(k.split("_")[0])).length,icon:"📚",color:"#00D4FF",sub:t("completedSub")},
            ].map((s,i)=>(
              <div key={i} className="stats-cell" style={{background:s.premium?`${s.color}08`:"var(--glass-3)",border:`1px solid ${s.premium?`${s.color}30`:"var(--glass-7)"}`,borderRadius:12,padding:"12px 6px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,boxShadow:s.premium?`0 0 10px ${s.color}15`:"none"}}>
                <div style={{fontSize:17,lineHeight:1}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.color,lineHeight:1,letterSpacing:-0.5,direction:"ltr"}}>{s.displayValue||s.value}</div>
                <div style={{fontSize:11,fontWeight:700,color:s.premium?s.color:"var(--text-dim)",opacity:s.premium?0.85:0.65,lineHeight:1,letterSpacing:0.5,direction:"ltr"}}>{s.label}</div>
                {s.sub&&<div style={{fontSize:9,color:"var(--text-dim)",opacity:0.4,lineHeight:1.2,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%",paddingInline:2}}>{s.sub}</div>}
              </div>
            ))}
          </div>
          <WeakAreaCard topicStats={topicStats} completedTopics={completedTopics} t={t} dir={dir} onGoToTopic={(id) => {
            const el = document.getElementById(`topic-card-${id}`);
            if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setHighlightTopic(id); setTimeout(() => setHighlightTopic(null), 1500); }
          }}/>
          <button onClick={()=>tryStartQuiz(startDailyChallenge)} className="action-card" style={{width:"100%",marginBottom:12,padding:"16px 20px",background:"linear-gradient(135deg,rgba(245,158,11,0.14),rgba(239,68,68,0.08))",border:"1px solid rgba(245,158,11,0.4)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s",boxShadow:"0 0 16px rgba(245,158,11,0.12)"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div className="action-card-inner" style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
              <span className="action-emoji" style={{fontSize:28,flexShrink:0}}>🔥</span>
              <div className="action-text" style={{textAlign:"start",minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#F59E0B",fontWeight:800,fontSize:15}}>{t("dailyChallengeTitle")}</span>
                  <span style={{background:"rgba(245,158,11,0.2)",color:"#F59E0B",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5,flexShrink:0}}>{t("dailyChallengeNew")}</span>
                </div>
                <div style={{color:"var(--text-muted)",fontSize:12,marginTop:3}}>{t("dailyChallengeDesc")}</div>
                <div style={{color:"#F59E0B",fontSize:10,fontWeight:700,marginTop:2,opacity:0.7,letterSpacing:0.3}}>+15 XP · {t("freeModeTag")}</div>
              </div>
            </div>
            <span dir="ltr" style={{color:"#F59E0B",fontSize:18,flexShrink:0,opacity:0.7,unicodeBidi:"isolate"}}>{dir==="rtl"?"‹":"›"}</span>
          </button>
          <button onClick={()=>tryStartQuiz(startMixedQuiz)} className="action-card" style={{width:"100%",marginBottom:12,padding:"16px 20px",background:"linear-gradient(135deg,#A855F722,#7C3AED22)",border:"1px solid #A855F755",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div className="action-card-inner" style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
              <div className="action-text" style={{textAlign:"start",minWidth:0}}>
                <div style={{color:"#A855F7",fontWeight:800,fontSize:15}}>{t("mixedQuizBtn")}</div>
                <div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>{t("mixedQuizDesc")} · <span style={{opacity:0.6}}>{t("freeModeTag")}</span></div>
              </div>
            </div>
            <span dir="ltr" style={{color:"#A855F7",fontSize:18,flexShrink:0,opacity:0.7,unicodeBidi:"isolate"}}>{dir==="rtl"?"‹":"›"}</span>
          </button>

          {/* Incident Mode entry */}
          <button onClick={()=>setScreen("incidentList")} className="action-card"
            style={{width:"100%",marginBottom:20,padding:"16px 20px",background:"linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.05))",border:"1px solid rgba(239,68,68,0.35)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div className="action-card-inner" style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
              <div className="action-text" style={{textAlign:"start",minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#EF4444",fontWeight:800,fontSize:15}}>{t("incidentModeBtn")}</span>
                  <span style={{background:"rgba(239,68,68,0.15)",color:"#EF4444",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5,flexShrink:0}}>NEW</span>
                </div>
                <div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>{t("incidentModeDesc")}</div>
              </div>
            </div>
            <span dir="ltr" style={{color:"#EF4444",fontSize:18,flexShrink:0,opacity:0.7,unicodeBidi:"isolate"}}>{dir==="rtl"?"‹":"›"}</span>
          </button>
          {(()=>{const nextTopicId=TOPICS.find(t=>computeTopicProgress(t.id)<100)?.id;return(
          <div className="topic-list" style={{display:"flex",flexDirection:"column",gap:12}}>
            {TOPICS.map(topic=>(
              <section key={topic.id} id={`topic-card-${topic.id}`} aria-label={topic.name} className={`topic-card-section${highlightTopic===topic.id?" pulseHighlight":""}${topic.id===nextTopicId?" topic-next":""}${computeTopicProgress(topic.id)>=100?" topic-done":""}`} style={{background:"var(--glass-2)",border:"1px solid var(--glass-7)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div aria-hidden="true" style={{fontSize:24,width:44,height:44,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>{topic.icon}</div>
                  <div style={{flex:1}}>
                    <h3 style={{margin:0,fontWeight:700,color:"var(--text-primary)",fontSize:15}}>{topic.name}</h3>
                    <div style={{color:"var(--text-dim)",fontSize:12}}>{lang==="en"?topic.descriptionEn:topic.description}</div>
                  </div>
                  {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return done>0&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:11,color:topic.color,fontWeight:700,whiteSpace:"nowrap"}}>{done}/3</div>
                    <button onClick={e=>{e.stopPropagation();handleResetTopic(topic.id);}} aria-label={t("resetTopic")} style={{background:"none",border:"none",color:"var(--text-dim)",fontSize:13,cursor:"pointer",padding:"2px 4px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}>↺</button>
                  </div>})()}
                </div>
                {(()=>{const pct=computeTopicProgress(topic.id);return(<div style={{height:7,background:"var(--glass-6)",borderRadius:4,marginBottom:10}}><div style={{height:"100%",borderRadius:4,width:`${pct}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/></div>);})()}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Object.entries(LEVEL_CONFIG).filter(([lvl])=>lvl!=="mixed"&&lvl!=="daily").map(([lvl,cfg])=>{
                    const key=`${topic.id}_${lvl}`;
                    const done=completedTopics[key];
                    const locked=isLevelLocked(topic.id,lvl);
                    return(
                      <button key={lvl} className={locked?"":"card-hover"}
                        onClick={()=>tryStartQuiz(()=>startTopic(topic,lvl))}
                        disabled={locked}
                        aria-label={`${lang==="en"?cfg.labelEn:cfg.label}${done?` – ${done.correct}/${done.total}`:""}${locked?" (locked)":""}`}
                        style={{padding:"10px 8px",
                          background:locked?"var(--glass-1)":done?`${cfg.color}12`:"var(--glass-3)",
                          border:`1px solid ${locked?"var(--glass-4)":done?cfg.color+"44":"var(--glass-7)"}`,
                          borderRadius:10,textAlign:"center",opacity:locked?0.45:1,cursor:locked?"not-allowed":"pointer"}}>
                        <div style={{fontSize:16}} aria-hidden="true">{locked?"🔒":cfg.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:locked?"#334155":done?cfg.color:"var(--text-muted)"}}>{lang==="en"?cfg.labelEn:cfg.label}</div>
                        {done&&!locked&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}} aria-hidden="true">
                          {done.correct>0?"✓":""} {done.correct}/{done.total}
                        </div>}
                        <div style={{fontSize:10,color:locked?"#1e293b":"var(--text-dim)"}} aria-hidden="true">+{cfg.points}{t("pts")}</div>
                        {locked&&<div style={{fontSize:10,color:"var(--text-muted)",marginTop:2,lineHeight:1.2}}>{t("completePrevLevel")}</div>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>);})()}
          {unlockedAchievements.length>0&&<div style={{marginTop:18,background:"var(--glass-2)",border:"1px solid var(--glass-5)",borderRadius:12,padding:"14px 18px"}}><div style={{color:"var(--text-secondary)",fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:1}}>{t("achievementsTitle")}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{ACHIEVEMENTS.filter(a=>unlockedAchievements.includes(a.id)).map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:6,background:"var(--glass-4)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"var(--text-secondary)"}}><span>{a.icon}</span>{lang==="en"?a.nameEn:a.name}</div>)}</div></div>}
          </>)}
          {homeTab==="roadmap"&&<RoadmapView topics={TOPICS} levelConfig={LEVEL_CONFIG} completedTopics={completedTopics} isLevelLocked={isLevelLocked} startTopic={(topic,lvl)=>tryStartQuiz(()=>startTopic(topic,lvl))} startMixedQuiz={()=>tryStartQuiz(startMixedQuiz)} lang={lang} t={t} dir={dir}/>}
          <Footer lang={lang}/>
        </div>
      )}

      {/* ── SEARCH ── */}
      {screen==="search"&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
          <button onClick={()=>setScreen("home")} style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
            {dir==="rtl"?"→ חזרה":"← Return"}
          </button>
          <h2 style={{color:"var(--text-primary)",fontSize:18,fontWeight:700,marginBottom:16}}>{t("searchBtn")}</h2>
          <input type="search" autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")} dir={dir}
            style={{width:"100%",padding:"12px 14px",background:"var(--glass-5)",border:"1px solid var(--glass-12)",borderRadius:10,color:"var(--text-primary)",fontSize:14,marginBottom:20,outline:"none",fontFamily:"inherit"}}
          />
          {searchQuery.trim().length>=2&&(()=>{
            const q=searchQuery.toLowerCase();
            const results=[];
            TOPICS.forEach(topic=>(['easy','medium','hard']).forEach(lvl=>{
              (topic.levels?.[lvl]?.questions||[]).forEach(question=>{
                const text=lang==="en"?(question.qEn||question.q):question.q;
                if(text.toLowerCase().includes(q)) results.push({topic,level:lvl,question});
              });
            }));
            const capped=results.slice(0,25);
            if(capped.length===0) return <div style={{color:"var(--text-dim)",fontSize:14,textAlign:"center",padding:"30px 0"}}>{t("searchNoResults")}</div>;
            return (<>
              <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:12}}>{capped.length} {lang==="en"?"results":"תוצאות"}</div>
              {capped.map(({topic,level,question},i)=>(
                <div key={i} style={{background:"var(--glass-3)",border:`1px solid ${topic.color}22`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,direction:"ltr"}}>
                    <span style={{fontSize:16}}>{topic.icon}</span>
                    <span style={{color:topic.color,fontSize:12,fontWeight:700}}>{topic.name}</span>
                    <span style={{marginLeft:"auto",background:`${LEVEL_CONFIG[level]?.color}22`,color:LEVEL_CONFIG[level]?.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{lang==="en"?LEVEL_CONFIG[level]?.labelEn:LEVEL_CONFIG[level]?.label}</span>
                  </div>
                  <div dir={dir} style={{color:"var(--text-light)",fontSize:13,lineHeight:1.5,marginBottom:10}}>{renderBidiBlock(lang==="en"?(question.qEn||question.q):question.q, lang)}</div>
                  <button onClick={()=>tryStartQuiz(()=>startTopic(topic,level))} style={{padding:"7px 14px",background:`${topic.color}15`,border:`1px solid ${topic.color}44`,borderRadius:8,color:topic.color,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    {lang==="en"?"Go to Topic →":"עבור לנושא →"}
                  </button>
                </div>
              ))}
            </>);
          })()}
        </div>
      )}

      {/* ── MISTAKES ── */}
      {screen==="mistakes"&&(()=>{
        const wrongItems=[];
        TOPICS.forEach(topic=>(['easy','medium','hard']).forEach(lvl=>{
          const r=completedTopics[`${topic.id}_${lvl}`];
          if(!r) return;
          if(r.wrongQuestions&&r.wrongQuestions.length>0){
            r.wrongQuestions.forEach(q=>{wrongItems.push({topic,level:lvl,q});});
          } else if(r.wrongIndices&&r.wrongIndices.length>0){
            const rawQs=lang==="en"?topic.levels[lvl].questionsEn:topic.levels[lvl].questions;
            r.wrongIndices.forEach(idx=>{const q=rawQs?.[idx];if(q) wrongItems.push({topic,level:lvl,q});});
          } else if((!r.wrongIndices||(Array.isArray(r.wrongIndices)&&r.wrongIndices.length===0&&!r.retryComplete))&&r.correct<r.total){
            wrongItems.push({topic,level:lvl,legacy:true,correct:r.correct,total:r.total});
          }
        }));
        const anyTopicCompleted=TOPICS.some(topic=>(['easy','medium','hard']).some(lvl=>completedTopics[`${topic.id}_${lvl}`]));
        return (
          <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
            <button onClick={()=>setScreen("home")} style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
              {dir==="rtl"?"→ חזרה":"← Return"}
            </button>
            <h2 style={{color:"var(--text-primary)",fontSize:18,fontWeight:700,marginBottom:4}}>{t("mistakesBtn")}</h2>
            <p style={{color:"var(--text-muted)",fontSize:13,marginBottom:20}}>{t("mistakesHint")}</p>
            {!anyTopicCompleted&&<div style={{background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13,color:"var(--text-secondary)",direction:dir}}>
              {lang==="en"?"💡 Mistakes are only tracked for individual topic quizzes (Easy / Medium / Hard). Mixed Quiz and Daily Challenge are not tracked here.":"💡 טעויות נשמרות רק בחידוני נושא רגילים (קל / בינוני / קשה). חידון מיקס ואתגר יומי לא נשמרים כאן."}
            </div>}
            {wrongItems.length===0
              ? <div style={{textAlign:"center",padding:"40px 0",color:"#10B981",fontSize:16,fontWeight:700}}>{t("mistakesEmpty")}</div>
              : wrongItems.map(({topic,level,q,legacy,correct,total},i)=>
                  legacy?(
                    <div key={i} style={{background:"var(--glass-3)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <span style={{fontSize:26,flexShrink:0}}>{topic.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:"var(--text-primary)",fontWeight:700,fontSize:14}}>{topic.name}</div>
                          <div style={{color:"var(--text-muted)",fontSize:12,marginTop:2,display:"flex",alignItems:"center",gap:8,direction:"ltr"}}>
                            <span style={{color:LEVEL_CONFIG[level]?.color,fontWeight:600}}>{lang==="en"?LEVEL_CONFIG[level]?.labelEn:LEVEL_CONFIG[level]?.label}</span>
                            <span>·</span>
                            <span style={{color:"#EF4444"}}>{correct}/{total} {lang==="en"?"correct":"נכון"}</span>
                          </div>
                        </div>
                        <button onClick={()=>tryStartQuiz(()=>startTopic(topic,level))} style={{flexShrink:0,padding:"8px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          {lang==="en"?"Retry":"נסה שוב"}
                        </button>
                      </div>
                      <div style={{color:"var(--text-muted)",fontSize:11,marginTop:8,direction:dir}}>
                        {lang==="en"?"Retake this quiz to track your specific wrong questions":"שחק שוב כדי לראות את השאלות הספציפיות שטעית בהן"}
                      </div>
                    </div>
                  ):(
                    <div key={i} style={{background:"var(--glass-3)",border:"1px solid rgba(239,68,68,0.12)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,direction:"ltr",flexWrap:"wrap"}}>
                        <span style={{fontSize:15}}>{topic.icon}</span>
                        <span style={{color:"var(--text-secondary)",fontSize:12,fontWeight:600}}>{topic.name}</span>
                        <span style={{color:LEVEL_CONFIG[level]?.color,fontSize:11,fontWeight:700,background:`${LEVEL_CONFIG[level]?.color}18`,border:`1px solid ${LEVEL_CONFIG[level]?.color}44`,borderRadius:6,padding:"2px 6px"}}>
                          {lang==="en"?LEVEL_CONFIG[level]?.labelEn:LEVEL_CONFIG[level]?.label}
                        </span>
                      </div>
                      <div style={{color:"var(--text-primary)",fontSize:14,lineHeight:1.5,marginBottom:8,direction:dir}}>{renderBidiBlock(q.q, lang)}</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                          <span style={{color:"#10B981",fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
                          <span style={{color:"#10B981",fontSize:13,lineHeight:1.4}}>{lang==="he"?renderBidi(q.options[q.answer],lang):q.options[q.answer]}</span>
                        </div>
                        <button onClick={()=>tryStartQuiz(()=>startTopic(topic,level))} style={{flexShrink:0,padding:"6px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,color:"#EF4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          {lang==="en"?"Retry":"נסה שוב"}
                        </button>
                      </div>
                    </div>
                  )
                )
            }
          </div>
        );
      })()}

      {/* ── GUIDE - kubectl Cheat Sheet ── */}
      {screen==="guide"&&(()=>{
        const isOpen = id => expandedGuideSection===id;
        const handleCopy = (cmd) => {
          navigator.clipboard?.writeText(cmd).catch(()=>{});
          setCopiedCmd(cmd);
          setTimeout(()=>setCopiedCmd(c=>c===cmd?null:c),1500);
        };
        const totalCmds = CHEATSHEET.reduce((s,sec)=>s+sec.commands.length,0);
        const isHe = lang==="he";

        /* ── Reusable CodeBlockRow ── */
        const CodeBlockRow = ({cmd,desc,descHe:dHe})=>{
          const isCopied = copiedCmd===cmd;
          return (
            <div style={{padding:"4px 0 6px"}}>
              <div className="cbr-block">
                <code className="cbr-code">{cmd}</code>
                <button className={`cbr-copy${isCopied?" copied":""}`}
                  onClick={(e)=>{e.stopPropagation();handleCopy(cmd);}}
                  aria-label="Copy command">
                  {isCopied?<><span style={{fontSize:13}}>&#10003;</span> Copied</>:<>Copy</>}
                </button>
              </div>
              <div style={{color:"var(--text-muted)",fontSize:11.5,lineHeight:1.35,marginTop:4,
                padding:isHe?"0 0 0 0":"0",direction:isHe?"rtl":"ltr",
                textAlign:isHe?"right":"left"}}>{isHe?dHe:desc}</div>
            </div>
          );
        };

        return (
          <div className="page-pad" style={{maxWidth:700,margin:"0 auto",padding:"16px 14px",animation:"fadeIn 0.3s ease",direction:"ltr"}}>
            <div style={{display:"flex",justifyContent:isHe?"flex-end":"flex-start",marginBottom:16}}>
              <button onClick={()=>setScreen("home")} style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",padding:"6px 12px",borderRadius:6,cursor:"pointer",fontSize:13,display:"inline-flex",alignItems:"center",gap:5}}>
                {isHe?"חזרה →":"← Back"}
              </button>
            </div>

            {/* Header */}
            <div style={{marginBottom:16}}>
              <h2 style={{color:"var(--text-primary)",fontSize:20,fontWeight:800,margin:0,letterSpacing:-0.3}}>kubectl Cheat Sheet</h2>
              <p style={{color:"var(--text-muted)",fontSize:12,lineHeight:1.4,margin:"4px 0 0"}}>Copy-ready commands - click to expand</p>
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <span style={{fontSize:11,color:"var(--text-secondary)",background:"var(--glass-4)",border:"1px solid var(--glass-8)",borderRadius:4,padding:"2px 8px"}}>{CHEATSHEET.length} sections</span>
                <span style={{fontSize:11,color:"var(--text-secondary)",background:"var(--glass-4)",border:"1px solid var(--glass-8)",borderRadius:4,padding:"2px 8px"}}>{totalCmds} commands</span>
              </div>
            </div>

            {/* Sections */}
            {CHEATSHEET.map(section=>{
              const open = isOpen(section.id);
              const cmdCount = section.commands.length;
              return (
              <div key={section.id} style={{marginBottom:4}}>
                {/* Section header */}
                <button onClick={()=>setExpandedGuideSection(s=>s===section.id?null:section.id)}
                  style={{width:"100%",background:open?`${section.color}08`:"transparent",
                    border:"none",borderBottom:`1px solid ${open?section.color+"30":"var(--glass-6)"}`,
                    borderRadius:0,
                    padding:"10px 4px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,
                    transition:"all 0.15s ease"}}>
                  <span style={{color:open?section.color:"var(--text-dim)",fontSize:14,flexShrink:0,
                    transition:"transform 0.2s",transform:open?"rotate(90deg)":"rotate(0deg)",lineHeight:1}}>&#9656;</span>
                  <span style={{fontSize:16,flexShrink:0}}>{section.icon}</span>
                  <span style={{flex:1,color:"var(--text-primary)",fontSize:14,fontWeight:600,textAlign:"left"}}>{section.title}</span>
                  <span style={{color:"var(--text-dim)",fontSize:11,flexShrink:0}}>{cmdCount}</span>
                </button>

                {/* Expanded command list */}
                {open&&(
                  <div style={{padding:"4px 0 8px 28px",borderBottom:`1px solid ${section.color}15`}}>
                    {section.commands.map((entry,i)=>
                      <CodeBlockRow key={i} cmd={entry.cmd} desc={entry.desc} descHe={entry.descHe}/>
                    )}
                  </div>
                )}
              </div>
            );})}
          </div>
        );
      })()}

      {/* ── ABOUT ── */}
      {screen==="about"&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
          <button onClick={()=>setScreen("home")} style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
            {dir==="rtl"?"→ חזרה":"← Return"}
          </button>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:28}}>
            <svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{filter:"drop-shadow(0 0 14px rgba(0,212,255,0.4))"}}>
              <defs><radialGradient id="abg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#020817"/></radialGradient><linearGradient id="agr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF6B35"/></linearGradient></defs>
              <circle cx="50" cy="50" r="50" fill="url(#abg)"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="url(#agr)" strokeWidth="4" opacity="0.9"/>
              <g transform="translate(50,50)" stroke="url(#agr)" strokeWidth="2.8" strokeLinecap="round">
                {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i)=><line key={i} x1="0" y1="-18" x2="0" y2="-34" transform={`rotate(${deg})`}/>)}
              </g>
              <circle cx="50" cy="50" r="10" fill="none" stroke="url(#agr)" strokeWidth="3"/>
              <circle cx="50" cy="50" r="5" fill="#00D4FF"/>
              {[["#00D4FF",0],["#7B9FF7",51.4],["#A855F7",102.8],["#CC60CC",154.2],["#FF6B35",205.7],["#FF8C35",257.1],["#44AAEE",308.5]].map(([c,deg],i)=><circle key={i} cx="50" cy="16" r="3.5" fill={c} transform={deg?`rotate(${deg},50,50)`:""}/>)}
            </svg>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"300% auto",animation:"shine 9s linear infinite",letterSpacing:-0.5}}>KubeQuest</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:3}}>
                <span style={{color:"var(--text-dim)",fontSize:12}}>Train Your Kubernetes Skills</span>
                <span style={{fontSize:10,color:"#00D4FF",background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.25)",borderRadius:4,padding:"1px 5px",fontWeight:700,letterSpacing:0.3}}>v{APP_VERSION}</span>
              </div>
            </div>
          </div>
          {[
            {icon:"🎯",title:lang==="en"?"What is this?":"מה זה?",body:lang==="en"?"An interactive Kubernetes training app. Practice real interview questions across 5 topic areas at 3 difficulty levels.":"אפליקציית אימון Kubernetes אינטראקטיבית. תרגלי שאלות ראיון אמיתיות ב-5 נושאים ו-3 רמות קושי."},
            {icon:"🎯",title:lang==="en"?"Goal":"המטרה",body:lang==="en"?"Help developers prepare confidently for Kubernetes interviews and CKA/CKAD exams.":"לעזור למפתחים להתכונן לראיונות Kubernetes ולבחינות CKA/CKAD."},
            {icon:"👨‍💻",title:lang==="en"?"Built by":"נבנה על ידי",body:<span>{lang==="en"?"Or Carmeli · ":"Or Carmeli · "}<a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer" style={{color:"var(--link-color)",textDecoration:"none",fontWeight:600}}>LinkedIn</a>{" · "}<a href="https://github.com/or-carmeli/KubeQuest" target="_blank" rel="noopener noreferrer" style={{color:"var(--text-primary)",textDecoration:"none",fontWeight:600}}>GitHub</a></span>},
          ].map(({icon,title,body},i)=>(
            <div key={i} style={{background:"var(--glass-3)",border:"1px solid var(--glass-8)",borderRadius:12,padding:"14px 16px",marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}>
              <span style={{fontSize:22,flexShrink:0,marginTop:1}}>{icon}</span>
              <div>
                <div style={{color:"var(--text-primary)",fontWeight:700,fontSize:14,marginBottom:4}}>{title}</div>
                <div style={{color:"var(--text-secondary)",fontSize:13,lineHeight:1.6,direction:dir}}>{body}</div>
              </div>
            </div>
          ))}
          <div style={{marginTop:16,textAlign:"center"}}>
            <button onClick={()=>{
              const url="https://kubequest.online";
              const text=lang==="en"?"KubeQuest – Practice Kubernetes Through Real DevOps Scenarios":"מצאתי דרך נחמדה לתרגל Kubernetes. משחק עם שאלות DevOps ותרחישי troubleshooting אמיתיים";
              if(navigator.share){navigator.share({title:"KubeQuest",text,url}).catch(()=>{});}
              else{navigator.clipboard?.writeText(url);}
            }} style={{padding:"10px 24px",background:"linear-gradient(135deg,rgba(0,212,255,0.1),rgba(168,85,247,0.1))",border:"1px solid rgba(0,212,255,0.25)",borderRadius:10,color:"#00D4FF",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {t("shareBtn")}
            </button>
          </div>
        </div>
      )}

      </>}
      {/* STATUS */}
      {screen==="status"&&(()=>{
        const isProd    = import.meta.env.MODE === "production";
        const env       = isProd ? "Production" : "Development";
        const buildTime = typeof __BUILD_TIME__ !== "undefined" ? new Date(__BUILD_TIME__) : null;
        const isSecure  = typeof window !== "undefined" && window.location.protocol === "https:";

        const loading = monitorServices === null;

        // Derive global status from real service data
        const allOperational = !loading && monitorServices.every(s => s.status === "operational");
        const anyDown = !loading && monitorServices.some(s => s.status === "down");
        const anyMaintenance = !loading && monitorServices.some(s => s.status === "maintenance");

        // Maintenance windows
        const activeMaintenance = maintenanceWindows
          ? maintenanceWindows.find(w => new Date(w.starts_at) <= new Date() && new Date(w.ends_at) > new Date())
          : null;
        const upcomingMaintenance = maintenanceWindows
          ? maintenanceWindows.filter(w => new Date(w.starts_at) > new Date())
          : [];
        const inMaintenance = anyMaintenance || !!activeMaintenance;

        const globalOk      = loading ? null : (anyDown ? false : true);
        const globalLabel   = loading ? "Checking…"
          : anyDown ? "Major Outage"
          : inMaintenance ? "Scheduled Maintenance"
          : allOperational ? "All Systems Operational"
          : "Degraded Performance";
        const globalColor   = loading ? "#F59E0B" : anyDown ? "#EF4444" : inMaintenance ? "#facc15" : allOperational ? "#10B981" : "#F59E0B";
        const globalDot     = globalColor;

        const statusLabel = (s) => s === "operational" ? "Operational" : s === "degraded" ? "Degraded" : s === "down" ? "Down" : "Maintenance";
        const statusColor = (s) => s === "operational" ? "#10B981" : s === "degraded" ? "#F59E0B" : s === "down" ? "#EF4444" : "#facc15";

        // Default service list (used while loading or if no data)
        const defaultSvcNames = ["Quiz Engine","Authentication","Leaderboard","Database","Content API"];
        const services = loading
          ? defaultSvcNames.map(n => ({ service_name: n, status: "operational", latency_ms: null }))
          : monitorServices;

        // Build uptime bars + check totals per service from real history
        const uptimeByService = {};
        const checksByService = {};
        if (monitorUptime) {
          for (const row of monitorUptime) {
            if (!uptimeByService[row.service_name]) uptimeByService[row.service_name] = {};
            uptimeByService[row.service_name][row.day] = row.uptime_pct;
            if (!checksByService[row.service_name]) checksByService[row.service_name] = { ok: 0, total: 0 };
            checksByService[row.service_name].ok += Number(row.ok_checks);
            checksByService[row.service_name].total += Number(row.total_checks);
          }
        }
        const getDayBars = (svcName) => {
          const days = [];
          for (let i = 29; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0,10);
            const pct = uptimeByService[svcName]?.[key];
            if (pct === undefined || pct === null) days.push("nodata");
            else if (pct >= 98) days.push("ok");
            else if (pct >= 90) days.push("incident");
            else days.push("error");
          }
          return days;
        };
        const barColor = (t) => t==="ok" ? "#10B981" : t==="incident" ? "#F59E0B" : t==="error" ? "#EF4444" : "var(--glass-6)";

        // Determine actual monitoring span for accurate labels
        let monitoringDays = 30;
        if (monitorUptime && monitorUptime.length) {
          const allDays = [...new Set(monitorUptime.map(r => r.day))].sort();
          if (allDays.length > 0) {
            const first = new Date(allDays[0]);
            const diffMs = Date.now() - first.getTime();
            monitoringDays = Math.min(30, Math.max(1, Math.ceil(diffMs / 86400000)));
          }
        }

        // Compute average latency across services that have it
        const latencies = services.filter(s => s.latency_ms != null).map(s => s.latency_ms);
        const avgLatency = latencies.length ? Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) : null;
        const maxLatency = latencies.length ? Math.max(...latencies) : null;

        // Compute overall uptime from history
        let overallUptime = null;
        if (monitorUptime && monitorUptime.length) {
          const totalChecks = monitorUptime.reduce((s,r) => s + Number(r.total_checks), 0);
          const okChecks = monitorUptime.reduce((s,r) => s + Number(r.ok_checks), 0);
          if (totalChecks > 0) overallUptime = (okChecks / totalChecks * 100).toFixed(2);
        }

        // Active incidents count
        const activeIncidents = monitorIncidents ? monitorIncidents.filter(i => i.status !== "resolved") : [];

        // Last checked time - statusTick dependency keeps this value live
        void statusTick;
        const lastChecked = !loading && services.length
          ? new Date(Math.max(...services.map(s => new Date(s.last_checked).getTime())))
          : null;
        const secondsAgo = lastChecked ? Math.floor((Date.now() - lastChecked.getTime()) / 1000) : null;
        const isStaleWarning  = secondsAgo !== null && secondsAgo > 300;
        const isStaleCritical = secondsAgo !== null && secondsAgo > 900;

        const metricCard = (label, value, sub, accent="#94a3b8") => (
          <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"14px 16px",minWidth:0}}>
            <div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600,marginBottom:6}}>{label}</div>
            <div style={{fontSize:18,fontWeight:700,color:accent,fontFamily:"'Fira Code','Courier New',monospace",lineHeight:1}}>{value}</div>
            {sub&&<div style={{fontSize:11,color:"var(--text-dim)",marginTop:4}}>{sub}</div>}
          </div>
        );

        const infoRow = (label, value, accent="#cbd5e1", mono=false) => (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--glass-4)"}}>
            <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>{label}</span>
            <span style={{fontSize:12,color:accent,fontWeight:500,fontFamily:mono?"'Fira Code','Courier New',monospace":"inherit",textAlign:"end",maxWidth:"60%",wordBreak:"break-all"}}>{value}</span>
          </div>
        );

        const sectionTitle = (title) => (
          <div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10,marginTop:32}}>{title}</div>
        );

        // Severity colors for incidents
        const sevColor = (s) => s === "critical" ? "#EF4444" : s === "high" ? "#F97316" : s === "medium" ? "#F59E0B" : "#64748b";
        const incStatusColor = (s) => s === "resolved" ? "#10B981" : s === "monitoring" ? "#3B82F6" : s === "identified" ? "#F59E0B" : "#EF4444";

        return (
          <div className="page-pad" dir="ltr" style={{maxWidth:720,margin:"0 auto",padding:isStatusDomain?"28px 16px 48px":"20px 16px 48px",animation:"fadeIn 0.3s ease",direction:"ltr"}}>

            {/* Back (hidden on standalone status subdomain) */}
            {!isStatusDomain && (
              <div style={{display:"flex",justifyContent:lang==="en"?"flex-start":"flex-end",marginBottom:24}}>
                <button onClick={()=>setScreen("home")} style={{background:"var(--glass-3)",border:"1px solid var(--glass-6)",color:"var(--text-secondary)",padding:"7px 12px",borderRadius:6,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:5}}>
                  {lang==="en"?"← Return":"חזרה →"}
                </button>
              </div>
            )}

            {/* ── GLOBAL STATUS BANNER ── */}
            <div style={{background:`rgba(${globalOk===false?"239,68,68":globalOk?"16,185,129":"245,158,11"},0.03)`,border:`1px solid ${globalColor}18`,borderRadius:12,padding:"20px 22px",marginBottom:8,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",boxShadow:`0 0 12px ${globalColor}40,0 0 28px ${globalColor}26,inset 0 0 18px ${globalColor}0D`}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:globalDot,boxShadow:`0 0 8px ${globalDot}CC,0 0 16px ${globalDot}99,0 0 24px ${globalDot}66`,animation:"dotPulse 2.5s ease-in-out infinite"}} />
                {globalOk!==false&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",background:globalDot,animation:"ping 2.5s ease-out infinite",opacity:0.2}} />}
              </div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontSize:17,fontWeight:700,color:"var(--text-primary)",letterSpacing:-0.2}}>{globalLabel}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginTop:3}}>
                  {secondsAgo !== null ? (secondsAgo < 60 ? "Updated just now" : secondsAgo < 120 ? "Updated 1 min ago" : `Updated ${Math.floor(secondsAgo/60)} min ago`) : "Checking…"}
                </div>
              </div>
            </div>

            {/* ── STALE DATA WARNING ── */}
            {isStaleWarning && (
              <div style={{background:isStaleCritical?"rgba(239,68,68,0.05)":"rgba(245,158,11,0.05)",border:`1px solid ${isStaleCritical?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)"}`,borderRadius:10,padding:"10px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14}}>{isStaleCritical?"⚠":"⚡"}</span>
                <span style={{fontSize:12,fontWeight:500,color:isStaleCritical?"#EF4444":"#F59E0B"}}>
                  {isStaleCritical ? "Status data is stale" : "Status data may be stale"}
                </span>
              </div>
            )}

            {/* ── MAINTENANCE BANNER ── */}
            {(activeMaintenance || upcomingMaintenance.length > 0) && (() => { const mw = activeMaintenance || upcomingMaintenance[0]; return (
              <div dir="ltr" style={{background:"rgba(250,204,21,0.04)",border:"1px solid rgba(250,204,21,0.15)",borderRadius:10,padding:"14px 16px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#facc15"}} />
                  <span style={{fontSize:13,fontWeight:600,color:"#facc15"}}>{activeMaintenance ? "Maintenance in Progress" : "Upcoming Maintenance"}</span>
                </div>
                {mw.description && (
                  <div style={{fontSize:12,color:"var(--text-secondary)",lineHeight:1.5,marginBottom:8}}>{mw.description}</div>
                )}
                <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"'Fira Code','Courier New',monospace",marginBottom:mw.affected_services?.length ? 10 : 0}}>
                  {new Date(mw.starts_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})} · {new Date(mw.starts_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})}–{new Date(mw.ends_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})} UTC
                </div>
                {mw.affected_services?.length > 0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {mw.affected_services.map(s=>(
                      <span key={s} style={{fontSize:10,color:"#a3a3a3",background:"var(--glass-4)",borderRadius:4,padding:"2px 8px",fontWeight:500}}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ); })()}

            {/* ── SERVICE HEALTH ── */}
            {sectionTitle("Services")}
            <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,overflow:"hidden"}}>
              {services.map((svc,i)=>(
                <div key={svc.service_name} className="svc-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<services.length-1?"1px solid var(--glass-4)":"none",background:"rgba(255,255,255,0.02)",transition:"background 0.2s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:statusColor(svc.status),flexShrink:0,boxShadow:`0 0 4px ${statusColor(svc.status)}CC, 0 0 10px ${statusColor(svc.status)}66`}} />
                    <div>
                      <span style={{fontSize:13,color:"var(--text-light)",fontWeight:500}}>{svc.service_name}</span>
                      {svc.latency_ms!=null&&<span style={{fontSize:11,color:"var(--text-dim)",fontFamily:"'Fira Code','Courier New',monospace",marginLeft:8}}>{svc.latency_ms} ms</span>}
                    </div>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:svc.status==="operational"?"#34f5c5":statusColor(svc.status),textShadow:svc.status==="operational"?"0 0 6px rgba(52,245,197,0.35)":"none"}}>
                    {loading?"Checking…":statusLabel(svc.status)}
                  </span>
                </div>
              ))}
            </div>

            {/* ── UPTIME - LAST 30 DAYS ── */}
            {sectionTitle(`Uptime - last ${monitoringDays} days`)}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {services.map((svc)=>{
                const bars = getDayBars(svc.service_name);
                const checks = checksByService[svc.service_name];
                const pct = checks && checks.total > 0 ? (checks.ok / checks.total * 100).toFixed(1) : "-";
                const ok = svc.status === "operational";
                return (
                  <div key={svc.service_name} style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"10px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500}}>{svc.service_name}</span>
                      <span style={{fontSize:12,color:ok?"#94a3b8":"#EF4444",fontWeight:600,fontFamily:"'Fira Code','Courier New',monospace"}}>{pct=== "-" ? "-" : `${pct}%`}</span>
                    </div>
                    <div style={{display:"flex",gap:1.5,alignItems:"flex-end"}}>
                      {bars.map((type,i)=>(
                        <div key={i} title={type==="nodata"?"No data":type} style={{flex:1,height:18,borderRadius:2,background:barColor(type),opacity:type==="ok"?0.8:type==="nodata"?0.15:0.85,transition:"opacity 0.2s"}} />
                      ))}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                      <span style={{fontSize:10,color:"var(--text-disabled)"}}>{monitoringDays >= 30 ? "30 days ago" : `${monitoringDays}d ago`}</span>
                      <span style={{fontSize:10,color:"var(--text-disabled)"}}>Today</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── PERFORMANCE METRICS ── */}
            {sectionTitle("Performance")}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
              {metricCard("Avg Latency", avgLatency!=null?`${avgLatency}ms`:"-", loading?"checking…":"across services", "#94a3b8")}
              {metricCard("Max Latency", maxLatency!=null?`${maxLatency}ms`:"-", loading?"checking…":"slowest service", "#94a3b8")}
              {metricCard("Uptime", overallUptime?`${overallUptime}%`:"-", `last ${monitoringDays} days`, "#94a3b8")}
              {metricCard("Incidents", String(activeIncidents.length), activeIncidents.length===0?"all clear":"active", activeIncidents.length===0?"#94a3b8":"#EF4444")}
            </div>

            {/* ── DEPLOYMENT INFO ── */}
            {sectionTitle("Deployment")}
            <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"2px 16px"}}>
              {infoRow("Version", `v${APP_VERSION}`, "#cbd5e1", true)}
              {infoRow("Environment", env, isProd?"#94a3b8":"#F59E0B")}
              {infoRow("Branch", "main", "#94a3b8", true)}
              {infoRow("Last Deploy", buildTime ? buildTime.toUTCString().replace(" GMT"," UTC") : "-", "#64748b", true)}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--glass-4)"}}>
                <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>CI Status</span>
                <span style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block"}} />
                  Passing
                </span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0"}}>
                <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>Repository</span>
                <a href="https://github.com/or-carmeli/KubeQuest" target="_blank" rel="noopener noreferrer"
                  style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500,textDecoration:"none",fontFamily:"'Fira Code','Courier New',monospace"}}>
                  or-carmeli/KubeQuest
                </a>
              </div>
            </div>

            {/* ── INCIDENT HISTORY ── */}
            {sectionTitle("Incidents")}
            {monitorIncidents && monitorIncidents.length > 0 ? monitorIncidents.map((inc) => {
              const started = new Date(inc.started_at);
              const resolved = inc.resolved_at ? new Date(inc.resolved_at) : null;
              const durationMs = resolved ? resolved - started : Date.now() - started;
              const durationHrs = durationMs / 3600000;
              const durationStr = durationHrs >= 1 ? `~${Math.round(durationHrs)} hr${Math.round(durationHrs)>1?"s":""}` : `~${Math.round(durationMs/60000)} min`;
              return (
                <div key={inc.id} dir="ltr" style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"12px 16px",textAlign:"left",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)"}}>{inc.title}</div>
                      <div style={{fontSize:11,color:"var(--text-muted)",marginTop:3,display:"flex",flexWrap:"wrap",gap:"0 12px"}}>
                        <span>{started.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                        <span>{durationStr}</span>
                        <span style={{color:sevColor(inc.severity)}}>{inc.severity.charAt(0).toUpperCase()+inc.severity.slice(1)}</span>
                      </div>
                      {inc.affected_services?.length>0&&<div style={{fontSize:10,color:"var(--text-dim)",marginTop:3}}>{inc.affected_services.join(", ")}</div>}
                    </div>
                    <span style={{fontSize:10,fontWeight:600,color:incStatusColor(inc.status),background:`${incStatusColor(inc.status)}12`,padding:"3px 8px",borderRadius:4,whiteSpace:"nowrap",flexShrink:0,marginTop:1}}>
                      {inc.status.charAt(0).toUpperCase()+inc.status.slice(1)}
                    </span>
                  </div>
                  {(inc.impact||inc.root_cause||inc.resolution||inc.prevention)&&(
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--glass-4)",fontSize:12,color:"var(--text-muted)",lineHeight:1.6}}>
                      {inc.impact&&<div style={{marginBottom:6}}><span style={{color:"var(--text-secondary)",fontWeight:600}}>Impact</span> - {inc.impact}</div>}
                      {inc.root_cause&&<div style={{marginBottom:6}}><span style={{color:"var(--text-secondary)",fontWeight:600}}>Root Cause</span> - {inc.root_cause}</div>}
                      {inc.resolution&&<div style={{marginBottom:6}}><span style={{color:"var(--text-secondary)",fontWeight:600}}>Resolution</span> - {inc.resolution}</div>}
                      {inc.prevention&&<div><span style={{color:"var(--text-secondary)",fontWeight:600}}>Prevention</span> - {inc.prevention}</div>}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:16,textAlign:"center",color:"var(--text-dim)",fontSize:12}}>
                {loading ? "Loading incidents…" : "No incidents recorded"}
              </div>
            )}

            {/* ── SECURITY STATUS ── */}
            {sectionTitle("Security")}
            <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"2px 16px"}}>
              {infoRow("TLS Certificate", isSecure ? "Valid · Let's Encrypt" : "Not active", isSecure?"#94a3b8":"#EF4444")}
              {infoRow("Connection",      isSecure ? "HTTPS · Encrypted" : "HTTP · Unencrypted",   isSecure?"#94a3b8":"#F59E0B")}
              {infoRow("HSTS",            "Enabled",  "#94a3b8")}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0"}}>
                <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>Security Headers</span>
                <span style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500}}>Active</span>
              </div>
            </div>

            <style>{`@keyframes ping{0%{transform:scale(1);opacity:0.4}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes dotPulse{0%,100%{opacity:1;box-shadow:0 0 8px currentColor,0 0 16px currentColor,0 0 24px currentColor}50%{opacity:.85;box-shadow:0 0 4px currentColor,0 0 10px currentColor,0 0 16px currentColor}}.svc-row:hover{background:rgba(0,255,170,0.04)!important}`}</style>
          </div>
        );
      })()}

      {!isStatusDomain && <>
      {/* TOPIC */}
      {screen==="topic"&&selectedTopic&&selectedLevel&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease"}}>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",direction:dir,marginBottom:6}}>
              <button onClick={()=>setScreen("home")} aria-label={t("back")} style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span aria-hidden="true">{dir==="rtl"?"→":"←"}</span></button>
              <span style={{fontSize:12,color:LEVEL_CONFIG[selectedLevel]?.color,background:`${LEVEL_CONFIG[selectedLevel]?.color||"#888"}18`,padding:"3px 10px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{LEVEL_CONFIG[selectedLevel]?.icon} {lang==="en"?LEVEL_CONFIG[selectedLevel]?.labelEn:LEVEL_CONFIG[selectedLevel]?.label}</span>
            </div>
            <h2 style={{margin:0,color:selectedTopic.color,fontSize:17,fontWeight:800,textAlign:"center"}}>{selectedTopic.name}</h2>
          </div>

          {topicScreen==="theory"?(
            <div>
              <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-7)",borderRadius:14,padding:22,marginBottom:18}}>
                <div style={{fontSize:11,color:selectedTopic.color,fontWeight:800,marginBottom:16,letterSpacing:1}}>{t("theory")}</div>
                <div style={{background:"var(--code-bg-light)",borderRadius:10,padding:"16px 20px"}}>{renderTheory(theoryContent || currentLevelData?.theory)}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:0}}>
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled||isInterviewMode)setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):(TIMER_DURATIONS[selectedLevel]||30));}} style={{flex:1,padding:15,background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${selectedTopic.color}44`,lineHeight:1.4}}>
                  <div style={{fontSize:15}}>{t("startQuiz")}</div>
                  <div style={{fontSize:12,opacity:0.85,fontWeight:600}}>(+{LEVEL_CONFIG[selectedLevel]?.points ?? 0} {t("ptsPerQ")})</div>
                </button>
              </div>
              {!isInterviewMode&&<div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                <button onClick={()=>setTimerEnabled(p=>!p)} aria-pressed={timerEnabled} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"var(--text-dim)",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400}}>
                  {timerEnabled?t("timerOn"):t("timerOff")}
                </button>
              </div>}
            </div>
          ):(
            // Fail-safe: if quiz state is invalid (no questions or index out of bounds), recover gracefully
            currentQuestions.length === 0 || questionIndex < 0 || questionIndex >= currentQuestions.length || !currentQuestions[questionIndex] ? (
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
                <p style={{color:"var(--text-secondary)",fontSize:14,marginBottom:16}}>{lang==="en"?"Quiz state is invalid. Returning to topics.":"מצב החידון לא תקין. חוזר לנושאים."}</p>
                <button onClick={()=>{clearQuizState();setScreen("home");}} style={{padding:"12px 28px",background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  {t("backToTopics")}
                </button>
              </div>
            ) : (
            <div>
              <div style={{marginBottom:18}}>
                {/* Row 1: progress indicator - prominent and centered */}
                <div className="quiz-bar" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8,direction:dir}}>
                  {questionIndex > 0 && (
                    <button onClick={()=>setQuestionIndex(p=>Math.max(0, p-1))}
                      style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",padding:"5px 10px",borderRadius:7,cursor:"pointer",fontSize:12,flexShrink:0}}>
                      {t("prevQuestion")}
                    </button>
                  )}
                  <span aria-live="polite" aria-atomic="true" style={{color:"var(--text-primary)",fontSize:14,fontWeight:700}}>
                    {t("question")} {questionIndex+1} {t("of")} {currentQuestions.length}
                  </span>
                  {isInHistoryMode && !tryAgainActive && <span style={{fontSize:11,color:"#A855F7",fontWeight:700,background:"rgba(168,85,247,0.12)",padding:"2px 8px",borderRadius:6}}>{t("reviewing")}</span>}
                  {tryAgainActive && <span style={{fontSize:11,color:"#F59E0B",fontWeight:700,background:"rgba(245,158,11,0.12)",padding:"2px 8px",borderRadius:6}}>{t("tryAgainBadge")}</span>}
                </div>
                {/* Row 2: stats bar - timer, streak, score */}
                <div className="quiz-bar-right" style={{display:"flex",gap:10,alignItems:"center",justifyContent:"center",marginBottom:8,direction:"ltr"}}>
                  {!isInHistoryMode&&(timerEnabled||isInterviewMode)&&<span aria-live="off" aria-label={`${timeLeft} ${lang==="en"?"seconds":"שניות"}`} style={{display:"inline-block",color:(!isInterviewMode&&timeLeft<=10)?"#EF4444":"#F59E0B",fontSize:13,fontWeight:(isInterviewMode&&timeLeft<=5)?900:800,transform:(isInterviewMode&&timeLeft<=5)?"scale(1.05)":"none",transition:"transform 0.3s ease",minWidth:28,textAlign:"center",direction:"ltr"}}><span aria-hidden="true">⏱ {timeLeft}</span></span>}
                  {!isInHistoryMode&&!isInterviewMode&&<button onClick={()=>setTimerEnabled(p=>!p)} aria-pressed={timerEnabled} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"var(--text-dim)",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400,padding:0}}>
                    {timerEnabled?t("timerOn"):t("timerOff")}
                  </button>}
                  {!isInHistoryMode&&<span aria-label={`${stats.current_streak||0} ${t("streakLabel")}`} style={{color:(stats.current_streak||0)>0?"#FF6B35":"var(--text-dim)",fontSize:12,fontWeight:700}}>
                    <span aria-hidden="true">🔥 {stats.current_streak||0} {t("streakLabel")}</span>
                  </span>}
                  {/* total_score shown live because it increments on every correct answer (immediate feedback).
                       sessionScore (+X) tracks this-quiz-only earnings to distinguish from the cumulative total.
                       In free mode, points go to total_score in-memory but are NOT persisted to Supabase. */}
                  {!isInHistoryMode&&<span aria-label={`${stats.total_score||0} ${t("pts")}${sessionScore>0?`, +${sessionScore} ${t("completionAdded")}`:""}`} style={{color:"#A855F7",fontSize:12,fontWeight:700,direction:"ltr"}}>
                    <span aria-hidden="true">⭐ {stats.total_score||0} {t("pts")}</span>
                    {sessionScore>0&&<span style={{color:"#00D4FF",fontSize:10,fontWeight:600,marginLeft:4,opacity:0.8}}>(+{sessionScore})</span>}
                  </span>}
                  {!isInHistoryMode&&isFreeMode(selectedTopic?.id)&&<span style={{fontSize:9,color:"var(--text-dim)",fontWeight:600,opacity:0.6,background:"var(--glass-4)",padding:"2px 6px",borderRadius:4}}>{t("freeModeBadge")}</span>}
                </div>
                <div style={{height:6,background:"var(--glass-6)",borderRadius:4,direction:"ltr",transform:lang==="he"?"scaleX(-1)":undefined}}>
                  <div style={{height:"100%",borderRadius:4,
                    width:`${currentQuestions.length>0?((questionIndex+1)/currentQuestions.length)*100:0}%`,
                    background:`linear-gradient(90deg,${selectedTopic.color},${selectedTopic.color}88)`,
                    transition:"width 0.4s ease"}}/>
                </div>
              </div>

              <div ref={questionRef} tabIndex={-1} aria-label={`${t("question")} ${questionIndex+1}: ${currentQuestions[questionIndex].q}`}
                style={{background:"var(--glass-3)",border:"1px solid var(--glass-8)",borderRadius:14,padding:"22px 20px 24px",marginBottom:20,outline:"none",position:"relative"}}>
                {renderQuestion(currentQuestions[questionIndex].q, lang)}
                {!isInHistoryMode&&!tryAgainActive&&!isFreeMode(selectedTopic?.id)&&(
                  <button onClick={toggleBookmark}
                    aria-label={currentQBookmarked ? t("removeBookmark") : t("bookmark")}
                    title={currentQBookmarked ? (lang==="en"?"Remove bookmark":"הסר סימניה") : (lang==="en"?"Save question":"שמור שאלה")}
                    style={{position:"absolute",top:10,[dir==="rtl"?"left":"right"]:10,background:"none",border:"none",cursor:"pointer",fontSize:20,color:currentQBookmarked?"#F59E0B":"var(--text-dim)",transition:"color 0.2s",padding:4,lineHeight:1}}>
                    {currentQBookmarked ? "★" : "☆"}
                  </button>
                )}
              </div>

              {!dispSubmitted&&!isInHistoryMode&&!tryAgainActive&&!isInterviewMode&&typeof currentQuestions[questionIndex]?.answer==="number"&&(
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <button
                      onClick={()=>setHintVisible(true)}
                      disabled={hintVisible}
                      aria-pressed={hintVisible}
                      style={{flex:1,padding:"7px 10px",background:"rgba(245,158,11,0.07)",border:`1px solid ${hintVisible?"rgba(245,158,11,0.4)":"rgba(245,158,11,0.18)"}`,borderRadius:8,color:hintVisible?"#F59E0B":"#d97706",fontSize:12,cursor:hintVisible?"default":"pointer",fontWeight:hintVisible?700:400,transition:"all 0.15s"}}>
                      {t("hint")}{hintVisible?" ✓":""}
                    </button>
                    <button
                      onClick={handleEliminate}
                      disabled={eliminatedOption!==null}
                      aria-pressed={eliminatedOption!==null}
                      style={{flex:1,padding:"7px 10px",background:"rgba(239,68,68,0.07)",border:`1px solid ${eliminatedOption!==null?"rgba(239,68,68,0.4)":"rgba(239,68,68,0.18)"}`,borderRadius:8,color:eliminatedOption!==null?"#EF4444":"#dc2626",fontSize:12,cursor:eliminatedOption!==null?"default":"pointer",fontWeight:eliminatedOption!==null?700:400,transition:"all 0.15s"}}>
                      {t("eliminate")}{eliminatedOption!==null?" ✓":""}
                    </button>
                  </div>
                  {hintVisible&&(
                    <div role="note" dir={dir} style={{background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:9,padding:"11px 14px",fontSize:13,color:"#fbbf24",lineHeight:1.6,direction:dir,unicodeBidi:"isolate",wordBreak:"break-word",overflowWrap:"anywhere",animation:"fadeIn 0.2s ease"}}>
                      {renderBidiBlock((currentQuestions[questionIndex]?.explanation || "").split(/\.\s+/)[0], lang)}
                    </div>
                  )}
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
                {(currentQuestions[questionIndex]?.options || []).map((opt,i)=>{
                  const q_cur = currentQuestions[questionIndex];
                  const isCorrect = dispAnswerResult ? i === dispAnswerResult.correctIndex : (typeof q_cur?.answer === "number" ? i === q_cur.answer : false);
                  const isChosen  = i===dispSelectedAnswer;
                  // Runtime consistency: verify green highlight matches expected correct text
                  if (dispSubmitted && dispAnswerResult && isCorrect && q_cur?._correctText && opt !== q_cur._correctText) {
                    console.error("[QUIZ_DEBUG] GREEN HIGHLIGHT MISMATCH!", { position: i, displayedOption: opt, expectedCorrect: q_cur._correctText, correctIndex: dispAnswerResult.correctIndex, answerField: q_cur.answer, allOptions: q_cur.options });
                  }
                  const isEliminated = !dispSubmitted && eliminatedOption === i;
                  let borderColor = "var(--glass-9)", bg = "var(--glass-2)", color = "var(--text-light)", labelBg = "var(--glass-7)", labelColor = "var(--text-secondary)";
                  if (isEliminated)                { borderColor = "var(--glass-4)"; bg = "var(--glass-1)"; color = "var(--text-disabled)"; labelBg = "var(--glass-3)"; labelColor = "var(--text-disabled)"; }
                  else if (isChosen && !dispSubmitted) { borderColor = "#00D4FF66"; bg = "rgba(0,212,255,0.06)"; color = "var(--code-text)"; labelBg = "rgba(0,212,255,0.15)"; labelColor = "#00D4FF"; }
                  if (dispSubmitted && !dispAnswerResult && isChosen) { borderColor = "#00D4FF99"; bg = "rgba(0,212,255,0.10)"; color = "var(--code-text)"; labelBg = "rgba(0,212,255,0.2)"; labelColor = "#00D4FF"; }
                  if (dispSubmitted && dispAnswerResult) {
                    if (isCorrect)             { borderColor = "#10B981"; bg = "rgba(16,185,129,0.1)";  color = "#10B981"; labelBg = "rgba(16,185,129,0.2)";  labelColor = "#10B981"; }
                    else if (isChosen)          { borderColor = "#EF4444"; bg = "rgba(239,68,68,0.1)";   color = "#EF4444"; labelBg = "rgba(239,68,68,0.2)";   labelColor = "#EF4444"; }
                  }
                  const optDir = (dir==="rtl" && !hasHebrew(opt)) ? "ltr" : dir;
                  return (
                    <button key={opt} className="opt-btn"
                      onClick={()=>{ if (isEliminated) return; if (tryAgainActive && tryAgainSelected===null) setTryAgainSelected(i); else if (!isInHistoryMode && !tryAgainActive) handleSelectAnswer(i); }}
                      aria-pressed={!dispSubmitted ? i === dispSelectedAnswer : undefined}
                      aria-disabled={isEliminated}
                      dir={dir}
                      style={{width:"100%",textAlign:optDir==="rtl"?"right":"left",padding:"14px 16px",background:bg,border:`1px solid ${borderColor}`,borderRadius:12,color,fontSize:15,cursor:isEliminated?"default":(tryAgainActive?(tryAgainSelected===null?"pointer":"default"):(dispSubmitted?"default":"pointer")),lineHeight:1.7,display:"flex",alignItems:"center",flexDirection:dir==="rtl"?"row-reverse":"row",gap:12,transition:"all 0.15s",opacity:isEliminated?0.35:1,textDecoration:isEliminated?"line-through":"none",minHeight:56}}>
                      <span aria-hidden="true" style={{flexShrink:0,width:30,height:30,borderRadius:8,background:labelBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:labelColor}}>{t("optionLabels")[i]}</span>
                      <span dir={optDir} style={{flex:1,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:optDir==="rtl"?"right":"left",lineHeight:1.7,unicodeBidi:"isolate"}}>{lang==="he"?renderBidi(opt,lang):opt}</span>
                      {dispSubmitted&&!dispAnswerResult&&isChosen&&<span aria-hidden="true" style={{flexShrink:0,width:18,height:18,border:"2px solid #00D4FF44",borderTop:"2px solid #00D4FF",borderRadius:"50%",animation:"spin 0.6s linear infinite"}} />}
                      {dispSubmitted&&dispAnswerResult&&isCorrect&&<span aria-hidden="true" style={{flexShrink:0,fontSize:18,lineHeight:1}}>✓</span>}
                      {dispSubmitted&&dispAnswerResult&&isChosen&&!isCorrect&&<span aria-hidden="true" style={{flexShrink:0,fontSize:18,lineHeight:1}}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Report error button */}
              {!isInHistoryMode&&!tryAgainActive&&(
                <div style={{textAlign:"center",marginBottom:8}}>
                  <button onClick={()=>{setReportDialog({qText:currentQuestions[questionIndex].q,qIndex:questionIndex});setReportType("");setReportNote("");setReportSent(false);}}
                    style={{background:"none",border:"none",color:"var(--text-dim)",fontSize:12,cursor:"pointer",padding:"4px 8px",borderRadius:6,transition:"color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--text-secondary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}>
                    {t("reportBtn")}
                  </button>
                </div>
              )}

              {!dispSubmitted&&dispSelectedAnswer!==null&&!isInHistoryMode&&!tryAgainActive&&(
                <button onClick={handleSubmit} disabled={checkingAnswer}
                  style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:checkingAnswer?"wait":"pointer",marginBottom:10,boxShadow:`0 4px 16px ${selectedTopic.color}44`,opacity:checkingAnswer?0.6:1,transition:"opacity 0.15s"}}>
                  {checkingAnswer ? "..." : t("confirmAnswer")}
                </button>
              )}

              {dispShowExplanation&&(
                <div style={{animation:"fadeIn 0.3s ease"}}>
                  {(()=>{
                    const q = currentQuestions[questionIndex];
                    const timedOut = dispSelectedAnswer === null || dispSelectedAnswer === -1;
                    const isCorrect = dispAnswerResult ? dispAnswerResult.correct : (!timedOut && dispSelectedAnswer === q.answer);
                    const explanationText = dispAnswerResult?.explanation || q.explanation || "";
                    const correctIdx = dispAnswerResult?.correctIndex ?? q.answer;
                    const paragraphs = explanationText.split("\n").flatMap(p => {
                      const t2 = p.trim(); if (!t2) return [];
                      // Don't split lines that are code blocks
                      if (t2.startsWith("```") || (t2.startsWith("`") && t2.endsWith("`"))) return [t2];
                      // Split on ". " at sentence boundaries, but not inside backtick-wrapped code
                      // Temporarily replace backtick spans, split, then restore
                      const codes = []; const safe = t2.replace(/`[^`]+`/g, m => { codes.push(m); return `\x00${codes.length-1}\x00`; });
                      return safe.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean).map(s => s.replace(/\x00(\d+)\x00/g, (_,i) => codes[i]));
                    });
                    return (
                      <div role="status" aria-live="polite" dir={dir} className="explanation-card" style={{background:isCorrect?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${isCorrect?"#10B98125":"#EF444425"}`,borderRadius:14,padding:0,marginBottom:8,overflow:"hidden"}}>
                        {/* Status banner */}
                        <div style={{background:isCorrect?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.10)",padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"flex-start",gap:8,borderBottom:`1px solid ${isCorrect?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)"}`,direction:dir,textAlign:dir==="rtl"?"right":"left"}}>
                          <span style={{fontWeight:900,fontSize:15,color:isCorrect?"#10B981":"#EF4444",letterSpacing:0.3}}>
                            {isCorrect
                              ? (tryAgainActive ? t("tryAgainCorrect") : `${t("correct")}${isInHistoryMode?"":" +"+(LEVEL_CONFIG[selectedLevel]?.points??0)+" "+t("pts")}`)
                              : timedOut
                                ? <>{t("timeUp")} {lang==="he"?"התשובה הנכונה היא":"The correct answer is"}: <span dir={hasHebrew(q.options[correctIdx])?"rtl":"ltr"} style={{unicodeBidi:"isolate"}}>{lang==="he"?renderBidi(q.options[correctIdx],lang):q.options[correctIdx]}</span></>
                                : (tryAgainActive ? t("tryAgainWrong") : t("incorrect"))}
                          </span>
                        </div>
                        {/* Explanation body */}
                        {!isInterviewMode&&<div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:12}}>
                          {paragraphs.map((s,idx)=>{
                            // Standalone CLI command or backtick-wrapped code block → render as code block
                            const stripped = s.replace(/`([^`]+)`/g, "$1").trim();
                            const isCodeOnly = (!(/[\u0590-\u05FF]/).test(stripped) && CLI_COMMAND_RE.test(stripped))
                              || (s.startsWith("```") && s.endsWith("```"))
                              || (s.startsWith("`") && s.endsWith("`") && !(/[\u0590-\u05FF]/).test(s));
                            if (isCodeOnly) {
                              const code = s.replace(/^```\s*|```$/g, "").replace(/^`|`$/g, "").trim();
                              return <code key={idx} dir="ltr" style={{display:"block",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.12)",borderRadius:8,padding:"10px 16px",fontSize:13,fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",color:"var(--code-text)",lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{code}</code>;
                            }
                            return (
                              <div key={idx} dir={dir} style={{color:"var(--text-light)",fontSize:14,lineHeight:1.75,direction:dir,textAlign:dir==="rtl"?"right":"left",wordBreak:"break-word",overflowWrap:"anywhere",maxWidth:"65ch",unicodeBidi:"isolate"}}>
                                {renderBidiBlock(s,lang)}
                              </div>
                            );
                          })}
                        </div>}
                      </div>
                    );
                  })()}
                  {isInterviewMode&&(()=>{
                    const q = currentQuestions[questionIndex];
                    const iExplanation = dispAnswerResult?.explanation || q.explanation || "";
                    const iCorrectIdx = dispAnswerResult?.correctIndex ?? q.answer;
                    const iParagraphs = iExplanation.split("\n").flatMap(p => {
                      const t2 = p.trim(); if (!t2) return [];
                      if (t2.startsWith("```") || (t2.startsWith("`") && t2.endsWith("`"))) return [t2];
                      const codes = []; const safe = t2.replace(/`[^`]+`/g, m => { codes.push(m); return `\x00${codes.length-1}\x00`; });
                      return safe.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean).map(s => s.replace(/\x00(\d+)\x00/g, (_,i) => codes[i]));
                    });
                    return (
                      <div dir={dir} style={{background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.22)",borderRadius:14,padding:0,marginBottom:8,direction:dir,animation:"fadeIn 0.3s ease",overflow:"hidden"}}>
                        <div style={{background:"rgba(168,85,247,0.10)",padding:"13px 20px",borderBottom:"1px solid rgba(168,85,247,0.12)",textAlign:dir==="rtl"?"right":"left"}}>
                          <span style={{fontSize:12,fontWeight:800,color:"#A855F7",letterSpacing:0.5}}>{lang==="he"?"תשובה אידיאלית":"Ideal Answer"}</span>
                        </div>
                        <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
                          {(()=>{const idDir=hasHebrew(q.options[iCorrectIdx])?"rtl":"ltr";return <div dir={idDir} style={{color:"var(--text-primary)",fontWeight:700,fontSize:14,lineHeight:1.7,wordBreak:"break-word",overflowWrap:"anywhere",direction:idDir,textAlign:idDir==="rtl"?"right":"left",unicodeBidi:"isolate"}}>{lang==="he"?renderBidi(q.options[iCorrectIdx],lang):q.options[iCorrectIdx]}</div>;})()}
                          {iParagraphs.map((s,idx)=>{
                            const stripped = s.replace(/`([^`]+)`/g, "$1").trim();
                            const isCodeOnly = (!(/[\u0590-\u05FF]/).test(stripped) && CLI_COMMAND_RE.test(stripped))
                              || (s.startsWith("```") && s.endsWith("```"))
                              || (s.startsWith("`") && s.endsWith("`") && !(/[\u0590-\u05FF]/).test(s));
                            if (isCodeOnly) {
                              const code = s.replace(/^```\s*|```$/g, "").replace(/^`|`$/g, "").trim();
                              return <code key={idx} dir="ltr" style={{display:"block",background:"rgba(168,85,247,0.08)",border:"1px solid rgba(168,85,247,0.15)",borderRadius:8,padding:"10px 16px",fontSize:13,fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",color:"var(--code-text)",lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{code}</code>;
                            }
                            return (
                              <div key={idx} dir={dir} style={{color:"var(--text-light)",fontSize:14,lineHeight:1.85,direction:dir,textAlign:dir==="rtl"?"right":"left",wordBreak:"break-word",overflowWrap:"anywhere",maxWidth:"65ch",unicodeBidi:"isolate"}}>
                                {renderBidiBlock(s,lang)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Try Again button: shown in history mode for wrong answers */}
                  {isInHistoryMode && !tryAgainActive && (()=>{
                    const orig = quizHistory[questionIndex]?.chosen;
                    const correctIdx = dispAnswerResult?.correctIndex ?? currentQuestions[questionIndex]?.answer;
                    const wasWrong = orig !== undefined && correctIdx !== undefined && orig !== correctIdx;
                    if (!wasWrong) return null;
                    return (
                      <button
                        onClick={() => setTryAgainActive(true)}
                        style={{width:"100%",padding:"12px 15px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:12,color:"#F59E0B",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                        {t("tryAgainBtn")}
                        <span style={{fontSize:11,color:"var(--text-secondary)",fontWeight:500}}>{t("tryAgainBadge")}</span>
                      </button>
                    );
                  })()}
                  {tryAgainActive ? (
                    <button
                      onClick={() => { setTryAgainActive(false); setTryAgainSelected(null); }}
                      style={{width:"100%",padding:15,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.4)",borderRadius:12,color:"#F59E0B",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                      {t("exitTryAgain")}
                    </button>
                  ) : (
                    <button ref={nextBtnRef}
                      onClick={isInHistoryMode ? ()=>setQuestionIndex(p=>Math.min(p+1, currentQuestions.length-1)) : nextQuestion}
                      style={{width:"100%",padding:15,background:`linear-gradient(135deg,${selectedTopic.color}cc,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
                      {isInHistoryMode
                        ? (questionIndex >= liveIndexRef.current - 1 ? t("backToCurrent") : t("nextQuestion"))
                        : (questionIndex>=currentQuestions.length-1 ? t("finishTopic") : t("nextQuestion"))}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* COMPLETE */}
      {screen==="topicComplete"&&selectedTopic&&selectedLevel&&(()=>{
        const key=`${selectedTopic.id}_${selectedLevel}`;
        const result=completedTopics[key];
        const effectivelyComplete = (result?.correct === result?.total) || allowNextLevel;
        const allCorrect = result?.correct === result?.total;
        const anyCorrect = result?.correct > 0;
        const wrongQs = quizHistory.filter(h=>h.chosen!==h.answer);
        // Next topic: show after finishing any level of this topic
        const nextTopicIdx = selectedTopic.id!=="mixed"&&selectedTopic.id!=="daily"
          ? TOPICS.findIndex(t=>t.id===selectedTopic.id)+1
          : -1;
        return(
          <div style={{maxWidth:480,margin:"30px auto",padding:"0 14px",textAlign:"center",animation:"fadeIn 0.5s ease"}}>
            <div style={{fontSize:52,marginBottom:10,animation:"popIn 1s ease"}}>
              {allCorrect?"🌟":anyCorrect?"👍":"💪"}
            </div>
            <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 8px",color:selectedTopic.color,wordBreak:"break-word"}}>{selectedTopic.name} – {lang==="en"?LEVEL_CONFIG[selectedLevel]?.labelEn:LEVEL_CONFIG[selectedLevel]?.label}</h2>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8,background:"var(--glass-4)",borderRadius:30,padding:"8px 20px"}}>
              <span style={{color:"var(--text-primary)",fontSize:16,fontWeight:700}}>{result?.correct}/{result?.total} {t("correctCount")}</span>
              {allCorrect&&<span style={{color:"#F59E0B",fontSize:13,fontWeight:700}}>{t("perfect")}</span>}
            </div>
            {/* Session score = points earned this quiz run only.
                 total_score was already incremented per-answer during gameplay.
                 best_score was recomputed from completedTopics at quiz end.
                 If this session didn't improve the topic's best result (replay),
                 a subtle message is shown. Replay-inflation prevention: best_score
                 only improves when finalCorrect > prevResult.correct. */}
            {lastSessionScoreRef.current > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{color:"#00D4FF",fontWeight:800,fontSize:18}}>
                  +{lastSessionScoreRef.current} {t("points")}
                </div>
                <div style={{color:"var(--text-dim)",fontSize:11,opacity:0.55,marginTop:3}}>
                  {t("completionAdded")}
                </div>
              </div>
            )}
            {lastSessionScoreRef.current > 0 && !bestImprovedRef.current && !isFreeMode(selectedTopic.id) && (
              <div style={{color:"var(--text-dim)",fontSize:12,opacity:0.5,marginBottom:12}}>
                {t("completionNoImprovement")}
              </div>
            )}
            {lastSessionScoreRef.current > 0 && isFreeMode(selectedTopic.id) && (
              <div style={{color:"var(--text-dim)",fontSize:11,opacity:0.5,marginBottom:12}}>
                {t("freeModeBadge")}
              </div>
            )}
            {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:16,fontSize:13,color:"#4a9aba"}}>
              {t("guestSaveHint")}{" "}
              <button onClick={()=>{window.va?.track("signup_clicked",{source:"quiz_game"});setAuthScreen("signup");setUser(null);}} style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>{t("signupLink")}</button>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* Next topic button - only shown when ALL levels of current topic are mastered */}
              {nextTopicIdx>0&&nextTopicIdx<TOPICS.length&&effectivelyComplete&&LEVEL_ORDER.every(lvl=>{if(lvl===selectedLevel) return effectivelyComplete; const r=completedTopics[`${selectedTopic.id}_${lvl}`]; return r&&(r.correct===r.total||r.retryComplete);})&&(()=>{
                const nt=TOPICS[nextTopicIdx];
                return<button onClick={()=>startTopic(nt,"easy")}
                  style={{padding:14,background:`linear-gradient(135deg,${nt.color}ee,${nt.color}88)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 20px ${nt.color}55`}}>
                  {lang==="en"?"Next Topic":"נושא הבא"}: {nt.icon} {nt.name}
                </button>;
              })()}
              {/* Next level button */}
              {selectedTopic.id!=="mixed"&&effectivelyComplete&&getNextLevel(selectedLevel)&&(()=>{
                const nextLvl=getNextLevel(selectedLevel);
                const nextCfg=LEVEL_CONFIG[nextLvl];
                return(
                  <button onClick={()=>startTopic(selectedTopic,nextLvl)}
                    style={{padding:14,background:`linear-gradient(135deg,${nextCfg.color}ee,${nextCfg.color}88)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 20px ${nextCfg.color}55`}}>
                    {t("nextLevelBtn")} {nextCfg.icon} {lang==="en"?nextCfg.labelEn:nextCfg.label}
                  </button>
                );
              })()}
              {/* Retry wrong answers */}
              {!isFreeMode(selectedTopic.id)&&wrongQs.length>0&&(
                <button onClick={()=>{
                  try {
                  const qs=wrongQs.map(h=>({q:h.q,options:h.options,answer:h.answer,explanation:h.explanation}));
                  console.debug("[RETRY] starting retry", { count: qs.length, hasOptions: qs.every(q=>Array.isArray(q.options)), hasAnswer: qs.every(q=>typeof q.answer==="number") });
                  if (!qs.length) { console.error("[RETRY] no wrong questions to retry"); return; }
                  setMixedQuestions(qs);
                  setRetryMode(true);
                  isRetryRef.current=true;
                  setAllowNextLevel(false);
                  setTopicScreen("quiz");
                  setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
                  setShowExplanation(false); setAnswerResult(null);
                  // Reset per-question ephemeral state (hint, eliminate, try-again)
                  setHintVisible(false); setEliminatedOption(null);
                  setTryAgainActive(false); setTryAgainSelected(null);
                  topicCorrectRef.current=0; lastSessionScoreRef.current=0; bestImprovedRef.current=true;
                  liveIndexRef.current=0;
                  quizRunIdRef.current=Date.now().toString(36);
                  submittingRef.current=false;
                  answerCacheRef.current={};
                  setSessionScore(0);
                  setQuizHistory([]); setShowReview(false);
                  // BUG-C fix: retries must never reset streak
                  if (timerEnabled||isInterviewMode) setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):(TIMER_DURATIONS[selectedLevel]||30));
                  setScreen("topic");
                  window.va?.track("retry_quiz", { topic: selectedTopic?.name || selectedTopic?.id });
                  console.debug("[RETRY] screen set to topic");
                  } catch (err) { console.error("[RETRY] failed:", err); }
                }}
                  style={{padding:13,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,color:"#EF4444",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  {lang==="en"?`Retry ${wrongQs.length} wrong answer${wrongQs.length>1?"s":""}`:`תרגלי ${wrongQs.length} ${wrongQs.length>1?"שאלות":"שאלה"} שגויות`}
                </button>
              )}
              {quizHistory.length>0&&<button onClick={()=>setShowReview(p=>!p)} style={{padding:13,background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:12,color:"var(--text-secondary)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {showReview?t("hideReview"):t("reviewBtn")}
              </button>}
              {(()=>{
                const lvlLabel = lang==="en" ? LEVEL_CONFIG[selectedLevel]?.labelEn : LEVEL_CONFIG[selectedLevel]?.label;
                const perfect = result?.correct === result?.total;
                const isDaily = selectedTopic.id === "daily";
                const dateStr = new Date().toLocaleDateString(lang==="en"?"en-US":"he-IL",{month:"short",day:"numeric"});
                const topicName = isDaily ? `Daily Challenge (${dateStr})` : selectedTopic.name;
                const msg = `KubeQuest Challenge\n\n${topicName}\n${isDaily ? "" : lvlLabel + "\n"}\nScore: ${result?.correct}/${result?.total}\n\nCan you beat this?\n\nhttps://kubequest.online`;
                const handleShare = async () => {
                  // Mobile: use native share sheet (works with LinkedIn, WhatsApp, etc.)
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: "KubeQuest", text: msg, url: "https://kubequest.online" });
                      return;
                    } catch(e) {
                      if (e.name === "AbortError") return; // user dismissed - do nothing
                      // fall through to desktop fallback
                    }
                  }
                  // Desktop fallback: copy text + open LinkedIn
                  navigator.clipboard?.writeText(msg).catch(()=>{});
                  window.open("https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fkubequest.online","_blank","noopener,noreferrer,width=620,height=640");
                  setShareCopied(true);
                  setTimeout(()=>setShareCopied(false), 4000);
                };
                return(
                  <div>
                    <button onClick={handleShare} style={{width:"100%",padding:13,background:shareCopied?"rgba(10,102,194,0.18)":"rgba(10,102,194,0.1)",border:`1px solid ${shareCopied?"rgba(10,102,194,0.6)":"rgba(10,102,194,0.35)"}`,borderRadius:12,color:"#4a9ede",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
                      {shareCopied?(lang==="en"?"✓ Copied! Paste in LinkedIn":"✓ הועתק! הדבק ב-LinkedIn"):t("shareResult")}
                    </button>
                    {shareCopied&&<div style={{fontSize:11,color:"var(--text-muted)",textAlign:"center",marginTop:5,animation:"fadeIn 0.2s ease"}}>
                      {lang==="en"?"Post text copied to clipboard - just paste it in the LinkedIn dialog":"טקסט הפוסט הועתק - הדבק אותו בחלון LinkedIn"}
                    </div>}
                  </div>
                );
              })()}
              <button onClick={()=>{window.va?.track("restart_full_quiz",{topic:selectedTopic?.name||selectedTopic?.id,previousScore:result?.correct});selectedTopic.id==="mixed"?startMixedQuiz():selectedTopic.id==="daily"?startDailyChallenge():startTopic(selectedTopic,selectedLevel);}} style={{padding:13,background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:12,color:"var(--text-secondary)",fontSize:13,fontWeight:600,cursor:"pointer"}}>{t("restartFullQuiz")}</button>
              <button onClick={()=>setScreen("home")} style={{padding:13,background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:12,color:"var(--text-primary)",fontSize:13,fontWeight:600,cursor:"pointer"}}>{t("backToTopics")}</button>
            </div>
            {showReview&&quizHistory.length>0&&(
              <div style={{marginTop:20,textAlign:dir==="rtl"?"right":"left",animation:"fadeIn 0.3s ease"}}>
                <div style={{color:"var(--text-secondary)",fontSize:12,fontWeight:700,marginBottom:12,letterSpacing:1}}>{t("reviewTitle")}</div>
                <ol style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:10}}>
                  {quizHistory.map((h,i)=>{
                    const wasCorrect=h.chosen===h.answer;
                    const timedOut=h.chosen===-1;
                    return(
                      <li key={i} aria-label={`${t("question")} ${i+1}: ${wasCorrect?(lang==="en"?"correct":"נכון"):(lang==="en"?"incorrect":"לא נכון")}`}
                        style={{background:wasCorrect?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${wasCorrect?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"12px 14px"}}>
                        <div style={{fontWeight:700,fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4}}>
                          <span aria-hidden="true">{wasCorrect?"✅":"❌"} </span>{t("question")} {i+1}
                        </div>
                        <div style={{color:"var(--text-primary)",fontSize:13,marginBottom:6}}>{renderBidiBlock(h.q,lang)}</div>
                        {timedOut?<div style={{fontSize:13,color:"#F59E0B"}}>{t("timeUp")}</div>:(
                          <div dir={hasHebrew(h.options[h.chosen])?"rtl":"ltr"} style={{fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4,direction:hasHebrew(h.options[h.chosen])?"rtl":"ltr",textAlign:hasHebrew(h.options[h.chosen])?"right":"left",unicodeBidi:"isolate"}}>
                            {t("optionLabels")[h.chosen]}. {lang==="he"?renderBidi(h.options[h.chosen],lang):h.options[h.chosen]}
                          </div>
                        )}
                        {!wasCorrect&&<div dir={hasHebrew(h.options[h.answer])?"rtl":"ltr"} style={{fontSize:13,color:"#10B981",direction:hasHebrew(h.options[h.answer])?"rtl":"ltr",textAlign:hasHebrew(h.options[h.answer])?"right":"left",unicodeBidi:"isolate"}}><span aria-hidden="true">✓ </span>{lang==="he"?renderBidi(h.options[h.answer],lang):h.options[h.answer]}</div>}
                        <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4,lineHeight:1.6}}>{renderBidiBlock(h.explanation,lang)}</div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        );
      })()}
      {/* ── INCIDENT LIST ─────────────────────────────────────────────────── */}
      {screen==="incidentList"&&(
        <div style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease",direction:dir}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
            <button onClick={()=>setScreen("home")} style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-secondary)",width:36,height:36,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span aria-hidden="true">{dir==="rtl"?"→":"←"}</span>
            </button>
            <div>
              <h2 style={{margin:0,color:"#EF4444",fontSize:20,fontWeight:900}}>{t("incidentModeBtn")}</h2>
              <p style={{margin:"4px 0 0",color:"var(--text-dim)",fontSize:12,lineHeight:1.5,whiteSpace:"pre-line"}}>{t("incidentHeaderSub")}</p>
            </div>
          </div>

          {/* Active incident */}
          {incidentResume&&(
            <div style={{marginBottom:28}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text-dim)",marginBottom:10}}>{t("incidentActiveLabel")}</div>
              <div style={{padding:18,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.25)",borderInlineStart:"3px solid #EF4444",borderRadius:14,direction:dir}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontSize:22}}>{incidentResume.incident.icon}</span>
                  <span style={{color:"var(--text-primary)",fontWeight:800,fontSize:15}}>{lang==="he"?incidentResume.incident.titleHe:incidentResume.incident.title}</span>
                </div>
                <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:14}}>{t("incidentStep")} {incidentResume.stepIndex+1}/{incidentResume.incident.steps.length}</div>
                <button onClick={resumeIncident} style={{width:"100%",padding:"12px 20px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,color:"#EF4444",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8}}>{t("incidentResumeBtn")}</button>
                <button onClick={()=>{clearIncidentProgress();setIncidentResume(null);}} style={{width:"100%",padding:"8px",background:"none",border:"none",color:"var(--text-dim)",fontSize:12,cursor:"pointer"}}>{t("incidentDiscard")}</button>
              </div>
            </div>
          )}

          {/* Available incidents */}
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text-dim)",marginBottom:10}}>{t("incidentAvailableLabel")}</div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {INCIDENTS.map(incident=>{
              const diff = INCIDENT_DIFFICULTY_CONFIG[incident.difficulty] || INCIDENT_DIFFICULTY_CONFIG.medium;
              return(
                <button key={incident.id} onClick={()=>startIncident(incident)}
                  style={{width:"100%",padding:"16px 18px",background:"var(--glass-2)",border:"1px solid var(--glass-7)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:dir==="rtl"?"right":"left",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.06)";e.currentTarget.style.borderColor="rgba(239,68,68,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="var(--glass-2)";e.currentTarget.style.borderColor="var(--glass-7)";}}>
                  <span style={{fontSize:30,flexShrink:0}}>{incident.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{color:"var(--text-primary)",fontWeight:800,fontSize:15,marginBottom:4}}>{lang==="he"?incident.titleHe:incident.title}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",color:"var(--text-muted)",fontSize:12}}>
                      <span style={{background:`${diff.color}22`,color:diff.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,letterSpacing:0.5}}>{lang==="he"?diff.labelHe:diff.label}</span>
                      <span style={{color:"var(--text-dim)"}}>·</span>
                      <span>{incident.steps.length} {t("incidentSteps")}</span>
                      <span style={{color:"var(--text-dim)"}}>·</span>
                      <span>{incident.estimatedTime}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Footer lang={lang}/>
        </div>
      )}

      {/* ── INCIDENT PLAYING ──────────────────────────────────────────────── */}
      {screen==="incident"&&selectedIncident&&(()=>{
        const step = getIncidentStep(incidentStepIndex);
        if (!step) { return <div style={{textAlign:"center",padding:"40px 20px"}}><p style={{color:"var(--text-secondary)",fontSize:14}}>{lang==="en"?"Incident step not found. Returning...":"שלב לא נמצא. חוזר..."}</p><button onClick={()=>setScreen("incidentList")} style={{marginTop:12,padding:"10px 22px",background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:10,color:"var(--text-secondary)",fontSize:14,cursor:"pointer"}}>{lang==="en"?"Back":"חזרה"}</button></div>; }
        const totalSteps = incidentSteps ? incidentSteps.length : (selectedIncident.steps?.length || 0);
        const maxScore = totalSteps * 10;
        const progress = totalSteps > 0 ? ((incidentStepIndex + (incidentSubmitted ? 1 : 0)) / totalSteps) * 100 : 0;
        return(
          <div style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease",direction:dir}}>
            {/* Top bar */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8,direction:dir}}>
              <button onClick={()=>{saveIncidentProgress(selectedIncident,incidentStepIndex,incidentScore,incidentMistakes,incidentElapsed,incidentHistory);setScreen("incidentList");}}
                style={{background:"var(--glass-4)",border:"1px solid var(--glass-9)",color:"var(--text-muted)",padding:"7px 12px",borderRadius:7,cursor:"pointer",fontSize:13,marginLeft:dir==="rtl"?"auto":undefined}}>
                {lang==="he"?"חזרה →":"← Return"}
              </button>
              <div style={{display:"flex",gap:14,alignItems:"center",fontSize:13,fontWeight:700}}>
                <span style={{color:"var(--text-secondary)"}}>{t("incidentStep")} <span style={{color:"var(--text-primary)"}}>{incidentStepIndex+1}/{totalSteps}</span></span>
                <span style={{color:"#A855F7"}}>⭐ {incidentScore}<span style={{color:"var(--text-dim)",fontWeight:400}}>/{maxScore}</span></span>
                <span style={{color:incidentMistakes>0?"#EF4444":"var(--text-dim)"}}>❌ {incidentMistakes}</span>
                <span style={{color:"#F59E0B"}}>⏱ {formatIncidentTime(incidentElapsed)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{height:4,background:"var(--glass-6)",borderRadius:4,marginBottom:16,direction:"ltr",transform:lang==="he"?"scaleX(-1)":undefined}}>
              <div style={{height:"100%",borderRadius:4,width:`${progress}%`,background:"linear-gradient(90deg,#EF4444,#F59E0B)",transition:"width 0.4s ease"}}/>
            </div>

            {/* Incident title badge */}
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"8px 14px",marginBottom:14}}>
              <span>{selectedIncident.icon}</span>
              <span style={{color:"#EF4444",fontWeight:700,fontSize:13}}>{lang==="he"?selectedIncident.titleHe:selectedIncident.title}</span>
              <span style={{marginLeft:"auto",color:INCIDENT_DIFFICULTY_CONFIG[selectedIncident.difficulty]?.color||"#F59E0B",fontSize:11,fontWeight:700}}>{INCIDENT_DIFFICULTY_CONFIG[selectedIncident.difficulty]?.[lang==="he"?"labelHe":"label"]}</span>
            </div>

            {/* Prompt */}
            <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid var(--glass-10)",borderRadius:14,padding:"18px 20px",marginBottom:14,overflowX:"auto"}}>
              {renderIncidentPrompt(lang === "he" ? (step.promptHe || step.prompt) : step.prompt)}
            </div>

            {/* Options */}
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
              {(lang === "he" ? (step.optionsHe || step.options) : step.options || []).map((opt,i)=>{
                const isCorrect  = incidentAnswerResult ? i === incidentAnswerResult.correctIndex : i === step?.answer;
                const isChosen   = i === incidentAnswer;
                let bg = "var(--glass-2)", border = "var(--glass-9)", color = "var(--text-light)", labelBg = "var(--glass-7)", labelColor = "var(--text-secondary)";
                if (!incidentSubmitted && isChosen) { bg="rgba(239,68,68,0.08)"; border="#EF444466"; color="#fca5a5"; labelBg="rgba(239,68,68,0.2)"; labelColor="#EF4444"; }
                if (incidentSubmitted) {
                  if (isCorrect)       { bg="rgba(16,185,129,0.1)"; border="#10B981"; color="#10B981"; labelBg="rgba(16,185,129,0.2)"; labelColor="#10B981"; }
                  else if (isChosen)   { bg="rgba(239,68,68,0.1)";  border="#EF4444"; color="#EF4444"; labelBg="rgba(239,68,68,0.2)";  labelColor="#EF4444"; }
                }
                const optDir = (dir==="rtl" && !hasHebrew(opt)) ? "ltr" : dir;
                return(
                  <button key={i} className="incident-opt" onClick={()=>{ if (!incidentSubmitted) submitIncidentStep(i); }}
                    aria-pressed={!incidentSubmitted ? i===incidentAnswer : undefined}
                    style={{width:"100%",textAlign:optDir==="rtl"?"right":"left",padding:"13px 14px",background:bg,border:`1px solid ${border}`,borderRadius:10,color,fontSize:14,cursor:incidentSubmitted?"default":"pointer",lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:10,transition:"all 0.15s",direction:optDir}}>
                    <span style={{flexShrink:0,width:24,height:24,borderRadius:6,background:labelBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:labelColor,marginTop:1,direction:"ltr"}}>
                      {["A","B","C","D"][i]}
                    </span>
                    <span dir={optDir} style={{flex:1,direction:optDir,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:optDir==="rtl"?"right":"left",lineHeight:1.7,unicodeBidi:"isolate"}}>{lang==="he"?renderBidi(opt,lang):opt}</span>
                    {incidentSubmitted&&isCorrect&&<span style={{flexShrink:0,fontSize:15}}>✓</span>}
                    {incidentSubmitted&&isChosen&&!isCorrect&&<span style={{flexShrink:0,fontSize:15}}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Result + explanation */}
            {incidentSubmitted&&(
              <div style={{animation:"fadeIn 0.3s ease"}}>
                {(()=>{
                  const incCorrect = incidentAnswerResult ? incidentAnswerResult.correct : incidentAnswer === step.answer;
                  const incExplanation = incidentAnswerResult
                    ? (lang === "he" ? (incidentAnswerResult.explanationHe || incidentAnswerResult.explanation) : incidentAnswerResult.explanation)
                    : (lang === "he" ? (step.explanationHe || step.explanation) : step.explanation);
                  return (
                    <>
                      <div style={{background:incCorrect?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${incCorrect?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                        <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:incCorrect?"#10B981":"#EF4444"}}>
                          {incCorrect?t("incidentCorrect"):t("incidentWrong")}
                        </div>
                        {renderIncidentExplanation(incExplanation)}
                      </div>
                      <button onClick={nextIncidentStep}
                        style={{width:"100%",padding:15,background:"linear-gradient(135deg,#EF4444cc,#F59E0B88)",border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                        {incidentStepIndex>=totalSteps-1?t("incidentFinish"):t("incidentNext")}
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── INCIDENT COMPLETE ─────────────────────────────────────────────── */}
      {screen==="incidentComplete"&&selectedIncident&&(()=>{
        const maxScore = (incidentSteps ? incidentSteps.length : (selectedIncident.steps?.length || 0)) * 10;
        const perfect  = incidentScore === maxScore;
        const goodRun  = incidentMistakes <= 1;
        return(
          <div style={{maxWidth:480,margin:"30px auto",padding:"0 18px",textAlign:"center",animation:"fadeIn 0.5s ease",direction:dir}}>
            <div style={{fontSize:56,marginBottom:10}}>{perfect?"🏆":goodRun?"🎯":"💪"}</div>
            <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 6px",color:"#22C55E"}}>{t("incidentResolved")}</h2>
            <p style={{color:"var(--text-muted)",fontSize:13,margin:"0 0 20px"}}>{lang==="he"?selectedIncident.titleHe:selectedIncident.title}</p>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
              {[
                {label:t("incidentScore"),  value:`${incidentScore}/${maxScore}`, icon:"⭐", color:"#A855F7"},
                {label:t("incidentTime"),   value:formatIncidentTime(incidentElapsed), icon:"⏱", color:"#F59E0B"},
                {label:t("incidentMistakes"),value:incidentMistakes,               icon:"❌", color:incidentMistakes===0?"#10B981":"#EF4444"},
              ].map((s,i)=>(
                <div key={i} style={{background:"var(--glass-3)",border:"1px solid var(--glass-7)",borderRadius:12,padding:"14px 8px"}}>
                  <div style={{fontSize:20}}>{s.icon}</div>
                  <div style={{fontSize:18,fontWeight:800,color:s.color,marginTop:4}}>{s.value}</div>
                  <div style={{fontSize:12,color:"var(--text-dim)",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* LinkedIn share */}
              <div style={{background:"rgba(10,102,194,0.06)",border:"1px solid rgba(10,102,194,0.2)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"var(--text-dim)",marginBottom:8,textAlign:"left"}}>
                  {lang==="en"?"1. Copy this text  2. Open LinkedIn  3. Paste":"1. העתק את הטקסט  2. פתח LinkedIn  3. הדבק"}
                </div>
                <div
                  onClick={()=>{
                    const el = document.getElementById("share-text-box");
                    if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
                    handleIncidentShare();
                  }}
                  id="share-text-box"
                  style={{background:"var(--glass-4)",border:"1px solid var(--glass-10)",borderRadius:8,padding:"10px 12px",fontSize:12,color:"var(--text-secondary)",direction:"ltr",textAlign:"left",lineHeight:1.7,marginBottom:10,cursor:"text",userSelect:"all",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                  {buildIncidentShareMsg()}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={handleIncidentShare}
                    style={{flex:1,padding:"10px",background:incidentShareCopied?"rgba(16,185,129,0.15)":"var(--glass-6)",border:`1px solid ${incidentShareCopied?"#10B98150":"var(--glass-10)"}`,borderRadius:8,color:incidentShareCopied?"#10B981":"var(--text-secondary)",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
                    {incidentShareCopied ? "✓ "+( lang==="en"?"Copied!":"הועתק!") : "📋 "+(lang==="en"?"Copy":"העתק")}
                  </button>
                  <a href="https://www.linkedin.com/post/new" target="_blank" rel="noopener noreferrer"
                    style={{flex:1,padding:"10px",background:"rgba(10,102,194,0.12)",border:"1px solid rgba(10,102,194,0.35)",borderRadius:8,color:"#4a9ede",fontSize:13,fontWeight:700,cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    in {lang==="en"?"Open LinkedIn":"פתח LinkedIn"}
                  </a>
                </div>
              </div>
              <button onClick={()=>setScreen("incidentList")}
                style={{padding:13,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:12,color:"#6366F1",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {t("incidentTryAnother")}
              </button>
              <button onClick={()=>setScreen("home")}
                style={{padding:13,background:"var(--glass-4)",border:"1px solid var(--glass-9)",borderRadius:12,color:"var(--text-secondary)",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {t("backToTopics")}
              </button>
            </div>
            <Footer lang={lang}/>
          </div>
        );
      })()}
      </>}

      </main>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
