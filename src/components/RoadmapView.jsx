import { useState } from "react";

const STAGE_SUBTITLES = {
  workloads:       "Pods · Deployments · StatefulSets · DaemonSets",
  networking:      "Services · Ingress · Network Policies",
  config:          "ConfigMaps · Secrets · RBAC",
  storage:         "PersistentVolumes · StorageClass · Helm",
  troubleshooting: "Debugging · שגיאות נפוצות · כלים",
};

const LVL_ORDER = ["easy", "medium", "hard"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function stageProgress(topicId, completedTopics) {
  const done = LVL_ORDER.filter(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    return r && r.correct === r.total;
  }).length;
  return Math.round((done / LVL_ORDER.length) * 100);
}

function isStageCompleted(topicId, completedTopics) {
  return LVL_ORDER.every(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    return r && r.correct === r.total;
  });
}

function nextRecommendedLevel(topicId, completedTopics, isLevelLocked) {
  for (const lvl of LVL_ORDER) {
    if (isLevelLocked(topicId, lvl)) continue;
    const r = completedTopics[`${topicId}_${lvl}`];
    if (!r || r.correct < r.total) return lvl;
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RoadmapView({
  topics, levelConfig, completedTopics, isLevelLocked,
  startTopic, startMixedQuiz, lang, t, dir,
}) {
  const [expandedStage, setExpandedStage] = useState(null);

  // Stage is locked if the previous stage isn't fully completed
  const isRoadmapStageLocked = (idx) =>
    idx > 0 && !isStageCompleted(topics[idx - 1].id, completedTopics);

  const currentStageIdx = topics.findIndex(
    (topic, idx) => !isRoadmapStageLocked(idx) && !isStageCompleted(topic.id, completedTopics)
  );
  const allDone = currentStageIdx === -1;
  const currentStageNum = allDone ? topics.length : currentStageIdx + 1;

  const overallProgress = Math.round(
    topics.reduce((sum, topic) => sum + stageProgress(topic.id, completedTopics), 0) / topics.length
  );

  const handleGlobalContinue = () => {
    const idx   = allDone ? 0 : currentStageIdx;
    const topic = topics[idx];
    const lvl   = nextRecommendedLevel(topic.id, completedTopics, isLevelLocked);
    if (lvl) startTopic(topic, lvl);
    else     startMixedQuiz();
  };

  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>

      {/* ── Summary header ── */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px",marginBottom:16}}>
        <div style={{fontWeight:800,color:"#e2e8f0",fontSize:16,marginBottom:4}}>ההתקדמות במסלול</div>
        <div style={{color:"#94a3b8",fontSize:13,marginBottom:10}}>
          {allDone
            ? "🎉 השלמת את כל השלבים!"
            : `את בשלב ${currentStageNum} מתוך ${topics.length}`}
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:4,marginBottom:6}}>
          <div style={{height:"100%",borderRadius:4,width:`${overallProgress}%`,background:"linear-gradient(90deg,#00D4FF,#A855F7)",transition:"width 0.5s ease"}}/>
        </div>
        <div style={{fontSize:12,color:"#94a3b8",textAlign:"center"}}>{overallProgress}% הושלם</div>
      </div>

      {/* ── Global continue ── */}
      {!allDone&&(
        <button onClick={handleGlobalContinue}
          style={{width:"100%",marginBottom:20,padding:"14px 20px",background:"linear-gradient(135deg,rgba(0,212,255,0.1),rgba(168,85,247,0.1))",border:"1px solid rgba(0,212,255,0.3)",borderRadius:14,cursor:"pointer",color:"#00D4FF",fontWeight:800,fontSize:15,direction:"rtl",transition:"transform 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          🚀 המשיכי לשלב הבא
        </button>
      )}

      {/* ── Roadmap path ── */}
      <div style={{display:"flex",flexDirection:"column"}}>
        {topics.map((topic, idx) => {
          const locked    = isRoadmapStageLocked(idx);
          const completed = isStageCompleted(topic.id, completedTopics);
          const isCurrent = idx === currentStageIdx;
          const isLast    = idx === topics.length - 1;
          const progress  = stageProgress(topic.id, completedTopics);
          const recLvl    = !locked ? nextRecommendedLevel(topic.id, completedTopics, isLevelLocked) : null;
          const isExpanded = expandedStage === topic.id && !locked;

          // Node visuals
          const nodeColor  = locked ? "#1e293b" : completed ? "#10B981" : isCurrent ? topic.color : "#334155";
          const nodeBorder = locked ? "2px solid #1e293b" : completed ? "2px solid #10B981" : isCurrent ? `2px solid ${topic.color}` : "2px solid #334155";
          const nodeGlow   = isCurrent && !locked ? `0 0 18px ${topic.color}55` : "none";
          const nodeLabel  = completed ? "✓" : locked ? "🔒" : String(idx + 1);
          const nodeFg     = locked ? "#334155" : completed ? "#10B981" : isCurrent ? topic.color : "#475569";

          // Connector line color
          const lineColor = completed
            ? `linear-gradient(to bottom,#10B981,${topics[idx + 1]?.color ?? "#10B981"}55)`
            : "rgba(255,255,255,0.07)";

          return (
            <div key={topic.id} style={{display:"flex",alignItems:"stretch",gap:14,direction:"rtl"}}>

              {/* ── Node column (RTL: right side = first child) ── */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:42,flexShrink:0,paddingTop:2}}>
                {/* Circle node */}
                <div style={{
                  width:38,height:38,borderRadius:"50%",
                  border:nodeBorder,
                  background:completed?"rgba(16,185,129,0.12)":isCurrent&&!locked?`${topic.color}14`:"rgba(255,255,255,0.03)",
                  boxShadow:nodeGlow,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:completed?18:locked?14:13,
                  fontWeight:800,color:nodeFg,
                  flexShrink:0,
                  transition:"box-shadow 0.3s",
                  zIndex:1,
                }}>
                  {nodeLabel}
                </div>
                {/* Connector line */}
                {!isLast&&(
                  <div style={{
                    flex:1,width:2,minHeight:20,
                    background:lineColor,
                    marginTop:3,marginBottom:3,
                    borderRadius:2,
                  }}/>
                )}
              </div>

              {/* ── Stage card ── */}
              <div style={{
                flex:1,
                marginBottom: isLast ? 0 : 12,
                opacity: locked ? 0.45 : 1,
                background: isCurrent&&!locked ? `${topic.color}07` : "rgba(255,255,255,0.02)",
                border:`1px solid ${isCurrent&&!locked ? `${topic.color}30` : "rgba(255,255,255,0.07)"}`,
                borderRadius:14,
                padding:"14px 16px",
                transition:"opacity 0.2s,border-color 0.2s",
              }}>

                {/* Stage header */}
                <div
                  onClick={()=>{ if (!locked) setExpandedStage(isExpanded ? null : topic.id); }}
                  style={{cursor:locked?"default":"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:8,direction:"rtl"}}>
                  <div style={{fontSize:20,width:36,height:36,borderRadius:9,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>
                    {topic.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:"#e2e8f0",fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                      {topic.name}{completed&&<span>✅</span>}
                    </div>
                    <div style={{color:"#475569",fontSize:11,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {STAGE_SUBTITLES[topic.id]}
                    </div>
                  </div>
                  {!locked&&(
                    <div style={{textAlign:"center",flexShrink:0}}>
                      <div style={{color:completed?"#10B981":isCurrent?topic.color:"#64748b",fontWeight:700,fontSize:12}}>{progress}%</div>
                      <div style={{color:"#475569",fontSize:10,marginTop:1}}>{isExpanded?"▲":"▼"}</div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {!locked&&(
                  <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10}}>
                    <div style={{height:"100%",borderRadius:2,width:`${progress}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/>
                  </div>
                )}

                {/* CTA */}
                {locked ? (
                  <div style={{color:"#334155",fontSize:12,textAlign:"center",padding:"6px 0",direction:"rtl"}}>
                    🔒 נפתח אחרי השלמת השלב הקודם
                  </div>
                ) : completed ? (
                  <button disabled style={{width:"100%",padding:"8px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:10,color:"#10B981",fontSize:13,fontWeight:700,cursor:"default",opacity:0.8}}>
                    ✅ הושלם
                  </button>
                ) : recLvl ? (
                  <button onClick={()=>startTopic(topic,recLvl)}
                    style={{width:"100%",padding:"8px",background:`linear-gradient(135deg,${topic.color}20,${topic.color}10)`,border:`1px solid ${topic.color}40`,borderRadius:10,color:topic.color,fontSize:13,fontWeight:700,cursor:"pointer",transition:"transform 0.15s",direction:"rtl"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                    ▶ המשיכי מכאן
                  </button>
                ) : null}

                {/* Expanded difficulty grid */}
                {isExpanded&&(
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,direction:"rtl"}}>
                    {Object.entries(levelConfig).map(([lvl, cfg]) => {
                      const key     = `${topic.id}_${lvl}`;
                      const done    = completedTopics[key];
                      const lvlLocked = isLevelLocked(topic.id, lvl);
                      return (
                        <div key={lvl} className={lvlLocked?"":"card-hover"}
                          onClick={()=>!lvlLocked&&startTopic(topic,lvl)}
                          style={{padding:"10px 8px",background:lvlLocked?"rgba(255,255,255,0.01)":done?`${cfg.color}12`:"rgba(255,255,255,0.03)",border:`1px solid ${lvlLocked?"rgba(255,255,255,0.04)":done?cfg.color+"44":"rgba(255,255,255,0.07)"}`,borderRadius:10,textAlign:"center",opacity:lvlLocked?0.45:1,cursor:lvlLocked?"not-allowed":"pointer"}}>
                          <div style={{fontSize:16}}>{lvlLocked?"🔒":cfg.icon}</div>
                          <div style={{fontSize:12,fontWeight:700,color:lvlLocked?"#334155":done?cfg.color:"#64748b"}}>
                            {lang==="en"?cfg.labelEn:cfg.label}
                          </div>
                          {done&&!lvlLocked&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}}>{done.correct>0?"✓":""} {done.correct}/{done.total}</div>}
                          <div style={{fontSize:10,color:lvlLocked?"#1e293b":"#475569"}}>+{cfg.points}{t("pts")}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
