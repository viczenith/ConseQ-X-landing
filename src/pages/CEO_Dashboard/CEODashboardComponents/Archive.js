import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { FaChevronDown, FaChevronUp, FaSearch, FaCalendarAlt, FaFilter } from "react-icons/fa";
import { parameters28, groupParametersByCategory, evaluateParameters, getParameterSummary } from "../../../data/parameters28";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";

/* ═══ Helpers ═══ */
function readAssessments(orgId) {
  try {
    const all = JSON.parse(localStorage.getItem("conseqx_assessments_v1") || "{}");
    return all[orgId] || [];
  } catch { return []; }
}

function getScoreColor(score) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getScoreBg(score, dark) {
  if (score >= 80) return dark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200";
  if (score >= 60) return dark ? "bg-yellow-900/30 border-yellow-700" : "bg-yellow-50 border-yellow-200";
  if (score >= 40) return dark ? "bg-orange-900/30 border-orange-700" : "bg-orange-50 border-orange-200";
  return dark ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200";
}

function getGradeLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Adequate";
  if (score >= 50) return "Needs Improvement";
  if (score >= 40) return "Weak";
  return "Critical";
}

/* ═══ Collapsible Parameter Card ═══ */
function ParameterCard({ param, score, darkMode }) {
  const [open, setOpen] = useState(false);
  const grade = getGradeLabel(score);

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${getScoreBg(score, darkMode)}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
            #{param.number}
          </span>
          <div className="min-w-0">
            <div className={`font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{param.title}</div>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{param.subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}%</span>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{grade}</div>
          </div>
          {open ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className={`px-4 pb-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Sub-metrics */}
            <div>
              <div className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Sub-Metrics</div>
              <ul className="space-y-1">
                {param.subMetrics.map((sm, i) => (
                  <li key={i} className={`text-sm flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${score >= 60 ? "bg-green-400" : "bg-orange-400"}`} />
                    {sm}
                  </li>
                ))}
              </ul>
            </div>

            {/* Related systems */}
            <div>
              <div className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Related Systems</div>
              <div className="flex flex-wrap gap-1">
                {param.relatedSystems.map(sys => (
                  <span key={sys} className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                    {sys}
                  </span>
                ))}
              </div>

              <div className={`text-xs font-semibold mt-3 mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Evaluation Source</div>
              <div className="flex flex-wrap gap-1">
                {param.evaluationSource.map(src => (
                  <span key={src} className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                    {src}
                  </span>
                ))}
              </div>

              <div className={`text-xs mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Weight: {param.weight} · Category: {param.category}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ Assessment Run Card ═══ */
function AssessmentRunCard({ run, darkMode, parameters, allRuns }) {
  const [expanded, setExpanded] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Build combined system scores from ALL latest runs (not just this one),
  // so the 28-parameter evaluation shows the full organizational picture
  const systemScores = useMemo(() => {
    const latestBySystem = {};
    // Find latest run per system across all assessments
    (allRuns || []).forEach(r => {
      const key = normalizeSystemKey(r.systemId);
      if (!key) return;
      if (!latestBySystem[key] || (r.timestamp || 0) > (latestBySystem[key].timestamp || 0)) {
        latestBySystem[key] = r;
      }
    });
    const scores = {};
    for (const [key, r] of Object.entries(latestBySystem)) {
      scores[key] = { systemScore: r.score || 0, maxSystemScore: 100 };
    }
    return scores;
  }, [allRuns]);

  const paramResults = useMemo(() => evaluateParameters(systemScores), [systemScores]);

  const categories = useMemo(() => {
    const cats = new Set(parameters.map(p => p.category));
    return ["all", ...cats];
  }, [parameters]);

  const filteredParams = useMemo(() => {
    return paramResults.filter(pr => {
      const param = parameters.find(p => p.id === pr.id);
      if (!param) return false;
      if (filterCategory !== "all" && param.category !== filterCategory) return false;
      if (searchTerm && !param.title.toLowerCase().includes(searchTerm.toLowerCase()) && !param.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [paramResults, parameters, filterCategory, searchTerm]);

  const summary = useMemo(() => getParameterSummary(paramResults), [paramResults]);

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getScoreBg(run.score, darkMode)}`}>
            <span className={getScoreColor(run.score)}>{run.score || "—"}</span>
          </div>
          <div>
            <div className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {CANONICAL_SYSTEMS[normalizeSystemKey(run.systemId)]?.label || run.systemId}
            </div>
            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <FaCalendarAlt className="inline mr-1 text-xs" />
              {run.timestamp ? new Date(run.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown date"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Parameters</div>
            <div className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{summary.totalParameters}</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Avg Score</div>
            <div className={`font-semibold ${getScoreColor(summary.averageScore)}`}>{summary.averageScore}%</div>
          </div>
          {expanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={`px-5 pb-5 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          {/* Summary bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className={`rounded-lg p-3 text-center ${darkMode ? "bg-green-900/20" : "bg-green-50"}`}>
              <div className="text-lg font-bold text-green-500">{summary.strong}</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Strong (≥70%)</div>
            </div>
            <div className={`rounded-lg p-3 text-center ${darkMode ? "bg-yellow-900/20" : "bg-yellow-50"}`}>
              <div className="text-lg font-bold text-yellow-500">{summary.adequate}</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Adequate</div>
            </div>
            <div className={`rounded-lg p-3 text-center ${darkMode ? "bg-orange-900/20" : "bg-orange-50"}`}>
              <div className="text-lg font-bold text-orange-500">{summary.weak}</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Weak</div>
            </div>
            <div className={`rounded-lg p-3 text-center ${darkMode ? "bg-red-900/20" : "bg-red-50"}`}>
              <div className="text-lg font-bold text-red-500">{summary.critical}</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Critical (&lt;40%)</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search parameters..."
                className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"}`}
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className={`pl-9 pr-8 py-2 rounded-lg border text-sm appearance-none ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-200 text-gray-800"}`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Parameter list */}
          <div className="space-y-2">
            {filteredParams.map(pr => {
              const param = parameters.find(p => p.id === pr.id);
              if (!param) return null;
              return <ParameterCard key={pr.id} param={param} score={pr.score} darkMode={darkMode} />;
            })}
            {filteredParams.length === 0 && (
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No parameters match your filter.
              </div>
            )}
          </div>
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

  // Deduplicate: keep only the LATEST assessment per system per date
  const deduped = useMemo(() => {
    const latestBySystemDate = {};
    assessments.forEach(a => {
      const sys = a.systemId || "unknown";
      const date = a.timestamp ? new Date(a.timestamp).toLocaleDateString("en-US") : "unknown";
      const key = `${sys}__${date}`;
      if (!latestBySystemDate[key] || (a.timestamp || 0) > (latestBySystemDate[key].timestamp || 0)) {
        latestBySystemDate[key] = a;
      }
    });
    return Object.values(latestBySystemDate).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [assessments]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    deduped.forEach(a => {
      const date = a.timestamp ? new Date(a.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown Date";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    // Sort dates newest first
    return Object.entries(groups).sort((a, b) => {
      const da = new Date(a[0]);
      const db = new Date(b[0]);
      return isNaN(db) - isNaN(da) || db - da;
    });
  }, [assessments]);

  if (deduped.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        <FaCalendarAlt className="text-4xl mb-4 opacity-50" />
        <div className="text-lg font-medium mb-2">No Archived Assessments</div>
        <div className="text-sm">Complete system assessments to see your 28-parameter analysis here.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Review past assessment results with the full 28-parameter organizational health analysis.
          Click any assessment to expand and explore all parameters with filterable, collapsible detail cards.
        </p>
      </div>

      <div className="space-y-8">
        {groupedByDate.map(([date, runs]) => (
          <div key={date}>
            <div className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <FaCalendarAlt className="text-xs" />
              {date}
              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                {runs.length} assessment{runs.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {runs.map((run, i) => (
                <AssessmentRunCard key={run.id || `${run.systemId}-${i}`} run={run} darkMode={darkMode} parameters={parameters28} allRuns={deduped} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
