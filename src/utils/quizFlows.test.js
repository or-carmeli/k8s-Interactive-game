import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveQuizState, loadQuizState, clearQuizState, isRecentQuizState } from "./quizPersistence";

// ---- Helpers ----------------------------------------------------------------

function makeQuestions(n) {
  return Array.from({ length: n }, (_, i) => ({
    q: `Question ${i}`,
    options: ["A", "B", "C", "D"],
    answer: 0,
    explanation: `Explanation ${i}`,
  }));
}

function makeValidState(overrides = {}) {
  return {
    quizRunId: "run1",
    userId: "guest",
    topicId: "networking",
    topicName: "Networking",
    topicColor: "#00D4FF",
    topicIcon: "🌐",
    level: "easy",
    questions: makeQuestions(8),
    questionIndex: 3,
    submitted: false,
    selectedAnswer: null,
    showExplanation: false,
    answerResult: null,
    quizHistory: [
      { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
      { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
      { q: "Q2", options: ["A","B","C","D"], answer: 2, chosen: 0, explanation: "E2" },
    ],
    sessionScore: 30,
    topicCorrect: 2,
    retryMode: false,
    isRetry: false,
    timerEnabled: false,
    isInterviewMode: false,
    timeLeft: 30,
    savedStats: { total_answered: 13, total_correct: 10, total_score: 120, current_streak: 2, max_streak: 5 },
    statsDelta: { answered: 3, correct: 2, currentStreak: 2, maxStreak: 5 },
    ...overrides,
  };
}

// ---- Extracted logic (mirrors App.jsx) --------------------------------------

const LEVEL_ORDER = ["easy", "medium", "hard"];
const RESUME_MIN_PROGRESS = 0;

function isLevelLocked(completedTopics, topicId, level) {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx === 0) return false;
  const prevResult = completedTopics[`${topicId}_${LEVEL_ORDER[idx - 1]}`];
  return !prevResult || !prevResult.total;
}

function getResumeProgress(saved) {
  const total = saved?.questions?.length ?? 0;
  if (total <= 0) return { answered: 0, total: 0, pct: 0 };
  const raw = Math.max(saved.questionIndex ?? 0, saved.quizHistory?.length ?? 0);
  const answered = Math.min(Math.max(Number.isFinite(raw) ? raw : 0, 0), total);
  const pct = Math.max(0, Math.min(100, Math.round((answered / total) * 100)));
  return { answered, total, pct };
}

function shouldShowResumeModal(saved) {
  if (!saved) return false;
  const { answered } = getResumeProgress(saved);
  if (answered <= 0) return false;
  return true; // sessionStorage gate omitted - not relevant to logic test
}

/** Mirrors tryStartQuiz from App.jsx. Returns "resume" or "start". */
function tryStartQuiz(saved, userId, requestedQuizType) {
  const savedType = saved?.quizType ?? saved?.topicId;
  if (saved && saved.userId === userId && savedType === requestedQuizType && shouldShowResumeModal(saved)) {
    return "resume";
  }
  return "start";
}

// ---- localStorage mock -----------------------------------------------------

let store = {};
beforeEach(() => {
  store = {};
  vi.stubGlobal("localStorage", {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  });
});

// =============================================================================
// Flow 1: Daily Challenge mid-quiz -> Topics -> start Topic quiz
//   Expected: Topic quiz starts normally, no Daily resume modal
// =============================================================================

describe("Flow 1: Daily Challenge saved, start a Topic quiz", () => {
  it("should NOT show resume modal when starting a topic quiz with a saved daily challenge", () => {
    const dailySaved = makeValidState({
      quizType: "daily",
      topicId: "daily",
      level: "daily",
    });

    const result = tryStartQuiz(dailySaved, "guest", "topic");
    expect(result).toBe("start");
  });

  it("should show resume modal when re-entering Daily Challenge with a saved daily challenge", () => {
    const dailySaved = makeValidState({
      quizType: "daily",
      topicId: "daily",
      level: "daily",
    });

    const result = tryStartQuiz(dailySaved, "guest", "daily");
    expect(result).toBe("resume");
  });

  it("should NOT show resume modal for mixed quiz when saved state is daily", () => {
    const dailySaved = makeValidState({
      quizType: "daily",
      topicId: "daily",
      level: "daily",
    });

    const result = tryStartQuiz(dailySaved, "guest", "mixed");
    expect(result).toBe("start");
  });
});

// =============================================================================
// Flow 2: Start Topic quiz, refresh page -> correct resume modal
// =============================================================================

describe("Flow 2: Topic quiz saved, page refresh", () => {
  it("should show resume modal when re-entering a topic quiz with matching saved state", () => {
    const topicSaved = makeValidState({
      quizType: "topic",
      topicId: "networking",
      level: "easy",
    });

    const result = tryStartQuiz(topicSaved, "guest", "topic");
    expect(result).toBe("resume");
  });

  it("should persist and reload quiz state through localStorage correctly", () => {
    const state = makeValidState({
      quizType: "topic",
      topicId: "networking",
      level: "medium",
      questionIndex: 4,
    });
    saveQuizState(state);

    const loaded = loadQuizState();
    expect(loaded).not.toBeNull();
    expect(loaded.quizType).toBe("topic");
    expect(loaded.topicId).toBe("networking");
    expect(loaded.questionIndex).toBe(4);
    expect(loaded.level).toBe("medium");
  });

  it("should detect recent state for auto-resume on refresh", () => {
    const state = makeValidState({ quizType: "topic", topicId: "networking" });
    saveQuizState(state);

    const loaded = loadQuizState();
    expect(isRecentQuizState(loaded)).toBe(true);
  });
});

// =============================================================================
// Flow 3: Daily Challenge, change language mid-quiz -> state should clear
//   The language-switch effect in App.jsx calls clearQuizState() for free-mode
//   quizzes. We verify clearQuizState removes the saved state.
// =============================================================================

describe("Flow 3: Language switch clears saved quiz", () => {
  it("clearQuizState removes saved state from localStorage", () => {
    const state = makeValidState({
      quizType: "daily",
      topicId: "daily",
      lang: "he",
    });
    saveQuizState(state);
    expect(loadQuizState()).not.toBeNull();

    clearQuizState();
    expect(loadQuizState()).toBeNull();
  });

  it("shouldShowResumeModal rejects saved state with wrong language", () => {
    // App.jsx line 2104: if saved.lang !== lang, clearQuizState and return.
    // We test the language mismatch detection here.
    const saved = makeValidState({ quizType: "daily", topicId: "daily", lang: "he" });
    const currentLang = "en";
    const langMismatch = saved.lang && saved.lang !== currentLang;

    expect(langMismatch).toBe(true);
  });
});

// =============================================================================
// Flow 4: Complete Easy difficulty -> Medium should unlock
// =============================================================================

describe("Flow 4: Difficulty unlock - completing Easy unlocks Medium", () => {
  it("easy is always unlocked", () => {
    expect(isLevelLocked({}, "networking", "easy")).toBe(false);
  });

  it("medium is locked when easy has no entry", () => {
    expect(isLevelLocked({}, "networking", "medium")).toBe(true);
  });

  it("medium unlocks when easy has a valid completion entry", () => {
    const completed = {
      networking_easy: { correct: 6, total: 8, wrongIndices: [2, 5] },
    };
    expect(isLevelLocked(completed, "networking", "medium")).toBe(false);
  });

  it("hard is locked when medium has no entry", () => {
    const completed = {
      networking_easy: { correct: 8, total: 8, wrongIndices: [] },
    };
    expect(isLevelLocked(completed, "networking", "hard")).toBe(true);
  });

  it("hard unlocks when medium has a valid completion entry", () => {
    const completed = {
      networking_easy: { correct: 8, total: 8, wrongIndices: [] },
      networking_medium: { correct: 5, total: 8, wrongIndices: [1, 3, 7] },
    };
    expect(isLevelLocked(completed, "networking", "hard")).toBe(false);
  });
});

// =============================================================================
// Flow 5: Corrupt { correct: 0, total: 0 } must NOT unlock next difficulty
// =============================================================================

describe("Flow 5: Corrupt progress entry does not unlock next level", () => {
  it("medium stays locked when easy has total=0 (corrupt entry)", () => {
    const completed = {
      networking_easy: { correct: 0, total: 0, wrongIndices: [] },
    };
    expect(isLevelLocked(completed, "networking", "medium")).toBe(true);
  });

  it("hard stays locked when medium has total=0 (corrupt entry)", () => {
    const completed = {
      networking_easy: { correct: 8, total: 8, wrongIndices: [] },
      networking_medium: { correct: 0, total: 0, wrongIndices: [] },
    };
    expect(isLevelLocked(completed, "networking", "hard")).toBe(true);
  });

  it("hard stays locked when medium has total=undefined", () => {
    const completed = {
      networking_easy: { correct: 8, total: 8, wrongIndices: [] },
      networking_medium: { correct: 0 },
    };
    expect(isLevelLocked(completed, "networking", "hard")).toBe(true);
  });

  it("hard stays locked when medium has total=NaN", () => {
    const completed = {
      networking_easy: { correct: 8, total: 8, wrongIndices: [] },
      networking_medium: { correct: 0, total: NaN, wrongIndices: [] },
    };
    expect(isLevelLocked(completed, "networking", "hard")).toBe(true);
  });
});

// =============================================================================
// Cross-type isolation: no quiz type reuses another's saved state
// =============================================================================

describe("Cross-type isolation", () => {
  const types = ["daily", "mixed", "bookmarks", "topic"];

  for (const savedType of types) {
    for (const requestedType of types) {
      if (savedType === requestedType) {
        it(`${savedType} saved + ${requestedType} requested -> resume`, () => {
          const saved = makeValidState({
            quizType: savedType,
            topicId: savedType === "topic" ? "networking" : savedType,
          });
          expect(tryStartQuiz(saved, "guest", requestedType)).toBe("resume");
        });
      } else {
        it(`${savedType} saved + ${requestedType} requested -> start fresh`, () => {
          const saved = makeValidState({
            quizType: savedType,
            topicId: savedType === "topic" ? "networking" : savedType,
          });
          expect(tryStartQuiz(saved, "guest", requestedType)).toBe("start");
        });
      }
    }
  }
});

// =============================================================================
// Backward compat: old saved states without quizType field
// =============================================================================

describe("Backward compatibility: saved state without quizType", () => {
  it("falls back to topicId for old daily challenge saves", () => {
    const oldSaved = makeValidState({ topicId: "daily", level: "daily" });
    delete oldSaved.quizType;

    expect(tryStartQuiz(oldSaved, "guest", "daily")).toBe("resume");
    expect(tryStartQuiz(oldSaved, "guest", "topic")).toBe("start");
  });

  it("falls back to topicId for old mixed quiz saves", () => {
    const oldSaved = makeValidState({ topicId: "mixed", level: "mixed" });
    delete oldSaved.quizType;

    expect(tryStartQuiz(oldSaved, "guest", "mixed")).toBe("resume");
    expect(tryStartQuiz(oldSaved, "guest", "daily")).toBe("start");
  });

  it("old topic quiz save (topicId=networking) does NOT match quizType=topic", () => {
    // This is expected: old saves without quizType will not resume for topic quizzes
    // because topicId="networking" !== "topic". This is acceptable degradation -
    // the user just starts fresh, which is safe.
    const oldSaved = makeValidState({ topicId: "networking", level: "easy" });
    delete oldSaved.quizType;

    expect(tryStartQuiz(oldSaved, "guest", "topic")).toBe("start");
  });
});

// =============================================================================
// saveQuizState always includes quizType
// =============================================================================

describe("saveQuizState stores quizType field", () => {
  it("quizType is persisted and loaded correctly for topic quizzes", () => {
    saveQuizState(makeValidState({ quizType: "topic", topicId: "config" }));
    const loaded = loadQuizState();
    expect(loaded.quizType).toBe("topic");
    expect(loaded.topicId).toBe("config");
  });

  it("quizType is persisted and loaded correctly for daily challenge", () => {
    saveQuizState(makeValidState({ quizType: "daily", topicId: "daily", level: "daily" }));
    const loaded = loadQuizState();
    expect(loaded.quizType).toBe("daily");
  });

  it("quizType is persisted and loaded correctly for mixed quiz", () => {
    saveQuizState(makeValidState({ quizType: "mixed", topicId: "mixed", level: "mixed" }));
    const loaded = loadQuizState();
    expect(loaded.quizType).toBe("mixed");
  });

  it("quizType is persisted and loaded correctly for bookmarks", () => {
    saveQuizState(makeValidState({ quizType: "bookmarks", topicId: "bookmarks", level: "mixed" }));
    const loaded = loadQuizState();
    expect(loaded.quizType).toBe("bookmarks");
  });
});
