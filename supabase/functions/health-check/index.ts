// ── Health Check Worker ─────────────────────────────────────────────────────
// Supabase Edge Function that performs real service-specific health checks
// and writes results to system_status_current + system_status_history.
//
// Designed to run on a cron schedule (every 5 minutes).
// Each check validates the actual production path used by the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Service-key client bypasses RLS — needed for writing to monitoring tables
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

// Anon-key client simulates real user experience for health checks
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? SERVICE_KEY;
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

interface CheckResult {
  service_name: string;
  status: "operational" | "degraded" | "down";
  latency_ms: number;
  details: Record<string, unknown>;
}

async function timedCheck(
  name: string,
  fn: () => Promise<{ ok: boolean; details?: Record<string, unknown> }>,
  degradedThresholdMs = 3000
): Promise<CheckResult> {
  const start = performance.now();
  try {
    const { ok, details } = await fn();
    const latency_ms = Math.round(performance.now() - start);
    return {
      service_name: name,
      status: !ok ? "down" : latency_ms > degradedThresholdMs ? "degraded" : "operational",
      latency_ms,
      details: details ?? {},
    };
  } catch (err) {
    const latency_ms = Math.round(performance.now() - start);
    return {
      service_name: name,
      status: "down",
      latency_ms,
      details: { error: String(err) },
    };
  }
}

// ── Individual Health Checks ────────────────────────────────────────────────

/** Database: real SQL query against user_stats table */
async function checkDatabase(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { count, error } = await adminClient
    .from("user_stats")
    .select("user_id", { count: "exact", head: true });
  return { ok: !error, details: error ? { error: error.message } : { row_count: count } };
}

/** Content API: real question fetch RPC (get_mixed_questions) */
async function checkContentAPI(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { data, error } = await anonClient.rpc("get_mixed_questions", {
    p_lang: "en",
    p_limit: 1,
  });
  return {
    ok: !error && Array.isArray(data) && data.length > 0,
    details: error ? { error: error.message } : { questions_returned: data?.length ?? 0 },
  };
}

/** Quiz Engine: check that the answer validation RPC is callable
 *  We call with a non-existent question ID; we expect an error message
 *  "Question not found" which proves the function is running. */
async function checkQuizEngine(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { error } = await adminClient.rpc("check_quiz_answer", {
    p_question_id: -1,
    p_selected: 0,
  });
  // "Question not found" is the expected error — means the function ran successfully
  if (error && error.message?.includes("Question not found")) {
    return { ok: true, details: { note: "RPC reachable (expected error for invalid ID)" } };
  }
  // Rate limit error also means the function is running
  if (error && error.message?.includes("Rate limit")) {
    return { ok: true, details: { note: "RPC reachable (rate limited)" } };
  }
  return { ok: false, details: { error: error?.message ?? "unexpected response" } };
}

/** Leaderboard: real leaderboard read path (get_leaderboard) */
async function checkLeaderboard(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { data, error } = await anonClient.rpc("get_leaderboard", { p_limit: 1 });
  // Empty leaderboard is fine — the RPC just needs to not error
  return {
    ok: !error,
    details: error ? { error: error.message } : { entries: data?.length ?? 0 },
  };
}

/** Authentication: check that Supabase Auth is responding */
async function checkAuthentication(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  // Use the GoTrue health endpoint — simplest way to verify auth is up
  const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: ANON_KEY },
  });
  const ok = res.status === 200;
  let details: Record<string, unknown> = { http_status: res.status };
  if (ok) {
    try { details = { ...details, ...(await res.json()) }; } catch { /* ignore */ }
  }
  return { ok, details };
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Auth is handled by Supabase's built-in JWT verification.
  // Any request with a valid anon or service role key passes through.

  // Run all 5 checks in parallel
  const results = await Promise.all([
    timedCheck("Database",       checkDatabase),
    timedCheck("Content API",    checkContentAPI),
    timedCheck("Quiz Engine",    checkQuizEngine),
    timedCheck("Leaderboard",    checkLeaderboard),
    timedCheck("Authentication", checkAuthentication),
  ]);

  // Write each result to the monitoring tables via the upsert RPC
  const writeResults = await Promise.all(
    results.map((r) =>
      adminClient.rpc("upsert_service_status", {
        p_service_name: r.service_name,
        p_status: r.status,
        p_latency_ms: r.latency_ms,
        p_details: r.details,
      })
    )
  );

  const writeErrors = writeResults.filter((r) => r.error);

  // Auto-incident detection: 3+ consecutive "down" checks for a service
  for (const r of results) {
    if (r.status === "down") {
      // Check if the last 3 history entries for this service are all "down"
      const { data: history } = await adminClient
        .from("system_status_history")
        .select("status")
        .eq("service_name", r.service_name)
        .order("checked_at", { ascending: false })
        .limit(3);

      if (history && history.length >= 3 && history.every((h) => h.status === "down")) {
        // Check if there's already an active incident for this service
        const { data: existing } = await adminClient
          .from("system_incidents")
          .select("id")
          .contains("affected_services", [r.service_name])
          .neq("status", "resolved")
          .limit(1);

        if (!existing || existing.length === 0) {
          await adminClient.rpc("manage_incident", {
            p_title: `${r.service_name} — Service Down`,
            p_severity: "high",
            p_status: "investigating",
            p_affected_services: [r.service_name],
            p_impact: `${r.service_name} has been unreachable for 3+ consecutive health checks.`,
          });
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      checked_at: new Date().toISOString(),
      results,
      write_errors: writeErrors.length,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
