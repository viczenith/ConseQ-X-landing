import { apiFetch } from "./apiClient";

// API service that mirrors mockService shapes, backed by the Django API.

export async function runAssessment(orgId, systemKey, options = {}) {
  // orgId is resolved server-side; accepted for compatibility with mockService.
  return apiFetch("/assessments/run", {
    method: "POST",
    body: {
      system_key: systemKey,
      ...(options && typeof options === "object" ? options : {}),
    },
  });
}

export async function getDashboardSummary(orgId) {
  // orgId is resolved server-side; accepted for compatibility with mockService.
  return apiFetch("/dashboard/summary", { method: "GET" });
}

export async function simulateImpact(orgId, systemKey, changePct = 10) {
  // orgId is resolved server-side; accepted for compatibility with mockService.
  return apiFetch("/dashboard/simulate-impact", {
    method: "POST",
    body: { system_key: systemKey, change_pct: changePct },
  });
}

export async function loadFixtures() {
  // no-op for API
  return Promise.resolve();
}

export default { runAssessment, getDashboardSummary, simulateImpact, loadFixtures };
