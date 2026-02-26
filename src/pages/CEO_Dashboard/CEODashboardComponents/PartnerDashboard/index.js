import React from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import useDashboardData from "./useDashboardData";

export default function PartnerDashboardShell() {
  const parentCtx = useOutletContext() || {};
  const darkMode = parentCtx.darkMode ?? false;
  const orgId = parentCtx.org?.id || "anon";

  const { summary, overview, uploads, loading, error, refresh, simulateImpact } = useDashboardData();

  return (
    <Outlet
      context={{
        darkMode,
        orgId,
        summary,
        overview,
        uploads,
        loading,
        error,
        refresh,
        simulateImpact,
      }}
    />
  );
}
