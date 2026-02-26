import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  // Wait for the initial session-restore check before making routing decisions
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    const returnTo = `${location.pathname || "/"}${location.search || ""}`;
    return <Navigate to="/" replace state={{ openCEOPrompt: true, returnTo }} />;
  }

  return children;
}
