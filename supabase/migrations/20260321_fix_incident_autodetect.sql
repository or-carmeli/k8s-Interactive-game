-- ── Fix auto-incident detection timing ───────────────────────────────────────
-- The 30-minute history throttle prevented auto-incident creation because
-- 3 consecutive "down" entries required 60+ minutes of continuous downtime.
-- Fix: always write to history when status is non-operational, only throttle
-- when the service is healthy (operational).

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

  -- Always write to history when non-operational (enables fast auto-incident detection).
  -- Throttle to every 30 minutes only when operational (reduces noise).
  IF p_status != 'operational'
     OR v_prev_status IS DISTINCT FROM p_status
     OR v_last_history IS NULL
     OR now() - v_last_history >= INTERVAL '30 minutes'
  THEN
    INSERT INTO system_status_history (service_name, status, latency_ms, checked_at)
    VALUES (p_service_name, p_status, p_latency_ms, now());
  END IF;
END;
$$;
