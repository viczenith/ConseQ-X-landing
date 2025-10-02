// Placeholder API service scaffold. Mirror mockService API but not wired.

export async function runAssessment(orgId, systemKey, options = {}) {
  return Promise.reject(new Error("Not wired"));
}

export async function getDashboardSummary(orgId) {
  return Promise.reject(new Error("Not wired"));
}

export async function simulateImpact(orgId, systemKey, changePct = 10) {
  return Promise.reject(new Error("Not wired"));
}

export async function loadFixtures() {
  // no-op for API
  return Promise.resolve();
}

export default { runAssessment, getDashboardSummary, simulateImpact, loadFixtures };
