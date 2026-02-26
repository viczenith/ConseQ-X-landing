import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">{children}</div>
    </section>
  );
}

function Pill({ children, tone = "neutral" }) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
        : tone === "bad"
          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

function Button({ children, onClick, variant = "secondary", disabled = false }) {
  const base = "rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors";
  const cls =
    variant === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-500"
        : "border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800";
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${cls} ${disabled ? "opacity-60" : ""}`}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          : "border border-gray-200 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

function formatIsoDatetimeLocal(value) {
  if (!value) return "";
  try {
    // Accept ISO strings, return YYYY-MM-DDTHH:mm (local) for datetime-local input.
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function parseDatetimeLocalToIso(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

function formatShortDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "—";
  }
}

function RouteLink({ to, label }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{to}</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState({ state: "idle", message: "" });
  const [activeTab, setActiveTab] = useState("tenants");

  const CANONICAL_SYSTEMS = [
    { key: "interdependency", title: "Interdependency" },
    { key: "orchestration", title: "Orchestration" },
    { key: "investigation", title: "Investigation" },
    { key: "interpretation", title: "Interpretation" },
    { key: "illustration", title: "Illustration" },
    { key: "inlignment", title: "Inlignment" },
  ];

  // Backend admin (JWT) session
  const ADMIN_TOKEN_KEY = "conseqx_admin_access_token_v1";
  const [apiBase, setApiBase] = useState(() => String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"));
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
    } catch {
      return "";
    }
  });
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMe, setAdminMe] = useState(null);

  const [orgs, setOrgs] = useState([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [orgDraftById, setOrgDraftById] = useState({});
  const [newOrgName, setNewOrgName] = useState("");

  const [orgStats, setOrgStats] = useState(null);
  const [orgUploads, setOrgUploads] = useState([]);
  const [orgAssessments, setOrgAssessments] = useState([]);
  const [orgJobs, setOrgJobs] = useState([]);
  const [orgNotifications, setOrgNotifications] = useState([]);

  const [tenantDashboardSummary, setTenantDashboardSummary] = useState(null);
  const [runSystemKey, setRunSystemKey] = useState("interdependency");
  const [simulateSystemKey, setSimulateSystemKey] = useState("interdependency");
  const [simulatePct, setSimulatePct] = useState("10");
  const [simulateResult, setSimulateResult] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userAssignOrgById, setUserAssignOrgById] = useState({});
  const [userFilterOrgId, setUserFilterOrgId] = useState("");
  const [userPhoneDraftById, setUserPhoneDraftById] = useState({});
  const [userPwDraftById, setUserPwDraftById] = useState({});

  const [newUserOrgId, setNewUserOrgId] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const [apiUi, setApiUi] = useState({ loading: false, error: "", ok: "" });

  const clearAdminSession = (message = "") => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {}
    setAdminToken("");
    setAdminMe(null);
    setOrgs([]);
    setUsers([]);
    setSelectedOrgId("");
    setOrgStats(null);
    if (message) setApiUi({ loading: false, error: message, ok: "" });
  };

  const normBase = (base) => String(base || "").replace(/\/$/, "");
  const apiUrl = (path) => `${normBase(apiBase)}/api${String(path || "").startsWith("/") ? "" : "/"}${path}`;

  async function apiFetch(path, { method = "GET", headers = {}, body = null } = {}) {
    const h = {
      Accept: "application/json",
      ...headers,
    };
    if (adminToken) h.Authorization = `Bearer ${adminToken}`;
    const opts = { method, headers: h };
    if (body !== null) {
      // Support both JSON and multipart
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        opts.body = body;
        // Let the browser set multipart boundary.
      } else {
        opts.body = typeof body === "string" ? body : JSON.stringify(body);
        if (!h["Content-Type"]) opts.headers["Content-Type"] = "application/json";
      }
    }
    const res = await fetch(apiUrl(path), opts);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      const msg = typeof data === "string" ? data : data?.detail || data?.error || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  const loadAdminMe = async () => {
    const data = await apiFetch("/auth/me", { method: "GET" });
    setAdminMe(data);
    return data;
  };

  const assertSuperAdmin = (mePayload) => {
    const isSuper = Boolean(mePayload?.user?.is_superuser);
    if (!isSuper) {
      throw new Error("Access denied: Super Admin account required.");
    }
  };

  const loadOrgs = async () => {
    const data = await apiFetch("/orgs", { method: "GET" });
    const list = Array.isArray(data) ? data : [];
    setOrgs(list);
    if (!selectedOrgId && list.length) setSelectedOrgId(String(list[0].id));
    return list;
  };

  const loadUsers = async () => {
    const data = await apiFetch("/admin/users", { method: "GET" });
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadOrgData = async (orgId) => {
    if (!orgId) return;
    const stats = await apiFetch(`/admin/orgs/${orgId}/stats`, { method: "GET" });
    setOrgStats(stats);

    const [uploads, runs, jobs, nots] = await Promise.all([
      apiFetch(`/admin/orgs/${orgId}/uploads`, { method: "GET" }),
      apiFetch(`/admin/orgs/${orgId}/assessments`, { method: "GET" }),
      apiFetch(`/admin/orgs/${orgId}/jobs`, { method: "GET" }),
      apiFetch(`/admin/orgs/${orgId}/notifications`, { method: "GET" }),
    ]);
    setOrgUploads(Array.isArray(uploads) ? uploads : []);
    setOrgAssessments(Array.isArray(runs) ? runs : []);
    setOrgJobs(Array.isArray(jobs) ? jobs : []);
    setOrgNotifications(Array.isArray(nots) ? nots : []);

    // Tenant endpoints can be accessed by superusers with ?org_id=...
    try {
      const summary = await apiFetch(`/dashboard/summary?org_id=${encodeURIComponent(String(orgId))}`, { method: "GET" });
      setTenantDashboardSummary(summary);
    } catch {
      setTenantDashboardSummary(null);
    }
    setSimulateResult(null);
  };

  const adminLogin = async () => {
    setApiUi({ loading: true, error: "", ok: "" });
    try {
      const payload = await apiFetch("/auth/token/", {
        method: "POST",
        body: { username: String(adminEmail || "").trim(), password: adminPassword },
      });
      const token = payload?.access || "";
      if (!token) throw new Error("No access token returned");
      try {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      } catch {}
      setAdminToken(token);

      const me = await loadAdminMe();
      assertSuperAdmin(me);
      await loadOrgs();
      await loadUsers();
      setApiUi({ loading: false, error: "", ok: "Logged in" });
    } catch (e) {
      clearAdminSession();
      setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
    }
  };

  const adminLogout = () => {
    clearAdminSession();
    setApiUi({ loading: false, error: "", ok: "Logged out" });
  };

  const selectedOrg = useMemo(
    () => (orgs || []).find((o) => String(o.id) === String(selectedOrgId)) || null,
    [orgs, selectedOrgId]
  );

  const tenantEntry = selectedOrg?.slug ? `/partners/${selectedOrg.slug}` : "/partners/:orgSlug";

  const sections = useMemo(
    () => [
      {
        title: "Public Pages",
        links: [
          { to: "/", label: "Landing" },
          { to: "/ConseQ-X-landing", label: "Landing (Alias)" },
          { to: "/assessment", label: "Assessment" },
          { to: "/results", label: "Assessment Results" },
        ],
      },
      {
        title: "Systems Pages",
        links: [
          { to: "/interdependency", label: "Interdependency" },
          { to: "/system/inlignment", label: "System: Inlignment" },
          { to: "/system/investigation", label: "System: Investigation" },
          { to: "/system/orchestration", label: "System: Orchestration" },
          { to: "/system/illustration", label: "System: Illustration" },
          { to: "/system/interpretation", label: "System: Interpretation" },
        ],
      },
      {
        title: "CEO Workspace",
        links: [
          { to: "/ceo", label: "CEO Workspace (Redirects to Dashboard)" },
          { to: "/ceo/dashboard", label: "CEO Dashboard" },
          { to: "/ceo/partner-dashboard", label: "Partner Dashboard (Shell)" },
          { to: "/ceo/chat", label: "CEO Chat" },
          { to: "/ceo/assessments", label: "CEO Assessments" },
          { to: "/ceo/data", label: "CEO Data Management" },
          { to: "/ceo/org-health", label: "Org Health" },
          { to: "/ceo/reports", label: "Reports" },
          { to: "/ceo/team", label: "Team" },
          { to: "/ceo/billing", label: "Billing" },
          { to: "/ceo/revenue", label: "Org Metrics" },

        ],
      },
      {
        title: "Partner Intelligence Dashboard",
        links: [
          { to: tenantEntry, label: "Tenant Entry" },
          { to: "/ceo/partner-dashboard/overview", label: "Partner Overview" },

          { to: "/ceo/partner-dashboard/deep-dive", label: "Partner Deep Dive" },
          { to: "/ceo/partner-dashboard/forecast", label: "Partner Forecast Scenarios" },
          { to: "/ceo/partner-dashboard/recommendations", label: "Partner Recommendations" },
          { to: "/ceo/partner-dashboard/benchmarking", label: "Partner Benchmarking" },
        ],
      },
      {
        title: "Admin",
        links: [
          { to: "/admin/login", label: "Admin Login" },
          { to: "/admin", label: "Admin Console" },
        ],
      },
    ],
    [tenantEntry]
  );

  const checkBackendHealth = async () => {
    const base = normBase(apiBase || process.env.REACT_APP_API_BASE_URL || "http://localhost:8000");
    const url = `${base}/api/health/`;
    setBackendStatus({ state: "checking", message: `Checking ${url}...` });
    try {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      if (!res.ok) {
        setBackendStatus({ state: "bad", message: `HTTP ${res.status}: ${text.slice(0, 200)}` });
        return;
      }
      setBackendStatus({ state: "good", message: `OK: ${text.slice(0, 200)}` });
    } catch (e) {
      setBackendStatus({ state: "bad", message: `Failed: ${String(e?.message || e)}` });
    }
  };

  const filteredOrgs = useMemo(() => {
    const q = String(orgSearch || "").trim().toLowerCase();
    if (!q) return orgs;
    return (orgs || []).filter((o) => {
      const name = String(o?.name || "").toLowerCase();
      const slug = String(o?.slug || "").toLowerCase();
      return name.includes(q) || slug.includes(q) || String(o?.id || "").includes(q);
    });
  }, [orgs, orgSearch]);

  const filteredUsers = useMemo(() => {
    const q = String(userSearch || "").trim().toLowerCase();
    const base = (users || []).filter((u) => {
      if (!userFilterOrgId) return true;
      return String(u.orgId || "") === String(userFilterOrgId);
    });
    if (!q) return base;
    return base.filter((u) => {
      const email = String(u?.email || "").toLowerCase();
      const name = `${u?.first_name || ""} ${u?.last_name || ""}`.toLowerCase();
      const orgName = String(u?.orgName || "").toLowerCase();
      return email.includes(q) || name.includes(q) || orgName.includes(q);
    });
  }, [users, userSearch, userFilterOrgId]);

  useEffect(() => {
    // If we have a token, try to load admin context lazily.
    let mounted = true;
    async function boot() {
      if (!adminToken) return;
      try {
        setApiUi((s) => ({ ...s, loading: true, error: "", ok: "" }));
        const me = await loadAdminMe();
        assertSuperAdmin(me);
        const list = await loadOrgs();
        await loadUsers();
        if (mounted) {
          setApiUi({ loading: false, error: "", ok: "Admin session restored" });
          if (!selectedOrgId && list && list.length) setSelectedOrgId(String(list[0].id));
        }
      } catch (e) {
        if (!mounted) return;
        clearAdminSession(String(e?.message || e));
        navigate("/admin/login", { replace: true });
      }
    }
    boot();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  useEffect(() => {
    // Refresh selected org operational data when selection changes.
    let mounted = true;
    async function load() {
      if (!adminToken || !selectedOrgId) return;
      try {
        setApiUi((s) => ({ ...s, loading: true, error: "", ok: "" }));
        await loadOrgData(selectedOrgId);
        if (mounted) setApiUi({ loading: false, error: "", ok: "" });
      } catch (e) {
        if (mounted) setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
      }
    }
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">SaaS Owner</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">ConseQ-X Admin Console</h1>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Dedicated admin login for managing the entire platform.</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={adminToken ? "good" : "warn"}>{adminToken ? "authenticated" : "login required"}</Pill>
              <Pill>{process.env.NODE_ENV || "development"}</Pill>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <TabButton active={activeTab === "tenants"} label="Companies" onClick={() => setActiveTab("tenants")} />
            <TabButton active={activeTab === "users"} label="Users" onClick={() => setActiveTab("users")} />
            <TabButton active={activeTab === "org-data"} label="Tenant Data" onClick={() => setActiveTab("org-data")} />
            <TabButton active={activeTab === "routes"} label="All Pages" onClick={() => setActiveTab("routes")} />
          </div>
        </div>

        {apiUi.error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {apiUi.error}
          </div>
        ) : null}
        {apiUi.ok ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
            {apiUi.ok}
          </div>
        ) : null}

        {activeTab === "tenants" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Backend Admin Session">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  This connects the Admin Console to the Django backend to manage tenants, users, uploads, jobs, and notifications.
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">API Base URL</div>
                  <Input value={apiBase} onChange={setApiBase} placeholder="http://127.0.0.1:8000" />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" disabled={backendStatus.state === "checking"} onClick={checkBackendHealth}>
                    {backendStatus.state === "checking" ? "Checking..." : "Check Backend"}
                  </Button>
                  {backendStatus.state !== "idle" && (
                    <Pill tone={backendStatus.state === "good" ? "good" : "bad"}>
                      {backendStatus.state === "good" ? "healthy" : "unreachable"}
                    </Pill>
                  )}
                </div>
                {backendStatus.message ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                    {backendStatus.message}
                  </div>
                ) : null}

                {!adminToken ? (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Admin Login (JWT)</div>
                    <Input value={adminEmail} onChange={setAdminEmail} placeholder="admin email (username)" />
                    <Input value={adminPassword} onChange={setAdminPassword} type="password" placeholder="password" />
                    <Button variant="primary" disabled={apiUi.loading} onClick={adminLogin}>
                      {apiUi.loading ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Requires a Django <span className="font-medium">Super Admin</span> account (<span className="font-medium">is_superuser=true</span>).
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Signed In</div>
                      <Button onClick={adminLogout}>Sign Out</Button>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Backend user</div>
                      <div className="mt-1 text-sm font-semibold">{adminMe?.user?.email || adminMe?.user?.username || "—"}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Super Admin: {adminMe?.user?.is_superuser ? "yes" : "no"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        disabled={apiUi.loading}
                        onClick={async () => {
                          setApiUi({ loading: true, error: "", ok: "" });
                          try {
                            await loadOrgs();
                            setApiUi({ loading: false, error: "", ok: "Tenants refreshed" });
                          } catch (e) {
                            setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                          }
                        }}
                      >
                        Refresh Companies
                      </Button>
                      <Button
                        disabled={apiUi.loading}
                        onClick={async () => {
                          setApiUi({ loading: true, error: "", ok: "" });
                          try {
                            await loadUsers();
                            setApiUi({ loading: false, error: "", ok: "Users refreshed" });
                          } catch (e) {
                            setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                          }
                        }}
                      >
                        Refresh Users
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Create Tenant Company">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">Creates a new company (tenant Organization) in the backend.</div>
                <Input value={newOrgName} onChange={setNewOrgName} placeholder="Company name" />
                <Button
                  variant="primary"
                  disabled={!adminToken || apiUi.loading || !String(newOrgName).trim()}
                  onClick={async () => {
                    setApiUi({ loading: true, error: "", ok: "" });
                    try {
                      const created = await apiFetch("/orgs", { method: "POST", body: { name: newOrgName } });
                      setNewOrgName("");
                      await loadOrgs();
                      if (created?.id) setSelectedOrgId(String(created.id));
                      setApiUi({ loading: false, error: "", ok: "Tenant created" });
                    } catch (e) {
                      setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                    }
                  }}
                >
                  Create
                </Button>

                {!adminToken ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">Sign in to backend admin to create tenants.</div>
                ) : null}
              </div>
            </Card>

            <Card title="Company Directory">
              <div className="space-y-3">
                <Input value={orgSearch} onChange={setOrgSearch} placeholder="Search by name / slug / id" />
                <div className="max-h-[360px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  {(filteredOrgs || []).map((o) => {
                    const isActive = String(o.id) === String(selectedOrgId);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedOrgId(String(o.id))}
                        className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 ${
                          isActive ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{o.name}</div>
                          <Pill tone={o.subscription_tier === "premium" ? "good" : "neutral"}>{o.subscription_tier || "free"}</Pill>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">slug: {o.slug}</div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          created: {formatShortDate(o.created_at)} · expires: {o.subscription_expires_at ? formatShortDate(o.subscription_expires_at) : "—"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-gray-400">id: {String(o.id)}</div>
                      </button>
                    );
                  })}
                  {(!filteredOrgs || filteredOrgs.length === 0) && (
                    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No companies found.</div>
                  )}
                </div>
              </div>
            </Card>

            <div className="md:col-span-3">
              <Card title="Selected Company Management">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Select a company from the directory to manage it.</div>
                    <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Selected</div>
                      <div className="mt-1 text-base font-semibold">{selectedOrg?.name || "—"}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{selectedOrg?.slug || "—"}</div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                          created: <span className="font-medium">{formatShortDate(selectedOrg?.created_at)}</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                          expires: <span className="font-medium">{selectedOrg?.subscription_expires_at ? formatShortDate(selectedOrg.subscription_expires_at) : "—"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        disabled={!adminToken || !selectedOrgId || apiUi.loading}
                        onClick={async () => {
                          setApiUi({ loading: true, error: "", ok: "" });
                          try {
                            await loadOrgData(selectedOrgId);
                            setApiUi({ loading: false, error: "", ok: "Tenant data refreshed" });
                          } catch (e) {
                            setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                          }
                        }}
                      >
                        Refresh
                      </Button>
                      <Button
                        variant="danger"
                        disabled={!adminToken || !selectedOrgId || apiUi.loading}
                        onClick={async () => {
                          if (!selectedOrgId) return;
                          const ok = window.confirm("Delete this tenant and all its data? This cannot be undone.");
                          if (!ok) return;
                          setApiUi({ loading: true, error: "", ok: "" });
                          try {
                            await apiFetch(`/orgs/${selectedOrgId}`, { method: "DELETE" });
                            setSelectedOrgId("");
                            await loadOrgs();
                            setApiUi({ loading: false, error: "", ok: "Tenant deleted" });
                          } catch (e) {
                            setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                          }
                        }}
                      >
                        Delete Tenant
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    {!selectedOrg ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300">No tenant selected.</div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Company name</div>
                            <Input
                              value={orgDraftById[selectedOrgId]?.name ?? selectedOrg.name}
                              onChange={(v) => setOrgDraftById((s) => ({ ...s, [selectedOrgId]: { ...(s[selectedOrgId] || {}), name: v } }))}
                              placeholder="Company name"
                            />
                          </div>
                          <div>
                            <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Subscription tier</div>
                            <Select
                              value={orgDraftById[selectedOrgId]?.subscription_tier ?? selectedOrg.subscription_tier ?? "free"}
                              onChange={(v) => setOrgDraftById((s) => ({ ...s, [selectedOrgId]: { ...(s[selectedOrgId] || {}), subscription_tier: v } }))}
                              options={[
                                { value: "free", label: "free" },
                                { value: "premium", label: "premium" },
                              ]}
                            />
                          </div>
                          <div>
                            <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Expires at (optional)</div>
                            <input
                              type="datetime-local"
                              value={
                                orgDraftById[selectedOrgId]?.subscription_expires_at_local ??
                                formatIsoDatetimeLocal(selectedOrg.subscription_expires_at)
                              }
                              onChange={(e) =>
                                setOrgDraftById((s) => ({
                                  ...s,
                                  [selectedOrgId]: { ...(s[selectedOrgId] || {}), subscription_expires_at_local: e.target.value },
                                }))
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Slug</div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                              {selectedOrg.slug}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="primary"
                            disabled={!adminToken || apiUi.loading}
                            onClick={async () => {
                              setApiUi({ loading: true, error: "", ok: "" });
                              try {
                                const draft = orgDraftById[selectedOrgId] || {};
                                const expiresIso = parseDatetimeLocalToIso(draft.subscription_expires_at_local);
                                const patch = {
                                  ...(draft.name !== undefined ? { name: draft.name } : {}),
                                  ...(draft.subscription_tier !== undefined ? { subscription_tier: draft.subscription_tier } : {}),
                                  ...(draft.subscription_expires_at_local !== undefined
                                    ? { subscription_expires_at: expiresIso }
                                    : {}),
                                };
                                const updated = await apiFetch(`/orgs/${selectedOrgId}`, { method: "PATCH", body: patch });
                                setOrgDraftById((s) => {
                                  const next = { ...s };
                                  delete next[selectedOrgId];
                                  return next;
                                });
                                // refresh list
                                const list = await loadOrgs();
                                const found = (list || []).find((o) => String(o.id) === String(updated?.id));
                                if (found) setSelectedOrgId(String(found.id));
                                setApiUi({ loading: false, error: "", ok: "Tenant updated" });
                              } catch (e) {
                                setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                              }
                            }}
                          >
                            Save Changes
                          </Button>

                          <Link
                            to={`/partners/${selectedOrg.slug}`}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            Open Tenant Dashboard
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Users</div>
                            <div className="mt-1 text-lg font-bold">{orgStats?.counts?.users ?? "—"}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Uploads</div>
                            <div className="mt-1 text-lg font-bold">{orgStats?.counts?.uploads ?? "—"}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Assessments</div>
                            <div className="mt-1 text-lg font-bold">{orgStats?.counts?.assessments ?? "—"}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Jobs</div>
                            <div className="mt-1 text-lg font-bold">{orgStats?.counts?.jobs ?? "—"}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Notifications</div>
                            <div className="mt-1 text-lg font-bold">{orgStats?.counts?.notifications ?? "—"}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "users" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Companies">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Select a company to view all its activities.
                </div>
                <Input value={orgSearch} onChange={setOrgSearch} placeholder="Search by name / slug / id" />
                <div className="max-h-[520px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  {(filteredOrgs || []).map((o) => {
                    const isActive = String(o.id) === String(selectedOrgId);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedOrgId(String(o.id))}
                        className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 ${
                          isActive ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{o.name}</div>
                          <Pill tone={o.subscription_tier === "premium" ? "good" : "neutral"}>{o.subscription_tier || "free"}</Pill>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">slug: {o.slug}</div>
                        <div className="mt-0.5 text-[11px] text-gray-400">id: {String(o.id)}</div>
                      </button>
                    );
                  })}
                  {(!filteredOrgs || filteredOrgs.length === 0) && (
                    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No companies found.</div>
                  )}
                </div>
              </div>
            </Card>

            <div className="md:col-span-2">
              <Card title="Company Activities">
                {!selectedOrgId ? (
                  <div className="text-sm text-gray-600 dark:text-gray-300">Select a company from the list to view activity.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Selected company</div>
                        <div className="mt-1 text-base font-semibold">{selectedOrg?.name || "—"}</div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{selectedOrg?.slug || "—"}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          disabled={!adminToken || !selectedOrgId || apiUi.loading}
                          onClick={async () => {
                            setApiUi({ loading: true, error: "", ok: "" });
                            try {
                              await loadOrgData(selectedOrgId);
                              setApiUi({ loading: false, error: "", ok: "Activity refreshed" });
                            } catch (e) {
                              setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                            }
                          }}
                        >
                          Refresh
                        </Button>
                        <Link
                          to={selectedOrg ? `/partners/${selectedOrg.slug}` : tenantEntry}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          Open Tenant
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Users</div>
                        <div className="mt-1 text-lg font-bold">{orgStats?.counts?.users ?? "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Uploads</div>
                        <div className="mt-1 text-lg font-bold">{orgStats?.counts?.uploads ?? orgUploads.length}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Assessments</div>
                        <div className="mt-1 text-lg font-bold">{orgStats?.counts?.assessments ?? orgAssessments.length}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Jobs</div>
                        <div className="mt-1 text-lg font-bold">{orgStats?.counts?.jobs ?? orgJobs.length}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Notifications</div>
                        <div className="mt-1 text-lg font-bold">{orgStats?.counts?.notifications ?? orgNotifications.length}</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Company Intelligence (Backend)</div>
                        <Button
                          disabled={!adminToken || !selectedOrgId || apiUi.loading}
                          onClick={async () => {
                            setApiUi({ loading: true, error: "", ok: "" });
                            try {
                              const summary = await apiFetch(`/dashboard/summary?org_id=${encodeURIComponent(String(selectedOrgId))}`, { method: "GET" });
                              setTenantDashboardSummary(summary);
                              setApiUi({ loading: false, error: "", ok: "Summary refreshed" });
                            } catch (e) {
                              setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                            }
                          }}
                        >
                          Refresh Summary
                        </Button>
                      </div>
                      {tenantDashboardSummary ? (
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Org Health</div>
                            <div className="mt-1 text-lg font-bold">{tenantDashboardSummary.org_health}</div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">confidence: {Number(tenantDashboardSummary.confidence || 0).toFixed(2)}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Transformation Readiness</div>
                            <div className="mt-1 text-lg font-bold">{tenantDashboardSummary.transformation_readiness}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Next 30 Days Forecast</div>
                            <div className="mt-1 text-lg font-bold">{tenantDashboardSummary.health_forecast?.next_30_days ?? "—"}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                          No summary available. (Backend may be offline, or you may not have tenant data for this company yet.)
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Company Controls</div>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Run Assessment</div>
                          <div className="mt-2 space-y-2">
                            <Select
                              value={runSystemKey}
                              onChange={setRunSystemKey}
                              options={CANONICAL_SYSTEMS.map((s) => ({ value: s.key, label: s.title }))}
                            />
                            <Button
                              variant="primary"
                              disabled={!adminToken || !selectedOrgId || apiUi.loading}
                              onClick={async () => {
                                setApiUi({ loading: true, error: "", ok: "" });
                                try {
                                  await apiFetch(`/assessments/run?org_id=${encodeURIComponent(String(selectedOrgId))}`, {
                                    method: "POST",
                                    body: { system_key: runSystemKey },
                                  });
                                  await loadOrgData(selectedOrgId);
                                  setApiUi({ loading: false, error: "", ok: "Assessment completed" });
                                } catch (e) {
                                  setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                                }
                              }}
                            >
                              Run
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Simulate Impact</div>
                          <div className="mt-2 space-y-2">
                            <Select
                              value={simulateSystemKey}
                              onChange={setSimulateSystemKey}
                              options={CANONICAL_SYSTEMS.map((s) => ({ value: s.key, label: s.title }))}
                            />
                            <Input value={simulatePct} onChange={setSimulatePct} placeholder="Change % (e.g. 10)" />
                            <Button
                              disabled={!adminToken || !selectedOrgId || apiUi.loading}
                              onClick={async () => {
                                setApiUi({ loading: true, error: "", ok: "" });
                                try {
                                  const pct = Number(simulatePct);
                                  const res = await apiFetch(`/dashboard/simulate-impact?org_id=${encodeURIComponent(String(selectedOrgId))}`, {
                                    method: "POST",
                                    body: { system_key: simulateSystemKey, change_pct: Number.isFinite(pct) ? pct : 10 },
                                  });
                                  setSimulateResult(res);
                                  setApiUi({ loading: false, error: "", ok: "Simulation complete" });
                                } catch (e) {
                                  setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                                }
                              }}
                            >
                              Simulate
                            </Button>
                            {simulateResult ? (
                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                                before orgHealth: {simulateResult?.before?.orgHealth ?? "—"} → after: {simulateResult?.after?.orgHealth ?? "—"}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Upload Data File</div>
                          <div className="mt-2 space-y-2">
                            <Input value={uploadName} onChange={setUploadName} placeholder="Optional name override" />
                            <input
                              type="file"
                              onChange={(e) => setUploadFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                            />
                            <Button
                              variant="primary"
                              disabled={!adminToken || !selectedOrgId || apiUi.loading || !uploadFile}
                              onClick={async () => {
                                setApiUi({ loading: true, error: "", ok: "" });
                                try {
                                  const fd = new FormData();
                                  if (uploadName) fd.append("name", uploadName);
                                  fd.append("file", uploadFile);
                                  await apiFetch(`/uploads?org_id=${encodeURIComponent(String(selectedOrgId))}`, {
                                    method: "POST",
                                    body: fd,
                                  });
                                  setUploadFile(null);
                                  setUploadName("");
                                  await loadOrgData(selectedOrgId);
                                  setApiUi({ loading: false, error: "", ok: "Upload created" });
                                } catch (e) {
                                  setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                                }
                              }}
                            >
                              Upload
                            </Button>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Allowed: .csv, .xlsx, .txt, .pdf, .docx</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Recent Uploads</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgUploads || []).slice(0, 30).map((u) => (
                          <div key={u.id} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{u.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(u.timestamp_ms || Date.now()).toLocaleString()}</div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              systems: {Array.isArray(u.analyzed_systems) ? u.analyzed_systems.join(", ") : "—"}
                            </div>
                          </div>
                        ))}
                        {(orgUploads || []).length === 0 ? <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No uploads.</div> : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Recent Assessments</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgAssessments || []).slice(0, 30).map((r) => (
                          <div key={r.id} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{r.title}</div>
                              <Pill tone={Number(r.score) >= 70 ? "good" : Number(r.score) >= 40 ? "warn" : "bad"}>score {r.score}</Pill>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              system: {r.systemId} · {new Date(r.timestamp_ms || Date.now()).toLocaleString()}
                            </div>
                          </div>
                        ))}
                        {(orgAssessments || []).length === 0 ? <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No assessments.</div> : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Jobs</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgJobs || []).slice(0, 30).map((j) => (
                          <div key={j.jobId} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{j.name || j.system_id || "job"}</div>
                              <Pill tone={j.status === "completed" ? "good" : j.status === "failed" ? "bad" : "neutral"}>{j.status}</Pill>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">jobId: {j.jobId}</div>
                          </div>
                        ))}
                        {(orgJobs || []).length === 0 ? <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No jobs.</div> : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Notifications</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgNotifications || []).slice(0, 30).map((n) => (
                          <div key={n.id} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{n.subject || "(no subject)"}</div>
                              <Pill>{n.channel}</Pill>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">to: {n.to || "—"}</div>
                          </div>
                        ))}
                        {(orgNotifications || []).length === 0 ? (
                          <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No notifications.</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "org-data" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Tenant Selector">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">Choose a tenant to view operational data.</div>
                <Select
                  value={selectedOrgId}
                  onChange={setSelectedOrgId}
                  options={[
                    { value: "", label: "— Select tenant —" },
                    ...(orgs || []).map((o) => ({ value: String(o.id), label: `${o.name} (${o.slug})` })),
                  ]}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    disabled={!adminToken || !selectedOrgId || apiUi.loading}
                    onClick={async () => {
                      setApiUi({ loading: true, error: "", ok: "" });
                      try {
                        await loadOrgData(selectedOrgId);
                        setApiUi({ loading: false, error: "", ok: "Tenant data refreshed" });
                      } catch (e) {
                        setApiUi({ loading: false, error: String(e?.message || e), ok: "" });
                      }
                    }}
                  >
                    Refresh
                  </Button>
                  <Link
                    to={selectedOrg ? `/partners/${selectedOrg.slug}` : tenantEntry}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Open Tenant
                  </Link>
                </div>
                {!adminToken ? <div className="text-xs text-gray-500 dark:text-gray-400">Sign in on the Tenants tab to load backend data.</div> : null}
              </div>
            </Card>

            <div className="md:col-span-2">
              <Card title="Tenant Operational Data">
                {!selectedOrgId ? (
                  <div className="text-sm text-gray-600 dark:text-gray-300">Select a tenant to view data.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Uploads</div>
                        <div className="mt-1 text-lg font-bold">{orgUploads.length}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Assessments</div>
                        <div className="mt-1 text-lg font-bold">{orgAssessments.length}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Jobs</div>
                        <div className="mt-1 text-lg font-bold">{orgJobs.length}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Notifications</div>
                        <div className="mt-1 text-lg font-bold">{orgNotifications.length}</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Recent Uploads</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgUploads || []).slice(0, 30).map((u) => (
                          <div key={u.id} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{u.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(u.timestamp_ms || Date.now()).toLocaleString()}</div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              systems: {Array.isArray(u.analyzed_systems) ? u.analyzed_systems.join(", ") : "—"}
                            </div>
                          </div>
                        ))}
                        {(orgUploads || []).length === 0 ? <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No uploads.</div> : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Recent Assessments</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgAssessments || []).slice(0, 30).map((r) => (
                          <div key={r.id} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{r.title}</div>
                              <Pill tone={Number(r.score) >= 70 ? "good" : Number(r.score) >= 40 ? "warn" : "bad"}>score {r.score}</Pill>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              system: {r.systemId} · {new Date(r.timestamp_ms || Date.now()).toLocaleString()}
                            </div>
                          </div>
                        ))}
                        {(orgAssessments || []).length === 0 ? <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No assessments.</div> : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Jobs</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgJobs || []).slice(0, 30).map((j) => (
                          <div key={j.jobId} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{j.name || j.system_id || "job"}</div>
                              <Pill tone={j.status === "completed" ? "good" : j.status === "failed" ? "bad" : "neutral"}>{j.status}</Pill>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">jobId: {j.jobId}</div>
                          </div>
                        ))}
                        {(orgJobs || []).length === 0 ? <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No jobs.</div> : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm font-semibold">Notifications</div>
                      <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        {(orgNotifications || []).slice(0, 30).map((n) => (
                          <div key={n.id} className="border-b border-gray-100 p-3 text-sm dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">{n.subject || "(no subject)"}</div>
                              <Pill>{n.channel}</Pill>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">to: {n.to || "—"}</div>
                          </div>
                        ))}
                        {(orgNotifications || []).length === 0 ? (
                          <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No notifications.</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "routes" ? (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {sections.map((s) => (
              <Card key={s.title} title={s.title}>
                <div className="flex flex-col gap-2">
                  {s.links.map((l) => (
                    <RouteLink key={l.to} to={l.to} label={l.label} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
