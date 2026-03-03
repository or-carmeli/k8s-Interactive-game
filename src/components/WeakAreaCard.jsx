const TOPIC_NAMES = {
  workloads:       "Workloads",
  networking:      "Networking",
  config:          "Config & Security",
  storage:         "Storage & Helm",
  troubleshooting: "Troubleshooting",
};

export default function WeakAreaCard({ topicStats, onGoToTopic }) {
  const entries = Object.entries(topicStats).filter(([, v]) => v.answered > 0);

  if (entries.length === 0) {
    return (
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 18px",marginBottom:16,direction:"rtl"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:0.5}}>📉 האזור החלש שלך</div>
        <p style={{color:"#475569",fontSize:13,margin:0}}>עדיין אין מספיק נתונים, התחילי לענות כדי שנמליץ מה לחזק.</p>
      </div>
    );
  }

  const [topicId, topicData] = entries.reduce((best, curr) => {
    const bAcc = best[1].correct / best[1].answered;
    const cAcc = curr[1].correct / curr[1].answered;
    if (cAcc < bAcc) return curr;
    if (cAcc === bAcc && curr[1].answered > best[1].answered) return curr;
    return best;
  });

  const accuracy = Math.round(topicData.correct / topicData.answered * 100);
  const name = TOPIC_NAMES[topicId] || topicId;

  return (
    <div style={{background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:14,padding:"14px 18px",marginBottom:16,direction:"rtl"}}>
      <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:10,letterSpacing:0.5}}>📉 האזור החלש שלך</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#e2e8f0",fontWeight:700,fontSize:15}}>{name}</span>
          <span style={{color:"#EF4444",fontSize:13,fontWeight:600}}>{accuracy}% דיוק</span>
        </div>
        <button onClick={() => onGoToTopic(topicId)}
          style={{padding:"8px 16px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,color:"#EF4444",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
          חזרי לנושא הזה
        </button>
      </div>
    </div>
  );
}
