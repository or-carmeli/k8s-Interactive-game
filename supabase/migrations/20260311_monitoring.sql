-- ── Real-Time Monitoring System ──────────────────────────────────────────────
-- Tables: system_status_current, system_status_history, system_incidents
-- RPCs: get_system_status, get_uptime_history, get_active_incidents,
--        upsert_service_status, record_incident, purge_old_status_history

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABLES
-- ══════════════════════════════════════════════════════════════════════════════

-- Current status of each service (one row per service, upserted by health worker)
CREATE TABLE IF NOT EXISTS system_status_current (
  service_name  TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'operational'
                  CHECK (status IN ('operational','degraded','down','maintenance')),
  latency_ms    INT,
  last_checked  TIMESTAMPTZ NOT NULL DEFAULT now(),
  details       JSONB DEFAULT '{}'
);

-- Historical status snapshots (one row per service per check interval)
CREATE TABLE IF NOT EXISTS system_status_history (
  id            SERIAL PRIMARY KEY,
  service_name  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'operational'
                  CHECK (status IN ('operational','degraded','down','maintenance')),
  latency_ms    INT,
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ssh_service_time
  ON system_status_history (service_name, checked_at DESC);

-- Incidents (auto-detected or manually created)
CREATE TABLE IF NOT EXISTS system_incidents (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'medium'
                  CHECK (severity IN ('low','medium','high','critical')),
  status        TEXT NOT NULL DEFAULT 'investigating'
                  CHECK (status IN ('investigating','identified','monitoring','resolved')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ,
  affected_services TEXT[] DEFAULT '{}',
  impact        TEXT,
  root_cause    TEXT,
  resolution    TEXT,
  prevention    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_si_status ON system_incidents (status);
CREATE INDEX IF NOT EXISTS idx_si_started ON system_incidents (started_at DESC);


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ROW-LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE system_status_current  ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_incidents       ENABLE ROW LEVEL SECURITY;

-- Public read access (status page is visible to everyone)
CREATE POLICY "public_read_status_current"  ON system_status_current  FOR SELECT USING (true);
CREATE POLICY "public_read_status_history"  ON system_status_history  FOR SELECT USING (true);
CREATE POLICY "public_read_incidents"       ON system_incidents       FOR SELECT USING (true);

-- No direct write via PostgREST — writes go through SECURITY DEFINER RPCs only


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. READ RPCs (STABLE — used by the frontend)
-- ══════════════════════════════════════════════════════════════════════════════

-- Get current status of all services
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS SETOF system_status_current
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM system_status_current ORDER BY service_name;
$$;

-- Get uptime history for the last N days (default 30)
CREATE OR REPLACE FUNCTION get_uptime_history(p_days INT DEFAULT 30)
RETURNS TABLE(service_name TEXT, day DATE, total_checks BIGINT, ok_checks BIGINT, uptime_pct NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    h.service_name,
    DATE(h.checked_at) AS day,
    COUNT(*) AS total_checks,
    COUNT(*) FILTER (WHERE h.status = 'operational') AS ok_checks,
    ROUND(COUNT(*) FILTER (WHERE h.status = 'operational') * 100.0 / NULLIF(COUNT(*), 0), 2) AS uptime_pct
  FROM system_status_history h
  WHERE h.checked_at > now() - (p_days || ' days')::INTERVAL
  GROUP BY h.service_name, DATE(h.checked_at)
  ORDER BY h.service_name, day;
$$;

-- Get incidents (active first, then recent resolved, limited)
CREATE OR REPLACE FUNCTION get_incidents(p_limit INT DEFAULT 20)
RETURNS SETOF system_incidents
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM system_incidents
  ORDER BY
    CASE WHEN status != 'resolved' THEN 0 ELSE 1 END,
    started_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. WRITE RPCs (VOLATILE — used by the health check worker)
-- ══════════════════════════════════════════════════════════════════════════════

-- Upsert service status (called by Edge Function health worker)
-- Writes to system_status_current on every run.
-- Only appends to system_status_history when:
--   • the status changed from the previous value, OR
--   • 30 minutes have elapsed since the last history row for this service
CREATE OR REPLACE FUNCTION upsert_service_status(
  p_service_name TEXT,
  p_status TEXT,
  p_latency_ms INT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  v_prev_status TEXT;
  v_last_history TIMESTAMPTZ;
BEGIN
  -- Capture the previous status before overwriting
  SELECT status INTO v_prev_status
  FROM system_status_current
  WHERE service_name = p_service_name;

  -- Always update the live current-status row
  INSERT INTO system_status_current (service_name, status, latency_ms, last_checked, details)
  VALUES (p_service_name, p_status, p_latency_ms, now(), p_details)
  ON CONFLICT (service_name)
  DO UPDATE SET
    status = EXCLUDED.status,
    latency_ms = EXCLUDED.latency_ms,
    last_checked = EXCLUDED.last_checked,
    details = EXCLUDED.details;

  -- Find when we last wrote a history row for this service
  SELECT MAX(checked_at) INTO v_last_history
  FROM system_status_history
  WHERE service_name = p_service_name;

  -- Append to history only on status change or every 30 minutes
  IF v_prev_status IS DISTINCT FROM p_status
     OR v_last_history IS NULL
     OR now() - v_last_history >= INTERVAL '30 minutes'
  THEN
    INSERT INTO system_status_history (service_name, status, latency_ms, checked_at)
    VALUES (p_service_name, p_status, p_latency_ms, now());
  END IF;
END;
$$;

-- Create or update an incident
CREATE OR REPLACE FUNCTION manage_incident(
  p_title TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_status TEXT DEFAULT 'investigating',
  p_affected_services TEXT[] DEFAULT '{}',
  p_impact TEXT DEFAULT NULL,
  p_root_cause TEXT DEFAULT NULL,
  p_resolution TEXT DEFAULT NULL,
  p_prevention TEXT DEFAULT NULL,
  p_incident_id INT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  result_id INT;
BEGIN
  IF p_incident_id IS NOT NULL THEN
    UPDATE system_incidents SET
      title = p_title,
      severity = p_severity,
      status = p_status,
      affected_services = p_affected_services,
      impact = COALESCE(p_impact, impact),
      root_cause = COALESCE(p_root_cause, root_cause),
      resolution = COALESCE(p_resolution, resolution),
      prevention = COALESCE(p_prevention, prevention),
      resolved_at = CASE WHEN p_status = 'resolved' AND resolved_at IS NULL THEN now() ELSE resolved_at END
    WHERE id = p_incident_id
    RETURNING id INTO result_id;
  ELSE
    INSERT INTO system_incidents (title, severity, status, affected_services, impact, root_cause, resolution, prevention)
    VALUES (p_title, p_severity, p_status, p_affected_services, p_impact, p_root_cause, p_resolution, p_prevention)
    RETURNING id INTO result_id;
  END IF;
  RETURN result_id;
END;
$$;

-- Purge history older than N days
CREATE OR REPLACE FUNCTION purge_old_status_history(p_days INT DEFAULT 90)
RETURNS INT
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  deleted INT;
BEGIN
  DELETE FROM system_status_history
  WHERE checked_at < now() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. SEED — Initial services + historical incidents
-- ══════════════════════════════════════════════════════════════════════════════

-- Seed current service status (all operational initially)
INSERT INTO system_status_current (service_name, status)
VALUES
  ('Quiz Engine',    'operational'),
  ('Authentication', 'operational'),
  ('Leaderboard',    'operational'),
  ('Database',       'operational'),
  ('Content API',    'operational')
ON CONFLICT (service_name) DO NOTHING;

-- Seed historical incidents
INSERT INTO system_incidents (title, severity, status, started_at, resolved_at, affected_services, impact, root_cause, resolution, prevention) VALUES
(
  'Quiz Submission Blocked After Session Return',
  'medium',
  'resolved',
  '2026-03-08 10:00:00+00',
  '2026-03-08 12:00:00+00',
  ARRAY['Quiz Engine'],
  'Users who completed a quiz and started a new session were unable to submit answers. Additionally, a visual glitch caused the selected answer to briefly flash red before turning green during server-side validation.',
  'A synchronous mutex ref (submittingRef) introduced to prevent double-submission was not reset on quiz start, quiz resume, or retry-mode completion. It remained locked from the previous session, silently blocking all future submissions. The visual flash was caused by rendering answer styling before the async RPC response arrived.',
  'Added submittingRef reset to startTopic, handleResumeQuiz, and retry-mode completion paths. Gated answer color styling on the checkingAnswer flag to prevent premature rendering.',
  'All ref-based mutex guards must be reset in every code path that initializes a new quiz session. No user data was lost.'
),
(
  'Answer Validation Service Disruption',
  'high',
  'resolved',
  '2026-03-08 06:00:00+00',
  '2026-03-08 06:30:00+00',
  ARRAY['Quiz Engine', 'Content API'],
  'All answer-check RPCs returned errors. The client-side fallback produced incorrect results and empty explanations across all question types (quiz, daily, incident).',
  'A security hardening migration introduced rate-limiting writes (INSERT) inside database functions marked as STABLE. The API gateway enforces read-only transactions for STABLE functions, causing the write operation to fail silently.',
  'Function volatility changed from STABLE to VOLATILE via a corrective migration patch, allowing read-write transactions. Deployed and verified within 30 minutes of detection.',
  'Added volatility validation to migration review checklist — any function containing INSERT/UPDATE/DELETE must be marked VOLATILE. No user data was lost.'
),
(
  'Authentication & Leaderboard Outage',
  'high',
  'resolved',
  '2026-03-07 08:00:00+00',
  '2026-03-07 12:00:00+00',
  ARRAY['Authentication', 'Leaderboard'],
  'Users were unable to sign in or sign up. Leaderboard data failed to load. Core quiz functionality remained operational in offline mode.',
  'During a security hardening deployment, Supabase project configuration was disrupted, causing authentication endpoints and leaderboard RPC calls to fail.',
  'Corrected the Supabase configuration and verified auth flow and leaderboard queries were restored.',
  'Security hardening changes are now deployed incrementally with post-deployment smoke tests for authentication and leaderboard endpoints. No user data was lost.'
);
