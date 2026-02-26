const DEFAULT_API_BASE = String(process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000");
const ACCESS_KEY  = "conseqx_access_token_v1";
const REFRESH_KEY = "conseqx_refresh_token_v1";

function normBase(base) {
  const b = String(base || "").trim();
  return b.endsWith("/") ? b.slice(0, -1) : b;
}

export function getApiBase() {
  return normBase(DEFAULT_API_BASE);
}

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_KEY) || "";
  } catch {
    return "";
  }
}

/** Try to refresh the access token using the stored refresh token. */
async function tryRefreshToken() {
  try {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    const res = await fetch(`${getApiBase()}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.access) {
      localStorage.setItem(ACCESS_KEY, data.access);
      if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", token = null, body = null, _retried = false } = {}) {
  const base = getApiBase();
  const url = `${base}/api${String(path || "").startsWith("/") ? "" : "/"}${path}`;

  const tok = token != null ? String(token || "") : getAccessToken();
  if (!tok) throw new Error("Not authenticated. Please sign in.");

  const headers = {
    Authorization: `Bearer ${tok}`,
    Accept: "application/json",
  };

  let finalBody = undefined;
  if (body != null) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: finalBody });

  // Auto-refresh on 401 (expired access token)
  if (res.status === 401 && !_retried && token == null) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return apiFetch(path, { method, token: newToken, body, _retried: true });
    }
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.detail)) ? (data.error || data.detail) : text || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }

  return data;
}
