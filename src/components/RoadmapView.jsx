import { useState } from "react";

const STAGE_SUBTITLES = {
  workloads:       "Pods · Deployments · StatefulSets · Scheduling · Resources",
  networking:      "Services · Ingress · NetworkPolicy · DNS",
  config:          "ConfigMaps · Secrets · RBAC · ServiceAccounts",
  storage:         "PersistentVolumes · StorageClass · Helm · Operators",
  troubleshooting: "Debugging · Observability · Diagnosis · Tools",
};

const LVL_ORDER = ["easy", "medium", "hard"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function stageProgress(topicId, completedTopics) {
  let totalQ = 0, correctQ = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (r) { totalQ += r.total; correctQ += Math.min(r.correct, r.total); }
  });
  if (totalQ === 0) return 0;
  return Math.min(100, Math.round((correctQ / totalQ) * 100));
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
  const rowDir = dir === "rtl" ? "row-reverse" : "row";

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
    <div style={{animation:"fadeIn 0.4s ease",direction:"ltr"}}>

      {/* ── Summary header ── */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px",marginBottom:16,direction:dir}}>
        <div style={{fontWeight:800,color:"#e2e8f0",fontSize:16,marginBottom:4}}>{t("roadmapTitle")}</div>
        <div style={{color:"#94a3b8",fontSize:13,marginBottom:10}}>
          {allDone
            ? t("roadmapAllDone")
            : `${t("roadmapStage")} ${currentStageNum} ${t("roadmapStageOf")} ${topics.length}`}
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:4,marginBottom:6}}>
          <div style={{height:"100%",borderRadius:4,width:`${overallProgress}%`,background:"linear-gradient(90deg,#00D4FF,#A855F7)",transition:"width 0.5s ease"}}/>
        </div>
        <div style={{fontSize:12,color:"#94a3b8",textAlign:"center"}}>{overallProgress}% {t("roadmapCompletedPct")}</div>
      </div>

      {/* ── Global start (only shown before user begins) ── */}
      {!allDone && overallProgress === 0 && (
        <button onClick={handleGlobalContinue}
          style={{width:"100%",marginBottom:20,padding:"14px 20px",background:"linear-gradient(135deg,rgba(0,212,255,0.1),rgba(168,85,247,0.1))",border:"1px solid rgba(0,212,255,0.3)",borderRadius:14,cursor:"pointer",color:"#00D4FF",fontWeight:800,fontSize:15,direction:dir,transition:"transform 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          {t("roadmapStart")}
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
          const nodeBorder = locked ? "2px solid #1e293b" : completed ? "2px solid #10B981" : isCurrent ? `2px solid ${topic.color}` : "2px solid #334155";
          const nodeGlow   = isCurrent && !locked ? `0 0 24px ${topic.color}88` : "none";
          const nodeLabel  = completed ? "✓" : locked ? "🔒" : String(idx + 1);
          const nodeFg     = locked ? "#334155" : completed ? "#10B981" : isCurrent ? topic.color : "#475569";

          // Connector line color
          const lineColor = completed
            ? `linear-gradient(to bottom,#10B981,${topics[idx + 1]?.color ?? "#10B981"}55)`
            : "rgba(255,255,255,0.12)";

          return (
            // Use flexDirection:row-reverse for RTL instead of direction:rtl
            // to avoid RTL flex overflow bugs in mobile browsers
            <div key={topic.id} className="roadmap-row" style={{display:"flex",flexDirection:rowDir,alignItems:"stretch",gap:14}}>

              {/* ── Node column ── */}
              <div className="roadmap-node-col" style={{display:"flex",flexDirection:"column",alignItems:"center",width:36,flexShrink:0,paddingTop:2}}>
                {/* Circle node */}
                <div className="roadmap-node-circle" style={{
                  width:36,height:36,borderRadius:"50%",
                  border:nodeBorder,
                  background:completed?"rgba(16,185,129,0.15)":isCurrent&&!locked?`${topic.color}20`:"rgba(255,255,255,0.04)",
                  boxShadow:nodeGlow,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:completed?17:locked?12:13,
                  fontWeight:800,color:nodeFg,
                  flexShrink:0,
                  transition:"box-shadow 0.3s",
                  animation:isCurrent&&!locked?`nodePulse 2.5s ease-in-out infinite`:undefined,
                  ["--nc"]:topic.color,
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
              <div className="roadmap-card" style={{
                flex:1,
                minWidth:0,
                marginBottom: isLast ? 0 : 12,
                opacity: locked ? 0.45 : 1,
                background: isCurrent&&!locked ? `${topic.color}10` : "rgba(255,255,255,0.04)",
                border:`1px solid ${isCurrent&&!locked ? `${topic.color}40` : "rgba(255,255,255,0.10)"}`,
                borderRadius:14,
                padding:"12px 14px",
                transition:"opacity 0.2s,border-color 0.2s",
              }}>

                {/* Stage header */}
                <div
                  onClick={()=>{ if (!locked) setExpandedStage(isExpanded ? null : topic.id); }}
                  className="roadmap-card-header"
                  style={{cursor:locked?"default":"pointer",display:"flex",flexDirection:rowDir,alignItems:"center",gap:8,marginBottom:8}}>

                  {/* Icon */}
                  <div className="roadmap-icon" style={{fontSize:18,width:32,height:32,borderRadius:8,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>
                    {topic.icon}
                  </div>

                  {/* Text — takes remaining space, clips instead of wrapping */}
                  <div style={{flex:1,minWidth:0,direction:dir}}>
                    <div className="roadmap-title" style={{fontWeight:700,color:"#e2e8f0",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{topic.name}</span>
                      {completed&&<span style={{flexShrink:0}}>✅</span>}
                    </div>
                    <div className="roadmap-subtitle" style={{color:"#64748b",fontSize:11,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {STAGE_SUBTITLES[topic.id]}
                    </div>
                  </div>

                  {/* Progress % + expand arrow */}
                  {!locked&&(
                    <div className="roadmap-pct" style={{flexShrink:0,textAlign:"center",minWidth:36}}>
                      <div style={{color:completed?"#10B981":isCurrent?topic.color:"#64748b",fontWeight:700,fontSize:12}}>{progress}%</div>
                      <div style={{color:"#475569",fontSize:10}}>{isExpanded?"▲":"▼"}</div>
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
                  <div style={{color:"#334155",fontSize:12,textAlign:"center",padding:"6px 0",direction:dir}}>
                    {t("roadmapLocked")}
                  </div>
                ) : completed ? (
                  <button disabled style={{width:"100%",padding:"8px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:10,color:"#10B981",fontSize:13,fontWeight:700,cursor:"default",opacity:0.8,direction:dir}}>
                    {t("roadmapDone")}
                  </button>
                ) : recLvl && !(overallProgress === 0 && isCurrent) ? (
                  <button onClick={()=>startTopic(topic,recLvl)}
                    style={{width:"100%",padding:"8px",background:`linear-gradient(135deg,${topic.color}20,${topic.color}10)`,border:`1px solid ${topic.color}40`,borderRadius:10,color:topic.color,fontSize:13,fontWeight:700,cursor:"pointer",transition:"transform 0.15s",direction:dir}}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                    {t("roadmapContinueHere")}
                  </button>
                ) : null}

                {/* Expanded difficulty grid */}
                {isExpanded&&(
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {Object.entries(levelConfig).filter(([lvl]) => lvl !== "mixed" && lvl !== "daily").map(([lvl, cfg]) => {
                      const key       = `${topic.id}_${lvl}`;
                      const done      = completedTopics[key];
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
