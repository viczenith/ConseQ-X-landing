// src/pages/CEO/Revenue.js
import React, { useEffect, useMemo, useState } from "react";
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



/* -------------------- Mock data generator -------------------- */
function generateMockRevenue(months = 24, seed = Date.now()) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  function rnd() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  }

  let customers = Math.round(300 + rnd() * 200);
  let arpu = Math.round(18000 + rnd() * 12000);
  const series = [];

  let productShares = {
    assessments: 0.45,
    subscriptions: 0.35,
    consulting: 0.12,
    training: 0.08,
  };

  for (let i = 0; i < months; i++) {
    const monthGrowth = 1 + (0.01 + (rnd() - 0.5) * 0.02);
    const shock = rnd() < 0.05 ? (rnd() - 0.5) * 0.4 : 0;
    const churnRate = 0.02 + rnd() * 0.04;
    const newCustomers = Math.max(0, Math.round(customers * (0.02 + rnd() * 0.04) + (rnd() * 10)));
    arpu = Math.round(arpu * (1 + (rnd() - 0.5) * 0.02 + (i % 6 === 0 ? (rnd() - 0.5) * 0.03 : 0)));
    const retained = Math.round(customers * (1 - churnRate));
    customers = Math.max(0, retained + newCustomers);
    const mrr = Math.round(customers * arpu * (1 + shock));

    Object.keys(productShares).forEach((k) => {
      productShares[k] = Math.max(0.02, productShares[k] + (rnd() - 0.5) * 0.02);
    });
    const sum = Object.values(productShares).reduce((a, b) => a + b, 0);
    Object.keys(productShares).forEach((k) => (productShares[k] = productShares[k] / sum));

    const revenueByProduct = {
      assessments: Math.round(mrr * productShares.assessments),
      subscriptions: Math.round(mrr * productShares.subscriptions),
      consulting: Math.round(mrr * productShares.consulting),
      training: Math.round(mrr * productShares.training),
    };

    const grossMarginPct = 0.65 + (rnd() - 0.5) * 0.08;
    const cac = Math.round(12000 + rnd() * 8000);
    const clv = Math.round((arpu * (1 / churnRate)) * grossMarginPct);

    series.push({
      idx: i,
      monthLabel: `M-${months - i}`,
      mrr,
      customers,
      newCustomers,
      churnRate,
      arpu,
      revenueTotal: mrr,
      revenueByProduct,
      grossMarginPct,
      cac,
      clv,
      timestamp: Date.now() - (months - i - 1) * 30 * 24 * 3600 * 1000,
    });
  }

  const totalTTM = series.slice(-12).reduce((s, x) => s + x.revenueTotal, 0);
  const latest = series[series.length - 1];
  const mrr = latest.mrr;
  const arr = Math.round(mrr * 12);
  const avgARPU = Math.round(series.reduce((s, x) => s + x.arpu, 0) / series.length);
  const avgChurn = +(series.reduce((s, x) => s + x.churnRate, 0) / series.length).toFixed(3);

  let yoy = null;
  if (series.length >= 13) {
    const prev = series[series.length - 13].mrr;
    yoy = (((mrr - prev) / (prev || 1)) * 100).toFixed(1);
  } else {
    yoy = null;
  }

  const prodTotals = Object.keys(series[0].revenueByProduct).reduce((acc, k) => {
    acc[k] = series.slice(-12).reduce((s, x) => s + x.revenueByProduct[k], 0);
    return acc;
  }, {});

  const last3 = series.slice(-3).map((s) => s.mrr);
  const avg3 = Math.round(last3.reduce((a, b) => a + b, 0) / last3.length || mrr);
  const forecast = [1, 2, 3].map((i) => Math.round(avg3 * (1 + 0.01 * i)));

  return {
    series,
    totalTTM,
    latest,
    mrr,
    arr,
    avgARPU,
    avgChurn,
    yoy,
    prodTotals,
    forecast,
  };
}

/* -------------------- Small UI primitives -------------------- */
function Card({ children, className = "", darkMode = false }) {
  const base = `rounded-2xl p-4 border shadow-sm ${className}`;
  const theme = darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-900";
  return <div className={`${base} ${theme}`}>{children}</div>;
}

/* inline area sparkline (gradient fill + polyline) */
function AreaSpark({ points = [], height = 90, darkMode = false }) {
  if (!points || points.length === 0) return null;
  const width = Math.max(240, points.length * 18);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = width / (points.length - 1);
  const coords = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / (max - min || 1)) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");
  const polyline = coords;
  const areaPath = `M0,${height} L${coords} L${width},${height} Z`;

  // pick stroke color that reads well in both themes
  const strokeColor = darkMode ? "#A78BFA" : "#6366F1";
  const gradientStart = darkMode ? "#A78BFA" : "#4F46E5";

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="rounded">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} stopOpacity="0.18" />
          <stop offset="100%" stopColor={gradientStart} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#g1)" />
      <polyline points={polyline} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* small donut for product share */
function Donut({ slices = {}, size = 120, darkMode = false }) {
  const total = Object.values(slices).reduce((s, v) => s + v, 0) || 1;
  let angle = -90;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const parts = Object.keys(slices).map((k) => {
    const value = slices[k];
    const portion = value / total;
    const sweep = portion * 360;
    const start = (angle * Math.PI) / 180;
    const end = ((angle + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle += sweep;
    return { key: k, d, portion };
  });

  const palette = {
    assessments: "#7C3AED",
    subscriptions: "#4F46E5",
    consulting: "#0EA5A4",
    training: "#F97316",
  };

  const innerFill = darkMode ? "#0f1724" : "#ffffff";

  return (
    <svg width={size} height={size}>
      {parts.map((p) => (
        <path key={p.key} d={p.d} fill={palette[p.key]} opacity="0.95" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.55} fill={innerFill} />
    </svg>
  );
}

/* -------------------- CEORevenue component -------------------- */
export default function CEORevenue({ initialMonths = 12 }) {
  const { darkMode } = useOutletContext();
  const [rangeMonths, setRangeMonths] = useState(initialMonths);
  const [mock, setMock] = useState(() => generateMockRevenue(Math.max(6, rangeMonths), 1337));

  useEffect(() => {
    setMock(generateMockRevenue(Math.max(6, rangeMonths), 1337 + rangeMonths));
  }, [rangeMonths]);

  const points = useMemo(() => mock.series.map((s) => s.mrr), [mock]);
  const latest = mock.latest;
  const prodTotals = mock.prodTotals || {};
  const topProduct = Object.entries(prodTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "assessments";

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

  // Recommendations derived from the mock forecast (digital twin narrative)
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
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg font-semibold`}>Revenue & Financial Health</h3>
          <div className={`${darkMode ? "text-gray-300" : "text-sm text-gray-500"}`}>Comprehensive revenue metrics and product breakdown (mock data)</div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={rangeMonths}
            onChange={(e) => setRangeMonths(Number(e.target.value))}
            className={`px-3 py-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card darkMode={darkMode}>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>TTM Revenue</div>
          <div className="text-2xl font-bold mt-1">₦{(mock.totalTTM / 1e6).toFixed(2)}M</div>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"} mt-2`}>Trailing {Math.min(12, mock.series.length)} months</div>
        </Card>

        <Card darkMode={darkMode}>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>MRR (Latest)</div>
          <div className="text-2xl font-bold mt-1">₦{mock.mrr.toLocaleString()}</div>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"} mt-2`}>ARR ≈ ₦{mock.arr.toLocaleString()}</div>
        </Card>

        <Card darkMode={darkMode}>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Avg ARPU</div>
          <div className="text-2xl font-bold mt-1">₦{mock.avgARPU.toLocaleString()}</div>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"} mt-2`}>Avg churn {(mock.avgChurn * 100).toFixed(1)}%</div>
        </Card>

        <Card darkMode={darkMode}>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Top product</div>
          <div className="text-2xl font-bold mt-1">{topProduct.charAt(0).toUpperCase() + topProduct.slice(1)}</div>
          <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"} mt-2`}>Share (last 12 mo): {Math.round((prodTotals[topProduct] || 0) / Math.max(1, mock.totalTTM) * 100)}%</div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card darkMode={darkMode} className="h-full">
            <div className="flex items-center justify-between">
              <div>
                <div className={`${darkMode ? "text-gray-100" : "text-sm font-medium"}`}>Revenue trend</div>
                <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>MRR evolution</div>
              </div>
              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>YoY: {mock.yoy !== null ? `${mock.yoy}%` : "—"}</div>
            </div>

            <div className="mt-4">
              <AreaSpark points={points.slice(-Math.max(rangeMonths, 3))} height={120} darkMode={darkMode} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Latest MRR</div>
              <div className="text-right font-semibold">₦{mock.mrr.toLocaleString()}</div>

              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Avg month (shown)</div>
              <div className="text-right font-semibold">₦{Math.round(mock.totalTTM / Math.min(12, mock.series.length)).toLocaleString()}</div>

              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Forecast (3 mo)</div>
              <div className="text-right font-semibold">₦{mock.forecast.map((x) => x.toLocaleString()).join(" / ")}</div>

              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Gross margin (avg)</div>
              <div className="text-right font-semibold">{Math.round((mock.series.reduce((s, x) => s + x.grossMarginPct, 0) / mock.series.length) * 100)}%</div>
            </div>
          </Card>
        </div>

        <div>
          <Card darkMode={darkMode} className="flex flex-col items-center justify-center gap-3">
            <div className={`${darkMode ? "text-gray-100" : "text-sm font-medium"}`}>Revenue by product (last 12 mo)</div>
            <div className="w-full flex items-center gap-4">
              <div style={{ flex: "0 0 120px" }}>
                <Donut slices={prodTotals} size={120} darkMode={darkMode} />
              </div>

              <div className="flex-1">
                {Object.entries(prodTotals).map(([k, v]) => {
                  const pct = Math.round((v / Math.max(1, mock.totalTTM)) * 100);
                  const colors = { assessments: "bg-purple-600", subscriptions: "bg-indigo-600", consulting: "bg-teal-500", training: "bg-orange-400" };
                  return (
                    <div key={k} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded ${colors[k] || "bg-gray-400"}`} />
                        <div className={`${darkMode ? "text-gray-100 capitalize" : "capitalize"}`}>{k}</div>
                      </div>
                      <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Narrative + Recommendations */}
      <section>
        {/* Narrative + Recommendations */}
        <div className={`mt-6 rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
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
      

      <div className="mt-6">
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`${darkMode ? "text-gray-100" : "text-sm font-medium"}`}>Revenue by month</div>
              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Last {mock.series.length} months</div>
            </div>
            <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>Export CSV</div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className={`min-w-full text-sm ${darkMode ? "text-gray-100" : ""}`}>
              <thead className={`${darkMode ? "text-xs text-gray-400" : "text-left text-xs text-gray-400"}`}>
                <tr>
                  <th className="py-2 pr-4">Month</th>
                  <th className="py-2 pr-4">MRR</th>
                  <th className="py-2 pr-4">New customers</th>
                  <th className="py-2 pr-4">Churn</th>
                  <th className="py-2 pr-4">ARPU</th>
                </tr>
              </thead>
              <tbody>
                {mock.series.slice(-rangeMonths).reverse().map((s) => (
                  <tr key={s.idx} className={`${darkMode ? "border-t border-gray-800" : "border-t"}`}>
                    <td className="py-2 pr-4">{new Date(s.timestamp).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">₦{s.mrr.toLocaleString()}</td>
                    <td className="py-2 pr-4">{s.newCustomers}</td>
                    <td className="py-2 pr-4">{(s.churnRate * 100).toFixed(1)}%</td>
                    <td className="py-2 pr-4">₦{s.arpu.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
