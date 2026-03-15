// ── Monitoring API ──────────────────────────────────────────────────────────
// Fetches real-time system status, uptime history, and incidents from Supabase.

/**
 * Fetch current status of all services.
 * Returns: [{ service_name, status, latency_ms, last_checked, details }]
 */
export async function fetchSystemStatus(supabase) {
  const { data, error } = await supabase.rpc("get_system_status");
  if (error) throw error;
  return data || [];
}

/**
 * Fetch uptime history aggregated by day.
 * Returns: [{ service_name, day, total_checks, ok_checks, uptime_pct }]
 */
export async function fetchUptimeHistory(supabase, days = 30) {
  const { data, error } = await supabase.rpc("get_uptime_history", { p_days: days });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch incidents (active first, then recent resolved).
 * Returns: [{ id, title, severity, status, started_at, resolved_at,
 *             affected_services, impact, root_cause, resolution, prevention }]
 */
export async function fetchIncidentHistory(supabase) {
  const { data, error } = await supabase.rpc("get_all_incidents");
  if (error) throw error;
  return data || [];
}

/**
 * Fetch active and upcoming maintenance windows.
 * Returns: [{ id, title, title_he, description, description_he,
 *             starts_at, ends_at, affected_services, created_at }]
 */
export async function fetchMaintenanceWindows(supabase) {
  const { data, error } = await supabase.rpc("get_active_maintenance");
  if (error) throw error;
  return data || [];
}
