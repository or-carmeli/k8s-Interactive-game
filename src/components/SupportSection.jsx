export default function SupportSection() {
  return (
    <div style={{textAlign:"center",marginTop:14,padding:"6px 0"}}>
      <a
        href="https://buymeacoffee.com/ocarmeli7n"
        target="_blank"
        rel="noopener noreferrer"
        style={{color:"#475569",fontSize:11,textDecoration:"none",transition:"color 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.color="#64748b";}}
        onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}
      >
        Enjoying KubeQuest? Support the project ☕
      </a>
    </div>
  );
}
