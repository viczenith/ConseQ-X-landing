import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { FaIndustry, FaChartLine, FaDownload, FaInfoCircle, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

/* ── Industry benchmark reference ── */
const INDUSTRY_BENCHMARKS = {
  technology:     { name: "Technology",         interdependency: 75, orchestration: 78, investigation: 82, interpretation: 77, illustration: 73, inlignment: 71 },
  healthcare:     { name: "Healthcare",         interdependency: 68, orchestration: 71, investigation: 85, interpretation: 74, illustration: 69, inlignment: 78 },
  financial:      { name: "Financial Services",  interdependency: 73, orchestration: 75, investigation: 79, interpretation: 81, illustration: 76, inlignment: 74 },
  manufacturing:  { name: "Manufacturing",      interdependency: 70, orchestration: 82, investigation: 73, interpretation: 68, illustration: 81, inlignment: 75 },
};

const SYS_KEYS = CANONICAL_SYSTEMS.map((s) => s.key);
const SYS_LABELS = Object.fromEntries(CANONICAL_SYSTEMS.map((s) => [s.key, s.title]));

/* ── Component ───────────── */
export default function BenchmarkingTrends() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, overview, loading, error, refresh } = ctx;

  const [selectedIndustry, setSelectedIndustry] = useState("technology");
  const [selectedMetric, setSelectedMetric] = useState("overall");

  /* Real scores from backend summary */
  const currentScores = useMemo(() => {
    const systems = summary?.systems || [];
    const map = {};
    systems.forEach((s) => { if (s.score != null) map[s.key] = s.score; });
    return map;
  }, [summary]);

  /* Radar data: org vs industry benchmark vs top quartile */
  const radarData = useMemo(() => {
    const bm = INDUSTRY_BENCHMARKS[selectedIndustry];
    if (!bm) return [];
    return SYS_KEYS.map((key) => ({
      system: SYS_LABELS[key],
      current: currentScores[key] ?? 0,
      benchmark: bm[key] ?? 0,
      topQuartile: Math.min(100, (bm[key] ?? 0) + 15),
    }));
  }, [selectedIndustry, currentScores]);

  /* Real time-series from GET /api/overview (overview.time_series) */
  const trendData = useMemo(() => {
    const ts = overview?.time_series;
    if (!Array.isArray(ts) || ts.length === 0) return [];
    const bm = INDUSTRY_BENCHMARKS[selectedIndustry];
    return ts.map((pt) => {
      const val = selectedMetric === "overall"
        ? pt.org_health ?? pt.overall
        : pt[selectedMetric];
      const bmVal = selectedMetric === "overall"
        ? Object.values(bm || {}).filter((v) => typeof v === "number").reduce((a, b) => a + b, 0) / 6
        : bm?.[selectedMetric] ?? null;
      return {
        month: pt.label || pt.month || pt.date,
        value: val != null ? Math.round(val) : null,
        benchmark: bmVal != null ? Math.round(bmVal) : null,
      };
    });
  }, [overview, selectedMetric, selectedIndustry]);

  /* Insights derived from real scores vs benchmarks */
  const insights = useMemo(() => {
    const bm = INDUSTRY_BENCHMARKS[selectedIndustry];
    if (!bm || Object.keys(currentScores).length === 0) return [];
    const out = [];
    const orgAvg = Object.values(currentScores).reduce((a, b) => a + b, 0) / Object.values(currentScores).length;
    const bmAvg = SYS_KEYS.reduce((s, k) => s + (bm[k] || 0), 0) / 6;

    if (orgAvg > bmAvg + 5) out.push({ type: "positive", text: `Performing ${Math.round(orgAvg - bmAvg)}% above ${bm.name} average` });
    else if (orgAvg < bmAvg - 5) out.push({ type: "warning", text: `${Math.round(bmAvg - orgAvg)}% below ${bm.name} average — action needed` });
    else out.push({ type: "info", text: `Tracking close to ${bm.name} industry average` });

    const comparisons = SYS_KEYS.filter((k) => currentScores[k] != null).map((k) => ({ key: k, diff: currentScores[k] - (bm[k] || 0) }));
    if (comparisons.length) {
      const best = comparisons.reduce((a, b) => (a.diff > b.diff ? a : b));
      const worst = comparisons.reduce((a, b) => (a.diff < b.diff ? a : b));
      if (best.diff > 0) out.push({ type: "positive", text: `${SYS_LABELS[best.key]} is your strongest vs industry (+${Math.round(best.diff)})` });
      if (worst.diff < -3) out.push({ type: "warning", text: `${SYS_LABELS[worst.key]} needs attention (${Math.round(worst.diff)} vs industry)` });
    }

    // Transformation readiness
    const tr = summary?.transformation_readiness;
    if (tr?.overall != null) out.push({ type: tr.overall >= 70 ? "positive" : "info", text: `Transformation readiness: ${tr.overall}%` });

    return out;
  }, [selectedIndustry, currentScores, summary]);

  /* Export */
  const exportBenchmarkData = () => {
    const blob = new Blob([JSON.stringify({ radarData, trendData, insights, industry: selectedIndustry, timestamp: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `benchmark-${selectedIndustry}-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  /* ── Loading / Error states ── */
  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading benchmarks…
    </div>
  );
  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
    </div>
  );

  const tooltip = { contentStyle: { backgroundColor: darkMode ? "#1f2937" : "#fff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px", color: darkMode ? "#f3f4f6" : "#111827" } };
  const noData = Object.keys(currentScores).length === 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"}`}>
            {Object.entries(INDUSTRY_BENCHMARKS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
          <button onClick={exportBenchmarkData} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {noData && (
        <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
          No assessment data yet — run assessments to see benchmarking comparisons
        </div>
      )}

      {/* Radar comparison */}
      {!noData && (
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
          <h4 className="font-semibold text-lg mb-1">Industry Comparison</h4>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Your scores vs {INDUSTRY_BENCHMARKS[selectedIndustry]?.name}</p>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke={darkMode ? "#374151" : "#e5e7eb"} strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="system" tick={{ fontSize: 12, fill: darkMode ? "#d1d5db" : "#6b7280" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickCount={6} />
              <Radar name="Your Org" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Industry Avg" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
              <Radar name="Top Quartile" dataKey="topQuartile" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={1} strokeDasharray="2 2" />
              <Tooltip {...tooltip} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>

          {/* Per-system summary cards */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {radarData.map((item) => (
              <div key={item.system} className={`p-3 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <div className="text-xs font-medium mb-1">{item.system}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${item.current >= item.benchmark ? "text-green-500" : "text-red-500"}`}>{item.current}%</span>
                  <span className={`text-xs ${item.current >= item.benchmark ? "text-green-600" : "text-red-600"}`}>
                    {item.current >= item.benchmark ? "+" : ""}{item.current - item.benchmark}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical trends (real time-series) + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-2xl p-6 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2"><FaChartLine className="text-green-600" /> Historical Trends</h4>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Real assessment history vs industry benchmark</p>
            </div>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}
              className={`px-3 py-1 rounded border text-sm ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}`}>
              <option value="overall">Overall Score</option>
              {CANONICAL_SYSTEMS.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
            </select>
          </div>

          {trendData.length === 0 ? (
            <div className={`rounded-lg p-8 text-center text-sm ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
              Run multiple assessments over time to see trend data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="month" stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                <YAxis domain={[0, 100]} stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                <Tooltip {...tooltip} />
                <Line type="monotone" dataKey="value" name="Your Score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
                <Line type="monotone" dataKey="benchmark" name="Industry Avg" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Insights panel */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2"><FaInfoCircle className="text-blue-600" /> Key Insights</h4>
          <div className="space-y-3">
            {insights.length === 0 && (
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No insights available yet</p>
            )}
            {insights.map((ins, i) => (
              <div key={i} className={`p-3 rounded-lg border text-sm ${
                ins.type === "positive" ? (darkMode ? "bg-green-900/20 border-green-800 text-green-200" : "bg-green-50 border-green-200 text-green-800")
                : ins.type === "warning" ? (darkMode ? "bg-yellow-900/20 border-yellow-800 text-yellow-200" : "bg-yellow-50 border-yellow-200 text-yellow-800")
                : (darkMode ? "bg-blue-900/20 border-blue-800 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-800")
              }`}>{ins.text}</div>
            ))}
            <div className={`p-3 rounded-lg border ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
              <div className="text-sm font-medium mb-1">Benchmark Source</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Static reference data for {INDUSTRY_BENCHMARKS[selectedIndustry]?.name} companies.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
