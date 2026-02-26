import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FaUpload, FaClock, FaDownload, FaEye, FaTrash, FaFileExport, FaTimes, FaSpinner } from 'react-icons/fa';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getApiBase, getAccessToken } from '../../../services/apiClient';

/* ───────── constants ───────── */
const CANONICAL = [
  { key: "interdependency", title: "Interdependency", keywords: ["dependency","relationship","collaboration","cross-functional","stakeholder","partnership","supply chain","vendor","integration","inter-departmental"] },
  { key: "orchestration",   title: "Orchestration",   keywords: ["process","workflow","coordination","management","planning","scheduling","execution","delivery","timeline","milestone"] },
  { key: "investigation",   title: "Investigation",   keywords: ["research","analysis","audit","investigation","assessment","evaluation","review","inspection","metric","kpi","performance","data","measure","diagnostic"] },
  { key: "interpretation",  title: "Interpretation",   keywords: ["insight","understanding","survey","feedback","sentiment","opinion","perception","satisfaction","engagement","culture","morale","meaning"] },
  { key: "illustration",    title: "Illustration",     keywords: ["communication","report","visualization","presentation","dashboard","chart","graph","narrative","storytelling","branding","message"] },
  { key: "inlignment",      title: "Inlignment",       keywords: ["alignment","strategy","goal","objective","vision","mission","value","purpose","direction","compliance","governance","policy"] },
];

/* ───────── helpers ───────── */

/** Read a file and return { rows[], headers[], rawText } using PapaParse or SheetJS */
function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const rows = Array.isArray(json) ? json : [json];
          const headers = rows.length ? Object.keys(rows[0]) : [];
          resolve({ rows, headers, rawText: e.target.result, recordCount: rows.length });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);

    } else if (ext === 'csv' || ext === 'txt') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => {
          resolve({
            rows: result.data,
            headers: result.meta?.fields || [],
            rawText: null,
            recordCount: result.data.length,
            parseErrors: result.errors?.length || 0,
          });
        },
        error: reject,
      });

    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const firstSheet = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheet];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const headers = rows.length ? Object.keys(rows[0]) : [];
          resolve({
            rows, headers, rawText: null,
            recordCount: rows.length,
            sheetName: firstSheet,
            sheetCount: wb.SheetNames.length,
          });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);

    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ rows: [], headers: [], rawText: e.target.result, recordCount: 0 });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    }
  });
}

/** Map parsed data columns to the Six Systems based on keyword matching */
function detectSystems(headers, rows) {
  const headerStr = headers.join(' ').toLowerCase();
  const detected = {};

  CANONICAL.forEach((sys) => {
    const matches = sys.keywords.filter(kw => headerStr.includes(kw));
    if (matches.length > 0) {
      detected[sys.key] = { matchedKeywords: matches.length, columnMatches: matches };
    }
  });

  // If nothing matched from headers, try row values
  if (Object.keys(detected).length === 0 && rows.length > 0) {
    const sampleText = rows.slice(0, 20).map(r => Object.values(r).join(' ')).join(' ').toLowerCase();
    CANONICAL.forEach((sys) => {
      const matches = sys.keywords.filter(kw => sampleText.includes(kw));
      if (matches.length > 0) {
        detected[sys.key] = { matchedKeywords: matches.length, columnMatches: matches };
      }
    });
  }

  return detected;
}

/** Compute real statistics from parsed data */
function computeStats(headers, rows) {
  const numericCols = headers.filter(h => {
    const vals = rows.slice(0, 50).map(r => r[h]).filter(v => v !== '' && v !== null && v !== undefined);
    return vals.length > 0 && vals.every(v => !isNaN(Number(v)));
  });

  const stats = {};
  numericCols.forEach(col => {
    const values = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
    if (values.length === 0) return;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    stats[col] = {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean * 100) / 100,
      median: sorted[Math.floor(sorted.length / 2)],
    };
  });

  return { numericColumns: numericCols, columnStats: stats, totalRows: rows.length, totalColumns: headers.length };
}

/** Upload file to Django backend */
async function uploadToBackend(file, analyzedSystems, meta) {
  const base = getApiBase();
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);

  const res = await fetch(`${base}/api/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  return res.json();
}

/** Fetch uploads list from backend */
async function fetchUploads() {
  const base = getApiBase();
  const token = getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(`${base}/api/uploads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/* ───────── component ───────── */
export default function ManualDataMode({ darkMode, orgId = "anon" }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, status: '' });
  const [parsedResults, setParsedResults] = useState([]);
  const [uploadStep, setUploadStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [analyzedDocuments, setAnalyzedDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(`conseqx_analyzed_docs_${orgId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const fileInputRef = useRef(null);

  // Load uploads from backend on mount
  useEffect(() => {
    let cancelled = false;
    fetchUploads().then(data => {
      if (!cancelled && Array.isArray(data)) setUploads(data);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Save analyzed docs to localStorage when they change
  useEffect(() => {
    try { localStorage.setItem(`conseqx_analyzed_docs_${orgId}`, JSON.stringify(analyzedDocuments)); } catch {}
  }, [analyzedDocuments, orgId]);

  const latestUpload = uploads.length ? uploads[0] : null;

  /* ── file selection ── */
  const handleFiles = useCallback(async (files) => {
    setUploadProgress({ show: true, progress: 10, status: 'Parsing files...' });

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ show: true, progress: 10 + Math.round((i / files.length) * 50), status: `Parsing ${file.name}...` });
      try {
        const parsed = await parseFile(file);
        const systems = detectSystems(parsed.headers, parsed.rows);
        const stats = computeStats(parsed.headers, parsed.rows);
        results.push({ file, parsed, systems, stats });
      } catch (err) {
        results.push({ file, parsed: null, systems: {}, stats: {}, error: err.message });
      }
    }
    setParsedResults(results);
    setUploadProgress({ show: false, progress: 0, status: '' });
    setUploadStep(2);
  }, []);

  /* ── process upload ── */
  const processUpload = async () => {
    setUploadProgress({ show: true, progress: 0, status: 'Uploading to server...' });

    const newDocs = [];
    let backendSuccess = 0;

    for (let i = 0; i < parsedResults.length; i++) {
      const { file, parsed, systems, stats, error: parseError } = parsedResults[i];
      const pct = Math.round(((i + 1) / parsedResults.length) * 90);
      setUploadProgress({ show: true, progress: pct, status: `Uploading ${file.name}...` });

      const analyzedSystems = Object.keys(systems);

      // Try backend upload
      let backendRecord = null;
      try {
        backendRecord = await uploadToBackend(file, analyzedSystems, {
          fileSize: file.size,
          recordCount: parsed?.recordCount || 0,
          columns: parsed?.headers || [],
        });
        backendSuccess++;
      } catch (err) {
        console.warn('Backend upload failed, storing locally:', err.message);
      }

      // Build local analyzed-doc record
      newDocs.push({
        id: backendRecord?.id || Date.now() + i,
        fileName: file.name,
        fileSize: file.size,
        analyzedDate: new Date().toISOString(),
        analyzedSystems,
        detectedSystems: systems,
        stats: stats || {},
        recordCount: parsed?.recordCount || 0,
        columnCount: parsed?.headers?.length || 0,
        columns: parsed?.headers || [],
        preview: parsed?.rows?.slice(0, 5) || null,
        dataType: file.name.split('.').pop().toLowerCase(),
        parseError: parseError || null,
        backendId: backendRecord?.id || null,
        orgId,
      });
    }

    setUploadProgress({ show: true, progress: 100, status: backendSuccess > 0 ? 'Upload complete!' : 'Files analyzed (stored locally).' });

    // Update state
    const updatedDocs = [...newDocs, ...analyzedDocuments].slice(0, 100);
    setAnalyzedDocuments(updatedDocs);

    // Refresh uploads from backend
    fetchUploads().then(data => { if (Array.isArray(data)) setUploads(data); });

    setTimeout(() => {
      setShowUploadWizard(false);
      setUploadProgress({ show: false, progress: 0, status: '' });
      setParsedResults([]);
      setUploadStep(1);
    }, 1500);
  };

  /* ── delete & export ── */
  const deleteDocument = (docId) => {
    setAnalyzedDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const exportDocument = (doc) => {
    const blob = new Blob([JSON.stringify({
      fileName: doc.fileName, analyzedDate: doc.analyzedDate, dataType: doc.dataType,
      analyzedSystems: doc.analyzedSystems, detectedSystems: doc.detectedSystems,
      stats: doc.stats, recordCount: doc.recordCount, columns: doc.columns, preview: doc.preview,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `analysis-${doc.fileName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportSnapshot = () => {
    const blob = new Blob([JSON.stringify({
      timestamp: new Date().toISOString(), uploads: uploads.slice(0, 10),
      analyzedDocuments: analyzedDocuments.slice(0, 10), orgId,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `conseqx-data-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ────────────────── RENDER ──────────────────
  return (
    <section className="relative">
      {/* ── Upload Wizard Modal ── */}
      {showUploadWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FaUpload className="text-blue-600" />
                  Data Upload Wizard
                </h3>
                <button onClick={() => { setShowUploadWizard(false); setUploadStep(1); setParsedResults([]); }}
                  className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}>
                  <FaTimes />
                </button>
              </div>

              {/* Progress */}
              {uploadProgress.show && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{uploadProgress.status}</span>
                    <span className="text-sm">{uploadProgress.progress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Step 1: File selection */}
              {uploadStep === 1 && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(Array.from(e.dataTransfer.files)); }}
                >
                  <FaUpload className={`mx-auto text-4xl mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium mb-2">Upload Organizational Data</p>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    CSV, Excel (.xlsx/.xls), JSON, or TXT files
                  </p>
                  <input ref={fileInputRef} type="file" multiple accept=".csv,.xlsx,.xls,.json,.txt"
                    onChange={(e) => { const f = Array.from(e.target.files || []); if (f.length) handleFiles(f); }}
                    className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Browse Files
                  </button>
                </div>
              )}

              {/* Step 2: Review parsed results */}
              {uploadStep === 2 && (
                <div>
                  <h4 className="font-semibold mb-4">Parsed Files ({parsedResults.length})</h4>
                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                    {parsedResults.map((result, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{result.file.name}</span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {(result.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        {result.error ? (
                          <div className="text-sm text-red-500">Parse error: {result.error}</div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                              <div><span className="font-medium">Records:</span> {result.parsed?.recordCount || 0}</div>
                              <div><span className="font-medium">Columns:</span> {result.parsed?.headers?.length || 0}</div>
                              {result.parsed?.sheetName && (
                                <div><span className="font-medium">Sheet:</span> {result.parsed.sheetName}</div>
                              )}
                              {result.stats?.numericColumns?.length > 0 && (
                                <div><span className="font-medium">Numeric cols:</span> {result.stats.numericColumns.length}</div>
                              )}
                            </div>

                            {/* Detected systems */}
                            {Object.keys(result.systems).length > 0 ? (
                              <div className="mt-2">
                                <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  Detected ConseQ-X Systems:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {Object.keys(result.systems).map(sysKey => {
                                    const sys = CANONICAL.find(c => c.key === sysKey);
                                    return (
                                      <span key={sysKey} className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                                        {sys?.title || sysKey}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No specific systems detected from column names
                              </div>
                            )}

                            {/* Column preview */}
                            {result.parsed?.headers?.length > 0 && (
                              <div className="mt-2">
                                <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Columns:</div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {result.parsed.headers.slice(0, 8).join(', ')}
                                  {result.parsed.headers.length > 8 && ` +${result.parsed.headers.length - 8} more`}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setUploadStep(1); setParsedResults([]); }}
                      className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}>
                      Back
                    </button>
                    <button onClick={processUpload}
                      disabled={parsedResults.length === 0 || parsedResults.every(r => r.error)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      <FaUpload size={12} />
                      Upload &amp; Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ── */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h3 className="text-xl font-bold">{selectedDocument.fileName}</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Analyzed on {new Date(selectedDocument.analyzedDate).toLocaleString()}
                </p>
              </div>
              <button onClick={() => { setShowDocumentViewer(false); setSelectedDocument(null); }}
                className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                <FaTimes size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
              {/* Document info */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Document Information</h4>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">File Name:</span> <span className="ml-2">{selectedDocument.fileName}</span></div>
                    <div><span className="font-medium">File Size:</span> <span className="ml-2">{selectedDocument.fileSize ? `${(selectedDocument.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</span></div>
                    <div><span className="font-medium">File Type:</span> <span className="ml-2 uppercase">{selectedDocument.dataType}</span></div>
                    <div><span className="font-medium">Records:</span> <span className="ml-2">{selectedDocument.recordCount ?? 'N/A'}</span></div>
                    <div><span className="font-medium">Columns:</span> <span className="ml-2">{selectedDocument.columnCount ?? 'N/A'}</span></div>
                    <div><span className="font-medium">Analyzed:</span> <span className="ml-2">{new Date(selectedDocument.analyzedDate).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Detected systems */}
              {selectedDocument.analyzedSystems?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Detected ConseQ-X Systems</h4>
                  <div className="space-y-2">
                    {selectedDocument.analyzedSystems.map(sysKey => {
                      const sys = CANONICAL.find(c => c.key === sysKey);
                      const detection = selectedDocument.detectedSystems?.[sysKey];
                      return (
                        <div key={sysKey} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{sys?.title || sysKey}</span>
                            <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                              {detection?.matchedKeywords || 0} keyword match{detection?.matchedKeywords !== 1 ? 'es' : ''}
                            </span>
                          </div>
                          {detection?.columnMatches?.length > 0 && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Matched: {detection.columnMatches.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Column statistics */}
              {selectedDocument.stats?.columnStats && Object.keys(selectedDocument.stats.columnStats).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Column Statistics</h4>
                  <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className="w-full text-sm">
                      <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Column</th>
                          <th className="px-4 py-2 text-right font-medium">Count</th>
                          <th className="px-4 py-2 text-right font-medium">Min</th>
                          <th className="px-4 py-2 text-right font-medium">Max</th>
                          <th className="px-4 py-2 text-right font-medium">Mean</th>
                          <th className="px-4 py-2 text-right font-medium">Median</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedDocument.stats.columnStats).map(([col, s]) => (
                          <tr key={col} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className="px-4 py-2 font-medium">{col}</td>
                            <td className="px-4 py-2 text-right">{s.count}</td>
                            <td className="px-4 py-2 text-right">{s.min}</td>
                            <td className="px-4 py-2 text-right">{s.max}</td>
                            <td className="px-4 py-2 text-right">{s.mean}</td>
                            <td className="px-4 py-2 text-right">{s.median}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Data preview */}
              {selectedDocument.preview && Array.isArray(selectedDocument.preview) && selectedDocument.preview.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Data Preview (First 5 Rows)</h4>
                  <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className="w-full text-sm">
                      <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                        <tr>
                          {Object.keys(selectedDocument.preview[0]).slice(0, 8).map(header => (
                            <th key={header} className={`px-4 py-2 text-left font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDocument.preview.map((row, idx) => (
                          <tr key={idx} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            {Object.values(row).slice(0, 8).map((val, i) => (
                              <td key={i} className="px-4 py-2">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedDocument.recordCount > 5 && (
                      <div className={`px-4 py-2 text-xs border-t ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                        Showing 5 of {selectedDocument.recordCount} rows
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All columns */}
              {selectedDocument.columns?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">All Columns ({selectedDocument.columns.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.columns.map((col, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            {latestUpload && (
              <div className="flex items-center gap-2 text-sm">
                <FaClock className="text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  Last upload: {new Date(latestUpload.timestamp_ms || latestUpload.created_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowUploadWizard(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
              <FaUpload /> Upload Data
            </button>
            <button onClick={exportSnapshot}
              className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}>
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`col-span-1 md:col-span-2 rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Uploads</div>
            <div className="text-4xl font-bold mt-2">
              {loading ? <FaSpinner className="animate-spin text-2xl" /> : uploads.length}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {latestUpload ? `Latest: ${latestUpload.name}` : 'Upload datasets to get started'}
            </div>
          </div>

          <div className={`rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyzed Documents</div>
            <div className="text-3xl font-bold mt-2">{analyzedDocuments.length}</div>
            <div className="text-sm text-gray-400 mt-2">With parsed data available</div>
          </div>
        </div>

        {/* Upload history + Analyzed documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload History */}
          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h4 className="font-semibold mb-3">Upload History</h4>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaSpinner className="animate-spin" /> Loading...
              </div>
            ) : uploads.length === 0 ? (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No uploads yet</div>
            ) : (
              <div className="space-y-3">
                {uploads.slice(0, 5).map((upload) => (
                  <div key={upload.id} className="border-l-2 border-blue-500 pl-3">
                    <div className="font-medium text-sm">{upload.name}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(upload.timestamp_ms || upload.created_at).toLocaleString()}
                    </div>
                    {upload.analyzed_systems?.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Systems: {upload.analyzed_systems.slice(0, 3).join(', ')}
                        {upload.analyzed_systems.length > 3 && ` +${upload.analyzed_systems.length - 3} more`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analyzed Documents */}
          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Analyzed Documents</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {analyzedDocuments.length} document{analyzedDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {analyzedDocuments.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <FaFileExport className="mx-auto mb-2 text-2xl opacity-50" />
                <div className="text-sm">No analyzed documents yet</div>
                <div className="text-xs mt-1">Upload and analyze documents to see them here</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {analyzedDocuments.slice(0, 10).map((doc) => (
                  <div key={doc.id} className={`border rounded-lg p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{doc.fileName}</div>
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(doc.analyzedDate).toLocaleDateString()} · {doc.recordCount} records · {doc.columnCount || 0} columns
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded uppercase flex-shrink-0 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                        {doc.dataType}
                      </span>
                    </div>

                    {doc.analyzedSystems?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {doc.analyzedSystems.slice(0, 3).map(sysKey => (
                          <span key={sysKey} className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {CANONICAL.find(c => c.key === sysKey)?.title || sysKey}
                          </span>
                        ))}
                        {doc.analyzedSystems.length > 3 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            +{doc.analyzedSystems.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedDocument(doc); setShowDocumentViewer(true); }}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                        <FaEye className="inline mr-1" /> View
                      </button>
                      <button onClick={() => exportDocument(doc)}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                        <FaFileExport className="inline mr-1" /> Export
                      </button>
                      <button onClick={() => { if (window.confirm(`Delete analysis for "${doc.fileName}"?`)) deleteDocument(doc.id); }}
                        className="px-2 py-1 rounded text-xs border text-red-600 bg-white dark:bg-gray-700 dark:text-red-400 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
