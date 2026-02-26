import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   TOKEN / API CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
const ACCESS_KEY  = "conseqx_access_token_v1";
const REFRESH_KEY = "conseqx_refresh_token_v1";

/** Inactivity timeout in 15 minutes. */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

function getApiBase() {
  return String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

function apiUrl(path) {
  return `${getApiBase()}/api${String(path).startsWith("/") ? "" : "/"}${path}`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/* ═══════════════════════════════════════════════════════════════
   AUTH CONTEXT
   ═══════════════════════════════════════════════════════════════ */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /* Raw backend payloads (DRF serializer shapes) */
  const [rawUser, setRawUser] = useState(null);
  const [rawOrg, setRawOrg]   = useState(null);
  const [loading, setLoading] = useState(false);
  /** true once session-restore finishes (success or fail) */
  const [ready, setReady]     = useState(false);

  /* ─── Token helpers ─── */
  const getToken   = () => { try { return localStorage.getItem(ACCESS_KEY) || ""; } catch { return ""; } };
  const getRefresh = () => { try { return localStorage.getItem(REFRESH_KEY) || ""; } catch { return ""; } };
  const saveTokens = (access, refresh) => {
    try {
      if (access) localStorage.setItem(ACCESS_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    } catch {}
  };
  const clearTokens = () => {
    try { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); } catch {}
  };

  /* ─── Low-level authenticated fetch ─── */
  const rawFetch = useCallback(async (path, { method = "GET", body = null, token } = {}) => {
    const h = { Accept: "application/json" };
    const tok = token !== undefined ? token : getToken();
    if (tok) h.Authorization = `Bearer ${tok}`;
    const opts = { method, headers: h };
    if (body != null) { h["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }

    const res = await fetch(apiUrl(path), opts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = typeof data === "object" && data
        ? (data.detail || data.error || JSON.stringify(data))
        : String(text || `HTTP ${res.status}`);
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }, []);

  /* ─── Token refresh ─── */
  const tryRefresh = useCallback(async () => {
    const rt = getRefresh();
    if (!rt) return false;
    try {
      const data = await rawFetch("/auth/token/refresh/", { method: "POST", body: { refresh: rt }, token: "" });
      if (data?.access) { saveTokens(data.access, data.refresh || null); return true; }
    } catch {}
    return false;
  }, [rawFetch]);

  /* ─── Load /auth/me ─── */
  const fetchMe = useCallback(async (token) => {
    const data = await rawFetch("/auth/me", { token });
    setRawUser(data?.user || null);
    setRawOrg(data?.org || null);
    return data;
  }, [rawFetch]);

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════════ */

  /** Register a new organisation + user account */
  const register = useCallback(async ({ orgName, ceoName, email, phone, password }) => {
    setLoading(true);
    try {
      const e = normalizeEmail(email);
      if (!orgName?.trim())   throw new Error("Company name is required");
      if (!ceoName?.trim())   throw new Error("Name / role is required");
      if (!isValidEmail(e))   throw new Error("A valid email address is required");
      if (!phone?.trim())     throw new Error("Phone number is required");
      if (!password || password.length < 6) throw new Error("Password must be at least 6 characters");

      // 1) Create the account
      await rawFetch("/auth/register", {
        method: "POST",
        body: { org_name: orgName.trim(), ceo_name: ceoName.trim(), email: e, phone: phone.trim(), password },
        token: "",
      });

      // 2) Obtain JWT tokens
      const jwt = await rawFetch("/auth/token/", {
        method: "POST",
        body: { username: e, password },
        token: "",
      });
      if (!jwt?.access) throw new Error("Account created but session could not start. Please sign in.");
      saveTokens(jwt.access, jwt.refresh);

      // 3) Load user + org profile
      const me = await fetchMe(jwt.access);
      return { user: me?.user, org: me?.org };
    } finally {
      setLoading(false);
    }
  }, [rawFetch, fetchMe]);

  /** Sign in with email + password */
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const e = normalizeEmail(email);
      if (!e)        throw new Error("Email is required");
      if (!password) throw new Error("Password is required");

      const jwt = await rawFetch("/auth/token/", {
        method: "POST",
        body: { username: e, password },
        token: "",
      });
      if (!jwt?.access) throw new Error("Invalid credentials");
      saveTokens(jwt.access, jwt.refresh);

      const me = await fetchMe(jwt.access);
      return { user: me?.user, org: me?.org };
    } finally {
      setLoading(false);
    }
  }, [rawFetch, fetchMe]);

  /** Sign out */
  const logout = useCallback(() => {
    clearTokens();
    setRawUser(null);
    setRawOrg(null);
  }, []);

  /** Upgrade / downgrade subscription tier (demo flow). */
  const upgrade = useCallback(async ({ months = 12, tier = "premium" } = {}) => {
    if (!rawOrg?.id) return null;
    try {
      const updated = await rawFetch("/auth/upgrade", { method: "POST", body: { tier, months } });
      if (updated) { setRawOrg(updated); return updated; }
    } catch {
      // Fallback: local-only state update if self-upgrade endpoint is unavailable
      const expires = new Date(Date.now() + months * 30 * 86400000).toISOString();
      setRawOrg(prev => prev ? { ...prev, subscription_tier: tier, subscription_expires_at: expires } : prev);
    }
    return rawOrg;
  }, [rawOrg, rawFetch]);

  /* ─── Boot: restore session from stored JWT on mount ─── */
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const tok = getToken();
    if (!tok) { setReady(true); return; }
    (async () => {
      try {
        await fetchMe(tok);
      } catch (err) {
        if (err?.status === 401) {
          const ok = await tryRefresh();
          if (ok) {
            try { await fetchMe(); } catch { clearTokens(); setRawUser(null); setRawOrg(null); }
          } else { clearTokens(); setRawUser(null); setRawOrg(null); }
        }
        // If backend is simply unreachable, keep tokens for retry on next load
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Inactivity auto-logout ─── */
  useEffect(() => {
    if (!rawUser) return;          // only track when signed in

    let timer = null;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        // Clear visitor session from localStorage on inactivity timeout
        localStorage.removeItem("conseqx_visitor_id");
        localStorage.removeItem("conseqx_visitor_email");
        localStorage.removeItem("conseqx_visitor_org");
        localStorage.removeItem("conseqx_visitor_role");
        localStorage.removeItem("conseqx_session_step");
        localStorage.removeItem("conseqx_session_system");
        localStorage.removeItem("conseqx_session_answers");
        localStorage.removeItem("conseqx_session_analysis");
        window.location.href = "/";
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();                  // start the countdown

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [rawUser, logout]);

  /* ═══════════════════════════════════════════════════════════════
     Backward-compatible shapes
     (other components expect  user.name, user.email, user.orgId,
      org.id, org.name, org.slug, org.subscription.{tier,expiresAt})
     ═══════════════════════════════════════════════════════════════ */
  const user = rawUser
    ? {
        email: rawUser.email,
        name: `${rawUser.first_name || ""} ${rawUser.last_name || ""}`.trim() || rawUser.username || rawUser.email,
        phone: rawUser.phone || "",
        orgId: rawOrg?.id || null,
        id: rawUser.id,
        is_superuser: rawUser.is_superuser,
        is_staff: rawUser.is_staff,
      }
    : null;

  const org = rawOrg
    ? {
        id: rawOrg.id,
        name: rawOrg.name,
        slug: rawOrg.slug,
        subscription: {
          tier: rawOrg.subscription_tier || "free",
          expiresAt: rawOrg.subscription_expires_at
            ? new Date(rawOrg.subscription_expires_at).getTime()
            : null,
        },
      }
    : null;

  /** Legacy helper used by RequirePremium, PartnerTenantEntry, etc. */
  const getCurrent = useCallback(() => {
    if (!rawUser) return null;
    // Re-derive from raw state so callers always see the latest values
    const u = {
      email: rawUser.email,
      name: `${rawUser.first_name || ""} ${rawUser.last_name || ""}`.trim() || rawUser.username || rawUser.email,
      phone: rawUser.phone || "",
      orgId: rawOrg?.id || null,
      id: rawUser.id,
    };
    const o = rawOrg
      ? {
          id: rawOrg.id, name: rawOrg.name, slug: rawOrg.slug,
          subscription: {
            tier: rawOrg.subscription_tier || "free",
            expiresAt: rawOrg.subscription_expires_at ? new Date(rawOrg.subscription_expires_at).getTime() : null,
          },
        }
      : null;
    return { user: u, org: o };
  }, [rawUser, rawOrg]);

  const isAdmin = Boolean(rawUser?.is_superuser || rawUser?.is_staff);

  /* ─── Context value ─── */
  const ctx = {
    user,
    org,
    loading,
    ready,
    isAdmin,
    register,
    login,
    logout,
    upgrade,
    getCurrent,
    getAccessToken: getToken,
  };

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

