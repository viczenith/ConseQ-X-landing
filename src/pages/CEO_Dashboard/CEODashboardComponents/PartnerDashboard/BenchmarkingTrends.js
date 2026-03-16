import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { FaSpinner, FaExclamationTriangle, FaGlobeAfrica, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { INDUSTRY_BENCHMARKS, REGIONAL_ADJUSTMENTS, getAdjustedBenchmarks, getPercentilePosition } from "../../../../data/industryBenchmarks";

const SYS_KEYS = CANONICAL_SYSTEMS.map((s) => s.key);
const SYS_LABELS = Object.fromEntries(CANONICAL_SYSTEMS.map((s) => [s.key, s.title]));

export default function BenchmarkingTrends() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, overview, loading, error, refresh } = ctx;

  const [selectedIndustry, setSelectedIndustry] = useState("technology");
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [selectedMetric, setSelectedMetric] = useState("overall");
  const [trendExpanded, setTrendExpanded] = useState(false);

  /* Real scores from assessment data */
  const currentScores = useMemo(() => {
    const systems = summary?.systems || [];
    const map = {};
    systems.forEach((s) => { if (s.score != null) map[s.key] = s.score; });
    return map;
  }, [summary]);

  const adjustedBenchmarks = useMemo(() => getAdjustedBenchmarks(selectedIndustry, selectedRegion), [selectedIndustry, selectedRegion]);
  const benchmarkData = INDUSTRY_BENCHMARKS[selectedIndustry];

  /* Radar: your org vs industry average vs top 25% */
  const radarData = useMemo(() => {
    if (!adjustedBenchmarks) return [];
    return SYS_KEYS.map((key) => ({
      system: SYS_LABELS[key],
      current: currentScores[key] ?? 0,
      benchmark: adjustedBenchmarks.systems[key]?.avg ?? 0,
      topQuartile: adjustedBenchmarks.systems[key]?.p75 ?? 0,
      percentile: getPercentilePosition(currentScores[key] ?? 0, adjustedBenchmarks.systems[key]),
      assessed: currentScores[key] != null,
    }));
  }, [currentScores, adjustedBenchmarks]);

  /* Time-series from overview endpoint */
  const trendData = useMemo(() => {
    const ts = overview?.time_series;
    if (!Array.isArray(ts) || ts.length === 0) return [];
    if (!adjustedBenchmarks) return [];
    return ts.map((pt) => {
      const val = selectedMetric === "overall"
        ? pt.org_health ?? pt.overall
        : pt[selectedMetric];
      const bmSystem = adjustedBenchmarks.systems[selectedMetric];
      const bmVal = selectedMetric === "overall"
        ? Object.values(adjustedBenchmarks.systems).reduce((a, b) => a + b.avg, 0) / 6
        : bmSystem?.avg ?? null;
      return {
        month: pt.label || pt.month || pt.date,
        value: val != null ? Math.round(val) : null,
        benchmark: bmVal != null ? Math.round(bmVal) : null,
      };
    });
  }, [overview, selectedMetric, adjustedBenchmarks]);

  /* Generate plain-language takeaways from scores vs benchmarks */
  const takeaways = useMemo(() => {
    if (!adjustedBenchmarks || Object.keys(currentScores).length === 0) return [];
    const out = [];
    const scored = Object.values(currentScores);
    const orgAvg = scored.reduce((a, b) => a + b, 0) / scored.length;
    const bmAvg = SYS_KEYS.reduce((s, k) => s + (adjustedBenchmarks.systems[k]?.avg || 0), 0) / 6;
    const regionNote = selectedRegion !== "global" ? ` in ${REGIONAL_ADJUSTMENTS[selectedRegion]?.label}` : "";

    if (orgAvg > bmAvg + 5)
      out.push({ type: "positive", text: `You're performing ${Math.round(orgAvg - bmAvg)} points above the typical ${adjustedBenchmarks.name} organisation${regionNote}. That's a genuine competitive edge — keep building on it.` });
    else if (orgAvg < bmAvg - 5)
      out.push({ type: "warning", text: `You're running ${Math.round(bmAvg - orgAvg)} points below the ${adjustedBenchmarks.name} average${regionNote}. There's meaningful room to close this gap — the recommendations page shows where to start.` });
    else
      out.push({ type: "info", text: `You're tracking close to the ${adjustedBenchmarks.name} average${regionNote}. Strong in some areas, stretching in others — the breakdown below shows exactly where.` });

    const comparisons = SYS_KEYS.filter((k) => currentScores[k] != null).map((k) => ({
      key: k, diff: currentScores[k] - (adjustedBenchmarks.systems[k]?.avg || 0),
      percentile: getPercentilePosition(currentScores[k], adjustedBenchmarks.systems[k]),
    }));
    if (comparisons.length) {
      const best = comparisons.reduce((a, b) => (a.diff > b.diff ? a : b));
      const worst = comparisons.reduce((a, b) => (a.diff < b.diff ? a : b));
      if (best.diff > 0) out.push({ type: "positive", text: `${SYS_LABELS[best.key]} is where you're beating most peers — ${best.percentile} of the industry, +${Math.round(best.diff)} above average.` });
      if (worst.diff < -3) out.push({ type: "warning", text: `${SYS_LABELS[worst.key]} is your biggest gap versus industry (${Math.round(worst.diff)} points). Organisations that close this kind of gap tend to see the fastest overall improvement.` });
    }

    return out;
  }, [adjustedBenchmarks, currentScores, selectedRegion]);

  const tooltip = { contentStyle: { backgroundColor: darkMode ? "#1f2937" : "#fff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px", color: darkMode ? "#f3f4f6" : "#111827" } };
  const noData = Object.keys(currentScores).length === 0;
  const assessedCount = radarData.filter(r => r.assessed).length;

  /* ── Loading / Error ── */
  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading your benchmarks…
    </div>
  );
  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try again</button>
    </div>
  );

  /* ── Empty state ── */
  if (noData) return (
    <section className={`rounded-xl p-10 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
      <FaExclamationTriangle className="mx-auto text-3xl mb-3 text-yellow-500" />
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
        Nothing to compare yet
      </h3>
      <p className="text-sm max-w-md mx-auto">
        Once you've completed at least one assessment, this page will show how your organisation stacks up
        against others in your industry. You'll see where you're ahead, where you're behind, and what the
        top performers are doing differently.
      </p>
    </section>
  );

  return (
    <section className="space-y-6">

      {/* ── Selectors ── */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className={`text-base font-semibold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Compare yourself to the industry
        </h3>
        <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Pick your industry and region to see how your scores compare to similar organisations. The benchmarks adjust automatically.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className={`block text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Industry</label>
            <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-200" : "bg-white border-gray-300"}`}>
              {Object.entries(INDUSTRY_BENCHMARKS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Region</label>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-200" : "bg-white border-gray-300"}`}>
              {Object.entries(REGIONAL_ADJUSTMENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Takeaways (plain-language insights) ── */}
      {takeaways.length > 0 && (
        <div className="space-y-2">
          {takeaways.map((t, i) => (
            <div key={i} className={`rounded-lg p-4 border text-sm ${
              t.type === "positive" ? (darkMode ? "bg-green-900/20 border-green-800 text-green-200" : "bg-green-50 border-green-200 text-green-800")
              : t.type === "warning" ? (darkMode ? "bg-yellow-900/20 border-yellow-800 text-yellow-200" : "bg-yellow-50 border-yellow-200 text-yellow-800")
              : (darkMode ? "bg-blue-900/20 border-blue-800 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-800")
            }`}>{t.text}</div>
          ))}
        </div>
      )}

      {/* ── Radar comparison ── */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className={`text-base font-semibold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          How you compare across all six systems
        </h3>
        <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          The blue shape is you. The green line is the average {adjustedBenchmarks?.name} organisation{selectedRegion !== "global" ? ` in ${REGIONAL_ADJUSTMENTS[selectedRegion]?.label}` : ""}.
          The amber line is the top 25%.
          {assessedCount < 6 && ` (${6 - assessedCount} system${6 - assessedCount > 1 ? "s" : ""} not yet assessed — showing as 0.)`}
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke={darkMode ? "#374151" : "#e5e7eb"} strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="system" tick={{ fontSize: 11, fill: darkMode ? "#d1d5db" : "#6b7280" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickCount={6} />
            <Radar name="Your organisation" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Industry average" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
            <Radar name="Top 25%" dataKey="topQuartile" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={1} strokeDasharray="2 2" />
            <Tooltip {...tooltip} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        {/* Per-system breakdown */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {radarData.map((item) => (
            <div key={item.system} className={`p-3 rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
              <div className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item.system}</div>
              {!item.assessed ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`}>Not assessed</span>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${item.current >= item.benchmark ? "text-green-500" : "text-red-500"}`}>{item.current}%</span>
                    <span className={`text-xs font-medium ${item.current >= item.benchmark ? "text-green-600" : "text-red-600"}`}>
                      {item.current >= item.benchmark ? "+" : ""}{item.current - item.benchmark} vs avg
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.percentile}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Data source note */}
        {benchmarkData?.description && (
          <div className={`mt-4 p-3 rounded-lg text-xs ${darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
            <FaGlobeAfrica className="inline mr-1.5 text-sm" />
            Based on {benchmarkData.sampleSize} {adjustedBenchmarks?.name?.toLowerCase()} organisations surveyed in {benchmarkData.year}.
            {selectedRegion !== "global" && ` Scores adjusted for ${REGIONAL_ADJUSTMENTS[selectedRegion]?.label} market conditions.`}
          </div>
        )}
      </div>

      {/* ── Historical trends (collapsible — only if data exists) ── */}
      {trendData.length > 0 && (
        <div className={`rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <button onClick={() => setTrendExpanded(p => !p)}
            className="w-full flex items-center justify-between p-5 text-left">
            <div>
              <h3 className={`text-base font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                Your progress over time
              </h3>
              <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                How your scores have moved versus the industry average across assessments
              </p>
            </div>
            {trendExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
          </button>

          {trendExpanded && (
            <div className="px-5 pb-5">
              <div className="flex justify-end mb-3">
                <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-200" : "bg-white border-gray-300"}`}>
                  <option value="overall">Overall health</option>
                  {CANONICAL_SYSTEMS.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="month" stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                  <YAxis domain={[0, 100]} stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                  <Tooltip {...tooltip} />
                  <Line type="monotone" dataKey="value" name="Your score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
                  <Line type="monotone" dataKey="benchmark" name="Industry average" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── How to read this ── */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>How to read this page</h4>
        <ul className={`text-xs space-y-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <li>The <strong>radar chart</strong> shows your six system scores against the industry. Where your blue shape extends past the green line, you're ahead. Where it falls inside, there's room to grow.</li>
          <li>Each system card shows your <strong>percentile ranking</strong> — if it says "Top 25%", you're outperforming three out of four similar organisations.</li>
          <li>Benchmarks come from organisational health research across {benchmarkData?.sampleSize || "hundreds of"} companies. They're a reference point, not a rigid target.</li>
          <li>Use the <strong>industry and region selectors</strong> to compare against the peer group that's most relevant to you.</li>
        </ul>
      </div>
    </section>
  );
}
