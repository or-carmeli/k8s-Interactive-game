import { describe, it, expect, vi } from "vitest";
import { checkQuizAnswer, checkDailyAnswer, saveUserProgress } from "./quiz";

// ── Helpers ─────────────────────────────────────────────────────────────────

function mockSupabase(returnValue = { data: { correct: true, correct_answer: 1, explanation: "ok" }, error: null }) {
  const rpc = vi.fn().mockResolvedValue(returnValue);
  return { rpc, __calls: () => rpc.mock.calls };
}

// ── checkQuizAnswer ─────────────────────────────────────────────────────────

describe("checkQuizAnswer", () => {
  it("sends only base params when quizRunId is null", async () => {
    const sb = mockSupabase();
    await checkQuizAnswer(sb, 42, 1);

    expect(sb.rpc).toHaveBeenCalledWith("check_quiz_answer", {
      p_question_id: 42,
      p_selected: 1,
    });
  });

  it("includes p_quiz_run_id when provided", async () => {
    const sb = mockSupabase();
    await checkQuizAnswer(sb, 42, 1, "run123");

    expect(sb.rpc).toHaveBeenCalledWith("check_quiz_answer", {
      p_question_id: 42,
      p_selected: 1,
      p_quiz_run_id: "run123",
    });
  });

  it("does not send p_level (server derives points from DB)", async () => {
    const sb = mockSupabase();
    await checkQuizAnswer(sb, 10, 2, "run456");

    const args = sb.rpc.mock.calls[0][1];
    expect(args).not.toHaveProperty("p_level");
  });

  it("omits p_quiz_run_id for retries (null quizRunId)", async () => {
    const sb = mockSupabase();
    await checkQuizAnswer(sb, 10, 2, null);

    const args = sb.rpc.mock.calls[0][1];
    expect(args).not.toHaveProperty("p_quiz_run_id");
  });

  it("throws on RPC error", async () => {
    const sb = mockSupabase({ data: null, error: new Error("rate limit") });
    await expect(checkQuizAnswer(sb, 1, 0)).rejects.toThrow("rate limit");
  });
});

// ── checkDailyAnswer ────────────────────────────────────────────────────────

describe("checkDailyAnswer", () => {
  it("sends only base params when quizRunId is null", async () => {
    const sb = mockSupabase();
    await checkDailyAnswer(sb, 7, 3);

    expect(sb.rpc).toHaveBeenCalledWith("check_daily_answer", {
      p_question_id: 7,
      p_selected: 3,
    });
  });

  it("includes p_quiz_run_id when provided", async () => {
    const sb = mockSupabase();
    await checkDailyAnswer(sb, 7, 3, "dailyRun1");

    expect(sb.rpc).toHaveBeenCalledWith("check_daily_answer", {
      p_question_id: 7,
      p_selected: 3,
      p_quiz_run_id: "dailyRun1",
    });
  });

  it("omits p_quiz_run_id for retries (null)", async () => {
    const sb = mockSupabase();
    await checkDailyAnswer(sb, 7, 3, null);

    const args = sb.rpc.mock.calls[0][1];
    expect(args).not.toHaveProperty("p_quiz_run_id");
  });
});

// ── saveUserProgress ────────────────────────────────────────────────────────

describe("saveUserProgress", () => {
  it("calls save_user_progress RPC with all expected params", async () => {
    const sb = mockSupabase({ error: null });
    await saveUserProgress(sb, {
      username: "testuser",
      bestScore: 150,
      totalAnswered: 20,
      totalCorrect: 15,
      maxStreak: 8,
      currentStreak: 3,
      completedTopics: { networking_easy: { correct: 5, total: 7 } },
      achievements: ["first_quiz", "streak_5"],
      topicStats: { networking: { answered: 10, correct: 8 } },
    });

    expect(sb.rpc).toHaveBeenCalledWith("save_user_progress", {
      p_username: "testuser",
      p_best_score: 150,
      p_total_answered: 20,
      p_total_correct: 15,
      p_max_streak: 8,
      p_current_streak: 3,
      p_completed_topics: { networking_easy: { correct: 5, total: 7 } },
      p_achievements: ["first_quiz", "streak_5"],
      p_topic_stats: { networking: { answered: 10, correct: 8 } },
    });
  });

  it("does NOT send total_score to the server", async () => {
    const sb = mockSupabase({ error: null });
    await saveUserProgress(sb, {
      username: "u",
      bestScore: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      maxStreak: 0,
      currentStreak: 0,
      completedTopics: {},
      achievements: [],
      topicStats: {},
    });

    const args = sb.rpc.mock.calls[0][1];
    expect(args).not.toHaveProperty("p_total_score");
    expect(args).not.toHaveProperty("total_score");
  });

  it("throws on RPC error", async () => {
    const sb = mockSupabase({ error: new Error("Not authenticated") });
    await expect(saveUserProgress(sb, {
      username: "u", bestScore: 0, totalAnswered: 0, totalCorrect: 0,
      maxStreak: 0, currentStreak: 0, completedTopics: {}, achievements: [], topicStats: {},
    })).rejects.toThrow("Not authenticated");
  });
});
