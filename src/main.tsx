import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { deleteDashboardContent } from "./lib/dashboard-content-store";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 600 }}>
          <h1 style={{ color: "#b91c1c", marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{ background: "#fef2f2", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 12 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ marginTop: 12, fontSize: 11, color: "#64748b" }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

if (typeof window !== "undefined") {
  // Expose utility functions to window for debugging
  (window as any).naradaiUtils = {
    deleteInstanceData: (instanceId: string) => {
      deleteDashboardContent(instanceId);
      console.log(`✅ Data untuk instance "${instanceId}" telah dihapus`);
      console.log(`Gunakan: window.naradaiUtils.deleteInstanceData('kapal-api') untuk menghapus data instance`);
    },
  };

  const sendToParent = (data: any) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, "*");
      }
    } catch {}
  };

  window.addEventListener("error", (event) => {
    // Send structured payload to parent iframe
    sendToParent({
      type: "ERROR_CAPTURED",
      error: {
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: "window.onerror",
      },
      timestamp: Date.now(),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: any = event.reason;
    const message =
      typeof reason === "object" && reason?.message
        ? String(reason.message)
        : String(reason);
    const stack = typeof reason === "object" ? reason?.stack : undefined;

    // Mirror to parent iframe as well
    sendToParent({
      type: "ERROR_CAPTURED",
      error: {
        message,
        stack,
        filename: undefined,
        lineno: undefined,
        colno: undefined,
        source: "unhandledrejection",
      },
      timestamp: Date.now(),
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);