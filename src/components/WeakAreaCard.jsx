const TOPIC_NAMES = {
  workloads:       "Workloads & Scheduling",
  networking:      "Networking & Service Exposure",
  config:          "Configuration & Security",
  storage:         "Storage & Package Management",
  troubleshooting: "Cluster Operations & Troubleshooting",
};

// Returns the hex color for the side-bar indicator based on accuracy (0–100).
function indicatorColor(accuracy) {
  if (accuracy < 70) return "#EF4444";
  if (accuracy < 85) return "#F59E0B";
  return "#10B981";
}

export default function WeakAreaCard({ topicStats, onGoToTopic }) {
  // Only consider topics the user has actually answered at least once.
  const entries = Object.entries(topicStats).filter(([, v]) => v.answered > 0);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (entries.length === 0) {
    return (
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 18px",marginBottom:16,direction:"rtl"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:0.5}}>📉 האזור החלש שלך</div>
        <p style={{color:"#475569",fontSize:13,margin:0}}>עדיין אין מספיק נתונים, התחילי לענות כדי שנמליץ מה לחזק.</p>
      </div>
    );
  }

  // ── Weak-area selection ────────────────────────────────────────────────────
  // Priority: 1) lowest accuracy  2) most answered  3) alphabetical topicId
  const [weakId, weakData] = entries.reduce((best, curr) => {
    const bAcc = best[1].correct / best[1].answered;
    const cAcc = curr[1].correct / curr[1].answered;
    if (cAcc < bAcc) return curr;
    if (cAcc === bAcc) {
      if (curr[1].answered > best[1].answered) return curr;
      if (curr[1].answered === best[1].answered && curr[0] < best[0]) return curr;
    }
    return best;
  });

  const accuracy  = Math.round(weakData.correct / weakData.answered * 100);
  const color     = indicatorColor(accuracy);
  const name      = TOPIC_NAMES[weakId] || weakId;
  const allPerfect = accuracy === 100;

  // Shared card wrapper style — borderRight acts as the RTL-side indicator bar.
  const cardBase = {
    borderRadius: 14,
    padding: "14px 18px",
    marginBottom: 16,
    direction: "rtl",
  };

  // ── All-perfect variant ───────────────────────────────────────────────────
  if (allPerfect) {
    return (
      <div style={{
        ...cardBase,
        background: "rgba(16,185,129,0.04)",
        border: "1px solid rgba(16,185,129,0.18)",
        borderRight: `3px solid ${color}`,
      }}>
        <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:10,letterSpacing:0.5}}>🔥 הכל בשליטה</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <span style={{color:"#e2e8f0",fontSize:13}}>כל הנושאים עם דיוק מלא. רוצה להמשיך לאתגר הבא?</span>
          <button
            onClick={() => {
              // Scroll to the top of the categories list (first topic card).
              const firstId = Object.keys(TOPIC_NAMES)[0];
              document.getElementById(`topic-card-${firstId}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            style={{padding:"8px 16px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8,color:"#10B981",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            לתרגול מתקדם
          </button>
        </div>
      </div>
    );
  }

  // ── Weak-area variant ─────────────────────────────────────────────────────
  return (
    <div style={{
      ...cardBase,
      background: "rgba(239,68,68,0.04)",
      border: "1px solid rgba(239,68,68,0.15)",
      borderRight: `3px solid ${color}`,
    }}>
      <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:10,letterSpacing:0.5}}>📉 האזור החלש שלך</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#e2e8f0",fontWeight:700,fontSize:15}}>{name}</span>
          <span style={{color,fontSize:13,fontWeight:600}}>{accuracy}% דיוק</span>
        </div>
        <button onClick={() => onGoToTopic(weakId)}
          style={{padding:"8px 16px",background:`${color}1a`,border:`1px solid ${color}4d`,borderRadius:8,color,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
          חזרי לנושא הזה
        </button>
      </div>
    </div>
  );
}
