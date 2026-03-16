import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { FaSpinner, FaExclamationTriangle, FaPlus, FaTimes, FaCheck, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";

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

  const [customActions, setCustomActions] = useState(() => loadActions(orgId));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({ title: "", system: "", priority: "medium", dueDate: "" });
  const [actionsExpanded, setActionsExpanded] = useState(true);

  useEffect(() => { saveActions(orgId, customActions); }, [customActions, orgId]);

  const recommendations = summary?.top_recommendations || [];
  const systems = summary?.systems || [];
  const hasAnyScore = systems.some(s => s.score != null && s.score > 0);
  const forecast = summary?.health_forecast;

  const addAction = useCallback(() => {
    if (!newAction.title.trim()) return;
    setCustomActions(prev => [...prev, {
      id: `ca_${Date.now()}`, ...newAction, status: "pending", createdAt: new Date().toISOString(),
    }]);
    setNewAction({ title: "", system: "", priority: "medium", dueDate: "" });
    setShowAddForm(false);
  }, [newAction]);

  const updateStatus = (id, status) => {
    setCustomActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAction = (id) => {
    setCustomActions(prev => prev.filter(a => a.id !== id));
  };

  const priorityLabel = (p) => {
    if (p === "critical") return "Urgent";
    if (p === "high") return "High";
    if (p === "medium" || p === "normal") return "Medium";
    return "Low";
  };

  const priorityColor = (p) => {
    if (p === "critical") return darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700";
    if (p === "high") return darkMode ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-700";
    if (p === "medium" || p === "normal") return darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700";
    return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600";
  };

  const statusLabel = (s) => {
    if (s === "completed") return "Done";
    if (s === "in_progress") return "Working on it";
    return "Not started";
  };

  const pendingCount = customActions.filter(a => a.status === "pending").length;
  const inProgressCount = customActions.filter(a => a.status === "in_progress").length;
  const completedCount = customActions.filter(a => a.status === "completed").length;

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading your recommendations…
    </div>
  );

  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try again</button>
    </div>
  );

  if (!hasAnyScore && customActions.length === 0) return (
    <section className={`rounded-xl p-10 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
      <FaExclamationTriangle className="mx-auto text-3xl mb-3 text-yellow-500" />
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>No recommendations yet</h3>
      <p className="text-sm max-w-md mx-auto">
        Once you've completed at least one assessment, this page will show you what to focus on first, who should own each action, and what kind of impact to expect. You can also add your own action items to track alongside the recommendations.
      </p>
    </section>
  );

  return (
    <section className="space-y-6">

      {/* ── Section 1: What the data is telling you to do ── */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          What the data says you should focus on
        </h3>
        <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          These recommendations come straight from your assessment results. They're ordered by how much impact they'd have on your organisation.
        </p>

        {recommendations.length === 0 ? (
          <div className={`rounded-lg p-6 text-center text-sm ${darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
            No specific recommendations right now. Run more assessments to generate tailored advice for your organisation.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={rec.insight_id || i} className={`rounded-lg p-4 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor(rec.priority)}`}>
                        {priorityLabel(rec.priority)}
                      </span>
                      {rec.owner && (
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Suggested owner: {rec.owner}
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{rec.action}</h4>
                    {rec.reasoning && (
                      <p className={`text-xs mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {rec.reasoning}
                      </p>
                    )}
                  </div>
                  {rec.expected_impact && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-green-500 font-medium">{rec.expected_impact}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risk areas — show as warnings below recommendations */}
        {forecast?.risk_areas?.length > 0 && (
          <div className="mt-5">
            <h4 className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Areas that need watching</h4>
            <div className="space-y-2">
              {forecast.risk_areas.map((r, i) => (
                <div key={i} className={`rounded-lg p-3 border flex items-center justify-between ${darkMode ? "bg-red-900/10 border-red-900/30" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium capitalize ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{r.system}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.risk_level === "critical"
                        ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700")
                        : (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700")
                    }`}>
                      {r.risk_level === "critical" ? "Needs attention now" : "Keep an eye on this"}
                    </span>
                  </div>
                  {r.mitigation_timeline && (
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Address within {r.mitigation_timeline}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Your own action items ── */}
      <div className={`rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {/* Collapsible header */}
        <button onClick={() => setActionsExpanded(p => !p)}
          className={`w-full flex items-center justify-between p-5 text-left`}>
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Your action items</h3>
            <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {customActions.length === 0
                ? "Track the things you've decided to do — add tasks, mark them done, keep yourself accountable."
                : `${pendingCount} waiting · ${inProgressCount} in progress · ${completedCount} done`
              }
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setShowAddForm(true); setActionsExpanded(true); }}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
              <FaPlus className="text-xs" /> Add
            </button>
            {actionsExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
          </div>
        </button>

        {actionsExpanded && (
          <div className="px-5 pb-5">
            {/* Add action form */}
            {showAddForm && (
              <div className={`rounded-lg p-4 border mb-4 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>What do you want to do?</h4>
                  <button onClick={() => setShowAddForm(false)} className={darkMode ? "text-gray-400" : "text-gray-500"}><FaTimes /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Describe the task" value={newAction.title}
                    onChange={(e) => setNewAction(p => ({ ...p, title: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`} />
                  <select value={newAction.system} onChange={(e) => setNewAction(p => ({ ...p, system: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}>
                    <option value="">Which system is this for? (optional)</option>
                    {CANONICAL_SYSTEMS.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
                  </select>
                  <select value={newAction.priority} onChange={(e) => setNewAction(p => ({ ...p, priority: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}>
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                    <option value="critical">Urgent</option>
                  </select>
                  <input type="date" value={newAction.dueDate}
                    onChange={(e) => setNewAction(p => ({ ...p, dueDate: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`} />
                </div>
                <button onClick={addAction} disabled={!newAction.title.trim()}
                  className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Add this
                </button>
              </div>
            )}

            {/* Actions list */}
            {customActions.length === 0 ? (
              <div className={`rounded-lg p-6 text-center text-sm ${darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                Nothing here yet. Use the "Add" button to create your first action item.
              </div>
            ) : (
              <div className="space-y-2">
                {customActions.map(action => (
                  <div key={action.id} className={`rounded-lg p-3 border ${
                    action.status === "completed"
                      ? (darkMode ? "bg-green-900/10 border-green-900/30" : "bg-green-50 border-green-100")
                      : (darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200")
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor(action.priority)}`}>
                            {priorityLabel(action.priority)}
                          </span>
                          {action.system && (
                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                              {CANONICAL_SYSTEMS.find(s => s.key === action.system)?.title || action.system}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            action.status === "completed" ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700")
                              : action.status === "in_progress" ? (darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700")
                              : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600")
                          }`}>
                            {statusLabel(action.status)}
                          </span>
                        </div>
                        <div className={`text-sm ${action.status === "completed" ? "line-through opacity-50" : (darkMode ? "text-gray-200" : "text-gray-800")}`}>
                          {action.title}
                        </div>
                        {action.dueDate && (
                          <div className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Due {new Date(action.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {action.status === "pending" && (
                          <button onClick={() => updateStatus(action.id, "in_progress")}
                            className={`p-1.5 rounded text-xs ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                            title="Start working on this">▶</button>
                        )}
                        {action.status !== "completed" && (
                          <button onClick={() => updateStatus(action.id, "completed")}
                            className="p-1.5 rounded text-xs text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Mark as done"><FaCheck /></button>
                        )}
                        <button onClick={() => deleteAction(action.id)}
                          className="p-1.5 rounded text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
