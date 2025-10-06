import * as mockService from "./mockService";
import * as apiService from "./apiService";

const useApi = String(process.env.REACT_APP_USE_API || "").toLowerCase() === "true";

function fallbackWarn(method) {
  if (useApi) {
    try {
      // eslint-disable-next-line no-console
      console.warn(`[serviceSelector] API not wired for ${method}; falling back to mockService.`);
    } catch {}
  }
}

export async function runAssessment(orgId, systemKey) {
  if (useApi) {
    try {
      return await apiService.runAssessment(orgId, systemKey);
    } catch (e) {
      fallbackWarn("runAssessment");
      return await mockService.runAssessment(orgId, systemKey);
    }
  }
  return await mockService.runAssessment(orgId, systemKey);
}

export async function getDashboardSummary(orgId) {
  if (useApi) {
    try {
      return await apiService.getDashboardSummary(orgId);
    } catch (e) {
      fallbackWarn("getDashboardSummary");
      return await mockService.getDashboardSummary(orgId);
    }
  }
  return await mockService.getDashboardSummary(orgId);
}

export async function simulateImpact(orgId, systemKey, changePct) {
  if (useApi) {
    try {
      return await apiService.simulateImpact(orgId, systemKey, changePct);
    } catch (e) {
      fallbackWarn("simulateImpact");
      return await mockService.simulateImpact(orgId, systemKey, changePct);
    }
  }
  return await mockService.simulateImpact(orgId, systemKey, changePct);
}

export async function loadFixtures(orgId) {
  if (useApi) {
    try {
      return await apiService.loadFixtures(orgId);
    } catch (e) {
      fallbackWarn("loadFixtures");
      return await mockService.loadFixtures(orgId);
    }
  }
  return await mockService.loadFixtures(orgId);
}

export const __internal = { useApi };
