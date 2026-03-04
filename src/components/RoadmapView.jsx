import { useState } from "react";

const STAGE_SUBTITLES = {
  workloads:       "Pods · Deployments · StatefulSets · DaemonSets",
  networking:      "Services · Ingress · Network Policies",
  config:          "ConfigMaps · Secrets · RBAC",
  storage:         "PersistentVolumes · StorageClass · Helm",
  troubleshooting: "Debugging · שגיאות נפוצות · כלים",
};

const LVL_ORDER = ["easy", "medium", "hard"];

// ── Helpers (pure functions, no side effects) ────────────────────────────────

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

// Returns first unlocked, non-perfect level — or null if all 3 are perfect.
function nextRecommendedLevel(topicId, completedTopics, isLevelLocked) {
  for (const lvl of LVL_ORDER) {
    if (isLevelLocked(topicId, lvl)) continue;
    const r = completedTopics[`${topicId}_${lvl}`];
    if (!r || r.correct < r.total) return lvl;
  }
  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RoadmapView({
  topics, levelConfig, completedTopics, isLevelLocked,
  startTopic, startMixedQuiz, lang, t, dir,
}) {
  const [expandedStage, setExpandedStage] = useState(null);

  const overallProgress = Math.round(
    topics.reduce((sum, topic) => sum + stageProgress(topic.id, completedTopics), 0) / topics.length
  );

  const currentStageIdx = topics.findIndex(
    topic => !isStageCompleted(topic.id, completedTopics)
  );
  const allDone       = currentStageIdx === -1;
  const currentStageNum = allDone ? topics.length : currentStageIdx + 1;

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
          style={{width:"100%",marginBottom:16,padding:"14px 20px",background:"linear-gradient(135deg,rgba(0,212,255,0.1),rgba(168,85,247,0.1))",border:"1px solid rgba(0,212,255,0.3)",borderRadius:14,cursor:"pointer",color:"#00D4FF",fontWeight:800,fontSize:15,direction:"rtl",transition:"transform 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          🚀 המשיכי לשלב הבא
        </button>
      )}

      {/* ── Stage cards ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {topics.map((topic, idx) => {
          const progress  = stageProgress(topic.id, completedTopics);
          const completed = isStageCompleted(topic.id, completedTopics);
          const isCurrent = idx === currentStageIdx;
          const recLvl    = nextRecommendedLevel(topic.id, completedTopics, isLevelLocked);
          const isExpanded = expandedStage === topic.id;

          return (
            <div key={topic.id} style={{
              background: isCurrent ? `${topic.color}07` : "rgba(255,255,255,0.02)",
              border:`1px solid ${isCurrent ? `${topic.color}30` : "rgba(255,255,255,0.07)"}`,
              borderRadius:14, padding:"16px 18px", transition:"border-color 0.2s",
            }}>

              {/* Stage header — click to expand */}
              <div onClick={()=>setExpandedStage(isExpanded ? null : topic.id)}
                style={{cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:800,color:isCurrent?topic.color:"#334155",background:isCurrent?`${topic.color}18`:"rgba(255,255,255,0.04)",borderRadius:6,padding:"3px 7px",flexShrink:0,letterSpacing:0.5}}>
                  {idx+1}
                </div>
                <div style={{fontSize:22,width:40,height:40,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>
                  {topic.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#e2e8f0",fontSize:15,display:"flex",alignItems:"center",gap:6}}>
                    {topic.name}{completed&&<span>✅</span>}
                  </div>
                  <div style={{color:"#475569",fontSize:12,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {STAGE_SUBTITLES[topic.id]}
                  </div>
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{color:completed?"#10B981":isCurrent?topic.color:"#64748b",fontWeight:700,fontSize:13}}>{progress}%</div>
                  <div style={{color:"#475569",fontSize:11,marginTop:1}}>{isExpanded?"▲":"▼"}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:12}}>
                <div style={{height:"100%",borderRadius:2,width:`${progress}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/>
              </div>

              {/* Primary CTA */}
              {completed ? (
                <button disabled style={{width:"100%",padding:"9px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:10,color:"#10B981",fontSize:13,fontWeight:700,cursor:"default",opacity:0.8}}>
                  ✅ הושלם
                </button>
              ) : recLvl ? (
                <button onClick={()=>startTopic(topic,recLvl)}
                  style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${topic.color}20,${topic.color}10)`,border:`1px solid ${topic.color}40`,borderRadius:10,color:topic.color,fontSize:13,fontWeight:700,cursor:"pointer",transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  ▶ המשיכי מכאן
                </button>
              ) : (
                <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"8px 0"}}>
                  נפתח אחרי השלמת הרמה הקודמת
                </div>
              )}

              {/* Expanded difficulty cards — identical visual to Categories view */}
              {isExpanded&&(
                <div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Object.entries(levelConfig).map(([lvl, cfg]) => {
                    const key    = `${topic.id}_${lvl}`;
                    const done   = completedTopics[key];
                    const locked = isLevelLocked(topic.id, lvl);
                    return (
                      <div key={lvl} className={locked?"":"card-hover"}
                        onClick={()=>!locked&&startTopic(topic,lvl)}
                        style={{padding:"10px 8px",background:locked?"rgba(255,255,255,0.01)":done?`${cfg.color}12`:"rgba(255,255,255,0.03)",border:`1px solid ${locked?"rgba(255,255,255,0.04)":done?cfg.color+"44":"rgba(255,255,255,0.07)"}`,borderRadius:10,textAlign:"center",opacity:locked?0.45:1,cursor:locked?"not-allowed":"pointer"}}>
                        <div style={{fontSize:16}}>{locked?"🔒":cfg.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:locked?"#334155":done?cfg.color:"#64748b"}}>
                          {lang==="en"?cfg.labelEn:cfg.label}
                        </div>
                        {done&&!locked&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}}>{done.correct>0?"✓":""} {done.correct}/{done.total}</div>}
                        <div style={{fontSize:10,color:locked?"#1e293b":"#475569"}}>+{cfg.points}{t("pts")}</div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
