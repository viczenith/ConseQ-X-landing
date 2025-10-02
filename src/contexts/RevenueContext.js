import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY_METRICS = "conseqx_financial_metrics_v1";
const KEY_SNAPSHOTS = "conseqx_forecast_snapshots_v1";

const RevenueContext = createContext(null);
export function useRevenue() {
  return useContext(RevenueContext);
}

function readJSON(k, fallback) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

const genId = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000)}`;

function defaultSeed() {
  return [
    {
      id: genId("m"),
      ts: Date.now(),
      label: "Baseline (seed)",
      annualRevenue: 1200000,
      operatingCost: 720000,
      profitMarginPct: 40,
      costOfDelays: 50000,
      costOfErrors: 30000,
      retentionPct: 85,
      innovationBudget: 80000,
      turnoverPct: 12,
    },
  ];
}

/**
 * Simple deterministic forecast generator for demo:
 * - consumes `latest` metrics and optional adjustments
 * - returns scenarios (12 months) with numeric arrays
 */
function generateScenarios(latest = {}, adjustments = {}) {
  const months = 12;
  const monthlyBase = (latest.annualRevenue || 0) / 12;
  // sensitivity factors produced by assessments or manual adjustments
  const retentionDelta = adjustments.retentionDeltaPct || 0; // percent points
  const costMultiplier = adjustments.costMultiplier || 1; // e.g. 1.02 increases costs by 2%

  // simple growth assumptions
  const baseGrowth = 0.005; // monthly base growth
  const consGrowth = 0.001;
  const aggGrowth = 0.012;

  const retentionFactor = 1 + (Math.max(0, (latest.retentionPct || 0) + retentionDelta) - 80) / 400; // small modifier
  const costFactor = costMultiplier;

  const monthsLabels = Array.from({ length: months }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return d.toLocaleString(undefined, { month: "short", year: "numeric" });
  });

  const make = (growth, scale = 1) =>
    monthsLabels.map((_, i) =>
      Math.round(monthlyBase * Math.pow(1 + growth, i) * retentionFactor * scale / costFactor)
    );

  return {
    months: monthsLabels,
    conservative: make(consGrowth, 0.92),
    base: make(baseGrowth, 1.0),
    aggressive: make(aggGrowth, 1.12),
  };
}

export function RevenueProvider({ children }) {
  const [metrics, setMetrics] = useState(() => readJSON(KEY_METRICS, defaultSeed()));
  const [snapshots, setSnapshots] = useState(() => readJSON(KEY_SNAPSHOTS, []));

  // latest is the first entry (most recent) — metrics are stored newest-first
  const latest = useMemo(() => (metrics && metrics.length ? metrics[0] : null), [metrics]);

  useEffect(() => writeJSON(KEY_METRICS, metrics), [metrics]);
  useEffect(() => writeJSON(KEY_SNAPSHOTS, snapshots), [snapshots]);

  function addMetricsRow(row) {
    const r = { ...row, id: row.id || genId("m"), ts: row.ts || Date.now() };
    const next = [r, ...metrics];
    setMetrics(next);
    window.dispatchEvent(new CustomEvent("conseqx:metrics:updated", { detail: r }));
    // recompute forecast automatically (snapshot)
    recomputeForecasts();
    return r;
  }

  function updateMetricsRow(id, patch) {
    const next = metrics.map((m) => (m.id === id ? { ...m, ...patch } : m));
    setMetrics(next);
    window.dispatchEvent(new CustomEvent("conseqx:metrics:updated", { detail: next[0] }));
    recomputeForecasts();
  }

  function deleteMetricsRow(id) {
    const next = metrics.filter((m) => m.id !== id);
    setMetrics(next);
    window.dispatchEvent(new CustomEvent("conseqx:metrics:updated", { detail: next[0] || null }));
    recomputeForecasts();
  }

  function recomputeForecasts({ adjustments = {} } = {}) {
    const sc = generateScenarios(latest || {}, adjustments);
    const snapshot = {
      id: genId("snap"),
      ts: Date.now(),
      metricsId: latest?.id || null,
      adjustments,
      scenarios: sc,
    };
    setSnapshots((s) => [snapshot, ...s].slice(0, 50));
    // broadcast
    window.dispatchEvent(new CustomEvent("conseqx:forecast:recomputed", { detail: snapshot }));
    return snapshot;
  }

  function exportCSV() {
    // simple CSV export of metrics rows (newest-first)
    const headers = [
      "id",
      "ts",
      "label",
      "annualRevenue",
      "operatingCost",
      "profitMarginPct",
      "costOfDelays",
      "costOfErrors",
      "retentionPct",
      "innovationBudget",
      "turnoverPct",
    ];
    const rows = metrics.map((m) =>
      headers.map((h) => {
        const v = m[h];
        return typeof v === "number" ? v : (v ? String(v).replace(/"/g, '""') : "");
      })
    );
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return csv;
  }

  function importCSV(csvText) {
    try {
      const lines = csvText.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = cols[i];
        });
        // coerce known numeric fields
        const coerce = [
          "annualRevenue",
          "operatingCost",
          "profitMarginPct",
          "costOfDelays",
          "costOfErrors",
          "retentionPct",
          "innovationBudget",
          "turnoverPct",
        ];
        coerce.forEach((k) => {
          if (obj[k] !== undefined && obj[k] !== "") {
            obj[k] = Number(obj[k]);
          }
        });
        obj.ts = obj.ts ? Number(obj.ts) : Date.now();
        obj.id = obj.id || genId("m");
        return obj;
      });
      // prepend imported rows
      setMetrics((prev) => [...rows, ...prev]);
      recomputeForecasts();
      return true;
    } catch (e) {
      console.error("CSV import failed", e);
      return false;
    }
  }

  const exposed = {
    metrics,
    latest,
    snapshots,
    addMetricsRow,
    updateMetricsRow,
    deleteMetricsRow,
    recomputeForecasts,
    exportCSV,
    importCSV,
  };

  return <RevenueContext.Provider value={exposed}>{children}</RevenueContext.Provider>;
}
