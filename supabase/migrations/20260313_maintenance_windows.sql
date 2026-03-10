-- ── Maintenance Windows ──────────────────────────────────────────────────────
-- Planned maintenance windows displayed on the status page.
-- Managed via SQL or Supabase Dashboard — no admin UI.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABLE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id                SERIAL PRIMARY KEY,
  title             TEXT NOT NULL,
  title_he          TEXT,
  description       TEXT,
  description_he    TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  affected_services TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_mw_window
  ON maintenance_windows (starts_at, ends_at);


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ROW-LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_maintenance" ON maintenance_windows
  FOR SELECT USING (true);


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. READ RPCs
-- ══════════════════════════════════════════════════════════════════════════════

-- Active + upcoming windows (within 7 days)
CREATE OR REPLACE FUNCTION get_active_maintenance()
RETURNS SETOF maintenance_windows
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM maintenance_windows
  WHERE ends_at > now()
    AND starts_at < now() + INTERVAL '7 days'
  ORDER BY starts_at ASC;
$$;

-- Simple boolean check for the health-check edge function
CREATE OR REPLACE FUNCTION is_maintenance_active()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM maintenance_windows
    WHERE starts_at <= now() AND ends_at > now()
  );
$$;
