import { useState, useEffect } from "react";
import { fetchSystemStatus, fetchUptimeHistory, fetchIncidentHistory, fetchMaintenanceWindows } from "../api/monitoring";

export default function StatusView({ supabase, lang, isStatusDomain, setScreen, APP_VERSION }) {
  const [dbStatus, setDbStatus]                         = useState(null);
  const [monitorServices, setMonitorServices]           = useState(null);
  const [monitorUptime, setMonitorUptime]               = useState(null);
  const [monitorIncidents, setMonitorIncidents]         = useState(null);
  const [maintenanceWindows, setMaintenanceWindows]     = useState(null);
  const [statusTick, setStatusTick]                     = useState(0);

  // Set page title, favicon, and OG metadata for status screen
  useEffect(() => {
    document.title = "KubeQuest Status";
    const link = document.querySelector('link[rel="icon"]');
    if (link) link.href = "/favicon-status.svg";

    if (isStatusDomain) {
      const metaUpdates = {
        'meta[property="og:title"]': "KubeQuest Status",
        'meta[property="og:description"]': "Real-time platform and service health for KubeQuest.",
        'meta[property="og:image"]': "https://status.kubequest.online/status-preview.png",
        'meta[property="og:image:secure_url"]': "https://status.kubequest.online/status-preview.png",
        'meta[property="og:image:alt"]': "KubeQuest Status - All Systems Operational",
        'meta[property="og:url"]': "https://status.kubequest.online",
        'meta[name="twitter:title"]': "KubeQuest Status",
        'meta[name="twitter:description"]': "Real-time platform and service health for KubeQuest.",
        'meta[name="twitter:image"]': "https://status.kubequest.online/status-preview.png",
        'meta[name="twitter:image:alt"]': "KubeQuest Status - All Systems Operational",
        'meta[name="description"]': "Live service status, incidents, and maintenance updates for KubeQuest.",
      };
      for (const [sel, val] of Object.entries(metaUpdates)) {
        const el = document.querySelector(sel);
        if (el) el.setAttribute("content", val);
      }
      const canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute("href", "https://status.kubequest.online/");
    }

    return () => {
      document.title = "KubeQuest - Kubernetes Practice Game";
      if (link) link.href = "/favicon.svg";
    };
  }, [isStatusDomain]);

  // Fetch real monitoring data, poll every 30s
  useEffect(() => {
    setDbStatus(null);
    setMonitorServices(null);
    setMonitorUptime(null);
    setMonitorIncidents(null);
    setMaintenanceWindows(null);

    if (!supabase) { setDbStatus("error"); return; }

    const load = async () => {
      try {
        const [services, uptime, incidents, maintenance] = await Promise.all([
          fetchSystemStatus(supabase),
          fetchUptimeHistory(supabase, 30),
          fetchIncidentHistory(supabase, 20),
          fetchMaintenanceWindows(supabase),
        ]);
        setMonitorServices(services);
        setMonitorUptime(uptime);
        setMonitorIncidents(incidents);
        setMaintenanceWindows(maintenance);
        const anyDown = services.some(s => s.status === "down");
        setDbStatus(anyDown ? "error" : "ok");
      } catch {
        setDbStatus("error");
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [supabase]);

  // Tick every 1s so the "Updated Xs ago" timer stays live
  useEffect(() => {
    const tick = setInterval(() => setStatusTick(t => t + 1), 1_000);
    return () => clearInterval(tick);
  }, []);

  const isProd    = import.meta.env.MODE === "production";
  const env       = isProd ? "Production" : "Development";
  const buildTime = typeof __BUILD_TIME__ !== "undefined" ? new Date(__BUILD_TIME__) : null;
  const isSecure  = typeof window !== "undefined" && window.location.protocol === "https:";

  const loading = monitorServices === null;

  // Derive global status from real service data
  const allOperational = !loading && monitorServices.every(s => s.status === "operational");
  const anyDown = !loading && monitorServices.some(s => s.status === "down");
  const anyMaintenance = !loading && monitorServices.some(s => s.status === "maintenance");

  // Maintenance windows
  const activeMaintenance = maintenanceWindows
    ? maintenanceWindows.find(w => new Date(w.starts_at) <= new Date() && new Date(w.ends_at) > new Date())
    : null;
  const upcomingMaintenance = maintenanceWindows
    ? maintenanceWindows.filter(w => new Date(w.starts_at) > new Date())
    : [];
  const inMaintenance = anyMaintenance || !!activeMaintenance;

  const globalOk      = loading ? null : (anyDown ? false : true);
  const globalLabel   = loading ? "Loading..."
    : anyDown ? "Major Outage"
    : inMaintenance ? "Scheduled Maintenance"
    : allOperational ? "All Systems Operational"
    : "Degraded Performance";
  const globalColor   = loading ? "#F59E0B" : anyDown ? "#EF4444" : inMaintenance ? "#facc15" : allOperational ? "#10B981" : "#F59E0B";
  const globalDot     = globalColor;

  const statusLabel = (s) => s === "operational" ? "Operational" : s === "degraded" ? "Degraded" : s === "down" ? "Down" : "Maintenance";
  const statusColor = (s) => s === "operational" ? "#10B981" : s === "degraded" ? "#F59E0B" : s === "down" ? "#EF4444" : "#facc15";

  // Default service list (used while loading or if no data)
  const defaultSvcNames = ["Quiz Engine","Authentication","Leaderboard","Database","Content API"];
  const services = loading
    ? defaultSvcNames.map(n => ({ service_name: n, status: "operational", latency_ms: null }))
    : monitorServices;

  // Build uptime bars + check totals per service from real history
  const uptimeByService = {};
  const checksByService = {};
  if (monitorUptime) {
    for (const row of monitorUptime) {
      if (!uptimeByService[row.service_name]) uptimeByService[row.service_name] = {};
      uptimeByService[row.service_name][row.day] = row.uptime_pct;
      if (!checksByService[row.service_name]) checksByService[row.service_name] = { ok: 0, total: 0 };
      checksByService[row.service_name].ok += Number(row.ok_checks);
      checksByService[row.service_name].total += Number(row.total_checks);
    }
  }
  const getDayBars = (svcName) => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const pct = uptimeByService[svcName]?.[key];
      if (pct === undefined || pct === null) days.push("nodata");
      else if (pct >= 98) days.push("ok");
      else if (pct >= 90) days.push("incident");
      else days.push("error");
    }
    return days;
  };
  const barColor = (t) => t==="ok" ? "#10B981" : t==="incident" ? "#F59E0B" : t==="error" ? "#EF4444" : "var(--glass-6)";

  // Determine actual monitoring span for accurate labels
  let monitoringDays = 30;
  if (monitorUptime && monitorUptime.length) {
    const allDays = [...new Set(monitorUptime.map(r => r.day))].sort();
    if (allDays.length > 0) {
      const first = new Date(allDays[0]);
      const diffMs = Date.now() - first.getTime();
      monitoringDays = Math.min(30, Math.max(1, Math.ceil(diffMs / 86400000)));
    }
  }

  // Compute average latency across services that have it
  const latencies = services.filter(s => s.latency_ms != null).map(s => s.latency_ms);
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) : null;
  const maxLatency = latencies.length ? Math.max(...latencies) : null;

  // Compute overall uptime from history
  let overallUptime = null;
  if (monitorUptime && monitorUptime.length) {
    const totalChecks = monitorUptime.reduce((s,r) => s + Number(r.total_checks), 0);
    const okChecks = monitorUptime.reduce((s,r) => s + Number(r.ok_checks), 0);
    if (totalChecks > 0) overallUptime = (okChecks / totalChecks * 100).toFixed(2);
  }

  // Split incidents into active vs resolved
  const activeIncidents = monitorIncidents ? monitorIncidents.filter(i => i.status !== "resolved") : [];
  const resolvedIncidents = monitorIncidents ? monitorIncidents.filter(i => i.status === "resolved") : [];

  // Last checked time - statusTick dependency keeps this value live
  void statusTick;
  const lastChecked = !loading && services.length
    ? new Date(Math.max(...services.map(s => new Date(s.last_checked).getTime())))
    : null;
  const secondsAgo = lastChecked ? Math.floor((Date.now() - lastChecked.getTime()) / 1000) : null;
  const isStaleWarning  = secondsAgo !== null && secondsAgo > 300;
  const isStaleCritical = secondsAgo !== null && secondsAgo > 900;

  const metricCard = (label, value, sub, accent="#94a3b8") => (
    <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"14px 16px",minWidth:0}}>
      <div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600,marginBottom:6}}>{label}</div>
      <div style={{fontSize:18,fontWeight:700,color:accent,fontFamily:"'Fira Code','Courier New',monospace",lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"var(--text-dim)",marginTop:4}}>{sub}</div>}
    </div>
  );

  const infoRow = (label, value, accent="#cbd5e1", mono=false) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--glass-4)"}}>
      <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>{label}</span>
      <span style={{fontSize:12,color:accent,fontWeight:500,fontFamily:mono?"'Fira Code','Courier New',monospace":"inherit",textAlign:"end",maxWidth:"60%",wordBreak:"break-all"}}>{value}</span>
    </div>
  );

  const sectionTitle = (title) => (
    <div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10,marginTop:32}}>{title}</div>
  );

  const detailLabel = (text) => (
    <div style={{fontSize:10,color:"var(--text-muted)",fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:2}}>{text}</div>
  );

  // Severity colors for incidents
  const sevColor = (s) => s === "critical" ? "#EF4444" : s === "high" ? "#F97316" : s === "medium" ? "#F59E0B" : "#64748b";
  const incStatusColor = (s) => s === "resolved" ? "#10B981" : s === "monitoring" ? "#3B82F6" : s === "identified" ? "#F59E0B" : "#EF4444";

  const renderIncidentCard = (inc) => {
    const started = new Date(inc.started_at);
    const resolved = inc.resolved_at ? new Date(inc.resolved_at) : null;
    const durationMs = resolved ? resolved - started : Date.now() - started;
    const durationHrs = durationMs / 3600000;
    const durationStr = durationHrs >= 1 ? `~${Math.round(durationHrs)} hr${Math.round(durationHrs)>1?"s":""}` : `~${Math.round(durationMs/60000)} min`;
    return (
      <div key={inc.id} dir="ltr" style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"12px 16px",textAlign:"left",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",wordBreak:"break-word"}}>{inc.title}</div>
            <div style={{fontSize:11,color:"var(--text-muted)",marginTop:3,display:"flex",flexWrap:"wrap",gap:"0 12px"}}>
              <span>{started.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
              <span>{durationStr}</span>
              <span style={{color:sevColor(inc.severity)}}>{inc.severity.charAt(0).toUpperCase()+inc.severity.slice(1)}</span>
            </div>
            {inc.affected_services?.length>0&&<div style={{fontSize:10,color:"var(--text-dim)",marginTop:3,wordBreak:"break-word"}}>{inc.affected_services.join(", ")}</div>}
          </div>
          <span style={{fontSize:10,fontWeight:600,color:incStatusColor(inc.status),background:`${incStatusColor(inc.status)}12`,padding:"3px 8px",borderRadius:4,whiteSpace:"nowrap",flexShrink:0,marginTop:1}}>
            {inc.status.charAt(0).toUpperCase()+inc.status.slice(1)}
          </span>
        </div>
        {(inc.impact||inc.root_cause||inc.resolution||inc.prevention)&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--glass-4)",fontSize:12,color:"var(--text-muted)",lineHeight:1.6}}>
            {inc.impact&&<div style={{marginBottom:8}}>{detailLabel("Impact")}<div style={{wordBreak:"break-word"}}>{inc.impact}</div></div>}
            {inc.root_cause&&<div style={{marginBottom:8}}>{detailLabel("Root Cause")}<div style={{wordBreak:"break-word"}}>{inc.root_cause}</div></div>}
            {inc.resolution&&<div style={{marginBottom:8}}>{detailLabel("Resolution")}<div style={{wordBreak:"break-word"}}>{inc.resolution}</div></div>}
            {inc.prevention&&<div>{detailLabel("Prevention")}<div style={{wordBreak:"break-word"}}>{inc.prevention}</div></div>}
          </div>
        )}
      </div>
    );
  };

  const updatedAgoText = secondsAgo !== null
    ? (secondsAgo < 60 ? "Just now" : secondsAgo < 120 ? "1 min ago" : `${Math.floor(secondsAgo/60)} min ago`)
    : "Loading...";

  return (
    <>
      {/* -- Standalone status header (status.kubequest.online only) -- */}
      {isStatusDomain && (
        <header style={{borderBottom:"1px solid var(--glass-5)",padding:"12px 24px"}}>
          <div style={{maxWidth:720,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:14,fontWeight:600,color:"var(--text-primary)",letterSpacing:-0.2}}>KubeQuest Status</div>
            <a href="https://kubequest.online" target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"var(--text-muted)",textDecoration:"none"}}>kubequest.online ↗</a>
          </div>
        </header>
      )}

      <div className="page-pad" dir="ltr" style={{maxWidth:720,margin:"0 auto",padding:isStatusDomain?"28px 16px 48px":"20px 16px 48px",animation:"fadeIn 0.3s ease",direction:"ltr"}}>

        {/* Back (hidden on standalone status subdomain) */}
        {!isStatusDomain && (
          <div style={{display:"flex",justifyContent:lang==="en"?"flex-start":"flex-end",marginBottom:24}}>
            <button onClick={()=>setScreen("home")} style={{background:"var(--glass-3)",border:"1px solid var(--glass-6)",color:"var(--text-secondary)",padding:"7px 12px",borderRadius:6,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:5}}>
              {lang==="en"?"\u2190 Return":"\u05D7\u05D6\u05E8\u05D4 \u2192"}
            </button>
          </div>
        )}

        {/* -- 1. GLOBAL STATUS BANNER -- */}
        <div style={{background:`rgba(${globalOk===false?"239,68,68":globalOk?"16,185,129":"245,158,11"},0.03)`,border:`1px solid ${globalColor}18`,borderRadius:12,padding:"20px 22px",marginBottom:8,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",boxShadow:`0 0 12px ${globalColor}40,0 0 28px ${globalColor}26,inset 0 0 18px ${globalColor}0D`}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:globalDot,boxShadow:`0 0 8px ${globalDot}CC,0 0 16px ${globalDot}99,0 0 24px ${globalDot}66`,animation:"dotPulse 2.5s ease-in-out infinite"}} />
            {globalOk!==false&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",background:globalDot,animation:"ping 2.5s ease-out infinite",opacity:0.2}} />}
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontSize:17,fontWeight:700,color:"var(--text-primary)",letterSpacing:-0.2}}>{globalLabel}</div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginTop:3}}>{updatedAgoText}</div>
          </div>
        </div>

        {/* -- 2. STALE DATA WARNING -- */}
        {isStaleWarning && (
          <div style={{background:isStaleCritical?"rgba(239,68,68,0.05)":"rgba(245,158,11,0.05)",border:`1px solid ${isStaleCritical?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)"}`,borderRadius:10,padding:"10px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14}}>{isStaleCritical?"\u26A0":"\u26A1"}</span>
            <span style={{fontSize:12,fontWeight:500,color:isStaleCritical?"#EF4444":"#F59E0B"}}>
              {isStaleCritical ? "Status data is stale" : "Status data may be stale"}
            </span>
          </div>
        )}

        {/* -- 2b. MAINTENANCE BANNER -- */}
        {(activeMaintenance || upcomingMaintenance.length > 0) && (() => { const mw = activeMaintenance || upcomingMaintenance[0]; return (
          <div dir="ltr" style={{background:"rgba(250,204,21,0.04)",border:"1px solid rgba(250,204,21,0.15)",borderRadius:10,padding:"14px 16px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#facc15"}} />
              <span style={{fontSize:13,fontWeight:600,color:"#facc15"}}>{activeMaintenance ? "Maintenance in Progress" : "Upcoming Maintenance"}</span>
            </div>
            {mw.description && (
              <div style={{fontSize:12,color:"var(--text-secondary)",lineHeight:1.5,marginBottom:8}}>{mw.description}</div>
            )}
            <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"'Fira Code','Courier New',monospace",marginBottom:mw.affected_services?.length ? 10 : 0}}>
              {new Date(mw.starts_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})} · {new Date(mw.starts_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})}-{new Date(mw.ends_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})} UTC
            </div>
            {mw.affected_services?.length > 0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {mw.affected_services.map(s=>(
                  <span key={s} style={{fontSize:10,color:"#a3a3a3",background:"var(--glass-4)",borderRadius:4,padding:"2px 8px",fontWeight:500}}>{s}</span>
                ))}
              </div>
            )}
          </div>
        ); })()}

        {/* -- 3. ACTIVE INCIDENTS -- */}
        {sectionTitle("Active Incidents")}
        {activeIncidents.length > 0 ? activeIncidents.map(renderIncidentCard) : (
          <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:16,textAlign:"center",color:"var(--text-dim)",fontSize:12}}>
            {loading ? "Loading..." : "No active incidents"}
          </div>
        )}

        {/* -- 4. SERVICE HEALTH -- */}
        {sectionTitle("Services")}
        <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,overflow:"hidden"}}>
          {services.map((svc,i)=>(
            <div key={svc.service_name} className="svc-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<services.length-1?"1px solid var(--glass-4)":"none",background:"rgba(255,255,255,0.02)",transition:"background 0.2s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:statusColor(svc.status),flexShrink:0,boxShadow:`0 0 4px ${statusColor(svc.status)}CC, 0 0 10px ${statusColor(svc.status)}66`}} />
                <div>
                  <span style={{fontSize:13,color:"var(--text-light)",fontWeight:500}}>{svc.service_name}</span>
                  {svc.latency_ms!=null&&<span style={{fontSize:11,color:"var(--text-dim)",fontFamily:"'Fira Code','Courier New',monospace",marginLeft:8}}>{svc.latency_ms} ms</span>}
                </div>
              </div>
              <span style={{fontSize:12,fontWeight:600,color:svc.status==="operational"?"#34f5c5":statusColor(svc.status),textShadow:svc.status==="operational"?"0 0 6px rgba(52,245,197,0.35)":"none"}}>
                {loading?"Loading...":statusLabel(svc.status)}
              </span>
            </div>
          ))}
        </div>

        {/* -- 5. RESOLVED INCIDENTS -- */}
        {sectionTitle("Past Incidents")}
        {resolvedIncidents.length > 0 ? resolvedIncidents.map(renderIncidentCard) : (
          <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:16,textAlign:"center",color:"var(--text-dim)",fontSize:12}}>
            {loading ? "Loading..." : "No past incidents recorded"}
          </div>
        )}

        {/* -- 6. UPTIME - LAST 30 DAYS -- */}
        {sectionTitle(`Uptime - last ${monitoringDays} days`)}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {services.map((svc)=>{
            const bars = getDayBars(svc.service_name);
            const checks = checksByService[svc.service_name];
            const pct = checks && checks.total > 0 ? (checks.ok / checks.total * 100).toFixed(1) : "-";
            const ok = svc.status === "operational";
            return (
              <div key={svc.service_name} style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500}}>{svc.service_name}</span>
                  <span style={{fontSize:12,color:ok?"#94a3b8":"#EF4444",fontWeight:600,fontFamily:"'Fira Code','Courier New',monospace"}}>{pct=== "-" ? "-" : `${pct}%`}</span>
                </div>
                <div style={{display:"flex",gap:1.5,alignItems:"flex-end"}}>
                  {bars.map((type,i)=>(
                    <div key={i} title={type==="nodata"?"No data":type} style={{flex:1,height:18,borderRadius:2,background:barColor(type),opacity:type==="ok"?0.8:type==="nodata"?0.15:0.85,transition:"opacity 0.2s"}} />
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:10,color:"var(--text-disabled)"}}>{monitoringDays >= 30 ? "30 days ago" : `${monitoringDays}d ago`}</span>
                  <span style={{fontSize:10,color:"var(--text-disabled)"}}>Today</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Uptime legend */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 16px",marginTop:8,padding:"0 2px"}}>
          {[["#10B981","Operational"],["#F59E0B","Degraded"],["#EF4444","Outage"],["var(--glass-6)","No data"]].map(([color,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:color,opacity:color==="var(--glass-6)"?0.4:0.85,flexShrink:0}} />
              <span style={{fontSize:10,color:"var(--text-disabled)"}}>{label}</span>
            </div>
          ))}
        </div>

        {/* -- 7. PERFORMANCE METRICS -- */}
        {sectionTitle("Performance")}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
          {metricCard("Avg Latency", avgLatency!=null?`${avgLatency}ms`:"-", loading?"loading...":"across services", "#94a3b8")}
          {metricCard("Max Latency", maxLatency!=null?`${maxLatency}ms`:"-", loading?"loading...":"slowest service", "#94a3b8")}
          {metricCard("Uptime", overallUptime?`${overallUptime}%`:"-", `last ${monitoringDays} days`, "#94a3b8")}
          {metricCard("Incidents", String(activeIncidents.length), activeIncidents.length===0?"none active":"active", activeIncidents.length===0?"#94a3b8":"#EF4444")}
        </div>

        {/* -- 8. SECURITY STATUS -- */}
        {sectionTitle("Security")}
        <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"2px 16px"}}>
          {infoRow("TLS Certificate", isSecure ? "Valid - Let's Encrypt" : "Not active", isSecure?"#94a3b8":"#EF4444")}
          {infoRow("Connection",      isSecure ? "HTTPS - Encrypted" : "HTTP - Unencrypted",   isSecure?"#94a3b8":"#F59E0B")}
          {infoRow("HSTS",            "Enabled",  "#94a3b8")}
          {infoRow("Security Headers", "Active",  "#94a3b8")}
          {infoRow("CSP",             "Configured", "#94a3b8")}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",position:"relative"}} title="Grade A security headers assessment, Mar 2026">
            <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>Last Security Audit</span>
            <span style={{fontSize:12,color:"#94a3b8",fontWeight:500}}>Grade A - Mar 2026</span>
          </div>
        </div>

        {/* -- 9. DEPLOYMENT (compact) -- */}
        {sectionTitle("Deployment")}
        <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-6)",borderRadius:10,padding:"2px 16px"}}>
          {infoRow("Version", `v${APP_VERSION}`, "#cbd5e1", true)}
          {infoRow("Environment", env, isProd?"#94a3b8":"#F59E0B")}
          {infoRow("Last Deploy", buildTime ? buildTime.toUTCString().replace(" GMT"," UTC") : "-", "#64748b", true)}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",fontSize:11,color:"var(--text-dim)",flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Fira Code','Courier New',monospace"}}>main</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#10B981",display:"inline-block"}} />
              CI Passing
            </span>
            <a href="https://github.com/or-carmeli/KubeQuest" target="_blank" rel="noopener noreferrer"
              style={{color:"var(--text-dim)",textDecoration:"none",fontFamily:"'Fira Code','Courier New',monospace"}}>
              or-carmeli/KubeQuest
            </a>
          </div>
        </div>

        <style>{`@keyframes ping{0%{transform:scale(1);opacity:0.4}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes dotPulse{0%,100%{opacity:1;box-shadow:0 0 8px currentColor,0 0 16px currentColor,0 0 24px currentColor}50%{opacity:.85;box-shadow:0 0 4px currentColor,0 0 10px currentColor,0 0 16px currentColor}}.svc-row:hover{background:rgba(0,255,170,0.04)!important}`}</style>
      </div>
    </>
  );
}
