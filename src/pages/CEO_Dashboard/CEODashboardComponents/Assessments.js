import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Assessment from "../../../Assessment";
import { FaHistory, FaTrash, FaPlay, FaEye } from "react-icons/fa";
import { getSystemsForUI, normalizeSystemKey } from "../constants/systems";
import * as events from "../lib/events";
import * as svc from "../services/serviceSelector";

/* ---------- constants: the 6 systems (canonical) ---------- */
const SYSTEMS = getSystemsForUI();

const STORAGE_KEY = "conseqx_assessments_v1";
// Remove ad-hoc ML hooks here; real analysis is handled via services layer when needed

/* ---------- storage helpers ---------- */
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

function SystemRow({ s, state, onStart, onView, onRemove, darkMode = false }) {
  // state = { status: "not-started"|"in-progress"|"completed", progress, latestResult }
  const muted = state.status === "not-started";
  const score = state.latestResult?.score ?? null;

  const rowBgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const titleColor = darkMode ? "text-gray-100" : "text-gray-900";
  const metaColor = darkMode ? "text-gray-400" : "text-gray-500";

  const runDisabled = state.status === "in-progress" && state.progress < 100;
  const runBtnBase = runDisabled
    ? `${darkMode ? "bg-gray-800 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`
    : `${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"}`;

  const viewDisabled = state.status !== "completed";
  const viewBtnBase = viewDisabled
    ? `${darkMode ? "bg-gray-900/20 text-gray-500 cursor-not-allowed" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`
    : `${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"}`;

  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-md ${muted ? "opacity-60" : ""} ${rowBgHover}`}>
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
            {state.status === "not-started" && "Not started"}
            {state.status === "in-progress" && `Progress: ${state.progress}%`}
            {state.status === "completed" && `Completed ${new Date(state.latestResult.timestamp).toLocaleString()}`}
          </div>

          {state.status === "in-progress" && (
            <div className="mt-2">
              <ProgressBar pct={state.progress} darkMode={darkMode} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onStart(s.id)}
          disabled={runDisabled}
          title={runDisabled ? "Wait for current run to finish" : "Start / Run assessment"}
          className={`px-3 py-2 rounded-md border ${runBtnBase}`}
        >
          <FaPlay className="inline-block mr-2" />
          {runDisabled ? "Running..." : "Run"}
        </button>

        <button
          onClick={() => onView(s.id)}
          disabled={viewDisabled}
          className={`px-3 py-2 rounded-md border ${viewBtnBase}`}
        >
          <FaEye />
        </button>

        {state.latestResult && (
          <button
            onClick={() => onRemove(state.latestResult.id)}
            className={`px-2 py-2 rounded-md text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            title="Remove"
          >
            <FaTrash />
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

  // Broadcast parent theme changes as an event so nested components can optionally subscribe
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("conseqx:theme:changed", { detail: { darkMode } }));
    } catch {}
  }, [darkMode]);

  // recent are persisted assessment records for this org (chronological newest first)
  const [recent, setRecent] = useState(() => {
    try {
      const all = readAll();
      return all[orgId] || [];
    } catch {
      return [];
    }
  });

  // systemStates maps systemId -> { status, progress, latestResult }
  const [systemStates, setSystemStates] = useState(() => {
    // derive initial state from recent items
    const init = {};
    SYSTEMS.forEach((s) => {
      init[s.id] = { status: "not-started", progress: 0, latestResult: null };
    });
    const byLatest = summarizeSystems(recent);
    byLatest.forEach((b) => {
      if (!init[b.systemId]) init[b.systemId] = { status: "completed", progress: 100, latestResult: b.result };
      else init[b.systemId] = { status: "completed", progress: 100, latestResult: b.result };
    });
    return init;
  });

  // Broadcast update helper (persist + set state + broadcast event)
  function persistAndBroadcast(newList) {
    const all = readAll();
    all[orgId] = newList;
    writeAll(all);
    setRecent(newList);

    // update systemStates
    const byLatest = summarizeSystems(newList);
    setSystemStates((prev) => {
      const next = { ...prev };
      SYSTEMS.forEach((s) => {
        next[s.id] = next[s.id] || { status: "not-started", progress: 0, latestResult: null };
      });
      byLatest.forEach((b) => {
        next[b.systemId] = { status: "completed", progress: 100, latestResult: b.result };
      });
      return next;
    });

    // emit update event
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessments:updated", { detail: { orgId, list: newList } }));
    } catch {}
    // BroadcastChannel for cross-tab (optional)
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("conseqx_assessments");
        bc.postMessage({ type: "assessments:update", orgId, payload: newList });
        bc.close();
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
        // if completed and we have result in event, call handleAssessmentComplete (if detail includes result)
        if (progress >= 100 && e.detail?.result) {
          handleAssessmentComplete(e.detail.result);
        }
        return nextState;
      });
    }

    window.addEventListener("conseqx:assessment:completed", onCompleted);
    window.addEventListener("conseqx:assessment:progress", onProgress);
    return () => {
      window.removeEventListener("conseqx:assessment:completed", onCompleted);
      window.removeEventListener("conseqx:assessment:progress", onProgress);
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
          // update systemStates derived
          const byLatest = summarizeSystems(payload || []);
          setSystemStates((prev) => {
            const next = { ...prev };
            SYSTEMS.forEach((s) => {
              next[s.id] = next[s.id] || { status: "not-started", progress: 0, latestResult: null };
            });
            byLatest.forEach((b) => (next[b.systemId] = { status: "completed", progress: 100, latestResult: b.result }));
            return next;
          });
        }
      } catch (e) {}
    };
    bc.addEventListener("message", handler);
    return () => bc.close();
  }, [orgId]);

  /* ---------- Actions invoked by the panel ---------- */

  // onStart: if real system page is active, you should route there; else we simulate a run here.
  function onStart(systemId) {
    const cur = systemStates[systemId];
    // if in-progress and <100 do nothing
    if (cur && cur.status === "in-progress" && cur.progress < 100) return;

    // if already completed, allow new run; otherwise start run
    // Ideally you should navigate to the system-specific assessment UI here:
    // navigate(`/system/${systemId}`) or open slide-over; for now emit an event
    events.emitAssessmentStart({ systemId, orgId });

    // if no other component will handle start, we simulate progress here and complete a deterministic result
    simulateRunIfNoHandler(systemId);
  }

  // onView: show report for latestResult - can open slide-over or navigate to report page
  function onView(systemId) {
    const state = systemStates[systemId];
    if (!state || !state.latestResult) return;
    // open modal/slide-over - for now dispatch event other components can catch
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
    // mark in-progress
    setSystemStates((prev) => ({ ...prev, [systemId]: { ...(prev[systemId] || {}), status: "in-progress", progress: 1 } }));

    // simulate progress increments until 100
    let pct = 1;
    const ticker = setInterval(() => {
      pct = Math.min(100, pct + Math.round(5 + Math.random() * 12));
      // dispatch progress event (so all listeners get updated)
      events.emitAssessmentProgress({ orgId, systemId, progress: pct });
      if (pct >= 100) {
        clearInterval(ticker);
        // produce a deterministic result via service selector (mock or API)
        (async () => {
          const result = await svc.runAssessment(orgId, systemId);
          events.emitAssessmentCompleted(result);
        })();
      }
    }, 800);
  }

  // derived KPIs
  const kpis = useMemo(() => {
    const count = recent.length;
    const avgScore = count ? Math.round(recent.reduce((s, r) => s + (Number(r.score) || 0), 0) / count) : null;
    const lastRun = recent[0]?.timestamp || null;
    return { count, avgScore, lastRun };
  }, [recent]);

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg font-semibold`}>Assessments</h2>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Run or view system assessments. Systems update in real-time as runs progress and complete.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${darkMode ? "text-gray-200" : "text-sm text-gray-700"}`}>
            <div>
              Recent runs: <span className="font-semibold">{kpis.count}</span>
            </div>
            <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-500"}`}>Avg score: {kpis.avgScore !== null ? `${kpis.avgScore}%` : "—"}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`rounded-2xl p-4 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
            {/* Embedded Assessment component: it should call onComplete when it finishes */}
            {/* Pass darkMode prop + key to force remount on theme change so internal theme state can't diverge */}
            <Assessment
              key={darkMode ? "assessment-dark" : "assessment-light"}
              darkMode={darkMode}
              onComplete={(res) => handleAssessmentComplete(res)}
              showClientInfo={false}
            />
          </div>
        </div>

        <aside className={`rounded-2xl p-4 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Systems</div>
            <div className={`${darkMode ? "text-xs text-gray-400" : "text-xs text-gray-500"} flex items-center gap-2`}>
              <FaHistory /> <span>{recent.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            {SYSTEMS.map((s) => (
              <SystemRow
                key={s.id}
                s={s}
                state={systemStates[s.id] || { status: "not-started", progress: 0, latestResult: null }}
                onStart={onStart}
                onView={onView}
                onRemove={onRemove}
                darkMode={darkMode}
              />
            ))}
          </div>

          <div className={`mt-4 border-t pt-3 ${darkMode ? "text-xs text-gray-400 border-gray-800" : "text-xs text-gray-500"}`}>
            Systems show progress if a run is active. Run is disabled while a run is still in progress (100%).
          </div>
        </aside>
      </div>
    </section>
  );
}
