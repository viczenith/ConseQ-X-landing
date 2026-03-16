import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  FaChevronDown, FaChevronUp, FaCalendarAlt, FaArrowUp, FaArrowDown,
  FaCubes, FaExclamationTriangle, FaCheckCircle, FaArrowRight,
  FaClipboardCheck, FaUpload, FaCommentDots, FaLightbulb,
  FaFireAlt, FaShieldAlt,
} from "react-icons/fa";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";
import { evaluateParameters, getParameterSummary } from "../../../data/parameters28";

/* ═══ Helpers ═══ */
function readAssessments(orgId) {
  try {
    const all = JSON.parse(localStorage.getItem("conseqx_assessments_v1") || "{}");
    const arr = all[orgId] || [];

    // One-time cleanup: deduplicate entries with the same system + minute
    const seen = new Map();
    const clean = arr.filter(a => {
      const key = `${normalizeSystemKey(a.systemId)}-${Math.floor((a.timestamp || 0) / 60000)}`;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
    if (clean.length < arr.length) {
      try { all[orgId] = clean; localStorage.setItem("conseqx_assessments_v1", JSON.stringify(all)); } catch {}
    }
    return clean;
  } catch { return []; }
}

function getSystemMeta(key) {
  const norm = normalizeSystemKey(key);
  return CANONICAL_SYSTEMS.find(s => s.key === norm) || { key: norm, title: norm, icon: '📊', color: '#6B7280' };
}

function scoreColor(score) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function scoreBg(score, dark) {
  if (score >= 80) return dark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200";
  if (score >= 60) return dark ? "bg-yellow-900/30 border-yellow-700" : "bg-yellow-50 border-yellow-200";
  if (score >= 40) return dark ? "bg-orange-900/30 border-orange-700" : "bg-orange-50 border-orange-200";
  return dark ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200";
}

function gradeLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Adequate";
  if (score >= 50) return "Needs Work";
  if (score >= 40) return "Weak";
  return "Critical";
}

/* Source icons for parameter evaluation sources */
const SOURCE_META = {
  assessment: { icon: FaClipboardCheck, label: "Assessment", tip: "Improve by completing system assessments" },
  upload:     { icon: FaUpload,         label: "Data Upload", tip: "Upload organisational data for this area" },
  chat:       { icon: FaCommentDots,    label: "Chat Intel",  tip: "Discuss with ConseQ-X AI for deeper insights" },
  manual:     { icon: FaLightbulb,      label: "Manual",      tip: "Enter data manually" },
};

/* Priority score: high weight + low score = urgent */
function priorityScore(param) {
  if (param.score === null) return -1;
  return (100 - param.score) * (param.weight || 3);
}

/* Contextual recommendation per parameter */
function getRecommendation(param) {
  if (param.score === null) return null;
  if (param.score >= 80) return { type: "strong", icon: FaShieldAlt, text: `${param.title} is a strength. Maintain current practices and use this as a competitive advantage.` };
  if (param.score >= 60) return { type: "improve", icon: FaLightbulb, text: `${param.title} shows potential but has room for growth. Focus on ${param.subMetrics?.[0]?.toLowerCase() || "key indicators"} to move from adequate to strong.` };
  if (param.score >= 40) return { type: "attention", icon: FaExclamationTriangle, text: `${param.title} needs attention. Prioritise improvement in ${param.subMetrics?.slice(0, 2).map(s => s.toLowerCase()).join(" and ") || "core areas"} within the next quarter.` };
  return { type: "critical", icon: FaFireAlt, text: `${param.title} is critically low and poses organisational risk. Immediate action needed — review ${param.subMetrics?.slice(0, 2).map(s => s.toLowerCase()).join(" and ") || "fundamentals"} as a priority.` };
}
const REC_COLORS = {
  strong:    { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-500", icon: "text-emerald-400" },
  improve:   { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-500", icon: "text-blue-400" },
  attention: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500", icon: "text-amber-400" },
  critical:  { bg: "bg-red-500/10 border-red-500/20", text: "text-red-500", icon: "text-red-400" },
};

/* ═══ Single Assessment Card ═══ */
function AssessmentCard({ run, darkMode, previousScore }) {
  const [expanded, setExpanded] = useState(false);
  const sys = getSystemMeta(run.systemId);

  // Support both formats: meta.subScores (array from Assessments.js scoring)
  // and meta.subAssessments (object from Assessment.js generateAnalysis)
  const subScores = useMemo(() => {
    if (Array.isArray(run.meta?.subScores) && run.meta.subScores.length > 0) return run.meta.subScores;
    const subs = run.meta?.subAssessments;
    if (subs && typeof subs === "object" && !Array.isArray(subs)) {
      return Object.entries(subs).map(([id, s]) => ({
        id,
        title: s.title || id.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        score: s.score ?? 0,
        max: s.maxScore ?? s.max ?? 0,
        percent: s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : (s.percent ?? 0),
        interpretation: s.interpretation || null,
      }));
    }
    return [];
  }, [run.meta]);

  const interpretation = run.meta?.interpretation;
  const diff = previousScore != null ? run.score - previousScore : null;

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: sys.color + '18', border: `1.5px solid ${sys.color}40` }}
          >
            {sys.icon}
          </div>
          <div className="min-w-0">
            <div className={`font-semibold truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {sys.title}
            </div>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <FaCalendarAlt className="inline mr-1" />
              {run.timestamp
                ? new Date(run.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "Date unknown"}
              {run.timestamp && (
                <span className="ml-2">
                  {new Date(run.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Trend */}
          {diff != null && diff !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${diff > 0 ? "text-green-500" : "text-red-500"}`}>
              {diff > 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(diff)}%
            </div>
          )}
          <div className="text-right">
            <span className={`text-xl font-bold ${scoreColor(run.score)}`}>{run.score ?? "—"}%</span>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{gradeLabel(run.score)}</div>
          </div>
          {expanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className={`px-5 pb-5 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          {/* Interpretation */}
          {interpretation && (
            <div className={`mt-4 rounded-lg p-4 ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Overall Reading · {interpretation.rating || gradeLabel(run.score)}
              </div>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {interpretation.interpretation || `This system scored ${run.score}% — ${run.score >= 70 ? "a solid foundation to build on." : run.score >= 50 ? "room to grow, but not in crisis." : "an area that needs real attention."}`}
              </p>
            </div>
          )}

          {/* Sub-scores */}
          {subScores.length > 0 && (
            <div className="mt-4">
              <div className={`text-xs font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Breakdown by area
              </div>
              <div className="space-y-2">
                {subScores.map((sub, idx) => {
                  const pct = sub.percent ?? (sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : 0);
                  return (
                    <div key={sub.id || idx} className={`rounded-lg border p-3 ${scoreBg(pct, darkMode)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                          {sub.title || `Area ${idx + 1}`}
                        </span>
                        <span className={`text-sm font-bold ${scoreColor(pct)}`}>{pct}%</span>
                      </div>
                      {/* Score bar */}
                      <div className={`w-full h-1.5 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : pct >= 30 ? '#f97316' : '#ef4444' }}
                        />
                      </div>
                      {sub.interpretation && (
                        <p className={`text-xs mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {sub.interpretation.interpretation || sub.interpretation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Raw score note */}
          {run.rawScore != null && run.maxScore != null && (
            <div className={`mt-4 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Raw score: {run.rawScore} / {run.maxScore}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══ Main Archive Page ═══ */
export default function Archive() {
  const { darkMode, org } = useOutletContext() || {};
  const orgId = org?.id || "anon";

  const assessments = useMemo(() => readAssessments(orgId), [orgId]);

  // Sort all assessments newest-first
  const sorted = useMemo(() => {
    return [...assessments].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [assessments]);

  // Build a map: for each run, find the previous score for the same system
  const previousScoreMap = useMemo(() => {
    const map = {};
    // Group by normalised system key, sorted oldest-first
    const bySystem = {};
    sorted.forEach(a => {
      const k = normalizeSystemKey(a.systemId);
      if (!bySystem[k]) bySystem[k] = [];
      bySystem[k].push(a);
    });
    for (const runs of Object.values(bySystem)) {
      // runs are newest-first; reverse for chronological
      const chrono = [...runs].reverse();
      for (let i = 1; i < chrono.length; i++) {
        map[chrono[i].id || `${chrono[i].systemId}-${chrono[i].timestamp}`] = chrono[i - 1].score;
      }
    }
    return map;
  }, [sorted]);

  // Group by date for display
  const groupedByDate = useMemo(() => {
    const groups = {};
    sorted.forEach(a => {
      const date = a.timestamp
        ? new Date(a.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : "Date Unknown";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return Object.entries(groups);
  }, [sorted]);

  // Summary stats
  const stats = useMemo(() => {
    if (sorted.length === 0) return null;
    const systemsDone = new Set(sorted.map(a => normalizeSystemKey(a.systemId)));
    const latest = {};
    sorted.forEach(a => {
      const k = normalizeSystemKey(a.systemId);
      if (!latest[k]) latest[k] = a;
    });
    const scores = Object.values(latest).map(a => a.score).filter(s => s != null);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { total: sorted.length, systems: systemsDone.size, avgScore: avg };
  }, [sorted]);

  // 28-Parameter Analysis derived from latest system scores
  const [showParams, setShowParams] = useState(false);
  const [expandedSystem, setExpandedSystem] = useState(null);
  const [expandedParam, setExpandedParam] = useState(null);
  const navigate = useNavigate();

  const paramAnalysis = useMemo(() => {
    const latest = {};
    sorted.forEach(a => {
      const k = normalizeSystemKey(a.systemId);
      if (!latest[k]) latest[k] = a;
    });
    const systemScores = {};
    for (const [sysKey, run] of Object.entries(latest)) {
      systemScores[sysKey] = {
        systemScore: run.rawScore ?? (run.score ?? 0),
        maxSystemScore: run.maxScore ?? 100,
      };
      if (!run.rawScore && !run.maxScore && run.score != null) {
        systemScores[sysKey] = { systemScore: run.score, maxSystemScore: 100 };
      }
    }
    const evaluated = evaluateParameters(systemScores);
    const summary = getParameterSummary(evaluated);
    // Priority-ranked: urgent = low score * high weight
    const priorityRanked = [...evaluated].filter(p => p.score !== null).sort((a, b) => priorityScore(b) - priorityScore(a));
    const topUrgent = priorityRanked.slice(0, 3);
    const topStrong = [...evaluated].filter(p => p.score !== null).sort((a, b) => b.score - a.score).slice(0, 3);

    // Group parameters by the 6 systems
    const bySystem = {};
    CANONICAL_SYSTEMS.forEach(cs => { bySystem[cs.key] = []; });
    evaluated.forEach(param => {
      (param.relatedSystems || []).forEach(sysKey => {
        const norm = normalizeSystemKey(sysKey);
        if (!bySystem[norm]) bySystem[norm] = [];
        bySystem[norm].push(param);
      });
    });
    // Sort each system's params by priority
    Object.keys(bySystem).forEach(k => {
      bySystem[k].sort((a, b) => priorityScore(b) - priorityScore(a));
    });

    return { evaluated, summary, topUrgent, topStrong, bySystem };
  }, [sorted]);

  const toggleParam = useCallback((id) => setExpandedParam(prev => prev === id ? null : id), []);

  if (sorted.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 px-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        <FaCalendarAlt className="text-4xl mb-4 opacity-40" />
        <div className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Nothing here yet</div>
        <p className="text-sm max-w-md">
          When you complete assessments, they'll appear here so you can look back at how your organisation has
          progressed over time. Head to the <strong>Assessments</strong> tab to run your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Intro */}
      <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        Every assessment you've run is kept here. Expand any entry to see exactly how each area scored,
        what the system interpretation said, and whether things have moved up or down since last time.
      </p>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className={`rounded-xl p-4 text-center border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{stats.total}</div>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Runs</div>
          </div>
          <div className={`rounded-xl p-4 text-center border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{stats.systems}/6</div>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Systems Covered</div>
          </div>
          <div className={`rounded-xl p-4 text-center border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${scoreColor(stats.avgScore)}`}>{stats.avgScore}%</div>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Avg Latest Score</div>
          </div>
        </div>
      )}

      {/* 28-Parameter Interactive Analysis */}
      {stats && paramAnalysis.summary.assessed > 0 && (
        <div className={`rounded-2xl border overflow-hidden mb-8 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          {/* Header toggle */}
          <button
            onClick={() => setShowParams(p => !p)}
            className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-500/15" : "bg-indigo-50"}`}>
                <FaCubes className={`text-lg ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
              </div>
              <div>
                <div className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>28-Parameter Org Diagnostic</div>
                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {paramAnalysis.summary.assessed}/28 scored &middot;
                  <span className="text-emerald-500 ml-1">{paramAnalysis.summary.strong} strong</span>
                  <span className="text-amber-500 ml-1">{paramAnalysis.summary.needsWork} improving</span>
                  <span className="text-red-500 ml-1">{paramAnalysis.summary.critical} critical</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold ${scoreColor(paramAnalysis.summary.avgScore)}`}>{paramAnalysis.summary.avgScore}%</span>
              {showParams ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </div>
          </button>

          {showParams && (
            <div className={`px-5 pb-5 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>

              {/* Priority Alerts — compact row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 mb-4">
                <div className={`rounded-lg border p-3 ${darkMode ? "bg-red-900/10 border-red-800/30" : "bg-red-50/60 border-red-100"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaFireAlt className="text-red-400 text-[11px]" />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-red-300" : "text-red-600"}`}>Priority Focus</span>
                  </div>
                  {paramAnalysis.topUrgent.length === 0 ? (
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Complete assessments to see priorities</p>
                  ) : paramAnalysis.topUrgent.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-0.5">
                      <span className={`text-[11px] truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.title}</span>
                      <span className={`text-[11px] font-bold ${scoreColor(p.score)}`}>{p.score}%</span>
                    </div>
                  ))}
                </div>
                <div className={`rounded-lg border p-3 ${darkMode ? "bg-emerald-900/10 border-emerald-800/30" : "bg-emerald-50/60 border-emerald-100"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaShieldAlt className="text-emerald-400 text-[11px]" />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-emerald-300" : "text-emerald-600"}`}>Top Strengths</span>
                  </div>
                  {paramAnalysis.topStrong.length === 0 ? (
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Complete assessments to see strengths</p>
                  ) : paramAnalysis.topStrong.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-0.5">
                      <span className={`text-[11px] truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.title}</span>
                      <span className={`text-[11px] font-bold ${scoreColor(p.score)}`}>{p.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage bar */}
              <div className={`rounded-lg p-3 mb-4 ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Coverage</span>
                  <span className={`text-xs font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{paramAnalysis.summary.coveragePercent}% — {paramAnalysis.summary.assessed}/28 scored</span>
                </div>
                <div className={`w-full h-1.5 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                  <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${paramAnalysis.summary.coveragePercent}%` }} />
                </div>
              </div>

              {/* 6 System Accordions — each shows its driven parameters */}
              <div className="space-y-2">
                {CANONICAL_SYSTEMS.map(cs => {
                  const sysParams = paramAnalysis.bySystem[cs.key] || [];
                  if (sysParams.length === 0) return null;
                  const isOpen = expandedSystem === cs.key;
                  const scored = sysParams.filter(p => p.score !== null);
                  const sysAvg = scored.length > 0 ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length) : null;
                  const critCount = scored.filter(p => p.score < 40).length;
                  const strongCount = scored.filter(p => p.score >= 70).length;

                  return (
                    <div key={cs.key} className={`rounded-xl border overflow-hidden transition-all ${isOpen ? "ring-1 ring-indigo-500/20" : ""} ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"}`}>
                      {/* System header */}
                      <button
                        onClick={() => setExpandedSystem(prev => prev === cs.key ? null : cs.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: cs.color + '18', border: `1.5px solid ${cs.color}40` }}>
                          {cs.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{cs.title}</div>
                          <div className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            {sysParams.length} parameter{sysParams.length !== 1 ? "s" : ""}
                            {critCount > 0 && <span className="text-red-400 ml-1.5">· {critCount} critical</span>}
                            {strongCount > 0 && <span className="text-emerald-400 ml-1.5">· {strongCount} strong</span>}
                          </div>
                        </div>
                        {sysAvg !== null && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={`w-14 h-1.5 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                              <div className="h-1.5 rounded-full transition-all" style={{ width: `${sysAvg}%`, backgroundColor: sysAvg >= 70 ? '#22c55e' : sysAvg >= 40 ? '#eab308' : '#ef4444' }} />
                            </div>
                            <span className={`text-sm font-bold ${scoreColor(sysAvg)}`}>{sysAvg}%</span>
                          </div>
                        )}
                        {isOpen ? <FaChevronUp className="text-gray-400 text-xs flex-shrink-0" /> : <FaChevronDown className="text-gray-400 text-xs flex-shrink-0" />}
                      </button>

                      {/* System's parameters */}
                      {isOpen && (
                        <div className={`px-4 pb-4 border-t space-y-1.5 ${darkMode ? "border-gray-700/60" : "border-gray-100"}`}>
                          <div className="flex items-center justify-between pt-3 pb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Parameters driven by {cs.title}
                            </span>
                            <button onClick={() => navigate(`/ceo/assessments?focus=${encodeURIComponent(cs.key)}`)} className={`text-[10px] flex items-center gap-1 ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"}`}>
                              Take assessment <FaArrowRight className="text-[8px]" />
                            </button>
                          </div>

                          {sysParams.map(param => {
                            const hasScore = param.score !== null;
                            const isParamOpen = expandedParam === param.id;
                            const rec = getRecommendation(param);
                            const recCol = rec ? REC_COLORS[rec.type] : null;

                            return (
                              <div key={param.id} className={`rounded-lg border overflow-hidden transition-all ${hasScore ? scoreBg(param.score, darkMode) : (darkMode ? "bg-gray-700/30 border-gray-700" : "bg-gray-50/80 border-gray-200")} ${isParamOpen ? "ring-1 ring-indigo-500/20" : ""}`}>
                                {/* Param row */}
                                <button onClick={() => toggleParam(param.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left ${darkMode ? "hover:bg-white/[0.02]" : "hover:bg-black/[0.01]"}`}>
                                  <span className={`text-[9px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200/70 text-gray-500"}`}>{param.number}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-[13px] font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{param.title}</div>
                                  </div>
                                  {hasScore ? (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <div className={`w-12 h-1.5 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                        <div className="h-1.5 rounded-full" style={{ width: `${param.score}%`, backgroundColor: param.score >= 70 ? '#22c55e' : param.score >= 40 ? '#eab308' : '#ef4444' }} />
                                      </div>
                                      <span className={`text-xs font-bold ${scoreColor(param.score)}`}>{param.score}%</span>
                                    </div>
                                  ) : (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-500"}`}>{param.statusLabel}</span>
                                  )}
                                  {isParamOpen ? <FaChevronUp className="text-gray-400 text-[9px] flex-shrink-0" /> : <FaChevronDown className="text-gray-400 text-[9px] flex-shrink-0" />}
                                </button>

                                {/* Expanded param detail */}
                                {isParamOpen && (
                                  <div className={`px-3 pb-3 space-y-2.5 border-t ${darkMode ? "border-gray-700/40" : "border-gray-200/50"}`}>
                                    <div className={`text-[11px] pt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{param.subtitle}</div>

                                    {/* Recommendation */}
                                    {rec && (
                                      <div className={`rounded-lg border p-2.5 ${recCol.bg}`}>
                                        <div className="flex items-start gap-2">
                                          <rec.icon className={`text-xs mt-0.5 flex-shrink-0 ${recCol.icon}`} />
                                          <p className={`text-[11px] leading-relaxed ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{rec.text}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Sub-metrics */}
                                    {param.subMetrics && param.subMetrics.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {param.subMetrics.map((metric, mi) => (
                                          <div key={mi} className={`flex items-center gap-1.5 py-1 px-2 rounded ${darkMode ? "bg-gray-700/30" : "bg-white/60"}`}>
                                            <div className={`flex-shrink-0 ${hasScore && param.score >= 60 ? "text-emerald-400" : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
                                              {hasScore && param.score >= 60 ? <FaCheckCircle className="text-[9px]" /> : <span className={`inline-block w-2 h-2 rounded-sm border ${darkMode ? "border-gray-600" : "border-gray-300"}`} />}
                                            </div>
                                            <span className={`text-[11px] ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{metric}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Also driven by + actions */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      {param.relatedSystems.filter(s => normalizeSystemKey(s) !== cs.key).map(sysId => {
                                        const sys = getSystemMeta(sysId);
                                        return (
                                          <span key={sysId} className={`text-[10px] px-1.5 py-0.5 rounded ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                            {sys.icon} {sys.title}
                                          </span>
                                        );
                                      })}
                                      {param.evaluationSource?.includes("upload") && (
                                        <button onClick={() => navigate("/ceo/data")} className={`text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1 ${darkMode ? "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25" : "bg-purple-50 text-purple-600 hover:bg-purple-100"}`}>
                                          <FaUpload className="text-[8px]" /> Upload Data
                                        </button>
                                      )}
                                      {param.evaluationSource?.includes("chat") && (
                                        <button onClick={() => navigate("/ceo/chat")} className={`text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1 ${darkMode ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"}`}>
                                          <FaCommentDots className="text-[8px]" /> Chat
                                        </button>
                                      )}
                                      <div className="flex-1" />
                                      <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        <span className="text-[9px]">Weight</span>
                                        <div className="flex gap-px">
                                          {[1, 2, 3, 4, 5].map(w => (
                                            <div key={w} className={`w-2 h-1 rounded-sm ${w <= (param.weight || 0) ? "bg-indigo-400" : (darkMode ? "bg-gray-700" : "bg-gray-200")}`} />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-8">
        {groupedByDate.map(([date, runs]) => (
          <div key={date}>
            <div className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <FaCalendarAlt className="text-xs" />
              {date}
              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                {runs.length} run{runs.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {runs.map((run, i) => (
                <AssessmentCard
                  key={run.id || `${run.systemId}-${i}`}
                  run={run}
                  darkMode={darkMode}
                  previousScore={previousScoreMap[run.id || `${run.systemId}-${run.timestamp}`]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
