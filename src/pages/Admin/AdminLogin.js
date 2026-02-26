import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";

const ADMIN_TOKEN_KEY = "conseqx_admin_access_token_v1";
const ADMIN_REFRESH_KEY = "conseqx_admin_refresh_token_v1";
const ADMIN_API_BASE_KEY = "conseqx_admin_api_base_v1";

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

function normBase(base) {
  return String(base || "").replace(/\/$/, "");
}

function makeApiUrl(apiBase, path) {
  return `${normBase(apiBase)}/api${String(path || "").startsWith("/") ? "" : "/"}${path}`;
}

export default function AdminLogin() {
  const navigate = useNavigate();

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

  const [apiBase, setApiBase] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_API_BASE_KEY) || String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000");
    } catch {
      return String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000");
    }
  });

  const [ui, setUi] = useState({ loading: false, error: "", ok: "" });

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

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_API_BASE_KEY, apiBase);
    } catch {}
  }, [apiBase]);

  const apiFetch = async (path, { method = "GET", headers = {}, body = null, tokenOverride = null } = {}) => {
    const h = { Accept: "application/json", ...headers };
    const tok = tokenOverride !== null ? tokenOverride : adminToken;
    if (tok) h.Authorization = `Bearer ${tok}`;

    const opts = { method, headers: h };
    if (body !== null) {
      opts.body = typeof body === "string" ? body : JSON.stringify(body);
      if (!h["Content-Type"]) opts.headers["Content-Type"] = "application/json";
    }

    const res = await fetch(makeApiUrl(apiBase, path), opts);
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
  };

  const clearSession = (message = "") => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_KEY);
    } catch {}
    setAdminToken("");
    setAdminMe(null);
    if (message) setUi({ loading: false, error: message, ok: "" });
  };

  const loadAdminMe = async (token) => {
    const data = await apiFetch("/auth/me", { method: "GET", tokenOverride: token });
    setAdminMe(data);
    return data;
  };

  const assertSuperAdmin = (mePayload) => {
    const isSuper = Boolean(mePayload?.user?.is_superuser);
    if (!isSuper) throw new Error("Access denied: Super Admin account required.");
  };

  const signIn = async ({ username, password } = {}) => {
    setUi({ loading: true, error: "", ok: "" });
    try {
      const payload = await apiFetch("/auth/token/", {
        method: "POST",
        body: { username: String(username || adminEmail || "").trim(), password: password ?? adminPassword },
        tokenOverride: "",
      });
      const token = payload?.access || "";
      const refreshToken = payload?.refresh || "";
      if (!token) throw new Error("No access token returned");

      try {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        if (refreshToken) localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
      } catch {}
      setAdminToken(token);

      const me = await loadAdminMe(token);
      assertSuperAdmin(me);

      setUi({ loading: false, error: "", ok: "Logged in" });
      navigate("/admin", { replace: true });
    } catch (e) {
      clearSession();
      setUi({ loading: false, error: String(e?.message || e), ok: "" });
    }
  };

  const bootstrapDemo = async () => {
    setUi({ loading: true, error: "", ok: "" });
    try {
      const data = await apiFetch("/auth/demo-bootstrap-superadmin/", { method: "POST", tokenOverride: "" });
      const demo = data?.demo;
      if (!demo?.username || !demo?.password) throw new Error("Demo bootstrap did not return credentials");

      setAdminEmail(demo.username);
      setAdminPassword(demo.password);
      setUi({ loading: false, error: "", ok: "Demo Super Admin created. You can now sign in." });
    } catch (e) {
      setUi({ loading: false, error: String(e?.message || e), ok: "" });
    }
  };

  const existingSessionLabel = useMemo(() => (adminMe?.user?.email || adminMe?.user?.username || ""), [adminMe]);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      if (!adminToken) return;
      try {
        const me = await apiFetch("/auth/me", { method: "GET" });
        if (!mounted) return;
        setAdminMe(me);
      } catch {
        if (!mounted) return;
        clearSession();
      }
    }
    boot();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Admin Login</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>
              <Pill tone={adminToken ? "good" : "warn"}>{adminToken ? "token present" : "no token"}</Pill>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Card title="Demo Login">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" disabled={ui.loading} onClick={bootstrapDemo}>
                  {ui.loading ? "Working..." : "Create Demo Super Admin"}
                </Button>
                <Button
                  disabled={ui.loading}
                  onClick={() => {
                    setAdminEmail("demo.superadmin@example.com");
                    setAdminPassword("DemoPass123!");
                  }}
                >
                  Fill Demo Credentials
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Sign In">
            <div className="space-y-2">
              <Input value={adminEmail} onChange={setAdminEmail} placeholder="admin email (username)" />
              <Input value={adminPassword} onChange={setAdminPassword} type="password" placeholder="password" />
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" disabled={ui.loading} onClick={() => signIn()}>
                  {ui.loading ? "Signing in..." : "Sign In"}
                </Button>
                {adminToken ? (
                  <Button
                    onClick={async () => {
                      setUi({ loading: true, error: "", ok: "" });
                      try {
                        const me = await apiFetch("/auth/me", { method: "GET" });
                        assertSuperAdmin(me);
                        setUi({ loading: false, error: "", ok: "Session OK" });
                        navigate("/admin", { replace: true });
                      } catch (e) {
                        clearSession(String(e?.message || e));
                        setUi({ loading: false, error: String(e?.message || e), ok: "" });
                      }
                    }}
                  >
                    Continue
                  </Button>
                ) : null}
                <Button variant="danger" disabled={ui.loading} onClick={() => clearSession("Logged out")}
                >
                  Clear Session
                </Button>
              </div>

              {adminMe ? (
                <div className="mt-2 rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-700">
                  <div className="text-gray-500 dark:text-gray-400">Current backend user</div>
                  <div className="mt-1 text-sm font-semibold">{existingSessionLabel || "—"}</div>
                  <div className="mt-1 text-gray-500 dark:text-gray-400">Super Admin: {adminMe?.user?.is_superuser ? "Yes" : "No"}</div>
                </div>
              ) : null}

            </div>
          </Card>

          {ui.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {ui.error}
            </div>
          ) : null}
          {ui.ok ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              {ui.ok}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
