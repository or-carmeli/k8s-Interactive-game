import { Component } from "react";
import { clearAppData } from "../utils/storage";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[KubeQuest] Render error:", error, info?.componentStack);
  }

  handleReload = () => window.location.reload();

  handleReset = () => {
    this.setState({ hasError: false });
  };

  handleClearAndReload = async () => {
    await clearAppData();
    setTimeout(() => window.location.reload(), 3000);
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        background: "#020817",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, system-ui, sans-serif",
        padding: 24,
      }}>
        <div style={{
          maxWidth: 420,
          textAlign: "center",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "40px 32px",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>

          <h1 style={{
            color: "#e2e8f0",
            fontSize: 20,
            fontWeight: 700,
            margin: "0 0 8px",
          }}>
            Something went wrong
          </h1>

          <p style={{
            color: "#94a3b8",
            fontSize: 14,
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}>
            An unexpected error occurred while rendering the page.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "10px 22px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  color: "#94a3b8",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  padding: "10px 22px",
                  background: "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(168,85,247,0.18))",
                  border: "1px solid rgba(0,212,255,0.45)",
                  borderRadius: 10,
                  color: "#00D4FF",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
            </div>

            <button
              onClick={this.handleClearAndReload}
              style={{
                padding: "8px 18px",
                background: "transparent",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                color: "#EF4444",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Clear app data &amp; reload
            </button>
            <p style={{
              color: "#64748b",
              fontSize: 11,
              margin: 0,
              lineHeight: 1.4,
            }}>
              This will reset your local settings.
              Your quiz progress is saved on the server.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
