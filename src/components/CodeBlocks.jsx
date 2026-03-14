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

const HEADER_STYLE = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 14px",
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: 0.5,
  fontFamily: MONO_FONT,
  userSelect: "none",
};

/**
 * Terminal-style code block for kubectl commands and shell output.
 *
 * - `command` lines get a $ prompt prefix and brighter color
 * - `output` lines render in dimmer color
 * - Set `variant="output"` to render everything as output (no $ prompt)
 * - Set `variant="error"` for red-tinted error output
 *
 * Each block includes a type header (>_ Terminal, ⌘ Output) for clarity.
 */
export function TerminalBlock({ children, label, variant }) {
  const isOutput = variant === "output";
  const isError = variant === "error";
  const lines = (children || "").split("\n");

  // Header config per variant
  let headerIcon, headerText, headerColor, headerBg, headerBorder;
  if (isError) {
    headerIcon = "\u2318";
    headerText = "Output";
    headerColor = "rgba(239,68,68,0.55)";
    headerBg = "rgba(239,68,68,0.04)";
    headerBorder = "rgba(239,68,68,0.08)";
  } else if (isOutput) {
    headerIcon = "\u2318";
    headerText = "Output";
    headerColor = "rgba(0,212,255,0.4)";
    headerBg = "rgba(0,212,255,0.02)";
    headerBorder = "rgba(0,212,255,0.07)";
  } else {
    headerIcon = ">_";
    headerText = "";
    headerColor = "rgba(0,212,255,0.5)";
    headerBg = "rgba(0,212,255,0.03)";
    headerBorder = "rgba(0,212,255,0.08)";
  }

  const bg = isError ? "rgba(239,68,68,0.03)" : "var(--code-bg, rgba(0,0,0,0.45))";
  const borderColor = isError ? "rgba(239,68,68,0.15)" : "rgba(0,212,255,0.13)";
  const labelColor = isError ? "rgba(239,68,68,0.4)" : "rgba(0,212,255,0.35)";

  return (
    <div
      dir="ltr"
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        overflow: "hidden",
        direction: "ltr",
        unicodeBidi: "isolate",
        margin: "4px 0",
      }}
    >
      <div
        style={{
          ...HEADER_STYLE,
          color: headerColor,
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
        }}
      >
        <span style={{ opacity: 0.7 }}>{headerIcon}</span>
        {headerText && <span>{headerText}</span>}
      </div>
      <div style={{ padding: "10px 14px" }}>
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
    </div>
  );
}

/**
 * YAML / config code block with purple-tinted styling.
 *
 * Simple syntax highlighting: keys (before `:`) in brighter color,
 * values (after `:`) in dimmer color.
 * YAML blocks keep `white-space: pre` to preserve indentation structure.
 *
 * Includes a "YAML" type header for visual identification.
 */
export function YamlBlock({ children, label }) {
  const lines = (children || "").split("\n");

  return (
    <div
      dir="ltr"
      style={{
        background: "rgba(139,92,246,0.05)",
        border: "1px solid rgba(139,92,246,0.18)",
        borderRadius: 10,
        overflow: "hidden",
        overflowX: "auto",
        direction: "ltr",
        unicodeBidi: "isolate",
        margin: "4px 0",
      }}
    >
      <div
        style={{
          ...HEADER_STYLE,
          color: "rgba(139,92,246,0.55)",
          background: "rgba(139,92,246,0.04)",
          borderBottom: "1px solid rgba(139,92,246,0.10)",
        }}
      >
        <span>YAML</span>
      </div>
      <div style={{ padding: "10px 14px" }}>
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
    </div>
  );
}
