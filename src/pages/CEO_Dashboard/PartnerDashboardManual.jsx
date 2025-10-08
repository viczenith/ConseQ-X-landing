import React, { useEffect, useMemo, useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  FaCloudUploadAlt, 
  FaDownload, 
  FaBell, 
  FaCalendarAlt, 
  FaChartLine, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUpload,
  FaFileAlt,
  FaSpinner
} from "react-icons/fa";
import { normalizeSystemKey } from "./constants/systems";

const STORAGE_UPLOADS = "conseqx_uploads_v1";
const STORAGE_ASSESS = "conseqx_assessments_v1";
const STORAGE_REMINDERS = "conseqx_upload_reminders_v1";
const STORAGE_NOTIFICATIONS = "conseqx_manual_notifications_v1";
const STORAGE_PREFERENCES = "conseqx_manual_preferences_v1";

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

function writeUploads(arr) {
  try {
    localStorage.setItem(STORAGE_UPLOADS, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('conseqx:uploads:updated'));
  } catch {}
}

function readReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeReminders(reminders) {
  try {
    localStorage.setItem(STORAGE_REMINDERS, JSON.stringify(reminders));
  } catch {}
}

function readNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('conseqx:notifications:updated'));
  } catch {}
}

function readPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_PREFERENCES);
    return raw ? JSON.parse(raw) : {
      emailNotifications: false,
      smsNotifications: false,
      uploadReminders: true,
      analysisAlerts: true
    };
  } catch {
    return {
      emailNotifications: false,
      smsNotifications: false,
      uploadReminders: true,
      analysisAlerts: true
    };
  }
}

function writePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_PREFERENCES, JSON.stringify(prefs));
  } catch {}
}

export default function PartnerDashboardManual({ orgId: propOrgId = null }) {
  const { darkMode, org } = useOutletContext();
  const navigate = useNavigate();
  const orgId = propOrgId || (org && (org.id || org.orgId)) || "anon";

  const [uploads, setUploads] = useState(() => readUploads());
  const [reminders, setReminders] = useState(() => readReminders());
  const [notifications, setNotifications] = useState(() => readNotifications());
  const [preferences, setPreferences] = useState(() => readPreferences());
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, status: '' });
  const fileInputRef = useRef(null);
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

  // Upload Wizard Component
  const UploadWizard = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [validationResults, setValidationResults] = useState({});

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    };

    const handleFiles = async (files) => {
      setSelectedFiles(files);
      setUploadProgress({ show: true, progress: 10, status: 'Validating files...' });
      
      // Simulate file validation
      const results = {};
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ show: true, progress: 20 + (i * 30), status: `Validating ${file.name}...` });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        results[file.name] = {
          valid: file.size < 10 * 1024 * 1024, // 10MB limit
          type: file.type.includes('csv') ? 'CSV Data' : 
                file.type.includes('excel') || file.name.includes('.xlsx') ? 'Excel Data' :
                file.type.includes('pdf') ? 'PDF Report' : 'Other',
          systemsDetected: ['Interdependency', 'Investigation', 'Interpretation'],
          errors: file.size > 10 * 1024 * 1024 ? ['File size exceeds 10MB limit'] : []
        };
      }
      
      setValidationResults(results);
      setUploadProgress({ show: true, progress: 100, status: 'Validation complete' });
      
      setTimeout(() => {
        setUploadProgress({ show: false, progress: 0, status: '' });
      }, 1000);
    };

    const processUpload = async () => {
      setUploadProgress({ show: true, progress: 0, status: 'Processing files...' });
      
      // Simulate upload processing
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress({ show: true, progress: i, status: `Processing... ${i}%` });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Create new upload record
      const newUpload = {
        id: Date.now().toString(),
        name: selectedFiles.map(f => f.name).join(', '),
        timestamp: Date.now(),
        analyzedSystems: ['interdependency', 'investigation', 'interpretation'],
        fileCount: selectedFiles.length,
        totalSize: selectedFiles.reduce((sum, f) => sum + f.size, 0)
      };
      
      const updatedUploads = [newUpload, ...uploads];
      setUploads(updatedUploads);
      writeUploads(updatedUploads);
      
      setUploadProgress({ show: false, progress: 0, status: '' });
      setShowUploadWizard(false);
      setSelectedFiles([]);
      setValidationResults({});
      
      // Add success notification
      addNotification('Upload Complete', `Successfully processed ${selectedFiles.length} files`, 'success');
    };

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
        <div className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Upload Data Wizard</h3>
              <button onClick={() => setShowUploadWizard(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            {!selectedFiles.length ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-lg mb-2">Drag & drop files here</p>
                <p className="text-sm text-gray-500 mb-4">Supported: CSV, Excel, PDF (max 10MB each)</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Choose Files
                </button>
                <input 
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold">File Validation Results</h4>
                {selectedFiles.map((file, idx) => {
                  const result = validationResults[file.name];
                  return (
                    <div key={idx} className={`p-3 rounded border ${result?.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {result?.type || 'Unknown'}
                          </div>
                          {result?.systemsDetected && (
                            <div className="text-xs text-blue-600 mt-1">
                              Systems detected: {result.systemsDetected.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center ${result?.valid ? 'text-green-600' : 'text-red-600'}`}>
                          {result?.valid ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        </div>
                      </div>
                      {result?.errors?.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          {result.errors.map((error, i) => <div key={i}>• {error}</div>)}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => {setSelectedFiles([]); setValidationResults({});}} 
                    className="px-4 py-2 border rounded-lg"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={processUpload}
                    disabled={!Object.values(validationResults).every(r => r.valid)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Process Upload
                  </button>
                </div>
              </div>
            )}
            
            {uploadProgress.show && (
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FaSpinner className="animate-spin" />
                  <span className="text-sm">{uploadProgress.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{uploadProgress.progress}% complete</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add notification helper
  const addNotification = (title, message, type = 'info') => {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    const updated = [notification, ...notifications.slice(0, 9)]; // Keep last 10
    setNotifications(updated);
    writeNotifications(updated);
  };

  return (
    <section className="relative">
      {showUploadWizard && <UploadWizard />}
      
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">C-Suite Manual Data Analysis</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <button 
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaBell className="text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </button>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Upload datasets using the wizard below and return here to review snapshots, recommendations, and next steps.
            </div>
            {latest && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                <FaClock className="text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  Last updated: {new Date(latest.timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setShowUploadWizard(true)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FaUpload />
              <span className="hidden sm:inline">Upload Wizard</span>
            </button>
            <button 
              onClick={() => setShowReminderModal(true)} 
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <FaCalendarAlt />
              <span className="hidden sm:inline">Reminders</span>
            </button>
            <button 
              onClick={exportSnapshot} 
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <FaDownload />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className={`absolute top-16 right-4 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-40 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Notifications</h4>
                <button 
                  onClick={() => setShowNotificationPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 ${
                      !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notif.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(notif.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        notif.type === 'success' ? 'bg-green-500' : 
                        notif.type === 'warning' ? 'bg-yellow-500' : 
                        notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Systems Snapshot
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Click <strong>Open full</strong> for detailed reports. Use <strong>Take/Retake assessment</strong> to refresh diagnostics.
              </p>
            </div>
            <div className="text-xs text-gray-500 mt-2 sm:mt-0">
              {Object.values(systemScores).filter(s => s !== null).length} of {CANONICAL.length} systems have data
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANONICAL.map((s) => {
              const key = (typeof normalizeSystemKey === "function") ? normalizeSystemKey(s.key) : String(s.key).toLowerCase();
              const sc = systemScores[key];
              const persisted = Boolean(assessmentMap[key]);
              const scoreColor = sc !== null ? (sc >= 80 ? "text-green-500" : sc >= 60 ? "text-yellow-500" : "text-red-500") : "text-gray-400";
              const bgColor = sc !== null ? (sc >= 80 ? "bg-green-50 dark:bg-green-900/20" : sc >= 60 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20") : "";
              
              return (
                <div key={s.key} className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  darkMode ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
                } ${bgColor}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-lg">{s.title}</div>
                        {persisted && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                            Assessed
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {sc !== null ? (
                          sc >= 80 ? "Excellent performance" :
                          sc >= 60 ? "Good with room for improvement" :
                          "Needs attention"
                        ) : "Awaiting assessment"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FaFileAlt className="w-3 h-3" />
                        <span>Source: {sourceLabelFor(key)}</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-center">
                      <div className={`text-3xl font-bold ${scoreColor} mb-1`}>
                        {sc !== null ? `${sc}%` : "—"}
                      </div>
                      <div className="text-xs text-gray-400 mb-3">Current Score</div>
                      
                      {/* Mini progress bar */}
                      <div className="w-full sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            sc !== null ? (sc >= 80 ? "bg-green-500" : sc >= 60 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-400"
                          }`}
                          style={{ width: `${sc || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={() => openFull(key)}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      title="Open the full OrgHealth report for this system"
                    >
                      <FaChartLine className="w-4 h-4" />
                      <span>Open Report</span>
                    </button>

                    {persisted ? (
                      <button
                        onClick={() => startAssessmentFlow(key)}
                        className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        title={RETAKE_TOOLTIP}
                        aria-label={`Retake assessment for ${s.title}`}
                      >
                        <FaUpload className="w-4 h-4" />
                        <span>Retake</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startAssessmentFlow(key)}
                        className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        title={TAKE_TOOLTIP}
                        aria-label={`Take assessment for ${s.title}`}
                      >
                        <FaUpload className="w-4 h-4" />
                        <span>Take Assessment</span>
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

        <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">Pro Tips</div>
              <div className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                • Upload datasets regularly using the wizard above for continuous insights<br/>
                • Set up reminders to maintain data freshness<br/>
                • Use <strong>Take assessment</strong> for first-time diagnostics, <strong>Retake</strong> after organizational changes<br/>
                • Export snapshots for board presentations and stakeholder reports
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Scheduler Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  Upload Reminders
                </h3>
                <button 
                  onClick={() => setShowReminderModal(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reminder Frequency</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Notification Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={preferences.emailNotifications}
                        onChange={(e) => {
                          const updated = {...preferences, emailNotifications: e.target.checked};
                          setPreferences(updated);
                          writePreferences(updated);
                        }}
                        className="mr-2" 
                      />
                      Email notifications
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={preferences.smsNotifications}
                        onChange={(e) => {
                          const updated = {...preferences, smsNotifications: e.target.checked};
                          setPreferences(updated);
                          writePreferences(updated);
                        }}
                        className="mr-2" 
                      />
                      SMS notifications (requires phone setup)
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={preferences.uploadReminders}
                        onChange={(e) => {
                          const updated = {...preferences, uploadReminders: e.target.checked};
                          setPreferences(updated);
                          writePreferences(updated);
                        }}
                        className="mr-2" 
                      />
                      Browser notifications
                    </label>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Email and SMS notifications require account setup. 
                    Browser notifications work immediately.
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setShowReminderModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      addNotification('Reminders Updated', 'Your upload reminder preferences have been saved', 'success');
                      setShowReminderModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
