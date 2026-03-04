import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import WeakAreaCard from "./components/WeakAreaCard";
import RoadmapView from "./components/RoadmapView";
import { DAILY_QUESTIONS } from "./dailyQuestions";
import { TOPICS, ACHIEVEMENTS } from "./topics";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://knzawpdrpahilmohzpbl.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemF3cGRycGFoaWxtb2h6cGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDA2NzYsImV4cCI6MjA4ODExNjY3Nn0.Vh4vwQkSgIHkyr3LPVAvsktni_l5q1DhP3S3MT97KQ8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GUEST_USER = { id: "guest", email: "guest", user_metadata: { username: "Guest" } };

const LEVEL_CONFIG = {
  easy:   { label: "קל",        labelEn: "Easy",             icon: "🌱", color: "#10B981", points: 10 },
  medium: { label: "בינוני",    labelEn: "Medium",           icon: "⚡", color: "#F59E0B", points: 20 },
  hard:   { label: "קשה",      labelEn: "Hard",             icon: "🔥", color: "#EF4444", points: 30 },
  mixed:  { label: "מיקס",     labelEn: "Mixed",            icon: "🎲", color: "#A855F7", points: 15 },
  daily:  { label: "אתגר יומי", labelEn: "Daily Challenge",  icon: "🔥", color: "#F59E0B", points: 15 },
};

const LEVEL_ORDER = ["easy", "medium", "hard"];

const MIXED_TOPIC = { id: "mixed", icon: "🎲", name: "Mixed Quiz", color: "#A855F7", levels: {} };
const DAILY_TOPIC = { id: "daily", icon: "🔥", name: "Daily Challenge", color: "#F59E0B", levels: {} };

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
    startPlaying: "🚀 התחילי לשחק עכשיו",
    noRegNoPass: "ללא הרשמה · ללא סיסמה · מיידי",
    saveProgress: "רוצה לשמור את ההתקדמות?",
    username: "שם משתמש", email: "אימייל", password: "סיסמה",
    loginTab: "התחברות", signupTab: "הרשמה",
    loginBtn: "התחברי", signupBtn: "הירשמי", loading: "⏳ רגע...",
    emailAlreadySent: "✅ אימייל אימות כבר נשלח! בדקי את תיבת הדואר שלך.",
    emailSent: "✅ נשלח אימייל אימות! בדקי את תיבת הדואר.",
    otpExpired: "❌ קישור האימות פג תוקף. אנא הירשמי שוב כדי לקבל קישור חדש.",
    wrongCredentials: "אימייל או סיסמה שגויים",
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
    // Male-form overrides (used when gender === "m")
    tagline_m: "למד Kubernetes בצורה כיפית ואינטראקטיבית",
    startPlaying_m: "🚀 התחל לשחק עכשיו",
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
  },
  en: {
    tagline: "Learn Kubernetes in a fun and interactive way",
    startPlaying: "🚀 Start Playing Now",
    noRegNoPass: "No registration · No password · Instant",
    saveProgress: "Want to save your progress?",
    username: "Username", email: "Email", password: "Password",
    loginTab: "Login", signupTab: "Sign Up",
    loginBtn: "Sign In", signupBtn: "Register", loading: "⏳ Loading...",
    emailAlreadySent: "✅ Verification email already sent! Check your inbox.",
    emailSent: "✅ Verification email sent! Check your inbox.",
    otpExpired: "❌ Verification link has expired. Please sign up again to receive a new link.",
    wrongCredentials: "Incorrect email or password",
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
  },
};

const year = new Date().getFullYear();
const TIMER_SECONDS = 30;
const INTERVIEW_DURATIONS = { easy: 20, medium: 30, hard: 40 };

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

// Wraps inline English/Latin sequences in <span dir="ltr"> for correct bidi rendering
// in RTL Hebrew paragraphs. Returns text unchanged for English mode.
function renderBidi(text, lang) {
  if (!text || lang !== "he") return text;
  if (!/[A-Za-z]/.test(text)) return text;
  const parts = text.split(/((?:[A-Za-z][A-Za-z0-9\-_.:/]*(?:\s+(?=[A-Za-z]))?)+[?!.,;]?)/);
  if (parts.length <= 1) return text;
  return parts.map((part, i) =>
    /^[A-Za-z]/.test(part) ? <span key={i} dir="ltr">{part}</span> : part
  );
}

function Footer({ lang }) {
  const txt = TRANSLATIONS[lang] || TRANSLATIONS.he;
  return (
    <div style={{textAlign:"center",marginTop:28,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
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

export default function K8sQuestApp() {
  const [lang, setLang]                   = useState("he");
  const [gender, setGender]               = useState(() => localStorage.getItem("gender_v1") || "m");
  const handleSetGender = (g) => { setGender(g); localStorage.setItem("gender_v1", g); };
  const t = (key) => {
    if (lang === "he" && gender === "m" && TRANSLATIONS.he[key + "_m"]) return TRANSLATIONS.he[key + "_m"];
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.he[key] ?? key;
  };
  const dir = lang === "he" ? "rtl" : "ltr";

  const [authChecked, setAuthChecked]     = useState(false);
  const [user, setUser]                   = useState(null);
  const [authScreen, setAuthScreen]       = useState("login");
  const authFormRef                       = useRef(null);
  const [authLoading, setAuthLoading]     = useState(false);
  const [authError, setAuthError]         = useState("");
  const [saveError, setSaveError]         = useState("");

  const [screen, setScreen]               = useState("home");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [topicScreen, setTopicScreen]     = useState("theory");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted]         = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flash, setFlash]                 = useState(false);

  const topicCorrectRef = useRef(0);
  const isRetryRef = useRef(false);

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
  const [showLeaderboard, setShowLeaderboard]           = useState(false);
  const [quizHistory, setQuizHistory]                   = useState([]);
  const [showReview, setShowReview]                     = useState(false);
  const [timerEnabled, setTimerEnabled]                 = useState(true);
  const [timeLeft, setTimeLeft]                         = useState(TIMER_SECONDS);
  const [isInterviewMode, setIsInterviewMode]           = useState(() => localStorage.getItem("isInterviewMode_v1") === "true");
  const [homeTab, setHomeTab]                           = useState("roadmap");
  const [showConfetti, setShowConfetti]                 = useState(false);
  const [mixedQuestions, setMixedQuestions]             = useState([]);
  const [sessionScore, setSessionScore]                 = useState(0);
  const [retryMode, setRetryMode]                       = useState(false);
  const [allowNextLevel, setAllowNextLevel]             = useState(false);
  const [showMenu, setShowMenu]                         = useState(false);

  const isGuest = user?.id === "guest";
  const achievementsLoaded = useRef(false);

  // Shuffle answer options so the correct answer isn't predictably the longest/same position
  const getLevelData = (topic, level) => ({
    theory: lang === "en" ? topic.levels[level].theoryEn : topic.levels[level].theory,
    questions: lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions,
  });

  const isLevelLocked = (topicId, level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx === 0) return false;
    const prevResult = completedTopics[`${topicId}_${LEVEL_ORDER[idx - 1]}`];
    return !prevResult || prevResult.correct < prevResult.total;
  };

  const getNextLevel = (level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  };

  const isFreeMode = (id) => id === "mixed" || id === "daily";

  // Derive total_score canonically from completedTopics so it can never be gamed.
  // Each topic/level key is "topicId_level" (e.g. "workloads_easy").
  const computeScore = (completed) =>
    Object.entries(completed).reduce((sum, [key, res]) => {
      const lvl = key.split("_").slice(-1)[0];
      return sum + (res.correct * (LEVEL_CONFIG[lvl]?.points ?? 0));
    }, 0);
  const currentLevelData = selectedTopic && selectedLevel && !isFreeMode(selectedTopic.id) && !retryMode ? getLevelData(selectedTopic, selectedLevel) : null;
  const currentQuestions = isFreeMode(selectedTopic?.id) || retryMode ? mixedQuestions : (currentLevelData?.questions || []);

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); loadUserData(session.user.id, session.user); }
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
  }, [isGuest]);

  // Save guest progress to localStorage
  useEffect(() => {
    if (!isGuest) return;
    try {
      localStorage.setItem("k8s_quest_guest", JSON.stringify({ stats, completedTopics, unlockedAchievements }));
    } catch {}
  }, [isGuest, stats, completedTopics, unlockedAchievements]);

  useEffect(() => {
    try { localStorage.setItem("topicStats_v1", JSON.stringify(topicStats)); } catch {}
  }, [topicStats]);

  useEffect(() => {
    localStorage.setItem("isInterviewMode_v1", isInterviewMode);
  }, [isInterviewMode]);

  const loadUserData = async (userId, sessionUser) => {
    const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();

    // Merge any guest progress from localStorage
    let guestSaved = null;
    try {
      const raw = localStorage.getItem("k8s_quest_guest");
      if (raw) guestSaved = JSON.parse(raw);
    } catch {}

    const base = data || {};
    const gs = guestSaved?.stats || {};
    const gc = guestSaved?.completedTopics || {};
    const ga = guestSaved?.unlockedAchievements || [];

    const mergedCompleted = { ...(base.completed_topics || {}) };
    Object.entries(gc).forEach(([key, val]) => {
      if (!mergedCompleted[key] || val.correct > mergedCompleted[key].correct)
        mergedCompleted[key] = val;
    });

    const mergedAch = [...new Set([...(base.achievements || []), ...ga])];

    const mergedStats = {
      total_answered: (base.total_answered || 0) + (gs.total_answered || 0),
      total_correct:  (base.total_correct  || 0) + (gs.total_correct  || 0),
      // Always recompute from mergedCompleted — single source of truth, fixes any legacy drift
      total_score:    computeScore(mergedCompleted),
      max_streak:     Math.max(base.max_streak || 0, gs.max_streak || 0),
      current_streak: Math.max(base.current_streak || 0, gs.current_streak || 0),
    };

    setStats(mergedStats);
    setCompletedTopics(mergedCompleted);
    setUnlockedAchievements(mergedAch);

    // Persist merged data to Supabase and clear guest localStorage
    if (guestSaved) {
      const username = sessionUser?.user_metadata?.username || sessionUser?.email?.split("@")[0];
      await supabase.from("user_stats").upsert({
        user_id: userId, username,
        ...mergedStats, completed_topics: mergedCompleted, achievements: mergedAch,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      try { localStorage.removeItem("k8s_quest_guest"); } catch {}
    }

    achievementsLoaded.current = true;
  };

  const saveUserData = async (ns, nc, na) => {
    if (!user || isGuest) return;
    setSaveError("");
    const { error } = await supabase.from("user_stats").upsert({
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split("@")[0] || "",
      ...ns, completed_topics: nc, achievements: na,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) {
      setSaveError(t("saveErrorText"));
    }
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase.from("user_stats")
      .select("username,total_score,max_streak")
      .order("total_score", { ascending: false }).limit(10);
    if (data) setLeaderboard(data);
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
    setAuthLoading(true); setAuthError("");
    const { emailVal, passwordVal, usernameVal } = getFormValues();
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
    setAuthLoading(true); setAuthError("");
    const { emailVal, passwordVal } = getFormValues();
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
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailVal,
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthError(error ? t("resendError") : t("resendSuccess"));
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (isGuest) {
      setUser(null);
      setStats({ total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0 });
      setCompletedTopics({}); setUnlockedAchievements([]);
      achievementsLoaded.current = false;
      return;
    }
    await supabase.auth.signOut(); setUser(null);
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
    if (isGuest) {
      try { localStorage.removeItem("k8s_quest_guest"); } catch {}
    } else if (user) {
      await supabase.from("user_stats").upsert({
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "",
        ...emptyStats, completed_topics: {}, achievements: [],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  };

  const handleResetTopic = async (topicId) => {
    if (!window.confirm(t("resetTopicConfirm"))) return;
    const newCompleted = { ...completedTopics };
    LEVEL_ORDER.forEach(lvl => delete newCompleted[`${topicId}_${lvl}`]);
    const newScore = computeScore(newCompleted);
    const newStats = { ...stats, total_score: newScore };
    setCompletedTopics(newCompleted);
    setStats(newStats);
    if (!isGuest && user) {
      await supabase.from("user_stats").upsert({
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "",
        ...newStats, completed_topics: newCompleted, achievements: unlockedAchievements,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  };


  const handleSelectAnswer = (idx) => {
    if (submitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || submitted) return;
    setSubmitted(true);
    setShowExplanation(true);
    const q = currentQuestions[questionIndex];
    const correct = selectedAnswer === q.answer;
    if (correct) {
      topicCorrectRef.current += 1;
      setFlash(true); setTimeout(() => setFlash(false), 600);
      setSessionScore(p => p + (LEVEL_CONFIG[selectedLevel]?.points ?? 0));
    }
    setQuizHistory(prev => [...prev, { q: q.q, options: q.options, answer: q.answer, chosen: selectedAnswer, explanation: q.explanation }]);
    setStats(prev => {
      const streak = correct ? prev.current_streak + 1 : 0;
      const base = {
        ...prev,
        // total_score is NOT updated here — it is derived from completedTopics at quiz end
        current_streak: streak,
        max_streak:     Math.max(prev.max_streak, streak),
      };
      if (!isRetryRef.current) {
        base.total_answered = prev.total_answered + 1;
        base.total_correct  = correct ? prev.total_correct + 1 : prev.total_correct;
      }
      return base;
    });
    if (!isRetryRef.current && !isFreeMode(selectedTopic.id)) {
      setTopicStats(prev => {
        const curr = prev[selectedTopic.id] || { answered: 0, correct: 0 };
        return { ...prev, [selectedTopic.id]: { answered: curr.answered + 1, correct: curr.correct + (correct ? 1 : 0) } };
      });
    }
  };

  const nextQuestion = () => {
    const isLast = questionIndex >= currentQuestions.length - 1;
    if (isLast) {
      const finalCorrect = topicCorrectRef.current;

      // Retry-wrong-answers mode: if all retried questions answered correctly, mark level 100%
      if (retryMode) {
        setRetryMode(false);
        if (finalCorrect === currentQuestions.length) {
          // Upgrade stored result to 100% (score stays the same — only marks as complete)
          const key = `${selectedTopic.id}_${selectedLevel}`;
          const prevResult = completedTopics[key];
          if (prevResult) {
            const newCompleted = { ...completedTopics, [key]: { correct: prevResult.total, total: prevResult.total } };
            setCompletedTopics(newCompleted);
            if (!isFreeMode(selectedTopic.id)) saveUserData(stats, newCompleted, unlockedAchievements);
          }
          setAllowNextLevel(true);
        }
        setScreen("topicComplete");
        return;
      }

      const key = `${selectedTopic.id}_${selectedLevel}`;
      const prevResult = completedTopics[key];
      const bestCorrect = prevResult ? Math.min(Math.max(prevResult.correct, finalCorrect), currentQuestions.length) : Math.min(finalCorrect, currentQuestions.length);
      const newCompleted = { ...completedTopics, [key]: { correct: bestCorrect, total: currentQuestions.length } };
      // Recompute score from the full completedTopics snapshot — single source of truth
      const newStats = { ...stats, total_score: computeScore(newCompleted) };
      const newAch = [
        ...unlockedAchievements,
        ...ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(newStats, newCompleted)).map(a => a.id),
      ];
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
      setScreen("topicComplete");
    } else {
      setQuestionIndex(p => p + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowExplanation(false);
      if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[selectedLevel] || 25) : TIMER_SECONDS);
    }
  };

  const startTopic = (topic, level) => {
    const key = `${topic.id}_${level}`;
    isRetryRef.current = !!(completedTopics[key]);
    setSelectedTopic(topic); setSelectedLevel(level); setTopicScreen("theory");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    setStats(prev => ({ ...prev, current_streak: 0 }));
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[level] || 25) : TIMER_SECONDS);
    setScreen("topic");
    if (isGuest) achievementsLoaded.current = true;
  };

  const startMixedQuiz = () => {
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
    setMixedQuestions(all.slice(0, 10));
    isRetryRef.current = false;
    setSelectedTopic(MIXED_TOPIC); setSelectedLevel("mixed"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    setStats(prev => ({ ...prev, current_streak: 0 }));
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? 25 : TIMER_SECONDS);
    setScreen("topic");
  };

  const startDailyChallenge = () => {
    const pool = lang === "en" ? DAILY_QUESTIONS.en : DAILY_QUESTIONS.he;
    // Shuffle once per year with a fixed annual seed (same order for all users)
    const annualSeed = new Date().getFullYear() * 31337;
    const annualRng = mulberry32(annualSeed);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(annualRng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Pick a non-overlapping window by day-of-year — no repeats until full pool cycles
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const numWindows = Math.floor(shuffled.length / 5);
    const startIdx = (dayOfYear % numWindows) * 5;
    setMixedQuestions(shuffled.slice(startIdx, startIdx + 5));
    isRetryRef.current = false;
    setSelectedTopic(DAILY_TOPIC); setSelectedLevel("daily"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    setSessionScore(0); setRetryMode(false); setAllowNextLevel(false);
    setStats(prev => ({ ...prev, current_streak: 0 }));
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? 25 : TIMER_SECONDS);
    setScreen("topic");
  };

  // Keyboard shortcuts: 1-4 to pick answer, Enter to confirm/next
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz") return;
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
    if (screen !== "topic" || topicScreen !== "quiz" || !timerEnabled || submitted || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, topicScreen, timerEnabled, submitted, timeLeft]);

  // Timer expired – force-submit as missed
  useEffect(() => {
    if (timeLeft !== 0 || submitted || screen !== "topic" || topicScreen !== "quiz" || !timerEnabled) return;
    const q = currentQuestions[questionIndex];
    setSubmitted(true);
    setShowExplanation(true);
    setQuizHistory(prev => [...prev, { q: q.q, options: q.options, answer: q.answer, chosen: -1, explanation: q.explanation }]);
    if (!isRetryRef.current) {
      setStats(prev => ({ ...prev, total_answered: prev.total_answered + 1, current_streak: 0 }));
    }
  }, [timeLeft]);

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

const displayName = isGuest ? t("guestName") : (user?.user_metadata?.username || user?.email?.split("@")[0] || t("guestName"));

  if (!authChecked) return (
    <div style={{minHeight:"100vh",background:"#020817",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <svg width="52" height="52" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
          style={{animation:"spin 1.4s linear infinite",display:"block",margin:"0 auto 14px"}}>
          <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
          <defs><linearGradient id="slg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="100%" stopColor="#A855F7"/></linearGradient></defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#slg)" strokeWidth="5" opacity="0.8"/>
          <circle cx="50" cy="50" r="6" fill="#00D4FF"/>
        </svg>
        <div style={{color:"#475569",fontSize:13}}>{t("loadingText")}</div>
      </div>
    </div>
  );

  const accuracy = stats.total_answered > 0 ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;

  if (!user) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,padding:"20px"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.2)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}input,button{outline:none;font-family:inherit}.gbtn:hover{background:rgba(0,212,255,0.13)!important;border-color:rgba(0,212,255,0.5)!important;color:#00D4FF!important;transform:translateY(-2px)}`}</style>
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
              <label style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("username")}</label>
              <input name="username" autoComplete="username" defaultValue="" placeholder="K8s Hero"
                style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:11}}>
            <label style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("email")}</label>
            <input type="email" name="email" autoComplete={authScreen==="login"?"username":"email"} defaultValue="" placeholder="you@example.com"
              style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("password")}</label>
            <input type="password" name="password" autoComplete={authScreen==="login"?"current-password":"new-password"} defaultValue="" placeholder="••••••••"
              style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          {authError&&<div style={{marginBottom:12}}>
            <div style={{color:authError.startsWith("✅")?"#10B981":"#EF4444",fontSize:12,padding:"8px 12px",background:authError.startsWith("✅")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:8}}>{authError}</div>
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
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}@keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes confettiFall{from{top:-20px;transform:rotate(0deg);opacity:1}to{top:100vh;transform:rotate(720deg);opacity:0}}@keyframes pulseHighlight{0%{box-shadow:0 0 0 0 rgba(239,68,68,0)}60%{box-shadow:0 0 0 8px rgba(239,68,68,0.2)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}@keyframes nodePulse{0%,100%{box-shadow:0 0 10px var(--nc,#00D4FF)}50%{box-shadow:0 0 22px var(--nc,#00D4FF)}}.pulseHighlight{animation:pulseHighlight 0.5s ease 3;border-color:rgba(239,68,68,0.45)!important}.card-hover{transition:transform 0.2s;cursor:pointer}.card-hover:hover{transform:translateY(-3px)}.opt-btn{transition:all 0.15s;cursor:pointer}.opt-btn:hover{transform:translateX(-2px)}input,button{outline:none;font-family:inherit}@media(max-width:600px){
.stats-grid{grid-template-columns:repeat(2,1fr)!important}
.page-pad{padding:12px 14px!important}
.quiz-bar{flex-wrap:wrap!important;row-gap:6px!important}
.quiz-bar-right{width:100%!important;justify-content:flex-start!important;gap:8px!important}
.quiz-bar-right span,.quiz-bar-right button{font-size:11px!important}
.home-actions{gap:5px!important}
.home-actions>button{font-size:11px!important;padding:5px 8px!important}
.home-screen{padding:12px 14px!important}
.home-header{flex-direction:column!important;gap:10px!important;min-height:auto!important}
.home-controls{position:static!important;transform:none!important;margin-bottom:4px!important}
.roadmap-row{gap:8px!important;margin-bottom:8px!important}
.roadmap-node-col{width:28px!important}
.roadmap-node-circle{width:26px!important;height:26px!important;font-size:10px!important}
.roadmap-card{padding:10px 10px!important}
.roadmap-card-header{gap:6px!important}
.roadmap-icon{width:28px!important;height:28px!important;font-size:15px!important}
.roadmap-title{font-size:12px!important}
.roadmap-subtitle{font-size:10px!important}
.roadmap-pct{min-width:30px!important;font-size:11px!important}
}`}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {flash&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)",animation:"correctFlash 0.6s ease forwards"}}/>}
      {showConfetti&&<Confetti/>}
      {newAchievement&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"1px solid #00D4FF55",borderRadius:14,padding:"12px 22px",display:"flex",alignItems:"center",gap:12,zIndex:9999,boxShadow:"0 0 40px rgba(0,212,255,0.3)",animation:"toast 0.4s ease",direction:"ltr"}}><span style={{fontSize:26}}>{newAchievement.icon}</span><div><div style={{color:"#00D4FF",fontWeight:800,fontSize:11,letterSpacing:1}}>{t("newAchievement")}</div><div style={{color:"#e2e8f0",fontSize:14,fontWeight:700}}>{lang==="en"?newAchievement.nameEn:newAchievement.name}</div></div></div>}
      {saveError&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(239,68,68,0.12)",border:"1px solid #EF444455",borderRadius:10,padding:"10px 18px",color:"#EF4444",fontSize:13,zIndex:9999}}>{saveError}</div>}

      {showLeaderboard&&<div onClick={()=>setShowLeaderboard(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:20,width:"min(360px,calc(100vw - 32px))",animation:"fadeIn 0.3s ease",direction:"ltr"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h3 style={{margin:0,color:"#e2e8f0",fontSize:18,fontWeight:800}}>{t("leaderboardTitle")}</h3><button onClick={()=>setShowLeaderboard(false)} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button></div>{leaderboard.length===0?<div style={{color:"#475569",textAlign:"center",padding:"20px 0"}}>{t("noData")}</div>:leaderboard.map((entry,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i===0?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.03)",borderRadius:10,marginBottom:8,border:`1px solid ${i===0?"#F59E0B44":"rgba(255,255,255,0.06)"}`}}><span style={{fontSize:18,width:28}}>{["🥇","🥈","🥉"][i]||`${i+1}.`}</span><div style={{flex:1}}><div style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{entry.username||t("anonymous")}</div><div style={{color:"#475569",fontSize:11}}>🔥 {entry.max_streak}</div></div><div style={{color:"#00D4FF",fontWeight:800,fontSize:16}}>{entry.total_score}</div></div>)}</div></div>}

      {/* HOME */}
      {screen==="home"&&(
        <div className="page-pad home-screen" style={{maxWidth:700,margin:"0 auto",padding:"16px 12px",animation:"fadeIn 0.4s ease",overflowX:"hidden",direction:dir}}>
          <div style={{marginBottom:24}}>
            {/* Row 1: Title centered + burger button */}
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,minHeight:48,direction:"ltr"}}>
              <h1 style={{fontSize:32,fontWeight:900,margin:0,display:"flex",alignItems:"center",gap:10,zIndex:1,filter:"drop-shadow(0 0 18px rgba(0,212,255,0.35))"}}>
                <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
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
                <span style={{background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",color:"transparent",backgroundSize:"300% auto",animation:"shine 9s linear infinite"}}>KubeQuest</span>
              </h1>
              {/* Burger button */}
              <button onClick={()=>setShowMenu(p=>!p)}
                style={{position:"absolute",[lang==="en"?"left":"right"]:0,top:"50%",transform:"translateY(-50%)",width:40,height:40,background:showMenu?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${showMenu?"rgba(0,212,255,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:10,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,zIndex:201,transition:"all 0.2s"}}>
                {[0,1,2].map(i=><span key={i} style={{display:"block",width:18,height:2,borderRadius:2,background:showMenu?"#00D4FF":"#94a3b8",transition:"background 0.2s"}}/>)}
              </button>
              {/* Dropdown menu */}
              {showMenu&&(<>
                <div onClick={()=>setShowMenu(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
                <div style={{position:"absolute",top:"calc(100% + 8px)",[lang==="en"?"left":"right"]:0,background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"8px 0",zIndex:200,minWidth:220,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"fadeIn 0.15s ease",direction:"ltr"}}>
                  {/* Language + Gender */}
                  <div style={{padding:"8px 14px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:8,alignItems:"center",justifyContent:"center"}}>
                    {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
                    <LangSwitcher lang={lang} setLang={setLang}/>
                  </div>
                  {/* Menu items */}
                  {!isGuest&&<button onClick={()=>{loadLeaderboard();setShowLeaderboard(true);setShowMenu(false);}} style={{width:"100%",padding:"11px 16px",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#94a3b8",cursor:"pointer",fontSize:13,textAlign:"right",display:"flex",alignItems:"center",gap:10}}>{t("leaderboardBtn")}</button>}
                  <button onClick={()=>{setIsInterviewMode(p=>!p);}} style={{width:"100%",padding:"11px 16px",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",color:isInterviewMode?"#A855F7":"#94a3b8",cursor:"pointer",fontSize:13,textAlign:"right",display:"flex",alignItems:"center",gap:10,fontWeight:isInterviewMode?700:400}}>{t("interviewMode")}{isInterviewMode&&<span style={{marginLeft:"auto",fontSize:10,color:"#A855F7"}}>ON</span>}</button>
                  <button onClick={()=>{handleResetProgress();setShowMenu(false);}} style={{width:"100%",padding:"11px 16px",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#EF4444",cursor:"pointer",fontSize:13,textAlign:"right",display:"flex",alignItems:"center",gap:10}}><span>🗑</span>{t("resetProgress")}</button>
                  <a href="mailto:ocarmeli7@gmail.com?subject=KubeQuest%20Feedback" style={{width:"100%",padding:"11px 16px",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#64748b",cursor:"pointer",fontSize:13,textAlign:"right",display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}><span>✉️</span>{lang==="en"?"Contact":"צור קשר"}</a>
                  <button onClick={()=>{handleLogout();setShowMenu(false);}} style={{width:"100%",padding:"11px 16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,textAlign:"right",display:"flex",alignItems:"center",gap:10}}><span>🚪</span>{t("logout")}</button>
                </div>
              </>)}
            </div>
            {/* Row 2: Greeting */}
            <p style={{color:"#94a3b8",fontSize:13,margin:"0 0 16px",textAlign:"center"}}>
              {t("greeting")}, <span style={{color:"#e2e8f0",fontWeight:700}}>{displayName}</span>! 👋
              {isGuest&&<span style={{color:"#475569",fontSize:12}}> · {t("playingAsGuest")}</span>}
            </p>
            {isInterviewMode&&<p style={{color:"#64748b",fontSize:11,margin:"-10px 0 14px",textAlign:"center",direction:dir}}>{t("interviewModeHint")}</p>}
          </div>
          {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{color:"#4a9aba",fontSize:13}}>{t("guestBanner")}</span><button onClick={()=>setUser(null)} style={{padding:"6px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,color:"#00D4FF",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{t("signupNow")}</button></div>}
          <div style={{display:"flex",gap:6,marginBottom:16,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:3,direction:"ltr"}}>
            {[{key:"categories",label:t("tabTopics")},{key:"roadmap",label:t("tabRoadmap")}].map(tab=>(
              <button key={tab.key} onClick={()=>setHomeTab(tab.key)} style={{flex:1,padding:"8px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,background:homeTab===tab.key?"rgba(0,212,255,0.12)":"transparent",color:homeTab===tab.key?"#00D4FF":"#475569",transition:"all 0.2s"}}>{tab.label}</button>
            ))}
          </div>
          {homeTab==="categories"&&(<>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
            {[
              {label:t("score"),value:stats.total_score,icon:"⭐",color:"#F59E0B"},
              {label:t("accuracy"),value:`${accuracy}%`,icon:"🎯",color:"#10B981"},
              {label:t("streak"),value:stats.current_streak,icon:"🔥",color:"#FF6B35"},
              {label:t("completed"),value:Object.keys(completedTopics).length,icon:"📚",color:"#00D4FF"},
            ].map((s,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:18}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:12,color:"#475569"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <WeakAreaCard topicStats={topicStats} t={t} dir={dir} onGoToTopic={(id) => {
            const el = document.getElementById(`topic-card-${id}`);
            if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setHighlightTopic(id); setTimeout(() => setHighlightTopic(null), 1500); }
          }}/>
          <button onClick={startDailyChallenge} style={{width:"100%",marginBottom:10,padding:"16px 20px",background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))",border:"1px solid rgba(245,158,11,0.35)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>🔥</span>
              <div style={{textAlign:"start"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"#F59E0B",fontWeight:800,fontSize:15}}>{t("dailyChallengeTitle")}</span>
                  <span style={{background:"rgba(245,158,11,0.2)",color:"#F59E0B",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5}}>{t("dailyChallengeNew")}</span>
                </div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("dailyChallengeDesc")}</div>
              </div>
            </div>
            <span style={{color:"#F59E0B",fontSize:20}}>→</span>
          </button>
          <button onClick={startMixedQuiz} style={{width:"100%",marginBottom:16,padding:"16px 20px",background:"linear-gradient(135deg,#A855F722,#7C3AED22)",border:"1px solid #A855F755",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>🎲</span>
              <div style={{textAlign:"start"}}>
                <div style={{color:"#A855F7",fontWeight:800,fontSize:15}}>{t("mixedQuizBtn")}</div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("mixedQuizDesc")}</div>
              </div>
            </div>
            <span style={{color:"#A855F7",fontSize:20}}>→</span>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TOPICS.map(topic=>(
              <div key={topic.id} id={`topic-card-${topic.id}`} className={highlightTopic===topic.id?"pulseHighlight":undefined} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontSize:24,width:44,height:44,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>{topic.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#e2e8f0",fontSize:15}}>{topic.name}</div>
                    <div style={{color:"#475569",fontSize:12}}>{lang==="en"?topic.descriptionEn:topic.description}</div>
                  </div>
                  {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return done>0&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:11,color:topic.color,fontWeight:700,whiteSpace:"nowrap"}}>{done}/3</div>
                    <button onClick={e=>{e.stopPropagation();handleResetTopic(topic.id);}} title={t("resetTopic")} style={{background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",padding:"2px 4px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>↺</button>
                  </div>})()}
                </div>
                {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return(<div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10}}><div style={{height:"100%",borderRadius:2,width:`${(done/3)*100}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/></div>);})()}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Object.entries(LEVEL_CONFIG).filter(([lvl])=>lvl!=="mixed"&&lvl!=="daily").map(([lvl,cfg])=>{
                    const key=`${topic.id}_${lvl}`;
                    const done=completedTopics[key];
                    const locked=isLevelLocked(topic.id,lvl);
                    return(
                      <div key={lvl} className={locked?"":"card-hover"}
                        onClick={()=>!locked&&startTopic(topic,lvl)}
                        style={{padding:"10px 8px",
                          background:locked?"rgba(255,255,255,0.01)":done?`${cfg.color}12`:"rgba(255,255,255,0.03)",
                          border:`1px solid ${locked?"rgba(255,255,255,0.04)":done?cfg.color+"44":"rgba(255,255,255,0.07)"}`,
                          borderRadius:10,textAlign:"center",opacity:locked?0.45:1,cursor:locked?"not-allowed":"pointer"}}>
                        <div style={{fontSize:16}}>{locked?"🔒":cfg.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:locked?"#334155":done?cfg.color:"#64748b"}}>{lang==="en"?cfg.labelEn:cfg.label}</div>
                        {done&&!locked&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}}>
                          {done.correct>0?"✓":""} {done.correct}/{done.total}
                        </div>}
                        <div style={{fontSize:10,color:locked?"#1e293b":"#475569"}}>+{cfg.points}{t("pts")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {unlockedAchievements.length>0&&<div style={{marginTop:18,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"14px 18px"}}><div style={{color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:1}}>{t("achievementsTitle")}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{ACHIEVEMENTS.filter(a=>unlockedAchievements.includes(a.id)).map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#94a3b8"}}><span>{a.icon}</span>{lang==="en"?a.nameEn:a.name}</div>)}</div></div>}
          </>)}
          {homeTab==="roadmap"&&<RoadmapView topics={TOPICS} levelConfig={LEVEL_CONFIG} completedTopics={completedTopics} isLevelLocked={isLevelLocked} startTopic={startTopic} startMixedQuiz={startMixedQuiz} lang={lang} t={t} dir={dir}/>}
          <Footer lang={lang}/>
        </div>
      )}

      {/* TOPIC */}
      {screen==="topic"&&selectedTopic&&selectedLevel&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease"}}>
          <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22,minHeight:36}}>
            {topicScreen==="theory"&&<button onClick={()=>setScreen("home")} style={{position:"absolute",[dir==="rtl"?"right":"left"]:0,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#94a3b8",width:36,height:36,borderRadius:8,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{dir==="rtl"?"→":"←"}</button>}
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
              <span style={{fontSize:18}}>{selectedTopic.icon}</span>
              <h2 style={{margin:0,color:selectedTopic.color,fontSize:17,fontWeight:800,textAlign:"center"}}>{selectedTopic.name}</h2>
            </div>
            <span style={{position:"absolute",[dir==="rtl"?"left":"right"]:0,fontSize:12,color:LEVEL_CONFIG[selectedLevel].color,background:`${LEVEL_CONFIG[selectedLevel].color}18`,padding:"3px 10px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{LEVEL_CONFIG[selectedLevel].icon} {lang==="en"?LEVEL_CONFIG[selectedLevel].labelEn:LEVEL_CONFIG[selectedLevel].label}</span>
          </div>

          {topicScreen==="theory"?(
            <div>
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:22,marginBottom:18}}>
                <div style={{fontSize:11,color:selectedTopic.color,fontWeight:800,marginBottom:16,letterSpacing:1}}>{t("theory")}</div>
                <div style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"16px 20px"}}>{renderTheory(currentLevelData.theory)}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:0}}>
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled||isInterviewMode)setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):TIMER_SECONDS);}} style={{flex:1,padding:15,background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${selectedTopic.color}44`,lineHeight:1.4}}>
                  <div style={{fontSize:15}}>{t("startQuiz")}</div>
                  <div style={{fontSize:12,opacity:0.85,fontWeight:600}}>(+{LEVEL_CONFIG[selectedLevel].points} {t("ptsPerQ")})</div>
                </button>
              </div>
              {!isInterviewMode&&<div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                <button onClick={()=>setTimerEnabled(p=>!p)} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400}}>
                  {timerEnabled?t("timerOn"):t("timerOff")}
                </button>
              </div>}
            </div>
          ):(
            <div>
              <div style={{marginBottom:18}}>
                <div className="quiz-bar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#64748b",padding:"7px 12px",borderRadius:7,cursor:"pointer",fontSize:13}}>{t("back")}</button>
                    <span style={{color:"#475569",fontSize:13}}>{t("question")} {questionIndex+1} {t("of")} {currentQuestions.length}</span>
                  </div>
                  <div className="quiz-bar-right" style={{display:"flex",gap:10,alignItems:"center"}}>
                    {(timerEnabled||isInterviewMode)&&<span style={{display:"inline-block",color:(!isInterviewMode&&timeLeft<=10)?"#EF4444":"#F59E0B",fontSize:13,fontWeight:(isInterviewMode&&timeLeft<=5)?900:800,transform:(isInterviewMode&&timeLeft<=5)?"scale(1.05)":"none",transition:"transform 0.3s ease",minWidth:28,textAlign:"center",direction:"ltr"}}>⏱ {timeLeft}</span>}
                    {!isInterviewMode&&<button onClick={()=>setTimerEnabled(p=>!p)} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400,padding:0}}>
                      {timerEnabled?t("timerOn"):t("timerOff")}
                    </button>}
                    <span style={{color:stats.current_streak>0?"#FF6B35":"#475569",fontSize:12,fontWeight:700}}>
                      🔥 {stats.current_streak} {t("streakLabel")}
                    </span>
                    <span style={{color:"#A855F7",fontSize:12,fontWeight:700,direction:"ltr"}}>
                      ⭐ {stats.total_score + sessionScore} {t("pts")}
                    </span>
                  </div>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:4}}>
                  <div style={{height:"100%",borderRadius:4,
                    width:`${((questionIndex+(submitted?1:0))/currentQuestions.length)*100}%`,
                    background:`linear-gradient(90deg,${selectedTopic.color},${selectedTopic.color}88)`,
                    transition:"width 0.4s ease"}}/>
                </div>
              </div>

              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"20px 22px",marginBottom:14}}>
                {(()=>{const qText=currentQuestions[questionIndex].q;const qDir=hasHebrew(qText)?dir:"ltr";return<div dir={qDir} style={{color:"#e2e8f0",fontSize:17,fontWeight:700,lineHeight:1.75,wordBreak:"break-word",textAlign:qDir==="ltr"?"left":"right",unicodeBidi:"plaintext"}}>{renderBidi(qText,lang)}</div>;})()}
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
                {currentQuestions[questionIndex].options.map((opt,i)=>{
                  const isCorrect = i===currentQuestions[questionIndex].answer;
                  const isChosen  = i===selectedAnswer;
                  let borderColor = "rgba(255,255,255,0.09)", bg = "rgba(255,255,255,0.02)", color = "#cbd5e1", labelBg = "rgba(255,255,255,0.07)", labelColor = "#94a3b8";
                  if (isChosen && !submitted)  { borderColor = "#00D4FF66"; bg = "rgba(0,212,255,0.06)"; color = "#7dd3fc"; labelBg = "rgba(0,212,255,0.15)"; labelColor = "#00D4FF"; }
                  if (submitted) {
                    if (isCorrect)             { borderColor = "#10B981"; bg = "rgba(16,185,129,0.1)";  color = "#10B981"; labelBg = "rgba(16,185,129,0.2)";  labelColor = "#10B981"; }
                    else if (isChosen)          { borderColor = "#EF4444"; bg = "rgba(239,68,68,0.1)";   color = "#EF4444"; labelBg = "rgba(239,68,68,0.2)";   labelColor = "#EF4444"; }
                  }
                  const optDir = (dir==="rtl" && !hasHebrew(opt)) ? "ltr" : dir;
                  return (
                    <button key={i} className="opt-btn"
                      onClick={()=>handleSelectAnswer(i)}
                      style={{width:"100%",textAlign:optDir==="rtl"?"right":"left",padding:"13px 14px",background:bg,border:`1px solid ${borderColor}`,borderRadius:10,color,fontSize:14,cursor:submitted?"default":"pointer",lineHeight:1.55,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
                      <span style={{flexShrink:0,width:24,height:24,borderRadius:6,background:labelBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:labelColor}}>{t("optionLabels")[i]}</span>
                      <span dir={optDir} style={{flex:1}}>{optDir==="ltr"?opt:renderBidi(opt,lang)}</span>
                      {submitted&&isCorrect&&<span style={{flexShrink:0,fontSize:16}}>✓</span>}
                      {submitted&&isChosen&&!isCorrect&&<span style={{flexShrink:0,fontSize:16}}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {!submitted&&selectedAnswer!==null&&(
                <button onClick={handleSubmit}
                  style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10,boxShadow:`0 4px 16px ${selectedTopic.color}44`}}>
                  {t("confirmAnswer")}
                </button>
              )}

              {showExplanation&&(
                <div style={{animation:"fadeIn 0.3s ease"}}>
                  {(()=>{
                    const q = currentQuestions[questionIndex];
                    const timedOut = selectedAnswer === null;
                    const isCorrect = !timedOut && selectedAnswer === q.answer;
                    return (
                      <div style={{background:isCorrect?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${isCorrect?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                        <div style={{fontWeight:800,fontSize:13,marginBottom:6,color:isCorrect?"#10B981":"#EF4444"}}>
                          {isCorrect
                            ?`${t("correct")} +${LEVEL_CONFIG[selectedLevel].points} ${t("pts")}`
                            :timedOut
                              ?`${t("timeUp")} ${lang==="he"?"התשובה הנכונה היא":"The correct answer is"}: ${q.options[q.answer]}`
                              :t("incorrect")}
                        </div>
                        {!isInterviewMode&&<div style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{renderBidi(q.explanation,lang)}</div>}
                      </div>
                    );
                  })()}
                  {isInterviewMode&&(()=>{
                    const q = currentQuestions[questionIndex];
                    return (
                      <div style={{background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.22)",borderRadius:12,padding:"14px 16px",marginBottom:12,direction:"rtl",animation:"fadeIn 0.3s ease"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#A855F7",marginBottom:8,letterSpacing:0.5}}>תשובה אידיאלית</div>
                        <div style={{color:"#e2e8f0",fontWeight:700,fontSize:14,marginBottom:6}}>{q.options[q.answer]}</div>
                        <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{q.explanation}</div>
                      </div>
                    );
                  })()}
                  <button onClick={nextQuestion} style={{width:"100%",padding:15,background:`linear-gradient(135deg,${selectedTopic.color}cc,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                    {questionIndex>=currentQuestions.length-1?t("finishTopic"):t("nextQuestion")}
                  </button>
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
        // Next topic: all levels of this topic complete at 100%
        const nextTopicIdx = selectedTopic.id!=="mixed"&&selectedTopic.id!=="daily" ? (() => {
          const allPerfectNow = LEVEL_ORDER.every(lvl=>{const r=completedTopics[`${selectedTopic.id}_${lvl}`];return r&&r.correct===r.total;});
          if (!allPerfectNow) return -1;
          return TOPICS.findIndex(t=>t.id===selectedTopic.id)+1;
        })() : -1;
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
            <div style={{color:"#00D4FF",fontWeight:800,fontSize:18,marginBottom:20}}>
              +{(result?.correct||0)*LEVEL_CONFIG[selectedLevel].points} {t("points")}
            </div>
            {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:16,fontSize:13,color:"#4a9aba"}}>
              {t("guestSaveHint")}{" "}
              <button onClick={()=>setUser(null)} style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>{t("signupLink")}</button>
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
                  topicCorrectRef.current=0;
                  setQuizHistory([]); setShowReview(false);
                  setStats(prev=>({...prev,current_streak:0}));
                  if (timerEnabled||isInterviewMode) setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):TIMER_SECONDS);
                  setScreen("topic");
                }}
                  style={{padding:13,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,color:"#EF4444",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  🔄 {lang==="en"?`Retry ${wrongQs.length} wrong answer${wrongQs.length>1?"s":""}`:`תרגלי ${wrongQs.length} ${wrongQs.length>1?"שאלות":"שאלה"} שגויות`}
                </button>
              )}
              {quizHistory.length>0&&<button onClick={()=>setShowReview(p=>!p)} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#94a3b8",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {showReview?t("hideReview"):t("reviewBtn")}
              </button>}
              <button onClick={()=>selectedTopic.id==="mixed"?startMixedQuiz():selectedTopic.id==="daily"?startDailyChallenge():startTopic(selectedTopic,selectedLevel)} style={{padding:13,background:`${selectedTopic.color}18`,border:`1px solid ${selectedTopic.color}40`,borderRadius:12,color:selectedTopic.color,fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("tryAgain")}</button>
              <button onClick={()=>setScreen("home")} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#e2e8f0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("backToTopics")}</button>
            </div>
            {showReview&&quizHistory.length>0&&(
              <div style={{marginTop:20,textAlign:dir==="rtl"?"right":"left",animation:"fadeIn 0.3s ease"}}>
                <div style={{color:"#94a3b8",fontSize:12,fontWeight:700,marginBottom:12,letterSpacing:1}}>{t("reviewTitle")}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {quizHistory.map((h,i)=>{
                    const wasCorrect=h.chosen===h.answer;
                    const timedOut=h.chosen===-1;
                    return(
                      <div key={i} style={{background:wasCorrect?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${wasCorrect?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"12px 14px"}}>
                        <div style={{fontWeight:700,fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4}}>
                          {wasCorrect?"✅":"❌"} {t("question")} {i+1}
                        </div>
                        <div style={{color:"#e2e8f0",fontSize:13,marginBottom:6}}>{renderBidi(h.q,lang)}</div>
                        {timedOut?<div style={{fontSize:13,color:"#F59E0B"}}>{t("timeUp")}</div>:(
                          <div style={{fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4,dir:hasHebrew(h.options[h.chosen])?"rtl":"ltr",textAlign:hasHebrew(h.options[h.chosen])?"right":"left"}}>
                            {t("optionLabels")[h.chosen]}. {h.options[h.chosen]}
                          </div>
                        )}
                        {!wasCorrect&&<div style={{fontSize:13,color:"#10B981",dir:hasHebrew(h.options[h.answer])?"rtl":"ltr",textAlign:hasHebrew(h.options[h.answer])?"right":"left"}}>✓ {h.options[h.answer]}</div>}
                        <div style={{fontSize:12,color:"#64748b",marginTop:4,lineHeight:1.6}}>{renderBidi(h.explanation,lang)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
