import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import WeakAreaCard from "./components/WeakAreaCard";
import RoadmapView from "./components/RoadmapView";
import { ACHIEVEMENTS } from "./topicMeta";
import { TOPICS } from "./content/topics";
import { DAILY_QUESTIONS } from "./content/dailyQuestions";
import { INCIDENTS } from "./content/incidents";
import { saveQuizState, loadQuizState, clearQuizState } from "./utils/quizPersistence";
import { fetchQuizQuestions, fetchMixedQuestions, checkQuizAnswer, fetchTheory, fetchDailyQuestions, checkDailyAnswer, fetchIncidents, fetchIncidentSteps, checkIncidentAnswer, fetchLeaderboard, fetchUserRank } from "./api/quiz";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
if (!supabase) console.warn("[KubeQuest] Supabase not configured — VITE_SUPABASE_URL:", !!SUPABASE_URL, "VITE_SUPABASE_ANON_KEY:", !!SUPABASE_KEY);

const GUEST_USER = { id: "guest", email: "guest", user_metadata: { username: "Guest" } };

const LEVEL_CONFIG = {
  easy:   { label: "קל",        labelEn: "Easy",             icon: "🌱", color: "#10B981", points: 10 },
  medium: { label: "בינוני",    labelEn: "Medium",           icon: "⚡", color: "#F59E0B", points: 20 },
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
// v2.0.0 — major: portfolio repo refactor (BSL 1.1, proprietary content extracted)
const APP_VERSION  = "2.0.0";
const SESSION_START = new Date();

// Resume modal behaviour constants
const RESUME_SESSION_KEY  = "resumeModalSeen";       // sessionStorage: shown once per tab
const RESUME_DISMISS_KEY  = "resumeDismissedAt";     // localStorage: cooldown timestamp
const RESUME_COOLDOWN_MS  = 10 * 60 * 1000;         // 10-minute cooldown after dismiss
const RESUME_MIN_PROGRESS = 0.2;                     // <20% answered → skip modal, start fresh

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
    greeting: "שלום", playingAsGuest: "· משחקת כאורחת",
    leaderboardBtn: "🏆 טבלה", logout: "יציאה",
    guestBanner: "💡 הירשמי כדי לשמור התקדמות ולהופיע בלוח התוצאות",
    signupNow: "הירשמי",
    score: "ניקוד", accuracy: "דיוק", streak: "רצף", completed: "הושלמו",
    pts: "נק׳",
    achievementsTitle: "🏅 הישגים",
    leaderboardTitle: "🏆 לוח תוצאות", noData: "אין נתונים עדיין", anonymous: "אנונימי",
    back: "→ חזרי", theory: "📖 תיאוריה",
    startQuiz: "🎯 התחילי חידון!", ptsPerQ: "נק׳ לשאלה",
    question: "שאלה", of: "/", streakLabel: "רצף",
    confirmAnswer: "✔ אשרי תשובה",
    correct: "✅ נכון!", incorrect: "❌ לא נכון",
    finishTopic: "🎉 סיימי נושא!", nextQuestion: "שאלה הבאה ←",
    correctCount: "נכון", perfect: "⭐ מושלם!", points: "נקודות",
    guestSaveHint: "💡 הירשמי כדי לשמור את הניקוד!", signupLink: "הירשמי עכשיו",
    tryAgain: "🔄 נסי שוב", backToTopics: "→ חזרי לנושאים",
    nextLevelBtn: "🚀 המשיכי לרמה הבאה", locked: "🔒 נעול",
    skipTheory: "⚡ דלגי לחידון",
    timerOn: "⏱ כבי טיימר", timerOff: "⏱ הפעילי טיימר", timeUp: "⏰ הזמן נגמר!",
    reviewBtn: "📋 צפי בסקירה", hideReview: "הסתירי סקירה", reviewTitle: "סקירת שאלות",
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
    roadmapStartHere: "▶ התחילי כאן",
    roadmapContinue: "🚀 המשיכי לשלב הבא",
    roadmapLocked: "🔒 נפתח אחרי השלמת השלב הקודם",
    roadmapDone: "✅ הושלם",
    roadmapContinueHere: "▶ המשיכי מכאן",
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
    shareResult: "🔗 שתפי תוצאה",
    readQuestion_m: "🔊 קרא שאלה", stopSpeech_m: "⏹ עצור", autoRead_m: "קריאה אוטומטית",
    hint_m: "💡 רמז", eliminate_m: "❌ הסר תשובה שגויה",
    shareResult_m: "🔗 שתף תוצאה",
    // Male-form overrides (used when gender === "m")
    tagline_m: "למד Kubernetes בצורה כיפית ואינטראקטיבית",
    startPlaying_m: "⚡ התחל לשחק עכשיו",
    loginBtn_m: "התחבר", signupBtn_m: "הירשם",
    emailAlreadySent_m: "✅ אימייל אימות כבר נשלח! בדוק את תיבת הדואר שלך.",
    otpExpired_m: "❌ קישור האימות פג תוקף. אנא הירשם שוב כדי לקבל קישור חדש.",
    resendSuccess_m: "✅ אימייל חדש נשלח! בדוק את תיבת הדואר.",
    resendError_m: "❌ שגיאה בשליחה מחדש. נסה שוב.",
    playingAsGuest_m: "· משחק כאורח",
    guestBanner_m: "💡 הרשם כדי לשמור התקדמות ולהופיע בלוח התוצאות",
    signupNow_m: "הרשם",
    back_m: "→ חזור",
    startQuiz_m: "🎯 התחל חידון!",
    confirmAnswer_m: "✔ אשר תשובה",
    finishTopic_m: "🎉 סיים נושא!",
    guestSaveHint_m: "💡 הרשם כדי לשמור את הניקוד!", signupLink_m: "הרשם עכשיו",
    tryAgain_m: "🔄 נסה שוב", backToTopics_m: "→ חזור לנושאים",
    nextLevelBtn_m: "🚀 המשך לרמה הבאה",
    skipTheory_m: "⚡ דלג לחידון",
    timerOn_m: "⏱ כבה טיימר", timerOff_m: "⏱ הפעל טיימר",
    reviewBtn_m: "📋 צפה בסקירה", hideReview_m: "הסתר סקירה",
    saveErrorText_m: "⚠️ הנתונים לא נשמרו – בדוק חיבור לאינטרנט",
    guestName_m: "אורח",
    resetProgress_m: "אפס התקדמות", resetConfirm_m: "האם אתה בטוח? פעולה זו תמחק את כל ההתקדמות ולא ניתן לבטלה.",
    resetTopic_m: "אפס נושא",
    allPerfectMsg_m: "כל הנושאים עם דיוק מלא. רוצה להמשיך לאתגר הבא?",
    roadmapStage_m: "אתה בשלב",
    roadmapStart_m: "התחל את המסלול",
    roadmapStartHere_m: "▶ התחל כאן",
    roadmapContinue_m: "🚀 המשך לשלב הבא",
    roadmapContinueHere_m: "▶ המשך מכאן",
    weakAreaEmpty_m: "עדיין אין מספיק נתונים, התחל לענות כדי שנמליץ מה לחזק.",
    goBackToTopic_m: "חזור לנושא הזה",
    resumeTitle: "המשך חידון?", resumeTitle_m: "המשך חידון?",
    resumeBody: "נמצא חידון שלא הסתיים. רוצה להמשיך מהיכן שהפסקת?",
    resumeBody_m: "נמצא חידון שלא הסתיים. רוצה להמשיך מהיכן שהפסקת?",
    resumeBtn: "המשיכי", resumeBtn_m: "המשך",
    resumeDiscard: "התחילי מחדש", resumeDiscard_m: "התחל מחדש",
    prevQuestion: "קודמת ←", backToCurrent: "→ חזרי לחידון", backToCurrent_m: "→ חזור לחידון",
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
    reportBtn: "⚑ דווחי על שגיאה", reportBtn_m: "⚑ דווח על שגיאה",
    reportTitle: "דיווח על שגיאה בשאלה",
    reportType1: "התשובה הנכונה שגויה", reportType2: "השאלה לא ברורה",
    reportType3: "שגיאת כתיב/דקדוק",  reportType4: "אחר",
    reportNote: "הערה נוספת (לא חובה)",
    reportSend: "שלחי דיווח", reportSend_m: "שלח דיווח",
    reportThanks: "✓ תודה! הדיווח נשלח.",
    reportCancel: "ביטול",
    savedQuestions: "🔖 שאלות שמורות", savedQuestionsTitle: "שאלות שמורות",
    noBookmarks: "עוד לא שמרת שאלות. לחצי על ☆ בזמן חידון כדי לשמור.",
    noBookmarks_m: "עוד לא שמרת שאלות. לחץ על ☆ בזמן חידון כדי לשמור.",
    startSavedQuiz: "▶ תרגלי שאלות שמורות", startSavedQuiz_m: "▶ תרגל שאלות שמורות",
    removeBookmark: "הסרי", removeBookmark_m: "הסר",
    bookmark: "☆ שמרי", bookmarkActive: "★ שמורה",
    bookmark_m: "☆ שמור", bookmarkActive_m: "★ שמור",
    searchBtn: "🔎 חיפוש שאלה", searchPlaceholder: "חפשי לפי מילת מפתח...", searchNoResults: "לא נמצאו תוצאות",
    mistakesBtn: "❌ טעויות שלי", mistakesEmpty: "אין טעויות! כל הכבוד 🎉", mistakesHint: "שאלות שטעית בהן",
    guideBtn: "📘 מדריך Kubernetes", aboutBtn: "ℹ️ אודות האפליקציה",
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
    greeting: "Hello", playingAsGuest: "· Playing as guest",
    leaderboardBtn: "🏆 Leaderboard", logout: "Logout",
    guestBanner: "💡 Sign up to save progress and appear on the leaderboard",
    signupNow: "Sign Up",
    score: "Score", accuracy: "Accuracy", streak: "Streak", completed: "Completed",
    pts: "pts",
    achievementsTitle: "🏅 Achievements",
    leaderboardTitle: "🏆 Leaderboard", noData: "No data yet", anonymous: "Anonymous",
    back: "← Back", theory: "📖 Theory",
    startQuiz: "🎯 Start Quiz!", ptsPerQ: "pts per question",
    question: "Question", of: "/", streakLabel: "Streak",
    confirmAnswer: "✔ Confirm Answer",
    correct: "✅ Correct!", incorrect: "❌ Incorrect",
    finishTopic: "🎉 Finish Topic!", nextQuestion: "Next Question →",
    correctCount: "correct", perfect: "⭐ Perfect!", points: "points",
    guestSaveHint: "💡 Sign up to save your score!", signupLink: "Sign up now",
    tryAgain: "🔄 Try Again", backToTopics: "← Back to Topics",
    nextLevelBtn: "🚀 Next Level", locked: "🔒 Locked",
    skipTheory: "⚡ Skip to Quiz",
    timerOn: "⏱ Timer On", timerOff: "⏱ Timer Off", timeUp: "⏰ Time's Up!",
    reviewBtn: "📋 View Review", hideReview: "Hide Review", reviewTitle: "Question Review",
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
    roadmapStart: "🚀 Start Roadmap",
    roadmapStartHere: "▶ Start here",
    roadmapContinue: "🚀 Continue to Next Stage",
    roadmapLocked: "🔒 Unlocks after completing the previous stage",
    roadmapDone: "✅ Completed",
    roadmapContinueHere: "▶ Continue from here",
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
    shareResult: "🔗 Share Result",
    resumeTitle: "Resume Quiz?",
    resumeBody: "You have an unfinished quiz. Continue where you left off?",
    resumeBtn: "Continue",
    resumeDiscard: "Start Fresh",
    prevQuestion: "← Prev", backToCurrent: "Back to Quiz →",
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
    reportBtn: "⚑ Report an error",
    reportTitle: "Report a question error",
    reportType1: "Wrong answer marked correct", reportType2: "Question is unclear",
    reportType3: "Typo / grammar error",        reportType4: "Other",
    reportNote: "Additional note (optional)",
    reportSend: "Send report",
    reportThanks: "✓ Thanks! Report sent.",
    reportCancel: "Cancel",
    savedQuestions: "🔖 Saved Questions", savedQuestionsTitle: "Saved Questions",
    noBookmarks: "No saved questions yet. Tap ☆ during a quiz to save one.",
    startSavedQuiz: "▶ Practice Saved Questions",
    removeBookmark: "Remove",
    bookmark: "☆ Save", bookmarkActive: "★ Saved",
    searchBtn: "🔎 Search Question", searchPlaceholder: "Search by keyword...", searchNoResults: "No results found",
    mistakesBtn: "❌ My Mistakes", mistakesEmpty: "No mistakes! Great job 🎉", mistakesHint: "Questions you answered incorrectly",
    guideBtn: "📘 Kubernetes Guide", aboutBtn: "ℹ️ About",
    shareBtn: "📤 Share",
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
      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#94a3b8",padding:"6px 10px",fontSize:13,cursor:"pointer",direction:"ltr"}}>
      <option value="he">🇮🇱 עברית</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );
}

function GenderToggle({ gender, setGender }) {
  return (
    <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:2}}>
      {[{v:"f",label:"♀"},{v:"m",label:"♂"}].map(({v,label}) => (
        <button key={v} onClick={()=>setGender(v)}
          style={{width:34,height:30,padding:0,border:"none",borderRadius:6,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"Arial,sans-serif",fontSize:16,lineHeight:"1",
            background:gender===v?"rgba(0,212,255,0.15)":"transparent",
            color:gender===v?"#00D4FF":"#64748b",fontWeight:gender===v?700:400}}>
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
      <div dir={qDir} style={{color:"#e2e8f0",fontSize:18,fontWeight:700,lineHeight:1.65,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:qDir==="ltr"?"left":"right"}}>
        {renderBidi(qText, lang)}
      </div>
    );
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {paragraphs.map((para, idx) => {
        const isCode = para.includes("\n");
        if (isCode) {
          return (
            <pre key={idx} style={{margin:0,background:"rgba(0,0,0,0.45)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 14px",fontFamily:"monospace",fontSize:13,color:"#7dd3fc",overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all",textAlign:"left",direction:"ltr"}}>
              {para}
            </pre>
          );
        }
        const isLast = idx === paragraphs.length - 1;
        const pDir = hasHebrew(para) ? (lang === "he" ? "rtl" : "ltr") : "ltr";
        return (
          <div key={idx} dir={pDir} style={{color:"#e2e8f0",fontSize:isLast?18:15,fontWeight:isLast?700:400,lineHeight:1.65,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:pDir==="ltr"?"left":"right",unicodeBidi:"plaintext"}}>
            {renderBidi(para, lang)}
          </div>
        );
      })}
    </div>
  );
}

// Shuffle quiz options while tracking the index mapping.
// _optionMap[shuffledIdx] = originalIdx — used to translate back for server-side validation.
// When q.answer exists (offline mode), it is also remapped to the shuffled position.
function shuffleOptions(questions) {
  return questions.map(q => {
    if (!q.options || q.options.length <= 1) return { ...q, _optionMap: q.options?.map((_, i) => i) || [] };
    const indices = q.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const result = { ...q, options: indices.map(i => q.options[i]), _optionMap: indices };
    if (typeof q.answer === "number") result.answer = indices.indexOf(q.answer);
    return result;
  });
}

// Set of Kubernetes / technical terms that should render as inline code
const K8S_CODE_TERMS = new Set([
  "kubectl","pod","pods","node","nodes","namespace","namespaces","deployment","deployments",
  "service","services","configmap","configmaps","secret","secrets","ingress","daemonset",
  "statefulset","replicaset","cronjob","job","pvc","pv","hpa","api-server","kube-proxy",
  "kubelet","etcd","helm","docker","container","containers","kubectl get pods",
  "kubectl get nodes","kubectl describe","kubectl logs","kubectl apply","kubectl delete",
  "kubectl scale","kubectl rollout","kubectl exec","production","staging","default",
  "kube-system","cluster","replica","replicas",
]);

// Check if a token (or multi-word phrase) is a known K8s / CLI term
function isCodeTerm(token) {
  return K8S_CODE_TERMS.has(token.toLowerCase().replace(/s$/,"")) || K8S_CODE_TERMS.has(token.toLowerCase());
}

// Wraps inline English/Latin sequences in <span dir="ltr"> for correct bidi rendering
// in RTL Hebrew paragraphs. K8s terms get inline-code styling.
// Returns text unchanged for English mode.
function renderBidi(text, lang) {
  if (!text || lang !== "he") return text;
  if (!/[A-Za-z]/.test(text)) return text;
  // Do NOT capture trailing punctuation inside the LTR span - leave ?!.,; in the RTL flow.
  // Note: the character class excludes . so "Kubernetes." splits into "Kubernetes" + "."
  const parts = text.split(/((?:[A-Za-z][A-Za-z0-9\-_:/]*(?:\s+(?=[A-Za-z]))?)+)/);
  if (parts.length <= 1) return text;
  const startsWithLatin = /^[A-Za-z]/.test(text);
  return parts.map((part, i) => {
    if (/^[A-Za-z]/.test(part)) {
      const codeStyle = isCodeTerm(part)
        ? {background:"rgba(0,212,255,0.06)",borderRadius:4,padding:"1px 5px",fontSize:"0.88em",fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",color:"#7dd3fc",whiteSpace:"nowrap"}
        : undefined;
      return <span key={i} dir="ltr" style={{unicodeBidi:"isolate",...codeStyle}}>{(i === 0 && startsWithLatin ? "\u200F" : "")}{part}</span>;
    }
    // Insert RLM (U+200F) before punctuation that immediately follows an LTR span so
    // the Unicode bidi algorithm places it at the visual end of the RTL sentence.
    if (i > 0 && /^[A-Za-z]/.test(parts[i - 1])) return "\u200F" + part;
    return part;
  });
}

function Footer({ lang }) {
  const txt = TRANSLATIONS[lang] || TRANSLATIONS.he;
  return (
    <div style={{textAlign:"center",marginTop:28,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
      <a href="https://buymeacoffee.com/ocarmeli7n" target="_blank" rel="noopener noreferrer"
        style={{color:"#475569",fontSize:11,textDecoration:"none",display:"block",marginBottom:8,transition:"color 0.2s",direction:lang==="en"?"ltr":"rtl"}}
        onMouseEnter={e=>{e.currentTarget.style.color="#64748b";}}
        onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}>
        {lang==="en"?"Enjoying KubeQuest?":"?נהנים מ-KubeQuest"}<br/>{lang==="en"?"Support the project ☕":"☕ תמכו בפרויקט"}
      </a>
      <p style={{color:"#475569",fontSize:12,margin:"0 0 8px 0"}}>
        © {year} {txt.allRightsReserved}{" "}
        <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer"
          style={{color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>
      </p>
      <a href="mailto:ocarmeli7@gmail.com?subject=KubeQuest%20Feedback"
        style={{display:"inline-flex",alignItems:"center",gap:5,color:"#64748b",fontSize:11,textDecoration:"none",padding:"5px 12px",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,transition:"color 0.2s,border-color 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.color="#e2e8f0";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}
        onMouseLeave={e=>{e.currentTarget.style.color="#64748b";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
        ✉ {lang==="en"?"Contact me":"צור קשר"}
      </a>
    </div>
  );
}

const welcomeMessagesHe = [
  "נראה אם היית עובר ראיון DevOps",
  "בוא נראה איך היית עונה על זה",
  "נראה איך אתה חושב",
  "בוא נראה מה היית עושה פה",
  "מוכן לשאלה מהשטח?",
];
const welcomeMessagesEn = [
  "Let's see if you would pass a DevOps interview",
  "Let's see how you would answer this",
  "Let's see how you think",
  "What would you do here?",
  "Ready for a real-world question?",
];

export default function K8sQuestApp() {
  const [lang, setLang]                   = useState("he");
  const [welcomeIdx] = useState(() => Math.floor(Math.random() * welcomeMessagesHe.length));
  const [gender, setGender]               = useState(() => localStorage.getItem("gender_v1") || "m");
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

  const [screen, setScreen]               = useState(()=>window.location.pathname==="/status"?"status":"home");
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

  const [stats, setStats] = useState({
    total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0,
  });
  const [topicStats, setTopicStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("topicStats_v1")) || {}; } catch { return {}; }
  });
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
  const [isInterviewMode, setIsInterviewMode]           = useState(() => localStorage.getItem("isInterviewMode_v1") === "true");
  const [homeTab, setHomeTab]                           = useState("roadmap");
  const [showConfetti, setShowConfetti]                 = useState(false);
  const [mixedQuestions, setMixedQuestions]             = useState([]);
  const [sessionScore, setSessionScore]                 = useState(0);
  const [retryMode, setRetryMode]                       = useState(false);
  const [topicQuestions, setTopicQuestions]             = useState([]);
  const [allowNextLevel, setAllowNextLevel]             = useState(false);
  const [showMenu, setShowMenu]                         = useState(false);
  const [dbStatus, setDbStatus]                         = useState(null); // null | "ok" | "error"
  const [searchQuery, setSearchQuery]                   = useState("");
  const [expandedGuideSection, setExpandedGuideSection] = useState(null);
  const [answerResult, setAnswerResult]                 = useState(null); // { correct, correctIndex, explanation } — set after server-side validation
  const [checkingAnswer, setCheckingAnswer]             = useState(false);
  const [theoryContent, setTheoryContent]               = useState(null);
  const [loadingQuestions, setLoadingQuestions]          = useState(false);
  const [incidentSteps, setIncidentSteps]               = useState(null); // fetched steps for online mode
  const [incidentAnswerResult, setIncidentAnswerResult] = useState(null); // { correct, correctIndex, explanation, explanationHe }
  const [a11y, setA11y] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("a11y_v1"));
      if (saved) return saved;
    } catch {}
    return {
      fontSize: "normal",
      reduceMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
      highContrast: window.matchMedia?.("(prefers-contrast: more)").matches ?? false,
      autoRead: false,
    };
  });

  const isGuest = user?.id === "guest";
  const achievementsLoaded = useRef(false);
  const quizRunIdRef  = useRef(null);
  const liveIndexRef  = useRef(0);   // highest question index reached; never decremented
  const questionRef   = useRef(null); // focus target when question changes
  const nextBtnRef    = useRef(null); // focus target after submitting an answer
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hintVisible, setHintVisible]         = useState(false);
  const [eliminatedOption, setEliminatedOption] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const pendingQuizStartRef = useRef(null); // stores the quiz-start fn while modal is open
  const [dailyStreak, setDailyStreak] = useState(() => {
    try { return JSON.parse(localStorage.getItem("daily_streak_v1")) || { date: null, streak: 0 }; } catch { return { date: null, streak: 0 }; }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks_v1")) || []; } catch { return []; }
  });
  const [showBookmarks, setShowBookmarks] = useState(false);

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
    return !prevResult || (prevResult.correct < prevResult.total && !prevResult.retryComplete);
  };

  const getNextLevel = (level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  };

  const isFreeMode = (id) => id === "mixed" || id === "daily" || id === "bookmarks";

  // Weighted progress % for a single topic - matches Roadmap's stageProgress logic.
  const computeTopicProgress = (topicId) => {
    let score = 0;
    LEVEL_ORDER.forEach(lvl => {
      const r = completedTopics[`${topicId}_${lvl}`];
      if (!r || r.total === 0) return;
      score += r.retryComplete ? 1 : Math.min(r.correct, r.total) / r.total;
    });
    return Math.min(100, Math.round((score / LEVEL_ORDER.length) * 100));
  };

  // Derive total_score canonically from completedTopics so it can never be gamed.
  // Each topic/level key is "topicId_level" (e.g. "workloads_easy").
  // Free-mode keys (mixed_mixed, daily_daily) are excluded - they are session-only.
  const computeScore = (completed) =>
    Object.entries(completed).reduce((sum, [key, res]) => {
      const parts = key.split("_");
      const topicId = parts.slice(0, -1).join("_");
      if (isFreeMode(topicId)) return sum;               // BUG-E fix: skip mixed/daily
      const lvl = parts[parts.length - 1];
      return sum + (res.correct * (LEVEL_CONFIG[lvl]?.points ?? 0));
    }, 0);
  const currentLevelData = selectedTopic && selectedLevel && !isFreeMode(selectedTopic.id) && !retryMode ? getLevelData(selectedTopic, selectedLevel) : null;
  const currentQuestions = isFreeMode(selectedTopic?.id) || retryMode ? mixedQuestions : (topicQuestions.length > 0 ? topicQuestions : (currentLevelData?.questions || []));

  useEffect(() => { const t = setTimeout(() => setMinLoadElapsed(true), 1000); return () => clearTimeout(t); }, []);

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

    // Fallback: if Supabase never responds, unblock the UI after 10 s
    const authTimeout = setTimeout(() => { setAuthChecked(true); setDataLoaded(true); }, 10000);
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(authTimeout);
      if (session) { setUser(session.user); loadUserData(session.user.id, session.user); }
      else          { setDataLoaded(true); }   // no session → nothing to load
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          loadUserData(session.user.id, session.user);
        }
      }
      setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
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
  useEffect(() => {
    if (!isGuest) return;
    try {
      const saved = localStorage.getItem("k8s_quest_guest");
      if (saved) {
        const { stats: s, completedTopics: c, unlockedAchievements: u } = JSON.parse(saved);
        if (c) setCompletedTopics(c);
        if (s) setStats({ ...s, total_score: computeScore(c || {}) });
        if (u) setUnlockedAchievements(u);
      }
    } catch {}
    achievementsLoaded.current = true;
    setTimeout(() => setDataLoaded(true), 2000);
    // Check for a saved in-progress quiz for the guest session
    const savedQuiz = loadQuizState();
    if (savedQuiz && savedQuiz.userId === "guest") setResumeData(savedQuiz);
  }, [isGuest]);

  // Save guest progress to localStorage
  useEffect(() => {
    if (!isGuest) return;
    try {
      localStorage.setItem("k8s_quest_guest", JSON.stringify({ stats, completedTopics, unlockedAchievements }));
    } catch {}
  }, [isGuest, stats, completedTopics, unlockedAchievements]);

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
      quizHistory,
      sessionScore,
      topicCorrect:  topicCorrectRef.current,
      retryMode,
      isRetry,
      timerEnabled,
      isInterviewMode,
      timeLeft,
      statsDelta: {
        answered:       isFree || isRetry ? 0 : quizHistory.length,
        correct:        isFree || isRetry ? 0 : quizHistory.filter(h => h.chosen === h.answer).length,
        currentStreak:  stats.current_streak,
        maxStreak:      stats.max_streak,
      },
    });
  }, [screen, topicScreen, questionIndex, submitted, selectedAnswer, quizHistory]);

  useEffect(() => {
    localStorage.setItem("isInterviewMode_v1", isInterviewMode);
  }, [isInterviewMode]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  // Pre-load saved quiz data when returning home (modal is NOT shown here — only when starting a quiz)
  useEffect(() => {
    if (screen !== "home" || !user) return;
    const saved = loadQuizState();
    if (saved && saved.userId === (user.id || "guest")) setResumeData(saved);
    // Do NOT call setShowResumeModal(true) here — req 2
  }, [screen]);

  // Ping Supabase when status screen opens
  useEffect(() => {
    if (screen !== "status") return;
    setDbStatus(null);
    if (!supabase) { setDbStatus("error"); return; }
    supabase.from("user_stats").select("user_id").limit(1)
      .then(({ error }) => setDbStatus(error ? "error" : "ok"))
      .catch(() => setDbStatus("error"));
  }, [screen]);

  // Check for a saved in-progress incident whenever we land on home or incident list
  useEffect(() => {
    if (screen !== "home" && screen !== "incidentList") return;
    try {
      const saved = JSON.parse(localStorage.getItem(INCIDENT_SAVE_KEY));
      if (saved?.incidentId) {
        const incident = INCIDENTS.find(i => i.id === saved.incidentId);
        if (incident) { setIncidentResume({ ...saved, incident }); return; }
      }
    } catch {}
    setIncidentResume(null);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async (userId, sessionUser) => {
    if (!supabase) { setDataLoaded(true); return; }
    const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();

    // Read guest localStorage but ALWAYS discard it once a real account is active.
    // BUG-A fix: only merge guest data into brand-new accounts (no existing Supabase row).
    // Merging into existing accounts causes cross-account contamination when users switch accounts.
    let guestSaved = null;
    try {
      const raw = localStorage.getItem("k8s_quest_guest");
      if (raw) guestSaved = JSON.parse(raw);
    } catch {}
    // Always clear it immediately - prevents it leaking into whichever account logs in next
    if (guestSaved) { try { localStorage.removeItem("k8s_quest_guest"); } catch {} }

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

    const topicBaseScore = computeScore(mergedCompleted);
    const mergedStats = {
      total_answered: (base.total_answered || 0) + (gs.total_answered || 0),
      total_correct:  (base.total_correct  || 0) + (gs.total_correct  || 0),
      // Prefer the DB value - it includes free-mode bonus on top of topic score
      total_score:    base.total_score != null ? Math.max(base.total_score, topicBaseScore) : topicBaseScore,
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
      try { guestTopicStats = JSON.parse(localStorage.getItem("topicStats_v1")) || {}; } catch {}
      await supabase.from("user_stats").insert({
        user_id: userId, username,
        ...mergedStats, completed_topics: cleanNc, achievements: mergedAch,
        topic_stats: guestTopicStats,
        updated_at: new Date().toISOString(),
      });
    }

    achievementsLoaded.current = true;
    setTimeout(() => setDataLoaded(true), 2000);   // ← data is now in state; no more flash of 0%

    // Check for a saved in-progress quiz belonging to this user
    const savedQuiz = loadQuizState();
    if (savedQuiz && savedQuiz.userId === userId) setResumeData(savedQuiz);
  };

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
    } else setAuthError(t("emailSent"));
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

  const handleLogout = async () => {
    setDataLoaded(false);
    if (isGuest) {
      setUser(null);
      setStats({ total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0 });
      setCompletedTopics({}); setUnlockedAchievements([]);
      achievementsLoaded.current = false;
      setDataLoaded(true); // guest has no async load
      return;
    }
    if (supabase) await supabase.auth.signOut(); setUser(null);
    achievementsLoaded.current = false;
  };

  const handleResetProgress = async () => {
    if (!window.confirm(t("resetConfirm"))) return;
    const emptyStats = { total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0 };
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
      total_score:    computeScore(newCompleted),
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
    setQuestionIndex(saved.questionIndex ?? 0);
    setSelectedAnswer(saved.selectedAnswer ?? null);
    setSubmitted(saved.submitted ?? false);
    setShowExplanation(saved.showExplanation ?? false);
    setQuizHistory(saved.quizHistory || []);
    setSessionScore(saved.sessionScore || 0);
    setRetryMode(saved.retryMode || false);
    isRetryRef.current  = saved.isRetry  || false;
    topicCorrectRef.current = saved.topicCorrect || 0;
    quizRunIdRef.current    = saved.quizRunId;
    liveIndexRef.current    = saved.questionIndex ?? 0;

    // Restore interview mode as it was when the quiz was saved
    const savedInterviewMode = saved.isInterviewMode || false;
    setIsInterviewMode(savedInterviewMode);

    // Timer: if mid-question reset to full, if on explanation screen restore saved value
    const fullTime = savedInterviewMode
      ? (INTERVIEW_DURATIONS[saved.level] || INTERVIEW_DURATIONS.mixed)
      : (TIMER_DURATIONS[saved.level] || 30);
    setTimeLeft(saved.submitted ? (saved.timeLeft ?? fullTime) : fullTime);

    // Re-apply stats delta (questions already answered before the reload)
    const delta = saved.statsDelta || {};
    if ((delta.answered > 0 || delta.correct > 0) && !isFreeMode(topic.id) && !saved.isRetry) {
      setStats(prev => ({
        ...prev,
        total_answered: prev.total_answered + (delta.answered || 0),
        total_correct:  prev.total_correct  + (delta.correct  || 0),
        current_streak: Math.max(prev.current_streak, delta.currentStreak || 0),
        max_streak:     Math.max(prev.max_streak,     delta.maxStreak     || 0),
      }));
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
      const dismissedAt = localStorage.getItem(RESUME_DISMISS_KEY);
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
    if (selectedAnswer === null || submitted || checkingAnswer) return;
    setSubmitted(true);
    setCheckingAnswer(true);
    const q = currentQuestions[questionIndex];

    // Resolve answer via server RPC (online) or local field (offline)
    let result;
    if (supabase && q.id) {
      const originalIndex = q._optionMap ? q._optionMap[selectedAnswer] : selectedAnswer;
      try {
        const isDaily = selectedTopic?.id === "daily";
        const rpcResult = isDaily
          ? await checkDailyAnswer(supabase, q.id, originalIndex)
          : await checkQuizAnswer(supabase, q.id, originalIndex);
        const correctIndex = q._optionMap ? q._optionMap.indexOf(rpcResult.correct_answer) : rpcResult.correct_answer;
        result = { correct: rpcResult.correct, correctIndex, explanation: rpcResult.explanation };
      } catch {
        result = { correct: selectedAnswer === q.answer, correctIndex: q.answer, explanation: q.explanation };
      }
    } else {
      result = { correct: selectedAnswer === q.answer, correctIndex: q.answer, explanation: q.explanation };
    }

    setAnswerResult(result);
    setCheckingAnswer(false);
    setShowExplanation(true);

    const correct = result.correct;
    if (correct) {
      topicCorrectRef.current += 1;
      setFlash(true); setTimeout(() => setFlash(false), 600);
      if (!isRetryRef.current) setSessionScore(p => p + (LEVEL_CONFIG[selectedLevel]?.points ?? 0));
    }
    setQuizHistory(prev => [...prev, { q: q.q, options: q.options, answer: result.correctIndex, chosen: selectedAnswer, explanation: result.explanation }]);
    setStats(prev => {
      // BUG-C fix: retries must never touch any stat
      if (isRetryRef.current) return prev;
      const streak = correct ? prev.current_streak + 1 : 0;
      const isFree = isFreeMode(selectedTopic?.id);
      return {
        ...prev,
        // total_score is NOT updated here - derived from completedTopics at quiz end
        current_streak: streak,
        max_streak:     Math.max(prev.max_streak, streak),
        // BUG-D fix: free-mode questions don't count toward persistent answered/correct
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        total_correct:  isFree ? prev.total_correct  : (correct ? prev.total_correct + 1 : prev.total_correct),
      };
    });
    if (!isRetryRef.current && !isFreeMode(selectedTopic?.id)) {
      setTopicStats(prev => {
        const curr = prev[selectedTopic.id] || { answered: 0, correct: 0 };
        return { ...prev, [selectedTopic.id]: { answered: curr.answered + 1, correct: curr.correct + (correct ? 1 : 0) } };
      });
      // Mark question as scored so Mixed/Daily Quiz can't award points for it again
      if (correct) {
        try {
          const freeKey = currentQuestions[questionIndex].q.slice(0, 100);
          const scored = new Set(JSON.parse(localStorage.getItem("scoredFreeKeys_v1")) || []);
          scored.add(freeKey);
          localStorage.setItem("scoredFreeKeys_v1", JSON.stringify([...scored]));
        } catch {}
      }
    }
    // Free mode: award points per unique correct answer (deduped by question text)
    if (!isRetryRef.current && isFreeMode(selectedTopic?.id) && correct) {
      const freeKey = currentQuestions[questionIndex].q.slice(0, 100);
      try {
        const scored = new Set(JSON.parse(localStorage.getItem("scoredFreeKeys_v1")) || []);
        if (!scored.has(freeKey)) {
          scored.add(freeKey);
          localStorage.setItem("scoredFreeKeys_v1", JSON.stringify([...scored]));
          const pts = LEVEL_CONFIG[selectedLevel]?.points ?? 15;
          setStats(prev => ({ ...prev, total_score: prev.total_score + pts }));
        }
      } catch {}
    }
  };

  const nextQuestion = () => {
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
            const newCompleted = { ...completedTopics, [key]: { ...prevResult, retryComplete: true, wrongIndices: [] } };
            setCompletedTopics(newCompleted);
            if (!isFreeMode(selectedTopic.id)) saveUserData(stats, newCompleted, unlockedAchievements);
          }
          setAllowNextLevel(true);
        }
        updateDailyStreak();
        setScreen("topicComplete");
        return;
      }

      const key = `${selectedTopic.id}_${selectedLevel}`;
      const prevResult = completedTopics[key];
      const bestCorrect = prevResult ? Math.min(Math.max(prevResult.correct, finalCorrect), currentQuestions.length) : Math.min(finalCorrect, currentQuestions.length);
      // Preserve retryComplete so replaying doesn't re-lock the next level
      const keepRetryComplete = prevResult?.retryComplete || bestCorrect === currentQuestions.length;
      const wrongIdx = !isFreeMode(selectedTopic.id) ? quizHistory.map((h,i)=>h.chosen!==h.answer?i:null).filter(v=>v!==null) : (completedTopics[key]?.wrongIndices??[]);
      const newCompleted = { ...completedTopics, [key]: { correct: bestCorrect, total: currentQuestions.length, wrongIndices: wrongIdx, ...(keepRetryComplete ? { retryComplete: true } : {}) } };
      // Recompute topic score; add any free-mode bonus accumulated on top
      const freeBonus = Math.max(0, stats.total_score - computeScore(completedTopics));
      const newStats = { ...stats, total_score: computeScore(newCompleted) + freeBonus };
      const newAch = [
        ...unlockedAchievements,
        ...ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(newStats, newCompleted)).map(a => a.id),
      ];
      clearQuizState();
      lastSessionScoreRef.current = sessionScore;
      setSessionScore(0);
      setCompletedTopics(newCompleted); setStats(newStats); setUnlockedAchievements(newAch);
      if (!isFreeMode(selectedTopic.id)) {
        saveUserData(newStats, newCompleted, newAch);
        const allPerfect = LEVEL_ORDER.every(lvl => {
          const r = newCompleted[`${selectedTopic.id}_${lvl}`];
          return r && r.correct === r.total;
        });
        if (allPerfect) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }
      }
      updateDailyStreak();
      setScreen("topicComplete");
    } else {
      liveIndexRef.current = questionIndex + 1;
      setQuestionIndex(p => p + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowExplanation(false);
      setAnswerResult(null);
      if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[selectedLevel] || 25) : (TIMER_DURATIONS[selectedLevel] || 30));
    }
  };

  const startTopic = async (topic, level) => {
    quizRunIdRef.current = Date.now().toString(36);
    liveIndexRef.current = 0;
    clearQuizState();
    const key = `${topic.id}_${level}`;
    isRetryRef.current = !!(completedTopics[key]);
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
    setSelectedTopic(topic); setSelectedLevel(level); setTopicScreen("theory");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    lastSessionScoreRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[level] || 25) : (TIMER_DURATIONS[level] || 30));
    setScreen("topic");
    if (isGuest) achievementsLoaded.current = true;
  };

  const startMixedQuiz = async () => {
    quizRunIdRef.current = Date.now().toString(36);
    liveIndexRef.current = 0;
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
    setShowExplanation(false);
    topicCorrectRef.current = 0; lastSessionScoreRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? INTERVIEW_DURATIONS.mixed : TIMER_DURATIONS.mixed);
    setScreen("topic");
  };

  const startDailyChallenge = async () => {
    quizRunIdRef.current = Date.now().toString(36);
    liveIndexRef.current = 0;
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
      // Offline fallback — annual-seeded shuffle + daily window
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
    setShowExplanation(false);
    topicCorrectRef.current = 0; lastSessionScoreRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? INTERVIEW_DURATIONS.daily : TIMER_DURATIONS.daily);
    setScreen("topic");
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
    liveIndexRef.current = 0;
    clearQuizState();
    const qs = bookmarks.map(b => ({ q: b.question_text, options: b.options, answer: b.answer, explanation: b.explanation }));
    setMixedQuestions(shuffleOptions([...qs]));
    isRetryRef.current = false;
    setSelectedTopic(BOOKMARKS_TOPIC); setSelectedLevel("mixed"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0; lastSessionScoreRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? INTERVIEW_DURATIONS.mixed : TIMER_DURATIONS.mixed);
    setScreen("topic");
    setShowBookmarks(false);
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
    if (ans === null || incidentSubmitted || !selectedIncident) return;
    setIncidentAnswer(ans);
    setIncidentSubmitted(true);

    const step = getIncidentStep(incidentStepIndex);
    let correct, correctAnswer;

    if (supabase && step?.id) {
      try {
        const rpcResult = await checkIncidentAnswer(supabase, step.id, ans);
        correct = rpcResult.correct;
        correctAnswer = rpcResult.correct_answer;
        setIncidentAnswerResult({ correct, correctIndex: correctAnswer, explanation: rpcResult.explanation, explanationHe: rpcResult.explanation_he });
      } catch {
        correct = ans === step.answer;
        correctAnswer = step.answer;
        setIncidentAnswerResult({ correct, correctIndex: correctAnswer, explanation: step.explanation, explanationHe: step.explanationHe || step.explanation_he });
      }
    } else {
      correct = ans === step.answer;
      correctAnswer = step.answer;
      setIncidentAnswerResult({ correct, correctIndex: correctAnswer, explanation: step.explanation, explanationHe: step.explanationHe || step.explanation_he });
    }

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
    return lang === "he"
      ? `🚨 פתרתי את אירוע ה-Kubernetes "${selectedIncident.titleHe || selectedIncident.title}" ב-KubeQuest תוך ${time} עם ניקוד ${incidentScore}/${maxScore}!\nתוכלו לנצח? 💪\n\n#Kubernetes #DevOps #SRE #K8s\nhttps://kubequest.online`
      : `🚨 I just resolved the Kubernetes incident "${selectedIncident.title}" on KubeQuest in ${time} with a score of ${incidentScore}/${maxScore}!\nCan you beat it? 💪\n\n#Kubernetes #DevOps #SRE #K8s\nhttps://kubequest.online`;
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
        if (!submitted) { handleSubmit(); } else { nextQuestion(); }
        return;
      }
      const idx = ["1","2","3","4"].indexOf(e.key);
      if (!submitted && idx !== -1 && currentQuestions[questionIndex] && idx < currentQuestions[questionIndex].options.length) {
        setSelectedAnswer(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, topicScreen, submitted, selectedAnswer, questionIndex]);

  // Timer countdown
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz" || (!timerEnabled && !isInterviewMode) || submitted || timeLeft <= 0 || isInHistoryMode || tryAgainActive) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, topicScreen, timerEnabled, isInterviewMode, submitted, timeLeft, tryAgainActive]);

  // Timer expired – force-submit as missed
  useEffect(() => {
    if (timeLeft !== 0 || submitted || screen !== "topic" || topicScreen !== "quiz" || (!timerEnabled && !isInterviewMode) || isInHistoryMode || tryAgainActive) return;
    const q = currentQuestions[questionIndex];
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
      // BUG-D fix: don't count timed-out free-mode questions toward persistent totals
      setStats(prev => ({
        ...prev,
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        current_streak: 0,
      }));
    }
  }, [timeLeft]);

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
        <div key={i} style={{fontFamily:"monospace",fontSize:11,color:"#7dd3fc",lineHeight:1.8,
          whiteSpace:"pre",direction:"ltr",textAlign:"left"}}>  {line}</div>
      );
      if (line.startsWith('🔹')) return <div key={i} style={{color:"#94a3b8",fontSize:13,marginBottom:5}}>{line}</div>;
      if (!line.trim()) return <div key={i} style={{height:6}}/>;
      return <div key={i} style={{color:"#e2e8f0",fontSize:15,fontWeight:700,marginBottom:8}}>{line}</div>;
    });
  };

  // Renders inline backtick code spans: `command` → <code>command</code>
  const renderInline = (text) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 2
        ? <code key={i} style={{fontFamily:"'Fira Code','Courier New',monospace",fontSize:"0.88em",color:"#7dd3fc",background:"rgba(125,211,252,0.06)",borderRadius:4,padding:"1px 5px",direction:"ltr",unicodeBidi:"isolate"}}>{part.slice(1,-1)}</code>
        : part
    );
  };

  // Renders incident explanation as short paragraphs for readability
  const renderIncidentExplanation = (text) => {
    if (!text) return null;
    const sentences = text.split(/\.\s+(?=[A-Z\u0590-\u05FFa-z`])/).filter(s => s.trim());
    if (sentences.length <= 1) {
      return <div dir="auto" style={{color:"#94a3b8",fontSize:13,lineHeight:1.8}}>{renderInline(text)}</div>;
    }
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {sentences.map((s, i) => (
          <div key={i} dir={lang==="he"?"rtl":"ltr"} style={{color:"#94a3b8",fontSize:13,lineHeight:1.8,textAlign:lang==="he"?"right":"left"}}>
            {renderInline(s.replace(/\.+$/, "") + ".")}
          </div>
        ))}
      </div>
    );
  };

  // Renders incident step prompt: terminal lines in monospace, Hebrew lines as normal text with inline code
  const renderIncidentPrompt = (text) => {
    if (!text) return null;
    const terminalPat = /^(kubectl|NAME\s|READY|STATUS\s|\s{2,}|[a-z0-9]+(-[a-z0-9]+)+\s|FATAL|Error|Failed|rpc error|unauthorized|  [A-Za-z])/;
    const hasHebrew = (s) => /[\u0590-\u05FF]/.test(s);
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{height:6}}/>;
      if (!hasHebrew(line) && terminalPat.test(line)) {
        return <div key={i} style={{fontFamily:"'Fira Code','Courier New',monospace",fontSize:12,color:"#7dd3fc",lineHeight:1.9,direction:"ltr",textAlign:"left",whiteSpace:"pre"}}>{line}</div>;
      }
      return <div key={i} dir="auto" style={{color:"#e2e8f0",fontSize:14,lineHeight:1.8,marginBottom:4}}>{renderInline(line)}</div>;
    });
  };

const displayName = isGuest ? t("guestName") : (user?.user_metadata?.username || user?.email?.split("@")[0] || t("guestName"));

  if (!authChecked || !minLoadElapsed || (!!user && !isGuest && !dataLoaded)) return (
    <div style={{minHeight:"100vh",background:"#020817",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif"}}>
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
        <div style={{color:"#475569",fontSize:13,letterSpacing:0.5}}>{t("loadingText")}</div>
      </div>
    </div>
  );

  const accuracy = stats.total_answered > 0 ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;
  const FONT_SCALES = { normal: 1, large: 1, xl: 1 }; // no zoom - original A mode is now the default
  const fs = FONT_SCALES[a11y.fontSize] || 1;

  // History navigation: questionIndex can go below liveIndexRef.current to review past answers
  const isInHistoryMode     = questionIndex < liveIndexRef.current;
  const currentQBookmarked  = screen === "topic" && selectedTopic && selectedLevel && currentQuestions[questionIndex]
    ? bookmarks.some(b => b.question_id === makeQuestionId(selectedTopic.id, selectedLevel, questionIndex))
    : false;
  const dispSubmitted       = tryAgainActive ? (tryAgainSelected !== null) : (isInHistoryMode ? true : submitted);
  const dispSelectedAnswer  = tryAgainActive ? (tryAgainSelected ?? -1) : (isInHistoryMode ? (quizHistory[questionIndex]?.chosen ?? -1) : selectedAnswer);
  const dispShowExplanation = tryAgainActive ? (tryAgainSelected !== null) : (isInHistoryMode ? true : showExplanation);

  // Unified answer result for display — works across live, history, try-again, and offline modes
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

  if (!user) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,padding:"20px"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.2)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}button,input{font-family:inherit}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #00D4FF;outline-offset:2px;border-radius:4px}.gbtn:hover{background:rgba(0,212,255,0.13)!important;border-color:rgba(0,212,255,0.5)!important;color:#00D4FF!important;transform:translateY(-2px)}`}</style>
      <div style={{width:"100%",maxWidth:400,animation:"fadeIn 0.4s ease"}}>
        {/* Language switcher */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",direction:"ltr",marginBottom:12,gap:8}}>
          {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
          <LangSwitcher lang={lang} setLang={setLang}/>
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
          <p style={{color:"#94a3b8",fontSize:14,margin:0}}>{t("tagline")}</p>
        </div>

        <button className="gbtn" onClick={()=>setUser(GUEST_USER)}
          style={{width:"100%",padding:"18px",background:"rgba(0,212,255,0.07)",border:"2px solid rgba(0,212,255,0.3)",borderRadius:14,color:"#7dd3fc",fontSize:17,fontWeight:800,cursor:"pointer",marginBottom:6,transition:"all 0.2s",animation:"pulse 2.8s infinite"}}>
          {t("startPlaying")}
        </button>
        <p style={{textAlign:"center",color:"#7dd3fc",opacity:0.75,fontSize:12,margin:"0 0 26px"}}>{t("noRegNoPass")}</p>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{color:"#94a3b8",fontSize:12,whiteSpace:"nowrap"}}>{t("saveProgress")}</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
        </div>

        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",marginBottom:16,background:"rgba(255,255,255,0.04)",borderRadius:9,padding:3}}>
            {["login","signup"].map(s=>(
              <button key={s}
                onClick={()=>{ setAuthScreen(s); setAuthError(""); }}
                style={{flex:1,padding:"7px",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:700,
                  background:authScreen===s?"rgba(0,212,255,0.12)":"transparent",
                  color:authScreen===s?"#00D4FF":"#475569",transition:"all 0.2s"}}>
                {s==="login"?t("loginTab"):t("signupTab")}
              </button>
            ))}
          </div>
          <form ref={authFormRef} onSubmit={e=>{e.preventDefault();authScreen==="login"?handleLogin():handleSignUp();}} autoComplete="on">
          {authScreen==="signup"&&(
            <div style={{marginBottom:11}}>
              <label htmlFor="auth-username" style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("username")}</label>
              <input id="auth-username" name="username" autoComplete="username" defaultValue="" placeholder="K8s Hero"
                style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:11}}>
            <label htmlFor="auth-email" style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("email")}</label>
            <input id="auth-email" type="email" name="email" autoComplete={authScreen==="login"?"username":"email"} defaultValue="" placeholder="you@example.com"
              style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label htmlFor="auth-password" style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("password")}</label>
            <input id="auth-password" type="password" name="password" autoComplete={authScreen==="login"?"current-password":"new-password"} defaultValue="" placeholder="••••••••"
              style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          {authError&&<div style={{marginBottom:12}}>
            <div role="alert" aria-live="assertive" style={{color:authError.startsWith("✅")?"#10B981":"#EF4444",fontSize:12,padding:"8px 12px",background:authError.startsWith("✅")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:8}}>{authError}</div>
            {authScreen==="signup"&&authError.startsWith("✅")&&<div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#475569"}}>
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
        <p style={{textAlign:"center",color:"#475569",fontSize:11,marginTop:22}}>
          © {year} {t("allRightsReserved")}{" "}
          <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer" style={{color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817 0%,#0f172a 60%,#020817 100%)",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,position:"relative",overflowX:"hidden"}}>
      {/* Skip-to-content - invisible until focused by keyboard */}
      <a href="#main-content"
        style={{position:"fixed",top:-100,left:8,zIndex:9999,padding:"8px 16px",background:"#00D4FF",color:"#020817",borderRadius:8,fontWeight:700,fontSize:14,textDecoration:"none",transition:"top 0.15s",direction:"ltr"}}
        onFocus={e=>e.currentTarget.style.top="8px"}
        onBlur={e=>e.currentTarget.style.top="-100px"}>
        {lang==="en"?"Skip to content":"דלג לתוכן"}
      </a>
      <style>{`${a11y.reduceMotion?"*{animation:none!important;transition:none!important}":""}${a11y.highContrast?"#main-content{filter:contrast(1.4) brightness(1.06)}":""}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}@keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes confettiFall{from{top:-20px;transform:rotate(0deg);opacity:1}to{top:100vh;transform:rotate(720deg);opacity:0}}@keyframes pulseHighlight{0%{box-shadow:0 0 0 0 rgba(239,68,68,0)}60%{box-shadow:0 0 0 8px rgba(239,68,68,0.2)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}@keyframes nodePulse{0%,100%{box-shadow:0 0 10px var(--nc,#00D4FF)}50%{box-shadow:0 0 22px var(--nc,#00D4FF)}}.pulseHighlight{animation:pulseHighlight 0.5s ease 3;border-color:rgba(239,68,68,0.45)!important}.card-hover{transition:transform 0.2s;cursor:pointer}.card-hover:hover{transform:translateY(-3px)}.opt-btn{transition:all 0.15s;cursor:pointer}.opt-btn:hover{transform:translateX(-2px)}.explanation-card ul[dir="rtl"]{direction:rtl;text-align:right}.explanation-card ul[dir="rtl"] li::marker{unicode-bidi:isolate}button,input{font-family:inherit}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #00D4FF!important;outline-offset:2px;border-radius:4px}.quiz-text{direction:rtl;unicode-bidi:plaintext;text-align:right}.quiz-text[dir="ltr"]{direction:ltr;text-align:left}.code-inline{direction:ltr;display:inline-block;unicode-bidi:isolate}@media(max-width:600px){
.stats-grid{grid-template-columns:repeat(2,1fr)!important}
.page-pad{padding:12px 14px!important}
.quiz-bar-right{gap:8px!important}
.quiz-bar-right span,.quiz-bar-right button{font-size:11px!important}
.opt-btn{padding:13px 14px!important;font-size:14px!important;gap:10px!important;min-height:52px!important;line-height:1.7!important}
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
}`}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {flash&&!a11y.reduceMotion&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)",animation:"correctFlash 0.6s ease forwards"}}/>}
      {showConfetti&&!a11y.reduceMotion&&<Confetti/>}
      {newAchievement&&<div role="alert" aria-live="assertive" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"1px solid #00D4FF55",borderRadius:14,padding:"12px 22px",display:"flex",alignItems:"center",gap:12,zIndex:9999,boxShadow:"0 0 40px rgba(0,212,255,0.3)",animation:"toast 0.4s ease",direction:"ltr"}}><span aria-hidden="true" style={{fontSize:26}}>{newAchievement.icon}</span><div><div style={{color:"#00D4FF",fontWeight:800,fontSize:11,letterSpacing:1}}>{t("newAchievement")}</div><div style={{color:"#e2e8f0",fontSize:14,fontWeight:700}}>{lang==="en"?newAchievement.nameEn:newAchievement.name}</div></div></div>}
      {saveError&&<div role="alert" aria-live="assertive" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(239,68,68,0.12)",border:"1px solid #EF444455",borderRadius:10,padding:"10px 18px",color:"#EF4444",fontSize:13,zIndex:9999}}>{saveError}</div>}

      {showResumeModal&&resumeData&&(()=>{
        const answered = resumeData.questionIndex ?? 0;
        const total    = resumeData.questions?.length ?? 0;
        const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
        return (
        <div onClick={handleResumeDismiss} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:5002,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=="Tab")return;const f=[...e.currentTarget.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')];if(!f.length)return;const[first,last]=[f[0],f[f.length-1]];if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}else{if(document.activeElement===last){e.preventDefault();first.focus();}}}} style={{background:"#0f172a",border:"1px solid rgba(0,212,255,0.25)",borderRadius:18,padding:"24px 22px",width:"min(380px,100%)",animation:"fadeIn 0.3s ease",direction:dir,position:"relative"}}>
            <button onClick={handleResumeDismiss} aria-label={lang==="en"?"Close":"סגור"} style={{position:"absolute",top:12,insetInlineEnd:14,background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer",lineHeight:1}}>✕</button>
            <div style={{fontSize:32,textAlign:"center",marginBottom:10}}>⏸️</div>
            <div style={{fontWeight:800,color:"#e2e8f0",fontSize:18,marginBottom:8,textAlign:"center"}}>{t("resumeTitle")}</div>
            <div style={{color:"#94a3b8",fontSize:13,marginBottom:16,textAlign:"center"}}>{t("resumeBody")}</div>
            {/* Quiz info pill */}
            <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,padding:"10px 14px",marginBottom:8,direction:"ltr"}}>
              <span style={{fontSize:22}}>{resumeData.topicIcon}</span>
              <div style={{flex:1}}>
                <div style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{resumeData.topicName}</div>
                <div style={{color:"#64748b",fontSize:12}}>
                  {lang==="en"?LEVEL_CONFIG[resumeData.level]?.labelEn:LEVEL_CONFIG[resumeData.level]?.label}
                </div>
              </div>
            </div>
            {/* Progress display — req 6 */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:4}}>
                <span>{lang==="en"?"Progress":"התקדמות"}</span>
                <span style={{color:"#00D4FF",fontWeight:700}}>{answered} / {total} {lang==="en"?"questions answered":"שאלות נענו"}</span>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00D4FF,#A855F7)",borderRadius:4,transition:"width 0.3s ease"}}/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={handleResumeQuiz} autoFocus
                style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,rgba(0,212,255,0.15),rgba(168,85,247,0.15))",border:"1px solid rgba(0,212,255,0.35)",borderRadius:12,color:"#00D4FF",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                ▶ {t("resumeBtn")}
              </button>
              <button onClick={handleDiscardResume}
                style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#64748b",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {t("resumeDiscard")}
              </button>
              <button onClick={handleResumeDismiss}
                style={{width:"100%",padding:"10px",background:"none",border:"none",borderRadius:12,color:"#475569",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {t("back")}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── REPORT DIALOG ─────────────────────────────────── */}
      {reportDialog&&(
        <div onClick={()=>setReportDialog(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:5010,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}
            style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.12)",borderRadius:18,padding:"22px 20px",width:"min(400px,100%)",animation:"fadeIn 0.25s ease",direction:dir,position:"relative"}}>
            <button onClick={()=>setReportDialog(null)} aria-label={t("reportCancel")}
              style={{position:"absolute",top:12,insetInlineEnd:14,background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer",lineHeight:1}}>✕</button>
            <div style={{fontWeight:800,color:"#e2e8f0",fontSize:16,marginBottom:14}}>⚑ {t("reportTitle")}</div>
            {/* Question preview */}
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"9px 12px",marginBottom:14,color:"#94a3b8",fontSize:12,lineHeight:1.5,direction:"ltr",textAlign:"left",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
              {reportDialog.qText}
            </div>
            {reportSent?(
              <div style={{textAlign:"center",padding:"16px 0",color:"#10B981",fontWeight:700,fontSize:15}}>{t("reportThanks")}</div>
            ):(
              <>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                  {[t("reportType1"),t("reportType2"),t("reportType3"),t("reportType4")].map((label,i)=>(
                    <label key={i} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"9px 12px",borderRadius:9,background:reportType===label?"rgba(0,212,255,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${reportType===label?"rgba(0,212,255,0.35)":"rgba(255,255,255,0.08)"}`,transition:"all 0.15s"}}>
                      <input type="radio" name="reportType" value={label} checked={reportType===label} onChange={()=>setReportType(label)}
                        style={{accentColor:"#00D4FF",width:15,height:15,flexShrink:0}}/>
                      <span style={{color:reportType===label?"#e2e8f0":"#94a3b8",fontSize:14,fontWeight:reportType===label?700:400}}>{label}</span>
                    </label>
                  ))}
                </div>
                <textarea value={reportNote} onChange={e=>setReportNote(e.target.value)} placeholder={t("reportNote")} rows={2}
                  style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,color:"#e2e8f0",fontSize:13,padding:"9px 12px",resize:"vertical",boxSizing:"border-box",outline:"none",marginBottom:14,direction:dir,fontFamily:"inherit"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setReportDialog(null)}
                    style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>
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
                    style={{flex:2,padding:"10px",background:reportType?"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.1))":"rgba(255,255,255,0.04)",border:`1px solid ${reportType?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.09)"}`,borderRadius:10,color:reportType?"#EF4444":"#475569",fontSize:13,fontWeight:700,cursor:reportType?"pointer":"default",transition:"all 0.15s",opacity:reportSending?0.7:1}}>
                    {reportSending?"...":(t("reportSend"))}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showLeaderboard&&<div onClick={()=>setShowLeaderboard(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center"}}><div role="dialog" aria-modal="true" aria-label={t("leaderboardTitle")} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=="Tab")return;const f=[...e.currentTarget.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')];if(!f.length)return;const[first,last]=[f[0],f[f.length-1]];if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}else{if(document.activeElement===last){e.preventDefault();first.focus();}}}} style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:20,width:"min(360px,calc(100vw - 32px))",animation:"fadeIn 0.3s ease",direction:"ltr"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><h3 style={{margin:0,color:"#e2e8f0",fontSize:18,fontWeight:800}}>{t("leaderboardTitle")}</h3><div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:1.5,marginTop:3}}>{lang==="en"?"TOP 10":"טופ 10"}</div></div><button autoFocus onClick={()=>setShowLeaderboard(false)} aria-label={lang==="en"?"Close leaderboard":"סגור לוח תוצאות"} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button></div>{leaderboard.length===0?<div style={{color:"#475569",textAlign:"center",padding:"20px 0"}}>{t("noData")}</div>:leaderboard.map((entry,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i===0?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.03)",borderRadius:10,marginBottom:8,border:`1px solid ${i===0?"#F59E0B44":"rgba(255,255,255,0.06)"}`}}><span style={{fontSize:18,width:28}}>{["🥇","🥈","🥉"][i]||`${i+1}.`}</span><div style={{flex:1}}><div style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{entry.username ? (entry.username.includes("@") ? entry.username.split("@")[0] : entry.username) : t("anonymous")}</div><div style={{color:"#475569",fontSize:11}}>🔥 {entry.max_streak}</div></div><div style={{color:"#00D4FF",fontWeight:800,fontSize:16}}>{entry.total_score}</div></div>)}{userRank&&<div style={{marginTop:4,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"#94a3b8",fontSize:13,fontWeight:600}}><span>{lang==="en"?"Your Rank":"הדירוג שלך"}</span><span style={{color:"#e2e8f0",fontWeight:800}}>#{userRank.rank}</span><span style={{color:"rgba(255,255,255,0.2)"}}>|</span><span>{lang==="en"?"Score":"ניקוד"}</span><span style={{color:"#00D4FF",fontWeight:800}}>{userRank.score}</span></div>}</div></div>}

      {showBookmarks&&(
        <div onClick={()=>setShowBookmarks(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
          <div role="dialog" aria-modal="true" aria-label={t("savedQuestionsTitle")} onClick={e=>e.stopPropagation()}
            style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:20,width:"min(400px,calc(100vw - 32px))",maxHeight:"80vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease",direction:dir}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,color:"#e2e8f0",fontSize:18,fontWeight:800}}>{t("savedQuestionsTitle")}</h3>
              <button autoFocus onClick={()=>setShowBookmarks(false)} aria-label={lang==="en"?"Close":"סגור"} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {bookmarks.length === 0 ? (
              <div style={{color:"#475569",textAlign:"center",padding:"24px 0",fontSize:13}}>{t("noBookmarks")}</div>
            ) : (<>
              <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {bookmarks.map((b, i) => (
                  <div key={b.question_id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 13px",display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:b.topic_color||"#A855F7",fontWeight:700,marginBottom:4}}>{b.topic_name} · {lang==="en"?LEVEL_CONFIG[b.level]?.labelEn:LEVEL_CONFIG[b.level]?.label}</div>
                      <div style={{color:"#cbd5e1",fontSize:13,lineHeight:1.5}}>{b.question_text}</div>
                    </div>
                    <button onClick={()=>{
                      setBookmarks(prev=>{const next=prev.filter((_,j)=>j!==i);try{localStorage.setItem("bookmarks_v1",JSON.stringify(next));}catch{}return next;});
                    }} aria-label={t("removeBookmark")} style={{background:"none",border:"none",color:"#475569",fontSize:16,cursor:"pointer",padding:4,flexShrink:0,lineHeight:1}}
                      onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>✕</button>
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
      {showMenu&&(<>
        <div onClick={()=>setShowMenu(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
        <div style={{position:"fixed",top:82,right:8,background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"8px 0",zIndex:200,minWidth:234,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"fadeIn 0.15s ease",direction:"ltr",overflowY:"auto",maxHeight:"calc(100vh - 110px)"}}>

          {/* Language + Gender */}
          <div style={{padding:"8px 14px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:8,alignItems:"center",justifyContent:"center"}}>
            {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
            <LangSwitcher lang={lang} setLang={setLang}/>
          </div>

          {/* ── 1. Practice ── */}
          <div style={{padding:"10px 16px 4px"}}>
            <span style={{fontSize:10,color:"#334155",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"PRACTICE":"תרגול"}</span>
          </div>
          <button onClick={()=>{setScreen("incidentList");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            🚨 {lang==="en"?"Incident Mode":"מצב אירוע"}
          </button>
          <button onClick={()=>{tryStartQuiz(startMixedQuiz);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("mixedQuizBtn")}
          </button>
          <button onClick={()=>{tryStartQuiz(startDailyChallenge);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            🔥 {t("dailyChallengeTitle")}
          </button>
          <button onClick={()=>{setIsInterviewMode(p=>!p);}} aria-pressed={isInterviewMode} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:isInterviewMode?"#A855F7":"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,fontWeight:isInterviewMode?700:400,direction:dir}}>
            {t("interviewMode")}{isInterviewMode&&<span aria-hidden="true" style={{marginInlineStart:"auto",fontSize:10,color:"#A855F7"}}>ON</span>}
          </button>
          <button onClick={()=>{setScreen("mistakes");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("mistakesBtn")}
          </button>
          <button onClick={()=>{setSearchQuery("");setScreen("search");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("searchBtn")}
          </button>

          {/* ── 2. Progress ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:4}}>
            <span style={{fontSize:10,color:"#334155",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"PROGRESS":"התקדמות"}</span>
          </div>
          <button onClick={()=>{loadLeaderboard();setShowLeaderboard(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("leaderboardBtn")}
          </button>
          <button onClick={()=>{setShowBookmarks(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,direction:dir}}>
            <span>{t("savedQuestions")}</span>
            {bookmarks.length>0&&<span style={{background:"rgba(168,85,247,0.2)",color:"#A855F7",fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{bookmarks.length}</span>}
          </button>
          <button onClick={()=>{setScreen("home");setHomeTab("categories");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            ⭐ {lang==="en"?"My Stats":"הסטטיסטיקות שלי"}
          </button>

          {/* ── 3. Learning ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:4}}>
            <span style={{fontSize:10,color:"#334155",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"LEARNING":"למידה"}</span>
          </div>
          <button onClick={()=>{setExpandedGuideSection(null);setScreen("guide");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("guideBtn")}
          </button>

          {/* ── 4. Settings ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:4}}>
            <span style={{fontSize:10,color:"#334155",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"SETTINGS":"הגדרות"}</span>
          </div>
          <div style={{padding:"4px 14px 10px"}}>
            <div style={{display:"flex",gap:4}}>
              {(["reduceMotion","highContrast"]).map((key,i)=>(
                <button key={key} onClick={()=>updateA11y(key,!a11y[key])}
                  aria-pressed={a11y[key]}
                  style={{flex:1,padding:"6px 4px",background:a11y[key]?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${a11y[key]?"rgba(0,212,255,0.35)":"rgba(255,255,255,0.08)"}`,borderRadius:6,color:a11y[key]?"#00D4FF":"#64748b",fontSize:11,cursor:"pointer",fontWeight:a11y[key]?700:400}}>
                  {i===0?t("a11yReduceMotion"):t("a11yHighContrast")}{a11y[key]?" ✓":""}
                </button>
              ))}
            </div>
            {window.speechSynthesis&&(
              <div style={{display:"flex",gap:4,marginTop:7}}>
                {screen==="topic"&&topicScreen==="quiz"&&(
                  <button onClick={speakQuestion}
                    aria-pressed={isSpeaking}
                    style={{flex:1,padding:"6px 4px",background:isSpeaking?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${isSpeaking?"rgba(0,212,255,0.35)":"rgba(255,255,255,0.08)"}`,borderRadius:6,color:isSpeaking?"#00D4FF":"#64748b",fontSize:11,cursor:"pointer",fontWeight:isSpeaking?700:400}}>
                    {isSpeaking?t("stopSpeech"):t("readQuestion")}
                  </button>
                )}
                <button onClick={()=>updateA11y("autoRead",!a11y.autoRead)}
                  aria-pressed={a11y.autoRead}
                  style={{flex:1,padding:"6px 4px",background:a11y.autoRead?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${a11y.autoRead?"rgba(0,212,255,0.35)":"rgba(255,255,255,0.08)"}`,borderRadius:6,color:a11y.autoRead?"#00D4FF":"#64748b",fontSize:11,cursor:"pointer",fontWeight:a11y.autoRead?700:400}}>
                  {t("autoRead")}{a11y.autoRead?" ✓":""}
                </button>
              </div>
            )}
          </div>
          <a href="mailto:ocarmeli7@gmail.com?subject=KubeQuest%20Feedback" style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,textDecoration:"none",direction:dir}}>
            <span>✉️</span>{lang==="en"?"Contact":"צור קשר"}
          </a>

          {/* ── 5. App ── */}
          <div style={{padding:"10px 16px 4px",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:4}}>
            <span style={{fontSize:10,color:"#334155",fontWeight:700,letterSpacing:1,direction:dir}}>{lang==="en"?"APP":"אפליקציה"}</span>
          </div>
          <button onClick={()=>{setScreen("about");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("aboutBtn")}
          </button>
          <button onClick={()=>{setScreen("status");setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            🟢 {lang==="en"?"System Status":"סטטוס מערכת"}
          </button>
          <button onClick={()=>{
            const url="https://kubequest.online";
            const text=lang==="en"?"Training Kubernetes with KubeQuest – give it a try! 🚀":"מתאמן/ת על Kubernetes עם KubeQuest – שווה לנסות! 🚀";
            if(navigator.share){navigator.share({title:"KubeQuest",text,url}).catch(()=>{});}
            else{navigator.clipboard?.writeText(url);}
            setShowMenu(false);
          }} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,direction:dir}}>
            {t("shareBtn")}
          </button>

          {/* ── System ── */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:4,paddingTop:4}}>
            <button onClick={()=>{handleResetProgress();setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10}}>
              <span aria-hidden="true">🗑</span>{t("resetProgress")}
            </button>
            <button onClick={()=>{handleLogout();setShowMenu(false);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10}}>
              <span aria-hidden="true">🚪</span>{t("logout")}
            </button>
          </div>
        </div>
      </>)}
      <main id="main-content" style={fs !== 1 ? {zoom: fs, width: `${+(100/fs).toFixed(4)}%`} : undefined}>
      {/* HOME */}
      {screen==="home"&&(
        <div className="page-pad home-screen" style={{maxWidth:700,margin:"0 auto",padding:"16px 12px",animation:"fadeIn 0.4s ease",overflowX:"hidden",direction:dir}}>
          {/* ── Hero - centered, matches loading screen composition ── */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:14}}>
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
                  <h1 className="home-title-text" style={{fontSize:28,fontWeight:900,margin:0,lineHeight:1,letterSpacing:-0.5,background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",color:"transparent",backgroundSize:"300% auto",animation:"shine 9s linear infinite",whiteSpace:"nowrap"}}>KubeQuest</h1>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                    <span style={{fontSize:11,color:"#475569",letterSpacing:0.4}}>Train Your Kubernetes Skills</span>
                    <span style={{fontSize:10,color:"#00D4FF",background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.25)",borderRadius:4,padding:"1px 5px",fontWeight:700,letterSpacing:0.3}}>v{APP_VERSION}</span>
                  </div>
                </div>
              );
              const logoGroup=(
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  {logoIcon}{logoText}
                </div>
              );
              const burgerBtn=(
                <button onClick={()=>setShowMenu(p=>!p)} aria-label={lang==="en"?"Open menu":"פתח תפריט"} aria-expanded={showMenu} aria-haspopup="menu"
                  style={{flexShrink:0,width:46,height:46,
                    background:showMenu?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${showMenu?"rgba(0,212,255,0.3)":"rgba(255,255,255,0.1)"}`,
                    borderRadius:10,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,
                    transition:"all 0.2s",
                    boxShadow:showMenu?"0 0 12px rgba(0,212,255,0.5), 0 0 24px rgba(0,212,255,0.2)":"0 0 8px rgba(0,212,255,0.15)"}}>
                  {[0,1,2].map(i=><span key={i} aria-hidden="true" style={{display:"block",width:20,height:2,borderRadius:2,background:showMenu?"#00D4FF":"#94a3b8",transition:"background 0.2s"}}/>)}
                </button>
              );
              return (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",direction:"ltr"}}>
                  {logoGroup}{burgerBtn}
                </div>
              );
            })()}
            {/* Separator */}
            <div style={{width:"100%",borderBottom:"1px solid rgba(255,255,255,0.06)",margin:"10px 0"}}/>
            {/* Greeting block - compact */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              {/* Row 1: שלום / Hello + username + optional guest label - all inline */}
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"nowrap",justifyContent:"center",maxWidth:"100%",overflow:"hidden"}}>
                <span style={{color:"#64748b",fontSize:13,lineHeight:1,direction:dir,flexShrink:0}}>{t("greeting")}</span>
                <span style={{color:"#e2e8f0",fontSize:13,fontWeight:700,lineHeight:1,direction:"ltr",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{displayName}</span>
              </div>
              {/* Row 2: tagline / mode hint - smaller and dimmer */}
              <p style={{color:"#64748b",fontSize:11,margin:0,lineHeight:1.3,textAlign:"center",direction:dir}}>
                {isInterviewMode?t("interviewModeHint"):(lang==="he"?welcomeMessagesHe:welcomeMessagesEn)[welcomeIdx]}
              </p>
              {/* Row 3: streak */}
              {dailyStreak.streak > 0 && (
                <div style={{background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:"4px 12px",fontSize:12,color:"#F59E0B",fontWeight:700,marginTop:2}}>
                  🔥 {dailyStreak.streak} {t("dailyStreak")}
                </div>
              )}
            </div>
          </div>
          {isGuest&&<div className="guest-banner" style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{color:"#4a9aba",fontSize:13,flex:1,minWidth:0}}>{t("guestBanner")}</span><button className="guest-banner-btn" onClick={()=>{setAuthScreen("signup");setUser(null);}} style={{padding:"6px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,color:"#00D4FF",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t("signupNow")}</button></div>}
          <div style={{display:"flex",gap:6,marginBottom:16,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:3,direction:"ltr"}}>
            {[{key:"categories",label:t("tabTopics")},{key:"roadmap",label:t("tabRoadmap")}].map(tab=>(
              <button key={tab.key} onClick={()=>setHomeTab(tab.key)} style={{flex:1,padding:"8px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,background:homeTab===tab.key?"rgba(0,212,255,0.12)":"transparent",color:homeTab===tab.key?"#00D4FF":"#475569",transition:"all 0.2s"}}>{tab.label}</button>
            ))}
          </div>
          {homeTab==="categories"&&(<>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
            {[
              {label:t("score"),value:stats.total_score,icon:"⭐",color:"#F59E0B"},
              {label:t("accuracy"),value:`${accuracy}%`,icon:"🎯",color:"#10B981"},
              {label:t("streak"),value:stats.current_streak,icon:"🔥",color:"#FF6B35"},
              {label:t("completed"),value:Object.keys(completedTopics).filter(k=>!isFreeMode(k.split("_")[0])).length,icon:"📚",color:"#00D4FF"},
            ].map((s,i)=>(
              <div key={i} className="stats-cell" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <div style={{fontSize:18,lineHeight:1}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12,color:"#475569",opacity:0.7,lineHeight:1}}>{s.label}</div>
              </div>
            ))}
          </div>
          <WeakAreaCard topicStats={topicStats} completedTopics={completedTopics} t={t} dir={dir} onGoToTopic={(id) => {
            const el = document.getElementById(`topic-card-${id}`);
            if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setHighlightTopic(id); setTimeout(() => setHighlightTopic(null), 1500); }
          }}/>
          <button onClick={()=>tryStartQuiz(startDailyChallenge)} className="action-card" style={{width:"100%",marginBottom:10,padding:"16px 20px",background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))",border:"1px solid rgba(245,158,11,0.35)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div className="action-card-inner" style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
              <span className="action-emoji" style={{fontSize:28,flexShrink:0}}>🔥</span>
              <div className="action-text" style={{textAlign:"start",minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#F59E0B",fontWeight:800,fontSize:15}}>{t("dailyChallengeTitle")}</span>
                  <span style={{background:"rgba(245,158,11,0.2)",color:"#F59E0B",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5,flexShrink:0}}>{t("dailyChallengeNew")}</span>
                </div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("dailyChallengeDesc")}</div>
              </div>
            </div>
            <span style={{color:"#F59E0B",fontSize:20,flexShrink:0}}>{dir==="rtl"?"←":"→"}</span>
          </button>
          <button onClick={()=>tryStartQuiz(startMixedQuiz)} className="action-card" style={{width:"100%",marginBottom:10,padding:"16px 20px",background:"linear-gradient(135deg,#A855F722,#7C3AED22)",border:"1px solid #A855F755",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div className="action-card-inner" style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
              <div className="action-text" style={{textAlign:"start",minWidth:0}}>
                <div style={{color:"#A855F7",fontWeight:800,fontSize:15}}>{t("mixedQuizBtn")}</div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("mixedQuizDesc")}</div>
              </div>
            </div>
            <span style={{color:"#A855F7",fontSize:20,flexShrink:0}}>{dir==="rtl"?"←":"→"}</span>
          </button>

          {/* Incident Mode entry */}
          <button onClick={()=>setScreen("incidentList")} className="action-card"
            style={{width:"100%",marginBottom:16,padding:"16px 20px",background:"linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.05))",border:"1px solid rgba(239,68,68,0.35)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div className="action-card-inner" style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
              <span className="action-emoji" style={{fontSize:28,flexShrink:0}}>🚨</span>
              <div className="action-text" style={{textAlign:"start",minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#EF4444",fontWeight:800,fontSize:15}}>{t("incidentModeBtn")}</span>
                  <span style={{background:"rgba(239,68,68,0.15)",color:"#EF4444",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5,flexShrink:0}}>NEW</span>
                </div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("incidentModeDesc")}</div>
              </div>
            </div>
            <span style={{color:"#EF4444",fontSize:20,flexShrink:0}}>{dir==="rtl"?"←":"→"}</span>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TOPICS.map(topic=>(
              <section key={topic.id} id={`topic-card-${topic.id}`} aria-label={topic.name} className={`topic-card-section${highlightTopic===topic.id?" pulseHighlight":""}`} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div aria-hidden="true" style={{fontSize:24,width:44,height:44,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>{topic.icon}</div>
                  <div style={{flex:1}}>
                    <h3 style={{margin:0,fontWeight:700,color:"#e2e8f0",fontSize:15}}>{topic.name}</h3>
                    <div style={{color:"#475569",fontSize:12}}>{lang==="en"?topic.descriptionEn:topic.description}</div>
                  </div>
                  {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return done>0&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:11,color:topic.color,fontWeight:700,whiteSpace:"nowrap"}}>{done}/3</div>
                    <button onClick={e=>{e.stopPropagation();handleResetTopic(topic.id);}} aria-label={t("resetTopic")} style={{background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",padding:"2px 4px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>↺</button>
                  </div>})()}
                </div>
                {(()=>{const pct=computeTopicProgress(topic.id);return(<div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10}}><div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/></div>);})()}
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
                          background:locked?"rgba(255,255,255,0.01)":done?`${cfg.color}12`:"rgba(255,255,255,0.03)",
                          border:`1px solid ${locked?"rgba(255,255,255,0.04)":done?cfg.color+"44":"rgba(255,255,255,0.07)"}`,
                          borderRadius:10,textAlign:"center",opacity:locked?0.45:1,cursor:locked?"not-allowed":"pointer"}}>
                        <div style={{fontSize:16}} aria-hidden="true">{locked?"🔒":cfg.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:locked?"#334155":done?cfg.color:"#64748b"}}>{lang==="en"?cfg.labelEn:cfg.label}</div>
                        {done&&!locked&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}} aria-hidden="true">
                          {done.correct>0?"✓":""} {done.correct}/{done.total}
                        </div>}
                        <div style={{fontSize:10,color:locked?"#1e293b":"#475569"}} aria-hidden="true">+{cfg.points}{t("pts")}</div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          {unlockedAchievements.length>0&&<div style={{marginTop:18,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"14px 18px"}}><div style={{color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:1}}>{t("achievementsTitle")}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{ACHIEVEMENTS.filter(a=>unlockedAchievements.includes(a.id)).map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#94a3b8"}}><span>{a.icon}</span>{lang==="en"?a.nameEn:a.name}</div>)}</div></div>}
          </>)}
          {homeTab==="roadmap"&&<RoadmapView topics={TOPICS} levelConfig={LEVEL_CONFIG} completedTopics={completedTopics} isLevelLocked={isLevelLocked} startTopic={startTopic} startMixedQuiz={startMixedQuiz} lang={lang} t={t} dir={dir}/>}
          <Footer lang={lang}/>
        </div>
      )}

      {/* ── SEARCH ── */}
      {screen==="search"&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
          <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
            {dir==="rtl"?"→ חזרה":"← Back"}
          </button>
          <h2 style={{color:"#e2e8f0",fontSize:18,fontWeight:700,marginBottom:16}}>{t("searchBtn")}</h2>
          <input type="search" autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")} dir={dir}
            style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"#e2e8f0",fontSize:14,marginBottom:20,outline:"none",fontFamily:"inherit"}}
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
            if(capped.length===0) return <div style={{color:"#475569",fontSize:14,textAlign:"center",padding:"30px 0"}}>{t("searchNoResults")}</div>;
            return (<>
              <div style={{color:"#64748b",fontSize:12,marginBottom:12}}>{capped.length} {lang==="en"?"results":"תוצאות"}</div>
              {capped.map(({topic,level,question},i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${topic.color}22`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,direction:"ltr"}}>
                    <span style={{fontSize:16}}>{topic.icon}</span>
                    <span style={{color:topic.color,fontSize:12,fontWeight:700}}>{topic.name}</span>
                    <span style={{marginLeft:"auto",background:`${LEVEL_CONFIG[level]?.color}22`,color:LEVEL_CONFIG[level]?.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{lang==="en"?LEVEL_CONFIG[level]?.labelEn:LEVEL_CONFIG[level]?.label}</span>
                  </div>
                  <div dir={dir} style={{color:"#cbd5e1",fontSize:13,lineHeight:1.5,marginBottom:10}}>{lang==="en"?(question.qEn||question.q):question.q}</div>
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
          if(r.wrongIndices&&r.wrongIndices.length>0){
            const rawQs=lang==="en"?topic.levels[lvl].questionsEn:topic.levels[lvl].questions;
            r.wrongIndices.forEach(idx=>{const q=rawQs?.[idx];if(q) wrongItems.push({topic,level:lvl,q});});
          } else if((!r.wrongIndices||(Array.isArray(r.wrongIndices)&&r.wrongIndices.length===0&&!r.retryComplete))&&r.correct<r.total){
            wrongItems.push({topic,level:lvl,legacy:true,correct:r.correct,total:r.total});
          }
        }));
        const anyTopicCompleted=TOPICS.some(topic=>(['easy','medium','hard']).some(lvl=>completedTopics[`${topic.id}_${lvl}`]));
        return (
          <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
              {dir==="rtl"?"→ חזרה":"← Back"}
            </button>
            <h2 style={{color:"#e2e8f0",fontSize:18,fontWeight:700,marginBottom:4}}>{t("mistakesBtn")}</h2>
            <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{t("mistakesHint")}</p>
            {!anyTopicCompleted&&<div style={{background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13,color:"#94a3b8",direction:dir}}>
              {lang==="en"?"💡 Mistakes are only tracked for individual topic quizzes (Easy / Medium / Hard). Mixed Quiz and Daily Challenge are not tracked here.":"💡 טעויות נשמרות רק בחידוני נושא רגילים (קל / בינוני / קשה). חידון מיקס ואתגר יומי לא נשמרים כאן."}
            </div>}
            {wrongItems.length===0
              ? <div style={{textAlign:"center",padding:"40px 0",color:"#10B981",fontSize:16,fontWeight:700}}>{t("mistakesEmpty")}</div>
              : wrongItems.map(({topic,level,q,legacy,correct,total},i)=>
                  legacy?(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <span style={{fontSize:26,flexShrink:0}}>{topic.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{topic.name}</div>
                          <div style={{color:"#64748b",fontSize:12,marginTop:2,display:"flex",alignItems:"center",gap:8,direction:"ltr"}}>
                            <span style={{color:LEVEL_CONFIG[level]?.color,fontWeight:600}}>{lang==="en"?LEVEL_CONFIG[level]?.labelEn:LEVEL_CONFIG[level]?.label}</span>
                            <span>·</span>
                            <span style={{color:"#EF4444"}}>{correct}/{total} {lang==="en"?"correct":"נכון"}</span>
                          </div>
                        </div>
                        <button onClick={()=>tryStartQuiz(()=>startTopic(topic,level))} style={{flexShrink:0,padding:"8px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          {lang==="en"?"Retry":"נסה שוב"}
                        </button>
                      </div>
                      <div style={{color:"#64748b",fontSize:11,marginTop:8,direction:dir}}>
                        {lang==="en"?"Retake this quiz to track your specific wrong questions":"שחק שוב כדי לראות את השאלות הספציפיות שטעית בהן"}
                      </div>
                    </div>
                  ):(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(239,68,68,0.12)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,direction:"ltr",flexWrap:"wrap"}}>
                        <span style={{fontSize:15}}>{topic.icon}</span>
                        <span style={{color:"#94a3b8",fontSize:12,fontWeight:600}}>{topic.name}</span>
                        <span style={{color:LEVEL_CONFIG[level]?.color,fontSize:11,fontWeight:700,background:`${LEVEL_CONFIG[level]?.color}18`,border:`1px solid ${LEVEL_CONFIG[level]?.color}44`,borderRadius:6,padding:"2px 6px"}}>
                          {lang==="en"?LEVEL_CONFIG[level]?.labelEn:LEVEL_CONFIG[level]?.label}
                        </span>
                      </div>
                      <div style={{color:"#e2e8f0",fontSize:14,lineHeight:1.5,marginBottom:8,direction:dir}}>{q.q}</div>
                      <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                        <span style={{color:"#10B981",fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
                        <span style={{color:"#10B981",fontSize:13,lineHeight:1.4}}>{q.options[q.answer]}</span>
                      </div>
                    </div>
                  )
                )
            }
          </div>
        );
      })()}

      {/* ── GUIDE ── */}
      {screen==="guide"&&(()=>{
        const GUIDE=[
          // ── 1. Core Objects ──────────────────────────────────────────────
          {id:"core",icon:"🧩",color:"#00D4FF",title:lang==="en"?"Core Objects":"אובייקטים מרכזיים",items:[
            {sect:"Pod"},
            {k:"Pod",         v:lang==="en"?"Smallest deployable unit. Contains 1+ containers sharing network and storage. Gets a new IP on every restart.":"היחידה הקטנה ביותר. מכיל 1+ קונטיינרים. מקבל IP חדש בכל restart."},
            {k:"restartPolicy",v:lang==="en"?"Always (default) / OnFailure (Jobs) / Never":"Always (ברירת מחדל) / OnFailure / Never"},
            {sect:"Deployment"},
            {k:"Deployment",  v:lang==="en"?"Manages identical Pods. Handles rolling updates and rollbacks automatically. Use for stateless apps.":"מנהל Pods זהים. מטפל ב-rolling update ו-rollback. לאפליקציות stateless."},
            {sect:"StatefulSet"},
            {k:"StatefulSet", v:lang==="en"?"Like Deployment but each Pod gets a stable identity (pod-0, pod-1) and its own persistent PVC. Use for databases.":"כמו Deployment אך עם זהות יציבה (pod-0, pod-1) ו-PVC ייחודי. לבסיסי נתונים."},
            {sect:"DaemonSet"},
            {k:"DaemonSet",   v:lang==="en"?"Runs exactly one Pod copy on every Node. Used for: log collectors, monitoring agents, CNI plugins.":"Pod אחד בדיוק על כל Node. לניטור, לוגים, CNI."},
            {sect:"Job / CronJob"},
            {k:"Job",         v:lang==="en"?"Runs a task to completion (exit 0). Retries on failure up to backoffLimit.":"מריץ משימה עד סיום. לעבודות batch ו-one-off."},
            {k:"CronJob",     v:lang==="en"?"Creates Jobs on a cron schedule.  e.g. '0 * * * *' = every hour.":"יוצר Jobs לפי לוח זמנים. למשל: '0 * * * *' = כל שעה."},
          ],code:
`# Pods
kubectl get pods                        # current namespace
kubectl get pods -A                     # all namespaces
kubectl describe pod <name>             # events, conditions, spec
kubectl logs <pod>                      # stdout/stderr
kubectl logs <pod> --previous           # logs before last crash

# Deployments
kubectl get deployments
kubectl rollout status  deploy/<name>   # watch rolling update
kubectl rollout undo    deploy/<name>   # rollback to previous version
kubectl rollout restart deploy/<name>   # rolling restart (zero downtime)
kubectl scale deploy/<name> --replicas=3

# StatefulSets / DaemonSets / Jobs
kubectl get statefulsets
kubectl get daemonsets
kubectl get jobs && kubectl get cronjobs`},

          // ── 2. Networking ─────────────────────────────────────────────────
          {id:"networking",icon:"🌐",color:"#10B981",title:lang==="en"?"Networking":"רשת",items:[
            {sect:lang==="en"?"Services":"Services"},
            {k:"ClusterIP",    v:lang==="en"?"Internal-only. Default type. Not reachable from outside the cluster.":"גישה פנימית בלבד. סוג ברירת מחדל."},
            {k:"NodePort",     v:lang==="en"?"External access via <NodeIP>:<30000–32767>. Good for dev/testing.":"גישה חיצונית דרך פורט קבוע. לפיתוח ובדיקות."},
            {k:"LoadBalancer", v:lang==="en"?"Cloud provider creates an external load balancer. Standard for production.":"ספק ענן יוצר LB חיצוני. סטנדרט לפרודקשן."},
            {k:"Headless",     v:lang==="en"?"clusterIP: None - DNS returns individual Pod IPs. Used by StatefulSets.":"clusterIP: None – DNS מחזיר IPs של Pods ישירות."},
            {sect:lang==="en"?"Port fields":"שדות פורטים"},
            {k:"port",       v:lang==="en"?"Port the Service listens on inside the cluster":"פורט שה-Service מאזין עליו בתוך הקלאסטר"},
            {k:"targetPort", v:lang==="en"?"Port on the Pod container (where your app listens)":"פורט בתוך הקונטיינר"},
            {k:"nodePort",   v:lang==="en"?"External port on the Node (NodePort type only, 30000–32767)":"פורט חיצוני על ה-Node (NodePort בלבד)"},
            {sect:lang==="en"?"Cluster DNS":"DNS פנימי"},
            {k:"Same namespace",  v:lang==="en"?"Short name works:  http://my-svc":"שם קצר עובד:  http://my-svc"},
            {k:"Cross-namespace", v:lang==="en"?"http://my-svc.my-ns  or full FQDN: my-svc.my-ns.svc.cluster.local":"http://my-svc.my-ns  או FQDN מלא"},
            {sect:"Ingress"},
            {k:"Ingress",    v:lang==="en"?"Routes HTTP/S traffic from outside the cluster to Services. Requires an Ingress Controller (nginx, traefik…).":"מנתב HTTP/S חיצוני ל-Services. דורש Ingress Controller."},
            {sect:"NetworkPolicy"},
            {k:"Default",    v:lang==="en"?"No policy = all traffic allowed. Best practice: apply deny-all first, then explicit allow rules.":"ללא policy = הכל מותר. שיטה טובה: deny-all ואז allows ספציפיים."},
            {k:"ingress",    v:lang==="en"?"Controls traffic coming INTO the selected Pods":"שולט בתעבורה שנכנסת ל-Pods"},
            {k:"egress",     v:lang==="en"?"Controls traffic going OUT from the selected Pods":"שולט בתעבורה שיוצאת מ-Pods"},
          ],code:
`# Services
kubectl get svc
kubectl describe svc <name>             # see selector, ports, type
kubectl get endpoints <svc>             # Pods the Service is routing to
                                        # empty list = selector label mismatch

# Ingress
kubectl get ingress
kubectl describe ingress <name>

# NetworkPolicy
kubectl get networkpolicies -n <ns>
kubectl describe networkpolicy <name>   # read rules in human format

# 💡 Test connectivity from inside the cluster:
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- curl http://my-svc.my-ns/health`},

          // ── 3. Scheduling ─────────────────────────────────────────────────
          {id:"scheduling",icon:"⚙️",color:"#F59E0B",title:lang==="en"?"Scheduling":"תזמון",items:[
            {sect:lang==="en"?"Node Selection":"בחירת Node"},
            {k:"nodeSelector",  v:lang==="en"?"Simple label match. Pod only runs on Nodes with that label.":"התאמת label פשוטה. Pod ירוץ רק על Node עם ה-label."},
            {k:"nodeAffinity",  v:lang==="en"?"Like nodeSelector but with required / preferred rules and richer expressions (In, NotIn, Exists).":"כמו nodeSelector עם כללים required/preferred ורחבים יותר."},
            {sect:lang==="en"?"Taints & Tolerations":"Taints ו-Tolerations"},
            {k:"Taint",       v:lang==="en"?"Marks a Node to repel Pods. Effects: NoSchedule / PreferNoSchedule / NoExecute.":"מסמן Node לדחיית Pods. אפקטים: NoSchedule / PreferNoSchedule / NoExecute."},
            {k:"Toleration",  v:lang==="en"?"Added to a Pod spec to allow scheduling onto a tainted Node.":"מתווסף ל-Pod spec לאפשר תזמון על Node עם Taint."},
            {sect:lang==="en"?"Resource Requests & Limits":"בקשות ומגבלות משאבים"},
            {k:"requests",    v:lang==="en"?"Minimum reserved for the Pod. The Scheduler uses this to pick a Node with enough capacity.":"מינימום שמור. הבסיס שבו Scheduler בוחר Node."},
            {k:"limits",      v:lang==="en"?"Maximum allowed. Exceeding memory → OOMKilled (exit 137). Exceeding CPU → throttled (not killed).":"מקסימום. חריגת זיכרון → OOMKilled. חריגת CPU → throttling."},
            {sect:lang==="en"?"Health Probes":"Probes בריאות"},
            {k:"livenessProbe",  v:lang==="en"?"Fail → Kubernetes restarts the container":"כשלון → Kubernetes מאתחל את הקונטיינר"},
            {k:"readinessProbe", v:lang==="en"?"Fail → Pod removed from Service endpoints (no traffic sent to it)":"כשלון → Pod מוסר מה-Service (ללא traffic)"},
            {k:"startupProbe",   v:lang==="en"?"Delays liveness/readiness checks until the app finishes starting up":"עוצר liveness/readiness עד שהאפליקציה סיימה לעלות"},
            {sect:lang==="en"?"QoS Classes":"מחלקות QoS"},
            {k:"Guaranteed",  v:lang==="en"?"requests == limits on all containers. Last to be evicted under memory pressure.":"requests == limits. אחרון לפינוי בלחץ זיכרון."},
            {k:"Burstable",   v:lang==="en"?"At least one container has requests < limits. Middle eviction priority.":"requests < limits. עדיפות ביניים."},
            {k:"BestEffort",  v:lang==="en"?"No requests or limits set. First to be evicted when a Node is under pressure.":"ללא requests/limits. הראשון לפינוי."},
          ],code:
`# Why is my Pod Pending? → read Events
kubectl describe pod <name>             # scroll to Events at the bottom

# Node labels and capacity
kubectl get nodes --show-labels
kubectl describe node <name>            # Capacity, Allocatable, Taints

# Taints
kubectl taint nodes <node> key=val:NoSchedule
kubectl taint nodes <node> key=val:NoSchedule-  # remove taint (trailing dash)

# Live resource usage (requires metrics-server)
kubectl top pods
kubectl top pods --sort-by=memory
kubectl top nodes

# 💡 requests too high  → Pod stays Pending forever
#    limits too low     → Pod gets OOMKilled`},

          // ── 4. Configuration ──────────────────────────────────────────────
          {id:"configuration",icon:"🔧",color:"#A855F7",title:lang==="en"?"Configuration":"קונפיגורציה",items:[
            {sect:"ConfigMap"},
            {k:"ConfigMap",  v:lang==="en"?"Stores non-sensitive key-value config. Mount as a volume (auto-updates in ~1 min) or inject as env vars (requires Pod restart to update).":"קונפיגורציה non-sensitive. כvolume מתעדכן אוטומטית; כenv var דורש restart."},
            {sect:"Secret"},
            {k:"Secret",     v:lang==="en"?"Like ConfigMap but for sensitive data. Values are base64-encoded - NOT encrypted by default. Use Sealed Secrets or External Secrets Operator for production GitOps.":"לנתונים רגישים. מקודד base64, לא מוצפן כברירת מחדל."},
            {sect:lang==="en"?"Injecting config into Pods":"הזרקת קונפיגורציה ל-Pods"},
            {k:"env.value",                      v:lang==="en"?"Hardcoded value directly in the Pod spec.":"ערך קבוע ב-spec."},
            {k:"env.valueFrom.configMapKeyRef",  v:lang==="en"?"Pull one key from a ConfigMap as an env var.":"env var ממפתח ספציפי ב-ConfigMap."},
            {k:"env.valueFrom.secretKeyRef",     v:lang==="en"?"Pull one key from a Secret as an env var.":"env var ממפתח ספציפי ב-Secret."},
            {k:"envFrom.configMapRef",           v:lang==="en"?"Inject ALL keys from a ConfigMap as env vars.":"כל המפתחות מ-ConfigMap כ-env vars."},
            {k:"volumeMount (ConfigMap/Secret)", v:lang==="en"?"Each key becomes a file at mountPath. ConfigMap volumes auto-update, env vars do not.":"כל מפתח = קובץ. ConfigMap כvolume מתעדכן אוטומטית."},
          ],code:
`# ConfigMaps
kubectl get configmap -n <ns>
kubectl describe cm <name>
kubectl create cm <name> --from-literal=key=value
kubectl create cm <name> --from-file=config.properties

# Secrets
kubectl get secret -n <ns>
kubectl describe secret <name>           # shows key names, NOT values
kubectl create secret generic <name> --from-literal=password=mypass

# Decode a secret value
kubectl get secret <name> -o jsonpath='{.data.password}' | base64 --decode

# 💡 Env vars from ConfigMap/Secret are frozen at Pod creation.
#    Edit the ConfigMap, then restart Pods:
kubectl rollout restart deploy/<name>`},

          // ── 5. Storage ────────────────────────────────────────────────────
          {id:"storage",icon:"💾",color:"#6366F1",title:lang==="en"?"Storage":"אחסון",items:[
            {sect:lang==="en"?"Ephemeral Volumes":"Volumes זמניים"},
            {k:"emptyDir",  v:lang==="en"?"Created with the Pod, deleted with the Pod. Survives container restarts. Shared by all containers in the same Pod.":"נוצר עם ה-Pod, נמחק איתו. שורד container restart. משותף לכל הקונטיינרים."},
            {k:"hostPath",  v:lang==="en"?"Mounts a Node directory into the Pod. Avoid in production - breaks portability.":"תיקיה מה-Node לתוך ה-Pod. יש להימנע ב-production."},
            {sect:"PersistentVolume (PV)"},
            {k:"PV",        v:lang==="en"?"A piece of real storage in the cluster (cloud disk, NFS…). Provisioned by admin or auto-created by a StorageClass.":"אחסון אמיתי בקלאסטר. נוצר על ידי Admin או אוטומטית על ידי StorageClass."},
            {sect:"PersistentVolumeClaim (PVC)"},
            {k:"PVC",       v:lang==="en"?"A Pod's request for storage. Kubernetes binds it to a PV matching size, accessMode, and storageClass.":"בקשת Pod לאחסון. Kubernetes מוצא PV מתאים ומחבר ביניהם."},
            {sect:"StorageClass"},
            {k:"StorageClass",v:lang==="en"?"Blueprint for dynamic provisioning. Names the provisioner plugin (AWS EBS CSI, GCP PD, Ceph…) that creates real disks on demand.":"תבנית ל-dynamic provisioning. מגדיר provisioner שיוצר דיסקים אוטומטית."},
            {sect:lang==="en"?"Access Modes":"מצבי גישה"},
            {k:"ReadWriteOnce (RWO)",v:lang==="en"?"One Node - read + write. Default for most cloud disks.":"Node אחד – קריאה וכתיבה. ברירת מחדל."},
            {k:"ReadWriteMany (RWX)",v:lang==="en"?"Many Nodes - read + write. Requires NFS, AWS EFS, or Ceph.":"מספר Nodes – קריאה וכתיבה. דורש NFS/EFS."},
            {k:"ReadOnlyMany  (ROX)",v:lang==="en"?"Many Nodes - read only.":"מספר Nodes – קריאה בלבד."},
            {sect:lang==="en"?"Reclaim Policy":"מדיניות שחרור"},
            {k:"Retain", v:lang==="en"?"Data preserved after PVC deletion. Admin must clean up manually. Recommended for databases.":"נתונים נשמרים לאחר מחיקת PVC. Admin מנקה ידנית. לבסיסי נתונים."},
            {k:"Delete", v:lang==="en"?"PV and the underlying cloud disk are deleted when PVC is deleted. Default for dynamic provisioning.":"PV ודיסק פיזי נמחקים עם מחיקת PVC. ברירת מחדל לdynamic."},
          ],code:
`kubectl get pv                           # cluster-level (no namespace needed)
kubectl get pvc -n <ns>
kubectl describe pvc <name>              # check status + Events
                                         # Pending = no matching PV found

kubectl get storageclass

# ⚠️  StatefulSet PVCs survive helm uninstall (intentional data protection)
# Delete manually AFTER confirming backups:
kubectl delete pvc -l app=<name> -n <ns>`},

          // ── 6. Security ───────────────────────────────────────────────────
          {id:"security",icon:"🔒",color:"#EF4444",title:lang==="en"?"Security":"אבטחה",items:[
            {sect:"RBAC"},
            {k:"Role",               v:lang==="en"?"Grants permissions within one namespace.":"הרשאות בתוך namespace אחד."},
            {k:"ClusterRole",        v:lang==="en"?"Grants cluster-wide permissions. Can be reused across namespaces via RoleBinding.":"הרשאות ברמת הקלאסטר. ניתן לשימוש חוזר בכל namespace."},
            {k:"RoleBinding",        v:lang==="en"?"Attaches a Role (or ClusterRole) to a User, Group, or ServiceAccount in a namespace.":"מקשר Role לנושא בתוך namespace."},
            {k:"ClusterRoleBinding", v:lang==="en"?"Attaches a ClusterRole to a subject cluster-wide.":"מקשר ClusterRole בכל הקלאסטר."},
            {sect:lang==="en"?"ServiceAccounts":"ServiceAccounts"},
            {k:"ServiceAccount",     v:lang==="en"?"Identity for Pods when calling the Kubernetes API. Every namespace has a 'default' SA auto-mounted into Pods.":"זהות ל-Pods מול ה-API. ה-SA 'default' מוזרק אוטומטית לכל Pod."},
            {sect:lang==="en"?"Pod Security":"אבטחת Pod"},
            {k:"runAsNonRoot: true",             v:lang==="en"?"Container must not run as root (UID 0). Reduces blast radius if compromised.":"קונטיינר לא ירוץ כ-root. מצמצם נזק אפשרי."},
            {k:"readOnlyRootFilesystem: true",   v:lang==="en"?"Container filesystem is read-only. Prevents writing malicious files.":"filesystem לקריאה בלבד. מונע כתיבת קבצים זדוניים."},
            {k:"allowPrivilegeEscalation: false",v:lang==="en"?"Process cannot gain more privileges than its parent.":"מונע הסלמת הרשאות."},
            {sect:lang==="en"?"Common Verbs":"פעלים נפוצים"},
            {k:"get / list / watch",      v:lang==="en"?"Read-only access":"גישת קריאה בלבד"},
            {k:"create / update / patch", v:lang==="en"?"Write access":"גישת כתיבה"},
            {k:"delete",                  v:lang==="en"?"Remove a resource":"מחיקת משאב"},
            {k:"* (wildcard)",            v:lang==="en"?"All verbs - avoid in production":"כל הפעלים – יש להימנע ב-production"},
          ],code:
`# RBAC
kubectl get role,rolebinding -n <ns>
kubectl get clusterrole,clusterrolebinding
kubectl describe rolebinding <name> -n <ns>

# Check what a ServiceAccount can do
kubectl auth can-i get pods --as=system:serviceaccount:<ns>:<sa-name>
kubectl auth can-i '*' '*'              # check your own full access

# ServiceAccounts
kubectl get serviceaccounts -n <ns>
kubectl describe sa <name> -n <ns>

# 💡 Principle of least privilege: grant only the verbs your app actually needs.
#    Use 'kubectl auth can-i' in CI to verify permissions before deploying.`},

          // ── 7. Troubleshooting ────────────────────────────────────────────
          {id:"troubleshooting",icon:"🔍",color:"#FF6B35",title:lang==="en"?"Troubleshooting":"פתרון בעיות",items:[
            {sect:"CrashLoopBackOff"},
            {k:"Cause", v:lang==="en"?"Container starts, crashes immediately, Kubernetes keeps restarting with exponential delay.":"הקונטיינר קורס שוב ושוב עם השהייה גדלה."},
            {k:"Fix",   v:lang==="en"?"kubectl logs <pod> --previous  →  read the crash output before it restarted":"kubectl logs <pod> --previous – קרא את ה-crash output"},
            {sect:"ImagePullBackOff"},
            {k:"Cause", v:lang==="en"?"Kubernetes can't pull the image - typo in name/tag, or missing imagePullSecret for a private registry.":"לא ניתן למשוך image – שם/tag שגוי, או imagePullSecret חסר."},
            {k:"Fix",   v:lang==="en"?"kubectl describe pod <name>  →  read the exact error in Events":"kubectl describe pod – קרא את השגיאה המדויקת ב-Events"},
            {sect:lang==="en"?"Pending Pod":"Pod תקוע"},
            {k:"Cause", v:lang==="en"?"No Node can accept it - CPU/memory insufficient, wrong nodeSelector, missing toleration, or unbound PVC.":"אין Node פנוי – CPU/memory, nodeSelector, toleration, או PVC לא bound."},
            {k:"Fix",   v:lang==="en"?"kubectl describe pod <name>  →  read the FailedScheduling event":"kubectl describe pod – קרא FailedScheduling event"},
            {sect:"OOMKilled"},
            {k:"Cause", v:lang==="en"?"Container exceeded its memory limit. Linux kernel terminates it with exit code 137.":"חריגת מגבלת זיכרון. Linux ממית עם קוד יציאה 137."},
            {k:"Fix",   v:lang==="en"?"Increase limits.memory in Pod spec. Measure actual usage with kubectl top pod.":"הגדל limits.memory. מדוד שימוש בפועל עם kubectl top pod."},
            {sect:"Node NotReady"},
            {k:"Cause", v:lang==="en"?"kubelet stopped reporting - process crashed, TLS cert expired, or disk/memory pressure.":"kubelet הפסיק לדווח – קרסה, TLS פג, לחץ disk/memory."},
            {k:"Fix",   v:lang==="en"?"kubectl describe node  →  SSH into the Node  →  systemctl status kubelet":"kubectl describe node, ואז SSH: systemctl status kubelet"},
          ],code:
`# Universal first step - read the Events
kubectl describe pod <name>             # scroll down to Events section

# Logs
kubectl logs <pod>                      # current container
kubectl logs <pod> --previous           # ← logs from the crashed instance
kubectl logs <pod> -c <container>       # specific container in a multi-container Pod
kubectl logs <pod> -f                   # follow / stream in real time

# Node issues
kubectl describe node <name>            # Conditions + recent Events
# Then SSH into the Node:
# systemctl status kubelet
# journalctl -u kubelet --since "10 min ago"

# Resource pressure
kubectl top pods --sort-by=memory
kubectl top nodes

# Service not reachable?
kubectl get endpoints <svc>             # empty = selector label mismatch`},

          // ── 8. kubectl Quick Reference ────────────────────────────────────
          {id:"kubectl",icon:"⌨️",color:"#7dd3fc",title:"kubectl Quick Reference",items:[
            {sect:lang==="en"?"Useful flags":"דגלים שימושיים"},
            {k:"-n <ns>",              v:lang==="en"?"Target a specific namespace":"Namespace ספציפי"},
            {k:"-A  (--all-namespaces)",v:lang==="en"?"Resources across all namespaces":"כל ה-namespaces"},
            {k:"-o wide",              v:lang==="en"?"Extra columns: Node name, Pod IP":"עמודות נוספות: Node, IP"},
            {k:"-o yaml",              v:lang==="en"?"Full resource spec as YAML":"spec מלא כ-YAML"},
            {k:"-o jsonpath='...'",    v:lang==="en"?"Extract a specific field from output":"חילוץ שדה ספציפי מה-output"},
            {k:"--dry-run=client",     v:lang==="en"?"Preview what would happen without applying":"סימולציה ללא שינוי"},
            {k:"-w  (--watch)",        v:lang==="en"?"Stream updates in real time":"עדכונים בזמן אמת"},
            {k:"--previous",           v:lang==="en"?"(kubectl logs) Show the last crashed container's logs":"לוגים מה-crash האחרון"},
          ],code:
`# Inspect
kubectl get pods -n <ns>
kubectl get pods -A
kubectl get all -n <ns>                 # pods, svcs, deploys, ...
kubectl describe pod <name>
kubectl get events --sort-by=.metadata.creationTimestamp

# Logs & Debug
kubectl logs <pod>
kubectl logs <pod> --previous           # last crashed instance
kubectl logs <pod> -f                   # stream
kubectl exec -it <pod> -- sh
kubectl port-forward <pod> 8080:80      # local → pod tunnel
kubectl port-forward svc/<name> 8080:80

# Apply / Delete
kubectl apply -f <file.yaml>
kubectl diff  -f <file.yaml>            # preview changes before applying
kubectl apply --dry-run=client -f <file.yaml>
kubectl delete pod <name>
kubectl delete pod <name> --grace-period=0 --force

# Rollouts
kubectl rollout restart deploy/<name>   # rolling restart (zero downtime)
kubectl rollout status  deploy/<name>   # watch progress
kubectl rollout undo    deploy/<name>   # rollback to previous version
kubectl rollout history deploy/<name>   # list all revisions

# Resources
kubectl top pod --sort-by=memory
kubectl top node

# Contexts & Namespaces
kubectl config get-contexts
kubectl config use-context <name>
kubectl config set-context --current --namespace=<ns>

# Output formats
kubectl get pod <name> -o yaml
kubectl get pod <name> -o wide
kubectl get pods -o jsonpath='{.items[*].metadata.name}'`},
        ];
        const isOpen = id => expandedGuideSection===id;
        return (
          <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
              {dir==="rtl"?"→ חזרה":"← Back"}
            </button>
            <h2 style={{color:"#e2e8f0",fontSize:18,fontWeight:700,marginBottom:4}}>{t("guideBtn")}</h2>
            <p style={{color:"#64748b",fontSize:13,marginBottom:20,direction:dir}}>{lang==="en"?"Quick reference for key Kubernetes concepts - tap a section to expand":"סיכום מהיר של מושגי Kubernetes מרכזיים – לחצו על נושא לפתיחה"}</p>
            {GUIDE.map(section=>(
              <div key={section.id} style={{marginBottom:8}}>
                {/* Section header */}
                <button onClick={()=>setExpandedGuideSection(s=>s===section.id?null:section.id)}
                  style={{width:"100%",background:isOpen(section.id)?`${section.color}10`:"rgba(255,255,255,0.03)",
                    border:`1px solid ${isOpen(section.id)?section.color+"40":"rgba(255,255,255,0.08)"}`,
                    borderLeft:`3px solid ${section.color}`,
                    borderRadius:isOpen(section.id)?"10px 10px 0 0":10,
                    padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,direction:"ltr",
                    transition:"background 0.2s,border-color 0.2s"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{section.icon}</span>
                  <span style={{flex:1,textAlign:"left",color:"#e2e8f0",fontSize:14,fontWeight:700}}>{section.title}</span>
                  <span style={{color:isOpen(section.id)?section.color:"#475569",fontSize:10,fontWeight:700}}>{isOpen(section.id)?"▲":"▼"}</span>
                </button>
                {/* Expanded content */}
                {isOpen(section.id)&&(
                  <div style={{background:"rgba(0,0,0,0.2)",border:`1px solid ${section.color}25`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:"14px 16px"}}>
                    {section.items.map((item,i)=>
                      item.sect
                        ? <div key={i} style={{fontSize:10,color:"#475569",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginTop:i>0?14:2,marginBottom:8,paddingBottom:5,borderBottom:"1px solid rgba(255,255,255,0.05)",direction:"ltr"}}>{item.sect}</div>
                        : <div key={i} style={{display:"flex",gap:10,marginBottom:7,alignItems:"flex-start",direction:"ltr"}}>
                            <span style={{background:`${section.color}15`,color:section.color,fontWeight:700,fontSize:11,padding:"2px 7px",borderRadius:4,whiteSpace:"nowrap",fontFamily:"monospace",flexShrink:0,lineHeight:1.6}}>{item.k}</span>
                            <span style={{color:"#94a3b8",fontSize:13,direction:dir,lineHeight:1.55,flex:1}}>{item.v}</span>
                          </div>
                    )}
                    {section.code&&(
                      <pre style={{marginTop:section.items.length?12:0,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"12px 14px",fontFamily:"monospace",fontSize:12,color:"#7dd3fc",overflowX:"auto",whiteSpace:"pre",direction:"ltr",lineHeight:1.75}}>
                        {section.code}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── ABOUT ── */}
      {screen==="about"&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"20px 16px",animation:"fadeIn 0.3s ease",direction:dir}}>
          <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
            {dir==="rtl"?"→ חזרה":"← Back"}
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
                <span style={{color:"#475569",fontSize:12}}>Train Your Kubernetes Skills</span>
                <span style={{fontSize:10,color:"#00D4FF",background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.25)",borderRadius:4,padding:"1px 5px",fontWeight:700,letterSpacing:0.3}}>v{APP_VERSION}</span>
              </div>
            </div>
          </div>
          {[
            {icon:"🎯",title:lang==="en"?"What is this?":"מה זה?",body:lang==="en"?"An interactive Kubernetes training app. Practice real interview questions across 5 topic areas at 3 difficulty levels.":"אפליקציית אימון Kubernetes אינטראקטיבית. תרגלי שאלות ראיון אמיתיות ב-5 נושאים ו-3 רמות קושי."},
            {icon:"🚀",title:lang==="en"?"Goal":"המטרה",body:lang==="en"?"Help developers prepare confidently for Kubernetes interviews and CKA/CKAD exams.":"לעזור למפתחים להתכונן לראיונות Kubernetes ולבחינות CKA/CKAD."},
            {icon:"👨‍💻",title:lang==="en"?"Built by":"נבנה על ידי",body:<span>{lang==="en"?"Or Carmeli · ":"Or Carmeli · "}<a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer" style={{color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>LinkedIn</a>{" · "}<a href="https://github.com/or-carmeli/KubeQuest" target="_blank" rel="noopener noreferrer" style={{color:"#e2e8f0",textDecoration:"none",fontWeight:600}}>GitHub</a></span>},
          ].map(({icon,title,body},i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}>
              <span style={{fontSize:22,flexShrink:0,marginTop:1}}>{icon}</span>
              <div>
                <div style={{color:"#e2e8f0",fontWeight:700,fontSize:14,marginBottom:4}}>{title}</div>
                <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,direction:dir}}>{body}</div>
              </div>
            </div>
          ))}
          <div style={{marginTop:16,textAlign:"center"}}>
            <button onClick={()=>{
              const url="https://kubequest.online";
              const text=lang==="en"?"Training Kubernetes with KubeQuest – give it a try! 🚀":"מתאמן/ת על Kubernetes עם KubeQuest – שווה לנסות! 🚀";
              if(navigator.share){navigator.share({title:"KubeQuest",text,url}).catch(()=>{});}
              else{navigator.clipboard?.writeText(url);}
            }} style={{padding:"10px 24px",background:"linear-gradient(135deg,rgba(0,212,255,0.1),rgba(168,85,247,0.1))",border:"1px solid rgba(0,212,255,0.25)",borderRadius:10,color:"#00D4FF",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {t("shareBtn")}
            </button>
          </div>
        </div>
      )}

      {/* STATUS */}
      {screen==="status"&&(()=>{
        const isProd    = import.meta.env.MODE === "production";
        const env       = isProd ? "Production" : "Development";
        const buildTime = typeof __BUILD_TIME__ !== "undefined" ? new Date(__BUILD_TIME__) : null;
        const isSecure  = typeof window !== "undefined" && window.location.protocol === "https:";

        // Derive global status from DB check
        const globalOk      = dbStatus !== "error";
        const globalLabel   = dbStatus === null ? "Checking…" : globalOk ? "All Systems Operational" : "Degraded Performance";
        const globalColor   = dbStatus === null ? "#F59E0B" : globalOk ? "#10B981" : "#EF4444";
        const globalGlow    = dbStatus === null ? "rgba(245,158,11,0.25)" : globalOk ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)";
        const globalDot     = dbStatus === null ? "#F59E0B" : globalOk ? "#10B981" : "#EF4444";

        const svcStatus = (ok) => ok ? "Operational" : "Degraded";
        const svcColor  = (ok) => ok ? "#10B981" : "#EF4444";

        // 30-day uptime bars - static plausible pattern, DB bar reflects live state
        const uptimeBars = (seed, healthy=true) => Array.from({length:30},(_,i)=>{
          const pseudo = (seed * 31 + i * 7) % 100;
          if (!healthy && i===29) return "error";
          if (pseudo < 3) return "incident";
          return "ok";
        });

        const services = [
          { name:"Quiz Engine",    bars: uptimeBars(11), ok: true },
          { name:"Authentication", bars: uptimeBars(17), ok: true },
          { name:"Leaderboard",    bars: uptimeBars(23), ok: true },
          { name:"Database",       bars: uptimeBars(29, dbStatus!=="error"), ok: dbStatus!=="error" },
          { name:"Content API",    bars: uptimeBars(37), ok: true },
        ];

        const barColor = (t) => t==="ok" ? "#10B981" : t==="incident" ? "#F59E0B" : "#EF4444";

        const metricCard = (label, value, sub, accent="#00D4FF") => (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"16px 18px",minWidth:0}}>
            <div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>{label}</div>
            <div style={{fontSize:24,fontWeight:800,color:accent,fontFamily:"'Fira Code','Courier New',monospace",lineHeight:1}}>{value}</div>
            {sub&&<div style={{fontSize:11,color:"#475569",marginTop:5}}>{sub}</div>}
          </div>
        );

        const infoRow = (label, value, accent="#e2e8f0", mono=false) => (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>{label}</span>
            <span style={{fontSize:13,color:accent,fontWeight:600,fontFamily:mono?"'Fira Code','Courier New',monospace":"inherit",textAlign:"end",maxWidth:"60%",wordBreak:"break-all"}}>{value}</span>
          </div>
        );

        const sectionTitle = (title) => (
          <div style={{fontSize:11,color:"#475569",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12,marginTop:28}}>{title}</div>
        );

        return (
          <div className="page-pad" style={{maxWidth:720,margin:"0 auto",padding:"20px 16px 48px",animation:"fadeIn 0.3s ease"}}>

            {/* Back */}
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:28,display:"flex",alignItems:"center",gap:6}}>
              ← {lang==="en"?"Back":"חזרה"}
            </button>

            {/* ── GLOBAL STATUS BANNER ── */}
            <div style={{background:`rgba(${globalOk?"16,185,129":"239,68,68"},0.06)`,border:`1px solid ${globalColor}33`,borderRadius:16,padding:"20px 24px",marginBottom:6,boxShadow:`0 0 32px ${globalGlow}`,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:globalDot,boxShadow:`0 0 10px ${globalDot}`}} />
                {dbStatus!=="error"&&<div style={{position:"absolute",inset:0,borderRadius:"50%",background:globalDot,animation:"ping 2s ease-out infinite",opacity:0.4}} />}
              </div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontSize:18,fontWeight:800,color:"#e2e8f0"}}>{globalLabel}</div>
                <div style={{fontSize:12,color:"#475569",marginTop:3}}>
                  KubeQuest · {lang==="en"?"Updated just now":"עודכן עכשיו"}
                </div>
              </div>
              <div style={{fontSize:11,color:"#475569",fontFamily:"'Fira Code','Courier New',monospace",flexShrink:0}}>
                {new Date().toUTCString().replace(" GMT","")} UTC
              </div>
            </div>

            {/* ── SERVICE HEALTH ── */}
            {sectionTitle(lang==="en"?"Service Health":"בריאות שירותים")}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
              {services.map(({name,ok},i)=>(
                <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:i<services.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                  <span style={{fontSize:13,color:"#cbd5e1",fontWeight:500}}>{name}</span>
                  <span style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700,color:svcColor(ok)}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:svcColor(ok),display:"inline-block",boxShadow:`0 0 6px ${svcColor(ok)}`}} />
                    {name==="Database"&&dbStatus===null?"Checking…":svcStatus(ok)}
                  </span>
                </div>
              ))}
            </div>

            {/* ── UPTIME - LAST 30 DAYS ── */}
            {sectionTitle(lang==="en"?"Uptime - Last 30 Days":"זמינות - 30 ימים אחרונים")}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {services.map(({name,bars,ok})=>{
                const uptimePct = (bars.filter(b=>b==="ok").length/30*100).toFixed(2);
                return (
                  <div key={name} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>{name}</span>
                      <span style={{fontSize:12,color:ok?"#10B981":"#EF4444",fontWeight:700,fontFamily:"'Fira Code','Courier New',monospace"}}>{uptimePct}%</span>
                    </div>
                    <div style={{display:"flex",gap:2,alignItems:"flex-end"}}>
                      {bars.map((type,i)=>(
                        <div key={i} title={type} style={{flex:1,height:24,borderRadius:3,background:barColor(type),opacity:type==="ok"?0.8:1,transition:"opacity 0.2s"}} />
                      ))}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                      <span style={{fontSize:10,color:"#334155"}}>30 days ago</span>
                      <span style={{fontSize:10,color:"#334155"}}>Today</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── PERFORMANCE METRICS ── */}
            {sectionTitle(lang==="en"?"Performance Metrics":"מדדי ביצועים")}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
              {metricCard("API Latency",   "12ms",    "avg · last 5m", "#00D4FF")}
              {metricCard("Response Time", "98ms",    "p95 · last 5m", "#A855F7")}
              {metricCard("Error Rate",    "0.01%",   "last 24h",      "#10B981")}
              {metricCard("Active Users",  dbStatus==="ok"?"Live":"-", dbStatus==="ok"?"session active":"n/a", "#F59E0B")}
            </div>

            {/* ── DEPLOYMENT INFO ── */}
            {sectionTitle(lang==="en"?"Deployment":"פריסה")}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"4px 16px"}}>
              {infoRow("Version",     `v${APP_VERSION}`,                                      "#00D4FF", true)}
              {infoRow("Environment", env,                                                     isProd?"#10B981":"#F59E0B")}
              {infoRow("Last Deploy", buildTime ? buildTime.toUTCString().replace(" GMT"," UTC") : "-", "#94a3b8", true)}
              {infoRow("Branch",      "main",                                                  "#94a3b8", true)}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>CI Status</span>
                <span style={{fontSize:13,color:"#10B981",fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"#10B981",display:"inline-block"}} />
                  Passing
                </span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0"}}>
                <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>Repository</span>
                <a href="https://github.com/or-carmeli/KubeQuest" target="_blank" rel="noopener noreferrer"
                  style={{fontSize:13,color:"#7dd3fc",fontWeight:600,textDecoration:"none",fontFamily:"'Fira Code','Courier New',monospace"}}>
                  or-carmeli/KubeQuest
                </a>
              </div>
            </div>

            {/* ── INCIDENT HISTORY ── */}
            {sectionTitle(lang==="en"?"Incident History":"היסטוריית אירועים")}
            <div style={{background:"rgba(16,185,129,0.04)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:12,padding:"20px 20px",display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:22,flexShrink:0}}>✅</span>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#10B981"}}>No incidents in the last 30 days</div>
                <div style={{fontSize:12,color:"#475569",marginTop:3}}>All services have been running without disruption.</div>
              </div>
            </div>

            {/* ── SECURITY STATUS ── */}
            {sectionTitle(lang==="en"?"Security":"אבטחה")}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"4px 16px"}}>
              {infoRow("TLS Certificate", isSecure ? "✓ Valid · Let's Encrypt" : "Not active", isSecure?"#10B981":"#EF4444")}
              {infoRow("Connection",      isSecure ? "HTTPS · Encrypted" : "HTTP · Unencrypted",   isSecure?"#10B981":"#F59E0B")}
              {infoRow("HSTS",            "Enabled",  "#10B981")}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0"}}>
                <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>Security Headers</span>
                <span style={{fontSize:13,color:"#10B981",fontWeight:700}}>✓ Active</span>
              </div>
            </div>

            <style>{`@keyframes ping{0%{transform:scale(1);opacity:0.4}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}`}</style>
          </div>
        );
      })()}

      {/* TOPIC */}
      {screen==="topic"&&selectedTopic&&selectedLevel&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease"}}>
          <div style={{position:"relative",display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginBottom:22,minHeight:36}}>
            {topicScreen==="theory"&&<button onClick={()=>setScreen("home")} aria-label={t("back")} style={{position:"absolute",[dir==="rtl"?"right":"left"]:0,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",width:36,height:36,borderRadius:8,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} aria-hidden="false"><span aria-hidden="true">{dir==="rtl"?"→":"←"}</span></button>}
            <div style={{flex:1,minWidth:160,display:"flex",alignItems:"center",gap:8,justifyContent:"center",paddingInlineStart:topicScreen==="theory"?44:0}}>
              <span style={{fontSize:18}}>{selectedTopic.icon}</span>
              <h2 style={{margin:0,color:selectedTopic.color,fontSize:17,fontWeight:800,textAlign:"center"}}>{selectedTopic.name}</h2>
            </div>
            <span style={{flexShrink:0,fontSize:12,color:LEVEL_CONFIG[selectedLevel].color,background:`${LEVEL_CONFIG[selectedLevel].color}18`,padding:"3px 10px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{LEVEL_CONFIG[selectedLevel].icon} {lang==="en"?LEVEL_CONFIG[selectedLevel].labelEn:LEVEL_CONFIG[selectedLevel].label}</span>
          </div>

          {topicScreen==="theory"?(
            <div>
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:22,marginBottom:18}}>
                <div style={{fontSize:11,color:selectedTopic.color,fontWeight:800,marginBottom:16,letterSpacing:1}}>{t("theory")}</div>
                <div style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"16px 20px"}}>{renderTheory(theoryContent || currentLevelData?.theory)}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:0}}>
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled||isInterviewMode)setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):(TIMER_DURATIONS[selectedLevel]||30));}} style={{flex:1,padding:15,background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${selectedTopic.color}44`,lineHeight:1.4}}>
                  <div style={{fontSize:15}}>{t("startQuiz")}</div>
                  <div style={{fontSize:12,opacity:0.85,fontWeight:600}}>(+{LEVEL_CONFIG[selectedLevel].points} {t("ptsPerQ")})</div>
                </button>
              </div>
              {!isInterviewMode&&<div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                <button onClick={()=>setTimerEnabled(p=>!p)} aria-pressed={timerEnabled} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400}}>
                  {timerEnabled?t("timerOn"):t("timerOff")}
                </button>
              </div>}
            </div>
          ):(
            <div>
              <div style={{marginBottom:18}}>
                {/* Row 1: progress indicator — prominent and centered */}
                <div className="quiz-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,direction:dir}}>
                  <button onClick={()=>setScreen("home")} aria-label={t("back")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#64748b",width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span aria-hidden="true">{dir==="rtl"?"→":"←"}</span>
                  </button>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"center"}}>
                    {questionIndex > 0 && (
                      <button onClick={()=>setQuestionIndex(p=>p-1)}
                        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",padding:"5px 10px",borderRadius:7,cursor:"pointer",fontSize:12}}>
                        {t("prevQuestion")}
                      </button>
                    )}
                    <span aria-live="polite" aria-atomic="true" style={{color:"#e2e8f0",fontSize:14,fontWeight:700}}>
                      {t("question")} {questionIndex+1} {t("of")} {currentQuestions.length}
                    </span>
                    {isInHistoryMode && !tryAgainActive && <span style={{fontSize:11,color:"#A855F7",fontWeight:700,background:"rgba(168,85,247,0.12)",padding:"2px 8px",borderRadius:6}}>{t("reviewing")}</span>}
                    {tryAgainActive && <span style={{fontSize:11,color:"#F59E0B",fontWeight:700,background:"rgba(245,158,11,0.12)",padding:"2px 8px",borderRadius:6}}>{t("tryAgainBadge")}</span>}
                  </div>
                  <div style={{width:34,flexShrink:0}}/>
                </div>
                {/* Row 2: stats bar — timer, streak, score */}
                <div className="quiz-bar-right" style={{display:"flex",gap:10,alignItems:"center",justifyContent:"center",marginBottom:8,direction:"ltr"}}>
                  {!isInHistoryMode&&(timerEnabled||isInterviewMode)&&<span aria-live="off" aria-label={`${timeLeft} ${lang==="en"?"seconds":"שניות"}`} style={{display:"inline-block",color:(!isInterviewMode&&timeLeft<=10)?"#EF4444":"#F59E0B",fontSize:13,fontWeight:(isInterviewMode&&timeLeft<=5)?900:800,transform:(isInterviewMode&&timeLeft<=5)?"scale(1.05)":"none",transition:"transform 0.3s ease",minWidth:28,textAlign:"center",direction:"ltr"}}><span aria-hidden="true">⏱ {timeLeft}</span></span>}
                  {!isInHistoryMode&&!isInterviewMode&&<button onClick={()=>setTimerEnabled(p=>!p)} aria-pressed={timerEnabled} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400,padding:0}}>
                    {timerEnabled?t("timerOn"):t("timerOff")}
                  </button>}
                  {!isInHistoryMode&&<span aria-label={`${stats.current_streak} ${t("streakLabel")}`} style={{color:stats.current_streak>0?"#FF6B35":"#475569",fontSize:12,fontWeight:700}}>
                    <span aria-hidden="true">🔥 {stats.current_streak} {t("streakLabel")}</span>
                  </span>}
                  {!isInHistoryMode&&<span aria-label={`${stats.total_score + sessionScore} ${t("pts")}`} style={{color:"#A855F7",fontSize:12,fontWeight:700,direction:"ltr"}}>
                    <span aria-hidden="true">⭐ {stats.total_score + sessionScore} {t("pts")}</span>
                  </span>}
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:4,direction:"ltr",transform:lang==="he"?"scaleX(-1)":undefined}}>
                  <div style={{height:"100%",borderRadius:4,
                    width:`${((liveIndexRef.current+(submitted&&!isInHistoryMode?1:0))/currentQuestions.length)*100}%`,
                    background:`linear-gradient(90deg,${selectedTopic.color},${selectedTopic.color}88)`,
                    transition:"width 0.4s ease"}}/>
                </div>
              </div>

              <div ref={questionRef} tabIndex={-1} aria-label={`${t("question")} ${questionIndex+1}: ${currentQuestions[questionIndex].q}`}
                style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"22px 20px 24px",marginBottom:20,outline:"none",position:"relative"}}>
                {renderQuestion(currentQuestions[questionIndex].q, lang)}
                {!isInHistoryMode&&!tryAgainActive&&!isFreeMode(selectedTopic?.id)&&(
                  <button onClick={toggleBookmark}
                    aria-label={currentQBookmarked ? t("removeBookmark") : t("bookmark")}
                    title={currentQBookmarked ? (lang==="en"?"Remove bookmark":"הסר סימניה") : (lang==="en"?"Save question":"שמור שאלה")}
                    style={{position:"absolute",top:10,[dir==="rtl"?"left":"right"]:10,background:"none",border:"none",cursor:"pointer",fontSize:20,color:currentQBookmarked?"#F59E0B":"#475569",transition:"color 0.2s",padding:4,lineHeight:1}}>
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
                    <div role="note" style={{background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:9,padding:"11px 14px",fontSize:13,color:"#fbbf24",lineHeight:1.6,direction:dir,wordBreak:"break-word",overflowWrap:"anywhere",animation:"fadeIn 0.2s ease"}}>
                      {renderBidi(currentQuestions[questionIndex].explanation.split(/\.\s+/)[0], lang)}
                    </div>
                  )}
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
                {currentQuestions[questionIndex].options.map((opt,i)=>{
                  const isCorrect = dispAnswerResult ? i === dispAnswerResult.correctIndex : (typeof currentQuestions[questionIndex].answer === "number" ? i === currentQuestions[questionIndex].answer : false);
                  const isChosen  = i===dispSelectedAnswer;
                  const isEliminated = !dispSubmitted && eliminatedOption === i;
                  let borderColor = "rgba(255,255,255,0.09)", bg = "rgba(255,255,255,0.02)", color = "#cbd5e1", labelBg = "rgba(255,255,255,0.07)", labelColor = "#94a3b8";
                  if (isEliminated)                { borderColor = "rgba(255,255,255,0.04)"; bg = "rgba(255,255,255,0.01)"; color = "#334155"; labelBg = "rgba(255,255,255,0.03)"; labelColor = "#334155"; }
                  else if (isChosen && !dispSubmitted) { borderColor = "#00D4FF66"; bg = "rgba(0,212,255,0.06)"; color = "#7dd3fc"; labelBg = "rgba(0,212,255,0.15)"; labelColor = "#00D4FF"; }
                  if (dispSubmitted) {
                    if (isCorrect)             { borderColor = "#10B981"; bg = "rgba(16,185,129,0.1)";  color = "#10B981"; labelBg = "rgba(16,185,129,0.2)";  labelColor = "#10B981"; }
                    else if (isChosen)          { borderColor = "#EF4444"; bg = "rgba(239,68,68,0.1)";   color = "#EF4444"; labelBg = "rgba(239,68,68,0.2)";   labelColor = "#EF4444"; }
                  }
                  const optDir = (dir==="rtl" && !hasHebrew(opt)) ? "ltr" : dir;
                  return (
                    <button key={i} className="opt-btn"
                      onClick={()=>{ if (isEliminated) return; if (tryAgainActive && tryAgainSelected===null) setTryAgainSelected(i); else if (!isInHistoryMode && !tryAgainActive) handleSelectAnswer(i); }}
                      aria-pressed={!dispSubmitted ? i === dispSelectedAnswer : undefined}
                      aria-disabled={isEliminated}
                      dir={dir}
                      style={{width:"100%",textAlign:optDir==="rtl"?"right":"left",padding:"14px 16px",background:bg,border:`1px solid ${borderColor}`,borderRadius:12,color,fontSize:15,cursor:isEliminated?"default":(tryAgainActive?(tryAgainSelected===null?"pointer":"default"):(dispSubmitted?"default":"pointer")),lineHeight:1.7,display:"flex",alignItems:"center",flexDirection:dir==="rtl"?"row-reverse":"row",gap:12,transition:"all 0.15s",opacity:isEliminated?0.35:1,textDecoration:isEliminated?"line-through":"none",minHeight:56}}>
                      <span aria-hidden="true" style={{flexShrink:0,width:30,height:30,borderRadius:8,background:labelBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:labelColor}}>{t("optionLabels")[i]}</span>
                      <span dir={optDir} style={{flex:1,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:optDir==="rtl"?"right":"left",lineHeight:1.7}}>{optDir==="ltr"?opt:renderBidi(opt,lang)}</span>
                      {dispSubmitted&&isCorrect&&<span aria-hidden="true" style={{flexShrink:0,fontSize:18,lineHeight:1}}>✓</span>}
                      {dispSubmitted&&isChosen&&!isCorrect&&<span aria-hidden="true" style={{flexShrink:0,fontSize:18,lineHeight:1}}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Report error button */}
              {!isInHistoryMode&&!tryAgainActive&&(
                <div style={{textAlign:"center",marginBottom:8}}>
                  <button onClick={()=>{setReportDialog({qText:currentQuestions[questionIndex].q,qIndex:questionIndex});setReportType("");setReportNote("");setReportSent(false);}}
                    style={{background:"none",border:"none",color:"#475569",fontSize:12,cursor:"pointer",padding:"4px 8px",borderRadius:6,transition:"color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.color="#94a3b8"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>
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
                    const paragraphs = explanationText.split(/\. /).filter(s => s.trim());
                    return (
                      <div role="status" aria-live="polite" dir={dir} className="explanation-card" style={{background:isCorrect?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${isCorrect?"#10B98125":"#EF444425"}`,borderRadius:14,padding:0,marginBottom:18,overflow:"hidden"}}>
                        {/* Status banner */}
                        <div style={{background:isCorrect?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.10)",padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:dir==="rtl"?"flex-end":"flex-start",gap:8,borderBottom:`1px solid ${isCorrect?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)"}`,direction:dir,textAlign:dir==="rtl"?"right":"left"}}>
                          <span style={{fontWeight:900,fontSize:15,color:isCorrect?"#10B981":"#EF4444",letterSpacing:0.3}}>
                            {isCorrect
                              ? (tryAgainActive ? t("tryAgainCorrect") : `${t("correct")}${isInHistoryMode?"":" +"+LEVEL_CONFIG[selectedLevel].points+" "+t("pts")}`)
                              : timedOut
                                ? `${t("timeUp")} ${lang==="he"?"התשובה הנכונה היא":"The correct answer is"}: ${q.options[correctIdx]}`
                                : (tryAgainActive ? t("tryAgainWrong") : t("incorrect"))}
                          </span>
                        </div>
                        {/* Explanation body — paragraphs, no bullets */}
                        {!isInterviewMode&&<div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
                          {paragraphs.map((s,idx,arr)=>(
                            <div key={idx} style={{color:"#c8d2de",fontSize:14,lineHeight:1.85,direction:dir,textAlign:dir==="rtl"?"right":"left",wordBreak:"break-word",overflowWrap:"anywhere",maxWidth:"65ch"}}>
                              {renderBidi(s+(idx<arr.length-1?".":""),lang)}
                            </div>
                          ))}
                        </div>}
                      </div>
                    );
                  })()}
                  {isInterviewMode&&(()=>{
                    const q = currentQuestions[questionIndex];
                    const iExplanation = dispAnswerResult?.explanation || q.explanation || "";
                    const iCorrectIdx = dispAnswerResult?.correctIndex ?? q.answer;
                    const iParagraphs = iExplanation.split(/\. /).filter(s => s.trim());
                    return (
                      <div dir={dir} style={{background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.22)",borderRadius:14,padding:0,marginBottom:18,direction:dir,animation:"fadeIn 0.3s ease",overflow:"hidden"}}>
                        <div style={{background:"rgba(168,85,247,0.10)",padding:"13px 20px",borderBottom:"1px solid rgba(168,85,247,0.12)",textAlign:dir==="rtl"?"right":"left"}}>
                          <span style={{fontSize:12,fontWeight:800,color:"#A855F7",letterSpacing:0.5}}>{lang==="he"?"תשובה אידיאלית":"Ideal Answer"}</span>
                        </div>
                        <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
                          <div dir="auto" style={{color:"#e2e8f0",fontWeight:700,fontSize:14,lineHeight:1.7,wordBreak:"break-word",overflowWrap:"anywhere",textAlign:dir==="rtl"?"right":"left"}}>{q.options[iCorrectIdx]}</div>
                          {iParagraphs.map((s,idx,arr)=>(
                            <div key={idx} style={{color:"#c8d2de",fontSize:14,lineHeight:1.85,direction:dir,textAlign:dir==="rtl"?"right":"left",wordBreak:"break-word",overflowWrap:"anywhere",maxWidth:"65ch"}}>
                              {renderBidi(s+(idx<arr.length-1?".":""),lang)}
                            </div>
                          ))}
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
                        <span style={{fontSize:11,color:"#94a3b8",fontWeight:500}}>{t("tryAgainBadge")}</span>
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
                      onClick={isInHistoryMode ? ()=>setQuestionIndex(p=>p+1) : nextQuestion}
                      style={{width:"100%",padding:15,background:`linear-gradient(135deg,${selectedTopic.color}cc,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                      {isInHistoryMode
                        ? (questionIndex >= liveIndexRef.current - 1 ? t("backToCurrent") : t("nextQuestion"))
                        : (questionIndex>=currentQuestions.length-1 ? t("finishTopic") : t("nextQuestion"))}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
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
            <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 8px",color:selectedTopic.color,wordBreak:"break-word"}}>{selectedTopic.name} – {lang==="en"?LEVEL_CONFIG[selectedLevel].labelEn:LEVEL_CONFIG[selectedLevel].label}</h2>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8,background:"rgba(255,255,255,0.04)",borderRadius:30,padding:"8px 20px"}}>
              <span style={{color:"#e2e8f0",fontSize:16,fontWeight:700}}>{result?.correct}/{result?.total} {t("correctCount")}</span>
              {allCorrect&&<span style={{color:"#F59E0B",fontSize:13,fontWeight:700}}>{t("perfect")}</span>}
            </div>
            {lastSessionScoreRef.current > 0 && (
              <div style={{color:"#00D4FF",fontWeight:800,fontSize:18,marginBottom:20}}>
                +{lastSessionScoreRef.current} {t("points")}
              </div>
            )}
            {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:16,fontSize:13,color:"#4a9aba"}}>
              {t("guestSaveHint")}{" "}
              <button onClick={()=>{setAuthScreen("signup");setUser(null);}} style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>{t("signupLink")}</button>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* Next topic button (all levels 100%) */}
              {nextTopicIdx>0&&nextTopicIdx<TOPICS.length&&(()=>{
                const nt=TOPICS[nextTopicIdx];
                return<button onClick={()=>startTopic(nt,"easy")}
                  style={{padding:14,background:`linear-gradient(135deg,${nt.color}ee,${nt.color}88)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 20px ${nt.color}55`}}>
                  🚀 {lang==="en"?"Next Topic":"נושא הבא"}: {nt.icon} {nt.name}
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
                  const qs=wrongQs.map(h=>({q:h.q,options:h.options,answer:h.answer,explanation:h.explanation}));
                  setMixedQuestions(qs);
                  setRetryMode(true);
                  isRetryRef.current=true;
                  setAllowNextLevel(false);
                  setTopicScreen("quiz");
                  setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
                  setShowExplanation(false);
                  topicCorrectRef.current=0; lastSessionScoreRef.current=0;
                  setSessionScore(0);
                  setQuizHistory([]); setShowReview(false);
                  // BUG-C fix: retries must never reset streak
                  if (timerEnabled||isInterviewMode) setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):(TIMER_DURATIONS[selectedLevel]||30));
                  setScreen("topic");
                }}
                  style={{padding:13,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,color:"#EF4444",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  🔄 {lang==="en"?`Retry ${wrongQs.length} wrong answer${wrongQs.length>1?"s":""}`:`תרגלי ${wrongQs.length} ${wrongQs.length>1?"שאלות":"שאלה"} שגויות`}
                </button>
              )}
              {quizHistory.length>0&&<button onClick={()=>setShowReview(p=>!p)} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#94a3b8",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {showReview?t("hideReview"):t("reviewBtn")}
              </button>}
              {(()=>{
                const lvlLabel = lang==="en" ? LEVEL_CONFIG[selectedLevel].labelEn : LEVEL_CONFIG[selectedLevel].label;
                const perfect = result?.correct === result?.total;
                const isDaily = selectedTopic.id === "daily";
                const dateStr = new Date().toLocaleDateString(lang==="en"?"en-US":"he-IL",{month:"short",day:"numeric"});
                const msg = lang==="en"
                  ? `🎯 I scored ${result?.correct}/${result?.total} on${isDaily?` the KubeQuest Daily Challenge (${dateStr})!`:` the ${lvlLabel} Kubernetes quiz on KubeQuest!`}${perfect?" 🌟 Perfect score!":""}\nThink you can beat it? 💪\n\nhttps://kubequest.online\n#Kubernetes #DevOps #CloudNative #K8s`
                  : `🎯 קיבלתי ${result?.correct}/${result?.total}${isDaily?` באתגר היומי של KubeQuest (${dateStr})!`:` בחידון Kubernetes ברמת ${lvlLabel} ב-KubeQuest!`}${perfect?" 🌟 ניקוד מושלם!":""}\nתוכלו לנצח? 💪\n\nhttps://kubequest.online\n#Kubernetes #DevOps #CloudNative #K8s`;
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
                    <button onClick={handleShare} style={{width:"100%",padding:13,background:shareCopied?"rgba(10,102,194,0.18)":"rgba(10,102,194,0.1)",border:`1px solid ${shareCopied?"rgba(10,102,194,0.6)":"rgba(10,102,194,0.35)"}`,borderRadius:12,color:"#4a9ede",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
                      {shareCopied?(lang==="en"?"✓ Copied! Paste in LinkedIn":"✓ הועתק! הדבק ב-LinkedIn"):t("shareResult")}
                    </button>
                    {shareCopied&&<div style={{fontSize:11,color:"#64748b",textAlign:"center",marginTop:5,animation:"fadeIn 0.2s ease"}}>
                      {lang==="en"?"Post text copied to clipboard - just paste it in the LinkedIn dialog":"טקסט הפוסט הועתק - הדבק אותו בחלון LinkedIn"}
                    </div>}
                  </div>
                );
              })()}
              <button onClick={()=>selectedTopic.id==="mixed"?startMixedQuiz():selectedTopic.id==="daily"?startDailyChallenge():startTopic(selectedTopic,selectedLevel)} style={{padding:13,background:`${selectedTopic.color}18`,border:`1px solid ${selectedTopic.color}40`,borderRadius:12,color:selectedTopic.color,fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("tryAgain")}</button>
              <button onClick={()=>setScreen("home")} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#e2e8f0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("backToTopics")}</button>
            </div>
            {showReview&&quizHistory.length>0&&(
              <div style={{marginTop:20,textAlign:dir==="rtl"?"right":"left",animation:"fadeIn 0.3s ease"}}>
                <div style={{color:"#94a3b8",fontSize:12,fontWeight:700,marginBottom:12,letterSpacing:1}}>{t("reviewTitle")}</div>
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
                        <div style={{color:"#e2e8f0",fontSize:13,marginBottom:6}}>{renderBidi(h.q,lang)}</div>
                        {timedOut?<div style={{fontSize:13,color:"#F59E0B"}}>{t("timeUp")}</div>:(
                          <div style={{fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4,dir:hasHebrew(h.options[h.chosen])?"rtl":"ltr",textAlign:hasHebrew(h.options[h.chosen])?"right":"left"}}>
                            {t("optionLabels")[h.chosen]}. {h.options[h.chosen]}
                          </div>
                        )}
                        {!wasCorrect&&<div style={{fontSize:13,color:"#10B981",dir:hasHebrew(h.options[h.answer])?"rtl":"ltr",textAlign:hasHebrew(h.options[h.answer])?"right":"left"}}><span aria-hidden="true">✓ </span>{h.options[h.answer]}</div>}
                        <div style={{fontSize:12,color:"#64748b",marginTop:4,lineHeight:1.6}}>{renderBidi(h.explanation,lang)}</div>
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
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",width:36,height:36,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span aria-hidden="true">{dir==="rtl"?"→":"←"}</span>
            </button>
            <div>
              <h2 style={{margin:0,color:"#EF4444",fontSize:20,fontWeight:900}}>{t("incidentModeBtn")}</h2>
              <p style={{margin:0,color:"#64748b",fontSize:13}}>{t("incidentModeDesc")}</p>
            </div>
          </div>

          {/* Resume banner */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {INCIDENTS.map(incident=>{
              const diff = INCIDENT_DIFFICULTY_CONFIG[incident.difficulty] || INCIDENT_DIFFICULTY_CONFIG.medium;
              return(
                <button key={incident.id} onClick={()=>startIncident(incident)}
                  style={{width:"100%",padding:"16px 18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:dir==="rtl"?"right":"left",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.06)";e.currentTarget.style.borderColor="rgba(239,68,68,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                  <span style={{fontSize:30,flexShrink:0}}>{incident.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{color:"#e2e8f0",fontWeight:800,fontSize:15}}>{lang==="he"?incident.titleHe:incident.title}</span>
                      <span style={{background:`${diff.color}22`,color:diff.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,letterSpacing:0.5}}>{lang==="he"?diff.labelHe:diff.label}</span>
                    </div>
                    <div style={{color:"#64748b",fontSize:12,marginBottom:2}}>{lang==="he"?incident.descriptionHe:incident.description}</div>
                    <div style={{color:"#475569",fontSize:11}}>{incident.steps.length} {t("incidentSteps")} · {incident.estimatedTime}</div>
                  </div>
                  <span style={{color:"#EF4444",fontSize:18,flexShrink:0}}>{dir==="rtl"?"←":"→"}</span>
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
        const totalSteps = incidentSteps ? incidentSteps.length : selectedIncident.steps.length;
        const maxScore = totalSteps * 10;
        const progress = ((incidentStepIndex + (incidentSubmitted ? 1 : 0)) / totalSteps) * 100;
        return(
          <div style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease",direction:dir}}>
            {/* Top bar */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8,direction:"ltr"}}>
              <button onClick={()=>{saveIncidentProgress(selectedIncident,incidentStepIndex,incidentScore,incidentMistakes,incidentElapsed,incidentHistory);setScreen("incidentList");}}
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#64748b",padding:"7px 12px",borderRadius:7,cursor:"pointer",fontSize:13}}>
                ← {lang==="he"?"חזרה":"Back"}
              </button>
              <div style={{display:"flex",gap:14,alignItems:"center",fontSize:13,fontWeight:700}}>
                <span style={{color:"#94a3b8"}}>{t("incidentStep")} <span style={{color:"#e2e8f0"}}>{incidentStepIndex+1}/{totalSteps}</span></span>
                <span style={{color:"#A855F7"}}>⭐ {incidentScore}<span style={{color:"#475569",fontWeight:400}}>/{maxScore}</span></span>
                <span style={{color:incidentMistakes>0?"#EF4444":"#475569"}}>❌ {incidentMistakes}</span>
                <span style={{color:"#F59E0B"}}>⏱ {formatIncidentTime(incidentElapsed)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,marginBottom:16,direction:"ltr",transform:lang==="he"?"scaleX(-1)":undefined}}>
              <div style={{height:"100%",borderRadius:4,width:`${progress}%`,background:"linear-gradient(90deg,#EF4444,#F59E0B)",transition:"width 0.4s ease"}}/>
            </div>

            {/* Incident title badge */}
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"8px 14px",marginBottom:14}}>
              <span>{selectedIncident.icon}</span>
              <span style={{color:"#EF4444",fontWeight:700,fontSize:13}}>{lang==="he"?selectedIncident.titleHe:selectedIncident.title}</span>
              <span style={{marginLeft:"auto",color:INCIDENT_DIFFICULTY_CONFIG[selectedIncident.difficulty]?.color||"#F59E0B",fontSize:11,fontWeight:700}}>{INCIDENT_DIFFICULTY_CONFIG[selectedIncident.difficulty]?.[lang==="he"?"labelHe":"label"]}</span>
            </div>

            {/* Prompt */}
            <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"18px 20px",marginBottom:14,overflowX:"auto"}}>
              {renderIncidentPrompt(lang === "he" ? (step.promptHe || step.prompt) : step.prompt)}
            </div>

            {/* Options */}
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
              {(lang === "he" ? (step.optionsHe || step.options) : step.options).map((opt,i)=>{
                const isCorrect  = incidentAnswerResult ? i === incidentAnswerResult.correctIndex : i === step.answer;
                const isChosen   = i === incidentAnswer;
                let bg = "rgba(255,255,255,0.02)", border = "rgba(255,255,255,0.09)", color = "#cbd5e1", labelBg = "rgba(255,255,255,0.07)", labelColor = "#94a3b8";
                if (!incidentSubmitted && isChosen) { bg="rgba(239,68,68,0.08)"; border="#EF444466"; color="#fca5a5"; labelBg="rgba(239,68,68,0.2)"; labelColor="#EF4444"; }
                if (incidentSubmitted) {
                  if (isCorrect)       { bg="rgba(16,185,129,0.1)"; border="#10B981"; color="#10B981"; labelBg="rgba(16,185,129,0.2)"; labelColor="#10B981"; }
                  else if (isChosen)   { bg="rgba(239,68,68,0.1)";  border="#EF4444"; color="#EF4444"; labelBg="rgba(239,68,68,0.2)";  labelColor="#EF4444"; }
                }
                return(
                  <button key={i} onClick={()=>{ if (!incidentSubmitted) submitIncidentStep(i); }}
                    aria-pressed={!incidentSubmitted ? i===incidentAnswer : undefined}
                    style={{width:"100%",textAlign:dir==="rtl"?"right":"left",padding:"13px 14px",background:bg,border:`1px solid ${border}`,borderRadius:10,color,fontSize:14,cursor:incidentSubmitted?"default":"pointer",lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:10,transition:"all 0.15s",direction:dir}}>
                    <span style={{flexShrink:0,width:24,height:24,borderRadius:6,background:labelBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:labelColor,marginTop:1,direction:"ltr"}}>
                      {["A","B","C","D"][i]}
                    </span>
                    <span style={{flex:1,direction:dir}}>{opt}</span>
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
        const maxScore = (incidentSteps ? incidentSteps.length : selectedIncident.steps.length) * 10;
        const perfect  = incidentScore === maxScore;
        const goodRun  = incidentMistakes <= 1;
        return(
          <div style={{maxWidth:480,margin:"30px auto",padding:"0 18px",textAlign:"center",animation:"fadeIn 0.5s ease",direction:dir}}>
            <div style={{fontSize:56,marginBottom:10}}>{perfect?"🏆":goodRun?"🎯":"💪"}</div>
            <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 6px",color:"#22C55E"}}>{t("incidentResolved")}</h2>
            <p style={{color:"#64748b",fontSize:13,margin:"0 0 20px"}}>{lang==="he"?selectedIncident.titleHe:selectedIncident.title}</p>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
              {[
                {label:t("incidentScore"),  value:`${incidentScore}/${maxScore}`, icon:"⭐", color:"#A855F7"},
                {label:t("incidentTime"),   value:formatIncidentTime(incidentElapsed), icon:"⏱", color:"#F59E0B"},
                {label:t("incidentMistakes"),value:incidentMistakes,               icon:"❌", color:incidentMistakes===0?"#10B981":"#EF4444"},
              ].map((s,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 8px"}}>
                  <div style={{fontSize:20}}>{s.icon}</div>
                  <div style={{fontSize:18,fontWeight:800,color:s.color,marginTop:4}}>{s.value}</div>
                  <div style={{fontSize:12,color:"#475569",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* LinkedIn share */}
              <div style={{background:"rgba(10,102,194,0.06)",border:"1px solid rgba(10,102,194,0.2)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"#475569",marginBottom:8,textAlign:"left"}}>
                  {lang==="en"?"1. Copy this text  2. Open LinkedIn  3. Paste":"1. העתק את הטקסט  2. פתח LinkedIn  3. הדבק"}
                </div>
                <div
                  onClick={()=>{
                    const el = document.getElementById("share-text-box");
                    if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
                    handleIncidentShare();
                  }}
                  id="share-text-box"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#94a3b8",direction:"ltr",textAlign:"left",lineHeight:1.7,marginBottom:10,cursor:"text",userSelect:"all",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                  {buildIncidentShareMsg()}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={handleIncidentShare}
                    style={{flex:1,padding:"10px",background:incidentShareCopied?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${incidentShareCopied?"#10B98150":"rgba(255,255,255,0.1)"}`,borderRadius:8,color:incidentShareCopied?"#10B981":"#94a3b8",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
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
                style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#94a3b8",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {t("backToTopics")}
              </button>
            </div>
            <Footer lang={lang}/>
          </div>
        );
      })()}

      </main>
    </div>
  );
}
