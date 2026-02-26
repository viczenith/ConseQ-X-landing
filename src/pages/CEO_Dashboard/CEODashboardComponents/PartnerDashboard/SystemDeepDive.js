import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

export default function SystemDeepDive() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, loading, error, refresh } = ctx;
  const [selectedSystem, setSelectedSystem] = useState(null);

  const systems = summary?.systems || [];
  const deps = summary?.cross_system_dependencies || [];
  const culturalFactors = summary?.organizational_insights || {};
  const transformationScore = summary?.transformation_readiness ?? 0;

  // Build radar data from real scores
  const radarData = useMemo(() =>
    CANONICAL_SYSTEMS.map(sys => {
      const data = systems.find(s => s.key === sys.key);
      return { system: sys.title, score: data?.score ?? 0, fullMark: 100 };
    }),
    [systems]
  );

  // Build bar data from real scores
  const barData = useMemo(() =>
    CANONICAL_SYSTEMS.map(sys => {
      const data = systems.find(s => s.key === sys.key);
      return { name: sys.title, score: data?.score ?? 0, delta: data?.delta_mom ?? 0, fill: sys.color };
    }),
    [systems]
  );

  // Selected system detail
  const selected = useMemo(() => {
    if (!selectedSystem) return null;
    const sys = CANONICAL_SYSTEMS.find(s => s.key === selectedSystem);
    const data = systems.find(s => s.key === selectedSystem);
    const dep = deps.find(d => d.system === selectedSystem);
    return { sys, data, dep };
  }, [selectedSystem, systems, deps]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading deep dive…
    </div>
  );

  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Radar + Bar comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-sm font-semibold mb-3">System Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke={darkMode ? "#374151" : "#e5e7eb"} />
              <PolarAngleAxis dataKey="system" tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-sm font-semibold mb-3">System Scores</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: darkMode ? "#d1d5db" : "#374151" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, background: darkMode ? "#1f2937" : "#fff", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}
                formatter={(v, name) => [`${v}%`, name]}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System selector */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Select a System to Analyze</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CANONICAL_SYSTEMS.map(sys => {
            const data = systems.find(s => s.key === sys.key);
            const active = selectedSystem === sys.key;
            return (
              <button key={sys.key} onClick={() => setSelectedSystem(active ? null : sys.key)}
                className={`rounded-lg p-3 text-left border transition-colors ${active ? "ring-2 ring-blue-500" : ""} ${darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                <div className="text-xs font-medium truncate">{sys.title}</div>
                <div className={`text-lg font-bold mt-1 ${(data?.score ?? 0) >= 70 ? "text-green-500" : (data?.score ?? 0) >= 45 ? "text-yellow-500" : "text-red-500"}`}>
                  {data?.score ?? "—"}%
                </div>
                {data?.delta_mom !== 0 && data?.delta_mom != null && (
                  <div className={`text-xs ${data.delta_mom > 0 ? "text-green-500" : "text-red-500"}`}>
                    {data.delta_mom > 0 ? "▲" : "▼"} {Math.abs(data.delta_mom)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected system detail */}
      {selected && (
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{selected.sys.title} — Deep Dive</h3>
            <span className={`text-2xl font-bold ${(selected.data?.score ?? 0) >= 70 ? "text-green-500" : (selected.data?.score ?? 0) >= 45 ? "text-yellow-500" : "text-red-500"}`}>
              {selected.data?.score ?? "—"}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health indicators */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Health Indicators</h4>
              {selected.data?.health_indicators?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.data.health_indicators.map((ind, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded-full capitalize ${ind.includes("excellent") || ind.includes("strong") || ind.includes("agile") || ind.includes("data_driven") || ind.includes("clear") || ind.includes("unified") || ind.includes("above")
                      ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700")
                      : ind.includes("critical") || ind.includes("needs_attention")
                        ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700")
                        : (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700")
                    }`}>
                      {ind.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : (
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No indicators available — run an assessment first</div>
              )}
            </div>

            {/* Risk factors */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Risk Factors</h4>
              {selected.data?.risk_factors?.length > 0 ? (
                <div className="space-y-2">
                  {selected.data.risk_factors.map((r, i) => (
                    <div key={i} className={`p-2 rounded-lg text-sm ${darkMode ? "bg-red-900/20" : "bg-red-50"}`}>
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{r.factor?.replace(/_/g, " ")}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.severity === "critical" ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700") : (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700")}`}>
                          {r.severity}
                        </span>
                      </div>
                      <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{r.impact}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No risk factors detected</div>
              )}
            </div>
          </div>

          {/* Dependencies for this system */}
          {selected.dep && (
            <div className="mt-4">
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Cross-System Dependencies</h4>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                {selected.dep.depends_on?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Closely linked to:</span>
                    {selected.dep.depends_on.map((d, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded capitalize ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No strong dependencies detected</div>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span>Impact: <span className="font-medium capitalize">{selected.dep.impact_strength}</span></span>
                  <span>Bottleneck Risk: <span className={`font-medium capitalize ${selected.dep.bottleneck_risk === "critical" ? "text-red-500" : "text-green-500"}`}>{selected.dep.bottleneck_risk}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cultural Factors & Transformation Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-sm font-semibold mb-3">Organizational Insights</h3>
          <div className="space-y-3">
            {Object.entries(culturalFactors).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm capitalize ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{key.replace(/_/g, " ")}</span>
                  <span className="text-sm font-medium">{value}%</span>
                </div>
                <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div className={`h-2 rounded-full transition-all ${value >= 70 ? "bg-green-500" : value >= 45 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-sm font-semibold mb-3">Transformation Readiness</h3>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={transformationScore >= 70 ? "#22c55e" : transformationScore >= 45 ? "#eab308" : "#ef4444"} strokeWidth="3"
                  strokeDasharray={`${transformationScore} ${100 - transformationScore}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{transformationScore}%</span>
              </div>
            </div>
          </div>
          <div className={`text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {transformationScore >= 70 ? "Ready for major transformation initiatives" : transformationScore >= 45 ? "Some areas need strengthening before major changes" : "Foundational improvements needed before transformation"}
          </div>

          {/* Cross-system dependencies summary */}
          {deps.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dependency Overview</h4>
              <div className="space-y-1">
                {deps.filter(d => d.depends_on?.length > 0).slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{d.system}</span>
                    <span className={darkMode ? "text-gray-400" : "text-gray-500"}>→ {d.depends_on.slice(0, 2).join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
