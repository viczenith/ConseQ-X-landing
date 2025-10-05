// src/pages/CEO_Dashboard/services/orgHealth/score.js
// Small deterministic scoring util for organizational health systems.
// Keep calculations simple and auditable.

export function computeSystemScore(metrics = {}, weights = {}) {
  // metrics: { metricKey: valueBetween0And1, ... }
  // weights: { metricKey: weight, ... }
  const weightKeys = Object.keys(weights);
  if (weightKeys.length === 0) {
    // If no weights provided, average metrics
    const vals = Object.values(metrics);
    if (vals.length === 0) return 0;
    const avg = vals.reduce((s, v) => s + (Number(v) || 0), 0) / vals.length;
    return Math.round(avg * 100);
  }

  const sumWeights = weightKeys.reduce((s, k) => s + (Number(weights[k]) || 0), 0) || 1;
  const raw = weightKeys.reduce((acc, k) => {
    const v = Number(metrics[k]) || 0;
    const w = Number(weights[k]) || 0;
    return acc + v * w;
  }, 0);
  const normalized = raw / sumWeights;
  return Math.round(Math.max(0, Math.min(1, normalized)) * 100);
}
