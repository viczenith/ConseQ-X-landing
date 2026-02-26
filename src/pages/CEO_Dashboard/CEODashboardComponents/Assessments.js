import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Assessment from "../../../Assessment";
import { FaHistory, FaTrash, FaPlay, FaEye, FaTimes, FaCheckCircle, FaLightbulb, FaBuilding } from "react-icons/fa";
import { getSystemsForUI, normalizeSystemKey } from "../constants/systems";
import * as events from "../lib/events";
import { motion, AnimatePresence } from "framer-motion";
import { systems as assessmentSystems } from "../../../data/systems";

import * as orgHealth from "../services/orgHealth";

const SYSTEMS = getSystemsForUI();

function createAssessmentSystems() {
  return assessmentSystems;
}

const STORAGE_KEY = "conseqx_assessments_v1";
const ANSWERS_STORAGE_KEY = "conseqx_assessment_answers_v1";
const PROGRESS_STORAGE_KEY = "conseqx_assessment_progress_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}
function addAssessmentForOrg(orgId, result, max = 200) {
  if (!orgId) orgId = "anon";
  const all = readAll();
  const arr = all[orgId] || [];
  const next = [{ ...result, timestamp: result.timestamp || Date.now() }, ...arr.filter((x) => x.id !== result.id)];
  all[orgId] = next.slice(0, max);
  writeAll(all);
  return all[orgId];
}
function removeAssessmentForOrg(orgId, id) {
  const all = readAll();
  const arr = all[orgId] || [];
  const next = arr.filter((x) => x.id !== id);
  all[orgId] = next;
  writeAll(all);
  return next;
}
function summarizeSystems(arr = []) {
  const bySys = {};
  arr.forEach((r) => {
    if (!r.systemId) return;
    const k = normalizeSystemKey(r.systemId);
    if (!bySys[k] || (bySys[k].timestamp || 0) < (r.timestamp || 0)) {
      bySys[k] = { ...r, systemId: k };
    }
  });
  return Object.keys(bySys).map((k) => ({ systemId: k, score: bySys[k].score || 0, result: bySys[k] }));
}


function readAssessmentAnswers(orgId) {
  try {
    const raw = localStorage.getItem(ANSWERS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[orgId] || {};
  } catch {
    return {};
  }
}

function writeAssessmentAnswers(orgId, answers) {
  try {
    const raw = localStorage.getItem(ANSWERS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[orgId] = answers;
    localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function readAssessmentProgress(orgId) {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[orgId] || {};
  } catch {
    return {};
  }
}

function writeAssessmentProgress(orgId, progress) {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[orgId] = progress;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function calculateAnsweredCount(allAnswers, systemId) {
  console.log(`calculateAnsweredCount called for ${systemId}:`, allAnswers);
  
  if (!allAnswers || typeof allAnswers !== 'object') {
    console.log(`calculateAnsweredCount: No valid answers for ${systemId}`);
    return 0;
  }
  
  // Count across all sub-assessments for this system
  let totalAnswered = 0;
  
  // Find the system definition to get all its sub-assessments
  const system = assessmentSystems.find(s => s.id === systemId);
  if (!system || !system.subAssessments) {
    console.log(`calculateAnsweredCount: No system found for ${systemId}`);
    return 0;
  }
  
  system.subAssessments.forEach(subAssessment => {
    const subAnswers = allAnswers[subAssessment.id] || {};
    const answered = Object.keys(subAnswers).filter(key => {
      const answer = subAnswers[key];
      const isAnswered = answer !== null && answer !== undefined && answer !== '' && answer !== 'null';
      return isAnswered;
    }).length;
    
    console.log(`calculateAnsweredCount: ${systemId} -> ${subAssessment.id}: ${answered} answers out of ${Object.keys(subAnswers).length} total`, subAnswers);
    totalAnswered += answered;
  });
  
  console.log(`calculateAnsweredCount: ${systemId} FINAL TOTAL = ${totalAnswered}`);
  return totalAnswered;
}

/* ---------- small UI primitives ---------- */
function ProgressBar({ pct = 0, darkMode = false }) {
  const containerBg = darkMode ? "bg-gray-800" : "bg-gray-200";
  const fillClass = pct === 100 ? "bg-green-500" : "bg-yellow-500";
  return (
    <div className={`w-full h-2 rounded-full ${containerBg} overflow-hidden`}>
      <div style={{ width: `${pct}%` }} className={`h-full ${fillClass}`} />
    </div>
  );
}

function AnalysisLoadingIndicator({ progress = 0, darkMode = false, systemTitle = "System" }) {
  return (
    <div className={`mt-3 p-4 rounded-lg border-2 border-dashed ${
      darkMode 
        ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30" 
        : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300/50"
    } relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`h-full w-full ${
          darkMode ? "bg-blue-400" : "bg-blue-600"
        } animate-pulse`} 
        style={{
          background: `linear-gradient(45deg, transparent 40%, ${darkMode ? '#3b82f6' : '#2563eb'} 50%, transparent 60%)`,
          backgroundSize: '20px 20px',
          animation: 'slide 2s linear infinite'
        }} />
      </div>
      
      <div className="relative z-10">
        {/* Header with spinning icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            darkMode 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
          } animate-spin`}>
            🧠
          </div>
          <div>
            <div className={`font-semibold ${darkMode ? "text-blue-200" : "text-blue-800"}`}>
              AI Analysis in Progress
            </div>
            <div className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
              Analyzing {systemTitle}...
            </div>
          </div>
        </div>

        {/* Enhanced progress bar with glow effect */}
        <div className={`relative h-3 rounded-full overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white/50"
        }`}>
          <div 
            className={`h-full transition-all duration-500 ease-out relative ${
              progress === 100 
                ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30" 
                : "bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg shadow-blue-500/30"
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Progress percentage with animated counter */}
        <div className="flex items-center justify-between mt-2">
          <div className={`text-sm font-medium ${darkMode ? "text-blue-200" : "text-blue-700"}`}>
            {progress}% Complete
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  darkMode ? "bg-blue-400" : "bg-blue-500"
                } animate-bounce`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Status messages based on progress */}
        <div className={`mt-2 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {progress < 20 && "🔍 Initializing analysis engine..."}
          {progress >= 20 && progress < 40 && "📊 Processing assessment data..."}
          {progress >= 40 && progress < 60 && "🧮 Running AI algorithms..."}
          {progress >= 60 && progress < 80 && "📈 Generating insights..."}
          {progress >= 80 && progress < 100 && "✨ Finalizing recommendations..."}
          {progress === 100 && "🎉 Analysis complete! Preparing results..."}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function SystemRow({ s, state, onStart, onView, onRemove, darkMode = false }) {
  // state = { status: "not-started"|"ready-to-run"|"in-progress"|"completed", progress, latestResult, answeredCount }
  const hasAnswers = (state.answeredCount || 0) > 0;
  const muted = !hasAnswers; // Only mute if no answers at all
  const score = state.latestResult?.score ?? null;
  const isAssessmentCompleted = state.status === "completed" && state.latestResult;
  const hasRunCompleted = state.status === "completed" && score !== null;
  
  // Debug logging to track state changes - DETAILED
  console.log(`🔄 SystemRow RENDER ${s.id}:`, {
    status: state.status,
    answeredCount: state.answeredCount,
    hasAnswers,
    progress: state.progress,
    timestamp: Date.now()
  });

  const rowBgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const titleColor = darkMode ? "text-gray-100" : "text-gray-900";
  const metaColor = darkMode ? "text-gray-400" : "text-gray-500";

  // Run button logic: Lock (no answers) → Run (has answers, not running) → Running (in progress)
  const isRunning = state.status === "in-progress" && state.progress < 100;
  const isReadyToRun = state.status === "ready-to-run" || (hasAnswers && state.status === "not-started");
  const canRun = hasAnswers && !isRunning; // SIMPLE: Can run if has answers and not currently running
  const runDisabled = !canRun;
  
  console.log(`🔘 Button Logic ${s.id}: hasAnswers=${hasAnswers}, isRunning=${isRunning}, canRun=${canRun}, runDisabled=${runDisabled}`);
  
  // More explicit button styling
  const runBtnBase = runDisabled
    ? `${darkMode ? "bg-gray-800 text-gray-400 cursor-not-allowed border-gray-700" : "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"}`
    : `${darkMode ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-500" : "bg-blue-600 text-white hover:bg-blue-700 border-blue-500"}`;

  // View button logic: Only enabled after run is completed with results
  const viewDisabled = !hasRunCompleted;
  const viewBtnBase = viewDisabled
    ? `${darkMode ? "bg-gray-900/20 text-gray-500 cursor-not-allowed border-gray-700" : "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-300"}`
    : `${darkMode ? "bg-green-600 text-white hover:bg-green-700 border-green-500" : "bg-green-600 text-white hover:bg-green-700 border-green-500"}`;

  // Progress bar logic: show during analysis OR while answering questions
  let progressPct = 0;
  if (state.status === "in-progress") {
    progressPct = state.progress;
  } else if (hasAnswers && !isAssessmentCompleted) {
    // Calculate percent answered
    const system = assessmentSystems.find(sys => sys.id === s.id);
    const totalQuestions = system ? system.subAssessments.reduce((sum, sub) => sum + sub.questions.length, 0) : 0;
    progressPct = totalQuestions > 0 ? Math.round((state.answeredCount / totalQuestions) * 100) : 0;
  }

  return (
    <div className={`flex items-center justify-between gap-2 p-2 rounded-md ${muted ? "opacity-60" : ""} ${rowBgHover} transition-all duration-200`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-semibold">
          {s.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={`font-medium truncate ${titleColor}`}>{s.title}</div>
            {state.status === "completed" && (
              <div className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"}`}>
                {score}%
              </div>
            )}
            {state.status === "in-progress" && (
              <div className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-yellow-900/20 text-yellow-300" : "bg-yellow-100 text-yellow-700"}`}>
                In progress
              </div>
            )}
          </div>

          <div className={`text-xs ${metaColor} mt-1`}>
            {!hasAnswers && "Complete assessment questions first"}
            {hasAnswers && (state.status === "not-started" || state.status === "ready-to-run") && "Ready to run analysis"} 
            {hasAnswers && state.status === "in-progress" && state.progress < 100 && `Analyzing... ${state.progress}%`}
            {hasAnswers && state.status === "in-progress" && state.progress >= 100 && "Analysis complete"}
            {isAssessmentCompleted && `Analysis completed ${new Date(state.latestResult.timestamp).toLocaleString()}`}
            {hasAnswers && !isAssessmentCompleted && state.status !== "in-progress" && `${state.answeredCount} questions answered`}
          </div>

          {(progressPct > 0 && !isAssessmentCompleted) && (
            <div className="mt-2">
              <ProgressBar pct={progressPct} darkMode={darkMode} />
            </div>
          )}
          {state.status === "in-progress" && (
            <AnalysisLoadingIndicator 
              progress={state.progress} 
              darkMode={darkMode} 
              systemTitle={s.title}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onStart(s.id)}
          disabled={runDisabled}
          title={`${s.id}: ${state.status} (${state.answeredCount} answers) - ${!hasAnswers ? "Answer at least one question to unlock analysis" : isRunning ? "X Ultra analysis in progress..." : "Run comprehensive X Ultra analysis"}`}
          className={`px-2 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${runBtnBase} ${
            isRunning ? 'animate-pulse shadow-lg' : ''
          }`}
        >
          {isRunning ? (
            <>
              <div className="inline-block mr-1 animate-spin">🧠</div>
              AI Analyzing...
            </>
          ) : !hasAnswers ? (
            <>
              <div className="inline-block mr-1">🔒</div>
              Locked
            </>
          ) : (
            <>
              <FaPlay className="inline-block mr-1" size={10} />
              {state.status === "ready-to-run" ? "🚀 Run X-ULTRA" : "▶ Run Analysis"}
            </>
          )}
        </button>

        <button
          onClick={() => onView(s.id)}
          disabled={viewDisabled}
          title={viewDisabled ? "Complete assessment to view results" : "View detailed results"}
          className={`px-2 py-1.5 rounded-md border text-xs transition-all duration-200 ${viewBtnBase}`}
        >
          <FaEye size={10} />
        </button>

        {state.latestResult && (
          <button
            onClick={() => onRemove(state.latestResult.id)}
            className={`px-2 py-1.5 rounded-md text-xs transition-all duration-200 ${darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
            title="Remove assessment"
          >
            <FaTrash size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function CEOAssessments() {
  const { darkMode, org = null, user = null } = useOutletContext();
  const orgId = org?.id || "anon";

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("conseqx:theme:changed", { detail: { darkMode } }));
    } catch {}
  }, [darkMode]);

  const [recent, setRecent] = useState(() => {
    try {
      const all = readAll();
      return all[orgId] || [];
    } catch {
      return [];
    }
  });

  const [systemStates, setSystemStates] = useState(() => {
    // derive initial state from recent items and persistent answers
    const persistentAnswers = readAssessmentAnswers(orgId);
    const init = {};
    SYSTEMS.forEach((s) => {
      const answeredCount = calculateAnsweredCount(persistentAnswers, s.id);
      init[s.id] = { 
        status: "not-started", 
        progress: 0, 
        latestResult: null, 
        answeredCount 
      };
    });
    const byLatest = summarizeSystems(recent);
    byLatest.forEach((b) => {
      const answeredCount = calculateAnsweredCount(persistentAnswers, b.systemId);
      if (!init[b.systemId]) {
        init[b.systemId] = { 
          status: "completed", 
          progress: 100, 
          latestResult: b.result, 
          answeredCount 
        };
      } else {
        init[b.systemId] = { 
          status: "completed", 
          progress: 100, 
          latestResult: b.result, 
          answeredCount 
        };
      }
    });
    return init;
  });

  const [assessmentAnswers, setAssessmentAnswers] = useState(() => readAssessmentAnswers(orgId));
  const [currentAssessmentSystem, setCurrentAssessmentSystem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSystemDetails, setSelectedSystemDetails] = useState(null);
  const [realTimeProgress, setRealTimeProgress] = useState(() => readAssessmentProgress(orgId));

  const handleClose = useCallback(() => {
    setShowDetailModal(false);
    
    setTimeout(() => setSelectedSystemDetails(null), 320);
  }, []);
  
  const assessmentAnswersRef = useRef(readAssessmentAnswers(orgId));
  
  const getCurrentAnswers = () => {
    return Object.keys(assessmentAnswersRef.current).length > 0 
      ? assessmentAnswersRef.current 
      : assessmentAnswers;
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered by assessmentAnswers change');
    const currentAnswers = getCurrentAnswers();
    
    setSystemStates((prev) => {
      console.log('⚡ Force updating systemStates from useEffect');
      const next = {};
      
      SYSTEMS.forEach((s) => {
        const answeredCount = calculateAnsweredCount(currentAnswers, s.id);
        const currentState = prev[s.id] || { status: "not-started", progress: 0, latestResult: null, answeredCount: 0 };
        const hasExistingResult = currentState.latestResult;
        
        const newStatus = hasExistingResult ? "completed" : 
                        answeredCount > 0 ? "ready-to-run" : "not-started";
        
        console.log(`🔧 Force update ${s.id}: ${currentState.answeredCount} -> ${answeredCount}, ${currentState.status} -> ${newStatus}`);
        
        next[s.id] = {
          status: newStatus,
          progress: currentState.progress || 0,
          latestResult: currentState.latestResult || null,
          answeredCount: answeredCount,
          lastUpdate: Date.now() // Force re-render trigger
        };
      });
      
      return next;
    });
  }, [assessmentAnswers, assessmentAnswersRef.current]);

  function persistAndBroadcast(newList) {
    const all = readAll();
    all[orgId] = newList;
    writeAll(all);
    setRecent(newList);

    // update systemStates including answeredCount using LIVE answers
    const byLatest = summarizeSystems(newList);
    const currentAnswers = getCurrentAnswers(); // Use live answers from Assessment component
    setSystemStates((prev) => {
      const next = { ...prev };
      SYSTEMS.forEach((s) => {
        const answeredCount = calculateAnsweredCount(currentAnswers, s.id);
        next[s.id] = next[s.id] || { 
          status: "not-started", 
          progress: 0, 
          latestResult: null, 
          answeredCount 
        };
        // Update answeredCount even if already exists
        next[s.id].answeredCount = answeredCount;
      });
      byLatest.forEach((b) => {
        const answeredCount = calculateAnsweredCount(currentAnswers, b.systemId);
        next[b.systemId] = { 
          status: "completed", 
          progress: 100, 
          latestResult: b.result, 
          answeredCount 
        };
      });
      return next;
    });

    // emit update event for DashboardHome and other components
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:update", { detail: { orgId, assessments: newList } }));
      console.log(`📡 Assessments: Dispatched update event for ${newList.length} assessments`);
    } catch {}
    // BroadcastChannel for cross-tab (optional)
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("conseqx_assessments");
        bc.postMessage({ type: "assessments:update", orgId, assessments: newList });
        bc.close();
        console.log(`📡 Assessments: Broadcast update for ${newList.length} assessments`);
      }
    } catch {}
  }

  // handle completion event (from Assessment/System pages)
  function handleAssessmentComplete(result = {}) {
    const normalized = {
      id: result.id || `A-${Date.now().toString(36)}`,
      systemId: result.systemId || result.system || "general",
      title: result.title || result.name || (result.systemId || "Assessment"),
      score: typeof result.score === "number" ? result.score : result.score ? Number(result.score) : null,
      owner: result.owner || (user && user.name) || "Unknown",
      meta: result.meta || {},
      timestamp: result.timestamp || Date.now(),
      orgId,
      notes: result.notes || "",
    };

    const newList = addAssessmentForOrg(orgId, normalized, 200);
    persistAndBroadcast(newList);

    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:completed", { 
        detail: { 
          orgId, 
          assessment: normalized, 
          systemId: normalized.systemId,
          score: normalized.score 
        } 
      }));
      console.log(`🎉 Assessments: Assessment completed for system ${normalized.systemId} with score ${normalized.score}%`);
    } catch {}

    try {
      orgHealth.ingestAssessment(normalized);
    } catch (e) {
      // non-fatal
      console.error("Error ingesting assessment into orgHealth service", e);
    }
  }

  // handle incoming events
  useEffect(() => {
    function onCompleted(e) {
      const result = e?.detail;
      if (!result || (result.orgId && result.orgId !== orgId)) return;
      handleAssessmentComplete(result);
    }
    function onProgress(e) {
      const { systemId, progress } = e?.detail || {};
      if (!systemId) return;
      setSystemStates((prev) => {
        const cur = prev[systemId] || { status: "not-started", progress: 0, latestResult: null };
        const nextState = {
          ...prev,
          [systemId]: {
            ...cur,
            status: progress >= 100 ? "completed" : "in-progress",
            progress: Math.max(0, Math.min(100, progress)),
          },
        };
        
        if (progress >= 100 && e.detail?.result) {
          handleAssessmentComplete(e.detail.result);
        }
        return nextState;
      });
    }

    function onAssessmentStart(e) {
      const { systemId } = e?.detail || {};
      if (!systemId) return;
      setCurrentAssessmentSystem(systemId);
      // Do not set analysis status to in-progress when user opens the assessment.
      // "in-progress" should only reflect the AI analysis run, not question answering.
      // We'll keep the current status here.
    }

    function onQuestionAnswered(e) {
      const { systemId, questionId, answer, totalQuestions, answeredCount } = e?.detail || {};
      if (!systemId) return;
      
      // Calculate real-time progress based on actual answered count from Assessment.js
      const realAnsweredCount = answeredCount || 0;
      const progress = totalQuestions > 0 ? Math.round((realAnsweredCount / totalQuestions) * 100) : 0;
      
      // Update real-time progress tracking
      setRealTimeProgress((prev) => {
        const updated = {
          ...prev,
          [systemId]: progress,
        };
        // Persist progress
        writeAssessmentProgress(orgId, updated);
        return updated;
      });
      
      // Update system state with real progress and answeredCount from the event
      setSystemStates((prev) => {
        const currentState = prev[systemId] || {};
        const hasExistingResult = currentState.latestResult;
        
        return {
          ...prev,
          [systemId]: {
            ...currentState,
            // IMMEDIATELY unlock Run button when ANY question is answered
            status: hasExistingResult ? "completed" : 
                    realAnsweredCount > 0 ? "ready-to-run" : "not-started",
            // Keep analysis progress separate from question answering progress
            progress: currentState.progress || 0,
            answeredCount: realAnsweredCount,
          },
        };
      });
      
      // Emit progress event for other components
      events.emitAssessmentProgress({ orgId, systemId, progress, answeredCount: realAnsweredCount });
    }

    window.addEventListener("conseqx:assessment:completed", onCompleted);
    window.addEventListener("conseqx:assessment:progress", onProgress);
    window.addEventListener("conseqx:assessment:start", onAssessmentStart);
    window.addEventListener("conseqx:assessment:question-answered", onQuestionAnswered);
    
    return () => {
      window.removeEventListener("conseqx:assessment:completed", onCompleted);
      window.removeEventListener("conseqx:assessment:progress", onProgress);
      window.removeEventListener("conseqx:assessment:start", onAssessmentStart);
      window.removeEventListener("conseqx:assessment:question-answered", onQuestionAnswered);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // also listen for BroadcastChannel updates (cross-tab)
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const bc = new BroadcastChannel("conseqx_assessments");
    const handler = (ev) => {
      try {
        const { type, orgId: msgOrg, payload } = ev.data || {};
        if (type === "assessments:update" && msgOrg === orgId) {
          setRecent(payload || []);
          // update systemStates derived including answeredCount using LIVE answers
          const byLatest = summarizeSystems(payload || []);
          const currentAnswers = getCurrentAnswers(); // Use live answers
          setSystemStates((prev) => {
            const next = { ...prev };
            SYSTEMS.forEach((s) => {
              const answeredCount = calculateAnsweredCount(currentAnswers, s.id);
              next[s.id] = next[s.id] || { 
                status: "not-started", 
                progress: 0, 
                latestResult: null, 
                answeredCount 
              };
              next[s.id].answeredCount = answeredCount;
            });
            byLatest.forEach((b) => {
              const answeredCount = calculateAnsweredCount(currentAnswers, b.systemId);
              next[b.systemId] = { 
                status: "completed", 
                progress: 100, 
                latestResult: b.result, 
                answeredCount 
              };
            });
            return next;
          });
        }
      } catch (e) {}
    };
    bc.addEventListener("message", handler);
    return () => bc.close();
  }, [orgId]);

  // Sync with localStorage changes for real-time updates
  useEffect(() => {
    const syncFromStorage = () => {
      const persistentProgress = readAssessmentProgress(orgId);
      setRealTimeProgress(persistentProgress);
      
      // Update system states with current answered counts from LIVE state
      const currentAnswers = getCurrentAnswers(); // Use live answers from Assessment
      setSystemStates((prev) => {
        const next = { ...prev };
        SYSTEMS.forEach((s) => {
          const answeredCount = calculateAnsweredCount(currentAnswers, s.id);
          if (next[s.id]) {
            next[s.id] = {
              ...next[s.id],
              answeredCount,
              // Update status based on answers and current state
              status: next[s.id].latestResult ? "completed" : 
                      answeredCount > 0 ? "ready-to-run" : "not-started"
            };
          }
        });
        return next;
      });
    };

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === ANSWERS_STORAGE_KEY || e.key === PROGRESS_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Periodic sync to catch any missed updates
    const syncInterval = setInterval(syncFromStorage, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, [orgId]);

  // Prevent accidental navigation during active assessment
  useEffect(() => {
    const hasActiveAssessment = Object.values(systemStates).some(state => 
      (state.answeredCount || 0) > 0 && !state.latestResult
    );

    const handleBeforeUnload = (e) => {
      if (hasActiveAssessment) {
        e.preventDefault();
        e.returnValue = 'You have unsaved assessment progress. Are you sure you want to leave?';
        return 'You have unsaved assessment progress. Are you sure you want to leave?';
      }
    };

    if (hasActiveAssessment) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [systemStates]);

  /* ---------- Actions invoked by the panel ---------- */

  // onStart: if real system page is active, you should route there; else we simulate a run here.
  function onStart(systemId) {
    const cur = systemStates[systemId];
    // if in-progress and <100 do nothing
    if (cur && cur.status === "in-progress" && cur.progress < 100) return;

    // Check if user has answered questions - this should always be true if button is enabled
    const hasAnswers = (cur?.answeredCount || 0) > 0;
    if (!hasAnswers) {
      console.warn('Run button clicked but no answers found. This should not happen.');
      return;
    }

    // Mark as in-progress IMMEDIATELY when Run is clicked
    setSystemStates((prev) => ({
      ...prev,
      [systemId]: {
        ...prev[systemId],
        status: "in-progress",
        progress: 1 // Start at 1% to show analysis has begun
      }
    }));

    // Emit start event
    events.emitAssessmentStart({ systemId, orgId });

    // if no other component will handle start, we simulate progress here and complete a deterministic result
    simulateRunIfNoHandler(systemId);
  }

  // onView: show report for latestResult - can open slide-over or navigate to report page
  function onView(systemId) {
    const state = systemStates[systemId];
    if (!state || !state.latestResult) return;
    
    // Find the system details
    const systemDetails = SYSTEMS.find(s => s.id === systemId);
    if (systemDetails) {
      // Enrich modal with per-sub-assessment answers and progress
      const allAnswers = getCurrentAnswers();
      const sysDef = assessmentSystems.find(s => s.id === systemId);
      const perSubAnswers = {};
      sysDef?.subAssessments?.forEach(sub => {
        if (allAnswers[sub.id]) perSubAnswers[sub.id] = allAnswers[sub.id];
      });
      // Calculate progress per sub-assessment
      const subProgress = sysDef?.subAssessments?.map(sub => {
        const total = sub.questions.length;
        const answered = perSubAnswers[sub.id] ? Object.keys(perSubAnswers[sub.id]).filter(k => {
          const a = perSubAnswers[sub.id][k];
          return a !== null && a !== undefined && a !== '';
        }).length : 0;
        return { id: sub.id, title: sub.title, answered, total };
      }) || [];

      const details = {
        ...systemDetails,
        result: state.latestResult,
        answers: perSubAnswers,
        subProgress,
      };
      // don't reopen if already showing same result (prevents flicker)
      if (showDetailModal && selectedSystemDetails && selectedSystemDetails.result?.id === state.latestResult.id) return;
      setSelectedSystemDetails(details);
      // open synchronously; details will be cleared after exit animation by handleClose
      setShowDetailModal(true);
    }
    
    // Also dispatch event for other components
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:view", { detail: { result: state.latestResult } }));
    } catch {}
  }

  function onRemove(id) {
    const next = removeAssessmentForOrg(orgId, id);
    persistAndBroadcast(next);
  }

  // Simulation: if nobody handles start event within a short time, run an internal simulated run
  function simulateRunIfNoHandler(systemId) {
    // Already marked as in-progress in onStart function
    
    // simulate progress increments until 100
    let pct = 1;
    const ticker = setInterval(() => {
      pct = Math.min(100, pct + Math.round(5 + Math.random() * 15));
      
      // Update progress in real-time
      setSystemStates((prev) => ({
        ...prev,
        [systemId]: {
          ...prev[systemId],
          status: pct >= 100 ? "completed" : "in-progress",
          progress: pct
        }
      }));
      
      // dispatch progress event (so all listeners get updated)
      events.emitAssessmentProgress({ orgId, systemId, progress: pct });
      
      if (pct >= 100) {
        clearInterval(ticker);
        // ── Rubrics-based scoring: compute score from actual user answers ──
        try {
          const allAnswers = getCurrentAnswers();
          const sysDef = assessmentSystems.find(s => s.id === systemId);

          if (!sysDef) throw new Error(`System definition not found for ${systemId}`);

          let totalScore = 0;
          let maxPossibleScore = 0;
          const subScores = [];

          sysDef.subAssessments.forEach(sub => {
            const subAnswers = allAnswers[sub.id] || {};
            let subScore = 0;
            const maxPerQuestion = Math.max(...sub.scoringRubric.map(r => r.score));

            sub.questions.forEach((_, idx) => {
              const answerLabel = subAnswers[idx];
              if (answerLabel) {
                const rubricItem = sub.scoringRubric.find(r => r.label === answerLabel);
                if (rubricItem) subScore += rubricItem.score;
              }
            });

            const subMax = sub.questions.length * maxPerQuestion;
            totalScore += subScore;
            maxPossibleScore += subMax;

            // Per-sub interpretation
            const subInterpretation = (sub.scoreInterpretation || []).find(
              b => subScore >= b.range[0] && subScore <= b.range[1]
            );

            subScores.push({
              id: sub.id,
              title: sub.title,
              score: subScore,
              max: subMax,
              percent: subMax > 0 ? Math.round((subScore / subMax) * 100) : 0,
              interpretation: subInterpretation || null
            });
          });

          // Overall percentage
          const scorePercent = maxPossibleScore > 0
            ? Math.round((totalScore / maxPossibleScore) * 100)
            : 0;

          // Overall interpretation from totalScoreInterpretation
          const overallInterpretation = (sysDef.totalScoreInterpretation || []).find(
            b => totalScore >= b.range[0] && totalScore <= b.range[1]
          );

          const result = {
            id: `A-${Date.now().toString(36)}`,
            systemId,
            title: `${sysDef.title} Assessment`,
            score: scorePercent,
            rawScore: totalScore,
            maxScore: maxPossibleScore,
            coverage: maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0,
            timestamp: Date.now(),
            orgId,
            meta: {
              simulated: false,
              rubricsBased: true,
              subScores,
              interpretation: overallInterpretation || { rating: 'N/A', interpretation: 'Score outside defined ranges.' },
              totalScore,
              maxPossibleScore
            }
          };

          console.log(`✅ Rubrics-based score for ${systemId}: ${scorePercent}% (${totalScore}/${maxPossibleScore})`, subScores);
          events.emitAssessmentCompleted(result);
        } catch (error) {
          console.error('Assessment scoring failed:', error);
          // Reset state on error
          setSystemStates((prev) => ({
            ...prev,
            [systemId]: {
              ...prev[systemId],
              status: "ready-to-run",
              progress: 0
            }
          }));
        }
      }
    }, 600); // Slightly faster updates for better UX
  }

  // derived KPIs
  const kpis = useMemo(() => {
    const count = recent.length;
    const avgScore = count ? Math.round(recent.reduce((s, r) => s + (Number(r.score) || 0), 0) / count) : null;
    const lastRun = recent[0]?.timestamp || null;
    return { count, avgScore, lastRun };
  }, [recent]);

  // Detailed Assessment Modal Component
  // Always-mounted modal that shows/hides its content based on `isOpen` to avoid mount/unmount flicker
  const DetailedAssessmentModal = ({ isOpen }) => {
    if (!selectedSystemDetails && !isOpen) return null;

  const { title, result, icon, answers, subProgress } = selectedSystemDetails || {};
    const score = result?.score || 0;
    const timestamp = result?.timestamp;
    const rubricSubScores = result?.meta?.subScores || [];
    const overallInterpretation = result?.meta?.interpretation || null;

    // Generate recommendations from rubric interpretation data
    const aiRecommendations = (() => {
      if (rubricSubScores.length > 0) {
        // Build real recommendations from sub-assessment interpretations
        return rubricSubScores
          .filter(ss => ss.interpretation)
          .map(ss => `${ss.title}: ${ss.interpretation.interpretation || ss.interpretation.rating || 'Review needed'}`)
          .slice(0, 6);
      }
      // Fallback generic recommendations
      return [
        "Implement structured feedback loops to improve communication",
        "Establish clear performance metrics and tracking systems",
        "Develop cross-functional collaboration protocols",
        "Create standardized training programs for consistency"
      ];
    })();

    const caseStudy = {
      company: "Dangote Group (Nigeria)",
      challenge: `Similar challenges in ${title.toLowerCase()} across multiple business units`,
      solution: "Implemented centralized governance framework with decentralized execution",
      result: "35% improvement in operational efficiency within 18 months",
      keyLessons: [
        "Standardized processes while maintaining local flexibility",
        "Invested in technology infrastructure for real-time monitoring",
        "Created cross-functional teams to break down silos"
      ]
    };

    return (
      <AnimatePresence>
        {isOpen && selectedSystemDetails && (
          <motion.div
            key={selectedSystemDetails.result?.id || 'detail-modal'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className={`sticky top-0 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {icon}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                    {title} Assessment Results
                  </h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Completed {timestamp ? new Date(timestamp).toLocaleString() : 'Recently'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Overview */}
              <div className={`rounded-xl p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Overall Score</h3>
                  <div className={`text-2xl font-bold ${score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                    {score}%
                  </div>
                </div>
                <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                {result?.rawScore != null && (
                  <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Raw score: {result.rawScore} / {result.maxScore} points
                  </p>
                )}
                {overallInterpretation && overallInterpretation.rating !== 'N/A' && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    score >= 80 ? (darkMode ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-green-200") :
                    score >= 60 ? (darkMode ? "bg-yellow-900/20 border-yellow-500/30" : "bg-yellow-50 border-yellow-200") :
                    (darkMode ? "bg-red-900/20 border-red-500/30" : "bg-red-50 border-red-200")
                  }`}>
                    <p className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                      {overallInterpretation.rating}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {overallInterpretation.interpretation}
                    </p>
                  </div>
                )}
              </div>

              {/* Sub-assessments with progress and answers */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Assessment Breakdown
                </h3>
                <div className="space-y-3">
                  {subProgress.map((sub, index) => {
                    const rubricData = rubricSubScores.find(rs => rs.id === sub.id);
                    return (
                    <div key={sub.id} className={`p-4 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{sub.title}</h4>
                        <div className="flex items-center gap-3">
                          {rubricData && (
                            <span className={`text-sm font-bold ${
                              rubricData.percent >= 80 ? "text-green-500" : rubricData.percent >= 60 ? "text-yellow-500" : "text-red-500"
                            }`}>
                              {rubricData.percent}%
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <FaCheckCircle className="text-green-500" size={14} />
                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {sub.answered}/{sub.total}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full mb-2">
                        <ProgressBar pct={rubricData ? rubricData.percent : (sub.total > 0 ? Math.round((sub.answered / sub.total) * 100) : 0)} darkMode={darkMode} />
                      </div>
                      {rubricData && (
                        <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Score: {rubricData.score} / {rubricData.max} points
                        </p>
                      )}
                      {rubricData?.interpretation && (
                        <p className={`text-xs italic mb-2 ${
                          rubricData.percent >= 80 ? (darkMode ? "text-green-400" : "text-green-600") :
                          rubricData.percent >= 60 ? (darkMode ? "text-yellow-400" : "text-yellow-600") :
                          (darkMode ? "text-red-400" : "text-red-600")
                        }`}>
                          {rubricData.interpretation.rating} — {rubricData.interpretation.interpretation}
                        </p>
                      )}
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Responses:</p>
                      <ul className="list-disc list-inside ml-4">
                        {Object.entries(answers[sub.id] || {}).map(([qid, val]) => (
                          <li key={qid} className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Q{Number(qid) + 1}: <span className="font-semibold">{val}</span></li>
                        ))}
                      </ul>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* X Ultra Recommendations */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  <FaLightbulb className="text-yellow-500" />
                  X Ultra Recommendations
                </h3>
                <div className="space-y-2">
                  {aiRecommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg ${darkMode ? "bg-blue-900/20 border-blue-500/30" : "bg-blue-50 border-blue-200"} border`}>
                      <p className={`text-sm ${darkMode ? "text-blue-200" : "text-blue-800"}`}>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* African Company Case Study */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  <FaBuilding className="text-green-500" />
                  African Success Story
                </h3>
                <div className={`rounded-xl p-4 border ${darkMode ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-green-200"}`}>
                  <div className="space-y-3">
                    <div>
                      <h4 className={`font-semibold ${darkMode ? "text-green-200" : "text-green-800"}`}>{caseStudy.company}</h4>
                      <p className={`text-sm mt-1 ${darkMode ? "text-green-300" : "text-green-700"}`}>{caseStudy.challenge}</p>
                    </div>
                    
                    <div>
                      <h5 className={`font-medium ${darkMode ? "text-green-200" : "text-green-800"}`}>Solution:</h5>
                      <p className={`text-sm ${darkMode ? "text-green-300" : "text-green-700"}`}>{caseStudy.solution}</p>
                    </div>
                    
                    <div>
                      <h5 className={`font-medium ${darkMode ? "text-green-200" : "text-green-800"}`}>Result:</h5>
                      <p className={`text-sm ${darkMode ? "text-green-300" : "text-green-700"}`}>{caseStudy.result}</p>
                    </div>
                    
                    <div>
                      <h5 className={`font-medium ${darkMode ? "text-green-200" : "text-green-800"}`}>Key Lessons:</h5>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {caseStudy.keyLessons.map((lesson, index) => (
                          <li key={index} className={`text-sm ${darkMode ? "text-green-300" : "text-green-700"}`}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    );
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
       

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`${darkMode ? "text-gray-200" : "text-sm text-gray-700"}`}>
            <div>
              Recent runs: <span className="font-semibold">{kpis.count}</span>
            </div>
            <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-500"}`}>Avg score: {kpis.avgScore !== null ? `${kpis.avgScore}%` : "—"}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
          <div className={`rounded-xl p-1 sm:p-3 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"} shadow-sm overflow-x-hidden`}>
            {/* Embedded Assessment component: it should call onComplete when it finishes */}
            {/* Pass darkMode prop + key to force remount on theme change so internal theme state can't diverge */}
            <Assessment
              key={darkMode ? "assessment-dark" : "assessment-light"}
              darkMode={darkMode}
              onComplete={(res) => handleAssessmentComplete(res)}
              onAnswersChange={(answers) => {
                console.log('🚀 onAnswersChange called with:', answers);
                
                // Track the actual answer state from Assessment.js
                assessmentAnswersRef.current = answers;
                setAssessmentAnswers(answers);
                
                // FORCE IMMEDIATE update of system states with new answered counts
                setSystemStates((prev) => {
                  console.log('⚡ Updating systemStates from onAnswersChange');
                  const next = {}; // Create completely new object to force re-render
                  
                  SYSTEMS.forEach((s) => {
                    const answeredCount = calculateAnsweredCount(answers, s.id);
                    const currentState = prev[s.id] || { status: "not-started", progress: 0, latestResult: null, answeredCount: 0 };
                    const hasExistingResult = currentState.latestResult;
                    
                    // Determine new status based on answers and existing results
                    const newStatus = hasExistingResult ? "completed" : 
                                    answeredCount > 0 ? "ready-to-run" : "not-started";
                    
                    console.log(`📊 System ${s.id}: ${currentState.answeredCount} -> ${answeredCount} answers, ${currentState.status} -> ${newStatus}`);
                    
                    next[s.id] = {
                      status: newStatus,
                      progress: currentState.progress || 0,
                      latestResult: currentState.latestResult || null,
                      answeredCount: answeredCount,
                      // Add timestamp to force re-renders
                      lastUpdate: Date.now()
                    };
                  });
                  
                  console.log('✅ New systemStates:', next);
                  return next; // Always return new object
                });
                
                // Persist answers for cross-tab sync
                writeAssessmentAnswers(orgId, answers);
              }}
              onQuestionAnswered={(data) => {
                console.log('📝 onQuestionAnswered called:', data);
                
                // IMMEDIATE state update - don't wait for events
                if (data.systemId && data.answeredCount !== undefined) {
                  setSystemStates((prev) => {
                    const currentState = prev[data.systemId] || { status: "not-started", progress: 0, latestResult: null, answeredCount: 0 };
                    const hasExistingResult = currentState.latestResult;
                    const newStatus = hasExistingResult ? "completed" : 
                                    data.answeredCount > 0 ? "ready-to-run" : "not-started";
                    
                    console.log(`🚀 IMMEDIATE update ${data.systemId}: ${currentState.answeredCount} -> ${data.answeredCount}`);
                    
                    return {
                      ...prev,
                      [data.systemId]: {
                        ...currentState,
                        answeredCount: data.answeredCount,
                        status: newStatus,
                        lastUpdate: Date.now()
                      }
                    };
                  });
                }
                
                // Emit real-time progress event with enhanced data
                window.dispatchEvent(new CustomEvent("conseqx:assessment:question-answered", { 
                  detail: {
                    ...data,
                    orgId,
                    timestamp: Date.now()
                  }
                }));
              }}
              onSystemStart={(systemId) => {
                // Emit system start event
                window.dispatchEvent(new CustomEvent("conseqx:assessment:start", { 
                  detail: { 
                    systemId, 
                    orgId,
                    timestamp: Date.now()
                  } 
                }));
              }}
              showClientInfo={false}
              customSystems={createAssessmentSystems()}
              ceoPartnerMode={true}
              orgId={orgId}
              // Pass current answers to maintain state
              initialAnswers={assessmentAnswers}
              // Enable real-time progress tracking
              enableRealTimeTracking={true}
              // Action handlers for inline system card buttons
              systemStates={(() => {
                const states = {};
                const currentAnswers = getCurrentAnswers();
                SYSTEMS.forEach((s) => {
                  const realTimeAnsweredCount = calculateAnsweredCount(currentAnswers, s.id);
                  const currentState = systemStates[s.id] || { status: "not-started", progress: 0, latestResult: null, answeredCount: 0 };
                  states[s.id] = {
                    ...currentState,
                    answeredCount: Math.max(currentState.answeredCount || 0, realTimeAnsweredCount),
                    status: currentState.status === "in-progress" ? "in-progress" :
                            currentState.latestResult ? "completed" :
                            realTimeAnsweredCount > 0 ? "ready-to-run" : "not-started",
                    progress: currentState.progress || 0
                  };
                });
                return states;
              })()}
              onRunAnalysis={onStart}
              onViewResults={onView}
              onRemoveResult={onRemove}
            />
          </div>
      </div>
      
  {/* Detailed Assessment Modal (mounted always, visibility controlled by isOpen) */}
  <DetailedAssessmentModal isOpen={showDetailModal} />
    </section>
  );
}
