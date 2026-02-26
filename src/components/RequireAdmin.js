import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAdmin({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth?.user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ openCEOPrompt: true, returnTo: location.pathname + (location.search || "") }}
      />
    );
  }

  if (!auth?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-6 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <div className="text-lg font-semibold">Not authorized</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Your account doesn’t have access to the admin console.
          </div>
        </div>
      </div>
    );
  }

  return children;
}
