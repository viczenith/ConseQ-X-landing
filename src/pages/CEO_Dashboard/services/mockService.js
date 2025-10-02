import { scoreSystem, computeOrgHealth } from "../lib/scoring";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";

const STORAGE_KEY = "conseqx_assessments_v1";
const FIXTURE_ORG_KEY = "CEO_DB_FIXTURES_ORG";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

function makeRunId(prefix = "A-run") {
  const d = new Date();
  const pad = (n, w = 2) => n.toString().padStart(w, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  const rand = Math.abs(hashCode(`${prefix}-${stamp}`)).toString(36).slice(0, 4).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function deterministicSystemMetrics(orgId, systemId) {
  // Simple deterministic pseudo-metrics seeded by org+system
  const seed = `${orgId}::${systemId}`;
  const h = Math.abs(hashCode(seed));
  // 3-5 metrics in 0..100
  const m1 = 55 + (h % 41);
  const m2 = 50 + ((h >> 3) % 46);
  const m3 = 45 + ((h >> 5) % 50);
  const m4 = 40 + ((h >> 7) % 55);
  return { throughput: m1, cycle_time: m2, quality: m3, predictability: m4 };
}

export async function runAssessment(orgId, systemKey, options = {}) {
  const systemId = normalizeSystemKey(systemKey);
  const nowISO = new Date().toISOString();
  const metrics = deterministicSystemMetrics(orgId || "anon", systemId);
  const weights = { throughput: 1, cycle_time: 1, quality: 1, predictability: 1 };
  const { score, coverage, rationale } = scoreSystem(metrics, weights);
  const result = {
    id: makeRunId("A"),
    systemId,
    title: `${(CANONICAL_SYSTEMS.find((s) => s.key === systemId) || {}).title || systemId} Assessment`,
    score,
    coverage,
    timestamp: Date.now(),
    orgId: orgId || "anon",
    meta: { simulated: true, rationale, metrics, weights },
  };

  // persist to localStorage list for org
  const all = readAll();
  const arr = all[result.orgId] || [];
  all[result.orgId] = [result, ...arr].slice(0, 200);
  writeAll(all);

  // broadcast update
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("conseqx_assessments");
      bc.postMessage({ type: "assessments:update", orgId: result.orgId, payload: all[result.orgId] });
      bc.close();
    }
  } catch {}

  return result;
}

export async function getDashboardSummary(orgId) {
  // Aggregate latest per system and compute org health
  const all = readAll();
  const list = all[orgId] || [];
  const bySys = {};
  list.forEach((r) => {
    const k = normalizeSystemKey(r.systemId);
    if (!bySys[k] || (bySys[k].timestamp || 0) < (r.timestamp || 0)) bySys[k] = r;
  });
  const systemScores = Object.keys(bySys).map((key) => ({ key, score: bySys[key].score || 0, coverage: bySys[key].coverage ?? 1 }));
  // default equal weights
  const { orgHealth, confidence, breakdown } = computeOrgHealth(systemScores);

  // light north star & recs from fixtures or defaults
  let north_star = "Increase on-time delivery by 15%";
  try {
    const fixture = JSON.parse(localStorage.getItem(FIXTURE_ORG_KEY) || "null");
    if (fixture?.north_star) north_star = fixture.north_star;
  } catch {}

  const systems = CANONICAL_SYSTEMS.map((s) => ({
    key: s.key,
    title: s.title,
    latest: bySys[s.key] || null,
  }));

  const top_recommendations = systems
    .filter((s) => s.latest)
    .sort((a, b) => (a.latest.score || 0) - (b.latest.score || 0))
    .slice(0, 3)
    .map((s) => ({ id: `rec-${s.key}`, system: s.key, text: `Improve ${s.title} processes this quarter.` }));

  return {
    org_id: orgId,
    run_id: makeRunId("DASH"),
    date: new Date().toISOString(),
    org_health: orgHealth,
    confidence,
    north_star,
    systems,
    top_recommendations,
  };
}

export function simulateImpact(orgId, systemKey, changePct = 10) {
  const systemId = normalizeSystemKey(systemKey);
  const all = readAll();
  const list = all[orgId] || [];
  const bySys = {};
  list.forEach((r) => {
    const k = normalizeSystemKey(r.systemId);
    if (!bySys[k] || (bySys[k].timestamp || 0) < (r.timestamp || 0)) bySys[k] = r;
  });
  const systemScores = CANONICAL_SYSTEMS.map((s) => {
    const cur = bySys[s.key];
    return { key: s.key, score: cur ? cur.score : 50, coverage: cur ? cur.coverage ?? 1 : 0.5 };
  });
  const base = computeOrgHealth(systemScores);
  const boosted = systemScores.map((s) => (s.key === systemId ? { ...s, score: Math.min(100, s.score * (1 + changePct / 100)) } : s));
  const after = computeOrgHealth(boosted);
  return { before: base, after };
}

export function loadFixtures() {
  // Load org_seed.json into localStorage for quick demo data
  try {
    // Note: bundlers will inline JSON imports if configured; here we fetch via dynamic import fallback.
    // In this environment, we simulate loading by embedding a small seed at runtime if not present.
    if (!localStorage.getItem(FIXTURE_ORG_KEY)) {
      const seed = {
        org_id: "org-1",
        org_name: "Demo Org",
        north_star: "Ship features faster with higher quality",
      };
      localStorage.setItem(FIXTURE_ORG_KEY, JSON.stringify(seed));
    }
  } catch {}
}

export default { runAssessment, getDashboardSummary, simulateImpact, loadFixtures };
