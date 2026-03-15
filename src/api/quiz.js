// ── Quiz API ────────────────────────────────────────────────────────────────
// All quiz content is fetched from Supabase. Answers and explanations are
// never shipped in the client bundle - they're returned only after the user
// submits an answer, via server-side RPC validation.

/**
 * Fetch quiz questions for a topic/level (WITHOUT answers or explanations).
 * Returns: [{ id, q, options }]
 */
export async function fetchQuizQuestions(supabase, topicId, level, lang) {
  const { data, error } = await supabase.rpc("get_quiz_questions", {
    p_topic: topicId,
    p_level: level,
    p_lang: lang,
  });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch random mixed questions across all topics (WITHOUT answers).
 * Returns: [{ id, q, options, level }]
 */
export async function fetchMixedQuestions(supabase, lang, limit = 10) {
  const { data, error } = await supabase.rpc("get_mixed_questions", {
    p_lang: lang,
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

/**
 * Validate a quiz answer server-side.
 * When quizRunId is provided and the answer is correct, the server atomically
 * increments the user's total_score (idempotent per question+run).
 * Points are derived entirely from the question's DB level - the client
 * does not influence scoring.
 * Returns: { correct: bool, correct_answer: number, explanation: string }
 */
export async function checkQuizAnswer(supabase, questionId, selectedIndex, quizRunId = null) {
  const params = {
    p_question_id: questionId,
    p_selected: selectedIndex,
  };
  if (quizRunId) params.p_quiz_run_id = quizRunId;
  const { data, error } = await supabase.rpc("check_quiz_answer", params);
  if (error) throw error;
  return data;
}

/**
 * Fetch theory text for a topic/level.
 * Returns: string (theory content) or null
 */
export async function fetchTheory(supabase, topicId, level, lang) {
  const { data, error } = await supabase
    .from("quiz_theories")
    .select("content")
    .eq("topic_id", topicId)
    .eq("level", level)
    .eq("lang", lang)
    .single();
  if (error) return null;
  return data?.content || null;
}

/**
 * Fetch daily challenge questions (WITHOUT answers).
 * Returns: [{ id, q, options }]
 */
export async function fetchDailyQuestions(supabase, lang, limit = 10) {
  const { data, error } = await supabase.rpc("get_daily_questions", {
    p_lang: lang,
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

/**
 * Validate a daily question answer server-side.
 * When quizRunId is provided and the answer is correct, the server atomically
 * increments the user's total_score by 15 (idempotent per question+run).
 * Returns: { correct: bool, correct_answer: number, explanation: string }
 */
export async function checkDailyAnswer(supabase, questionId, selectedIndex, quizRunId = null) {
  const params = {
    p_question_id: questionId,
    p_selected: selectedIndex,
  };
  if (quizRunId) params.p_quiz_run_id = quizRunId;
  const { data, error } = await supabase.rpc("check_daily_answer", params);
  if (error) throw error;
  return data;
}

/**
 * Fetch incident metadata (without step answers).
 * Returns: [{ id, icon, title, title_he, description, description_he, difficulty, estimated_time }]
 *
 * NOTE: Currently unused - incident metadata comes from the static INCIDENTS
 * array (src/content/incidents.js) which uses camelCase keys (titleHe, descriptionHe).
 * If this function is wired into the UI, its snake_case columns (title_he,
 * description_he) must be normalized to camelCase before rendering, otherwise
 * getLocalizedField() will not detect the Hebrew variants. See getIncidentStep()
 * in App.jsx for the pattern used with incident steps.
 */
export async function fetchIncidents(supabase) {
  const { data, error } = await supabase
    .from("incidents")
    .select("*");
  if (error) throw error;
  return data || [];
}

/**
 * Fetch incident steps (WITHOUT answers/explanations).
 * Returns: [{ id, step_order, prompt, prompt_he, options, options_he }]
 */
export async function fetchIncidentSteps(supabase, incidentId) {
  const { data, error } = await supabase.rpc("get_incident_steps", {
    p_incident_id: incidentId,
  });
  if (error) throw error;
  return data || [];
}

/**
 * Validate an incident step answer server-side.
 * Returns: { correct: bool, correct_answer: number, explanation: string, explanation_he: string }
 */
export async function checkIncidentAnswer(supabase, stepId, selectedIndex) {
  const { data, error } = await supabase.rpc("check_incident_answer", {
    p_step_id: stepId,
    p_selected: selectedIndex,
  });
  if (error) throw error;
  return data;
}

/**
 * Fetch leaderboard (top N players).
 * Returns: [{ username, total_score, max_streak }]
 */
export async function fetchLeaderboard(supabase, limit = 10) {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch the current user's rank.
 * Returns: { rank: number, score: number }
 */
export async function fetchUserRank(supabase, userId) {
  const { data, error } = await supabase.rpc("get_user_rank", {
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}

/**
 * Save user progress via server RPC.
 * The server does NOT accept total_score - it is managed exclusively
 * by the answer-check RPCs (server-authoritative scoring).
 */
export async function saveUserProgress(supabase, {
  username, bestScore, totalAnswered, totalCorrect,
  maxStreak, currentStreak, completedTopics, achievements, topicStats,
}) {
  const { error } = await supabase.rpc("save_user_progress", {
    p_username: username,
    p_best_score: bestScore,
    p_total_answered: totalAnswered,
    p_total_correct: totalCorrect,
    p_max_streak: maxStreak,
    p_current_streak: currentStreak,
    p_completed_topics: completedTopics,
    p_achievements: achievements,
    p_topic_stats: topicStats,
  });
  if (error) throw error;
}
