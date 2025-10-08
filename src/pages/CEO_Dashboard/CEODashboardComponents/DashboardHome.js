// File: src/pages/CEO_Dashboard/DashboardHome.jsx
import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as svc from "../services/serviceSelector";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";
import { FaEye, FaBrain } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";

const UPLOADS_KEY = "conseqx_uploads_v1";

/**
 * DashboardHome (cleaned + simplified snapshot)
 * - No duplication of OrgHealth.
 * - Systems snapshot simplified.
 * - Assessed systems show "Retake assessment" CTA with tooltip.
 * - Removed 'Based on', Refresh and Export controls.
 */

function KPICard({ title, value, hint, darkMode }) {
  return (
    <div
      className={`rounded-lg p-4 border ${
        darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      <div className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs mt-1`}>{hint}</div>}
    </div>
  );
}

/* Simple progress bar component */
function BlueProgress({ pct = 0, darkMode = false }) {
  const safe = Math.max(0, Math.min(100, Math.round(pct || 0)));
  
  return (
    <div className="w-full">
      <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
        <div 
          style={{ width: `${safe}%` }} 
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
        />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { darkMode, org } = useOutletContext();
  const auth = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = React.useState(null);
  const [latestUpload, setLatestUpload] = React.useState(null);
  const [systemScoresFromUpload, setSystemScoresFromUpload] = React.useState({});
  const [showQuickModal, setShowQuickModal] = React.useState(false);
  const [quickModalPayload, setQuickModalPayload] = React.useState(null);
  const [lastRefresh, setLastRefresh] = React.useState(Date.now());

  const USE_MOCK = true;

  // Load summary (mock)
  React.useEffect(() => {
    let mounted = true;
    if (USE_MOCK && (auth?.org?.id || org?.id)) {
      (async () => {
        try {
          const s = await svc.getDashboardSummary(auth?.org?.id || org?.id);
          if (mounted) setSummary(s);
        } catch {
          if (mounted) setSummary(null);
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [auth?.org?.id, org?.id]);

  // Load latest upload & derive simple per-system scores
  React.useEffect(() => {
    function loadLatest() {
      try {
        const raw = localStorage.getItem(UPLOADS_KEY);
        const all = raw ? JSON.parse(raw) : [];
        const latest = all && all.length ? all[0] : null;
        setLatestUpload(latest);

        // Get assessments data - this is the primary source for system scores
        const byAssessRaw = localStorage.getItem("conseqx_assessments_v1");
        const byOrg = byAssessRaw ? JSON.parse(byAssessRaw) : {};
        const orgId = auth?.org?.id || org?.id || "anon";
        const orgAssessments = byOrg[orgId] || [];
        
        console.log(`🏠 DashboardHome: Loading assessments for org ${orgId}:`, orgAssessments);

        // Group assessments by system and get the latest score for each
        const assessmentsBySystem = {};
        orgAssessments.forEach((assessment) => {
          const systemKey = normalizeSystemKey(assessment.systemId || assessment.system || assessment.systemKey || "");
          if (!systemKey) return;
          
          // Keep the most recent assessment for each system
          if (!assessmentsBySystem[systemKey] || 
              (assessment.timestamp || 0) > (assessmentsBySystem[systemKey].timestamp || 0)) {
            assessmentsBySystem[systemKey] = assessment;
          }
        });

        console.log(`🏠 DashboardHome: Processed assessments by system:`, assessmentsBySystem);

        // Build scores object for each canonical system
        const scores = {};
        CANONICAL_SYSTEMS.forEach((s) => {
          const key = s.key;
          const assessment = assessmentsBySystem[key];
          
          if (assessment && typeof assessment.score === "number" && assessment.score !== null) {
            scores[key] = Math.max(0, Math.min(100, Math.round(assessment.score)));
            console.log(`🏠 DashboardHome: System ${key} has assessment score: ${scores[key]}%`);
          } else if (latest && Array.isArray(latest.analyzedSystems) && latest.analyzedSystems.includes(key)) {
            scores[key] = 70; // heuristic from upload
            console.log(`🏠 DashboardHome: System ${key} has upload heuristic score: 70%`);
          } else {
            scores[key] = null; // not assessed
            console.log(`🏠 DashboardHome: System ${key} not assessed`);
          }
        });
        
        console.log(`🏠 DashboardHome: Final system scores:`, scores);
        setSystemScoresFromUpload(scores);
      } catch (error) {
        console.error('🏠 DashboardHome: Error loading assessment data:', error);
        setLatestUpload(null);
        setSystemScoresFromUpload({});
      }
    }

    loadLatest();
    
    // Listen for storage changes
    function onStorage(e) {
      if (!e.key || e.key === UPLOADS_KEY || e.key === "conseqx_assessments_v1") {
        console.log(`🏠 DashboardHome: Storage change detected for key: ${e.key}`);
        loadLatest();
      }
    }
    window.addEventListener("storage", onStorage);

    // Listen for custom events from Assessments.js
    function onAssessmentCompleted(e) {
      console.log(`🏠 DashboardHome: Assessment completed event:`, e.detail);
      setLastRefresh(Date.now()); // Force component refresh
      setTimeout(loadLatest, 100); // Small delay to ensure localStorage is updated
    }
    
    function onAssessmentUpdate(e) {
      console.log(`🏠 DashboardHome: Assessment update event:`, e.detail);
      setLastRefresh(Date.now()); // Force component refresh
      setTimeout(loadLatest, 100); // Small delay to ensure localStorage is updated
    }

    window.addEventListener("conseqx:assessment:completed", onAssessmentCompleted);
    window.addEventListener("conseqx:assessment:update", onAssessmentUpdate);

    // Listen for BroadcastChannel updates
    let bc;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("conseqx_assessments");
        bc.addEventListener("message", (ev) => {
          console.log(`🏠 DashboardHome: BroadcastChannel message:`, ev.data);
          if (ev?.data?.type === "assessments:update" || ev?.data?.type === "assessment:completed") {
            loadLatest();
          }
        });
      }
    } catch (error) {
      console.warn('🏠 DashboardHome: BroadcastChannel not available:', error);
    }

    // Poll for updates more frequently to catch real-time changes
    const poll = setInterval(loadLatest, 2000);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("conseqx:assessment:completed", onAssessmentCompleted);
      window.removeEventListener("conseqx:assessment:update", onAssessmentUpdate);
      if (bc) bc.close();
      clearInterval(poll);
    };
  }, [auth?.org?.id, org?.id, lastRefresh]);

  const overallScore = React.useMemo(() => {
    const vals = Object.values(systemScoresFromUpload || {});
    const sane = vals.filter((v) => v !== null && typeof v !== "undefined");
    if (!sane.length) return 0;
    const sum = sane.reduce((a, b) => a + (Number(b) || 0), 0);
    return Math.round(sum / sane.length);
  }, [systemScoresFromUpload]);

  // Quick system "view" opens modal
  function handleViewSystem(systemKey) {
    const systemInfo = CANONICAL_SYSTEMS.find((s) => s.key === systemKey) || { title: systemKey, description: "" };
    const score = systemScoresFromUpload[systemKey];
    const payload = {
      systemKey,
      title: systemInfo.title,
      description: systemInfo.description,
      score: typeof score === "number" ? score : null,
      source: latestUpload ? `Snapshot: ${latestUpload.name || latestUpload.id || "upload"}` : null,
    };
    setQuickModalPayload(payload);
    setShowQuickModal(true);
  }

  function openFullOrgHealth(systemKey) {
    try {
      window.dispatchEvent(new CustomEvent("conseqx:orghealth:open", { detail: { systemId: systemKey } }));
    } catch {}
    navigate("/ceo/org-health");
  }

  function startOrRetakeAssessment(systemKey) {
    // signal assessments page to focus and navigate
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:start", { detail: { systemId: systemKey, orgId: auth?.org?.id || org?.id } }));
    } catch {}
    navigate(`/ceo/assessments?focus=${encodeURIComponent(systemKey)}`);
  }

  // tooltip text for retake guidance
  const RETAKE_TOOLTIP = "If your organization has changed since the last assessment, retake it to refresh recommendations and improve efficiency.";

  const kpis = [
    { title: "Revenue (TTM)", value: "₦120M" },
    { title: "EBITDA Margin", value: "18%" },
  ];

  return (
    <section>
      <div className="mb-6">
        <h1 className={`text-2xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Dashboard Home
        </h1>
        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
          <span className="text-blue-600">{auth?.org?.name || "ConseQ-X"}</span> Workspace
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Revenue (TTM)" value="₦120M" darkMode={darkMode} />
        <KPICard title="EBITDA Margin" value="18%" darkMode={darkMode} />
        <KPICard title="Team Performance" value="87%" darkMode={darkMode} />
        <KPICard title="System Health" value={`${overallScore}%`} darkMode={darkMode} />
      </div>

      <div className={`rounded-lg p-4 border ${darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg font-semibold`}>Executive Reports & Insights</h3>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Real-time organizational intelligence and strategic recommendations
              </p>
            </div>
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Insights</span>
                <span className="text-lg font-bold text-blue-500">{Object.values(systemScoresFromUpload).filter(score => score !== null).length}</span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-500">Actions</span>
                <span className="text-lg font-bold text-blue-500">3</span>
              </div>
            </div>
          </div>
          
          {/* Assessment Status Overview */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg ${
            darkMode ? "bg-gray-800/50" : "bg-gray-50"
          }`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                {Object.values(systemScoresFromUpload).filter(score => score !== null).length}
              </div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Systems Assessed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                {6 - Object.values(systemScoresFromUpload).filter(score => score !== null).length}
              </div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Pending Assessment</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {overallScore > 75 ? "Excellent" : overallScore > 50 ? "Good" : overallScore > 25 ? "Fair" : "Needs Attention"}
              </div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Health Rating</div>
            </div>
          </div>

          {/* Executive Insights */}
          {/* <div className="space-y-4">
            <h4 className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-semibold flex items-center gap-2`}>
              <FaBrain className="text-blue-500" />
              Strategic Insights
            </h4>
            
            <div className="space-y-3">
              {Object.entries(systemScoresFromUpload).filter(([_, score]) => score !== null && score < 70).slice(0, 2).map(([systemKey, score]) => {
                const system = CANONICAL_SYSTEMS.find(s => s.key === systemKey);
                return (
                  <div key={systemKey} className={`p-4 rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
                    darkMode ? "bg-gray-800 border-gray-700 hover:shadow-xl" : "bg-white border-gray-100 hover:shadow-lg"
                  }`} onClick={() => handleViewSystem(systemKey)}>
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-3 text-lg ${
                        score < 50 ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" :
                        score < 70 ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300" :
                        "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                      }`}>
                        {system?.icon || "⚠️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{system?.title || systemKey} System Alert</h3>
                            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>
                              Performance at {score}% - requires strategic attention
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded text-xs font-semibold ${
                                score < 50 ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                                "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                              }`}>
                                {score < 50 ? "CRITICAL" : "WARNING"}
                              </span>
                              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs`}>Impact: High</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={(e) => {e.stopPropagation(); navigate(`/ceo/org-health`);}} 
                              className={`px-3 py-1 rounded-md text-xs ${darkMode ? "bg-gray-700 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
                            >
                              <FaEye />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className={`p-2 rounded-md text-xs ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                            <div className="font-semibold text-xs">Short-term</div>
                            <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>2-6 weeks: Performance decline likely</div>
                          </div>
                          <div className={`p-2 rounded-md text-xs ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                            <div className="font-semibold text-xs">Mid-term</div>
                            <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>3-6 months: System bottlenecks emerge</div>
                          </div>
                          <div className={`p-2 rounded-md text-xs ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                            <div className="font-semibold text-xs">Long-term</div>
                            <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>12+ months: Strategic impact</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {Object.values(systemScoresFromUpload).filter(score => score !== null && score < 70).length === 0 && (
                <div className={`text-center py-8 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
                  <div className="text-4xl mb-2">✅</div>
                  <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>All systems performing well</div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>No critical insights at this time</div>
                </div>
              )}
            </div>
          </div> */}

          {/* Recent Activity */}
          <div className="mt-6">
            <h4 className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-semibold mb-3`}>Recent Activity</h4>
            <div className="space-y-2">
              {Object.entries(systemScoresFromUpload).filter(([_, score]) => score !== null).slice(0, 3).map(([systemKey, score]) => {
                const system = CANONICAL_SYSTEMS.find(s => s.key === systemKey);
                return (
                  <div key={systemKey} className={`flex items-center justify-between p-3 rounded-lg ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center text-sm">
                        {system?.icon || "📋"}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                          {system?.title || systemKey}
                        </div>
                        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Assessment completed
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      score >= 80 
                        ? "bg-green-100 text-green-700" 
                        : score >= 60 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {score}%
                    </div>
                  </div>
                );
              })}
              
              {Object.values(systemScoresFromUpload).filter(score => score !== null).length === 0 && (
                <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="text-4xl mb-2">📋</div>
                  <div className="text-sm">No assessments completed yet</div>
                  <button
                    onClick={() => navigate("/ceo/assessments")}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Start your first assessment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Quick modal (short report / CTA) */}
      <AnimatePresence>
        {showQuickModal && quickModalPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuickModal(false)} />
            <div className={`relative z-10 w-full max-w-2xl rounded-lg p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-200 text-gray-900"} shadow-xl`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{`The System of ${quickModalPayload.title} — Report`}</h3>
                  <div className="text-xs text-gray-400 mt-1">{quickModalPayload.description}</div>
                </div>
                <button onClick={() => setShowQuickModal(false)} className="text-gray-400">✕</button>
              </div>

              <div className="mt-4 space-y-4">
                {quickModalPayload.score !== null ? (
                  <>
                    <div>
                      <div className="text-xs text-gray-400">Score</div>
                      <div className="text-2xl font-bold mt-1">{quickModalPayload.score}%</div>
                      <div className="mt-2"><BlueProgress pct={quickModalPayload.score} darkMode={darkMode} /></div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">X-Ultra Recommendations (preview)</h4>
                      <ul className="mt-2 list-disc pl-5 text-sm text-gray-500">
                        <li>Run a focused improvement sprint (2–4 weeks) with explicit owners.</li>
                        <li>Establish weekly metrics to track progress on the top 3 pain points.</li>
                        <li>Document a playbook for common cross-team handoffs to reduce friction.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">African case example (short)</h4>
                      <div className="text-sm text-gray-500 mt-1">Dangote-style central governance + local execution produced measurable delivery improvements when cross-unit orchestration improved.</div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { openFullOrgHealth(quickModalPayload.systemKey); setShowQuickModal(false); }} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                        Open full report
                      </button>
                      <button
                        onClick={() => { startOrRetakeAssessment(quickModalPayload.systemKey); setShowQuickModal(false); }}
                        title={RETAKE_TOOLTIP}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white"
                      >
                        Retake assessment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-sm text-gray-400">Assessment not taken</div>
                      <div className="text-lg font-semibold mt-1">Take your Organizational Health Assessment now</div>
                      <div className="text-sm text-gray-500 mt-2">
                        We don't yet have data for this system. A short assessment (~10–20 minutes) will populate a full report with X-Ultra recommendations, forecasts and case studies.
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { startOrRetakeAssessment(quickModalPayload.systemKey); setShowQuickModal(false); }} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">Start assessment</button>
                      <button onClick={() => { setShowQuickModal(false); navigate("/ceo/org-health"); }} className="px-3 py-2 rounded-md border">Learn about this system</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
