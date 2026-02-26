"use client";
import React, { useEffect, useState, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo3D from "../../assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaChartPie } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { IntelligenceProvider } from "../../contexts/IntelligenceContext";
import WelcomeCongrats from "../../components/WelcomeCongrats";
import { CANONICAL_SYSTEMS, normalizeSystemKey } from "./constants/systems";

/* localStorage key used by Reports component */
const STORAGE_NOTIFS = "conseqx_reports_notifications_v1";

// Route → page header mapping
const PAGE_META = {
  dashboard:        { title: "Strategic Ultra View",  sub: "Organizational health intelligence at a glance" },
  data:             { title: "Data Management",           sub: "Upload datasets or enable real-time sync to feed the ConseQ-X Six Systems analysis" },
  chat:             { title: "X Ultra Chat",                   sub: "Conversational intelligence powered by your organizational data" },
  assessments:      { title: "Assessments",               sub: "Evaluate and score each of the Six Systems" },
  reports:          { title: "Reports",                   sub: "Generate and review organizational health reports" },
  team:             { title: "Team Management",           sub: "Manage users, roles, and permissions" },
  billing:          { title: "Billing & Subscription",    sub: "Manage your plan and payment details" },
  revenue:          { title: "Organizational Metrics",   sub: "Track financial & operational KPIs aligned to the TORIL framework" },
  "org-health":     { title: "Organizational Health",     sub: "Holistic view of your organization's wellbeing" },
  "partner-dashboard":          { title: "Partner Dashboard",   sub: "C-Suite partner analytics and insights" },
  "partner-dashboard/overview":  { title: "Partner Overview",    sub: "High-level partner performance summary" },
  "partner-dashboard/deep-dive": { title: "Deep Dive Analysis",  sub: "Granular system-by-system analysis" },
  "partner-dashboard/forecast":  { title: "Partner Forecast",    sub: "Predictive analytics for partner performance" },
  "partner-dashboard/recommendations": { title: "Recommendations", sub: "X Ultra improvement suggestions" },
  "partner-dashboard/benchmarking":    { title: "Benchmarking & Trends",     sub: "Compare performance against industry standards" },
};

function getPageMeta(pathname) {
  // strip /ceo/ prefix and trailing slash
  const seg = pathname.replace(/^\/ceo\/?/, "").replace(/\/$/, "") || "dashboard";
  return PAGE_META[seg] || null;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value || []));
    // notify other listeners
    try {
      window.dispatchEvent(new CustomEvent("conseqx:notifications:updated", { detail: { key } }));
    } catch {}
  } catch {}
}

export default function ConseqXCEODashboardShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [navScrolled, setNavScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);


  // sidebar UI
  const [partnerDashboardOpen, setPartnerDashboardOpen] = useState(false);

  // Dynamic sidebar data (replaces old mock constants)
  const [systemScores, setSystemScores] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // notifications state
  const [notifications, setNotifications] = useState(() => readJSON(STORAGE_NOTIFS, []) || []);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const bellRef = useRef(null);

  // compute unread count
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  // live unread notifications for Reports (read from localStorage)
  const [reportsUnread, setReportsUnread] = useState(() => {
    const notifs = readJSON(STORAGE_NOTIFS, []);
    return (notifs || []).filter((n) => !n.read).length;
  });

  const unreadRef = useRef(reportsUnread);
  useEffect(() => {
    unreadRef.current = reportsUnread;
  }, [reportsUnread]);

  useEffect(() => {
    const justLoggedIn = Boolean(location?.state?.justLoggedIn);
    const showFlag = typeof window !== "undefined" && localStorage.getItem("show_congrats_next") === "true";

    if (justLoggedIn || showFlag) {
      setShowCongrats(true);
      try { localStorage.removeItem("show_congrats_next"); } catch (e) {}
      if (location && location.state && Object.keys(location.state).length > 0) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname, location?.state]);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [mobileMenuOpen]);

  // close mobile drawer on Escape key for accessibility
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
      if (e.key === "Escape" && notifOpen) setNotifOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen, notifOpen]);

  // auto-open partner dashboard group when on partner-dashboard routes
  useEffect(() => {
    if (location?.pathname?.startsWith?.("/ceo/partner-dashboard")) setPartnerDashboardOpen(true);
  }, [location?.pathname]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("darkMode", next ? "true" : "false");
  };

  /* ── Dynamic sidebar data (Systems Snapshot + Latest Activity) ── */
  useEffect(() => {
    const orgId = auth?.org?.id || "anon";

    function loadSystemScores() {
      try {
        // Read assessment results
        const assessRaw = localStorage.getItem("conseqx_assessments_v1");
        const assessAll = assessRaw ? JSON.parse(assessRaw) : {};
        const assessments = assessAll[orgId] || [];

        // Read org-health results
        const healthRaw = localStorage.getItem("conseqx_org_health_v1");
        const healthAll = healthRaw ? JSON.parse(healthRaw) : {};
        const healthResults = healthAll[orgId] || [];

        const scores = CANONICAL_SYSTEMS.map((sys) => {
          const nk = sys.key;
          // Latest assessment for this system
          const matchAssess = assessments.find((a) => normalizeSystemKey(a.systemId || a.system || "") === nk);
          // Latest org-health for this system
          const matchHealth = healthResults.find((h) => normalizeSystemKey(h.systemId || "") === nk);
          const score = matchAssess?.score ?? matchHealth?.score ?? null;
          return { id: sys.key, title: sys.title, icon: sys.icon, scorePct: typeof score === "number" ? Math.round(score) : null };
        });
        setSystemScores(scores);
      } catch {
        setSystemScores(CANONICAL_SYSTEMS.map((sys) => ({ id: sys.key, title: sys.title, icon: sys.icon, scorePct: null })));
      }
    }

    function loadRecentActivity() {
      try {
        const items = [];
        // Assessment completions
        const aRaw = localStorage.getItem("conseqx_assessments_v1");
        const aAll = aRaw ? JSON.parse(aRaw) : {};
        (aAll[orgId] || []).slice(0, 5).forEach((a) => {
          items.push({ id: `a-${a.id}`, title: a.title || a.systemId || "Assessment", time: a.timestamp || 0, type: "assessment" });
        });
        // Org metric entries
        const fRaw = localStorage.getItem("conseqx_fin_metrics_v1");
        const fData = fRaw ? JSON.parse(fRaw) : [];
        (Array.isArray(fData) ? fData : []).slice(0, 3).forEach((r) => {
          items.push({ id: `m-${r.id}`, title: r.label || "Metric entry", time: r.ts || r.timestamp || 0, type: "metric" });
        });
        // Report notifications
        const nRaw = localStorage.getItem(STORAGE_NOTIFS);
        const nData = nRaw ? JSON.parse(nRaw) : [];
        (Array.isArray(nData) ? nData : []).slice(0, 3).forEach((n) => {
          items.push({ id: `r-${n.id}`, title: n.title || n.message || "Report", time: n.timestamp || 0, type: "report" });
        });

        items.sort((a, b) => (b.time || 0) - (a.time || 0));
        setRecentActivity(items.slice(0, 4));
      } catch {
        setRecentActivity([]);
      }
    }

    loadSystemScores();
    loadRecentActivity();

    function onSidebarDataUpdate() { loadSystemScores(); loadRecentActivity(); }

    window.addEventListener("storage", onSidebarDataUpdate);
    window.addEventListener("conseqx:assessments:updated", onSidebarDataUpdate);
    window.addEventListener("conseqx:orghealth:completed", onSidebarDataUpdate);
    window.addEventListener("conseqx:notifications:updated", onSidebarDataUpdate);
    const sidebarPoll = setInterval(onSidebarDataUpdate, 3000);

    return () => {
      window.removeEventListener("storage", onSidebarDataUpdate);
      window.removeEventListener("conseqx:assessments:updated", onSidebarDataUpdate);
      window.removeEventListener("conseqx:orghealth:completed", onSidebarDataUpdate);
      window.removeEventListener("conseqx:notifications:updated", onSidebarDataUpdate);
      clearInterval(sidebarPoll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.org?.id]);

  /* Keep reports unread in sync:
     - listen to storage events (other tabs)
     - poll localStorage every 1.5s (keeps in-component writes in sync)
  */
  useEffect(() => {
    function refreshCountFromStorage() {
      try {
        const notifs = readJSON(STORAGE_NOTIFS, []);
        const unread = (notifs || []).filter((n) => !n.read).length;
        if (unreadRef.current !== unread) setReportsUnread(unread);
      } catch (e) {
        // ignore
      }
    }

    function onStorage(e) {
      if (e.key === STORAGE_NOTIFS || e.key === null) refreshCountFromStorage();
    }
    window.addEventListener("storage", onStorage);

    // Listen for in-app notification events so the dashboard updates immediately
    function onNotifUpdate(e) {
      try {
        refreshCountFromStorage();
      } catch {}
    }
    window.addEventListener("conseqx:notifications:updated", onNotifUpdate);

    const poll = setInterval(refreshCountFromStorage, 1500);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("conseqx:notifications:updated", onNotifUpdate);
      clearInterval(poll);
    };
  }, []);

  // Keep notifications list live (subscribe to storage & custom events)
  useEffect(() => {
    function refreshList() {
      const list = readJSON(STORAGE_NOTIFS, []) || [];
      // sort: unread first (newest → older), then read (newest → older)
      const unread = list.filter((n) => !n.read).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const read = list.filter((n) => n.read).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setNotifications([...unread, ...read]);
      setReportsUnread(unread.length);
    }

    refreshList();

    function onStorage(e) {
      if (e.key === STORAGE_NOTIFS || e.key === null) refreshList();
    }
    window.addEventListener("storage", onStorage);

    function onCustom(e) {
      refreshList();
    }
    window.addEventListener("conseqx:notifications:updated", onCustom);

    const poll = setInterval(refreshList, 2000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("conseqx:notifications:updated", onCustom);
      clearInterval(poll);
    };
  }, []);

  // Close notif dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!notifOpen) return;
      if (notifRef.current && !notifRef.current.contains(e.target) && bellRef.current && !bellRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    window.addEventListener("mousedown", onDocClick);
    return () => window.removeEventListener("mousedown", onDocClick);
  }, [notifOpen]);

  // utility for NavLink classes (beautiful active state)
  const navItemClass = (isActive) =>
    `flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${
      isActive ? (darkMode ? "bg-blue-900/30 text-gray-100" : "bg-blue-50 text-gray-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-100" : "hover:bg-gray-50 text-gray-800")
    }`;

  /* small helper to close mobile drawer after navigation */
  function handleMobileNavClick() {
    setMobileMenuOpen(false);
    // navigation happens through NavLink; don't call navigate manually here
  }

  /* ---------- NOTIFICATIONS HELPERS ---------- */

  function markNotificationRead(id) {
    try {
      const all = readJSON(STORAGE_NOTIFS, []) || [];
      const changed = all.map((n) => (n.id === id ? { ...n, read: true } : n));
      writeJSON(STORAGE_NOTIFS, changed);
      // update local immediately
      const newList = changed.sort((a, b) => ((a.read === b.read) ? (b.timestamp || 0) - (a.timestamp || 0) : (a.read ? 1 : -1)));
      setNotifications(newList);
      setReportsUnread(newList.filter((n) => !n.read).length);
    } catch {}
  }

  function markAllRead() {
    try {
      const all = readJSON(STORAGE_NOTIFS, []) || [];
      const changed = all.map((n) => ({ ...n, read: true }));
      writeJSON(STORAGE_NOTIFS, changed);
      setNotifications(changed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      setReportsUnread(0);
    } catch {}
  }

  function addMockNotification() {
    // for debugging/demo: add a new unread notification
    try {
      const all = readJSON(STORAGE_NOTIFS, []) || [];
      const id = `n_${Date.now()}`;
      const item = {
        id,
        title: "New report ready",
        message: "Q3 Operations Review is available in Reports.",
        read: false,
        timestamp: Date.now(),
      };
      const next = [item, ...all];
      writeJSON(STORAGE_NOTIFS, next);
    } catch {}
  }

  const signedInText = auth?.user ? `Signed in as ${auth.user.name || auth.user.email}` : "Not signed in";
  const drawerBg = darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900";
  const drawerBorder = darkMode ? "border-gray-700" : "border-gray-100";

  return (
    <IntelligenceProvider>
      <div className={`${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100" : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900"} min-h-screen transition-colors duration-300`}>
        <WelcomeCongrats open={showCongrats} onDone={() => setShowCongrats(false)} name={auth?.user?.name?.split?.(" ")?.[0] || ""} durationMs={1500} />

      {/* hide scrollbar helpers */}
      <style>{`
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${navScrolled ? (darkMode ? "bg-gray-900/90 backdrop-blur-sm py-2 shadow-sm" : "bg-white/90 backdrop-blur-sm py-2 shadow-sm") : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              className={`lg:hidden p-2 rounded-md focus:ring-2 focus:ring-indigo-300 ${darkMode ? "text-gray-100" : "text-gray-800"}`}
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FaBars />
            </button>

            <img src={Logo3D} alt="ConseQ-X Logo" className="h-10 w-auto sm:h-12" />
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:block text-sm text-right">
              <div className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}>{signedInText}</div>
            </div>

            <button onClick={toggleDarkMode} aria-label="Toggle theme" className={`p-2 rounded-full ${darkMode ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-400"}`}>
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!mobileMenuOpen}>
        {/* overlay */}
        <div
          className={`fixed inset-0 z-40 transition-opacity ${mobileMenuOpen ? "opacity-70" : "opacity-0"}`}
          style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)" }}
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside
          className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[92%] transform transition-transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} p-4 ${drawerBg} border-r ${drawerBorder} shadow-xl flex flex-col`}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={Logo3D} alt="logo" className="h-8" />
              <div className="font-semibold">ConseQ-X</div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className={`p-2 rounded-md focus:ring-2 focus:ring-indigo-300 ${darkMode ? "text-gray-200" : "text-gray-600"}`}
            >
              <FaTimes />
            </button>
          </div>

          {/* scrollable nav area */}
          <nav className="flex-1 overflow-y-auto hide-scrollbar pr-1">
            <div className="flex flex-col gap-2">
              <NavLink onClick={handleMobileNavClick} to="/ceo/dashboard" className={({isActive}) => navItemClass(isActive)}>Ultra View</NavLink>
              <NavLink onClick={handleMobileNavClick} to="/ceo/data" className={({isActive}) => navItemClass(isActive)}>Data Management</NavLink>
              <NavLink onClick={handleMobileNavClick} to="/ceo/chat" className={({isActive}) => navItemClass(isActive)}>Chat</NavLink>
              
              {/* Partner Dashboard (mobile: expand) */}
              <div className="mt-2">
                <button
                  onClick={() => setPartnerDashboardOpen((s) => !s)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${darkMode ? "hover:bg-blue-900/20 text-gray-100" : "hover:bg-gray-50 text-gray-800"}`}
                  aria-expanded={partnerDashboardOpen}
                >
                  <div className="flex items-center gap-2">
                    <FaChartPie />
                    <span>Partner Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">5 sections</span>
                    {partnerDashboardOpen ? <FaChevronUp/> : <FaChevronDown/>}
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-200 ${partnerDashboardOpen ? "max-h-60" : "max-h-0"}`}>
                  <div className="mt-1 ml-3 flex flex-col gap-1">
                    <NavLink onClick={handleMobileNavClick} to="/ceo/partner-dashboard/overview" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                      System Overview
                    </NavLink>
                    <NavLink onClick={handleMobileNavClick} to="/ceo/partner-dashboard/deep-dive" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                      Deep Dive Analysis
                    </NavLink>
                    <NavLink onClick={handleMobileNavClick} to="/ceo/partner-dashboard/forecast" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                      Forecast & Scenarios
                    </NavLink>
                    <NavLink onClick={handleMobileNavClick} to="/ceo/partner-dashboard/recommendations" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                      Action Items
                    </NavLink>
                    <NavLink onClick={handleMobileNavClick} to="/ceo/partner-dashboard/benchmarking" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                      Industry Benchmarks
                    </NavLink>
                  </div>
                </div>
              </div>

              <NavLink onClick={handleMobileNavClick} to="/ceo/revenue" className={({isActive}) => navItemClass(isActive)}>Org Metrics</NavLink>

              <NavLink onClick={handleMobileNavClick} to="/ceo/assessments" className={({isActive}) => navItemClass(isActive)}>Assessments</NavLink>

              {/* REPORT */}
              <NavLink
                onClick={handleMobileNavClick}
                to="/ceo/reports"
                className={({isActive}) => `flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-gray-100" : "bg-blue-50 text-gray-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-100" : "hover:bg-gray-50 text-gray-800")}`}
              >
                <span>Reports</span>
                <span className="flex items-center gap-2">
                  {reportsUnread > 0 && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 text-white">{reportsUnread}</span>}
                </span>
              </NavLink>

              <NavLink onClick={handleMobileNavClick} to="/ceo/team" className={({isActive}) => navItemClass(isActive)}>Team</NavLink>
              <NavLink onClick={handleMobileNavClick} to="/ceo/billing" className={({isActive}) => navItemClass(isActive)}>Billing</NavLink>

              
            </div>
          </nav>

          {/* bottom pinned */}
          <div className="flex-shrink-0 mt-auto pt-3" style={{ borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-xs text-gray-400 font-medium">Latest Activity</div>
            <div className="mt-2 space-y-2">
              {recentActivity.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No activity yet — complete an assessment to get started.</div>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
                      item.type === "assessment" ? (darkMode ? "bg-indigo-500" : "bg-indigo-400") :
                      item.type === "metric" ? (darkMode ? "bg-emerald-500" : "bg-emerald-400") :
                      (darkMode ? "bg-yellow-500" : "bg-yellow-400")
                    }`} />
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{item.title}</div>
                      <div className="text-xs text-gray-400">{item.time ? new Date(item.time).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3">
              <div className="text-xs text-gray-400 font-medium">Systems Snapshot</div>
              <div className="mt-2 space-y-1.5">
                {systemScores.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-1 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      <span className="text-xs">{s.icon}</span> {s.title}
                    </span>
                    {s.scorePct !== null ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.scorePct > 70 ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700") : s.scorePct > 45 ? (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700") : (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700")}`}>{s.scorePct}%</span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Page content */}
      <div className="container mx-auto px-4 pt-28 pb-28">
        <div className="max-w-[1400px] mx-auto p-4 grid grid-cols-12 gap-6">
          {/* Sidebar (desktop) */}
          <aside
            className={`hidden lg:flex flex-col col-span-3 rounded-2xl p-4 h-[calc(100vh-8rem)] sticky top-24 transition-colors ${darkMode ? "bg-gray-800 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} shadow-sm`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={Logo3D} alt="ConseQ-X" className="w-10 h-10 rounded-md object-contain" />
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Conse<span className="text-yellow-500">Q</span>-X-Ultra</div>
                <div className={`text-xs truncate ${darkMode ? "text-gray-300" : "text-gray-500"}`}><span className="text-yellow-500">{auth?.org?.name}</span></div>
              </div>
            </div>

            {/* nav area scrolls independently */}
            <nav className="flex-1 overflow-y-auto hide-scrollbar pr-1 mb-4">
              <div className="flex flex-col gap-1">
                <NavLink to="/ceo/dashboard" className={({isActive}) => navItemClass(isActive)}>Ultra View</NavLink>
                <NavLink to="/ceo/data" className={({isActive}) => navItemClass(isActive)}>Data Management</NavLink>
                <NavLink to="/ceo/chat" className={({isActive}) => navItemClass(isActive)}>Chat</NavLink>

                {/* Partner Dashboard collapsible */}
                <div>
                  <button
                    onClick={() => setPartnerDashboardOpen((s) => !s)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${darkMode ? "hover:bg-blue-900/20 text-gray-100" : "hover:bg-gray-50 text-gray-800"}`}
                    aria-expanded={partnerDashboardOpen}
                  >
                    <div className="flex items-center gap-2">
                      <FaChartPie className="text-sm" />
                      <span>Partner Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">5</span>
                      {partnerDashboardOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-200 ${partnerDashboardOpen ? "max-h-60" : "max-h-0"}`}>
                    <div className="mt-1 ml-3 flex flex-col gap-1">
                      <NavLink to="/ceo/partner-dashboard/overview" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                        System Overview
                      </NavLink>
                      <NavLink to="/ceo/partner-dashboard/deep-dive" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                        Deep Dive Analysis
                      </NavLink>
                      <NavLink to="/ceo/partner-dashboard/forecast" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                        Forecast & Scenarios
                      </NavLink>
                      <NavLink to="/ceo/partner-dashboard/recommendations" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                        Action Items
                      </NavLink>
                      <NavLink to="/ceo/partner-dashboard/benchmarking" className={({isActive}) => `px-2 py-1.5 rounded text-sm transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-300" : "hover:bg-gray-100 text-gray-700")}`}>
                        Industry Benchmarks
                      </NavLink>
                    </div>
                  </div>
                </div>

                <NavLink to="/ceo/revenue" className={({isActive}) => navItemClass(isActive)}>Org Metrics</NavLink>

                <NavLink to="/ceo/assessments" className={({isActive}) => navItemClass(isActive)}>Assessments</NavLink>

                <NavLink to="/ceo/reports" className={({isActive}) => `flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${isActive ? (darkMode ? "bg-blue-900/30 text-gray-100" : "bg-blue-50 text-gray-900") : (darkMode ? "hover:bg-blue-900/20 text-gray-100" : "hover:bg-gray-50 text-gray-800")}`}>
                  <span>Reports</span>
                  {reportsUnread > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 text-white">{reportsUnread}</span>
                  )}
                </NavLink>

                <NavLink to="/ceo/team" className={({isActive}) => navItemClass(isActive)}>Team</NavLink>
                <NavLink to="/ceo/billing" className={({isActive}) => navItemClass(isActive)}>Billing</NavLink>
              </div>
            </nav>

            {/* Bottom pinned section */}
            <div className="mt-auto flex-shrink-0 pt-3" style={{ borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
              <div className="text-xs text-gray-400 font-medium">Latest Activity</div>
              <div className="mt-2 space-y-2">
                {recentActivity.length === 0 ? (
                  <div className="text-xs text-gray-500 italic">No activity yet — complete an assessment to get started.</div>
                ) : (
                  recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
                        item.type === "assessment" ? (darkMode ? "bg-indigo-500" : "bg-indigo-400") :
                        item.type === "metric" ? (darkMode ? "bg-emerald-500" : "bg-emerald-400") :
                        (darkMode ? "bg-yellow-500" : "bg-yellow-400")
                      }`} />
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{item.title}</div>
                        <div className="text-xs text-gray-400">{item.time ? new Date(item.time).toLocaleDateString() : "—"}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3">
                <div className="text-xs text-gray-400 font-medium">Systems Snapshot</div>
                <div className="mt-2 space-y-1.5">
                  {systemScores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className={`flex items-center gap-1 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                        <span className="text-xs">{s.icon}</span> {s.title}
                      </span>
                      {s.scorePct !== null ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.scorePct > 70 ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700") : s.scorePct > 45 ? (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700") : (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700")}`}>{s.scorePct}%</span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 lg:col-span-9">
            <div className={`rounded-2xl p-4 md:p-6 transition-colors ${darkMode ? "bg-gray-800 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-xl md:text-2xl font-bold`}>
                    {getPageMeta(location.pathname)?.title || (<>Welcome back, <span className="text-yellow-500">{auth.user.name || auth.user.email}</span></>)}
                  </h1>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-xs md:text-sm mt-1`}>
                    {getPageMeta(location.pathname)?.sub || "Executive tools & insights for your organization"}
                  </p>
                </div>

                {/* NOTIFICATION BELL */}
                <div className="relative flex items-center gap-3">
                  <button
                    ref={bellRef}
                    onClick={() => setNotifOpen((s) => !s)}
                    aria-haspopup="true"
                    aria-expanded={notifOpen}
                    aria-label="Notifications"
                    className={`relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      darkMode
                        ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                        : "bg-white text-gray-900 hover:bg-gray-50"
                    } shadow-sm`}
                    title={unreadCount ? `${unreadCount} unread notifications` : "No unread notifications"}
                  >
                    <FaBell />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {notifOpen && (
                    <div
                      ref={notifRef}
                      className={`absolute right-0 top-full mt-2 w-96 max-w-screen-sm z-50 rounded-xl shadow-2xl ${
                        darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="p-3 border-b flex items-center justify-between">
                        <div className="font-semibold">Notifications</div>
                        <div className="flex items-center gap-2">{/* optional controls */}</div>
                      </div>

                      <div className="max-h-64 overflow-auto hide-scrollbar">
                        {/* Unread heading */}
                        {notifications.filter((n) => !n.read).length > 0 && (
                          <div className={`px-3 py-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Unread</div>
                        )}

                        {(notifications.filter((n) => !n.read)).map((n) => (
                          <div
                            key={n.id}
                            className={`px-3 py-2 border-b last:border-b-0 flex gap-3 items-start ${
                              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className={`font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{n.title}</div>
                                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"} ml-2`}>
                                  {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                                </div>
                              </div>
                              <div className={`text-sm mt-1 truncate ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{n.message || n.body || ""}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => { navigate("/ceo/reports"); setNotifOpen(false); }}
                                  className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white"
                                >
                                  Open
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Read heading */}
                        {notifications.filter((n) => n.read).length > 0 && (
                          <div className={`px-3 py-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Read</div>
                        )}

                        {(notifications.filter((n) => n.read)).map((n) => (
                          <div
                            key={n.id}
                            className={`px-3 py-2 border-b last:border-b-0 flex gap-3 items-start ${
                              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className={`text-sm truncate ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{n.title}</div>
                                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"} ml-2`}>
                                  {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                                </div>
                              </div>
                              <div className={`text-xs mt-1 truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{n.message || n.body || ""}</div>
                            </div>
                          </div>
                        ))}

                        {/* empty state */}
                        {(!notifications || notifications.length === 0) && (
                          <div className={`p-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}>No notifications</div>
                        )}
                      </div>

                      <div className="p-3 border-t text-xs flex items-center justify-between">
                        <div className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Notifications are stored locally</div>
                        <div>
                          <button onClick={() => { setNotifOpen(false); }} className={`px-2 py-1 rounded-md border ${darkMode ? "bg-transparent text-gray-100 border-gray-700" : ""}`}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              {/* end header area */}

              <div className="mt-4">
                {/* Provide darkMode, toggleDarkMode, user, and org through Outlet context so child pages can use them */}
                <Outlet context={{
                  darkMode,
                  toggleDarkMode,
                  user: auth.user,
                  org: auth.org || { id: "anon", name: "Demo Organization" }
                }} />
              </div>
            </div>
          </main>
        </div>
      </div>

      <footer className={`w-full py-6 border-t transition-colors ${darkMode ? "border-gray-700 bg-gray-900 text-gray-300" : "border-gray-200 bg-white text-gray-700"}`}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <span className="mr-4">© {new Date().getFullYear()} Conseq-X</span>
            <a href="/terms" className="underline mr-3">Terms</a>
            <a href="/privacy" className="underline">Privacy</a>
          </div>
        </div>
      </footer>
      </div>
    </IntelligenceProvider>
  );
}
