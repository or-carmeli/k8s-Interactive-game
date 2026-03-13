/**
 * Bidirectional (bidi) text rendering utilities for mixed Hebrew/English content.
 *
 * These functions handle RTL/LTR isolation so that English Kubernetes terms
 * (Role, ServiceAccount, Namespace, etc.) render correctly inside Hebrew sentences.
 *
 * Extracted from App.jsx to enable regression testing.
 */
import React from "react";

// ─── Detect Hebrew ────────────────────────────────────────────────────────────
export const hasHebrew = (text) => /[\u05D0-\u05EA]/.test(text ?? "");

// ─── Term classification ──────────────────────────────────────────────────────

// Kubernetes concept terms - highlighted as concept tags (not code).
// These are K8s resource types, states, and service types.
export const K8S_CONCEPT_TERMS = new Set([
  // Core resource types
  "pod","node","namespace","deployment","replicaset",
  "statefulset","daemonset","job","cronjob","configmap","secret",
  "ingress","networkpolicy","serviceaccount",
  "service","endpoint","endpoints","selector","label","labels",
  "annotation","annotations","taint","taints","toleration","tolerations",
  "affinity","container","containers","volume","volumes",
  "probe","livenessprobe","readinessprobe","startupprobe",
  // Plurals of common resources
  "replicasets","deployments","services","nodes","namespaces",
  // Storage resources
  "pv","pvc","persistentvolume","persistentvolumeclaim","storageclass",
  // Scaling resources
  "hpa","vpa","pdb","poddisruptionbudget",
  // Pod states & errors
  "oomkilled","crashloopbackoff","imagepullbackoff","errimagepull",
  "containercreating",
  // Service types
  "clusterip","nodeport","loadbalancer","externalname",
  // RBAC & other K8s resources
  "role","clusterrole","rolebinding","clusterrolebinding",
  "resourcequota","limitrange","priorityclass","ingresscontroller",
]);

// CLI tools & infrastructure components - rendered as inline code.
export const K8S_CODE_TERMS = new Set([
  "kubectl","helm","docker","kubelet","kubeadm","crictl","etcdctl",
  "api-server","kube-proxy","etcd","coredns",
  "kube-scheduler","kube-controller-manager","containerd","cri-o",
  "flannel","calico","cilium","istio","prometheus","grafana",
]);

// Returns "code", "concept", or null for a given token.
export function getTermKind(token) {
  // Flags like --show-labels, --namespace=kube-system, -n, -f → code
  if (/^--?[A-Za-z]/.test(token)) return "code";
  // Dotted paths like spec.containers or securityContext.runAsNonRoot → code
  if (/^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z]/.test(token)) return "code";
  // Label selectors: app=backend, tier=frontend, key=value → code
  if (/^[a-zA-Z][\w.-]*=[^\s]*$/.test(token)) return "code";
  // Slash-paths: /api/v1, /healthz, /etc/kubernetes → code
  if (/^\/[a-zA-Z]/.test(token)) return "code";
  const lower = token.toLowerCase();
  const bare = lower.replace(/s$/, "");
  if (K8S_CODE_TERMS.has(lower) || K8S_CODE_TERMS.has(bare)) return "code";
  if (K8S_CONCEPT_TERMS.has(lower) || K8S_CONCEPT_TERMS.has(bare)) return "concept";
  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Inline-code style for CLI tools, dotted paths, backtick spans
export const CODE_SPAN_STYLE = {background:"rgba(0,212,255,0.06)",borderRadius:4,padding:"1px 5px",fontSize:"0.88em",fontFamily:"'SF Mono','Fira Code','Cascadia Code',monospace",color:"var(--code-text)"};

// Concept tag style for K8s resource types - highlighted but not code
export const CONCEPT_TAG_STYLE = {background:"var(--concept-bg)",border:"1px solid var(--concept-border)",borderRadius:6,padding:"1px 6px",fontSize:"0.92em",fontWeight:600,color:"var(--concept-text)",marginInline:4};

// ─── renderBidiInner ──────────────────────────────────────────────────────────

// Inner bidi logic: wraps Latin sequences, flags, and arrows in <span dir="ltr">, applies code styling to K8s terms.
export function renderBidiInner(text, lang, keyPrefix) {
  if (!text || (!/[A-Za-z]/.test(text) && !/[←]/.test(text) && !/(->|<-)/.test(text))) return text;
  // Normalize ASCII arrows to Unicode, then replace with bidi-safe alternatives:
  // Line-start → (bullet) becomes "· ", mid-text → becomes ":"
  text = text.replace(/-->/g, "\u2192").replace(/<--/g, "\u2190").replace(/->/g, "\u2192").replace(/<-(?!-)/g, "\u2190");
  text = text.replace(/^→\s*/gm, "· ").replace(/\s*→\s*/g, ": ");
  // @regression - Hebrew↔Latin slash normalization
  // Prevents the bidi bug where "משתמש/ServiceAccount" was rendered as a "/ServiceAccount"
  // badge because the regex captured it as a slash-path (like /api/v1).
  // Inserts spaces around slashes at Hebrew↔Latin boundaries so each side is a separate
  // bidi run. Latin/Latin slashes (CPU/Memory, kube-dns/CoreDNS) are NOT affected.
  // See bidi.test.jsx for regression cases. Do NOT remove without updating tests.
  text = text.replace(/([\u0590-\u05EA])\/([A-Za-z])/g, "$1 / $2");
  text = text.replace(/([A-Za-z])\/([\u0590-\u05EA])/g, "$1 / $2");
  // Split on: flag sequences (--flag, -f), slash-paths (/api/v1), Latin word sequences, or left-arrow
  // Slash-paths require NOT preceded by Hebrew to avoid capturing "/ServiceAccount" from "משתמש/ServiceAccount"
  const parts = text.split(/((?:(?<![\u0590-\u05FF])--?[A-Za-z][\w\-]*(?:=[^\s\u0590-\u05FF]*)?(?:\s+(?=(?:--?)?[A-Za-z]))?)+|(?:(?<![\u0590-\u05EA])\/[A-Za-z][A-Za-z0-9\-_/.:]*)|(?:[A-Za-z](?:[A-Za-z0-9\-_:/=]|\.[A-Za-z0-9])*(?:\s+(?=(?:--?)?[A-Za-z]))?)+|[←])/);
  if (parts.length <= 1) return text;
  const startsWithLatin = /^[A-Za-z]/.test(text) || /^--?[A-Za-z]/.test(text) || /^\/[A-Za-z]/.test(text);
  return parts.map((part, idx) => {
    const k = `${keyPrefix}-${idx}`;
    if (/^[A-Za-z]/.test(part) || /^--?[A-Za-z]/.test(part) || /^\/[A-Za-z]/.test(part)) {
      const kind = getTermKind(part);
      const termStyle = kind === "code" ? CODE_SPAN_STYLE : kind === "concept" ? CONCEPT_TAG_STYLE : undefined;
      return [idx === 0 && startsWithLatin ? "\u200F" : null, <span key={k} dir="ltr" style={{unicodeBidi:"isolate",margin:"0 2px",...termStyle}}>{"\u2066"}{part}{"\u2069"}</span>];
    }
    // Left-arrow - wrap in LTR isolation to prevent bidi reordering
    if (/^[←]$/.test(part)) {
      return <span key={k} dir="ltr" style={{unicodeBidi:"isolate",padding:"0 2px"}}>{part}</span>;
    }
    // Non-matched (RTL) text - keep in natural RTL flow.
    // Using dir="rtl" + unicodeBidi:"isolate" (no extra Unicode chars) prevents
    // short Hebrew words like "או" from being visually corrupted at line-wrap boundaries.
    // Prepend RTL mark (U+200F) to punctuation-only segments following an LTR span
    // so neutral chars like "." don't get visually absorbed by the preceding LTR run.
    if (!part) return null;
    const needsAnchor = idx > 0 && /^[\s]*[.,;:!?)}\]>]/.test(part);
    return <span key={k} dir="rtl" style={{unicodeBidi:"isolate"}}>{needsAnchor ? "\u200F" : ""}{part}</span>;
  });
}

// ─── Hebrew prefix terms ─────────────────────────────────────────────────────

// Hebrew prefix+hyphen+English term pattern (ה-Deployment, ב-namespace, ל-Service)
// Renders the Hebrew prefix attached to RTL flow with a non-breaking hyphen,
// followed by the English term in an isolated LTR span with concept/code styling.
// Trailing dots that are sentence punctuation (before whitespace, end, or another punct)
// are excluded from the term capture so "ב-v1.25." keeps "." outside the term.
// Dots inside tokens (v1.25, svc.cluster.local) are fine - they're followed by alphanumeric.
export const HE_PREFIX_TERM_RE = /([\u0590-\u05FF])-([A-Za-z][A-Za-z0-9\-_./]*[A-Za-z0-9]|[A-Za-z])/g;

export function renderHebrewPrefixTerms(text, lang, keyPrefix) {
  if (lang !== "he" || !HE_PREFIX_TERM_RE.test(text)) return null;
  HE_PREFIX_TERM_RE.lastIndex = 0;
  const parts = [];
  let last = 0;
  let m;
  while ((m = HE_PREFIX_TERM_RE.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "prefixTerm", prefix: m[1], term: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  if (parts.length <= 1 && parts[0]?.type === "text") return null;
  return parts.map((p, i) => {
    if (p.type === "prefixTerm") {
      const kind = getTermKind(p.term);
      const termStyle = kind === "code" ? CODE_SPAN_STYLE : kind === "concept" ? CONCEPT_TAG_STYLE : CONCEPT_TAG_STYLE;
      return <span key={`${keyPrefix}-hp${i}`} dir="rtl" style={{unicodeBidi:"isolate"}}>{p.prefix}{"\u2011"}<span dir="ltr" style={{unicodeBidi:"isolate",...termStyle}}>{p.term}</span></span>;
    }
    return <span key={`${keyPrefix}-ht${i}`} dir="rtl" style={{unicodeBidi:"isolate"}}>{renderBidiInner(p.value, lang, `${keyPrefix}h${i}`)}</span>;
  });
}

// ─── renderBidi ───────────────────────────────────────────────────────────────

// Wraps inline English/Latin sequences in <span dir="ltr"> for correct bidi rendering
// in RTL Hebrew paragraphs. K8s terms get inline-code styling.
// Also handles backtick-wrapped inline code (`command`) for consistency.
// Returns text unchanged for English mode.
export function renderBidi(text, lang) {
  if (!text || lang !== "he") return text;

  // @regression - Hebrew↔Latin slash normalization (see also renderBidiInner).
  // Prevents the bidi bug where "משתמש/ServiceAccount" was rendered as a "/ServiceAccount"
  // badge. Applied here BEFORE any splitting (backtick, CLI) so all code paths are covered.
  // Latin/Latin slashes (CPU/Memory) are untouched.
  // See bidi.test.jsx for regression cases. Do NOT remove without updating tests.
  text = text.replace(/([\u0590-\u05EA])\/([A-Za-z])/g, "$1 / $2");
  text = text.replace(/([A-Za-z])\/([\u0590-\u05EA])/g, "$1 / $2");

  // DNS/FQDN template patterns (e.g. <service-name>.<namespace>.svc.cluster.local)
  // Render as a single isolated LTR code span to prevent bidi fragmentation on <> and dots
  if (/^[<\w][\w.<>\-]*\.svc\.cluster\.local$/.test(text.trim()) || /^<[\w-]+>(\.<[\w-]+>)*(\.[a-z.]+)*$/.test(text.trim())) {
    return <span dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{text}</span>;
  }

  // Handle inline backtick code spans first: `term` → <span dir="ltr" style={code}>term</span>
  if (text.includes("`")) {
    const btParts = text.split(/`([^`]+)`/);
    if (btParts.length > 1) {
      return btParts.map((part, i) => {
        if (i % 2 === 1) {
          // backtick-wrapped content → always render as LTR inline code
          return <span key={`bt-${i}`} dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{part}</span>;
        }
        if (!part) return null;
        // Anchor leading punctuation to RTL context when following an LTR code span
        let seg = part;
        if (i > 0 && /^[\s]*[.,;:!?)}\]>]/.test(seg)) seg = "\u200F" + seg;
        // Process Hebrew-prefix+English-term patterns in text segments
        const prefixed = renderHebrewPrefixTerms(seg, lang, `s${i}`);
        if (prefixed) return <span key={`seg-${i}`}>{prefixed}</span>;
        return <span key={`seg-${i}`}>{renderBidiInner(seg, lang, `s${i}`)}</span>;
      });
    }
  }

  // CLI commands in mixed text: wrap entire command as single inline LTR span
  // to prevent bidi line-wrapping from reordering flags (e.g. -- migrating away from its flag)
  const bare = text.replace(/`[^`]+`/g, "");
  if (CLI_COMMAND_RE.test(bare)) {
    const cliParts = text.split(CLI_COMMAND_RE);
    if (cliParts.length > 1) {
      return cliParts.map((part, i) => {
        if (!part) return null;
        if (i % 2 === 1) return <span key={`cli-${i}`} dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{part}</span>;
        // Anchor leading punctuation to RTL context when following an LTR CLI span
        let trimmed = part.trim();
        if (!trimmed) return null;
        if (i > 0 && /^[.,;:!?)}\]>]/.test(trimmed)) trimmed = "\u200F" + trimmed;
        const prefixed = renderHebrewPrefixTerms(trimmed, lang, `b${i}`);
        if (prefixed) return <span key={`seg-${i}`}>{prefixed}</span>;
        return <span key={`seg-${i}`}>{renderBidiInner(trimmed, lang, `b${i}`)}</span>;
      });
    }
  }

  // Process Hebrew-prefix+English-term patterns before falling back to renderBidiInner
  const prefixed = renderHebrewPrefixTerms(text, lang, "b");
  if (prefixed) return prefixed;

  return renderBidiInner(text, lang, "b");
}

// ─── CLI command handling ─────────────────────────────────────────────────────

// Regex to detect CLI commands in mixed text.
// Matches: CLI tool name + one or more argument tokens (excludes Hebrew chars and opening parens
// so parenthetical explanations like "(see memory usage)" are not captured as part of the command).
export const CLI_COMMAND_RE = /((?:kubectl|docker|helm|aws|git|kubeadm|kubelet|crictl|etcdctl|curl|wget)(?:\s+(?::[^\s]|[^\s\u0590-\u05FF(:])+)+)/;

// Splits text on CLI commands and renders commands as LTR code blocks on separate lines.
export function splitCliParts(text, lang, keyPrefix) {
  const parts = text.split(CLI_COMMAND_RE);
  if (parts.length <= 1) return renderBidiInner(text, lang, keyPrefix);
  return parts.map((part, i) => {
    if (!part) return null;
    if (i % 2 === 1) return <code key={`${keyPrefix}-c${i}`} dir="ltr" className="cli-command">{part.trim()}</code>;
    const trimmed = part.trim();
    return trimmed ? <span key={`${keyPrefix}-t${i}`}>{renderBidiInner(trimmed, lang, `${keyPrefix}b${i}`)}</span> : null;
  });
}

// ─── renderBidiBlock ──────────────────────────────────────────────────────────

// Enhanced bidi renderer that detects full CLI commands (kubectl, docker, etc.)
// and renders them as standalone LTR code blocks on a separate line,
// preventing RTL word-reordering of flags like -n, --namespace.
// Falls back to renderBidi for Hebrew text without CLI commands,
// or returns text unchanged for non-Hebrew text without CLI commands.
export function renderBidiBlock(text, lang) {
  if (!text) return text;
  // Quick check: does the text contain a CLI command outside backticks?
  const bare = text.replace(/`[^`]+`/g, "");
  const hasCli = CLI_COMMAND_RE.test(bare);
  // No CLI command: for Hebrew fall back to renderBidi; for English return plain text
  if (!hasCli) return lang === "he" ? renderBidi(text, lang) : renderBidiInner(text, lang, "e");
  // CLI command found (any language): handle backtick-wrapped inline code first,
  // then CLI commands in remaining segments
  if (text.includes("`")) {
    const btParts = text.split(/`([^`]+)`/);
    if (btParts.length > 1) {
      return btParts.map((part, i) => {
        if (i % 2 === 1) return <span key={`bt-${i}`} dir="ltr" style={{unicodeBidi:"isolate",...CODE_SPAN_STYLE}}>{part}</span>;
        if (!part) return null;
        // Anchor leading punctuation to RTL context when following an LTR code span
        let seg = part;
        if (i > 0 && lang === "he" && /^[\s]*[.,;:!?)}\]>]/.test(seg)) seg = "\u200F" + seg;
        return <span key={`seg-${i}`}>{splitCliParts(seg, lang, `s${i}`)}</span>;
      });
    }
  }
  return splitCliParts(text, lang, "b");
}
