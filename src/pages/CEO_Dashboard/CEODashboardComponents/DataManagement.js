import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FaUpload, FaFileCsv, FaFileAlt, FaSearch, FaTrash } from "react-icons/fa";
import * as svc from "../services/serviceSelector";
import notifier from "../services/notificationService";

const STORAGE_UPLOADS = "conseqx_uploads_v1";
const BINARY_EXTS = ["docx","pdf","xlsx","xls","png","jpg","jpeg","gif","zip","pptx","ppt"];

const STORAGE_REMINDERS = "conseqx_reports_reminders_v3";

function readUploads() {
  try {
    const raw = localStorage.getItem(STORAGE_UPLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUploads(arr) {
  try {
    const safe = (arr || []).map((u) => {
      const copy = { ...u };
      try { delete copy.objectUrl; } catch {}
      return copy;
    });
    localStorage.setItem(STORAGE_UPLOADS, JSON.stringify(safe));
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

function writeReminders(arr) {
  try {
    localStorage.setItem(STORAGE_REMINDERS, JSON.stringify(arr));
  } catch {}
}

/* tiny CSV fallback */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] ? cols[i].trim() : ""));
    return obj;
  });
}

export default function DataManagement() {
  const { org = null } = useOutletContext();
  const orgId = org?.id || "anon";

  const [uploads, setUploads] = useState(() => readUploads());
  // auto-ingest removed intentionally per your instruction
  const [templateOpen, setTemplateOpen] = useState(false);
  const [completionModal, setCompletionModal] = useState({ open: false, uploadId: null, name: '' });
  const [modal, setModal] = useState({ open: false, title: '', body: '', onConfirm: null });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  // --- DARK MODE DETECTION (fixes the 'darkMode is not defined' error) ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    const docHas = document.documentElement.classList.contains("dark");
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return docHas || mq;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Observe class changes on <html> so toggles of 'dark' are detected
    const obs = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Also listen for system preference changes
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const mqListener = () => {
      setDarkMode(document.documentElement.classList.contains("dark") || (mq && mq.matches));
    };
    if (mq) {
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", mqListener);
      } else if (typeof mq.addListener === "function") {
        mq.addListener(mqListener);
      }
    }

    return () => {
      obs.disconnect();
      if (mq) {
        if (typeof mq.removeEventListener === "function") {
          mq.removeEventListener("change", mqListener);
        } else if (typeof mq.removeListener === "function") {
          mq.removeListener(mqListener);
        }
      }
    };
  }, []);

  // ------------------------------------------------------------------

  useEffect(() => {
    writeUploads(uploads);
  }, [uploads]);

  // Listen for analysis-ready notifications to surface a friendly modal
  useEffect(() => {
    function onReady(e) {
      try {
        const d = e?.detail || {};
        setCompletionModal({ open: true, uploadId: d.uploadId || null, name: d.name || 'upload' });
        try { notifier.sendEmail({ to: (org && org.email) || 'ceo@example.com', subject: `Analysis complete: ${d.name}`, body: `Your upload ${d.name} has completed processing.` }); } catch (e) {}
      } catch (err) {}
    }
    window.addEventListener('conseqx:notifications:updated', onReady);
    return () => window.removeEventListener('conseqx:notifications:updated', onReady);
  }, [org]);

  async function onFiles(files) {
    const f = files[0];
    if (!f) return;
    setProcessing(true);
    setProgress(8);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      setProgress(35);
      const text = ev.target.result;
      let parsed = null;
      const nameLower = (f.name || "").toLowerCase();
      const ext = nameLower.includes(".") ? nameLower.split(".").pop() : "";

      const isBinary = BINARY_EXTS.includes(ext) || (f.type && (f.type.startsWith("image/") || f.type === "application/pdf"));

      if (isBinary) {
        parsed = { type: 'binary', filename: f.name, size: f.size };
      } else if (f.type === "application/json" || f.name.endsWith(".json")) {
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = null;
        }
      } else if (f.type.includes("csv") || f.name.endsWith(".csv") || f.name.endsWith(".txt")) {
        try {
          const Papa = await import('papaparse').then(m => m.default || m).catch(() => null);
          if (Papa && typeof Papa.parse === 'function') {
            const res = Papa.parse(text, { header: true, skipEmptyLines: true });
            parsed = res.data;
          } else {
            parsed = parseCSV(text);
          }
        } catch (e) {
          parsed = parseCSV(text);
        }
      } else if (ext === 'xlsx' || ext === 'xls') {
        try {
          const XLSX = await import('xlsx').then(m => m.default || m).catch(() => null);
          if (XLSX && typeof XLSX.read === 'function') {
            const wb = XLSX.read(text, { type: 'binary' });
            const sheetName = wb.SheetNames[0];
            const ws = wb.Sheets[sheetName];
            parsed = XLSX.utils.sheet_to_json(ws, { defval: '' });
          } else {
            parsed = { type: 'binary', filename: f.name };
          }
        } catch (e) {
          parsed = { type: 'binary', filename: f.name };
        }
      } else {
        const sanitized = String(text || "").replace(/[^	\n\r \x20-\x7E]/g, " ");
        parsed = { type: 'text', filename: f.name, previewText: sanitized.substring(0, 400) };
      }

      setProgress(65);
      const valid = parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0);

      function categorizeFile(name = "", preview = "") {
        const txt = `${name} ${typeof preview === 'string' ? preview : JSON.stringify(preview)}`.toLowerCase();
        const map = [
          ["interpretation", ["finance", "revenue", "profit", "financial", "balance", "income", "expenses"]],
          ["investigation", ["survey", "feedback", "csat", "comments", "responses", "sentiment", "log", "logs", "data"]],
          ["interdependency", ["orgchart", "org chart", "organization chart", "hierarchy", "reporting"]],
          ["orchestration", ["cycle", "sprint", "iteration", "lead time", "throughput"]],
          ["inlignment", ["goal", "kpi", "objective", "okr", "alignment"]],
          ["illustration", ["process", "flow", "diagram", "procedure", "manual", "presentation", "ppt"]]
        ];
        const hits = [];
        map.forEach(([key, kws]) => {
          for (const kw of kws) {
            if (txt.includes(kw)) {
              hits.push(key);
              break;
            }
          }
        });
        return hits.length ? Array.from(new Set(hits)) : ["investigation"];
      }

      const record = {
        id: `U-${Date.now().toString(36)}`,
        name: f.name,
        type: f.type || "unknown",
        timestamp: Date.now(),
        valid: Boolean(valid),
        preview: Array.isArray(parsed) ? parsed.slice(0, 3) : parsed,
        analyzedSystems: [],
        objectUrl: undefined,
      };

      if (parsed && parsed.type === 'binary') {
        try { record.objectUrl = URL.createObjectURL(f); } catch (e) {}
      }

      // simulate processing time
      setTimeout(() => {
        setProgress(100);
        setProcessing(false);
        setProgress(0);

        const systems = categorizeFile(f.name, JSON.stringify(record.preview || ""));
        record.analyzedSystems = systems;
        setUploads((prev) => [record, ...prev]);

        // trigger service assessments (best-effort)
        systems.forEach(async (sys) => {
          try { await svc.runAssessment(orgId, sys); } catch (e) { try { console.warn("runAssessment failed:", e); } catch {} }
        });

        // store diff metadata if prev exists
        try {
          const prev = uploads[0];
          if (prev) {
            const diffKey = 'conseqx_upload_diffs_v1';
            const raw = localStorage.getItem(diffKey);
            const diffs = raw ? JSON.parse(raw) : [];
            diffs.unshift({ id: `${record.id}-vs-${prev.id}`, left: record.id, right: prev.id, ts: Date.now() });
            localStorage.setItem(diffKey, JSON.stringify(diffs));
          }
        } catch (e) {}

        // notifications for analysis-ready
        try {
          const makeNote = (title) => ({ id: `N-${Date.now().toString(36)}`, uploadId: record.id, read: false, title, body: `Analysis ready for ${record.name}`, ts: Date.now(), type: "upload" });

          try {
            const noteKey = "conseqx_uploads_notifications_v1";
            const raw = localStorage.getItem(noteKey);
            const notes = raw ? JSON.parse(raw) : [];
            notes.unshift(makeNote(`Analysis ready: ${record.name}`));
            localStorage.setItem(noteKey, JSON.stringify(notes));
          } catch (e) {}

          const reportKeys = ["conseqx_reports_notifications_v3", "conseqx_reports_notifications_v1"];
          reportKeys.forEach((k) => {
            try {
              const raw = localStorage.getItem(k);
              const notes = raw ? JSON.parse(raw) : [];
              notes.unshift(makeNote(`Analysis ready: ${record.name}`));
              localStorage.setItem(k, JSON.stringify(notes));
            } catch (e) {}
          });

          try { window.dispatchEvent(new CustomEvent("conseqx:notifications:updated", { detail: { uploadId: record.id, name: record.name } })); } catch (e) {}
        } catch (e) {}
      }, 700 + Math.random() * 900);
    };

    reader.readAsText(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = e.dataTransfer.files;
    onFiles(files);
  }

  function handlePick() {
    if (fileRef.current) fileRef.current.click();
  }

  function removeUpload(id) {
    setUploads((prev) => {
      const toRemove = prev.find((u) => u.id === id);
      if (toRemove && toRemove.objectUrl) {
        try { URL.revokeObjectURL(toRemove.objectUrl); } catch (e) {}
      }
      return prev.filter((u) => u.id !== id);
    });
  }

  function revertToUpload(id) {
    setUploads((prev) => {
      const found = prev.find(u => u.id === id);
      if (!found) return prev;
      const rest = prev.filter(u => u.id !== id);
      return [ { ...found, timestamp: Date.now() }, ...rest ];
    });
  }

  function viewDiff(leftId, rightId) {
    try {
      const raw = localStorage.getItem('conseqx_upload_diffs_v1');
      const diffs = raw ? JSON.parse(raw) : [];
      const d = diffs.find(x => x.id === `${leftId}-vs-${rightId}`) || diffs.find(x => x.left === leftId && x.right === rightId);
      setModal({ open: true, title: 'Compare uploads', body: d ? `Comparison record created at ${new Date(d.ts).toLocaleString()}` : 'No precomputed diff available for these uploads.', onConfirm: null });
    } catch (e) { setModal({ open: true, title: 'Compare uploads', body: 'Error reading diffs', onConfirm: null }); }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Management</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">Manage uploads, validation and processing</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* left column */}
        <div className={`lg:col-span-5`}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg p-6 border-2 border-dashed transition-colors
              ${dragging ? "border-blue-500 bg-blue-50/20 dark:bg-blue-900/20" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"}`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <FaUpload className="text-3xl text-gray-600 dark:text-gray-200" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Drag & drop files here</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">CSV, JSON, TXT (PDFs as text) — files processed client-side and stored locally for analysis</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePick} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">Choose file</button>

                <div className="relative">
                  <button
                    onClick={() => setTemplateOpen((s) => !s)}
                    className="px-3 py-2 rounded-md border text-sm bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    Download template
                  </button>
                  {templateOpen && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-2 w-56 z-40">
                      <a href="/sample-data/template-financials.csv" download className="block px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Financials template</a>
                      <a href="/sample-data/template-survey.csv" download className="block px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Survey template</a>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tip: open the CSV and fill rows before upload.</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    try {
                      uploads.forEach((u) => { if (u && u.objectUrl) try { URL.revokeObjectURL(u.objectUrl); } catch (e) {} });
                    } catch (e) {}
                    setUploads([]);
                    writeUploads([]);
                  }}
                  className="px-3 py-2 rounded-md border text-sm bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                >
                  Clear history
                </button>
              </div>
            </div>

            <input ref={fileRef} type="file" className="hidden" onChange={(e) => onFiles(e.target.files)} />

            {processing && (
              <div className="mt-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">Validation progress</div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mt-2 overflow-hidden">
                  <div style={{ width: `${progress}%` }} className="h-full bg-yellow-500 transition-all" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reminder Scheduler</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set upload reminders. Reminders persist locally and appear under Reports → Reminders.</p>
            <ReminderScheduler />
          </div>
        </div>

        {/* right column */}
        <div className="lg:col-span-7">
          <div className="rounded-lg p-4 border bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Upload history</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">{uploads.length} upload{uploads.length !== 1 ? "s" : ""}</div>
            </div>

            <div className="mt-3">
              {uploads.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No uploads yet. Upload a CSV or JSON to get started.</div>}

              {/* Desktop/tablet view */}
              {uploads.length > 0 && (
                <div>
                  <div className="hidden sm:block overflow-x-auto mt-2">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                          <th className="py-2">Timestamp</th>
                          <th className="py-2">File</th>
                          <th className="py-2">Valid</th>
                          <th className="py-2">Preview</th>
                          <th className="py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploads.map((u) => (
                          <tr key={u.id} className="border-t align-top border-gray-200 dark:border-gray-700">
                            <td className="py-2 align-top text-xs text-gray-600 dark:text-gray-300">{new Date(u.timestamp).toLocaleString()}</td>
                            <td className="py-2 align-top font-medium text-gray-900 dark:text-gray-100">{u.name}</td>
                            <td className="py-2 align-top text-xs">{u.valid ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}</td>
                            <td className="py-2 align-top">
                              {u.preview && u.preview.type === 'binary' ? (
                                <div className="text-xs text-gray-800 dark:text-gray-200">
                                  <div className="font-medium">{u.preview.filename || u.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{u.preview.size ? `${u.preview.size} bytes` : 'binary file'}</div>
                                  {u.objectUrl ? (
                                    <a className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 inline-block" href={u.objectUrl} download={u.name}>Download</a>
                                  ) : (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">Download available while session is open</div>
                                  )}
                                </div>
                              ) : Array.isArray(u.preview) ? (
                                <div className="max-h-40 overflow-auto bg-gray-50 dark:bg-gray-700/40 p-2 rounded text-xs">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr>
                                        {(Object.keys(u.preview[0] || {}).slice(0,6)).map((h) => (
                                          <th key={h} className="text-left pr-2 text-gray-600 dark:text-gray-300">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {u.preview.slice(0,3).map((row, idx) => (
                                        <tr key={idx}>
                                          {Object.values(row).slice(0,6).map((v, i) => (
                                            <td key={i} className="pr-2 align-top text-gray-800 dark:text-gray-200">{String(v)}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (u.preview && u.preview.type === 'text') ? (
                                <div className="max-h-40 overflow-auto break-words bg-gray-50 dark:bg-gray-700/40 p-2 rounded text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200">{u.preview.previewText}</div>
                              ) : (
                                <div className="max-h-40 overflow-auto bg-gray-50 dark:bg-gray-700/40 p-2 rounded text-xs text-gray-800 dark:text-gray-200">
                                  <pre className="whitespace-pre-wrap">{(() => {
                                    try {
                                      const s = typeof u.preview === 'string' ? u.preview : JSON.stringify(u.preview || {}, null, 2);
                                      return s.length > 1000 ? s.slice(0, 1000) + '…' : s;
                                    } catch (e) { return String(u.preview); }
                                  })()}</pre>
                                </div>
                              )}
                            </td>
                            <td className="py-2 align-top text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => viewDiff(u.id, uploads[0]?.id)} className="px-2 py-1 rounded-md text-xs border bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Compare</button>
                                <button onClick={() => revertToUpload(u.id)} className="px-2 py-1 rounded-md text-xs border bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Revert</button>
                                <button onClick={() => removeUpload(u.id)} className="px-2 py-1 rounded-md text-xs border text-red-600 bg-white dark:bg-gray-700 dark:text-red-400 border-gray-300 dark:border-gray-600"><FaTrash className="inline mr-1"/>Remove</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile stacked cards */}
                  <div className="sm:hidden mt-2 space-y-3">
                    {uploads.map((u) => (
                      <div key={u.id} className="border rounded p-3 bg-white dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate text-gray-900 dark:text-gray-100">{u.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(u.timestamp).toLocaleString()}</div>
                            <div className="text-xs mt-2">{u.valid ? <span className="text-green-600">Valid</span> : <span className="text-red-600">Invalid</span>}</div>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-800 dark:text-gray-200">
                          {u.preview && u.preview.type === 'binary' ? (
                            <>
                              <div className="font-medium">{u.preview.filename || u.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{u.preview.size ? `${u.preview.size} bytes` : 'binary file'}</div>
                              {u.objectUrl ? <a href={u.objectUrl} download={u.name} className="text-xs text-blue-600 dark:text-blue-400 underline">Download</a> : <div className="text-xs text-gray-400 dark:text-gray-500">Download available while session open</div>}
                            </>
                          ) : Array.isArray(u.preview) ? (
                            <div className="max-h-28 overflow-auto bg-gray-50 dark:bg-gray-700/40 p-2 rounded text-xs">
                              <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{JSON.stringify(u.preview.slice(0,2), null, 2)}</pre>
                            </div>
                          ) : (u.preview && u.preview.type === 'text') ? (
                            <div className="max-h-28 overflow-auto bg-gray-50 dark:bg-gray-700/40 p-2 rounded text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200">{u.preview.previewText}</div>
                          ) : (
                            <div className="max-h-28 overflow-auto bg-gray-50 dark:bg-gray-700/40 p-2 rounded text-xs text-gray-800 dark:text-gray-200">
                              <pre className="whitespace-pre-wrap">{(() => {
                                try {
                                  const s = typeof u.preview === 'string' ? u.preview : JSON.stringify(u.preview || {}, null, 2);
                                  return s.length > 500 ? s.slice(0, 500) + '…' : s;
                                } catch (e) { return String(u.preview); }
                              })()}</pre>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button onClick={() => viewDiff(u.id, uploads[0]?.id)} className="px-2 py-1 rounded-md text-xs border bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Compare</button>
                          <button onClick={() => revertToUpload(u.id)} className="px-2 py-1 rounded-md text-xs border bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Revert</button>
                          <button onClick={() => removeUpload(u.id)} className="px-2 py-1 rounded-md text-xs border text-red-600 bg-white dark:bg-gray-700 dark:text-red-400 border-gray-300 dark:border-gray-600"><FaTrash className="inline mr-1"/>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* completion modal and generic modal */}
          <Modal open={completionModal.open} title={completionModal.name ? 'Analysis complete' : 'Analysis ready'} onClose={() => setCompletionModal({ open: false, uploadId: null, name: '' })}>
            <div className="text-sm text-gray-800 dark:text-gray-200">Analysis for <strong>{completionModal.name}</strong> is complete. Would you like to view the latest upload?</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setCompletionModal({ open: false, uploadId: null, name: '' })} className="px-3 py-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Later</button>
              <button onClick={() => {
                const el = document.querySelector('[data-upload-history]');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setCompletionModal({ open: false, uploadId: null, name: '' });
              }} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
            </div>
          </Modal>

          <Modal open={modal.open} title={modal.title} onClose={() => setModal({ open: false, title: '', body: '', onConfirm: null })}>
            <div className="text-sm text-gray-700 dark:text-gray-200">{modal.body}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModal({ open: false, title: '', body: '', onConfirm: null })} className="px-3 py-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Close</button>
              {modal.onConfirm && <button onClick={() => { modal.onConfirm(); setModal({ open: false, title: '', body: '', onConfirm: null }); }} className="px-3 py-1 bg-red-600 text-white rounded">Confirm</button>}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

/* --------- ReminderScheduler component (unchanged but responsive + dark-mode friendly) --------- */
function ReminderScheduler() {
  const [reminders, setReminders] = useState(() => readReminders());
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  useEffect(() => writeReminders(reminders), [reminders]);

  const [modal, setModal] = useState({ open: false, title: '', body: '', onConfirm: null });

  function openError(msg) { setModal({ open: true, title: 'Validation', body: msg, onConfirm: null }); }

  function addReminder() {
    if (!title) return openError('Enter a title for the reminder');
    const r = { id: `rem-${Date.now().toString(36)}`, title, when: new Date(when).toISOString(), createdAt: Date.now(), done: false };
    setReminders((s) => [r, ...s]);
    setTitle("");
  }

  function toggleDone(id) { setReminders((s) => s.map(r => r.id === id ? { ...r, done: !r.done } : r)); }
  function deleteReminder(id) {
    setModal({ open: true, title: 'Delete reminder', body: 'Are you sure you want to delete this reminder?', onConfirm: () => {
      setReminders((s) => s.filter(r => r.id !== id));
      setModal({ open: false, title: '', body: '', onConfirm: null });
    }});
  }

  const upcoming = reminders.filter(r => !r.done).length;

  return (
    <div className="mt-3">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reminder title"
          className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        />
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        />
        <button onClick={addReminder} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
      </div>

      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">Upcoming reminders: <span className="font-semibold text-gray-900 dark:text-gray-100">{upcoming}</span></div>

      <ul className="mt-2 space-y-2">
        {reminders.length === 0 && <li className="text-xs text-gray-500 dark:text-gray-400">No reminders yet.</li>}
        {reminders.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700">
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{r.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(r.when).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleDone(r.id)} className={`px-2 py-1 rounded text-xs ${r.done ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-100'}`}>{r.done ? 'Done' : 'Mark done'}</button>
              <button onClick={() => deleteReminder(r.id)} className="px-2 py-1 text-xs border rounded text-red-600 bg-white dark:bg-gray-700 dark:text-red-400 border-gray-300 dark:border-gray-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={modal.open} title={modal.title} onClose={() => setModal({ open: false, title: '', body: '', onConfirm: null })}>
        <div className="text-sm text-gray-700 dark:text-gray-200">{modal.body}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setModal({ open: false, title: '', body: '', onConfirm: null })} className="px-3 py-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">Cancel</button>
          {modal.onConfirm && <button onClick={modal.onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>}
        </div>
      </Modal>
    </div>
  );
}

/* Simple Modal used in component (unchanged but dark-aware) */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-2xl border dark:border-gray-700">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-300">✕</button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
