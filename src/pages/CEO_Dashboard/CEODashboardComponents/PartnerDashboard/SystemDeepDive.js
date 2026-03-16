import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { FaSpinner, FaExclamationTriangle, FaChevronDown, FaChevronUp } from "react-icons/fa";

const CULTURE_LABELS = {
  collaboration_index: "How well teams work together",
  innovation_velocity: "How quickly you adapt and improve",
  communication_effectiveness: "How clearly ideas travel across the organisation",
  decision_quality: "How well information turns into good decisions",
  overall_culture_health: "Overall culture health",
};

export default function SystemDeepDive() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, loading, error, refresh } = ctx;
  const [expandedSystem, setExpandedSystem] = useState(null);

  const systems = summary?.systems || [];
  const deps = summary?.cross_system_dependencies || [];
  const culturalFactors = summary?.organizational_insights || {};
  const transformationScore = summary?.transformation_readiness ?? 0;
  const hasAnyScore = systems.some(s => s.score != null && s.score > 0);

  const toggleSystem = (key) => setExpandedSystem(prev => prev === key ? null : key);

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Getting your system details ready…
    </div>
  );

  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try again</button>
    </div>
  );

  if (!hasAnyScore) return (
    <section className={`rounded-xl p-10 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
      <FaExclamationTriangle className="mx-auto text-3xl mb-3 text-yellow-500" />
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Nothing to show just yet</h3>
      <p className="text-sm max-w-md mx-auto">
        Once you've completed at least one assessment, this page will break down each system in detail — showing what's working, what needs attention, and how your systems connect to each other.
      </p>
    </section>
  );

  return (
    <section className="space-y-6">
      {/* All 6 systems — each one expandable */}
      <div className="space-y-3">
        {CANONICAL_SYSTEMS.map(sys => {
          const data = systems.find(s => s.key === sys.key);
          const dep = deps.find(d => d.system === sys.key);
          const score = data?.score;
          const isExpanded = expandedSystem === sys.key;
          const assessed = score != null && score > 0;

          return (
            <div key={sys.key} className={`rounded-xl border overflow-hidden transition-all ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              {/* Header — always visible */}
              <button onClick={() => assessed && toggleSystem(sys.key)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${assessed ? "cursor-pointer" : "cursor-default"} ${isExpanded ? (darkMode ? "bg-gray-750" : "bg-gray-50") : ""} ${assessed ? (darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50") : ""}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sys.color }} />
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{sys.title}</div>
                    <div className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {assessed ? sys.description : "Not assessed yet"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {assessed ? (
                    <>
                      <span className={`text-xl font-bold ${score >= 70 ? "text-green-500" : score >= 45 ? "text-yellow-500" : "text-red-500"}`}>
                        {score}%
                      </span>
                      {data?.delta_mom !== 0 && data?.delta_mom != null && (
                        <span className={`text-xs ${data.delta_mom > 0 ? "text-green-500" : "text-red-500"}`}>
                          {data.delta_mom > 0 ? "▲" : "▼"}{Math.abs(data.delta_mom)}
                        </span>
                      )}
                      {isExpanded ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                    </>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>Pending</span>
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && assessed && (
                <div className={`px-4 pb-4 pt-2 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Health indicators */}
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>What's looking good (or not)</h4>
                      {data?.health_indicators?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {data.health_indicators.map((ind, i) => (
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
                        <div className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No specific indicators to show</div>
                      )}
                    </div>

                    {/* Risk factors */}
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Things to watch out for</h4>
                      {data?.risk_factors?.length > 0 ? (
                        <div className="space-y-2">
                          {data.risk_factors.map((r, i) => (
                            <div key={i} className={`p-2 rounded-lg text-sm ${darkMode ? "bg-red-900/15" : "bg-red-50"}`}>
                              <div className="flex items-center justify-between">
                                <span className="capitalize text-xs font-medium">{r.factor?.replace(/_/g, " ")}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${r.severity === "critical" ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700") : (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700")}`}>
                                  {r.severity}
                                </span>
                              </div>
                              {r.impact && <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{r.impact}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No concerns flagged — this one looks stable</div>
                      )}
                    </div>
                  </div>

                  {/* How this system connects to others */}
                  {dep && dep.depends_on?.length > 0 && (
                    <div className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                      <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Connected to</h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {dep.depends_on.map((d, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded capitalize ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                            {d}
                          </span>
                        ))}
                        {dep.bottleneck_risk === "critical" && (
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"}`}>
                            Bottleneck risk
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Culture + Readiness — two cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Culture indicators */}
        {Object.keys(culturalFactors).length > 0 && (
          <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h3 className="text-sm font-semibold mb-3">How Your Organisation's Culture Looks</h3>
            <div className="space-y-3">
              {Object.entries(culturalFactors).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{CULTURE_LABELS[key] || key.replace(/_/g, " ")}</span>
                    <span className="text-sm font-medium">{value}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className={`h-2 rounded-full transition-all ${value >= 70 ? "bg-green-500" : value >= 45 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transformation readiness */}
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-sm font-semibold mb-3">How Ready You Are for Change</h3>
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
            {transformationScore >= 70 ? "Your organisation is in a strong position to take on big changes" : transformationScore >= 45 ? "A few areas could use some shoring up before you tackle anything major" : "It would help to strengthen the basics first before pushing for large-scale change"}
          </div>

          {/* Cross-system dependencies summary */}
          {deps.filter(d => d.depends_on?.length > 0).length > 0 && (
            <div className="mt-4">
              <h4 className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Which systems depend on each other</h4>
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
