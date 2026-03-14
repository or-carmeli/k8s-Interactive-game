import React from "react";

const MONO_FONT = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";

const LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.3,
  marginBottom: 6,
  display: "block",
  userSelect: "none",
  unicodeBidi: "isolate",
};

/**
 * Terminal-style code block for kubectl commands and shell output.
 *
 * - `command` lines get a $ prompt prefix and brighter color
 * - `output` lines render in dimmer color
 * - Set `variant="output"` to render everything as output (no $ prompt)
 * - Set `variant="error"` for red-tinted error output
 */
export function TerminalBlock({ children, label, variant }) {
  const isOutput = variant === "output";
  const isError = variant === "error";
  const lines = (children || "").split("\n");

  const bg = isError ? "rgba(239,68,68,0.04)" : "var(--code-bg, rgba(0,0,0,0.45))";
  const borderColor = isError ? "rgba(239,68,68,0.10)" : "rgba(0,212,255,0.10)";
  const labelColor = isError ? "rgba(239,68,68,0.4)" : "rgba(0,212,255,0.35)";

  return (
    <div
      dir="ltr"
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "10px 14px",
        direction: "ltr",
        unicodeBidi: "isolate",
      }}
    >
      {label && (
        <span dir="auto" style={{ ...LABEL_STYLE, color: labelColor }}>
          {label}
        </span>
      )}
      <pre
        style={{
          margin: 0,
          fontFamily: MONO_FONT,
          fontSize: 13,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textAlign: "left",
        }}
      >
        {lines.map((line, i) => {
          const isCmd =
            !isOutput &&
            !isError &&
            /^(\$\s*)?(?:kubectl|helm|docker|kubeadm|crictl|etcdctl|curl|wget)\s/.test(
              line.trim()
            );
          if (isCmd) {
            const cmd = line.trim().replace(/^\$\s*/, "");
            return (
              <React.Fragment key={i}>
                <span style={{ color: "rgba(0,212,255,0.4)" }}>$ </span>
                <span style={{ color: "#7dd3fc" }}>{cmd}</span>
                {i < lines.length - 1 ? "\n" : ""}
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={i}>
              <span
                style={{
                  color: isError
                    ? "rgba(252,165,165,0.85)"
                    : isOutput
                      ? "rgba(125,211,252,0.6)"
                      : "#7dd3fc",
                }}
              >
                {line}
              </span>
              {i < lines.length - 1 ? "\n" : ""}
            </React.Fragment>
          );
        })}
      </pre>
    </div>
  );
}

/**
 * YAML / config code block with purple-tinted styling.
 *
 * Simple syntax highlighting: keys (before `:`) in brighter color,
 * values (after `:`) in dimmer color.
 * YAML blocks keep `white-space: pre` to preserve indentation structure.
 */
export function YamlBlock({ children, label }) {
  const lines = (children || "").split("\n");

  return (
    <div
      dir="ltr"
      style={{
        background: "rgba(139,92,246,0.05)",
        border: "1px solid rgba(139,92,246,0.13)",
        borderRadius: 10,
        padding: "10px 14px",
        overflowX: "auto",
        direction: "ltr",
        unicodeBidi: "isolate",
      }}
    >
      {label && (
        <span dir="auto" style={{ ...LABEL_STYLE, color: "rgba(139,92,246,0.45)" }}>
          {label}
        </span>
      )}
      <pre
        style={{
          margin: 0,
          fontFamily: MONO_FONT,
          fontSize: 13,
          lineHeight: 1.7,
          whiteSpace: "pre",
          textAlign: "left",
        }}
      >
        {lines.map((line, i) => {
          // Match leading whitespace + key + colon + optional value
          const m = line.match(/^(\s*)([\w.\-/]+)(:)(.*)$/);
          if (m) {
            const [, indent, key, colon, value] = m;
            return (
              <React.Fragment key={i}>
                <span style={{ color: "rgba(196,181,253,0.5)" }}>
                  {indent}
                </span>
                <span style={{ color: "#c4b5fd" }}>{key}</span>
                <span style={{ color: "rgba(196,181,253,0.5)" }}>
                  {colon}
                </span>
                <span style={{ color: "rgba(196,181,253,0.7)" }}>
                  {value}
                </span>
                {i < lines.length - 1 ? "\n" : ""}
              </React.Fragment>
            );
          }
          // Comment or other line
          return (
            <React.Fragment key={i}>
              <span style={{ color: "rgba(196,181,253,0.6)" }}>{line}</span>
              {i < lines.length - 1 ? "\n" : ""}
            </React.Fragment>
          );
        })}
      </pre>
    </div>
  );
}
