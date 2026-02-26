import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaPlus, FaTrash, FaEdit, FaEye, FaDownload, FaTimes,
  FaChartLine, FaMoneyBillWave, FaPercentage, FaUsers,
  FaLightbulb, FaCogs, FaExclamationTriangle, FaCheckCircle,
  FaTimesCircle, FaArrowUp, FaArrowDown, FaSearch,
  FaSortAmountDown, FaSortAmountUp, FaShieldAlt, FaChartBar,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ================================================================
   localStorage helpers
   ================================================================ */
const STORAGE_KEY = "conseqx_fin_metrics_v1";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function writeJSON(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

/* ================================================================
   Formatting helpers
   ================================================================ */
const genId = (prefix = "rec") => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000)}`;

function formatCurrency(n = 0) {
  try {
    const num = Number(n) || 0;
    if (num >= 1e9) return `\u20A6${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `\u20A6${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `\u20A6${(num / 1e3).toFixed(1)}K`;
    return `\u20A6${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  } catch { return `\u20A6${n}`; }
}
function formatCurrencyFull(n = 0) {
  try {
    return `\u20A6${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  } catch { return `\u20A6${n}`; }
}
function formatPercent(v = 0) {
  try {
    const num = Number(v);
    if (Number.isNaN(num)) return "\u2014";
    return `${num.toFixed(1)}%`;
  } catch { return `${v}%`; }
}
function prettyDate(ts) {
  try { return new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return String(ts); }
}

/* ================================================================
   Modal (styled, animated)
   ================================================================ */
function Modal({ open, title, children, onClose, footer, darkMode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        role="dialog" aria-modal="true"
        className={`relative z-10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl ${
          darkMode ? "bg-gray-900 border border-gray-700/60 text-gray-100" : "bg-white border border-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className={`rounded-lg p-1.5 transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"}`}>
            <FaTimes />
          </button>
        </div>
        <div className="text-sm">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-3">{footer}</div>}
      </motion.div>
    </div>
  );
}

/* ================================================================
   Sparkline (small SVG line chart)
   ================================================================ */
function Sparkline({ data = [], width = 120, height = 36, color = "#818cf8", darkMode }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-fill-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-fill-${color.replace("#","")})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ================================================================
   Health indicator badge
   ================================================================ */
function HealthBadge({ value, thresholds, darkMode }) {
  let level = "low";
  let color = "red";
  if (value >= thresholds.high) { level = "high"; color = "emerald"; }
  else if (value >= thresholds.mid) { level = "mid"; color = "amber"; }
  const colorMap = {
    emerald: darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700",
    amber: darkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700",
    red: darkMode ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700",
  };
  const labels = { high: "Healthy", mid: "Moderate", low: "At Risk" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colorMap[color]}`}>
      {labels[level]}
    </span>
  );
}

/* ================================================================
   TORIL System connection map
   ================================================================ */
const METRIC_SYSTEM_MAP = {
  annualRevenue: { system: "Orchestration", icon: <FaCogs className="text-[10px]" /> },
  operatingCost: { system: "Orchestration", icon: <FaCogs className="text-[10px]" /> },
  profitMarginPct: { system: "Orchestration", icon: <FaCogs className="text-[10px]" /> },
  costOfDelays: { system: "Investigation", icon: <FaSearch className="text-[10px]" /> },
  costOfErrors: { system: "Investigation", icon: <FaSearch className="text-[10px]" /> },
  customerRetentionPct: { system: "Interdependency", icon: <FaChartLine className="text-[10px]" /> },
  innovationBudget: { system: "Interpretation", icon: <FaLightbulb className="text-[10px]" /> },
  employeeTurnoverPct: { system: "Inlignment", icon: <FaUsers className="text-[10px]" /> },
};

/* ================================================================
   Field metadata
   ================================================================ */
const FIELDS = [
  { key: "annualRevenue",       label: "Annual Revenue",        type: "currency", icon: <FaMoneyBillWave /> },
  { key: "operatingCost",       label: "Operating Cost",        type: "currency", icon: <FaCogs /> },
  { key: "profitMarginPct",     label: "Profit Margin",         type: "pct",      icon: <FaPercentage /> },
  { key: "costOfDelays",        label: "Cost of Delays",        type: "currency", icon: <FaExclamationTriangle /> },
  { key: "costOfErrors",        label: "Cost of Errors",        type: "currency", icon: <FaExclamationTriangle /> },
  { key: "customerRetentionPct",label: "Customer Retention",    type: "pct",      icon: <FaUsers /> },
  { key: "innovationBudget",    label: "Innovation Budget",     type: "currency", icon: <FaLightbulb /> },
  { key: "employeeTurnoverPct", label: "Employee Turnover",     type: "pct",      icon: <FaUsers /> },
];

/* ================================================================
   Main Component
   ================================================================ */
export default function CEORevenue() {
  const { darkMode } = useOutletContext();

  /* ---------- persisted records ---------- */
  const [records, setRecords] = useState(() => readJSON(STORAGE_KEY, []));

  /* ---------- form state ---------- */
  const blankForm = {
    annualRevenue: "", operatingCost: "", profitMarginPct: "",
    costOfDelays: "", costOfErrors: "", customerRetentionPct: "",
    innovationBudget: "", employeeTurnoverPct: "",
  };
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [formOpen, setFormOpen] = useState(false);

  /* ---------- UI state ---------- */
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  /* ---------- persist ---------- */
  useEffect(() => writeJSON(STORAGE_KEY, records), [records]);

  /* ---------- validation ---------- */
  function validate(values) {
    const e = {};
    const numberFields = ["annualRevenue", "operatingCost", "costOfDelays", "costOfErrors", "innovationBudget"];
    const pctFields = ["profitMarginPct", "customerRetentionPct", "employeeTurnoverPct"];
    Object.entries(values).forEach(([k, v]) => {
      if (numberFields.includes(k)) {
        const n = Number(String(v).replace(/[, ]+/g, ""));
        if (v === "" || Number.isNaN(n) || n < 0) e[k] = "Enter a non-negative number.";
      }
      if (pctFields.includes(k)) {
        const n = Number(String(v).replace(/[, ]+/g, ""));
        if (v === "" || Number.isNaN(n) || n < 0 || n > 100) e[k] = "Enter 0\u2013100.";
      }
    });
    return e;
  }

  function normalizeNum(v) {
    const cleaned = String(v).replace(/[,\s]+/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  /* ---------- CRUD ---------- */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function handleAdd(e) {
    e?.preventDefault?.();
    const eobj = validate(form);
    if (Object.keys(eobj).length) { setErrors(eobj); return; }
    const rec = {
      id: genId("fin"), createdAt: Date.now(),
      annualRevenue: normalizeNum(form.annualRevenue) || 0,
      operatingCost: normalizeNum(form.operatingCost) || 0,
      profitMarginPct: Number(form.profitMarginPct) || 0,
      costOfDelays: normalizeNum(form.costOfDelays) || 0,
      costOfErrors: normalizeNum(form.costOfErrors) || 0,
      customerRetentionPct: Number(form.customerRetentionPct) || 0,
      innovationBudget: normalizeNum(form.innovationBudget) || 0,
      employeeTurnoverPct: Number(form.employeeTurnoverPct) || 0,
    };
    setRecords((prev) => [rec, ...prev]);
    setForm(blankForm);
    setErrors({});
    setFormOpen(false);
  }

  function openEdit(r) {
    setEditRecord(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? "")])));
    setEditErrors({});
  }
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditRecord((p) => ({ ...p, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: null }));
  }
  function saveEdit() {
    const eobj = validate(editRecord);
    if (Object.keys(eobj).length) { setEditErrors(eobj); return; }
    setRecords((prev) =>
      prev.map((r) =>
        r.id === editRecord.id
          ? {
              ...r,
              annualRevenue: normalizeNum(editRecord.annualRevenue) || 0,
              operatingCost: normalizeNum(editRecord.operatingCost) || 0,
              profitMarginPct: Number(editRecord.profitMarginPct) || 0,
              costOfDelays: normalizeNum(editRecord.costOfDelays) || 0,
              costOfErrors: normalizeNum(editRecord.costOfErrors) || 0,
              customerRetentionPct: Number(editRecord.customerRetentionPct) || 0,
              innovationBudget: normalizeNum(editRecord.innovationBudget) || 0,
              employeeTurnoverPct: Number(editRecord.employeeTurnoverPct) || 0,
            }
          : r
      )
    );
    setEditRecord(null);
    setEditErrors({});
  }

  function doDelete() {
    setRecords((prev) => prev.filter((r) => r.id !== confirmDelete.id));
    setConfirmDelete({ open: false, id: null });
  }

  /* ---------- CSV export ---------- */
  function downloadCSV() {
    const header = ["id", "createdAt", ...FIELDS.map(f => f.key)];
    const rows = records.map((r) =>
      header.map((h) => h === "createdAt" ? new Date(r.createdAt).toISOString() : String(r[h] ?? "")).join(",")
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `org-metrics-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ---------- computed values ---------- */
  const latest = records.length ? records[0] : null;
  const previous = records.length > 1 ? records[1] : null;

  /* Delta helper */
  function delta(key) {
    if (!latest || !previous) return null;
    const cur = latest[key] ?? 0;
    const prev = previous[key] ?? 0;
    if (prev === 0) return null;
    return ((cur - prev) / prev) * 100;
  }

  /* Trend arrays (reverse chronological → chronological for sparkline) */
  const trendData = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.createdAt - b.createdAt);
    const result = {};
    FIELDS.forEach(f => { result[f.key] = sorted.map(r => r[f.key] ?? 0); });
    return result;
  }, [records]);

  /* Averages */
  const averages = useMemo(() => {
    if (!records.length) return {};
    const result = {};
    FIELDS.forEach(f => {
      const sum = records.reduce((s, r) => s + (r[f.key] ?? 0), 0);
      result[f.key] = sum / records.length;
    });
    return result;
  }, [records]);

  /* Organizational health score (simplified composite) */
  const orgHealthScore = useMemo(() => {
    if (!latest) return null;
    const profitHealth = Math.min(100, (latest.profitMarginPct / 30) * 100);
    const retentionHealth = latest.customerRetentionPct;
    const turnoverHealth = Math.max(0, 100 - latest.employeeTurnoverPct * 5);
    const innovationRatio = latest.annualRevenue > 0
      ? Math.min(100, (latest.innovationBudget / latest.annualRevenue) * 100 * 10)
      : 0;
    const delayRisk = latest.annualRevenue > 0
      ? Math.max(0, 100 - ((latest.costOfDelays + latest.costOfErrors) / latest.annualRevenue) * 100 * 5)
      : 50;
    return Math.round((profitHealth * 0.25 + retentionHealth * 0.25 + turnoverHealth * 0.2 + innovationRatio * 0.15 + delayRisk * 0.15));
  }, [latest]);

  /* Filtered & sorted records */
  const filteredRecords = useMemo(() => {
    let list = [...records];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r => {
        const dateStr = new Date(r.createdAt).toLocaleString().toLowerCase();
        const valueStr = FIELDS.map(f => String(r[f.key])).join(" ").toLowerCase();
        return dateStr.includes(q) || valueStr.includes(q) || r.id.toLowerCase().includes(q);
      });
    }
    list.sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return list;
  }, [records, query, sortBy, sortDir]);

  /* ---------- style helpers ---------- */
  const cardBg = darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-100";
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all outline-none ${
    darkMode
      ? "bg-gray-800/50 border-gray-700 text-gray-100 focus:border-indigo-500 placeholder-gray-500"
      : "bg-gray-50/80 border-gray-200 text-gray-900 focus:border-indigo-500 placeholder-gray-400"
  } focus:ring-2 focus:ring-indigo-500/20`;

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 pb-8 max-w-6xl mx-auto"
    >
      {/* Modals */}
      <AnimatePresence>
        {/* View Modal */}
        {viewRecord && (
          <Modal open title="Record Details" onClose={() => setViewRecord(null)} darkMode={darkMode}
            footer={
              <button onClick={() => setViewRecord(null)} className={`px-4 py-2.5 rounded-xl text-sm font-medium ${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                Close
              </button>
            }
          >
            <div className="space-y-3">
              <div className={`text-xs mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Recorded: {prettyDate(viewRecord.createdAt)} &middot; ID: {viewRecord.id}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FIELDS.map(f => (
                  <div key={f.key} className={`p-3 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                    <div className={`text-xs font-medium mb-1 flex items-center gap-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {f.icon} {f.label}
                    </div>
                    <div className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {f.type === "currency" ? formatCurrencyFull(viewRecord[f.key]) : formatPercent(viewRecord[f.key])}
                    </div>
                    <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                      {METRIC_SYSTEM_MAP[f.key]?.icon} {METRIC_SYSTEM_MAP[f.key]?.system} System
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {editRecord && (
          <Modal open title="Edit Record" onClose={() => { setEditRecord(null); setEditErrors({}); }} darkMode={darkMode}
            footer={
              <>
                <button onClick={() => { setEditRecord(null); setEditErrors({}); }} className={`px-4 py-2.5 rounded-xl text-sm font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>Cancel</button>
                <button onClick={saveEdit} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">Save Changes</button>
              </>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{f.label} {f.type === "pct" && "(0\u2013100)"}</label>
                  <input
                    name={f.key} value={editRecord[f.key] ?? ""}
                    onChange={handleEditChange}
                    inputMode="numeric"
                    className={`${inputCls} mt-1 ${editErrors[f.key] ? "!border-red-500" : ""}`}
                  />
                  {editErrors[f.key] && <div className="text-xs text-red-500 mt-0.5">{editErrors[f.key]}</div>}
                </div>
              ))}
            </div>
          </Modal>
        )}

        {/* Delete Confirm Modal */}
        {confirmDelete.open && (
          <Modal open title="Delete Record?" onClose={() => setConfirmDelete({ open: false, id: null })} darkMode={darkMode}
            footer={
              <>
                <button onClick={() => setConfirmDelete({ open: false, id: null })} className={`px-4 py-2.5 rounded-xl text-sm font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>Cancel</button>
                <button onClick={doDelete} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700">Delete</button>
              </>
            }
          >
            <p>This record will be permanently removed. This action cannot be undone.</p>
          </Modal>
        )}
      </AnimatePresence>

      {/* ============================================================
          ACTION BAR (page title comes from dashboard layout)
          ============================================================ */}
      <div className="flex items-center justify-end flex-wrap gap-2">
        {records.length > 0 && (
          <button
            onClick={downloadCSV}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              darkMode ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <FaDownload className="text-[10px]" /> Export CSV
          </button>
        )}
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <FaPlus /> New Record
        </button>
      </div>

      {/* ============================================================
          ORG HEALTH OVERVIEW HERO
          ============================================================ */}
      {latest ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)"
              : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)",
            borderColor: darkMode ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)",
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full" style={{ background: darkMode ? "rgba(129,140,248,0.08)" : "rgba(99,102,241,0.06)" }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style={{ background: darkMode ? "rgba(167,139,250,0.06)" : "rgba(139,92,246,0.04)" }} />

          <div className="relative z-10 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-indigo-300" : "text-indigo-500"}`}>
                  Organizational Health Composite
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-4xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {orgHealthScore}%
                  </span>
                  <HealthBadge
                    value={orgHealthScore}
                    thresholds={{ high: 70, mid: 45 }}
                    darkMode={darkMode}
                  />
                </div>
                <div className={`text-xs mt-1 ${darkMode ? "text-indigo-200/60" : "text-indigo-500/60"}`}>
                  Based on latest record &middot; {prettyDate(latest.createdAt)} &middot; {records.length} total record{records.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium ${
                darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-600"
              }`}>
                <FaShieldAlt className="text-[9px]" /> Data stored locally
              </div>
            </div>

            {/* KPI Cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "annualRevenue", label: "Revenue", format: formatCurrency, color: "#6366f1" },
                { key: "profitMarginPct", label: "Profit Margin", format: formatPercent, color: "#10b981" },
                { key: "customerRetentionPct", label: "Customer Retention", format: formatPercent, color: "#3b82f6" },
                { key: "employeeTurnoverPct", label: "Employee Turnover", format: formatPercent, color: "#f59e0b", inverted: true },
              ].map(kpi => {
                const d = delta(kpi.key);
                const isInverted = kpi.inverted;
                const isPositive = d !== null ? (isInverted ? d < 0 : d > 0) : null;
                return (
                  <div
                    key={kpi.key}
                    className={`p-4 rounded-xl backdrop-blur-sm ${
                      darkMode ? "bg-white/5 border border-white/10" : "bg-white/60 border border-white/40"
                    }`}
                  >
                    <div className={`text-[11px] font-medium mb-1 ${darkMode ? "text-indigo-200/70" : "text-indigo-600/70"}`}>{kpi.label}</div>
                    <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {kpi.format(latest[kpi.key])}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      {d !== null ? (
                        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                          isPositive ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {isPositive ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                          {Math.abs(d).toFixed(1)}%
                        </span>
                      ) : (
                        <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>\u2014</span>
                      )}
                      <Sparkline
                        data={trendData[kpi.key]}
                        width={60} height={24}
                        color={kpi.color}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty state hero */
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-center py-16 rounded-2xl border-2 border-dashed ${
            darkMode ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50/50"
          }`}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            darkMode ? "bg-indigo-500/10" : "bg-indigo-50"
          }`}>
            <FaChartBar className={`text-2xl ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            No Metrics Recorded Yet
          </h3>
          <p className={`text-sm max-w-md mx-auto mb-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Start by adding your organization's financial and operational metrics.
            These KPIs connect to the TORIL Six-System framework to provide a holistic
            view of organizational health.
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            <FaPlus /> Add First Record
          </button>
        </motion.div>
      )}

      {/* ============================================================
          ADD RECORD FORM (collapsible)
          ============================================================ */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`rounded-2xl border p-6 ${cardBg}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-indigo-500/15" : "bg-indigo-50"}`}>
                    <FaPlus className={`text-sm ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>New Metrics Record</h3>
                    <p className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Enter your latest organizational KPIs</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFormOpen(false); setForm(blankForm); setErrors({}); }}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"}`}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAdd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {FIELDS.map(f => (
                    <div key={f.key}>
                      <label className={`text-xs font-medium flex items-center gap-1.5 mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {f.icon} {f.label}
                        {f.type === "pct" && <span className={`${darkMode ? "text-gray-600" : "text-gray-400"}`}>(%)</span>}
                      </label>
                      <input
                        name={f.key} value={form[f.key]} onChange={handleChange}
                        placeholder={f.type === "pct" ? "0\u2013100" : "Amount in \u20A6"}
                        inputMode="numeric"
                        className={`${inputCls} ${errors[f.key] ? "!border-red-500" : ""}`}
                      />
                      {errors[f.key] && (
                        <div className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                          <FaTimesCircle className="text-[9px]" /> {errors[f.key]}
                        </div>
                      )}
                      <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                        {METRIC_SYSTEM_MAP[f.key]?.icon} Links to {METRIC_SYSTEM_MAP[f.key]?.system}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 mt-5 pt-4" style={{ borderTop: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                  <button
                    type="button"
                    onClick={() => { setFormOpen(false); setForm(blankForm); setErrors({}); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    <FaCheckCircle /> Save Record
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          DETAILED METRICS GRID (from latest record)
          ============================================================ */}
      {latest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <h3 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            Latest Metrics Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FIELDS.map((f, i) => {
              const d = delta(f.key);
              const isInverted = f.key === "employeeTurnoverPct" || f.key === "costOfDelays" || f.key === "costOfErrors";
              const isPositive = d !== null ? (isInverted ? d < 0 : d > 0) : null;
              const thresholds = f.type === "pct"
                ? (isInverted ? { high: 90, mid: 80 } : { high: 70, mid: 40 })
                : null;

              return (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`group relative rounded-2xl border p-4 transition-all hover:shadow-md ${
                    darkMode
                      ? "bg-gray-900/80 border-gray-800 hover:border-gray-700"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-2 text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span className={`${darkMode ? "text-indigo-400" : "text-indigo-500"}`}>{f.icon}</span>
                      {f.label}
                    </div>
                    {f.type === "pct" && thresholds && (
                      <HealthBadge
                        value={isInverted ? 100 - latest[f.key] : latest[f.key]}
                        thresholds={thresholds}
                        darkMode={darkMode}
                      />
                    )}
                  </div>

                  <div className={`text-xl font-bold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                    {f.type === "currency" ? formatCurrency(latest[f.key]) : formatPercent(latest[f.key])}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {d !== null && (
                        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                          isPositive ? "text-emerald-500" : "text-red-500"
                        }`}>
                          {isPositive ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                          {Math.abs(d).toFixed(1)}% vs prev
                        </span>
                      )}
                      <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                        Avg: {f.type === "currency" ? formatCurrency(averages[f.key]) : formatPercent(averages[f.key])}
                      </span>
                    </div>
                    <Sparkline
                      data={trendData[f.key]}
                      width={50} height={20}
                      color={darkMode ? "#818cf8" : "#6366f1"}
                      darkMode={darkMode}
                    />
                  </div>

                  <div className={`mt-2 pt-2 text-[10px] flex items-center gap-1 ${darkMode ? "text-gray-600 border-t border-gray-800" : "text-gray-400 border-t border-gray-100"}`}>
                    {METRIC_SYSTEM_MAP[f.key]?.icon} {METRIC_SYSTEM_MAP[f.key]?.system} System
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ============================================================
          RECORDS TABLE
          ============================================================ */}
      {records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`rounded-2xl border p-6 ${cardBg}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-500/15" : "bg-indigo-50"}`}>
                <FaChartLine className={`text-sm ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
              </div>
              <div>
                <h3 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Records History</h3>
                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {records.length} record{records.length !== 1 ? "s" : ""} &middot; Sorted by {sortBy === "createdAt" ? "date" : sortBy}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search records..."
                  className={`pl-8 pr-3 py-2 rounded-xl border text-xs w-full sm:w-48 ${
                    darkMode ? "bg-gray-800/50 border-gray-700 text-gray-300 placeholder-gray-600" : "bg-gray-50/80 border-gray-200 text-gray-700 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy} onChange={e => setSortBy(e.target.value)}
                className={`px-2 py-2 rounded-xl border text-xs ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}
              >
                <option value="createdAt">Date</option>
                {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
              <button
                onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                className={`p-2 rounded-xl border text-xs transition-colors ${darkMode ? "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200" : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700"}`}
                title={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
              >
                {sortDir === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-[11px] uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <th className="text-left py-2 px-2 font-semibold">Date</th>
                  <th className="text-right py-2 px-2 font-semibold">Revenue</th>
                  <th className="text-right py-2 px-2 font-semibold hidden lg:table-cell">Op. Cost</th>
                  <th className="text-right py-2 px-2 font-semibold">Margin</th>
                  <th className="text-right py-2 px-2 font-semibold hidden lg:table-cell">Retention</th>
                  <th className="text-right py-2 px-2 font-semibold hidden md:table-cell">Turnover</th>
                  <th className="text-right py-2 px-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group border-t transition-colors ${
                      darkMode ? "border-gray-800 hover:bg-gray-800/40" : "border-gray-100 hover:bg-gray-50/70"
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{prettyDate(r.createdAt)}</div>
                      <div className={`text-[10px] font-mono ${darkMode ? "text-gray-600" : "text-gray-400"}`}>{r.id}</div>
                    </td>
                    <td className={`py-3 px-2 text-right font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {formatCurrency(r.annualRevenue)}
                    </td>
                    <td className={`py-3 px-2 text-right hidden lg:table-cell ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formatCurrency(r.operatingCost)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.profitMarginPct >= 20
                          ? (darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700")
                          : r.profitMarginPct >= 10
                            ? (darkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700")
                            : (darkMode ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700")
                      }`}>
                        {formatPercent(r.profitMarginPct)}
                      </span>
                    </td>
                    <td className={`py-3 px-2 text-right hidden lg:table-cell ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formatPercent(r.customerRetentionPct)}
                    </td>
                    <td className={`py-3 px-2 text-right hidden md:table-cell ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formatPercent(r.employeeTurnoverPct)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewRecord(r)} title="View" className={`p-1.5 rounded-lg text-xs transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-indigo-400" : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                          <FaEye />
                        </button>
                        <button onClick={() => openEdit(r)} title="Edit" className={`p-1.5 rounded-lg text-xs transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-amber-400" : "text-gray-400 hover:bg-amber-50 hover:text-amber-600"}`}>
                          <FaEdit />
                        </button>
                        <button onClick={() => setConfirmDelete({ open: true, id: r.id })} title="Delete" className={`p-1.5 rounded-lg text-xs transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-600"}`}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && records.length > 0 && (
              <div className={`text-center py-8 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                No records match your search.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ============================================================
          TORIL SYSTEM CONNECTIONS (contextual)
          ============================================================ */}
      {latest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className={`rounded-2xl border p-6 ${cardBg}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? "bg-purple-500/15" : "bg-purple-50"}`}>
              <FaShieldAlt className={`text-sm ${darkMode ? "text-purple-400" : "text-purple-500"}`} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>TORIL System Connections</h3>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                How your metrics relate to the Six-System organizational health framework
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                system: "Orchestration",
                color: darkMode ? "from-indigo-500/10 to-blue-500/5" : "from-indigo-50 to-blue-50",
                borderColor: darkMode ? "border-indigo-500/20" : "border-indigo-200",
                icon: <FaCogs className={darkMode ? "text-indigo-400" : "text-indigo-500"} />,
                metrics: ["Revenue", "Operating Cost", "Profit Margin"],
                insight: latest.profitMarginPct >= 20
                  ? "Strong operational efficiency \u2014 systems are well-orchestrated."
                  : latest.profitMarginPct >= 10
                    ? "Moderate efficiency \u2014 review process bottlenecks."
                    : "Low margins suggest systemic operational issues."
              },
              {
                system: "Investigation",
                color: darkMode ? "from-amber-500/10 to-orange-500/5" : "from-amber-50 to-orange-50",
                borderColor: darkMode ? "border-amber-500/20" : "border-amber-200",
                icon: <FaSearch className={darkMode ? "text-amber-400" : "text-amber-500"} />,
                metrics: ["Cost of Delays", "Cost of Errors"],
                insight: latest.annualRevenue > 0 && ((latest.costOfDelays + latest.costOfErrors) / latest.annualRevenue) < 0.05
                  ? "Low waste ratio \u2014 root cause processes are effective."
                  : "High delay/error costs \u2014 invest in diagnostic capability."
              },
              {
                system: "Interdependency",
                color: darkMode ? "from-blue-500/10 to-cyan-500/5" : "from-blue-50 to-cyan-50",
                borderColor: darkMode ? "border-blue-500/20" : "border-blue-200",
                icon: <FaUsers className={darkMode ? "text-blue-400" : "text-blue-500"} />,
                metrics: ["Customer Retention"],
                insight: latest.customerRetentionPct >= 85
                  ? "High retention \u2014 strong stakeholder interdependencies."
                  : "Retention below target \u2014 assess cross-functional collaboration."
              },
              {
                system: "Interpretation",
                color: darkMode ? "from-purple-500/10 to-pink-500/5" : "from-purple-50 to-pink-50",
                borderColor: darkMode ? "border-purple-500/20" : "border-purple-200",
                icon: <FaLightbulb className={darkMode ? "text-purple-400" : "text-purple-500"} />,
                metrics: ["Innovation Budget"],
                insight: latest.annualRevenue > 0 && (latest.innovationBudget / latest.annualRevenue) >= 0.05
                  ? "Healthy innovation allocation \u2014 supports adaptive capacity."
                  : "Consider increasing R&D investment for strategic resilience."
              },
              {
                system: "Inlignment",
                color: darkMode ? "from-emerald-500/10 to-teal-500/5" : "from-emerald-50 to-teal-50",
                borderColor: darkMode ? "border-emerald-500/20" : "border-emerald-200",
                icon: <FaUsers className={darkMode ? "text-emerald-400" : "text-emerald-500"} />,
                metrics: ["Employee Turnover"],
                insight: latest.employeeTurnoverPct <= 10
                  ? "Low turnover \u2014 workforce is well-aligned with purpose."
                  : "High turnover indicates alignment or culture gaps."
              },
              {
                system: "Illustration",
                color: darkMode ? "from-sky-500/10 to-blue-500/5" : "from-sky-50 to-blue-50",
                borderColor: darkMode ? "border-sky-500/20" : "border-sky-200",
                icon: <FaChartBar className={darkMode ? "text-sky-400" : "text-sky-500"} />,
                metrics: ["All Metrics Tracked"],
                insight: records.length >= 3
                  ? "Good data history \u2014 trends are becoming visible."
                  : "Add more records to build meaningful trend illustrations."
              },
            ].map((sys, i) => (
              <motion.div
                key={sys.system}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`rounded-xl border p-4 bg-gradient-to-br ${sys.color} ${sys.borderColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {sys.icon}
                  <span className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{sys.system}</span>
                </div>
                <div className={`text-xs mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Linked metrics: {sys.metrics.join(", ")}
                </div>
                <div className={`text-xs leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {sys.insight}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
