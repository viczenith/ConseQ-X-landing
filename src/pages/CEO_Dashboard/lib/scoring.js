// Deterministic scoring module (pure functions)

function clip01(x) {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function clip100(x) {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

// Normalize a single metric into 0..100. If value seems already 0..1, scale; else clip 0..100.
export function normalizeMetric(value) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 0 && n <= 1) return Math.round(n * 100);
  return Math.round(clip100(n));
}

export function scoreSystem(metrics = {}, weights = {}, requiredMetrics) {
  const keys = Object.keys(metrics || {});
  if (!keys.length) {
    return { score: 0, coverage: 0, inputMetrics: {}, rationale: { top: [], text: "No data" } };
  }

  // normalize metrics
  const norm = {};
  keys.forEach((k) => {
    const v = normalizeMetric(metrics[k]);
    if (v != null) norm[k] = v; // keep only valid
  });

  const usedKeys = Object.keys(norm);
  if (!usedKeys.length) {
    return { score: 0, coverage: 0, inputMetrics: {}, rationale: { top: [], text: "No valid metrics" } };
  }

  // coverage
  let coverage = 0;
  if (Array.isArray(requiredMetrics) && requiredMetrics.length) {
    const present = requiredMetrics.filter((k) => norm[k] != null).length;
    coverage = requiredMetrics.length ? present / requiredMetrics.length : 0;
  } else {
    const present = usedKeys.length;
    const total = keys.length;
    coverage = total ? present / total : 0;
  }

  // weights default equal
  const w = {};
  let wsum = 0;
  usedKeys.forEach((k) => {
    const wk = weights[k] == null ? 1 : Number(weights[k]);
    w[k] = wk;
    wsum += wk;
  });
  if (wsum <= 0) {
    usedKeys.forEach((k) => (w[k] = 1));
    wsum = usedKeys.length;
  }

  // weighted mean and clip to 0..100
  let acc = 0;
  usedKeys.forEach((k) => {
    acc += (norm[k] || 0) * (w[k] || 0);
  });
  const mean = acc / wsum;
  const score = Math.round(clip100(mean));

  // rationale: top 2 contributors by (metric*weight)
  const contribs = usedKeys
    .map((k) => ({ key: k, value: norm[k], weighted: (norm[k] || 0) * (w[k] || 0) }))
    .sort((a, b) => b.weighted - a.weighted);
  const top = contribs.slice(0, 2);
  const text = top.length
    ? `Top drivers: ${top.map((t) => `${t.key} (${t.value})`).join(", ")}`
    : "No strong drivers";

  return { score, coverage: Number(coverage.toFixed(3)), inputMetrics: norm, rationale: { top, text } };
}

export function computeOrgHealth(systemScores = [], systemWeights = {}) {
  if (!Array.isArray(systemScores) || !systemScores.length) return { orgHealth: 0, confidence: 0, breakdown: [] };
  let acc = 0;
  let wsum = 0;
  const breakdown = systemScores.map(({ key, score, coverage }) => {
    const w = systemWeights[key] == null ? 1 : Number(systemWeights[key]);
    acc += (Number(score) || 0) * w;
    wsum += w;
    return { key, score: clip100(Number(score) || 0), coverage: clip01(Number(coverage) || 0) };
  });
  if (wsum <= 0) wsum = systemScores.length;
  const orgHealth = Math.round(clip100(acc / wsum));
  const coverageAvg = breakdown.reduce((s, x) => s + (x.coverage || 0), 0) / breakdown.length;
  const confidence = Math.min(1, 0.5 + 0.5 * coverageAvg);
  return { orgHealth, confidence: Number(confidence.toFixed(3)), breakdown };
}

export function explain(metrics = {}, weights = {}) {
  const keys = Object.keys(metrics || {});
  const norm = {};
  keys.forEach((k) => {
    const v = normalizeMetric(metrics[k]);
    if (v != null) norm[k] = v;
  });
  const used = Object.keys(norm);
  const contribs = used
    .map((k) => ({ key: k, value: norm[k], weighted: (norm[k] || 0) * (Number(weights[k] ?? 1)) }))
    .sort((a, b) => b.weighted - a.weighted);
  const top = contribs.slice(0, 3);
  return { top, deltas: contribs.map(({ key, value }) => ({ key, delta: value - 50 })) };
}

export default {
  normalizeMetric,
  scoreSystem,
  computeOrgHealth,
  explain,
};
