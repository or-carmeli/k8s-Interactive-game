export default function SupportSection() {
  return (
    <div style={{textAlign:"center",marginTop:24,padding:"16px 12px"}}>
      <p style={{color:"#64748b",fontSize:13,margin:"0 0 4px 0"}}>Enjoying KubeQuest?</p>
      <p style={{color:"#94a3b8",fontSize:12,margin:"0 0 12px 0"}}>Support the project</p>
      <a
        href="https://buymeacoffee.com/ocarmeli7n"
        target="_blank"
        rel="noopener noreferrer"
        style={{display:"inline-block",padding:"7px 18px",fontSize:13,color:"#e2e8f0",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,textDecoration:"none",cursor:"pointer",transition:"background 0.2s,border-color 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}
      >
        Support ☕
      </a>
    </div>
  );
}
