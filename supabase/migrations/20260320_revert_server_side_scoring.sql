-- ── REVERT: Server-side scoring overloads ────────────────────────────────────
-- Drop the overloaded function signatures created by 20260318 and 20260319.
-- These created 4-param and 3-param overloads alongside the original 2-param
-- functions, causing PostgREST to fail with ambiguous function resolution.
-- The original 2-param functions from 20260309_security_hardening.sql remain.

-- Drop the 4-param overload of check_quiz_answer
DROP FUNCTION IF EXISTS check_quiz_answer(INT, SMALLINT, TEXT, TEXT);

-- Drop the 3-param overload of check_daily_answer
DROP FUNCTION IF EXISTS check_daily_answer(INT, SMALLINT, TEXT);

-- Drop the save_user_progress RPC (not yet used by deployed code)
DROP FUNCTION IF EXISTS save_user_progress(TEXT, BIGINT, INT, INT, INT, INT, JSONB, TEXT[], JSONB);

-- score_events table is harmless to keep (no data yet), but drop to clean up
DROP TABLE IF EXISTS score_events;
