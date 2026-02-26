import React, { useMemo, useState, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSystemsForUI, normalizeSystemKey } from "../constants/systems";
import { systems as assessmentSystems } from "../../../data/systems";
import {
  FaChartBar, FaFileAlt, FaChevronDown, FaChevronUp,
  FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown,
  FaClock, FaPrint, FaFilter, FaInfoCircle
} from "react-icons/fa";

/* ── constants ─────────────────────────────────────────────── */
const SYSTEMS = getSystemsForUI();
const STORAGE_KEY = "conseqx_assessments_v1";
const ANSWERS_STORAGE_KEY = "conseqx_assessment_answers_v1";

/* ── storage read helpers ──────────────────────────────────── */
function readAssessments(orgId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[orgId] || [];
  } catch (e) { return []; }
}

function readAnswers(orgId) {
  try {
    const raw = localStorage.getItem(ANSWERS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[orgId] || {};
  } catch (e) { return {}; }
}

/* ── helper: get latest result per system ──────────────────── */
function getLatestPerSystem(assessments) {
  const bySystem = {};
  assessments.forEach(a => {
    const key = normalizeSystemKey(a.systemId);
    if (!bySystem[key] || (bySystem[key].timestamp || 0) < (a.timestamp || 0)) {
      bySystem[key] = a;
    }
  });
  return bySystem;
}

/* ── helper: health level label & colour ───────────────────── */
function healthMeta(score) {
  if (score >= 80) return { label: "Excellent", color: "green", bg: "bg-green-500", text: "text-green-600", bgLight: "bg-green-50", border: "border-green-200", darkBg: "bg-green-900/20", darkBorder: "border-green-500/30", darkText: "text-green-400" };
  if (score >= 60) return { label: "Good", color: "yellow", bg: "bg-yellow-500", text: "text-yellow-600", bgLight: "bg-yellow-50", border: "border-yellow-200", darkBg: "bg-yellow-900/20", darkBorder: "border-yellow-500/30", darkText: "text-yellow-400" };
  if (score >= 40) return { label: "Needs Attention", color: "orange", bg: "bg-orange-500", text: "text-orange-600", bgLight: "bg-orange-50", border: "border-orange-200", darkBg: "bg-orange-900/20", darkBorder: "border-orange-500/30", darkText: "text-orange-400" };
  return { label: "Critical", color: "red", bg: "bg-red-500", text: "text-red-600", bgLight: "bg-red-50", border: "border-red-200", darkBg: "bg-red-900/20", darkBorder: "border-red-500/30", darkText: "text-red-400" };
}

/* ── score ring SVG ────────────────────────────────────────── */
function ScoreRing({ score, size = 120, stroke = 10, darkMode }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const hm = healthMeta(score);
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={darkMode ? "#374151" : "#E5E7EB"} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        className={hm.bg.replace("bg-", "stroke-")} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        className={`text-2xl font-bold ${darkMode ? "fill-gray-100" : "fill-gray-900"}`}
        transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {score}%
      </text>
    </svg>
  );
}

/* ── small progress bar ────────────────────────────────────── */
function Bar({ pct = 0, darkMode }) {
  const hm = healthMeta(pct);
  return (
    <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
      <div className={`h-full rounded-full ${hm.bg}`} style={{ width: `${pct}%`, transition: "width .6s ease" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function CEOReports() {
  const { darkMode, org = null } = useOutletContext();
  const orgId = org?.id || "anon";
  const orgName = org?.name || org?.company_name || "Your Organization";
  const printRef = useRef(null);

  /* ── data ─────────────────────────────────────────────────── */
  const assessments = useMemo(() => readAssessments(orgId), [orgId]);
  const answers = useMemo(() => readAnswers(orgId), [orgId]);
  const latestBySystem = useMemo(() => getLatestPerSystem(assessments), [assessments]);

  /* ── derived metrics ──────────────────────────────────────── */
  const report = useMemo(() => {
    const systemResults = SYSTEMS.map(sys => {
      const latest = latestBySystem[sys.id] || null;
      const score = latest?.score ?? null;
      const subScores = latest?.meta?.subScores || [];
      const interpretation = latest?.meta?.interpretation || null;
      const sysDef = assessmentSystems.find(s => s.id === sys.id);

      // Count answered questions
      let totalQuestions = 0;
      let answeredQuestions = 0;
      if (sysDef) {
        sysDef.subAssessments.forEach(sub => {
          totalQuestions += sub.questions.length;
          const subAns = answers[sub.id] || {};
          answeredQuestions += Object.keys(subAns).filter(k => {
            const v = subAns[k];
            return v !== null && v !== undefined && v !== '';
          }).length;
        });
      }

      return {
        ...sys,
        score,
        subScores,
        interpretation,
        timestamp: latest?.timestamp || null,
        rawScore: latest?.rawScore ?? null,
        maxScore: latest?.maxScore ?? null,
        totalQuestions,
        answeredQuestions,
        completionPct: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
        hasResult: !!latest,
      };
    });

    const completed = systemResults.filter(s => s.hasResult);
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length)
      : null;

    // Weakest & strongest
    const sorted = [...completed].sort((a, b) => (a.score || 0) - (b.score || 0));
    const weakest = sorted.slice(0, 2);
    const strongest = sorted.slice(-2).reverse();

    // Recommendations from weakest sub-assessments across all systems
    const allSubScores = completed.flatMap(sys =>
      sys.subScores.map(ss => ({ ...ss, systemTitle: sys.title, systemId: sys.id }))
    );
    const weakSubs = [...allSubScores]
      .sort((a, b) => (a.percent || 0) - (b.percent || 0))
      .slice(0, 5);

    // History (all runs, chronological)
    const history = [...assessments]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 20);

    return { systemResults, completed, avgScore, weakest, strongest, weakSubs, history };
  }, [latestBySystem, assessments, answers]);

  /* ── UI state ─────────────────────────────────────────────── */
  const [expandedSystem, setExpandedSystem] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all"); // all | critical | needs-attention | good | excellent
  const [showHistory, setShowHistory] = useState(false);

  const filteredSystems = useMemo(() => {
    if (filterLevel === "all") return report.systemResults;
    return report.systemResults.filter(s => {
      if (!s.hasResult) return filterLevel === "critical";
      const hm = healthMeta(s.score);
      if (filterLevel === "critical") return hm.color === "red" || hm.color === "orange";
      if (filterLevel === "needs-attention") return hm.color === "orange";
      if (filterLevel === "good") return hm.color === "yellow";
      if (filterLevel === "excellent") return hm.color === "green";
      return true;
    });
  }, [report.systemResults, filterLevel]);

  /* ── print ────────────────────────────────────────────────── */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /* ── no data state ────────────────────────────────────────── */
  const hasAnyData = report.completed.length > 0;

  /* ───────────────────────────────────────────────────────────
     RENDER
     ─────────────────────────────────────────────────────────── */
  return (
    <section ref={printRef} className="print:bg-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
       
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <div className="relative">
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className={`text-xs pl-7 pr-3 py-1.5 rounded-lg border appearance-none cursor-pointer ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-300"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <option value="all">All Systems</option>
              <option value="critical">Critical Only</option>
              <option value="needs-attention">Needs Attention</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
            <FaFilter className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          {/* Print */}
          <button onClick={handlePrint}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
              darkMode ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}>
            <FaPrint size={12} /> Print
          </button>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────── */}
      {!hasAnyData && (
        <div className={`rounded-xl p-8 sm:p-12 text-center border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
          <FaFileAlt className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} size={48} />
          <h2 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>No Reports Available Yet</h2>
          <p className={`text-sm max-w-md mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Complete at least one TORIL system assessment on the <span className="font-semibold">Assessments</span> page, then return here to view your organizational health report.
          </p>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* ── Executive Summary ───────────────────────────── */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6`}>
            {/* Overall Score Card */}
            <div className={`lg:col-span-1 rounded-xl p-5 border flex flex-col items-center justify-center ${
              darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <p className={`text-xs uppercase tracking-wider mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Overall Health Score
              </p>
              <ScoreRing score={report.avgScore || 0} darkMode={darkMode} />
              <p className={`mt-3 text-sm font-semibold ${healthMeta(report.avgScore || 0)[darkMode ? "darkText" : "text"]}`}>
                {healthMeta(report.avgScore || 0).label}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Based on {report.completed.length} of {SYSTEMS.length} systems assessed
              </p>
            </div>

            {/* Key Insights */}
            <div className={`lg:col-span-2 rounded-xl p-5 border ${
              darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Key Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Strongest */}
                {report.strongest.length > 0 && (
                  <div className={`p-3 rounded-lg border ${darkMode ? "bg-green-900/10 border-green-500/20" : "bg-green-50 border-green-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FaArrowUp className="text-green-500" size={12} />
                      <span className={`text-xs font-semibold ${darkMode ? "text-green-400" : "text-green-700"}`}>Strongest Areas</span>
                    </div>
                    {report.strongest.map(s => (
                      <div key={s.id} className="flex items-center justify-between mb-1 last:mb-0">
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{s.icon} {s.title}</span>
                        <span className={`text-xs font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>{s.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Weakest */}
                {report.weakest.length > 0 && (
                  <div className={`p-3 rounded-lg border ${darkMode ? "bg-red-900/10 border-red-500/20" : "bg-red-50 border-red-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FaArrowDown className="text-red-500" size={12} />
                      <span className={`text-xs font-semibold ${darkMode ? "text-red-400" : "text-red-700"}`}>Needs Improvement</span>
                    </div>
                    {report.weakest.map(s => (
                      <div key={s.id} className="flex items-center justify-between mb-1 last:mb-0">
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{s.icon} {s.title}</span>
                        <span className={`text-xs font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>{s.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Coverage */}
                <div className={`p-3 rounded-lg border ${darkMode ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaChartBar className={`${darkMode ? "text-blue-400" : "text-blue-500"}`} size={12} />
                    <span className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Assessment Coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Bar pct={Math.round((report.completed.length / SYSTEMS.length) * 100)} darkMode={darkMode} />
                    </div>
                    <span className={`text-xs font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {report.completed.length}/{SYSTEMS.length}
                    </span>
                  </div>
                </div>
                {/* Last Run */}
                {report.history.length > 0 && (
                  <div className={`p-3 rounded-lg border ${darkMode ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} size={12} />
                      <span className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Last Assessment Run</span>
                    </div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {new Date(report.history[0].timestamp).toLocaleString()}
                    </p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {report.history.length} total run{report.history.length !== 1 ? 's' : ''} recorded
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── System-by-System Breakdown ──────────────────── */}
          <div className={`rounded-xl border mb-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: darkMode ? "#374151" : "#E5E7EB" }}>
              <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                System-by-System Breakdown
              </h3>
              <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {filteredSystems.length} system{filteredSystems.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y" style={{ borderColor: darkMode ? "#374151" : "#E5E7EB" }}>
              {filteredSystems.map(sys => {
                const expanded = expandedSystem === sys.id;
                const hm = sys.hasResult ? healthMeta(sys.score) : null;

                return (
                  <div key={sys.id}>
                    {/* Row header */}
                    <button
                      onClick={() => setExpandedSystem(expanded ? null : sys.id)}
                      className={`w-full px-5 py-3.5 flex items-center gap-3 text-left transition-colors ${
                        darkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{sys.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                          {sys.title}
                        </p>
                        {sys.hasResult && hm ? (
                          <p className={`text-xs ${hm[darkMode ? "darkText" : "text"]}`}>{hm.label}</p>
                        ) : (
                          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Not assessed yet</p>
                        )}
                      </div>

                      {/* Score + progress */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {sys.hasResult ? (
                          <>
                            <div className="w-20 hidden sm:block">
                              <Bar pct={sys.score} darkMode={darkMode} />
                            </div>
                            <span className={`text-sm font-bold w-10 text-right ${hm[darkMode ? "darkText" : "text"]}`}>
                              {sys.score}%
                            </span>
                          </>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                          }`}>–</span>
                        )}
                        {expanded ? <FaChevronUp size={10} className={darkMode ? "text-gray-500" : "text-gray-400"} /> : <FaChevronDown size={10} className={darkMode ? "text-gray-500" : "text-gray-400"} />}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={`px-5 pb-4 pt-1 ${darkMode ? "bg-gray-800/30" : "bg-gray-50/50"}`}>
                            {!sys.hasResult ? (
                              <p className={`text-xs py-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                No assessment results yet. Go to the <span className="font-semibold">Assessments</span> page to run this system.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {/* Overall interpretation */}
                                {sys.interpretation && sys.interpretation.rating !== 'N/A' && (
                                  <div className={`p-3 rounded-lg border ${hm[darkMode ? "darkBg" : "bgLight"]} ${hm[darkMode ? "darkBorder" : "border"]}`}>
                                    <p className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                      {sys.interpretation.rating}
                                    </p>
                                    <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                      {sys.interpretation.interpretation}
                                    </p>
                                  </div>
                                )}

                                {/* Raw score */}
                                {sys.rawScore != null && (
                                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    Raw score: {sys.rawScore} / {sys.maxScore} points &bull; Assessed {new Date(sys.timestamp).toLocaleString()}
                                  </p>
                                )}

                                {/* Sub-assessment breakdown */}
                                {sys.subScores.length > 0 && (
                                  <div>
                                    <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Sub-Assessment Scores</p>
                                    <div className="space-y-2">
                                      {sys.subScores.map(ss => {
                                        const shm = healthMeta(ss.percent);
                                        return (
                                          <div key={ss.id} className={`p-2.5 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                            <div className="flex items-center justify-between mb-1.5">
                                              <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{ss.title}</span>
                                              <span className={`text-xs font-bold ${shm[darkMode ? "darkText" : "text"]}`}>{ss.percent}%</span>
                                            </div>
                                            <Bar pct={ss.percent} darkMode={darkMode} />
                                            <div className="flex items-center justify-between mt-1">
                                              <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                                {ss.score}/{ss.max} pts
                                              </span>
                                              {ss.interpretation && (
                                                <span className={`text-[10px] italic ${shm[darkMode ? "darkText" : "text"]}`}>
                                                  {ss.interpretation.rating}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Question completion */}
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" size={11} />
                                  <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {sys.answeredQuestions}/{sys.totalQuestions} questions answered ({sys.completionPct}%)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Priority Recommendations ───────────────────── */}
          {report.weakSubs.length > 0 && (
            <div className={`rounded-xl p-5 border mb-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                <FaExclamationTriangle className="text-yellow-500" size={13} />
                Priority Improvement Areas
              </h3>
              <div className="space-y-2.5">
                {report.weakSubs.map((ss, i) => {
                  const shm = healthMeta(ss.percent);
                  return (
                    <div key={`${ss.systemId}-${ss.id}`}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${shm.bg}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-xs font-semibold truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{ss.title}</p>
                          <span className={`text-xs font-bold flex-shrink-0 ml-2 ${shm[darkMode ? "darkText" : "text"]}`}>{ss.percent}%</span>
                        </div>
                        <p className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Under: {ss.systemTitle} &bull; Score: {ss.score}/{ss.max}
                        </p>
                        {ss.interpretation && (
                          <p className={`text-xs mt-1 ${shm[darkMode ? "darkText" : "text"]}`}>
                            {ss.interpretation.rating} — {ss.interpretation.interpretation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Assessment History ──────────────────────────── */}
          <div className={`rounded-xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`w-full px-5 py-4 flex items-center justify-between text-left ${
                darkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
              } rounded-xl transition-colors`}
            >
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                <FaClock size={13} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                Assessment Run History
                <span className={`text-xs font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>({report.history.length})</span>
              </h3>
              {showHistory ? <FaChevronUp size={10} className={darkMode ? "text-gray-500" : "text-gray-400"} /> : <FaChevronDown size={10} className={darkMode ? "text-gray-500" : "text-gray-400"} />}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4">
                    {report.history.length === 0 ? (
                      <p className={`text-xs py-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No runs recorded.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {report.history.map((run, idx) => {
                          const hm = healthMeta(run.score || 0);
                          const sysInfo = SYSTEMS.find(s => s.id === normalizeSystemKey(run.systemId));
                          return (
                            <div key={run.id || idx}
                              className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                                darkMode ? "hover:bg-gray-700/20" : "hover:bg-gray-50"
                              }`}
                            >
                              <span className="text-sm flex-shrink-0">{sysInfo?.icon || "📊"}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  {run.title || sysInfo?.title || run.systemId}
                                </p>
                                <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                  {new Date(run.timestamp).toLocaleString()}
                                  {run.meta?.rubricsBased && " • Rubrics-scored"}
                                </p>
                              </div>
                              <span className={`text-xs font-bold flex-shrink-0 ${run.score != null ? hm[darkMode ? "darkText" : "text"] : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
                                {run.score != null ? `${run.score}%` : "–"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer note ────────────────────────────────── */}
          <div className="mt-6 flex items-start gap-2">
            <FaInfoCircle className={`flex-shrink-0 mt-0.5 ${darkMode ? "text-gray-600" : "text-gray-300"}`} size={12} />
            <p className={`text-[11px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
              Scores are calculated from your responses to the TORIL assessment rubrics. Re-run assessments periodically to track improvements. Results are stored securely per organization.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
