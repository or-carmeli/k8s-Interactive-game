const QUIZ_KEY  = "k8s_quiz_inprogress_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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
    return state;
  } catch {
    return null;
  }
}

export function clearQuizState() {
  try { localStorage.removeItem(QUIZ_KEY); } catch {}
}
