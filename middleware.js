// Vercel Edge Middleware - rewrite OG meta tags for status.kubequest.online
// so social-media crawlers (which don't run JS) see the correct preview.

export const config = { matcher: "/" };

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

export default async function middleware(request) {
  const url = new URL(request.url);
  if (url.hostname !== STATUS_HOST) return;

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
