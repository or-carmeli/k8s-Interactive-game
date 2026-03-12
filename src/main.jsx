import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { AccessibilityProvider } from './AccessibilityContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './theme.css'

console.info("[KubeQuest:boot] main.jsx module loaded");

try {
  const container = document.getElementById('root');
  console.info("[KubeQuest:boot] createRoot");
  const root = ReactDOM.createRoot(container);
  console.info("[KubeQuest:boot] render()");
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AccessibilityProvider>
          <ThemeProvider><App /></ThemeProvider>
        </AccessibilityProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.info("[KubeQuest:boot] render() called — React is mounting");
} catch (err) {
  console.error("[KubeQuest:boot] FATAL bootstrap error:", err);
  const el = document.getElementById('root');
  if (el) {
    el.innerHTML = `
      <div style="min-height:100vh;background:#020817;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:24px">
        <div style="max-width:420px;text-align:center;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 32px">
          <div style="font-size:48px;margin-bottom:16px">&#9888;&#65039;</div>
          <h1 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:0 0 8px">Failed to start</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;line-height:1.5">
            The application could not initialize.<br/>
            <span style="font-size:12px;color:#64748b">${String(err).slice(0, 200)}</span>
          </p>
          <button onclick="localStorage.clear();sessionStorage.clear();location.reload()" style="padding:10px 22px;background:linear-gradient(135deg,rgba(0,212,255,0.18),rgba(168,85,247,0.18));border:1px solid rgba(0,212,255,0.45);border-radius:10px;color:#00D4FF;font-size:14px;font-weight:700;cursor:pointer">
            Clear Data &amp; Reload
          </button>
        </div>
      </div>`;
  }
}
