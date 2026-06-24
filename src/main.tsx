import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global error reporting system to help debug "Script error." and other hidden iframe issues
const reportErrorToServer = (message: string, stack?: string, url?: string, line?: number, column?: number) => {
  try {
    const msg = (message || "").toLowerCase();
    const stk = (stack || "").toLowerCase();
    
    // Filter out benign HMR/Vite WebSocket/connection errors and iframe sandbox cross-origin script error noise
    const isBenign = 
      msg.includes("websocket") || 
      msg.includes("connection") || 
      msg.includes("hmr") || 
      msg.includes("vite") || 
      msg.includes("script error") ||
      stk.includes("websocket") || 
      stk.includes("connection") || 
      stk.includes("hmr");

    if (isBenign) {
      return;
    }

    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, stack, url, line, column }),
    }).catch(() => {});
  } catch (e) {}
};

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    reportErrorToServer(
      event.message || "Uncaught error",
      event.error?.stack || "",
      event.filename || "",
      event.lineno || 0,
      event.colno || 0
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    reportErrorToServer(
      reason?.message || String(reason) || "Unhandled promise rejection",
      reason?.stack || "",
      "",
      0,
      0
    );
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
