import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getResults } from "./services/orgHealth"; // ensure path is correct
import { FaChartPie, FaDownload, FaEye } from "react-icons/fa";
import { downloadSystemDeepDivePDF } from "../../utils/pdfReportBuilder";

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
      { id: "interdependency", label: "Interdependency", blurb: "How well your teams and departments work together across boundaries." },
      { id: "orchestration", label: "Orchestration", blurb: "How quickly your organisation adapts, improves, and responds to change." },
      { id: "investigation", label: "Investigation", blurb: "How well you get to the root of problems before they spread." },
      { id: "interpretation", label: "Interpretation", blurb: "How well you turn information into smart decisions." },
      { id: "illustration", label: "Illustration", blurb: "How clearly ideas and knowledge flow across the organisation." },
      { id: "inlignment", label: "Inlignment", blurb: "How well your day-to-day work lines up with your bigger goals." },
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

  function handleExportPDF(systemLabel, result) {
    if (!result) return;
    const original = result?.original || {};
    const subScoresRaw = original?.meta?.subScores || [];
    const scorePct = result?.score ?? result?.original?.score ?? 0;
    const ts = result?.timestamp || original?.timestamp || null;
    const interp = original?.meta?.interpretation || {};

    // Derive the same data that ResultDetail computes
    const insights = original?.meta?.insights || (() => {
      if (subScoresRaw.length === 0) return [scorePct >= 75 ? "Your organisation shows strong leadership and clear direction in this area." : "There's room to improve how teams coordinate in this area."];
      const sorted = [...subScoresRaw].sort((a, b) => (a.max > 0 ? a.score / a.max : 0) - (b.max > 0 ? b.score / b.max : 0));
      const out = [];
      if (interp.rating) out.push(`Your organisation rated at the "${interp.rating}" level for this system.`);
      if (interp.interpretation) out.push(interp.interpretation);
      const s = sorted[sorted.length - 1];
      const w = sorted[0];
      if (s) out.push(`Your strongest area is ${s.title}, scoring ${s.max > 0 ? Math.round((s.score / s.max) * 100) : 0}%.`);
      if (w && w !== s) out.push(`${w.title} needs the most work at ${w.max > 0 ? Math.round((w.score / w.max) * 100) : 0}%.`);
      return out.length ? out : [`You scored ${scorePct}% overall.`];
    })();

    const forecasts = original?.meta?.forecasts || [
      { horizon: "Next 4 weeks", text: scorePct < 50 ? "This needs attention soon." : "Things are stable. Look for small improvements." },
      { horizon: "Next 3 months", text: scorePct < 50 ? "With focused effort you should make real progress." : "Keep at it and you'll see noticeable improvements." },
      { horizon: "Over the next year", text: "Look at the bigger picture — culture, processes, and incentives." },
    ];

    const recommendations = original?.meta?.recommendations || [
      { title: "Do this now (next 4 weeks)", items: ["Identify who owns each stuck task", "Start short daily check-ins to clear roadblocks"] },
      { title: "Work on over the next few months", items: ["Test whether retention efforts are working", "Set clear expectations between teams"] },
      { title: "Keep an eye on over the next year", items: ["Create simple playbooks for common processes", "Look into partnerships or outside help"] },
    ];

    const caseStudy = original?.meta?.caseStudy || {
      company: "Dangote Group (Nigeria)",
      summary: "Dangote noticed their divisions were working in silos. They brought in shared playbooks and weekly check-ins so teams could coordinate properly.",
      result: "Top projects started getting done about 35% faster within 18 months.",
    };

    const allScores = perSystem.map(p => (p.score == null ? -1 : p.score));
    const valid = allScores.filter(s => s >= 0);
    const sorted = valid.slice().sort((a, b) => b - a);
    const pos = sorted.indexOf(scorePct) + 1 || null;
    const ranking = valid.length ? { rank: pos, total: valid.length } : null;

    downloadSystemDeepDivePDF({
      systemLabel,
      score: scorePct,
      timestamp: ts,
      subScores: subScoresRaw,
      insights,
      forecasts,
      recommendations,
      caseStudy,
      orgName: (org && org.name) || effectiveOrg,
      ranking,
    });
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

  function ResultDetail({ systemLabel, result }) {
    const score = result?.score ?? result?.original?.score ?? null;
    const ts = result?.timestamp || result?.original?.timestamp || result?.original?.ts || null;
    const original = result?.original || {};
    const subProgress = original?.subProgress || original?.meta?.subProgress || null;
    const notes = original?.notes || original?.meta?.notes || original?.summary || "";

    // Sub-scores from rubrics-based scoring
    const subScoresRaw = original?.meta?.subScores || [];
    const interp = original?.meta?.interpretation || {};

    // Rankings: system rank relative to other systems (compute quickly)
    const systemRank = (() => {
      const allScores = perSystem.map((p) => (p.score === null || p.score === undefined ? -1 : p.score));
      const valid = allScores.filter((s) => s >= 0);
      if (!valid.length) return { rank: "—", total: perSystem.length };
      const sorted = valid.slice().sort((a, b) => b - a);
      const pos = sorted.indexOf(score) + 1 || "—";
      return { rank: pos, total: valid.length };
    })();

    // Derive insights from subScores if enriched insights aren't available
    const insights = original?.meta?.insights || (() => {
      if (subScoresRaw.length === 0) {
        return [
          score >= 75
            ? "Your organisation shows strong leadership and clear direction in this area. Teams seem to know what's expected and are delivering on it."
            : "There's room to improve how teams coordinate in this area. Better handoffs and clearer ownership would go a long way.",
          score < 60
            ? "One thing that stood out is that accountability seems unclear in places — when no one clearly owns a task, things tend to fall through the cracks."
            : "Under normal conditions things run smoothly, but when pressure builds, alignment tends to slip a bit. Worth keeping an eye on.",
        ];
      }
      const sorted = [...subScoresRaw].sort((a, b) => {
        const pA = a.max > 0 ? a.score / a.max : 0;
        const pB = b.max > 0 ? b.score / b.max : 0;
        return pA - pB;
      });
      const w = sorted[0];
      const s = sorted[sorted.length - 1];
      const out = [];
      if (interp.rating) out.push(`Your organisation rated at the "${interp.rating}" level for this system.`);
      if (interp.interpretation) out.push(interp.interpretation);
      if (s) out.push(`Your strongest area is ${s.title}, where you scored ${s.max > 0 ? Math.round((s.score / s.max) * 100) : 0}% — that's something to build on.`);
      if (w && w !== s) out.push(`The area that needs the most work is ${w.title}, which came in at ${w.max > 0 ? Math.round((w.score / w.max) * 100) : 0}%. This is where you'll want to focus your energy first.`);
      return out.length ? out : [`You scored ${score}% overall for this system.`];
    })();

    const forecasts = original?.meta?.forecasts || [
      { horizon: "Next 4 weeks", text: score < 50 ? "This needs attention soon — the longer these gaps stay open, the harder they get to close. Start with one or two quick fixes." : "Things are stable here. Look for a couple of small improvements you can make in the next few weeks to build some momentum." },
      { horizon: "Next 3 months", text: score < 50 ? "With focused effort and clear ownership, you should be able to make real progress here. Don't try to fix everything — pick the biggest pain points first." : "If you keep at it, you should start seeing noticeable improvements in the areas that matter most." },
      { horizon: "Over the next year", text: "For lasting change, look at the bigger picture — how people are measured, what the culture rewards, and whether your processes actually support the outcomes you want." },
    ];

    // Recommendations
    const xUltraRecs = original?.meta?.recommendations || (() => {
      if (subScoresRaw.length === 0) {
        return [
          { title: "Do this now (next 4 weeks)", items: ["Identify who owns each stuck task or blocked ticket — if no one owns it, it won't get fixed", "Start a short daily check-in (15 minutes) to clear roadblocks on your most important work"] },
          { title: "Work on over the next few months", items: ["Test whether your team retention efforts are actually working — track it over 8 weeks", "Set clear expectations between teams so everyone knows what they can count on from each other"] },
          { title: "Keep an eye on over the next year", items: ["Create simple playbooks for your most common processes so people don't have to figure things out from scratch", "Look into partnerships or outside help to take some of the delivery pressure off your core team"] },
        ];
      }
      const shortItems = [];
      const midItems = [];
      const longItems = [];
      subScoresRaw.forEach(sub => {
        const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : 0;
        const recs = sub.interpretation?.recommendations || [];
        if (pct < 50) shortItems.push(...recs.slice(0, 2).map(r => `For ${sub.title}: ${r}`));
        else if (pct < 75) midItems.push(...recs.slice(0, 1).map(r => `For ${sub.title}: ${r}`));
        else longItems.push(`${sub.title} is looking good — keep doing what's working and check back in regularly`);
      });
      if (!shortItems.length) shortItems.push("Start with the areas that scored lowest and decide who should take the lead on each one");
      if (!midItems.length) midItems.push("Pick a couple of mid-range areas and spend focused time improving them over the next two months");
      if (!longItems.length) longItems.push("Make it a habit to revisit these scores regularly — lasting improvement comes from consistency, not one-time pushes");
      return [
        { title: "Do this now (next 4 weeks)", items: shortItems.slice(0, 4) },
        { title: "Work on over the next few months", items: midItems.slice(0, 4) },
        { title: "Keep an eye on over the next year", items: longItems.slice(0, 4) }
      ];
    })();

    // African case-study
    const caseStudy = original?.meta?.caseStudy || {
      company: "Dangote Group (Nigeria)",
      summary: "Dangote noticed their different divisions were working in silos, which was slowing everything down. They brought in shared playbooks and weekly check-ins so teams could talk to each other properly and track how long things really took.",
      result: "Their top projects started getting done about 35% faster within 18 months.",
    };

    // Build Rankings table at component-level if original.components available
    const componentScores = original?.meta?.components || original?.components || null; // expected shape { "Leadership": 78, ... }
    const subScores = original?.meta?.subScores || [];
    const hasSubScores = subScores.length > 0;

    const componentEntries = hasSubScores
      ? subScores.map(sub => ({
          name: sub.title,
          score: sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : (sub.percent || null),
          rating: sub.interpretation?.rating || null
        }))
      : (componentScores
          ? Object.entries(componentScores).map(([name, score]) => ({ name, score: Math.round(score), rating: null }))
          : []);

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
            <button onClick={() => handleExportPDF(systemLabel, result)} className="px-3 py-1 rounded-md border text-sm flex items-center gap-1"><FaDownload className="text-xs" /> Export PDF</button>
          </div>
        </div>

        {/* Components / Sub-assessments */}
        {componentEntries.length > 0 && <div>
          <h5 className="font-semibold">{hasSubScores ? "How you scored on each area" : "Breakdown by component"}</h5>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {componentEntries.map((c, idx) => (
              <div key={c.name || idx} className={`p-2 rounded-md text-sm ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                <div className="font-medium">{c.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-400">{c.score != null ? `${c.score}%` : "—"}</div>
                  {c.rating && <div className="text-xs text-gray-500 truncate max-w-[60%] text-right">{c.rating}</div>}
                </div>
                {c.score != null && (
                  <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={`h-full rounded-full ${c.score >= 75 ? "bg-green-500" : c.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${c.score}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>}

        {/* Rankings */}
        <div>
          <h5 className="font-semibold">How this system compares</h5>
          <div className="mt-2 text-sm text-gray-600">
            This system ranks <strong>{systemRank.rank} out of {systemRank.total}</strong> across all systems you've assessed.
            {(hasSubScores || componentScores) ? " You can see the breakdown for each area above." : ""}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h5 className="font-semibold">What the results tell us</h5>
          <div className="mt-2 space-y-2">
            {insights.map((ins, i) => <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>{ins}</div>)}
          </div>
        </div>

        {/* Case Study */}
        <div>
          <h5 className="font-semibold">How an African business tackled this</h5>
          <div className={`p-3 rounded-md ${darkMode ? "bg-green-900/10 border border-green-800" : "bg-green-50 border border-green-100"}`}>
            <div className="font-medium">{caseStudy.company}</div>
            <div className="text-sm mt-1">{caseStudy.summary}</div>
            <div className="text-sm mt-2 font-medium">What happened</div>
            <div className="text-sm">{caseStudy.result}</div>
          </div>
        </div>

        {/* Forecasts */}
        <div>
          <h5 className="font-semibold">What to expect going forward</h5>
          <div className="mt-2 space-y-2">
            {forecasts.map((f, i) => (
              <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                <div className="font-medium">{f.horizon}</div>
                <div className="text-sm text-gray-600 mt-1">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h5 className="font-semibold">What we recommend</h5>
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
          <h4 className="text-lg font-semibold">You haven't assessed {systemLabel} yet</h4>
          <div className="text-sm text-gray-400 mt-1">Once you complete the assessment, you'll see your results here.</div>
        </div>

        <div className={`p-4 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
          <div className="text-sm text-gray-400">{blurb}</div>
          <ul className="list-disc pl-5 mt-3 text-sm text-gray-600">
            <li>See how well this system is really working in your organisation.</li>
            <li>Get practical, tailored recommendations you can act on right away.</li>
            <li>Walk away with a clear list of next steps and who should own them.</li>
          </ul>
        </div>

        <div>
          <p className="text-sm text-gray-500">It takes about 10–20 minutes per system. Once you're done, this panel will fill up with a clear report and recommended next steps.</p>
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


      </div>

      {/* GRID: left = score/details, right = spark (keeps spark aligned and never overlapped) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-8">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-400">Composite score</div>
              <div className="text-2xl font-bold mt-1">{loading ? "…" : composite !== null ? `${composite}%` : "—"}</div>
              <div className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{results && results.length ? `Based on ${results.length} assessment${results.length !== 1 ? "s" : ""}` : "No assessments yet"}</div>
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

              {p.score !== null ? (
                <div className="mt-2">
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div style={{ width: `${Math.max(4, Math.min(100, p.score))}%` }} className={`h-full rounded-full ${p.score >= 70 ? "bg-green-500" : p.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400">Not yet assessed — click View to learn more, or take the assessment.</div>
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



      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalPayload(null);
        }}
        title={modalPayload ? (modalPayload.result ? `${canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label || modalPayload.systemId} — Full Report` : `${canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label || modalPayload.systemId} — Get Started`) : "System"}
        darkMode={darkMode}
        footer={
          modalPayload ? (
            modalPayload.result ? (
              <>
                <button onClick={() => handleExportPDF(canonical.find(c => normalizeKey(c.id) === modalPayload.systemId)?.label || modalPayload.systemId, modalPayload.result)} className="px-3 py-2 rounded-md border flex items-center gap-1"><FaDownload className="text-xs" /> Export PDF</button>
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
