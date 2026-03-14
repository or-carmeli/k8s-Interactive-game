import { getLocalizedField } from "../utils/i18n";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LVL_ORDER = ["easy", "medium", "hard"];

function topicProgress(topicId, completedTopics) {
  let score = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (!r || !r.total) return;
    score += r.retryComplete ? 1 : Math.min(r.correct ?? 0, r.total) / r.total;
  });
  const pct = LVL_ORDER.length > 0 ? Math.min(100, Math.round((score / LVL_ORDER.length) * 100)) : 0;
  return Number.isFinite(pct) ? pct : 0;
}

function isTopicCompleted(topicId, completedTopics) {
  return LVL_ORDER.every(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    return r && r.total && (r.correct === r.total || r.retryComplete);
  });
}

function getTopicStatus(topicId, completedTopics) {
  const hasAny = LVL_ORDER.some(lvl => completedTopics[`${topicId}_${lvl}`]);
  if (!hasAny) return "not_started";
  if (isTopicCompleted(topicId, completedTopics)) return "completed";
  return "in_progress";
}

function getTopicAccuracy(topicId, topicStats, completedTopics) {
  if (topicStats[topicId] && topicStats[topicId].answered > 0) {
    return Math.round(topicStats[topicId].correct / topicStats[topicId].answered * 100);
  }
  let answered = 0, correct = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (r) { answered += (r.total || 0); correct += (r.correct || 0); }
  });
  return answered > 0 ? Math.round(correct / answered * 100) : 0;
}

function getTopicAnswered(topicId, topicStats, completedTopics) {
  if (topicStats[topicId] && topicStats[topicId].answered > 0) {
    return topicStats[topicId].answered;
  }
  let answered = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (r) answered += (r.total || 0);
  });
  return answered;
}

function accuracyColor(pct) {
  if (pct < 70) return "#EF4444";
  if (pct < 85) return "#F59E0B";
  return "#10B981";
}

const FREE_MODES = new Set(["mixed", "daily", "bookmarks"]);

function isFreeMode(topicId) {
  return FREE_MODES.has(topicId);
}

const INCIDENT_DIFFICULTY = {
  easy:         { label: "Easy",         labelHe: "קל",     color: "#10B981" },
  intermediate: { label: "Intermediate", labelHe: "בינוני", color: "#F59E0B" },
  hard:         { label: "Hard",         labelHe: "קשה",    color: "#EF4444" },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function StatsView({
  stats, completedTopics, topicStats, topics, achievements,
  unlockedAchievements, completedIncidentIds, incidents,
  dailyStreak, levelOrder, levelConfig,
  lang, dir, t, onBack,
}) {
  const accuracy = stats.total_answered > 0
    ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;
  const wrongCount = stats.total_answered - stats.total_correct;
  const completedLevelCount = Object.keys(completedTopics)
    .filter(k => {
      const parts = k.split("_");
      const topicId = parts.slice(0, -1).join("_");
      return !isFreeMode(topicId);
    }).length;
  const totalLevels = topics.length * levelOrder.length;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (stats.total_answered === 0) {
    return (
      <div className="page-pad" style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px", animation: "fadeIn 0.3s ease", direction: dir }}>
        <button onClick={onBack} style={backBtnStyle}>
          {dir === "rtl" ? "→" : "←"} {dir === "rtl" ? "חזרה" : "Back"}
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--text-primary)", marginBottom: 8 }}>
          {t("statsTitle")}
        </h2>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {t("statsEmptyTitle")}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {t("statsEmptyBody")}
          </div>
        </div>
      </div>
    );
  }

  // ── Primary stats (hero cards) ────────────────────────────────────────────
  const primaryStats = [
    { label: t("statsAccuracy"), value: `${accuracy}%`, color: accuracyColor(accuracy) },
    { label: t("score"),         value: stats.total_score, color: "#F59E0B" },
    { label: t("streak"),        value: `x${stats.current_streak}`, color: "#FF6B35",
      sub: `${t("statsBestStreak")}: ${stats.max_streak}` },
  ];

  // ── Secondary stats (compact row) ─────────────────────────────────────────
  const secondaryStats = [
    { label: t("statsTotalAnswered"),  value: stats.total_answered },
    { label: t("statsCorrectAnswers"), value: stats.total_correct },
    { label: t("statsWrongAnswers"),   value: wrongCount },
  ];

  // ── Incident progress ─────────────────────────────────────────────────────
  const incidentsByDiff = { easy: 0, intermediate: 0, hard: 0 };
  const incidentsDoneByDiff = { easy: 0, intermediate: 0, hard: 0 };
  (incidents || []).forEach(inc => {
    if (incidentsByDiff[inc.difficulty] !== undefined) incidentsByDiff[inc.difficulty]++;
    if (completedIncidentIds.includes(inc.id) && incidentsDoneByDiff[inc.difficulty] !== undefined)
      incidentsDoneByDiff[inc.difficulty]++;
  });
  const totalIncidents = (incidents || []).length;
  const doneIncidents = completedIncidentIds.length;
  const incidentPct = totalIncidents > 0 ? Math.round(doneIncidents / totalIncidents * 100) : 0;

  const unlockedCount = achievements.filter(a => unlockedAchievements.includes(a.id)).length;

  return (
    <div className="page-pad" style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px", animation: "fadeIn 0.3s ease", direction: dir }}>
      {/* ── Back button ───────────────────────────────────────────────────────── */}
      <button onClick={onBack} style={backBtnStyle}>
        {dir === "rtl" ? "→" : "←"} {dir === "rtl" ? "חזרה" : "Back"}
      </button>

      {/* ── Title ─────────────────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--text-primary)", marginBottom: 28, marginTop: 0 }}>
        {t("statsTitle")}
      </h2>

      {/* ── Primary stats (hero row) ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
        {primaryStats.map((s, i) => (
          <div key={i} style={{
            background: "var(--glass-2)",
            border: "1px solid var(--glass-8)",
            borderRadius: 14,
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginTop: 2 }}>{s.label}</span>
            {s.sub && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{s.sub}</span>}
          </div>
        ))}
      </div>

      {/* ── Secondary stats (compact row) ─────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginBottom: 8,
        padding: "8px 0",
      }}>
        {secondaryStats.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "block" }}>{s.value}</span>
            <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Badges row ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
        <Badge text={`${completedLevelCount}/${totalLevels} ${t("statsCompletedLevels")}`} />
        {dailyStreak && dailyStreak.streak > 0 && (
          <Badge text={`🔥 ${dailyStreak.streak} ${t("dailyStreak")}`} />
        )}
      </div>

      {/* ── Topic breakdown ───────────────────────────────────────────────────── */}
      <SectionLabel text={t("statsTopicBreakdown")} />
      <div style={{ marginBottom: 32 }}>
        {topics.map(topic => {
          const progress = topicProgress(topic.id, completedTopics);
          const status = getTopicStatus(topic.id, completedTopics);
          const acc = getTopicAccuracy(topic.id, topicStats, completedTopics);
          const answered = getTopicAnswered(topic.id, topicStats, completedTopics);

          const statusLabel = status === "completed" ? t("statsCompleted")
            : status === "in_progress" ? t("statsInProgress")
            : t("statsNotStarted");
          const statusColor = status === "completed" ? "#10B981"
            : status === "in_progress" ? "#F59E0B"
            : "var(--text-dim)";

          return (
            <div key={topic.id} style={{
              background: "var(--glass-2)",
              border: "1px solid var(--glass-6)",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 8,
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{topic.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{topic.name}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: statusColor,
                  background: `${statusColor}12`,
                  padding: "2px 7px",
                  borderRadius: 6,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>{statusLabel}</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 5, background: "var(--glass-5)", borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${progress}%`,
                  background: topic.color,
                  transition: "width 0.5s ease",
                }} />
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  {progress}% {t("statsLearningProgress")}
                </span>
                {answered > 0 && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      {answered} {t("statsAnswered")}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: accuracyColor(acc),
                    }}>
                      {acc}%
                    </span>
                  </div>
                )}
              </div>

              {/* Level pills */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {levelOrder.map(lvl => {
                  const r = completedTopics[`${topic.id}_${lvl}`];
                  const cfg = levelConfig[lvl];
                  const done = r && r.total && (r.correct === r.total || r.retryComplete);
                  const attempted = !!r;
                  return (
                    <div key={lvl} style={{
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 6,
                      background: done ? `${cfg.color}15` : "var(--glass-3)",
                      border: `1px solid ${done ? `${cfg.color}30` : "var(--glass-5)"}`,
                      color: done ? cfg.color : attempted ? "var(--text-secondary)" : "var(--text-dim)",
                      fontWeight: done ? 700 : 400,
                      display: "flex", alignItems: "center", gap: 3,
                    }}>
                      {done ? "✓" : cfg.icon} {getLocalizedField(cfg, "label", lang)}
                      {attempted && r.total > 0 && (
                        <span style={{ fontSize: 9, opacity: 0.6 }}>{r.correct}/{r.total}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Achievements ──────────────────────────────────────────────────────── */}
      <SectionLabel text={`${t("statsAchievements")} (${unlockedCount}/${achievements.length})`} />
      <div style={{ marginBottom: 32 }}>
        {achievements.map(ach => {
          const unlocked = unlockedAchievements.includes(ach.id);
          return (
            <div key={ach.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: unlocked ? "var(--glass-3)" : "transparent",
              border: unlocked ? "1px solid var(--glass-6)" : "1px solid transparent",
              borderRadius: 10,
              marginBottom: 4,
              opacity: unlocked ? 1 : 0.35,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ach.icon}</span>
              <span style={{
                flex: 1,
                fontSize: 12, fontWeight: unlocked ? 600 : 400,
                color: unlocked ? "var(--text-primary)" : "var(--text-dim)",
              }}>
                {getLocalizedField(ach, "name", lang)}
              </span>
              {unlocked
                ? <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>✓</span>
                : <span style={{ fontSize: 10, color: "var(--text-disabled)" }}>🔒</span>
              }
            </div>
          );
        })}
      </div>

      {/* ── Incidents ─────────────────────────────────────────────────────────── */}
      {totalIncidents > 0 && (
        <>
          <SectionLabel text={t("statsIncidents")} />
          <div style={{
            background: "var(--glass-2)",
            border: "1px solid var(--glass-6)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 32,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                🚨 {t("statsIncidents")}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {doneIncidents}/{totalIncidents}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 5, background: "var(--glass-5)", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${incidentPct}%`,
                background: "#EF4444",
                transition: "width 0.5s ease",
              }} />
            </div>

            {/* Per-difficulty breakdown */}
            <div style={{ display: "flex", gap: 6 }}>
              {["easy", "intermediate", "hard"].map(diff => (
                <div key={diff} style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "6px 4px",
                  background: "var(--glass-2)",
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {incidentsDoneByDiff[diff]}/{incidentsByDiff[diff]}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 1 }}>
                    {getLocalizedField(INCIDENT_DIFFICULTY[diff], "label", lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* bottom spacing */}
      <div style={{ height: 40 }} />
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ text }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
      marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      {text}
    </div>
  );
}

function Badge({ text }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500,
      color: "var(--text-muted)",
      background: "var(--glass-3)",
      border: "1px solid var(--glass-6)",
      padding: "3px 10px",
      borderRadius: 20,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    }}>
      {text}
    </span>
  );
}

const backBtnStyle = {
  background: "var(--glass-4)",
  border: "1px solid var(--glass-9)",
  color: "var(--text-secondary)",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 6,
};
