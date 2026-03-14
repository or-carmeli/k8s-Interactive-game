// Vercel Edge Middleware
// 1. Edge-level security: host validation, path blocking, path length limit
// 2. OG meta tag rewriting for status.kubequest.online

// ---------------------------------------------------------------------------
// Config - run on all routes
// ---------------------------------------------------------------------------
export const config = { matcher: "/(.*)" };

// ---------------------------------------------------------------------------
// Allowed hosts (production + Vercel preview deployments)
// ---------------------------------------------------------------------------
const ALLOWED_HOSTS = new Set([
  "kubequest.online",
  "www.kubequest.online",
  "status.kubequest.online",
  "localhost",
]);

function isAllowedHost(hostname) {
  if (ALLOWED_HOSTS.has(hostname)) return true;
  // Allow Vercel preview deployments (*.vercel.app)
  if (hostname.endsWith(".vercel.app")) return true;
  // Allow localhost with port
  if (hostname.startsWith("localhost:")) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Blocked path patterns - common scanner/attack probes
// ---------------------------------------------------------------------------
const BLOCKED_PATHS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.aws/i,
  /^\/\.docker/i,
  /^\/\.ssh/i,
  /^\/\.htaccess/i,
  /^\/\.htpasswd/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/wp-content/i,
  /^\/wp-includes/i,
  /^\/wordpress/i,
  /^\/phpmyadmin/i,
  /^\/adminer/i,
  /^\/cgi-bin/i,
  /^\/admin\/?$/i,
  /^\/administrator/i,
  /^\/xmlrpc\.php/i,
  /^\/eval-stdin/i,
  /^\/vendor\//i,
  /^\/config\.php/i,
  /^\/debug\//i,
  /^\/server-status/i,
  /^\/server-info/i,
  /^\/telescope/i,
];

const MAX_PATH_LENGTH = 2048;

// ---------------------------------------------------------------------------
// Security checks (run before any other logic)
// ---------------------------------------------------------------------------
function securityCheck(request) {
  const url = new URL(request.url);

  // 1. Host validation
  if (!isAllowedHost(url.hostname)) {
    return new Response("Misdirected Request", { status: 421 });
  }

  // 2. Path length limit
  if (url.pathname.length > MAX_PATH_LENGTH) {
    return new Response("URI Too Long", { status: 414 });
  }

  // 3. Blocked paths
  for (const pattern of BLOCKED_PATHS) {
    if (pattern.test(url.pathname)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  return null; // passed all checks
}

// ---------------------------------------------------------------------------
// OG tag rewriting for status.kubequest.online
// ---------------------------------------------------------------------------
const STATUS_HOST = "status.kubequest.online";

const STATUS_META = {
  "og:url":             `https://${STATUS_HOST}`,
  "og:title":           "KubeQuest Status - Service Health",
  "og:description":     "Real-time platform and service health for KubeQuest.",
  "og:image":           `https://${STATUS_HOST}/status-preview.png`,
  "og:image:secure_url":`https://${STATUS_HOST}/status-preview.png`,
  "og:image:alt":       "KubeQuest Status - All Systems Operational",
  "twitter:title":      "KubeQuest Status - Service Health",
  "twitter:description":"Real-time platform and service health for KubeQuest.",
  "twitter:image":      `https://${STATUS_HOST}/status-preview.png`,
  "twitter:image:alt":  "KubeQuest Status - All Systems Operational",
};

async function handleStatusOG(request) {
  const res = await fetch(request);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;

  let html = await res.text();

  // Replace matching meta tags
  for (const [key, value] of Object.entries(STATUS_META)) {
    // property="og:..." or name="twitter:..."
    const attr = key.startsWith("og:") ? "property" : "name";
    const re = new RegExp(
      `(<meta\\s+${attr}="${key}"\\s+content=")([^"]*)(")`,
      "i"
    );
    html = html.replace(re, `$1${value}$3`);
  }

  // Also fix canonical URL and <title>
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="https://${STATUS_HOST}/"`
  );
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>KubeQuest Status - Service Health</title>`
  );

  return new Response(html, {
    status: res.status,
    headers: { ...Object.fromEntries(res.headers), "content-type": "text/html; charset=utf-8" },
  });
}

// ---------------------------------------------------------------------------
// Main middleware entry point
// ---------------------------------------------------------------------------
export default async function middleware(request) {
  // Security checks first
  const blocked = securityCheck(request);
  if (blocked) return blocked;

  // OG rewriting for status subdomain
  const url = new URL(request.url);
  if (url.hostname === STATUS_HOST) {
    return handleStatusOG(request);
  }
}
