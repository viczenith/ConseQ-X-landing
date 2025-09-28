import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    // not logged in -> send to home where you can show register/login modal or page
    return <Navigate to="/" replace />;
  }
  return children;
}
