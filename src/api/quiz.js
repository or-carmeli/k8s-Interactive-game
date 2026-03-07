// ── Quiz API ────────────────────────────────────────────────────────────────
// All quiz content is fetched from Supabase. Answers and explanations are
// never shipped in the client bundle — they're returned only after the user
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
 * Returns: [{ id, q, options }]
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
 * Returns: { correct: bool, correct_answer: number, explanation: string }
 */
export async function checkQuizAnswer(supabase, questionId, selectedIndex) {
  const { data, error } = await supabase.rpc("check_quiz_answer", {
    p_question_id: questionId,
    p_selected: selectedIndex,
  });
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
 * Returns: { correct: bool, correct_answer: number, explanation: string }
 */
export async function checkDailyAnswer(supabase, questionId, selectedIndex) {
  const { data, error } = await supabase.rpc("check_daily_answer", {
    p_question_id: questionId,
    p_selected: selectedIndex,
  });
  if (error) throw error;
  return data;
}

/**
 * Fetch incident metadata (without step answers).
 * Returns: [{ id, icon, title, title_he, description, description_he, difficulty, estimated_time }]
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
