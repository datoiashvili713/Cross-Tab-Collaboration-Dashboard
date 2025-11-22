import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  const skeleton = document.getElementById("skeleton-loader");
  if (skeleton) {
    setTimeout(() => {
      skeleton.style.display = "none";
    }, 100);
  }
}
