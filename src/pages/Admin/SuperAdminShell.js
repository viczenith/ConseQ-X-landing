import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo3D from "../../assets/ConseQ-X-3d.png";
import {
  FaBuilding, FaUsers, FaClipboardList, FaCloudUploadAlt,
  FaCogs, FaBell, FaSlidersH, FaTachometerAlt,
  FaBars, FaTimes, FaSun, FaMoon, FaSignOutAlt, FaChevronLeft
} from "react-icons/fa";

/* ═══════════════════════════════════════
   Constants
   ═══════════════════════════════════════ */
const ADMIN_TOKEN_KEY = "conseqx_admin_access_token_v1";
const ADMIN_REFRESH_KEY = "conseqx_admin_refresh_token_v1";
const ADMIN_API_BASE_KEY = "conseqx_admin_api_base_v1";

export const CANONICAL_SYSTEMS = [
  { key: "interdependency", title: "Interdependency" },
  { key: "orchestration", title: "Orchestration" },
  { key: "investigation", title: "Investigation" },
  { key: "interpretation", title: "Interpretation" },
  { key: "illustration", title: "Illustration" },
  { key: "inlignment", title: "Inlignment" },
];

/* ═══════════════════════════════════════
   Admin Context (shared state for all
   SuperAdmin sub-pages)
   ═══════════════════════════════════════ */
const AdminCtx = createContext(null);
export function useAdmin() { return useContext(AdminCtx); }

/* ═══════════════════════════════════════
   Shared micro-components
   ═══════════════════════════════════════ */
export function Pill({ children, tone = "neutral", className = "" }) {
  const cls =
    tone === "good"  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    : tone === "warn"  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    : tone === "bad"   ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    : tone === "info"  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls} ${className}`}>{children}</span>;
}

export function SectionCard({ title, actions, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-900 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Btn({ children, onClick, variant = "secondary", disabled = false, className = "", size = "md" }) {
  const base = `inline-flex items-center justify-center font-semibold rounded-lg transition-all ${size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"}`;
  const v =
    variant === "primary"  ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-sm"
    : variant === "danger" ? "bg-red-600 text-white hover:bg-red-500 shadow-sm"
    : variant === "success" ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800";
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${v} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 ${className}`}
    />
  );
}

export function Select({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 ${className}`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function StatCard({ label, value, tone, icon: Icon }) {
  const border = tone === "good" ? "border-emerald-300 dark:border-emerald-700" : tone === "warn" ? "border-amber-300 dark:border-amber-700" : tone === "bad" ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700";
  return (
    <div className={`rounded-xl border ${border} bg-white p-4 dark:bg-gray-900`}>
      <div className="flex items-center gap-3">
        {Icon && <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"><Icon size={16} /></div>}
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">{message}</div>;
}

/* helpers */
export function formatDate(value) {
  if (!value) return "—";
  try { const d = new Date(value); if (isNaN(d.getTime())) return "—"; return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }); } catch { return "—"; }
}
export function formatDateTime(value) {
  if (!value) return "—";
  try { const d = new Date(value); if (isNaN(d.getTime())) return "—"; return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch { return "—"; }
}
export function formatIsoDatetimeLocal(value) {
  if (!value) return "";
  try { const d = new Date(value); if (isNaN(d.getTime())) return ""; const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; } catch { return ""; }
}
export function parseDatetimeLocalToIso(value) {
  if (!value) return null;
  try { const d = new Date(value); if (isNaN(d.getTime())) return null; return d.toISOString(); } catch { return null; }
}

/* ═══════════════════════════════════════
   NAV ITEMS
   ═══════════════════════════════════════ */
const NAV_ITEMS = [
  { to: "/admin/overview",        icon: FaTachometerAlt, label: "Overview" },
  { to: "/admin/companies",       icon: FaBuilding,      label: "Companies" },
  { to: "/admin/users",           icon: FaUsers,         label: "Users" },
  { to: "/admin/assessments",     icon: FaClipboardList, label: "Assessments" },
  { to: "/admin/uploads",         icon: FaCloudUploadAlt,label: "Uploads" },
  { to: "/admin/jobs",            icon: FaCogs,          label: "Jobs" },
  { to: "/admin/notifications",   icon: FaBell,          label: "Notifications" },
  { to: "/admin/settings",        icon: FaSlidersH,      label: "Settings" },
];

/* ═══════════════════════════════════════
   SHELL COMPONENT
   ═══════════════════════════════════════ */
export default function SuperAdminShell() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ─── dark mode ─── */
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("darkMode") === "true"; } catch { return false; }
  });
  useEffect(() => { document.documentElement.classList.toggle("dark", darkMode); }, [darkMode]);
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem("darkMode", next ? "true" : "false"); } catch {}
  };

  /* ─── mobile sidebar ─── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => { if (sidebarOpen) document.body.style.overflow = "hidden"; else document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [sidebarOpen]);

  /* ─── admin session ─── */
  const [apiBase, setApiBase] = useState(() => {
    try { return localStorage.getItem(ADMIN_API_BASE_KEY) || String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"); } catch { return "http://127.0.0.1:8000"; }
  });
  useEffect(() => { try { localStorage.setItem(ADMIN_API_BASE_KEY, apiBase); } catch {} }, [apiBase]);

  const [adminToken, setAdminToken] = useState(() => {
    try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
  });
  const [adminMe, setAdminMe] = useState(null);
  const [ui, setUi] = useState({ loading: false, error: "", ok: "" });

  /* ─── shared data caches ─── */
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [orgStats, setOrgStats] = useState(null);
  const [orgUploads, setOrgUploads] = useState([]);
  const [orgAssessments, setOrgAssessments] = useState([]);
  const [orgJobs, setOrgJobs] = useState([]);
  const [orgNotifications, setOrgNotifications] = useState([]);
  const [tenantSummary, setTenantSummary] = useState(null);

  /* ─── API helpers ─── */
  const normBase = (base) => String(base || "").replace(/\/$/, "");
  const apiUrl = useCallback((path) => `${normBase(apiBase)}/api${String(path || "").startsWith("/") ? "" : "/"}${path}`, [apiBase]);

  /* Try to refresh the access token using the stored refresh token */
  const tryRefreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(ADMIN_REFRESH_KEY);
      if (!refreshToken) return null;
      const url = `${normBase(apiBase)}/api/auth/token/refresh/`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newAccess = data?.access;
      const newRefresh = data?.refresh;
      if (!newAccess) return null;
      localStorage.setItem(ADMIN_TOKEN_KEY, newAccess);
      if (newRefresh) localStorage.setItem(ADMIN_REFRESH_KEY, newRefresh);
      setAdminToken(newAccess);
      return newAccess;
    } catch { return null; }
  }, [apiBase]);

  const apiFetch = useCallback(async (path, { method = "GET", headers = {}, body = null, tokenOverride = null, _retried = false } = {}) => {
    const h = { Accept: "application/json", ...headers };
    const tok = tokenOverride !== null ? tokenOverride : adminToken;
    if (tok) h.Authorization = `Bearer ${tok}`;
    const opts = { method, headers: h };
    if (body !== null) {
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        opts.body = body;
      } else {
        opts.body = typeof body === "string" ? body : JSON.stringify(body);
        if (!h["Content-Type"]) opts.headers["Content-Type"] = "application/json";
      }
    }
    const url = `${normBase(apiBase)}/api${String(path || "").startsWith("/") ? "" : "/"}${path}`;
    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    /* Auto-refresh on 401 (expired access token) */
    if (res.status === 401 && !_retried && tokenOverride === null) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        return apiFetch(path, { method, headers, body, tokenOverride: newToken, _retried: true });
      }
    }

    if (!res.ok) {
      const msg = typeof data === "string" ? data : data?.detail || data?.error || `HTTP ${res.status}`;
      const err = new Error(msg); err.status = res.status; err.payload = data; throw err;
    }
    return data;
  }, [apiBase, adminToken, tryRefreshToken]);

  const loadOrgs = useCallback(async () => {
    const data = await apiFetch("/orgs"); const list = Array.isArray(data) ? data : []; setOrgs(list);
    if (!selectedOrgId && list.length) setSelectedOrgId(String(list[0].id));
    return list;
  }, [apiFetch, selectedOrgId]);

  const loadUsers = useCallback(async () => {
    const data = await apiFetch("/admin/users"); setUsers(Array.isArray(data) ? data : []);
  }, [apiFetch]);

  const loadOrgData = useCallback(async (orgId) => {
    if (!orgId) return;
    const stats = await apiFetch(`/admin/orgs/${orgId}/stats`);
    setOrgStats(stats);
    const [uploads, runs, jobs, nots] = await Promise.all([
      apiFetch(`/admin/orgs/${orgId}/uploads`),
      apiFetch(`/admin/orgs/${orgId}/assessments`),
      apiFetch(`/admin/orgs/${orgId}/jobs`),
      apiFetch(`/admin/orgs/${orgId}/notifications`),
    ]);
    setOrgUploads(Array.isArray(uploads) ? uploads : []);
    setOrgAssessments(Array.isArray(runs) ? runs : []);
    setOrgJobs(Array.isArray(jobs) ? jobs : []);
    setOrgNotifications(Array.isArray(nots) ? nots : []);
    try {
      const summary = await apiFetch(`/dashboard/summary?org_id=${encodeURIComponent(String(orgId))}`);
      setTenantSummary(summary);
    } catch { setTenantSummary(null); }
  }, [apiFetch]);

  /* ─── session boot ─── */
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current || !adminToken) return;
    let live = true;
    (async () => {
      try {
        setUi(s => ({ ...s, loading: true }));
        const me = await apiFetch("/auth/me");
        if (!live) return;
        if (!me?.user?.is_superuser) throw new Error("Not a Super Admin");
        setAdminMe(me);
        await loadOrgs();
        if (!live) return;
        await loadUsers();
        if (!live) return;
        /* Mark booted AFTER all async work succeeds.
           This ensures React 18+ StrictMode (which double-invokes effects
           in dev: mount → cleanup → mount) doesn't silently skip the boot:
           the first mount's async exits when live=false, leaving
           bootedRef still false so the second mount can pick it up. */
        bootedRef.current = true;
        setUi({ loading: false, error: "", ok: "Session restored" });
      } catch (e) {
        if (!live) return;
        try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
        setAdminToken("");
        setAdminMe(null);
        navigate("/admin/login", { replace: true });
      }
    })();
    return () => { live = false; };
  }, [adminToken, apiFetch, loadOrgs, loadUsers, navigate]);

  /* ─── reload org data on selection ─── */
  useEffect(() => {
    if (!adminToken || !selectedOrgId) return;
    let live = true;
    (async () => {
      try {
        await loadOrgData(selectedOrgId);
      } catch (e) {
        if (live) setUi(s => ({ ...s, error: String(e?.message || e) }));
      }
    })();
    return () => { live = false; };
  }, [selectedOrgId, adminToken, loadOrgData]);

  const logout = () => {
    try { localStorage.removeItem(ADMIN_TOKEN_KEY); localStorage.removeItem(ADMIN_REFRESH_KEY); } catch {}
    setAdminToken(""); setAdminMe(null); setOrgs([]); setUsers([]);
    navigate("/admin/login", { replace: true });
  };

  const selectedOrg = useMemo(() => orgs.find(o => String(o.id) === String(selectedOrgId)) || null, [orgs, selectedOrgId]);

  /* ─── context value ─── */
  const ctx = useMemo(() => ({
    apiBase, setApiBase, adminToken, setAdminToken, adminMe, setAdminMe,
    orgs, users, selectedOrgId, setSelectedOrgId, selectedOrg,
    orgStats, orgUploads, orgAssessments, orgJobs, orgNotifications,
    tenantSummary, setTenantSummary,
    apiFetch, loadOrgs, loadUsers, loadOrgData,
    ui, setUi, darkMode, logout,
    CANONICAL_SYSTEMS,
  }), [apiBase, adminToken, adminMe, orgs, users, selectedOrgId, selectedOrg,
       orgStats, orgUploads, orgAssessments, orgJobs, orgNotifications,
       tenantSummary, apiFetch, loadOrgs, loadUsers, loadOrgData, ui, darkMode]);

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  const currentPage = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label || "Admin";

  const sidebarContent = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`
          }
        >
          <item.icon size={15} className="flex-shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <AdminCtx.Provider value={ctx}>
      <div className={`flex h-screen overflow-hidden ${darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}>

        {/* ═══ DESKTOP SIDEBAR ═══ */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[250px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
            <img src={Logo3D} alt="ConseQ-X" className="w-8 h-8 rounded-lg object-contain" />
            <div>
              <div className="text-sm font-bold tracking-tight">ConseQ-X</div>
              <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Super Admin</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarContent}
          </div>
          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                {(adminMe?.user?.email || "A")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{adminMe?.user?.email || "Admin"}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Super Admin</div>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" title="Sign out">
                <FaSignOutAlt size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <img src={Logo3D} alt="ConseQ-X" className="w-7 h-7 rounded-lg object-contain" />
                  <span className="text-sm font-bold">Super Admin</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            </aside>
          </div>
        )}

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ─── Top Bar ─── */}
          <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FaBars size={16} />
              </button>
              <div>
                <h1 className="text-lg font-bold">{currentPage}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={adminToken ? "good" : "warn"}>{adminToken ? "authenticated" : "no session"}</Pill>
              <Pill>{process.env.NODE_ENV || "development"}</Pill>
              <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Toggle dark mode">
                {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
              </button>
            </div>
          </header>

          {/* ─── Floating alerts ─── */}
          {ui.error && (
            <div className="mx-4 lg:mx-6 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300 flex items-center justify-between">
              <span>{ui.error}</span>
              <button onClick={() => setUi(s => ({...s, error: ""}))} className="ml-2 text-xs underline">dismiss</button>
            </div>
          )}
          {ui.ok && (
            <div className="mx-4 lg:mx-6 mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300 flex items-center justify-between">
              <span>{ui.ok}</span>
              <button onClick={() => setUi(s => ({...s, ok: ""}))} className="ml-2 text-xs underline">dismiss</button>
            </div>
          )}

          {/* ─── Page Content (Outlet) ─── */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet context={{ darkMode, toggleDarkMode }} />
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}
