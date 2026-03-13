const QUIZ_KEY  = "k8s_quiz_inprogress_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_RESUME_MS = 2 * 60 * 1000;   // 2 minutes - only auto-resume if this recent

export function saveQuizState(state) {
  try {
    localStorage.setItem(QUIZ_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch {}
}

export function loadQuizState() {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || !state.timestamp) return null;
    if (Date.now() - state.timestamp > MAX_AGE_MS) {
      localStorage.removeItem(QUIZ_KEY);
      return null;
    }
    // Validate minimum required fields
    if (!state.topicId || !state.level || !Array.isArray(state.questions) || !state.questions.length) return null;
    // Clamp questionIndex to valid range to prevent out-of-bounds after back navigation
    const maxIdx = state.questions.length - 1;
    if (typeof state.questionIndex !== "number" || !isFinite(state.questionIndex) || state.questionIndex < 0) {
      state.questionIndex = 0;
    } else if (state.questionIndex > maxIdx) {
      state.questionIndex = maxIdx;
    }
    // Sanitize numeric fields to prevent NaN propagation
    state.sessionScore = Number(state.sessionScore) || 0;
    state.topicCorrect = Number(state.topicCorrect) || 0;
    if (state.statsDelta) {
      state.statsDelta.answered = Number(state.statsDelta.answered) || 0;
      state.statsDelta.correct = Number(state.statsDelta.correct) || 0;
      state.statsDelta.currentStreak = Number(state.statsDelta.currentStreak) || 0;
      state.statsDelta.maxStreak = Number(state.statsDelta.maxStreak) || 0;
    }
    if (state.savedStats) {
      state.savedStats.total_answered = Number(state.savedStats.total_answered) || 0;
      state.savedStats.total_correct = Number(state.savedStats.total_correct) || 0;
      state.savedStats.total_score = Number(state.savedStats.total_score) || 0;
      state.savedStats.current_streak = Number(state.savedStats.current_streak) || 0;
      state.savedStats.max_streak = Number(state.savedStats.max_streak) || 0;
    }
    return state;
  } catch {
    return null;
  }
}

/** True if saved state is recent enough to be an actual page refresh (not a new session) */
export function isRecentQuizState(state) {
  if (!state || !state.timestamp) return false;
  return Date.now() - state.timestamp < AUTO_RESUME_MS;
}

export function clearQuizState() {
  try { localStorage.removeItem(QUIZ_KEY); } catch {}
}
