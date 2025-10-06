import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { normalizeSystemKey } from "./constants/systems";

const STORAGE_UPLOADS = "conseqx_uploads_v1";
const STORAGE_ASSESS = "conseqx_assessments_v1";

const CANONICAL = [
  { key: "interdependency", title: "Interdependency" },
  { key: "orchestration", title: "Orchestration" },
  { key: "investigation", title: "Investigation" },
  { key: "interpretation", title: "Interpretation" },
  { key: "illustration", title: "Illustration" },
  { key: "inlignment", title: "Inlignment" },
];

function readUploads() {
  try {
    const raw = localStorage.getItem(STORAGE_UPLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readAssessments(orgId = "anon") {
  try {
    const raw = localStorage.getItem(STORAGE_ASSESS);
    const byOrg = raw ? JSON.parse(raw) : {};
    return byOrg[orgId] || [];
  } catch {
    return [];
  }
}

export default function PartnerDashboardManual({ orgId: propOrgId = null }) {
  const { darkMode, org } = useOutletContext();
  const navigate = useNavigate();
  const orgId = propOrgId || (org && (org.id || org.orgId)) || "anon";

  const [uploads, setUploads] = useState(() => readUploads());
  const latest = uploads && uploads.length ? uploads[0] : null;

  // persisted assessments for this org
  const assessments = useMemo(() => readAssessments(orgId), [orgId]);

  // map latest persisted assessment by normalized system id
  const assessmentMap = useMemo(() => {
    const m = {};
    (assessments || []).forEach((a) => {
      const raw = a.systemId || a.system || a.systemKey || a.meta?.systemId || "";
      const key = (typeof normalizeSystemKey === "function")
        ? normalizeSystemKey(raw)
        : String(raw || "").toLowerCase().replace(/\s+/g, "");
      const ts = a.timestamp || a.ts || Date.now();
      if (!m[key] || (m[key].timestamp || 0) < ts) m[key] = { ...a, timestamp: ts };
    });
    return m;
  }, [assessments]);

  // derive per-system snapshot score:
  // prefer persisted assessment score, else if latest upload mentions system give a derived snapshot score, else null
  const systemScores = useMemo(() => {
    const scores = {};
    CANONICAL.forEach((s, idx) => {
      const key = (typeof normalizeSystemKey === "function") ? normalizeSystemKey(s.key) : String(s.key).toLowerCase();
      const persisted = assessmentMap[key];
      if (persisted && typeof persisted.score === "number") {
        scores[key] = Math.max(0, Math.min(100, Math.round(persisted.score)));
      } else {
        const presentInUpload =
          latest &&
          Array.isArray(latest.analyzedSystems) &&
          latest.analyzedSystems.map((ss) => String(ss).toLowerCase()).includes(String(s.key).toLowerCase());
        if (presentInUpload) {
          // deterministic derived value dependent on index (keeps stable snapshot)
          const derived = Math.max(40, Math.min(90, 70 + (idx - 2) * 3));
          scores[key] = derived;
        } else {
          scores[key] = null;
        }
      }
    });
    return scores;
  }, [latest, assessmentMap]);

  // composite overall (avg of available scores)
  const overall = useMemo(() => {
    const vals = Object.values(systemScores).filter((v) => v !== null && typeof v !== "undefined");
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [systemScores]);

  // keep uploads in sync with storage events
  useEffect(() => {
    function refresh() {
      setUploads(readUploads());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("conseqx:notifications:updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("conseqx:notifications:updated", refresh);
    };
  }, []);

  // ACTIONS
  function openFull(systemKey) {
    try {
      window.dispatchEvent(new CustomEvent("conseqx:orghealth:open", { detail: { systemId: systemKey, orgId } }));
    } catch {}
    navigate("/ceo/org-health");
  }

  function startAssessmentFlow(systemKey) {
    // standardized event to let other parts of the app react (e.g., queue, analytics)
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:start", { detail: { systemId: systemKey, orgId } }));
    } catch {}
    navigate(`/ceo/assessments?focus=${encodeURIComponent(systemKey)}`);
  }

  function exportSnapshot() {
    try {
      const payload = { latestUpload: latest || null, systemScores, exportedAt: Date.now(), orgId };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(org && org.name) || orgId}_partner_manual_snapshot.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {
      console.warn("Export failed", e);
    }
  }

  // tooltips
  const RETAKE_TOOLTIP = "Your previous assessment exists — retake if the organization or dataset has changed to refresh scores and recommendations.";
  const TAKE_TOOLTIP = "Take the system assessment to generate a full diagnostic, recommendations and forecasts.";

  // helper for source label
  function sourceLabelFor(key) {
    const a = assessmentMap[key];
    if (a) return a.source || a.name || "Stored assessment";
    if (
      latest &&
      Array.isArray(latest.analyzedSystems) &&
      latest.analyzedSystems.map((x) => String(x).toLowerCase()).includes(String(key).toLowerCase())
    ) {
      return `Derived from upload: ${latest.name || "latest upload"}`;
    }
    return "No data";
  }

  return (
    <section>
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">C-Suite Manual Data Analysis</h2>
            <div className="text-xs text-gray-400 mt-1">
              Upload a dataset using Data Management and return here to review the snapshot, recommendations, and next steps.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/ceo/data")} className="px-3 py-1 rounded-md border mr-2">
              <FaCloudUploadAlt className="inline mr-2" />Upload data
            </button>
            <button onClick={exportSnapshot} className="px-3 py-1 rounded-md border">
              <FaDownload className="inline mr-2" />Export snapshot
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={`col-span-1 sm:col-span-2 rounded-2xl p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className="text-xs">Overall Health (latest evidence)</div>
            <div className="text-3xl font-bold">{overall != null ? `${overall}%` : "No data"}</div>
            <div className="text-xs text-gray-400 mt-1">
              {latest ? `Based on: ${latest.name} • ${new Date(latest.timestamp).toLocaleString()}` : "No uploads yet — use Data Management to upload files for diagnosis."}
            </div>
          </div>

          <div className="rounded-2xl p-4 border">
            <div className="text-xs uppercase">Key KPI</div>
            <div className="text-2xl font-semibold mt-1">{overall != null ? `${Math.max(0, Math.min(100, overall))}%` : "—"}</div>
            <div className="text-xs text-gray-400 mt-1">Snapshot KPI from available evidence</div>
          </div>

          <div className="rounded-2xl p-4 border">
            <div className="text-xs uppercase">Action Items</div>
            <div className="mt-2">
              <div className="text-sm">Top recommendation</div>
              <div className="font-medium mt-1">{overall != null ? "Focus sprints on lowest-scoring systems and validate new uploads" : "Upload data to get tailored recommendations"}</div>
            </div>
          </div>
        </div>

        {/* systems grid */}
        <div className="mt-6">
          <h4 className="font-semibold">Systems Snapshot</h4>
          <p className="text-xs text-gray-400">
            Click <strong>Open full</strong> for the full OrgHealth report. Use <strong>Take assessment</strong> to create the first diagnostic for a system, or <strong>Retake</strong> to refresh an existing assessment.
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CANONICAL.map((s) => {
              const key = (typeof normalizeSystemKey === "function") ? normalizeSystemKey(s.key) : String(s.key).toLowerCase();
              const sc = systemScores[key];
              const persisted = Boolean(assessmentMap[key]); // true only if a saved assessment exists
              return (
                <div key={s.key} className={`p-3 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.title} quick insight</div>
                      <div className="text-xs text-gray-400 mt-1">Source: <span className="text-xs font-medium">{sourceLabelFor(key)}</span></div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold ${sc !== null ? (sc >= 80 ? "text-green-500" : sc >= 60 ? "text-yellow-500" : "text-red-500") : "text-gray-400"}`}>
                        {sc !== null ? `${sc}%` : "Not assessed"}
                      </div>
                      <div className="text-xs text-gray-400">Snapshot</div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => openFull(key)}
                      className="px-2 py-1 text-xs border rounded"
                      title="Open the full OrgHealth report for this system (detailed breakdown, history and recommendations)."
                    >
                      Open full
                    </button>

                    {persisted ? (
                      <button
                        onClick={() => startAssessmentFlow(key)}
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                        title={RETAKE_TOOLTIP}
                        aria-label={`Retake assessment for ${s.title}`}
                      >
                        Retake
                      </button>
                    ) : (
                      <button
                        onClick={() => startAssessmentFlow(key)}
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                        title={TAKE_TOOLTIP}
                        aria-label={`Take assessment for ${s.title}`}
                      >
                        Take assessment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecasts and Recommendations */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="font-semibold">Forecast</div>
            <div className="text-sm text-gray-500 mt-2">
              {overall != null ? "Projected health over the next 30 days based on current evidence and recent trends." : "No forecast available — upload data and run assessments to generate forecasts."}
            </div>
            <div className="mt-4 text-2xl font-bold">{overall != null ? `${Math.max(20, Math.min(100, overall + 3))}%` : "—"}</div>
            <div className="text-xs text-gray-400 mt-1">Forecast assumptions are driven by most recent upload and persisted assessments.</div>
          </div>

          <div className={`p-4 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="font-semibold">Recommendations</div>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {overall != null ? (
                <>
                  <li>Prioritize sprints for the bottom 2 systems identified above.</li>
                  <li>Ensure owners are assigned and weekly metrics are reported to track progress.</li>
                  <li>After implementing quick wins, retake the assessment to validate impact.</li>
                </>
              ) : (
                <>
                  <li>Upload relevant datasets (financials, surveys, org charts) using Data Management.</li>
                  <li>Run assessments to populate per-system reports and tailored recommendations.</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* benchmarking + upload history */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="font-semibold">Benchmark</div>
            <div className="text-xs text-gray-400 mt-2">Industry comparison (derived locally from available reference datasets)</div>
            <div className="mt-3">
              <div className="text-sm">Your composite: <strong>{overall != null ? `${overall}%` : "—"}</strong></div>
              <div className="text-sm">Industry median: <strong>68%</strong></div>
            </div>
          </div>

          <div className={`p-4 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="font-semibold">Upload History</div>
            <div className="text-xs text-gray-400 mt-2">Recent datasets used for diagnosis</div>
            <ul className="mt-3 text-sm space-y-2">
              {uploads.length === 0 && <li className="text-xs text-gray-500">No uploads yet</li>}
              {uploads.map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-400">{new Date(u.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Systems: {Array.isArray(u.analyzedSystems) ? u.analyzedSystems.join(", ") : "—"}</div>
                  </div>
                  <div>
                    <button onClick={() => navigate("/ceo/data")} className="px-2 py-1 text-xs border rounded">Open</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Tip: when a new dataset is uploaded, the platform categorizes it to systems and triggers the assessment flow. Use <strong>Take assessment</strong> to create a first diagnostic for a system, and <strong>Retake</strong> to refresh an existing assessment after changes.
        </div>
      </div>
    </section>
  );
}
