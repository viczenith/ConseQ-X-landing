import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { FaSpinner, FaExclamationTriangle, FaPlus, FaTimes, FaCheck, FaTrash } from "react-icons/fa";

const ACTIONS_KEY = "conseqx_custom_actions_v1";

function loadActions(orgId) {
  try {
    const raw = localStorage.getItem(`${ACTIONS_KEY}_${orgId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveActions(orgId, actions) {
  try { localStorage.setItem(`${ACTIONS_KEY}_${orgId}`, JSON.stringify(actions)); } catch {}
}

export default function RecommendationsActions() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, loading, error, refresh, orgId = "anon" } = ctx;

  const [activeTab, setActiveTab] = useState("recommendations");
  const [customActions, setCustomActions] = useState(() => loadActions(orgId));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({ title: "", system: "", priority: "medium", dueDate: "" });

  useEffect(() => { saveActions(orgId, customActions); }, [customActions, orgId]);

  const recommendations = summary?.top_recommendations || [];
  const systems = summary?.systems || [];
  const forecast = summary?.health_forecast;
  const culturalFactors = summary?.organizational_insights || {};

  const addAction = useCallback(() => {
    if (!newAction.title.trim()) return;
    setCustomActions(prev => [...prev, {
      id: `ca_${Date.now()}`, ...newAction, status: "pending", progress: 0, createdAt: new Date().toISOString(),
    }]);
    setNewAction({ title: "", system: "", priority: "medium", dueDate: "" });
    setShowAddForm(false);
  }, [newAction]);

  const updateStatus = (id, status) => {
    setCustomActions(prev => prev.map(a => a.id === id ? { ...a, status, progress: status === "completed" ? 100 : a.progress } : a));
  };

  const deleteAction = (id) => {
    setCustomActions(prev => prev.filter(a => a.id !== id));
  };

  const priorityColor = (p) => {
    if (p === "critical") return darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700";
    if (p === "high") return darkMode ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-700";
    if (p === "medium" || p === "normal") return darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700";
    return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600";
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading recommendations…
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
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "recommendations", label: "X Ultra Recommendations" },
          { key: "actions", label: `Action Items (${customActions.length})` },
          { key: "system", label: "System Focus" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.key
              ? "bg-blue-600 text-white"
              : (darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200")
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* X Ultra Recommendations (from backend) */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
              No recommendations available — run assessments to generate insights
            </div>
          ) : (
            recommendations.map((rec, i) => (
              <div key={rec.insight_id || i} className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor(rec.priority)}`}>{rec.priority}</span>
                    </div>
                    <h4 className="font-medium text-sm">{rec.action}</h4>
                    <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {rec.reasoning}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Owner</div>
                    <div className="text-sm font-medium">{rec.owner}</div>
                    <div className="text-xs text-green-500 mt-1">{rec.expected_impact}</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Risk areas as actionable items */}
          {forecast?.risk_areas?.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Risk-Based Actions</h4>
              <div className="space-y-2">
                {forecast.risk_areas.map((r, i) => (
                  <div key={i} className={`rounded-lg p-4 border ${darkMode ? "bg-red-900/10 border-red-900/30" : "bg-red-50 border-red-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium capitalize">{r.system}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${r.risk_level === "critical" ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700") : (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700")}`}>
                          {r.risk_level}
                        </span>
                      </div>
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Mitigate in {r.mitigation_timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Action Items */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span>Pending: {customActions.filter(a => a.status === "pending").length}</span>
              <span>In Progress: {customActions.filter(a => a.status === "in_progress").length}</span>
              <span className="text-green-500">Completed: {customActions.filter(a => a.status === "completed").length}</span>
            </div>
            <button onClick={() => setShowAddForm(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
              <FaPlus className="text-xs" /> Add Action
            </button>
          </div>

          {/* Add action form */}
          {showAddForm && (
            <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">New Action Item</h4>
                <button onClick={() => setShowAddForm(false)} className={darkMode ? "text-gray-400" : "text-gray-500"}><FaTimes /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Action title" value={newAction.title}
                  onChange={(e) => setNewAction(p => ({ ...p, title: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`} />
                <select value={newAction.system} onChange={(e) => setNewAction(p => ({ ...p, system: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}>
                  <option value="">Select system (optional)</option>
                  {CANONICAL_SYSTEMS.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
                </select>
                <select value={newAction.priority} onChange={(e) => setNewAction(p => ({ ...p, priority: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <input type="date" value={newAction.dueDate}
                  onChange={(e) => setNewAction(p => ({ ...p, dueDate: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-900 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`} />
              </div>
              <button onClick={addAction} disabled={!newAction.title.trim()}
                className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Create Action
              </button>
            </div>
          )}

          {/* Actions list */}
          {customActions.length === 0 ? (
            <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
              No action items yet — click "Add Action" to create one
            </div>
          ) : (
            <div className="space-y-2">
              {customActions.map(action => (
                <div key={action.id} className={`rounded-lg p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor(action.priority)}`}>{action.priority}</span>
                        {action.system && (
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                            {CANONICAL_SYSTEMS.find(s => s.key === action.system)?.title || action.system}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${action.status === "completed" ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700") : action.status === "in_progress" ? (darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700") : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}`}>
                          {action.status?.replace("_", " ")}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${action.status === "completed" ? "line-through opacity-60" : ""}`}>{action.title}</div>
                      {action.dueDate && <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Due: {action.dueDate}</div>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {action.status !== "in_progress" && action.status !== "completed" && (
                        <button onClick={() => updateStatus(action.id, "in_progress")}
                          className={`p-1.5 rounded text-xs ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`} title="Start">▶</button>
                      )}
                      {action.status !== "completed" && (
                        <button onClick={() => updateStatus(action.id, "completed")}
                          className="p-1.5 rounded text-xs text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20" title="Complete"><FaCheck /></button>
                      )}
                      <button onClick={() => deleteAction(action.id)}
                        className="p-1.5 rounded text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* System Focus — per-system insights from real data */}
      {activeTab === "system" && (
        <div className="space-y-4">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            System-specific insights derived from your assessment data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANONICAL_SYSTEMS.map(sys => {
              const data = systems.find(s => s.key === sys.key);
              const score = data?.score;
              const delta = data?.delta_mom;
              const indicators = data?.health_indicators || [];
              const risks = data?.risk_factors || [];

              return (
                <div key={sys.key} className={`rounded-xl p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sys.color }} />
                      <span className="text-sm font-semibold">{sys.title}</span>
                    </div>
                    <span className={`text-lg font-bold ${(score ?? 0) >= 70 ? "text-green-500" : (score ?? 0) >= 45 ? "text-yellow-500" : "text-red-500"}`}>
                      {score != null ? `${score}%` : "—"}
                    </span>
                  </div>

                  {delta !== 0 && delta != null && (
                    <div className={`text-xs mb-2 ${delta > 0 ? "text-green-500" : "text-red-500"}`}>
                      {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} pts vs prior assessment
                    </div>
                  )}

                  <div className={`text-xs mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{sys.description}</div>

                  {indicators.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {indicators.slice(0, 3).map((ind, i) => (
                        <span key={i} className={`text-xs px-1.5 py-0.5 rounded capitalize ${ind.includes("excellent") || ind.includes("strong") || ind.includes("agile") || ind.includes("data_driven") || ind.includes("above") || ind.includes("clear") || ind.includes("unified")
                          ? (darkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700")
                          : (darkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-700")
                        }`}>
                          {ind.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}

                  {risks.length > 0 && (
                    <div className={`text-xs p-2 rounded mt-1 ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
                      ⚠ {risks[0].impact}
                    </div>
                  )}

                  {score == null && (
                    <div className={`text-xs p-2 rounded mt-1 ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                      No assessment data — run an assessment to see insights
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cultural factors summary */}
          {Object.keys(culturalFactors).length > 0 && (
            <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <h4 className="text-sm font-semibold mb-3">Organizational Culture Insights</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(culturalFactors).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className={`text-2xl font-bold ${value >= 70 ? "text-green-500" : value >= 45 ? "text-yellow-500" : "text-red-500"}`}>{value}%</div>
                    <div className={`text-xs capitalize mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{key.replace(/_/g, " ")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
