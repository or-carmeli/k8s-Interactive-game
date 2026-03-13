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

const INCIDENT_COLORS = {
  easy: "#10B981",
  intermediate: "#F59E0B",
  hard: "#EF4444",
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

  // ── Summary stats config ───────────────────────────────────────────────────
  const summaryCards = [
    { icon: "🎯", label: t("statsAccuracy"),       value: `${accuracy}%`,           color: "#10B981" },
    { icon: "📝", label: t("statsTotalAnswered"),   value: stats.total_answered,     color: "#00D4FF" },
    { icon: "✅", label: t("statsCorrectAnswers"),  value: stats.total_correct,      color: "#10B981" },
    { icon: "❌", label: t("statsWrongAnswers"),    value: wrongCount,               color: "#EF4444" },
    { icon: "⭐", label: t("score"),                value: stats.total_score,        color: "#F59E0B" },
    { icon: "🔥", label: t("streak"),               value: `x${stats.current_streak}`, color: "#FF6B35",
      sub: `${t("statsBestStreak")}: ${stats.max_streak}` },
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

  return (
    <div className="page-pad" style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px", animation: "fadeIn 0.3s ease", direction: dir }}>
      {/* ── Back button ───────────────────────────────────────────────────────── */}
      <button onClick={onBack} style={backBtnStyle}>
        {dir === "rtl" ? "→" : "←"} {dir === "rtl" ? "חזרה" : "Back"}
      </button>

      {/* ── Title ─────────────────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--text-primary)", marginBottom: 24, marginTop: 0 }}>
        {t("statsTitle")}
      </h2>

      {/* ── Summary overview ──────────────────────────────────────────────────── */}
      <SectionLabel text={t("statsOverview")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 10 }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{
            background: `${s.color}08`,
            border: `1px solid ${s.color}22`,
            borderRadius: 12,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</span>
            {s.sub && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{s.sub}</span>}
          </div>
        ))}
      </div>

      {/* ── Badges row ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        <Badge icon="📚" text={`${completedLevelCount}/${totalLevels} ${t("statsCompletedLevels")}`} color="#00D4FF" />
        {dailyStreak && dailyStreak.streak > 0 && (
          <Badge icon="🔥" text={`${dailyStreak.streak} ${t("dailyStreak")}`} color="#FF6B35" />
        )}
      </div>

      {/* ── Topic breakdown ───────────────────────────────────────────────────── */}
      <SectionLabel text={t("statsTopicBreakdown")} />
      <div style={{ marginBottom: 24 }}>
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
              border: "1px solid var(--glass-7)",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 12,
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 16,
                    width: 32, height: 32,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${topic.color}14`,
                    borderRadius: 8,
                    flexShrink: 0,
                  }}>{topic.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{topic.name}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: statusColor,
                  background: `${statusColor}14`,
                  padding: "2px 8px",
                  borderRadius: 10,
                }}>{statusLabel}</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 7, background: "var(--glass-6)", borderRadius: 4, marginBottom: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${topic.color}, ${topic.color}88)`,
                  transition: "width 0.5s ease",
                }} />
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {progress}% {t("statsLearningProgress")}
                </span>
                {answered > 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {answered} {t("statsAnswered")}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: accuracyColor(acc),
                    }}>
                      {acc}% {t("statsAccuracy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Level pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {levelOrder.map(lvl => {
                  const r = completedTopics[`${topic.id}_${lvl}`];
                  const cfg = levelConfig[lvl];
                  const done = r && r.total && (r.correct === r.total || r.retryComplete);
                  const attempted = !!r;
                  return (
                    <div key={lvl} style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 8,
                      background: done ? `${cfg.color}18` : "var(--glass-3)",
                      border: `1px solid ${done ? `${cfg.color}40` : "var(--glass-6)"}`,
                      color: done ? cfg.color : attempted ? "var(--text-secondary)" : "var(--text-dim)",
                      fontWeight: done ? 700 : 400,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      {done ? "✓" : cfg.icon} {lang === "en" ? cfg.labelEn : cfg.label}
                      {attempted && r.total > 0 && (
                        <span style={{ fontSize: 10, opacity: 0.7 }}>{r.correct}/{r.total}</span>
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
      <SectionLabel text={t("statsAchievements")} />
      <div style={{ marginBottom: 24 }}>
        {achievements.map(ach => {
          const unlocked = unlockedAchievements.includes(ach.id);
          return (
            <div key={ach.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: unlocked ? "var(--glass-3)" : "var(--glass-1)",
              border: `1px solid ${unlocked ? "var(--glass-8)" : "var(--glass-4)"}`,
              borderRadius: 12,
              marginBottom: 8,
              opacity: unlocked ? 1 : 0.4,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{ach.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? "var(--text-primary)" : "var(--text-dim)" }}>
                  {lang === "en" ? ach.nameEn : ach.name}
                </div>
              </div>
              {unlocked
                ? <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>✓</span>
                : <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>🔒</span>
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
            border: "1px solid var(--glass-7)",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                🚨 {t("statsIncidents")}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {doneIncidents}/{totalIncidents} {t("statsCompleted").toLowerCase()}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 7, background: "var(--glass-6)", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${incidentPct}%`,
                background: "linear-gradient(90deg, #EF4444, #EF444488)",
                transition: "width 0.5s ease",
              }} />
            </div>

            {/* Per-difficulty breakdown */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["easy", "intermediate", "hard"].map(diff => (
                <div key={diff} style={{
                  flex: 1,
                  minWidth: 80,
                  textAlign: "center",
                  padding: "8px 6px",
                  background: `${INCIDENT_COLORS[diff]}08`,
                  border: `1px solid ${INCIDENT_COLORS[diff]}22`,
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: INCIDENT_COLORS[diff] }}>
                    {incidentsDoneByDiff[diff]}/{incidentsByDiff[diff]}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                    {diff === "easy" ? (lang === "en" ? "Easy" : "קל")
                      : diff === "intermediate" ? (lang === "en" ? "Intermediate" : "בינוני")
                      : (lang === "en" ? "Hard" : "קשה")}
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
      marginBottom: 10, letterSpacing: 0.6, textTransform: "uppercase",
    }}>
      {text}
    </div>
  );
}

function Badge({ icon, text, color }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      color,
      background: `${color}12`,
      border: `1px solid ${color}22`,
      padding: "4px 10px",
      borderRadius: 20,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    }}>
      {icon} {text}
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
