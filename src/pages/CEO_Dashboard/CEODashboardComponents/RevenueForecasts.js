// src/pages/CEO_Dashboard/RevenueForecasts.js
import React, { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaDownload,
  FaCalendarPlus,
  FaChartLine,
  FaPlus,
  FaShareAlt,
  FaTimes,
  FaSave,
} from "react-icons/fa";

/* ---------- helpers ---------- */
const months = (startMonth = 0, count = 24) => {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + startMonth + i, 1);
    out.push(`${names[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`);
  }
  return out;
};

function genMockProjections() {
  const labels = months(0, 24);
  let baseMonthly = 1200000 / 12;
  const data = labels.map((lbl, idx) => {
    const seasonal = Math.sin(idx / 3) * 0.03;
    const shortG = 0.003 * idx;
    const midG = 0.008 * idx;
    const longG = 0.016 * idx;
    const shortVal = Math.round(baseMonthly * (1 + shortG + seasonal) * (1 + Math.random() * 0.01));
    const midVal = Math.round(baseMonthly * (1 + midG + seasonal) * (1 + Math.random() * 0.01));
    const longVal = Math.round(baseMonthly * (1 + longG + seasonal) * (1 + Math.random() * 0.01));
    baseMonthly = baseMonthly * (1 + 0.0025);
    return { month: lbl, short: shortVal, mid: midVal, long: longVal };
  });
  return data;
}

function formatCurrency(n) {
  try {
    return `₦${Number(n).toLocaleString()}`;
  } catch {
    return `₦${n}`;
  }
}

const TASK_STORAGE = "conseqx_tasks_v1";
const REMINDER_STORAGE = "conseqx_reminders_v1";

function readJSON(k, fallback) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

/* ---------- small Modal component ---------- */
function Modal({ open, onClose, title, children, footer, darkMode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <div className={`relative z-10 w-full max-w-xl rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-md text-gray-400"><FaTimes /></button>
        </div>

        <div className="mt-3">{children}</div>

        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function RevenueForecasts() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();

  const data = useMemo(() => genMockProjections(), []);
  const [tasks, setTasks] = useState(() => readJSON(TASK_STORAGE, []));
  const [reminders, setReminders] = useState(() => readJSON(REMINDER_STORAGE, []));
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    when: new Date().toISOString().slice(0, 16),
    attendees: "",
    notes: "",
    source: "",
  });
  const [creatingFromRec, setCreatingFromRec] = useState(null); // optional prefilled suggestion text
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => writeJSON(TASK_STORAGE, tasks), [tasks]);
  useEffect(() => writeJSON(REMINDER_STORAGE, reminders), [reminders]);

  // KPIs: next 3, 12 and 24 month aggregates
  const kpis = useMemo(() => {
    const sum = (arr) => arr.reduce((s, x) => s + x, 0);
    const shortNext3 = sum(data.slice(0, 3).map((d) => d.short));
    const midNext12 = sum(data.slice(0, 12).map((d) => d.mid));
    const longNext24 = sum(data.slice(0, 24).map((d) => d.long));
    const start = data[0].mid || 1;
    const end = data[data.length - 1].mid || 1;
    const years = 24 / 12;
    const cagr = Math.pow(end / start, 1 / years) - 1;
    return {
      shortNext3,
      midNext12,
      longNext24,
      midCAGR: cagr,
    };
  }, [data]);

  // Recommendations (same as your existing list) - kept here for prefill
  const recommendations = [
    {
      horizon: "Short (0-3 months)",
      summary:
        "Stabilize capacity to prevent drop-offs. Focus on retention campaigns for top 20% customers. Immediate meeting: Growth + Customer Success to implement targeted promotions.",
      suggestedAttendees: ["Head of Growth", "Head of CS", "Finance lead"],
      impact: "Reduces churn and preserves monthly recurring revenue.",
    },
    {
      horizon: "Mid (3-12 months)",
      summary:
        "Execute pricing experiment and channel expansion. Run pilot for SME quarterly promo. Suggested OKR: increase conversion by 6–10% in pilot cohort.",
      suggestedAttendees: ["Head of Product", "Sales Lead", "Growth PM"],
      impact: "Improves ARR and validates product-market fit for SME segment.",
    },
    {
      horizon: "Long (1-3 years)",
      summary:
        "Invest in platform reliability and product-led growth channels. Consider strategic partnerships and larger enterprise plays backed by case studies from early pilots.",
      suggestedAttendees: ["CEO", "CRO", "CTO", "Head of Partnerships"],
      impact: "Positions company for higher valuation multiple and sustained ARR growth.",
    },
  ];

  /* ---------- actions ---------- */
  function downloadCSV() {
    const header = ["month", "conservative (short)", "base (mid)", "aggressive (long)"];
    const rows = data.map((r) => [r.month, r.short, r.mid, r.long]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(auth?.org?.name || "org")}_revenue_forecast.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function openScheduler(prefill = null) {
    if (prefill) {
      setTaskDraft({
        title: prefill.title || `Action: ${prefill.horizon}`,
        when: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
        attendees: (prefill.suggestedAttendees || []).join(", "),
        notes: prefill.summary || "",
        source: prefill.horizon || "",
      });
      setCreatingFromRec(prefill.horizon || null);
    } else {
      setTaskDraft({
        title: "",
        when: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
        attendees: "",
        notes: "",
        source: "",
      });
      setCreatingFromRec(null);
    }
    setSchedulerOpen(true);
  }

  function saveTask() {
    const t = {
      id: `task-${Date.now().toString(36)}`,
      title: taskDraft.title || "Untitled task",
      when: taskDraft.when,
      attendees: taskDraft.attendees,
      notes: taskDraft.notes,
      source: taskDraft.source,
      createdAt: Date.now(),
      status: "scheduled",
    };
    setTasks((s) => [t, ...s]);
    // also create a lightweight reminder record for upcoming meetings
    setReminders((r) => [{ id: `rem-${Date.now().toString(36)}`, title: t.title, when: t.when, createdAt: Date.now(), done: false }, ...r]);
    setSchedulerOpen(false);
    // small in-UI confirm (browser alert minimal; replace with toast in your app)
    try { window.Snackbar?.show?.({ message: "Task saved" }); } catch {}
  }

  async function handleShare(text) {
    setShareBusy(true);
    const payload = text || "Revenue forecast suggestion";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Forecast suggestion", text: payload });
      } catch (e) {
        // user cancelled
      }
    } else {
      // fallback copy to clipboard
      try {
        await navigator.clipboard.writeText(payload);
        alert("Copied to clipboard");
      } catch (e) {
        alert("Unable to share (clipboard failed)");
      }
    }
    setShareBusy(false);
  }

  /* ---------- small utilities ---------- */
  function handleTaskInput(k, v) {
    setTaskDraft((s) => ({ ...s, [k]: v }));
  }

  return (
    <section className="space-y-6">
      {/* header + actions */}
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 p-2 text-white"><FaChartLine /></div>
            <div>
              <h2 className="text-lg font-semibold">Revenue Forecasts</h2>
              <div className="text-xs text-gray-400">Short / Mid / Long term projections driven by your company profile (mock data)</div>
              <div className="text-xs mt-1 text-yellow-500 font-medium">{auth?.org?.name || "Organization"} Digital Twin</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadCSV}
              className="w-full sm:w-auto px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center gap-2"
            >
              <FaDownload /> <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => openScheduler()}
              title="Schedule review"
              className="w-full sm:w-auto px-3 py-2 rounded-md border flex items-center justify-center gap-2"
            >
              <FaCalendarPlus /> <span className="hidden sm:inline">Schedule review</span>
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
            <div className="text-xs text-gray-400">Short-term (0-3m)</div>
            <div className="text-xl font-semibold mt-1">{formatCurrency(kpis.shortNext3)}</div>
            <div className="text-xs text-gray-400 mt-2">Immediate cashflow estimate</div>
          </div>

          <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
            <div className="text-xs text-gray-400">Mid-term (12m)</div>
            <div className="text-xl font-semibold mt-1">{formatCurrency(kpis.midNext12)}</div>
            <div className="text-xs text-gray-400 mt-2">Projected ARR impact (mid)</div>
          </div>

          <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
            <div className="text-xs text-gray-400">Long-term (24m)</div>
            <div className="text-xl font-semibold mt-1">{formatCurrency(kpis.longNext24)}</div>
            <div className="text-xs text-gray-400 mt-2">Cumulative projection</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="w-full" style={{ minHeight: 260 }}>
          <ResponsiveContainer width="100%" height={Math.max(280, typeof window !== "undefined" && window.innerWidth < 640 ? 300 : 340)}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#e6edf3"} />
              <XAxis dataKey="month" tick={{ fill: darkMode ? "#cbd5e1" : "#475569" }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: darkMode ? "#cbd5e1" : "#475569" }} />
              <Tooltip formatter={(v) => formatCurrency(v)} labelStyle={{ color: darkMode ? "#cbd5e1" : "#111827" }} />
              <Legend wrapperStyle={{ color: darkMode ? "#cbd5e1" : "#111827" }} />
              <Line type="monotone" dataKey="short" stroke="#f59e0b" strokeWidth={2} dot={false} name="Conservative" />
              <Line type="monotone" dataKey="mid" stroke="#3b82f6" strokeWidth={2} dot={false} name="Base" />
              <Line type="monotone" dataKey="long" stroke="#10b981" strokeWidth={2} dot={false} name="Aggressive" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative + Recommendations */}
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">What this forecast means (digital twin insights)</h3>
          <div className="text-xs text-gray-400">Use suggestions to create tasks/meetings</div>
        </div>

        <p className="text-sm text-gray-400 mt-2">
          The model predicts three scenarios based on current performance, seasonality and simple growth assumptions. Use the short-term section to prioritize retention and operational fixes; mid-term to run experiments and pricing changes; long-term to invest in product & partnerships.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.horizon} className={`p-3 rounded-lg flex flex-col justify-between ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
              <div>
                <div className="text-xs text-gray-400">{rec.horizon}</div>
                <div className="font-medium mt-1">{rec.summary}</div>
                <div className="text-xs text-gray-400 mt-3">Suggested attendees: <span className="font-medium">{rec.suggestedAttendees.join(", ")}</span></div>
                <div className="text-xs text-gray-400 mt-2">Impact: {rec.impact}</div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openScheduler({ title: `Meeting: ${rec.horizon}`, summary: rec.summary, suggestedAttendees: rec.suggestedAttendees, horizon: rec.horizon })}
                  className="flex-1 px-3 py-2 rounded-md bg-indigo-600 text-white flex items-center justify-center gap-2"
                >
                  <FaPlus /> Create Task
                </button>

                <button
                  onClick={() => handleShare(`${rec.horizon} — ${rec.summary}`)}
                  className="px-3 py-2 rounded-md border flex items-center justify-center gap-2"
                >
                  <FaShareAlt /> <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projection table */}
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold">Projection table (monthly)</h4>
          <div className="text-xs text-gray-400">Data shown for next 24 months</div>
        </div>

        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                <th className="p-2 text-left">Month</th>
                <th className="p-2 text-right">Conservative</th>
                <th className="p-2 text-right">Base</th>
                <th className="p-2 text-right">Aggressive</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.month} className="border-t">
                  <td className="p-2">{r.month}</td>
                  <td className="p-2 text-right">{formatCurrency(r.short)}</td>
                  <td className="p-2 text-right">{formatCurrency(r.mid)}</td>
                  <td className="p-2 text-right">{formatCurrency(r.long)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasks & Reminders panel */}
      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold">Scheduled tasks & reminders</h4>
          <div className="text-xs text-gray-400">{tasks.length} tasks</div>
        </div>

        <div className="mt-3 space-y-2">
          {tasks.length === 0 && <div className="text-sm text-gray-400">No tasks yet — create one from a recommendation or schedule a review.</div>}
          {tasks.map((t) => (
            <div key={t.id} className="p-3 rounded-md border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-400">{new Date(t.when).toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">{t.attendees}</div>
                {t.notes && <div className="text-xs mt-2 text-gray-500">{t.notes}</div>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // quick "mark done" toggle
                    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: x.status === "done" ? "scheduled" : "done" } : x)));
                  }}
                  className={`px-3 py-1 rounded-md border text-sm ${t.status === "done" ? "bg-green-100 text-green-700" : ""}`}
                >
                  {t.status === "done" ? "Done" : "Mark done"}
                </button>

                <button
                  onClick={() => {
                    // delete
                    if (window.confirm("Delete task?")) setTasks((prev) => prev.filter((x) => x.id !== t.id));
                  }}
                  className="px-3 py-1 rounded-md border text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler / Create Task modal */}
      <Modal
        open={schedulerOpen}
        onClose={() => setSchedulerOpen(false)}
        title={creatingFromRec ? "Schedule from suggestion" : "Create task / schedule meeting"}
        darkMode={darkMode}
        footer={
          <>
            <button onClick={() => setSchedulerOpen(false)} className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}>
              Cancel
            </button>
            <button onClick={saveTask} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <FaSave className="inline mr-2" /> Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Title</label>
            <input value={taskDraft.title} onChange={(e) => handleTaskInput("title", e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`} placeholder="Meeting / Task title" />
          </div>

          <div>
            <label className="text-xs text-gray-400">When</label>
            <input value={taskDraft.when} onChange={(e) => handleTaskInput("when", e.target.value)} type="datetime-local" className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`} />
          </div>

          <div>
            <label className="text-xs text-gray-400">Attendees (comma separated)</label>
            <input value={taskDraft.attendees} onChange={(e) => handleTaskInput("attendees", e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`} placeholder="e.g. Head of Growth, Head of CS" />
          </div>

          <div>
            <label className="text-xs text-gray-400">Notes</label>
            <textarea value={taskDraft.notes} onChange={(e) => handleTaskInput("notes", e.target.value)} rows={4} className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`} placeholder="What to cover, agenda, links..." />
          </div>
        </div>
      </Modal>
    </section>
  );
}
