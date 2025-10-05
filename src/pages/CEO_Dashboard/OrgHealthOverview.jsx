// src/pages/CEO_Dashboard/OrgHealthOverview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getResults } from "./services/orgHealth"; // ensure path is correct
import { FaChartPie, FaDownload, FaEye, FaExternalLinkAlt } from "react-icons/fa";

/* ----------------- helpers ----------------- */
function normalizeKey(k = "") {
  return String(k || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_\-]/g, "")
    .replace(/systemof|system/g, "")
    .trim();
}

function readAssessmentsStorage(orgId = "anon") {
  try {
    const raw = localStorage.getItem("conseqx_assessments_v1");
    const all = raw ? JSON.parse(raw) : {};
    return all[orgId] || [];
  } catch {
    return [];
  }
}

function pctToToneClass(pct, darkMode) {
  if (pct === null || pct === undefined) return darkMode ? "text-gray-400 bg-gray-800" : "text-gray-500 bg-gray-50";
  if (pct >= 80) return darkMode ? "text-green-300 bg-green-900/20" : "text-green-700 bg-green-50";
  if (pct >= 60) return darkMode ? "text-yellow-300 bg-yellow-900/20" : "text-yellow-700 bg-yellow-50";
  return darkMode ? "text-red-300 bg-red-900/20" : "text-red-700 bg-red-50";
}

/* simple CSV helper */
function toCSV(rows) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/\r?\n|\r/g, " ");
    if (s.includes(",") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

/* small Modal (responsive) */
function Modal({ open, onClose, title, children, footer, darkMode = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(2,6,23,0.6)" : "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className={`${darkMode ? "text-gray-300" : "text-gray-600"} ml-2`}>✕</button>
        </div>

        <div className="mt-4 max-h-[70vh] overflow-auto hide-scrollbar">{children}</div>

        {footer && <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ----------------- main component ----------------- */
export default function OrgHealthOverview({ orgId = null }) {
  const { darkMode, org } = useOutletContext();
  const navigate = useNavigate();
  const effectiveOrg = orgId || org?.id || "anon";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState(null); // { systemId, result (nullable) }

  /* load results with fallback */
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const maybe = getResults ? getResults(effectiveOrg) : null;
        const resolved = maybe instanceof Promise ? await maybe : maybe;
        let data = Array.isArray(resolved) ? resolved : [];
        if (!data || data.length === 0) {
          const fallback = readAssessmentsStorage(effectiveOrg);
          if (fallback && fallback.length > 0) {
            data = fallback.map((a) => ({
              id: a.id,
              systemId: a.systemId || a.system || a.meta?.systemId || "general",
              title: a.title || a.name || (a.systemId || a.system),
              score: typeof a.score === "number" ? a.score : (a.score ? Number(a.score) : null),
              timestamp: a.timestamp || Date.now(),
              original: a,
            }));
          } else {
            data = [];
          }
        } else {
          data = data.map((r) => ({ ...r, original: r.original || r }));
        }
        if (mounted) setResults(data || []);
      } catch (e) {
        const fallback = readAssessmentsStorage(effectiveOrg);
        if (mounted) setResults(fallback || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    function refreshHandler() {
      load();
    }

    try {
      window.addEventListener("conseqx:orghealth:completed", refreshHandler);
      window.addEventListener("conseqx:assessments:updated", refreshHandler);
      window.addEventListener("storage", refreshHandler);
    } catch {}
    return () => {
      mounted = false;
      try {
        window.removeEventListener("conseqx:orghealth:completed", refreshHandler);
        window.removeEventListener("conseqx:assessments:updated", refreshHandler);
        window.removeEventListener("storage", refreshHandler);
      } catch {}
    };
  }, [effectiveOrg]);

  /* canonical systems */
  const canonical = useMemo(
    () => [
      { id: "interdependency", label: "Interdependency", blurb: "How well teams integrate and hand-off work across boundaries." },
      { id: "iteration", label: "Iteration", blurb: "Pace of learning: experiments, feedback loops, and continuous improvement." },
      { id: "investigation", label: "Investigation", blurb: "Root-cause discovery and data-driven problem solving." },
      { id: "interpretation", label: "Interpretation", blurb: "How insights are turned into shared understanding and decisions." },
      { id: "illustration", label: "Illustration", blurb: "Clarity in process, playbooks, and operational visualizations." },
      { id: "inlignment", label: "Inlignment", blurb: "Strategic alignment — how goals, incentives, and execution line up." },
    ],
    []
  );

  /* compute latestBySystem */
  const latestBySystem = useMemo(() => {
    const map = {};
    (results || []).forEach((r) => {
      const rawSid = r.systemId || r.system || r.original?.systemId || r.original?.system || r.original?.meta?.systemId || "general";
      const sid = normalizeKey(rawSid);
      const ts = r.timestamp || r.ts || Date.now();
      if (!map[sid] || (map[sid].timestamp || 0) < ts) {
        map[sid] = { ...r, normalizedSystemId: sid, timestamp: ts };
      }
    });
    return map;
  }, [results]);

  /* per-system derived list (rounded score) */
  const perSystem = useMemo(() => {
    return canonical.map((s) => {
      const key = normalizeKey(s.id);
      const res = latestBySystem[key];
      const score =
        res && (typeof res.score === "number" ? res.score : (res.score ? Number(res.score) : (res.original && typeof res.original.score === "number" ? res.original.score : null)));
      // compute answered % if available
      const answered = res?.original?.answered ?? res?.original?.meta?.answered ?? null;
      const total = res?.original?.total ?? res?.original?.meta?.total ?? null;
      const answeredPct = (answered != null && total != null && total > 0) ? Math.round((answered / total) * 100) : null;
      return { id: key, label: s.label, blurb: s.blurb, score: score != null && !Number.isNaN(score) ? Math.round(score) : null, result: res || null, answeredPct };
    });
  }, [canonical, latestBySystem]);

  /* composite */
  const composite = useMemo(() => {
    const vals = perSystem.map((p) => (p.score === null || p.score === undefined ? null : p.score));
    const has = vals.filter((v) => v !== null && v !== undefined);
    if (has.length === 0) return null;
    return Math.round(has.reduce((s, v) => s + v, 0) / has.length);
  }, [perSystem]);

  /* composite history small spark */
  const compositeHistory = useMemo(() => {
    if (!results || results.length === 0) return [];
    const byDay = {};
    results.forEach((r) => {
      const day = new Date(r.timestamp || Date.now());
      day.setHours(0, 0, 0, 0);
      const k = day.getTime();
      if (!byDay[k]) byDay[k] = [];
      const sc = typeof r.score === "number" ? r.score : (r.score ? Number(r.score) : null);
      if (sc !== null && sc !== undefined && !Number.isNaN(sc)) byDay[k].push(sc);
    });
    const entries = Object.keys(byDay)
      .map((k) => ({ t: Number(k), avg: Math.round(byDay[k].reduce((a, b) => a + b, 0) / byDay[k].length) }))
      .sort((a, b) => a.t - b.t)
      .slice(-12);
    return entries.map((e) => e.avg);
  }, [results]);

  /* ---- Export helpers ---- */
  function exportJSON(full = true, single = null) {
    try {
      const payload = single ? single : (results || []);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = single ? `${(single.original?.title || single.id || "system")}_orghealth.json` : `${(org && org.name) || effectiveOrg}_orghealth.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      alert("Export failed");
    }
  }

  function exportCSV(full = true, single = null) {
    try {
      if (single) {
        const r = single;
        // try to flatten a few useful fields for CSV
        const header = [
          "system",
          "score",
          "timestamp",
          "title",
          "notes",
        ];
        const rows = [
          header,
          [r.normalizedSystemId || r.systemId || "", r.score ?? "", new Date(r.timestamp || r.original?.timestamp || Date.now()).toISOString(), r.original?.title || r.title || "", (r.original?.notes || r.original?.summary || "").replace(/\n/g, " ")],
        ];
        const csv = toCSV(rows);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(r.original?.title || r.normalizedSystemId || r.id)}_orghealth.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return;
      }
      // full export: list of rows (system, score, timestamp, title)
      const rows = [["system", "score", "timestamp", "title"]];
      (results || []).forEach((r) => {
        const sys = normalizeKey(r.systemId || r.system || r.original?.systemId || r.original?.system || "general");
        const score = r.score ?? r.original?.score ?? "";
        const ts = new Date(r.timestamp || r.original?.timestamp || Date.now()).toISOString();
        const title = r.original?.title || r.title || "";
        rows.push([sys, score, ts, title]);
      });
      const csv = toCSV(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(org && org.name) || effectiveOrg}_orghealth.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      alert("CSV export failed");
    }
  }

  function exportPrint(single = null) {
    // simple printable HTML view — user can Print -> Save as PDF
    const payload = single ? single : { composite, systems: perSystem };
    const html = `
      <html>
        <head>
          <title>Org Health Report</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body{font-family: Arial, Helvetica, sans-serif;padding:20px;color:#111}
            h1{font-size:20px}
            h2{font-size:16px;margin-top:18px}
            .box{border:1px solid #ddd;padding:12px;margin-top:8px;border-radius:6px}
            .muted{color:#666;font-size:12px}
          </style>
        </head>
        <body>
          <h1>Organizational Health — ${(org && org.name) || effectiveOrg}</h1>
          <div class="muted">Generated: ${new Date().toLocaleString()}</div>
          <div class="box"><strong>Composite:</strong> ${payload.composite ?? (single ? (single.score ?? "—") : "—")}</div>
          ${single ? `<h2>System: ${single.normalizedSystemId || single.systemId || single.id}</h2>
            <div class="box"><pre>${JSON.stringify(single, null, 2)}</pre></div>` : `<h2>Systems</h2>
            <div class="box"><pre>${JSON.stringify(perSystem, null, 2)}</pre></div>`}
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return alert("Popup blocked");
    w.document.write(html);
    w.document.close();
    w.focus();
    // user prints manually to PDF
  }

  /* small spark bars */
  function SparkBars({ values = [], height = 36 }) {
    if (!values || values.length === 0) return <div className="text-xs text-gray-400">No history</div>;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const barCount = Math.max(4, values.length);
    const w = Math.max(120, barCount * 8); // narrower bars so they fit neatly
    return (
      <div className="w-full">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${w} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="rounded block"
          style={{ display: "block" }}
        >
          {values.map((v, i) => {
            const x = i * (w / values.length);
            const h = max === min ? height * 0.6 : ((v - min) / (max - min || 1)) * (height - 6) + 4;
            const barW = Math.max(4, w / values.length - 2);
            return (
              <rect
                key={i}
                x={x + 1}
                y={height - h}
                width={barW}
                height={h}
                rx={2}
                className={darkMode ? "opacity-80" : "opacity-90"}
                style={{ fill: "#4f46e5" }}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  /* ---------- Modal content ---------- */

  // Components list (from your specification)
  const COMPONENTS_LIST = [
    "Industry Dynamics",
    "Founding Roots",
    "Organization",
    "Leadership",
    "Culture",
    "Innovation",
    "Strategy",
    "Structure",
    "Processes",
    "Dynamic Behavior",
    "Technology",
    "Risk",
    "Financials",
    "Skills",
    "Resources",
    "Environment",
    "Goals",
    "Policy",
    "Staff-People",
  ];

  // ResultDetail now follows the required output structure
  function ResultDetail({ systemLabel, result }) {
    const score = result?.score ?? result?.original?.score ?? null;
    const ts = result?.timestamp || result?.original?.timestamp || result?.original?.ts || null;
    const original = result?.original || {};
    const subProgress = original?.subProgress || original?.meta?.subProgress || null;
    const notes = original?.notes || original?.meta?.notes || original?.summary || "";

    // Rankings: system rank relative to other systems (compute quickly)
    const systemRank = (() => {
      const allScores = perSystem.map((p) => (p.score === null || p.score === undefined ? -1 : p.score));
      const valid = allScores.filter((s) => s >= 0);
      if (!valid.length) return { rank: "—", total: perSystem.length };
      const sorted = valid.slice().sort((a, b) => b - a);
      const pos = sorted.indexOf(score) + 1 || "—";
      return { rank: pos, total: valid.length };
    })();

    // Insights: try to read from original.meta.insights otherwise synthesize simple ones
    const insights = original?.meta?.insights || original?.insights || [
      `Core strength: ${score >= 75 ? "strong governance and clarity" : "needs improved coordination"}`,
      `Area of concern: ${score < 60 ? "low ownership and slow handoffs" : "occasional misalignment under pressure"}`,
    ];

    const forecasts = original?.meta?.forecasts || original?.forecasts || [
      { horizon: "4 weeks", text: "Stabilize processes — small wins expected" },
      { horizon: "3 months", text: "Partial improvement if action plan executed" },
      { horizon: "12 months", text: "Sustained lift if underlying culture & KPIs fixed" },
    ];

    // Recommendations (X-ULTRA)
    const xUltraRecs = original?.meta?.recommendations || [
      { title: "Short", items: ["Assign triage owners for blocked tickets", "Daily 15m unblock standup for critical flows"] },
      { title: "Mid", items: ["Run 8-week retention test", "Implement cross-team SLAs"] },
      { title: "Long", items: ["Embed playbooks and capability uplift program", "Consider partnerships to scale delivery"] },
    ];

    // African case-study
    const caseStudy = original?.meta?.caseStudy || {
      company: "Dangote Group (Nigeria)",
      summary: "Improved cross-unit coordination via central playbooks and weekly triage; measured using delivery cycle time.",
      result: "~35% faster delivery for prioritized initiatives in 12–18 months.",
    };

    // Build Rankings table at component-level if original.components available
    const componentScores = original?.components || null; // expected shape { "Leadership": 78, ... }

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-gray-400 mt-1">
              Score: {score !== null ? `${score}%` : "—"} {ts && <span className="ml-2">· Completed {new Date(ts).toLocaleString()}</span>}
            </div>
            <div className="text-xs text-gray-400 mt-1">Ranking: {systemRank.rank}/{systemRank.total}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => exportJSON(false, result)} className="px-3 py-1 rounded-md border text-sm">Export JSON</button>
            <button onClick={() => exportCSV(false, result)} className="px-3 py-1 rounded-md border text-sm">Export CSV</button>
            <button onClick={() => exportPrint(result)} className="px-3 py-1 rounded-md border text-sm">Print / PDF</button>
          </div>
        </div>

        {/* Components list */}
        <div>
          <h5 className="font-semibold">Components examined</h5>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMPONENTS_LIST.map((c) => (
              <div key={c} className={`p-2 rounded-md text-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                <div className="font-medium">{c}</div>
                <div className="text-xs text-gray-400 mt-1">{(componentScores && componentScores[c] != null) ? `${Math.round(componentScores[c])}%` : "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div>
          <h5 className="font-semibold">1. Rankings</h5>
          <div className="mt-2 text-sm text-gray-600">
            System rank: <strong>{systemRank.rank}/{systemRank.total}</strong>.
            {componentScores ? " Component-level ranks are shown above." : " Component-level data not available."}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h5 className="font-semibold">2. Insights</h5>
          <div className="mt-2 space-y-2">
            {insights.map((ins, i) => <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>{ins}</div>)}
          </div>
        </div>

        {/* Case Study */}
        <div>
          <h5 className="font-semibold">3. Case study from African business</h5>
          <div className={`p-3 rounded-md ${darkMode ? "bg-green-900/10 border border-green-800" : "bg-green-50 border border-green-100"}`}>
            <div className="font-medium">{caseStudy.company}</div>
            <div className="text-sm mt-1">{caseStudy.summary}</div>
            <div className="text-sm mt-2 font-medium">Outcome</div>
            <div className="text-sm">{caseStudy.result}</div>
          </div>
        </div>

        {/* Forecasts */}
        <div>
          <h5 className="font-semibold">4. Forecasts</h5>
          <div className="mt-2 space-y-2">
            {forecasts.map((f, i) => (
              <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                <div className="font-medium">{f.horizon}</div>
                <div className="text-sm text-gray-600 mt-1">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* X-ULTRA Recommendations */}
        <div>
          <h5 className="font-semibold">5. X-ULTRA Recommendations</h5>
          <div className="mt-2 space-y-3">
            {xUltraRecs.map((r, i) => (
              <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-blue-900/10 border border-blue-800" : "bg-blue-50 border border-blue-100"}`}>
                <div className="font-medium">{r.title}</div>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {r.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {notes && (
          <div>
            <h5 className="font-semibold">Notes & Observations</h5>
            <div className="mt-2 text-sm text-gray-400 whitespace-pre-wrap">{notes}</div>
          </div>
        )}
      </div>
    );
  }

  /* No-data: single clear CTA */
  function NoDataPrompt({ systemLabel, blurb }) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">No assessment found for {systemLabel}</h4>
          <div className="text-sm text-gray-400 mt-1">We don't yet have data for this system.</div>
        </div>

        <div className={`p-4 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
          <div className="text-sm text-gray-400">{blurb}</div>
          <ul className="list-disc pl-5 mt-3 text-sm text-gray-600">
            <li>Understand how this system impacts delivery, quality and growth.</li>
            <li>Get automated recommendations tailored to your organization.</li>
            <li>Export actionable meeting agendas and owners to follow up quickly.</li>
          </ul>
        </div>

        <div>
          <p className="text-sm text-gray-500">Ready to assess? The assessment takes ~10–20 minutes per system and will populate this panel with an easy-to-read report and recommended next steps.</p>
          <div className="mt-4">
            <button
              onClick={() => {
                try { window.dispatchEvent(new CustomEvent("conseqx:assessment:start", { detail: { systemId: systemLabel, orgId: effectiveOrg } })); } catch {}
                navigate("/ceo/assessments");
                setModalOpen(false);
              }}
              className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
            >
              Take Organizational Health Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* row action handlers */
  function openSystemModal(systemId) {
    const payload = { systemId, result: latestBySystem[systemId] || null };
    setModalPayload(payload);
    setModalOpen(true);
  }

  function onTakeAssessment(systemId) {
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:start", { detail: { systemId, orgId: effectiveOrg } }));
    } catch {}
    navigate("/ceo/assessments");
  }

  /* ---------- render ---------- */
  return (
    <div className={`rounded-2xl p-4 ${darkMode ? "bg-gradient-to-br from-gray-900/80 to-gray-900/60 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none} .hide-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }`}</style>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Removed the large blue background behind the icon; icon now sits on transparent background */}
          <div className="p-2 rounded-md bg-transparent">
            <FaChartPie className="text-2xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-semibold">Organizational Health</div>
            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Composite view across core systems</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-md border overflow-hidden">
            <button onClick={() => exportJSON(true)} className={`px-2 py-1 text-xs ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`} title="Export all (JSON)">JSON</button>
            <button onClick={() => exportCSV(true)} className={`px-2 py-1 text-xs ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`} title="Export all (CSV)">CSV</button>
            <button onClick={() => exportPrint(null)} className={`px-2 py-1 text-xs ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`} title="Print / PDF">Print</button>
          </div>
        </div>
      </div>

      {/* GRID: left = score/details, right = spark (keeps spark aligned and never overlapped) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-8">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-400">Composite score</div>
              <div className="text-2xl font-bold mt-1">{loading ? "…" : composite !== null ? `${composite}%` : "—"}</div>
              <div className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{results && results.length ? `${results.length} datapoints` : "No data yet"}</div>
            </div>

            <div className="flex-1 hidden sm:block">
              {/* keep some space between score and spark on large screens */}
            </div>
          </div>
        </div>

        <div className="sm:col-span-4 flex justify-end items-center">
          {/* Constrain spark to a tidy box so it doesn't float or overlap */}
          <div className="w-full max-w-[220px]">
            <div className={`text-xs mb-1 ${darkMode ? "text-gray-400 text-right" : "text-gray-500 text-right"}`}>Recent trend</div>
            <div className={`w-full h-11 rounded p-1 ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
              <SparkBars values={compositeHistory} height={36} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {perSystem.map((p) => (
          <div key={p.id} className={`flex items-center justify-between gap-3 p-3 rounded ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${pctToToneClass(p.score, darkMode)}`}>{p.label}</div>
                <div className={`text-sm truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  {p.score !== null ? `${p.score}%` : <span className="text-xs text-gray-400">Assessment not taken</span>}
                </div>
              </div>

              {/* Blue progress bar for answered systems (if answeredPct available) */}
              {p.answeredPct != null ? (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">{p.answeredPct}% answered</div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div style={{ width: `${Math.max(4, Math.min(100, p.answeredPct))}%` }} className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500" />
                  </div>
                </div>
              ) : p.score !== null ? (
                // if no answeredPct but has score, show small indicator bar proportional to score
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Score progress</div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div style={{ width: `${Math.max(4, Math.min(100, p.score))}%` }} className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500" />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400">Take your organizational health assessment to populate this system's report.</div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSystemModal(p.id)}
                  className={`px-3 py-1 rounded-md border text-xs ${darkMode ? "bg-gray-900 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}
                  title={p.score !== null ? "View detailed results" : "No results yet — learn about this system and take the assessment"}
                  aria-label={`View ${p.label}`}
                >
                  <FaEye />
                </button>

                {p.score === null && (
                  <button
                    onClick={() => onTakeAssessment(p.id)}
                    className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs"
                    title={`Take ${p.label} assessment`}
                  >
                    Take assessment
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-400">{p.result?.timestamp ? new Date(p.result.timestamp).toLocaleDateString() : (p.score !== null ? "Date unknown" : "—")}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-400">Tip: run assessments from the Assessments panel to populate these scores. The OrgHealth engine stores recent results and emits suggestions into Reports.</div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalPayload(null);
        }}
        title={modalPayload ? (modalPayload.result ? `THE SYSTEM OF ${(canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label || modalPayload.systemId).toUpperCase()} REPORT` : `THE SYSTEM OF ${(canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label || modalPayload.systemId).toUpperCase()} — GET STARTED`) : "System"}
        darkMode={darkMode}
        footer={
          modalPayload ? (
            modalPayload.result ? (
              <>
                <button onClick={() => exportJSON(false, modalPayload.result)} className="px-3 py-2 rounded-md border">JSON</button>
                <button onClick={() => exportCSV(false, modalPayload.result)} className="px-3 py-2 rounded-md border">CSV</button>
                <button onClick={() => exportPrint(modalPayload.result)} className="px-3 py-2 rounded-md border">Print</button>
                <button onClick={() => { setModalOpen(false); navigate("/ceo/assessments"); }} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white"><FaExternalLinkAlt className="inline mr-2" />Open assessment</button>
              </>
            ) : (
              <>
                {/* placeholder */}
              </>
            )
          ) : null
        }
      >
        {modalPayload && (modalPayload.result ? (
          <ResultDetail systemLabel={(canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label) || modalPayload.systemId} result={modalPayload.result} />
        ) : (
          <NoDataPrompt systemLabel={(canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label) || modalPayload.systemId} blurb={(canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.blurb) || ""} />
        ))}
      </Modal>
    </div>
  );
}
