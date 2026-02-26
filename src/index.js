import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from "./contexts/AuthContext";

function getBasename() {
  // In development we want clean local routes like /admin, /ceo/dashboard.
  // In production (e.g., GitHub Pages), PUBLIC_URL/homepage provides the subpath.
  if (process.env.NODE_ENV !== "production") return "";

  const raw = process.env.PUBLIC_URL || "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "";
    }
  } catch {
    // ignore
  }
  const path = String(raw || "").trim();
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path.replace(/\/$/, "") : `/${path.replace(/\/$/, "")}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);



