// src/pages/CEO_Dashboard/services/orgHealth/index.js
// Minimal OrgHealth service: ingest assessment -> map to simple metrics -> compute score -> persist -> emit events

import { computeSystemScore } from "./score";

const ORG_HEALTH_KEY = "conseqx_org_health_v1";

/**
 * Persist results per orgId (simple localStorage JSON).
 */
function readAll() {
  try {
    const raw = localStorage.getItem(ORG_HEALTH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  try {
    localStorage.setItem(ORG_HEALTH_KEY, JSON.stringify(obj));
  } catch {}
}

/**
 * Save a single computed system result
 */
export function saveResult(orgId, result) {
  if (!orgId) orgId = "anon";
  const all = readAll();
  const arr = all[orgId] || [];
  // Prepend newest
  arr.unshift(result);
  all[orgId] = arr.slice(0, 300); // keep a cap
  writeAll(all);

  try {
    window.dispatchEvent(new CustomEvent("conseqx:orghealth:completed", { detail: { orgId, result } }));
  } catch {}
}

/**
 * Basic mapping: convert an assessment result into metrics for a given system.
 * This is intentionally simple and deterministic.
 *
 * result: normalized assessment object (see Assessments.js normalized variable)
 */
export function ingestAssessment(result = {}) {
  try {
    const orgId = result.orgId || "anon";
    const systemId = result.systemId || result.system || "general";

    // Build example metrics by looking into result.meta and score
    // We expect Assessment meta to include helpful keys; otherwise derive from score
    const meta = result.meta || {};

    // Basic normalized metrics (0..1)
    // - networkDensity: prefer explicit meta.networkDensity or derive from score
    // - sentiment: prefer meta.sentiment (-1..1) -> map to 0..1
    // - operational: prefer meta.operational (0..1)
    const networkDensity = typeof meta.networkDensity === "number" ? Math.max(0, Math.min(1, meta.networkDensity)) : (Number(result.score) ? Math.min(1, result.score / 100) : 0.5);
    const rawSent = typeof meta.sentiment === "number" ? meta.sentiment : null; // expected -1..1
    const sentiment = rawSent !== null ? Math.max(0, Math.min(1, (rawSent + 1) / 2)) : Math.min(1, (Number(result.score) || 0) / 100);
    const operational = typeof meta.operational === "number" ? Math.max(0, Math.min(1, meta.operational)) : Math.min(1, (Number(result.score) || 0) / 100);

    // Choose weights depending on system
    const defaultWeights = { networkDensity: 0.4, sentiment: 0.3, operational: 0.3 };
    let weights = defaultWeights;

    // Example per-system custom weights
    const systemWeights = {
      interdependency: { networkDensity: 0.6, sentiment: 0.2, operational: 0.2 },
      investigation: { networkDensity: 0.2, sentiment: 0.2, operational: 0.6 },
      inlignment: { networkDensity: 0.2, sentiment: 0.4, operational: 0.4 },
      orchestration: { networkDensity: 0.3, sentiment: 0.2, operational: 0.5 },
      illustration: { networkDensity: 0.2, sentiment: 0.5, operational: 0.3 },
      interpretation: { networkDensity: 0.2, sentiment: 0.5, operational: 0.3 }
    };
    if (systemWeights[systemId]) weights = systemWeights[systemId];

    const metrics = {
      networkDensity,
      sentiment,
      operational
    };

    const score = computeSystemScore(metrics, weights);

    const out = {
      id: result.id || `oh-${Date.now().toString(36)}`,
      orgId,
      systemId,
      score,
      breakdown: metrics,
      provenance: {
        sourceAssessmentId: result.id,
        algorithmVersion: "orghealth-v1",
        createdAt: Date.now()
      },
      timestamp: Date.now(),
      // keep original result for traceability
      original: {
        title: result.title,
        owner: result.owner,
        meta: result.meta || {}
      }
    };

    // Persist result
    saveResult(orgId, out);

    // Build a small recommendation stub (consumer UI can enrich or run an LLM for richer text)
    const recommendation = {
      id: `rec-${Date.now().toString(36)}`,
      title: `Investigate ${systemId} - ${score}%`,
      summary: `System ${systemId} received a score of ${score}%. Key drivers: ${Object.entries(metrics).map(([k, v]) => `${k}=${Math.round(v * 100)}%`).join(", ")}.`,
      impact: score < 60 ? "High — potential risk" : score < 75 ? "Medium" : "Low",
      severity: score < 60 ? "warning" : "improvement",
      predictions: {
        short: score < 60 ? "Short term: Operational friction, delays." : "Short term: Stable",
        mid: score < 60 ? "Mid term: Reduced throughput if unresolved." : "Mid term: Maintain improvements",
        long: "Long term: Monitor trends"
      },
      evidence: [
        `Derived from assessment ${result.id}`,
        ...(result.meta && result.meta.notes ? [result.meta.notes] : [])
      ],
      comparables: [],
      recommendedMeeting: {
        title: `Cross-functional sync: ${systemId}`,
        urgency: score < 60 ? "Urgent" : "High",
        attendees: ["Head of Product", "Head of Engineering", "Ops Lead"],
        proposedDurationMin: 45,
        agenda: ["Review findings", "Assign owners", "Agree next steps"]
      },
      source: `Assessment: ${systemId}`,
      createdAt: Date.now()
    };

    // Emit recommendation event for UI to pick up
    try {
      window.dispatchEvent(new CustomEvent("conseqx:orghealth:recommendation", { detail: { orgId, recommendations: [recommendation] } }));
    } catch {}

    return out;
  } catch (e) {
    // swallow errors (non-fatal) — real service should surface logs
    console.error("orgHealth.ingestAssessment error", e);
    return null;
  }
}

/**
 * Return persisted results for an org
 */
export function getResults(orgId) {
  const all = readAll();
  return all[orgId] || [];
}
