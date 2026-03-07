-- ── Quiz Content Tables ─────────────────────────────────────────────────────
-- Stores all quiz content server-side so answers/explanations never ship
-- to the client bundle. Access is controlled via RPC functions only.

-- 1. Quiz questions (topic-based)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          SERIAL PRIMARY KEY,
  topic_id    TEXT NOT NULL,
  level       TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'he',
  q           TEXT NOT NULL,
  options     JSONB NOT NULL,
  answer      SMALLINT NOT NULL,
  explanation TEXT NOT NULL
);

CREATE INDEX idx_qq_topic_level_lang ON quiz_questions (topic_id, level, lang);

-- 2. Theory snippets (per topic/level/lang)
CREATE TABLE IF NOT EXISTS quiz_theories (
  topic_id TEXT NOT NULL,
  level    TEXT NOT NULL,
  lang     TEXT NOT NULL DEFAULT 'he',
  content  TEXT NOT NULL,
  PRIMARY KEY (topic_id, level, lang)
);

-- 3. Daily challenge questions
CREATE TABLE IF NOT EXISTS daily_questions (
  id          SERIAL PRIMARY KEY,
  lang        TEXT NOT NULL DEFAULT 'he',
  q           TEXT NOT NULL,
  options     JSONB NOT NULL,
  answer      SMALLINT NOT NULL,
  explanation TEXT NOT NULL
);

-- 4. Incident scenarios
CREATE TABLE IF NOT EXISTS incidents (
  id              TEXT PRIMARY KEY,
  icon            TEXT,
  title           TEXT NOT NULL,
  title_he        TEXT,
  description     TEXT,
  description_he  TEXT,
  difficulty      TEXT NOT NULL DEFAULT 'medium',
  estimated_time  TEXT
);

CREATE TABLE IF NOT EXISTS incident_steps (
  id              SERIAL PRIMARY KEY,
  incident_id     TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  step_order      SMALLINT NOT NULL,
  prompt          TEXT NOT NULL,
  prompt_he       TEXT,
  options         JSONB NOT NULL,
  options_he      JSONB,
  answer          SMALLINT NOT NULL,
  explanation     TEXT NOT NULL,
  explanation_he  TEXT
);

CREATE INDEX idx_is_incident ON incident_steps (incident_id, step_order);

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Block direct table reads — all access goes through SECURITY DEFINER RPCs.

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_theories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_steps  ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated to read theories (no sensitive data)
CREATE POLICY "read_theories" ON quiz_theories FOR SELECT USING (true);

-- Allow anon/authenticated to read incident metadata (no answers)
CREATE POLICY "read_incidents" ON incidents FOR SELECT USING (true);

-- Block direct reads on answer-containing tables (use RPCs instead)
-- No SELECT policies = default deny

-- ── RPC Functions (SECURITY DEFINER — bypass RLS) ───────────────────────────

-- Get quiz questions WITHOUT answers/explanations
CREATE OR REPLACE FUNCTION get_quiz_questions(p_topic TEXT, p_level TEXT, p_lang TEXT)
RETURNS TABLE(id INT, q TEXT, options JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options
  FROM quiz_questions
  WHERE topic_id = p_topic AND level = p_level AND lang = p_lang;
$$;

-- Get random mixed questions across all topics/levels (WITHOUT answers)
CREATE OR REPLACE FUNCTION get_mixed_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options
  FROM quiz_questions
  WHERE lang = p_lang
  ORDER BY random()
  LIMIT p_limit;
$$;

-- Check a quiz answer — returns correct/incorrect + explanation
CREATE OR REPLACE FUNCTION check_quiz_answer(p_question_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation
  )
  FROM quiz_questions
  WHERE id = p_question_id;
$$;

-- Get daily questions WITHOUT answers (seeded subset)
CREATE OR REPLACE FUNCTION get_daily_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options
  FROM daily_questions
  WHERE lang = p_lang
  ORDER BY id
  LIMIT p_limit;
$$;

-- Check a daily question answer
CREATE OR REPLACE FUNCTION check_daily_answer(p_question_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation
  )
  FROM daily_questions
  WHERE id = p_question_id;
$$;

-- Get incident steps WITHOUT answers
CREATE OR REPLACE FUNCTION get_incident_steps(p_incident_id TEXT)
RETURNS TABLE(id INT, step_order SMALLINT, prompt TEXT, prompt_he TEXT, options JSONB, options_he JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, step_order, prompt, prompt_he, options, options_he
  FROM incident_steps
  WHERE incident_id = p_incident_id
  ORDER BY step_order;
$$;

-- Check an incident step answer
CREATE OR REPLACE FUNCTION check_incident_answer(p_step_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation,
    'explanation_he', explanation_he
  )
  FROM incident_steps
  WHERE id = p_step_id;
$$;
