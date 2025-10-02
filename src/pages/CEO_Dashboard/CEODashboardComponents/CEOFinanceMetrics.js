// src/pages/CEO_Dashboard/CEODashboardComponents/CEOFinanceMetrics.js
import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaPlus, FaTrash, FaEdit, FaEye, FaDownload } from "react-icons/fa";

const STORAGE_KEY = "conseqx_fin_metrics_v1";

const genId = (prefix = "rec") => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000)}`;

const formatCurrency = (n = 0) => {
  try {
    const num = Number(n) || 0;
    return `₦${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  } catch {
    return `₦${n}`;
  }
};
const formatPercent = (v = 0) => {
  try {
    const num = Number(v);
    if (Number.isNaN(num)) return "—";
    return `${Number(num).toFixed(2)}%`;
  } catch {
    return `${v}%`;
  }
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

/* ---------- small Modal primitive ---------- */
function Modal({ open, title, children, onClose, footer, darkMode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(2,6,23,0.6)" : "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-2xl mx-auto rounded-2xl p-5 sm:p-6 ${
          darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"
        } shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>

        {footer && <div className="mt-4 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export default function CEOFinanceMetrics() {
  const { darkMode } = useOutletContext();

  // records persisted
  const [records, setRecords] = useState(() => readJSON(STORAGE_KEY, []));

  // form state (for add)
  const initialForm = {
    annualRevenue: "",
    operatingCost: "",
    profitMarginPct: "",
    costOfDelays: "",
    costOfErrors: "",
    customerRetentionPct: "",
    innovationBudget: "",
    employeeTurnoverPct: "",
  };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // UI state
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // or annualRevenue, etc
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => writeJSON(STORAGE_KEY, records), [records]);

  /* ---------- validation ---------- */
  function validate(values) {
    const e = {};
    function isNumberField(k) {
      return ["annualRevenue", "operatingCost", "costOfDelays", "costOfErrors", "innovationBudget"].includes(k);
    }
    function isPctField(k) {
      return ["profitMarginPct", "customerRetentionPct", "employeeTurnoverPct"].includes(k);
    }

    Object.entries(values).forEach(([k, v]) => {
      if (isNumberField(k)) {
        const n = Number(String(v).replace(/[, ]+/g, ""));
        if (v === "" || Number.isNaN(n) || n < 0) e[k] = "Enter a non-negative number.";
      }
      if (isPctField(k)) {
        const n = Number(String(v).replace(/[, ]+/g, ""));
        if (v === "" || Number.isNaN(n) || n < 0 || n > 100) e[k] = "Enter a percentage (0–100).";
      }
    });

    return e;
  }

  /* ---------- create record ---------- */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function normalizeNumberInput(v) {
    // strip commas/spaces
    const cleaned = String(v).replace(/[,\s]+/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function handleAdd(e) {
    e?.preventDefault?.();

    const eobj = validate(form);
    if (Object.keys(eobj).length) {
      setErrors(eobj);
      return;
    }

    const rec = {
      id: genId("fin"),
      createdAt: Date.now(),
      annualRevenue: normalizeNumberInput(form.annualRevenue) || 0,
      operatingCost: normalizeNumberInput(form.operatingCost) || 0,
      profitMarginPct: Number(form.profitMarginPct) || 0,
      costOfDelays: normalizeNumberInput(form.costOfDelays) || 0,
      costOfErrors: normalizeNumberInput(form.costOfErrors) || 0,
      customerRetentionPct: Number(form.customerRetentionPct) || 0,
      innovationBudget: normalizeNumberInput(form.innovationBudget) || 0,
      employeeTurnoverPct: Number(form.employeeTurnoverPct) || 0,
    };

    setRecords((prev) => [rec, ...prev]);
    setForm(initialForm);
    setErrors({});
  }

  /* ---------- edit record ---------- */
  function openEdit(r) {
    setEditRecord({
      ...r,
      annualRevenue: String(r.annualRevenue ?? ""),
      operatingCost: String(r.operatingCost ?? ""),
      profitMarginPct: String(r.profitMarginPct ?? ""),
      costOfDelays: String(r.costOfDelays ?? ""),
      costOfErrors: String(r.costOfErrors ?? ""),
      customerRetentionPct: String(r.customerRetentionPct ?? ""),
      innovationBudget: String(r.innovationBudget ?? ""),
      employeeTurnoverPct: String(r.employeeTurnoverPct ?? ""),
    });
  }
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditRecord((p) => ({ ...p, [name]: value }));
  }
  function saveEdit() {
    const eobj = validate(editRecord);
    if (Object.keys(eobj).length) {
      setErrors(eobj);
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.id === editRecord.id
          ? {
              ...r,
              annualRevenue: normalizeNumberInput(editRecord.annualRevenue) || 0,
              operatingCost: normalizeNumberInput(editRecord.operatingCost) || 0,
              profitMarginPct: Number(editRecord.profitMarginPct) || 0,
              costOfDelays: normalizeNumberInput(editRecord.costOfDelays) || 0,
              costOfErrors: normalizeNumberInput(editRecord.costOfErrors) || 0,
              customerRetentionPct: Number(editRecord.customerRetentionPct) || 0,
              innovationBudget: normalizeNumberInput(editRecord.innovationBudget) || 0,
              employeeTurnoverPct: Number(editRecord.employeeTurnoverPct) || 0,
            }
          : r
      )
    );
    setEditRecord(null);
    setErrors({});
  }

  /* ---------- delete ---------- */
  function confirmDeleteRecord(id) {
    setConfirmDelete({ open: true, id });
  }
  function doDelete() {
    setRecords((prev) => prev.filter((r) => r.id !== confirmDelete.id));
    setConfirmDelete({ open: false, id: null });
  }

  /* ---------- view ---------- */
  function openView(r) {
    setViewRecord(r);
  }

  /* ---------- export CSV ---------- */
  function csvFor(recordsToExport) {
    const header = [
      "id",
      "createdAt",
      "annualRevenue",
      "operatingCost",
      "profitMarginPct",
      "costOfDelays",
      "costOfErrors",
      "customerRetentionPct",
      "innovationBudget",
      "employeeTurnoverPct",
    ];
    const rows = recordsToExport.map((r) =>
      header
        .map((h) => {
          if (h === "createdAt") return new Date(r.createdAt).toISOString();
          return String(r[h] ?? "");
        })
        .join(",")
    );
    return [header.join(","), ...rows].join("\n");
  }
  function downloadCSV(all = true, rec = null) {
    const data = all ? csvFor(records) : csvFor([rec]);
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = all ? `fin-records-${Date.now()}.csv` : `fin-record-${rec.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ---------- search, sort ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = records.slice();
    if (q) {
      list = list.filter(
        (r) =>
          String(r.id).toLowerCase().includes(q) ||
          String(r.annualRevenue).toLowerCase().includes(q) ||
          String(r.operatingCost).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "createdAt") return (a.createdAt - b.createdAt) * dir;
      return (Number(a[sortBy] ?? 0) - Number(b[sortBy] ?? 0)) * dir;
    });

    return list;
  }, [records, query, sortBy, sortDir]);

  /* ---------- KPIs ---------- */
  const kpis = useMemo(() => {
    if (!records || records.length === 0) return { count: 0 };
    const latest = records[0];
    const avg = {
      annualRevenue: Math.round(records.reduce((s, r) => s + (Number(r.annualRevenue) || 0), 0) / records.length),
      operatingCost: Math.round(records.reduce((s, r) => s + (Number(r.operatingCost) || 0), 0) / records.length),
      profitMarginPct: records.reduce((s, r) => s + (Number(r.profitMarginPct) || 0), 0) / records.length,
    };
    return { count: records.length, latest, avg };
  }, [records]);

  /* ---------- small utility: hide scrollbar but keep scrollable ---------- */
  const noScrollbarStyle = `
    /* horizontal hidden scrollbar but scrollable */
    .hide-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
    .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .hide-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 8px; }
    .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    /* on focus/hover show subtle indicator for accessibility */
    .hide-scrollbar:focus-visible, .hide-scrollbar:hover { outline: none; }
    .hide-scrollbar.show-thumb::-webkit-scrollbar { display: block; }
    .hide-scrollbar.show-thumb::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); }
  `;

  /* Helper to compute KPI card classes using darkMode prop (so 'dark:' isn't required) */
  const kpiCardBase = "p-3 rounded-lg border";
  const kpiCardLightVariants = {
    revenue: "bg-gradient-to-br from-indigo-50 to-white border-transparent",
    cost: "bg-gradient-to-br from-yellow-50 to-white border-transparent",
    profit: "bg-gradient-to-br from-green-50 to-white border-transparent",
  };
  const kpiCardDark = "bg-gray-800 border-gray-700";

  return (
    <section className="relative">
      <style>{noScrollbarStyle}</style>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            Financial & Operational Metrics
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} max-w-xl`}>
            Enter your company's revenue, costs and operational KPIs. Records are saved locally for tracking and export.
          </p>
        </div>

        <div className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"} text-right`}>
          <div>Records: <strong>{kpis.count ?? 0}</strong></div>
          {kpis.latest && <div className="text-xs text-gray-500">Latest: {new Date(kpis.latest.createdAt).toLocaleString()}</div>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form
          onSubmit={handleAdd}
          className={`rounded-2xl p-4 lg:col-span-1 shadow-sm space-y-3 ${
            darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"
          }`}
        >
          <div className="flex items-start gap-3 mb-1">
            <div className="rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2">
              <FaPlus />
            </div>
            <div className="min-w-0">
              <div className="font-medium">Add company metrics</div>
              <div className="text-xs text-gray-400">Create a new snapshot of your company's financials</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs text-gray-400">Annual Revenue</label>
            <input
              name="annualRevenue"
              value={form.annualRevenue}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 12,000,000"
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-0 ${
                darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
              }`}
            />
            {errors.annualRevenue && <div className="text-xs text-red-400">{errors.annualRevenue}</div>}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs text-gray-400">Operating Cost</label>
            <input
              name="operatingCost"
              value={form.operatingCost}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 6,000,000"
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-0 ${
                darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
              }`}
            />
            {errors.operatingCost && <div className="text-xs text-red-400">{errors.operatingCost}</div>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Profit Margin (%)</label>
              <input
                name="profitMarginPct"
                value={form.profitMarginPct}
                onChange={handleChange}
                inputMode="decimal"
                placeholder="e.g. 25"
                className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
                }`}
              />
              {errors.profitMarginPct && <div className="text-xs text-red-400">{errors.profitMarginPct}</div>}
            </div>

            <div>
              <label className="text-xs text-gray-400">Innovation Budget</label>
              <input
                name="innovationBudget"
                value={form.innovationBudget}
                onChange={handleChange}
                inputMode="decimal"
                placeholder="e.g. 200,000"
                className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
                }`}
              />
              {errors.innovationBudget && <div className="text-xs text-red-400">{errors.innovationBudget}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Cost of Delays</label>
              <input
                name="costOfDelays"
                value={form.costOfDelays}
                onChange={handleChange}
                inputMode="decimal"
                placeholder="e.g. 150,000"
                className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
                }`}
              />
              {errors.costOfDelays && <div className="text-xs text-red-400">{errors.costOfDelays}</div>}
            </div>

            <div>
              <label className="text-xs text-gray-400">Cost of Errors</label>
              <input
                name="costOfErrors"
                value={form.costOfErrors}
                onChange={handleChange}
                inputMode="decimal"
                placeholder="e.g. 50,000"
                className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
                }`}
              />
              {errors.costOfErrors && <div className="text-xs text-red-400">{errors.costOfErrors}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Customer Retention (%)</label>
              <input
                name="customerRetentionPct"
                value={form.customerRetentionPct}
                onChange={handleChange}
                inputMode="decimal"
                placeholder="e.g. 85"
                className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
                }`}
              />
              {errors.customerRetentionPct && <div className="text-xs text-red-400">{errors.customerRetentionPct}</div>}
            </div>

            <div>
              <label className="text-xs text-gray-400">Employee Turnover (%)</label>
              <input
                name="employeeTurnoverPct"
                value={form.employeeTurnoverPct}
                onChange={handleChange}
                inputMode="decimal"
                placeholder="e.g. 12"
                className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
                }`}
              />
              {errors.employeeTurnoverPct && <div className="text-xs text-red-400">{errors.employeeTurnoverPct}</div>}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setErrors({});
              }}
              className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}
            >
              Clear
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm">
              <FaPlus className="inline mr-2" /> Add record
            </button>
          </div>
        </form>

        {/* KPIs & table */}
        <div
          className={`rounded-2xl p-4 lg:col-span-2 shadow-sm ${
            darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-400">Overview</div>
              <div className="text-2xl font-semibold mt-1">Track financial snapshots</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400 text-right">
                <div>Records: <strong>{kpis.count}</strong></div>
                {kpis.latest && <div>Latest: <strong>{new Date(kpis.latest.createdAt).toLocaleDateString()}</strong></div>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadCSV(true)}
                  className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700 shadow-sm"}`}
                >
                  <FaDownload className="inline mr-2" />Export CSV
                </button>
              </div>
            </div>
          </div>

          <hr className="my-4 border-gray-200 dark:border-gray-800" />

          {/* KPI cards — use darkMode to toggle visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`${kpiCardBase} ${
                darkMode ? kpiCardDark : kpiCardLightVariants.revenue
              }`}
              style={darkMode ? { boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.25)" } : { boxShadow: "0 4px 18px rgba(15,23,42,0.04)" }}
            >
              <div className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-xs`}>Latest revenue</div>
              <div className={`text-lg font-semibold mt-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {kpis.latest ? formatCurrency(kpis.latest.annualRevenue) : "—"}
              </div>
              <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs mt-1`}>Avg: {kpis.avg ? formatCurrency(kpis.avg.annualRevenue) : "—"}</div>
            </div>

            <div
              className={`${kpiCardBase} ${
                darkMode ? kpiCardDark : kpiCardLightVariants.cost
              }`}
              style={darkMode ? { boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.25)" } : { boxShadow: "0 4px 18px rgba(15,23,42,0.04)" }}
            >
              <div className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-xs`}>Latest operating cost</div>
              <div className={`text-lg font-semibold mt-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {kpis.latest ? formatCurrency(kpis.latest.operatingCost) : "—"}
              </div>
              <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs mt-1`}>Avg: {kpis.avg ? formatCurrency(kpis.avg.operatingCost) : "—"}</div>
            </div>

            <div
              className={`${kpiCardBase} ${
                darkMode ? kpiCardDark : kpiCardLightVariants.profit
              }`}
              style={darkMode ? { boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.25)" } : { boxShadow: "0 4px 18px rgba(15,23,42,0.04)" }}
            >
              <div className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-xs`}>Profit margin (latest)</div>
              <div className={`text-lg font-semibold mt-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {kpis.latest ? formatPercent(kpis.latest.profitMarginPct) : "—"}
              </div>
              <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs mt-1`}>Avg: {kpis.avg ? `${Number(kpis.avg.profitMarginPct).toFixed(2)}%` : "—"}</div>
            </div>
          </div>

          <div className="mt-4">

            {/* Table container: always present, horizontally scrollable on small screens with hidden scrollbar */}
            <div className="mt-3 overflow-x-auto hide-scrollbar rounded-md border border-gray-100 dark:border-gray-800">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Revenue</th>
                    <th className="text-left px-3 py-2">Op. Cost</th>
                    <th className="text-left px-3 py-2">Profit %</th>
                    <th className="text-left px-3 py-2">Retention</th>
                    <th className="text-left px-3 py-2">Turnover</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400">
                        No records yet — add your first snapshot.
                      </td>
                    </tr>
                  )}

                  {filtered.map((r) => (
                    <tr key={r.id} className={`${darkMode ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{formatCurrency(r.annualRevenue)}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{formatCurrency(r.operatingCost)}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{formatPercent(r.profitMarginPct)}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{formatPercent(r.customerRetentionPct)}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{formatPercent(r.employeeTurnoverPct)}</td>
                      <td className="px-3 py-2 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openView(r)} title="View" className="px-2 py-1 rounded border text-xs">
                            <FaEye />
                          </button>
                          <button onClick={() => openEdit(r)} title="Edit" className="px-2 py-1 rounded border text-xs">
                            <FaEdit />
                          </button>
                          <button onClick={() => downloadCSV(false, r)} title="Export" className="px-2 py-1 rounded border text-xs">
                            <FaDownload />
                          </button>
                          <button onClick={() => confirmDeleteRecord(r.id)} title="Delete" className="px-2 py-1 rounded border text-xs text-red-600">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            

          </div>
        </div>
      </div>

      {/* View modal */}
      <Modal
        open={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title={viewRecord ? `Record ${viewRecord.id}` : "Record"}
        darkMode={darkMode}
        footer={
          viewRecord ? (
            <button onClick={() => downloadCSV(false, viewRecord)} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <FaDownload className="inline mr-2" />Export
            </button>
          ) : null
        }
      >
        {viewRecord && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-400">Date</div>
              <div className="font-medium">{new Date(viewRecord.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">ID</div>
              <div className="font-medium truncate">{viewRecord.id}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Annual Revenue</div>
              <div className="font-medium">{formatCurrency(viewRecord.annualRevenue)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Operating Cost</div>
              <div className="font-medium">{formatCurrency(viewRecord.operatingCost)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Profit Margin</div>
              <div className="font-medium">{formatPercent(viewRecord.profitMarginPct)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Innovation Budget</div>
              <div className="font-medium">{formatCurrency(viewRecord.innovationBudget)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Cost of Delays</div>
              <div className="font-medium">{formatCurrency(viewRecord.costOfDelays)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Cost of Errors</div>
              <div className="font-medium">{formatCurrency(viewRecord.costOfErrors)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Customer Retention</div>
              <div className="font-medium">{formatPercent(viewRecord.customerRetentionPct)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Employee Turnover</div>
              <div className="font-medium">{formatPercent(viewRecord.employeeTurnoverPct)}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={Boolean(editRecord)}
        onClose={() => {
          setEditRecord(null);
          setErrors({});
        }}
        title={editRecord ? `Edit ${editRecord.id}` : "Edit record"}
        darkMode={darkMode}
        footer={
          editRecord ? (
            <>
              <button
                onClick={() => {
                  setEditRecord(null);
                  setErrors({});
                }}
                className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}
              >
                Cancel
              </button>
              <button onClick={saveEdit} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                Save
              </button>
            </>
          ) : null
        }
      >
        {editRecord && (
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-gray-400">Annual Revenue</label>
              <input
                name="annualRevenue"
                value={editRecord.annualRevenue}
                onChange={handleEditChange}
                className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
              />
              {errors.annualRevenue && <div className="text-xs text-red-400">{errors.annualRevenue}</div>}
            </div>

            <div>
              <label className="text-xs text-gray-400">Operating Cost</label>
              <input
                name="operatingCost"
                value={editRecord.operatingCost}
                onChange={handleEditChange}
                className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
              />
              {errors.operatingCost && <div className="text-xs text-red-400">{errors.operatingCost}</div>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Profit Margin (%)</label>
                <input
                  name="profitMarginPct"
                  value={editRecord.profitMarginPct}
                  onChange={handleEditChange}
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                {errors.profitMarginPct && <div className="text-xs text-red-400">{errors.profitMarginPct}</div>}
              </div>
              <div>
                <label className="text-xs text-gray-400">Customer Retention (%)</label>
                <input
                  name="customerRetentionPct"
                  value={editRecord.customerRetentionPct}
                  onChange={handleEditChange}
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                {errors.customerRetentionPct && <div className="text-xs text-red-400">{errors.customerRetentionPct}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Innovation Budget</label>
                <input
                  name="innovationBudget"
                  value={editRecord.innovationBudget}
                  onChange={handleEditChange}
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                {errors.innovationBudget && <div className="text-xs text-red-400">{errors.innovationBudget}</div>}
              </div>

              <div>
                <label className="text-xs text-gray-400">Employee Turnover (%)</label>
                <input
                  name="employeeTurnoverPct"
                  value={editRecord.employeeTurnoverPct}
                  onChange={handleEditChange}
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                {errors.employeeTurnoverPct && <div className="text-xs text-red-400">{errors.employeeTurnoverPct}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Cost of Delays</label>
                <input
                  name="costOfDelays"
                  value={editRecord.costOfDelays}
                  onChange={handleEditChange}
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                {errors.costOfDelays && <div className="text-xs text-red-400">{errors.costOfDelays}</div>}
              </div>

              <div>
                <label className="text-xs text-gray-400">Cost of Errors</label>
                <input
                  name="costOfErrors"
                  value={editRecord.costOfErrors}
                  onChange={handleEditChange}
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                {errors.costOfErrors && <div className="text-xs text-red-400">{errors.costOfErrors}</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete modal */}
      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Confirm delete"
        darkMode={darkMode}
        footer={
          <>
            <button
              onClick={() => setConfirmDelete({ open: false, id: null })}
              className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}
            >
              Cancel
            </button>
            <button onClick={doDelete} className="px-3 py-2 rounded-md bg-gradient-to-r from-red-600 to-red-500 text-white">
              Delete
            </button>
          </>
        }
      >
        <div className="text-sm text-gray-400">Are you sure you want to delete this financial snapshot? This action cannot be undone.</div>
      </Modal>
    </section>
  );
}
