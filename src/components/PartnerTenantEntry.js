import React from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PartnerTenantEntry() {
  const auth = useAuth();
  const { orgSlug } = useParams();
  const location = useLocation();

  const org = auth?.getCurrent ? auth.getCurrent()?.org : auth?.org;
  if (!org) {
    const returnTo = location?.pathname ? `${location.pathname}${location.search || ""}` : "/partners";
    return <Navigate to="/" replace state={{ openCEOPrompt: true, returnTo }} />;
  }

  const mySlug = org.slug || slugify(org.name || org.id);
  if (orgSlug && mySlug && orgSlug !== mySlug) {
    return <Navigate to={`/partners/${mySlug}`} replace />;
  }

  // Single source of truth: partner dashboard lives inside the CEO workspace.
  const justLoggedIn = Boolean(location?.state?.justLoggedIn);
  return <Navigate to="/ceo/partner-dashboard" replace state={justLoggedIn ? { justLoggedIn: true } : {}} />;
}
