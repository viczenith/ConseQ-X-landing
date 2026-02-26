import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaSun, FaShieldAlt, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaCopy, FaCheck, FaSignInAlt } from "react-icons/fa";

const ADMIN_TOKEN_KEY  = "conseqx_admin_access_token_v1";
const ADMIN_REFRESH_KEY = "conseqx_admin_refresh_token_v1";
const ADMIN_API_BASE_KEY = "conseqx_admin_api_base_v1";

/* ── Test credentials (dev phase only) ── */
const TEST_EMAIL    = "superadmin@conseq-x.com";
const TEST_PASSWORD = "ConseQXAdmin2025!";

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

  /* ─── api base ─── */
  const [apiBase] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_API_BASE_KEY) || String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000");
    } catch {
      return String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000");
    }
  });

  const [ui, setUi]               = useState({ loading: false, error: "", ok: "" });
  const [adminToken, setAdminToken] = useState(() => { try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch { return ""; } });
  const [adminEmail, setAdminEmail]     = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMe, setAdminMe]       = useState(null);
  const [showPw, setShowPw]         = useState(false);
  const [copied, setCopied]         = useState("");

  useEffect(() => { try { localStorage.setItem(ADMIN_API_BASE_KEY, apiBase); } catch {} }, [apiBase]);

  /* ─── api helpers ─── */
  const apiFetch = async (path, { method = "GET", headers = {}, body = null, tokenOverride = null } = {}) => {
    const h = { Accept: "application/json", ...headers };
    const tok = tokenOverride !== null ? tokenOverride : adminToken;
    if (tok) h.Authorization = `Bearer ${tok}`;
    const opts = { method, headers: h };
    if (body !== null) {
      opts.body = typeof body === "string" ? body : JSON.stringify(body);
      if (!h["Content-Type"]) opts.headers["Content-Type"] = "application/json";
    }
    const res  = await fetch(makeApiUrl(apiBase, path), opts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = typeof data === "string" ? data : data?.detail || data?.error || `HTTP ${res.status}`;
      const err = new Error(msg); err.status = res.status; err.payload = data; throw err;
    }
    return data;
  };

  const clearSession = (message = "") => {
    try { localStorage.removeItem(ADMIN_TOKEN_KEY); localStorage.removeItem(ADMIN_REFRESH_KEY); } catch {}
    setAdminToken(""); setAdminMe(null);
    if (message) setUi({ loading: false, error: message, ok: "" });
  };

  const signIn = async (e) => {
    if (e) e.preventDefault();
    setUi({ loading: true, error: "", ok: "" });
    try {
      const payload = await apiFetch("/auth/token/", {
        method: "POST",
        body: { username: String(adminEmail || "").trim(), password: adminPassword },
        tokenOverride: "",
      });
      const token = payload?.access || "";
      const refreshToken = payload?.refresh || "";
      if (!token) throw new Error("No access token returned");
      try { localStorage.setItem(ADMIN_TOKEN_KEY, token); if (refreshToken) localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken); } catch {}
      setAdminToken(token);

      const me = await apiFetch("/auth/me", { method: "GET", tokenOverride: token });
      setAdminMe(me);
      if (!me?.user?.is_superuser) throw new Error("Access denied — Super Admin account required.");

      setUi({ loading: false, error: "", ok: "Authenticated successfully" });
      navigate("/admin", { replace: true });
    } catch (err) {
      clearSession();
      setUi({ loading: false, error: String(err?.message || err), ok: "" });
    }
  };

  const existingSessionLabel = useMemo(() => (adminMe?.user?.email || adminMe?.user?.username || ""), [adminMe]);

  /* auto-check existing session on mount */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!adminToken) return;
      try {
        const me = await apiFetch("/auth/me", { method: "GET" });
        if (!mounted) return;
        setAdminMe(me);
      } catch { if (mounted) clearSession(); }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* copy helper */
  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(""), 1500); }).catch(() => {});
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950 px-4 py-10 transition-colors">
      {/* dark mode toggle floating */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-5 right-5 z-50 rounded-full p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
      </button>

      <div className="w-full max-w-md">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 mb-4">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ConseQ-X Super Admin — Secure Access
          </p>
        </div>

        {/* ── Sign In Card ── */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden">
          {/* gradient accent strip */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <form onSubmit={signIn} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@conseq-x.com"
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                <input
                  type={showPw ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 pl-10 pr-12 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPw ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={ui.loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {ui.loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <FaSignInAlt size={14} />
                  Sign In
                </>
              )}
            </button>

            {/* Existing session info */}
            {adminMe && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Active Session</span>
                </div>
                <div className="mt-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-200">{existingSessionLabel || "—"}</div>
                <div className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                  Super Admin: {adminMe?.user?.is_superuser ? "Yes" : "No"}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/admin", { replace: true })}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => clearSession("Session cleared")}
                    className="rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Error / OK alerts */}
            {ui.error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 text-sm text-red-700 dark:text-red-300">
                {ui.error}
              </div>
            )}
            {ui.ok && !adminMe && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                {ui.ok}
              </div>
            )}
          </form>
        </div>

        {/* ── Test Credentials Card (dev only) ── */}
        <div className="mt-5 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-900/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400/20 dark:bg-amber-500/20">
              <span className="text-amber-600 dark:text-amber-400 text-xs">🔑</span>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Test Credentials
            </span>
            <span className="ml-auto text-[10px] font-medium text-amber-500 dark:text-amber-500 bg-amber-200/60 dark:bg-amber-800/30 rounded-full px-2 py-0.5">
              DEV ONLY
            </span>
          </div>

          <div className="space-y-2">
            {/* Email row */}
            <div className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-amber-200/60 dark:border-amber-800/30 px-3 py-2">
              <FaEnvelope className="text-amber-500 text-xs flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[50px]">Email</span>
              <code className="flex-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 select-all">{TEST_EMAIL}</code>
              <button
                type="button"
                onClick={() => copyText(TEST_EMAIL, "email")}
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors p-1"
                title="Copy email"
              >
                {copied === "email" ? <FaCheck size={12} className="text-emerald-500" /> : <FaCopy size={12} />}
              </button>
            </div>

            {/* Password row */}
            <div className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-amber-200/60 dark:border-amber-800/30 px-3 py-2">
              <FaLock className="text-amber-500 text-xs flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[50px]">Pass</span>
              <code className="flex-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 select-all">{TEST_PASSWORD}</code>
              <button
                type="button"
                onClick={() => copyText(TEST_PASSWORD, "password")}
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors p-1"
                title="Copy password"
              >
                {copied === "password" ? <FaCheck size={12} className="text-emerald-500" /> : <FaCopy size={12} />}
              </button>
            </div>
          </div>

          {/* Quick fill button */}
          <button
            type="button"
            onClick={() => { setAdminEmail(TEST_EMAIL); setAdminPassword(TEST_PASSWORD); }}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold py-2 hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-all"
          >
            Auto-fill Credentials
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          ConseQ-X &copy; {new Date().getFullYear()} — Protected Admin Portal
        </p>
      </div>
    </div>
  );
}
