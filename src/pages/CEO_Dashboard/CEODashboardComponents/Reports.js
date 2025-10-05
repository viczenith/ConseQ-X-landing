// src/pages/CEO_Dashboard/CEODashboardComponents/CEOReports.js
import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaBell,
  FaExclamationTriangle,
  FaLightbulb,
  FaCheckCircle,
  FaTimes,
  FaCalendarPlus,
  FaClock,
  FaTrash,
  FaEye,
} from "react-icons/fa";

/* ---------- storage keys ---------- */
const STORAGE_NOTIFS = "conseqx_reports_notifications_v3";
const STORAGE_REMINDERS = "conseqx_reports_reminders_v3";
const STORAGE_SUGGS = "conseqx_reports_suggestions_v3";

/* ---------- helpers ---------- */
const genId = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000)}`;
const prettyDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
};
const readJSON = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/* ---------- UI primitives ---------- */
function Badge({ children, tone = "default" }) {
  const classMap = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    warn: "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    success: "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    info: "bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
  };
  return <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded text-xs font-semibold ${classMap[tone] || classMap.default}`}>{children}</span>;
}

/* ---------- sample suggestions (deep) ---------- */
function sampleSuggestions() {
  const now = Date.now();
  return [
    {
      id: genId("s"),
      severity: "warning",
      title: "Orchestration gap increasing — delivery at risk",
      summary: "Cross-team blockers rose 27% MoM; key deliveries slipping. Immediate attention required to avoid roadmap delay.",
      impact: "High — projected 6–8 week roadmap slip if not remediated.",
      predictions: {
        short: "Backlog growth +18% and 2 upcoming milestones delayed in next 2–6 weeks.",
        mid: "3–6 months: feature velocity declines ~20% and churn risk increases.",
        long: "12+ months: growth deceleration if unresolved; investor KPIs impacted.",
      },
      evidence: [
        "PR merge conflicts increased 40% over past 30 days",
        "Average lead time to production increased from 4d → 9d",
        "95% of blocked tickets have missing owners",
      ],
      comparables: [
        {
          name: "Acme SaaS",
          story: "Acme introduced weekly cross-functional triage and rotating ownership — recovered velocity in ~8 weeks.",
        },
      ],
      recommendedMeeting: {
        title: "Cross-team Triage — unblock delivery",
        urgency: "Urgent",
        attendees: ["Head of Engineering", "VP Product", "Ops Lead", "QA Lead"],
        proposedDurationMin: 45,
        agenda: ["Quick sync on blocked items (10m)", "Assign owners & SLAs (15m)", "Decide rolling fixes (15m)", "Confirm follow-ups (5m)"],
        talkingPoints: [
          "Reduce cross-team handoff time — propose triage-owner rotation.",
          "Temporary reallocation of 2 engineers to unblock high-impact tickets.",
        ],
      },
      createdAt: now - 1000 * 60 * 60 * 24 * 2,
      source: "Assessment: Orchestration System",
      acted: false,
      dismissed: false,
    },
    {
      id: genId("s"),
      severity: "improvement",
      title: "SME Pricing Promotion — 8% projected lift",
      summary: "Targeted quarterly promo for SMEs could increase conversions by ~8%. Pilot recommended.",
      impact: "Medium — improves acquisition and short-term revenue.",
      predictions: {
        short: "3 months: +8% conversion on targeted cohorts.",
        mid: "6–12 months: +12% ARR from retention if onboarding optimized.",
        long: "12+ months: improved LTV:CAC if upgrade path is clear.",
      },
      evidence: ["Top SME leads show high engagement but drop at checkout", "Price sensitivity detected in funnel heatmaps"],
      comparables: [{ name: "TinyAnalytics", story: "Ran 3-month SME promo with onboarding credits; conversion rose 10%." }],
      recommendedMeeting: {
        title: "Go-to-market pilot planning (SME promo)",
        urgency: "High",
        attendees: ["Head Growth", "Sales Director", "Head Customer Success", "Finance PM"],
        proposedDurationMin: 60,
        agenda: ["Define promo mechanics (15m)", "Onboarding plan (15m)", "Measurement & KPIs (15m)", "Budget & timeline (15m)"],
        talkingPoints: ["Pilot 3-month promo with onboarding credit; monitor conversion.", "Coordinate sales enablement."],
      },
      createdAt: now - 1000 * 60 * 60 * 24 * 5,
      source: "Assessment: Revenue Model",
      acted: false,
      dismissed: false,
    },
  ];
}

/* ---------- modal (responsive) ---------- */
function Modal({ open, title, onClose, children, darkMode = false, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: darkMode ? "rgba(2,6,23,0.6)" : "rgba(0,0,0,0.45)" }} onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className={`${darkMode ? "text-gray-300" : "text-gray-600"} ml-2`}>
            <FaTimes />
          </button>
        </div>

        <div className="mt-4 max-h-[70vh] overflow-auto hide-scrollbar">{children}</div>

        {footer && <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function CEOReports() {
  const { darkMode } = useOutletContext();

  // better contrast for light mode: set secondary text variable
  const secondaryText = darkMode ? "text-gray-300" : "text-gray-600";
  const subtleText = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBgLight = "bg-white";

  const [notifications, setNotifications] = useState(() => readJSON(STORAGE_NOTIFS, []));
  const [reminders, setReminders] = useState(() => readJSON(STORAGE_REMINDERS, []));
  const [suggestions, setSuggestions] = useState(() => readJSON(STORAGE_SUGGS, sampleSuggestions()));

  // NEW: Listen for orgHealth recommendations and append to suggestions
  useEffect(() => {
    function handleOrgHealthRecommendation(e) {
      try {
        const { orgId, recommendations } = e?.detail || {};
        if (!recommendations || !Array.isArray(recommendations)) return;
        // map recommendations to your suggestions shape
        const mapped = recommendations.map((r) => ({
          id: r.id || genId("s"),
          severity: (r.severity) || (r.impact && r.impact.toLowerCase().includes("high") ? "warning" : "improvement"),
          title: r.title || "Org health recommendation",
          summary: r.summary || r.description || "",
          impact: r.impact || "Medium",
          predictions: r.predictions || {},
          evidence: r.evidence || [],
          comparables: r.comparables || [],
          recommendedMeeting: r.recommendedMeeting || null,
          createdAt: r.createdAt || Date.now(),
          source: r.source || "OrgHealth",
          acted: false,
          dismissed: false,
        }));
        setSuggestions((prev) => {
          const next = [...mapped, ...prev];
          writeJSON(STORAGE_SUGGS, next);
          return next;
        });
        // also create a notification
        setNotifications((prev) => {
          const n = { id: genId("n"), title: `New OrgHealth suggestion: ${mapped[0].title}`, body: mapped[0].summary, ts: Date.now(), read: false, type: "orghealth", suggestionId: mapped[0].id };
          const next = [n, ...prev];
          writeJSON(STORAGE_NOTIFS, next);
          return next;
        });
      } catch (err) {
        console.error("Error handling orghealth recommendation:", err);
      }
    }
    window.addEventListener("conseqx:orghealth:recommendation", handleOrgHealthRecommendation);
    return () => window.removeEventListener("conseqx:orghealth:recommendation", handleOrgHealthRecommendation);
  }, []);

  // UI
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [suggestionModal, setSuggestionModal] = useState({ open: false, suggestion: null });
  const [notifModal, setNotifModal] = useState({ open: false, notif: null });
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderWhen, setNewReminderWhen] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [scheduleFromSuggestion, setScheduleFromSuggestion] = useState(null);

  // persist
  useEffect(() => writeJSON(STORAGE_NOTIFS, notifications), [notifications]);
  useEffect(() => writeJSON(STORAGE_REMINDERS, reminders), [reminders]);
  useEffect(() => writeJSON(STORAGE_SUGGS, suggestions), [suggestions]);

  // seed notifications
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setNotifications([
        { id: genId("n"), title: "Assessment completed: Orchestration", body: "Orchestration assessment completed — score 42%. Review AI suggestions.", ts: Date.now() - 1000 * 60 * 30, read: false, type: "assessment" },
        { id: genId("n"), title: "New AI suggestion: SME Promo", body: "AI recommends SME promo to increase conversions. View suggestion.", ts: Date.now() - 1000 * 60 * 60 * 24, read: false, type: "insight", suggestionId: suggestions[1]?.id },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const warningsCount = useMemo(() => suggestions.filter(s => s.severity === "warning" && !s.dismissed).length, [suggestions]);
  const upcomingCount = useMemo(() => reminders.filter(r => !r.done).length, [reminders]);

  /* ---------- actions ---------- */
  function openNotification(n) {
    setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, read: true } : p));
    setNotifModal({ open: true, notif: n });
  }
  function dismissNotification(id) { setNotifications(prev => prev.filter(n => n.id !== id)); }
  function clearAllNotifications() { setNotifications([]); }

  function createReminder({ title, whenIso }) {
    const r = { id: genId("rem"), title: title || "Untitled", when: whenIso, createdAt: Date.now(), done: false };
    setReminders(prev => [r, ...prev]);
    setShowNewReminder(false);
    setNewReminderTitle("");
    setScheduleFromSuggestion(null);
  }
  function toggleReminderDone(id) { setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r)); }
  function deleteReminder(id) { setReminders(prev => prev.filter(r => r.id !== id)); }

  function openSuggestionDetail(s) {
    setSuggestionModal({ open: true, suggestion: s });
  }

  function acceptSuggestionAsMeeting(sid) {
    const s = suggestions.find(x => x.id === sid);
    if (!s) return;
    setScheduleFromSuggestion(sid);
    setNewReminderTitle(`Meeting: ${s.recommendedMeeting?.title || s.title}`);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    setNewReminderWhen(d.toISOString().slice(0, 16));
    setShowNewReminder(true);
    setSuggestions(prev => prev.map(x => x.id === sid ? { ...x, acted: true } : x));
    setNotifications(prev => [{ id: genId("n"), title: `Accepted suggestion: ${s.title}`, body: `Scheduling a meeting for this suggestion.`, ts: Date.now(), read: false, type: "action", suggestionId: sid }, ...prev]);
    setSuggestionModal({ open: false, suggestion: null });
  }

  function dismissSuggestion(sid) {
    const s = suggestions.find(x => x.id === sid);
    setSuggestions(prev => prev.map(x => x.id === sid ? { ...x, dismissed: true } : x));
    setNotifications(prev => [{ id: genId("n"), title: `Dismissed suggestion: ${s?.title || sid}`, body: "Dismissed by user.", ts: Date.now(), read: false, type: "action" }, ...prev]);
    setSuggestionModal({ open: false, suggestion: null });
  }

  function saveSuggestionAsNotif(sid) {
    const s = suggestions.find(x => x.id === sid);
    if (!s) return;
    setNotifications(prev => [{ id: genId("n"), title: `Saved suggestion: ${s.title}`, body: s.summary, ts: Date.now(), read: false, type: "insight", suggestionId: sid }, ...prev]);
  }

  function handleCreateFromModal() {
    if (!newReminderTitle) return alert("Enter a title");
    const whenIso = new Date(newReminderWhen).toISOString();
    if (scheduleFromSuggestion) {
      const meeting = { id: genId("mtg"), title: newReminderTitle, when: whenIso, createdAt: Date.now(), done: false, suggestionId: scheduleFromSuggestion };
      setReminders(prev => [meeting, ...prev]);
      setNotifications(prev => [{ id: genId("n"), title: `Meeting scheduled: ${meeting.title}`, body: `At ${prettyDate(whenIso)}`, ts: Date.now(), read: false, type: "meeting", suggestionId: scheduleFromSuggestion }, ...prev]);
      setScheduleFromSuggestion(null);
    } else {
      createReminder({ title: newReminderTitle, when: whenIso });
    }
    setShowNewReminder(false);
    setNewReminderTitle("");
  }

  /* ---------- derived lists ---------- */
  const filteredSuggestions = useMemo(
    () => suggestions.filter(s => !s.dismissed).filter(s => filterSeverity === "all" ? true : s.severity === filterSeverity).sort((a, b) => b.createdAt - a.createdAt),
    [suggestions, filterSeverity]
  );
  const visibleNotifications = useMemo(() => notifications.slice().sort((a, b) => b.ts - a.ts), [notifications]);

  /* ---------- visual helpers ---------- */
  function severityIcon(sev) {
    if (sev === "warning") return <FaExclamationTriangle />;
    if (sev === "improvement") return <FaLightbulb />;
    if (sev === "opportunity") return <FaCheckCircle />;
    return <FaLightbulb />;
  }
  function severityToTone(sev) {
    if (sev === "warning") return "warn";
    if (sev === "improvement") return "info";
    if (sev === "opportunity") return "success";
    return "default";
  }

  /* ---------- small CSS injection (hide scrollbars, improve selection layout) ---------- */
  // hide-scrollbar class keeps scrolling functional but hides UI scrollbars across browsers
  // also ensure long words wrap
  const injectedStyle = `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .break-words { word-break: break-word; }
  `;

  /* ---------- render ---------- */
  return (
    <div className={`${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100" : "bg-slate-50 text-gray-900"} rounded-2xl p-4 sm:p-6 md:p-8`}>
      <style>{injectedStyle}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Reports & Executive AI</h1>
          <p className={`mt-1 text-sm ${secondaryText} max-w-xl break-words`}>
            Model-driven suggestions & recommended actions derived from system assessments. View predictions, evidence, comparables and meeting recommendations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${darkMode ? "bg-gray-800 border border-gray-700" : cardBgLight + " border border-gray-100"} shadow-sm w-full sm:w-auto justify-between`}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Warnings</span>
              <span className="text-lg font-bold text-amber-400">{warningsCount}</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-500">Unread</span>
              <span className="text-lg font-bold">{unreadCount}</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-500">Upcoming</span>
              <span className="text-lg font-bold">{upcomingCount}</span>
            </div>
          </div>

          {/* <button
            onClick={() => { setShowNewReminder(true); setScheduleFromSuggestion(null); setNewReminderTitle(""); }}
            className="ml-0 sm:ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow hover:opacity-95 w-full sm:w-auto justify-center"
          >
            <FaCalendarPlus /> <span className="text-sm">Schedule</span>
          </button> */}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Suggestions (span 2 cols on md+) */}
        <main className="md:col-span-2 space-y-4 min-w-0">
          <section className={`${darkMode ? "bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-800/60 border border-gray-700" : cardBgLight + " border border-gray-100"} rounded-2xl p-4 sm:p-5`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
              <div>
                <h2 className="text-lg font-semibold">X-Ultra Suggestions</h2>
                <div className={`${subtleText} text-xs`}>Model-driven insights & recommended actions</div>
              </div>

              {/* select + reset: responsive, wraps properly */}
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className={`px-2 py-1 rounded-md border text-sm min-w-[120px] ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}
                >
                  <option value="all">All</option>
                  <option value="warning">Warnings</option>
                  <option value="improvement">Improvements</option>
                  <option value="opportunity">Opportunities</option>
                  <option value="info">Info</option>
                </select>

                <button
                  onClick={() => setFilterSeverity("all")}
                  className="px-2 py-1 rounded-md border text-xs flex-shrink-0"
                  aria-label="Reset filter"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-auto hide-scrollbar">
              {filteredSuggestions.length === 0 && <div className={`${subtleText} text-sm p-3`}>No suggestions right now.</div>}
              {filteredSuggestions.map(s => (
                <article key={s.id} className={`flex flex-col sm:flex-row gap-3 p-3 sm:p-4 rounded-lg transition-shadow ${darkMode ? "bg-gray-800 border border-gray-700 hover:shadow-xl" : "bg-white border border-gray-100 hover:shadow-lg"}`}>
                  <div className="flex-shrink-0">
                    <div className={`rounded-full p-3 text-lg ${s.severity === "warning" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300" : s.severity === "improvement" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"}`}>
                      {severityIcon(s.severity)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{s.title}</h3>

                        {/* short summary: keep compact on list */}
                        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1 max-h-10 overflow-hidden whitespace-normal break-words`}>{s.summary}</p>

                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          <Badge tone={severityToTone(s.severity)}>{s.severity.toUpperCase()}</Badge>
                          <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs`}>{s.impact}</span>
                          <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs`}>•</span>
                          <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs`}>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <button onClick={() => openSuggestionDetail(s)} title="View details" className={`px-3 py-1 rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
                          <FaEye />
                        </button>

                        <div className="flex gap-2 mt-2">
                          <button onClick={() => acceptSuggestionAsMeeting(s.id)} className="px-3 py-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm">Accept</button>
                          <button onClick={() => dismissSuggestion(s.id)} className="px-3 py-1 rounded-md border text-sm text-red-500">Dismiss</button>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button onClick={() => saveSuggestionAsNotif(s.id)} className="px-2 py-1 rounded-md border text-xs">Save</button>
                          <button onClick={() => setNotifications(prev => [{ id: genId("n"), title: `Shared suggestion: ${s.title}`, body: `Shared with team: ${s.title}`, ts: Date.now(), read: false, type: "share", suggestionId: s.id }, ...prev])} className="px-2 py-1 rounded-md border text-xs">Share</button>
                        </div>
                      </div>
                    </div>

                    {s.predictions && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className={`p-2 rounded-md text-xs ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                          <div className="font-semibold text-xs">Short</div>
                          <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1 break-words`}>{s.predictions.short}</div>
                        </div>
                        <div className={`p-2 rounded-md text-xs ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                          <div className="font-semibold text-xs">Mid</div>
                          <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1 break-words`}>{s.predictions.mid}</div>
                        </div>
                        <div className={`p-2 rounded-md text-xs ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                          <div className="font-semibold text-xs">Long</div>
                          <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1 break-words`}>{s.predictions.long}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Reminders */}
          <section className={`${darkMode ? "bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700" : cardBgLight + " border border-gray-100"} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Reminders & Meetings</h3>
                <p className={`${subtleText} text-xs`}>Create follow-ups from suggestions or add your own reminders.</p>
              </div>

              <div>
                <button onClick={() => { setShowNewReminder(true); setScheduleFromSuggestion(null); setNewReminderTitle(""); }} className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <FaCalendarPlus /> <span className="ml-2 hidden sm:inline">New</span>
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2 max-h-56 overflow-auto hide-scrollbar">
              {reminders.length === 0 && <div className={`${subtleText} text-sm`}>No reminders scheduled.</div>}
              {reminders.slice(0, 8).map(r => (
                <div key={r.id} className={`p-2 rounded-lg flex items-center justify-between ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{r.title}</div>
                      <div className={`${subtleText} text-xs`}>{prettyDate(r.when)}</div>
                    </div>
                    <div className={`${subtleText} text-xs`}>{r.done ? "Completed" : "Upcoming"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleReminderDone(r.id)} className="px-2 py-1 rounded-md border text-xs">
                      {r.done ? <FaCheckCircle className="text-green-400" /> : <FaClock />}
                    </button>
                    <button onClick={() => deleteReminder(r.id)} className="px-2 py-1 rounded-md border text-xs text-red-500"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Right column */}
        <aside className="space-y-4 min-w-0">
          <div className={`${darkMode ? "bg-gradient-to-br from-gray-900/80 to-gray-900/60 border border-gray-700" : cardBgLight + " border border-gray-100"} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className={`${subtleText} text-xs`}>{unreadCount} unread</div>
              </div>
              <div>
                <button onClick={() => clearAllNotifications()} className="px-2 py-1 rounded-md border text-xs">Clear</button>
              </div>
            </div>

            <div className="mt-3 space-y-2 max-h-72 overflow-auto hide-scrollbar">
              {visibleNotifications.length === 0 && <div className={`${subtleText} text-sm`}>No notifications</div>}
              {visibleNotifications.map(n => (
                <div key={n.id} onClick={() => openNotification(n)} role="button" tabIndex={0} className={`p-2 rounded-md flex items-start justify-between cursor-pointer transition-shadow ${darkMode ? "bg-gray-800 border border-gray-700 hover:shadow-lg" : "bg-gray-50 border border-gray-100 hover:shadow"}`}>
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <div className={`rounded-full p-2 ${n.read ? "bg-gray-700 text-gray-300" : "bg-indigo-600 text-white"}`}><FaBell /></div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{n.title}</div>
                        <div className={`${subtleText} text-xs truncate`}>{n.body}</div>
                        <div className={`${subtleText} text-xs mt-1`}>{prettyDate(n.ts)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`${subtleText} text-xs`}>{n.type}</div>
                    <div>
                      <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} className="px-2 py-1 rounded-md border text-xs text-red-500">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${darkMode ? "bg-gradient-to-br from-gray-900/80 to-gray-900/60 border border-gray-700" : cardBgLight + " border border-gray-100"} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Upcoming meetings</h4>
              <div className={`${subtleText} text-xs`}>{reminders.length} scheduled</div>
            </div>

            <div className="mt-3 space-y-2">
              {reminders.filter(r => !r.done).slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className={`${subtleText} text-xs`}>{prettyDate(r.when)}</div>
                  </div>
                  <div className={`${subtleText} text-xs`}>{/* attendees placeholder */}</div>
                </div>
              ))}
              {reminders.filter(r => !r.done).length === 0 && <div className={`${subtleText} text-sm`}>No upcoming meetings</div>}
            </div>

            {/* <div className="mt-4 flex gap-2">
              <button onClick={() => { setShowNewReminder(true); setScheduleFromSuggestion(null); setNewReminderTitle(""); }} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white"><FaCalendarPlus /> Schedule</button>
              <button onClick={() => setNotifications(prev => [{ id: genId("n"), title: "Reminder digest", body: `${reminders.length} reminders scheduled`, ts: Date.now(), read: false, type: "digest" }, ...prev])} className="px-3 py-2 rounded-md border">Send digest</button>
            </div> */}
          </div>
        </aside>
      </div>

      {/* Suggestion detail modal */}
      <Modal
        open={suggestionModal.open}
        onClose={() => setSuggestionModal({ open: false, suggestion: null })}
        title={suggestionModal.suggestion ? suggestionModal.suggestion.title : "Suggestion"}
        darkMode={darkMode}
        footer={suggestionModal.suggestion ? (
          <>
            <button onClick={() => { saveSuggestionAsNotif(suggestionModal.suggestion.id); setSuggestionModal({ open: false, suggestion: null }); }} className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}>Save</button>
            <button onClick={() => acceptSuggestionAsMeeting(suggestionModal.suggestion.id)} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">Accept (Schedule)</button>
            <button onClick={() => dismissSuggestion(suggestionModal.suggestion.id)} className="px-3 py-2 rounded-md border text-red-500">Dismiss</button>
          </>
        ) : null}
      >
        {suggestionModal.suggestion && (
          <div className="space-y-4">
            <div className={`${subtleText} text-sm`}>Source: {suggestionModal.suggestion.source} · {new Date(suggestionModal.suggestion.createdAt).toLocaleDateString()}</div>

            <div>
              <h4 className="font-semibold">Executive summary</h4>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-sm mt-1 whitespace-normal break-words`}>{suggestionModal.suggestion.summary}</p>
            </div>

            <div>
              <h4 className="font-semibold">Predictions</h4>
              <ul className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm list-disc pl-5 mt-2`}>
                <li><strong>Short-term:</strong> {suggestionModal.suggestion.predictions.short}</li>
                <li><strong>Mid-term:</strong> {suggestionModal.suggestion.predictions.mid}</li>
                <li><strong>Long-term:</strong> {suggestionModal.suggestion.predictions.long}</li>
              </ul>
            </div>

            {suggestionModal.suggestion.evidence && (
              <div>
                <h4 className="font-semibold">Evidence</h4>
                <ul className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm list-disc pl-5 mt-2`}>
                  {suggestionModal.suggestion.evidence.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {suggestionModal.suggestion.comparables && (
              <div>
                <h4 className="font-semibold">Real-world comparable</h4>
                {suggestionModal.suggestion.comparables.map((c, i) => (
                  <div key={i} className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mt-2`}>
                    <strong>{c.name}</strong>: {c.story}
                  </div>
                ))}
              </div>
            )}

            {suggestionModal.suggestion.recommendedMeeting && (
              <div>
                <h4 className="font-semibold">Recommended meeting</h4>
                <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mt-2`}>
                  <div className="font-medium">{suggestionModal.suggestion.recommendedMeeting.title} <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">{suggestionModal.suggestion.recommendedMeeting.urgency}</span></div>
                  <div className="text-xs mt-1">Attendees: {suggestionModal.suggestion.recommendedMeeting.attendees.join(", ")}</div>
                  <div className="text-xs mt-1">Duration: {suggestionModal.suggestion.recommendedMeeting.proposedDurationMin} min</div>

                  <div className="mt-2">
                    <div className="font-medium">Agenda</div>
                    <ol className="list-decimal pl-5 text-sm text-gray-400">
                      {suggestionModal.suggestion.recommendedMeeting.agenda.map((a, i) => <li key={i}>{a}</li>)}
                    </ol>
                  </div>

                  <div className="mt-2">
                    <div className="font-medium">Talking points</div>
                    <ul className="list-disc pl-5 text-sm text-gray-400 mt-1">
                      {suggestionModal.suggestion.recommendedMeeting.talkingPoints.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Notification modal */}
      <Modal
        open={notifModal.open}
        onClose={() => setNotifModal({ open: false, notif: null })}
        title={notifModal.notif ? notifModal.notif.title : "Notification"}
        darkMode={darkMode}
        footer={notifModal.notif ? (
          <>
            {notifModal.notif.suggestionId && <button onClick={() => { const s = suggestions.find(x => x.id === notifModal.notif.suggestionId); if (s) { setNotifModal({ open: false, notif: null }); setTimeout(() => openSuggestionDetail(s), 200); } }} className="px-3 py-2 rounded-md border">Open Suggestion</button>}
            <button onClick={() => { setNotifications(prev => prev.filter(n => n.id !== notifModal.notif.id)); setNotifModal({ open: false, notif: null }); }} className="px-3 py-2 rounded-md border text-red-500">Dismiss</button>
          </>
        ) : null}
      >
        {notifModal.notif && (
          <div className={`${subtleText} space-y-3 text-sm`}>
            <div>{notifModal.notif.body}</div>
            <div className="text-xs text-gray-500">Type: {notifModal.notif.type} · {prettyDate(notifModal.notif.ts)}</div>
            {notifModal.notif.suggestionId && (
              <div className="mt-2">
                <div className="font-medium">Related suggestion</div>
                <div className={`${subtleText} text-xs mt-1`}>{(suggestions.find(s => s.id === notifModal.notif.suggestionId) || {}).title || "—"}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create reminder modal */}
      <Modal
        open={showNewReminder}
        title={scheduleFromSuggestion ? "Schedule meeting (from suggestion)" : "Create reminder / schedule meeting"}
        onClose={() => { setShowNewReminder(false); setScheduleFromSuggestion(null); setNewReminderTitle(""); }}
        darkMode={darkMode}
        footer={
          <>
            <button onClick={() => { setShowNewReminder(false); setScheduleFromSuggestion(null); }} className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}>Cancel</button>
            <button onClick={() => handleCreateFromModal()} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">Create</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Title</label>
            <input value={newReminderTitle} onChange={(e) => setNewReminderTitle(e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-700"}`} placeholder="E.g. Leadership offsite planning" />
          </div>

          <div>
            <label className="text-xs text-gray-400">When</label>
            <input value={newReminderWhen} onChange={(e) => setNewReminderWhen(e.target.value)} type="datetime-local" className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-700"}`} />
          </div>

          {scheduleFromSuggestion && (
            <div className={`${subtleText} text-sm`}>
              Scheduling from suggestion: <span className="font-medium">{(suggestions.find(s => s.id === scheduleFromSuggestion) || {}).title}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
