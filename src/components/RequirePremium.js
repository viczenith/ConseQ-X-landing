import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequirePremium({ children }) {
  const { org } = useAuth();
  if (!org) return <Navigate to="/" replace />;
  const now = Date.now();
  const sub = org.subscription || { tier: "free", expiresAt: 0 };
  const isPremium = sub.tier === "premium" && sub.expiresAt > now;
  if (!isPremium) {
    // if not premium, redirect to a subscribe page or show an upsell modal route
    return <Navigate to="/subscribe" replace />;
  }
  return children;
}
