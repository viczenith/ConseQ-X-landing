import React, { useState, useEffect, useCallback } from "react";
import { useAdmin, SectionCard, Btn, Input, Pill, StatCard, EmptyState, formatDateTime } from "./SuperAdminShell";
import {
  FaHeartbeat, FaSignOutAlt, FaKey, FaServer, FaDatabase, FaCog,
  FaCheckCircle, FaTimesCircle, FaShieldAlt, FaPalette, FaSun, FaMoon,
  FaTrashAlt, FaDownload, FaBell, FaLock, FaUserShield, FaBuilding,
  FaUsers, FaClipboardList, FaCloudUploadAlt, FaCogs, FaExclamationTriangle,
  FaTools, FaInfoCircle, FaSync, FaToggleOn, FaToggleOff, FaHistory
} from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import Logo3D from "../../assets/ConseQ-X-3d.png";

/* ═══════════════════════════════════════════════════════════
   LOCAL STORAGE KEYS for settings persistence
   ═══════════════════════════════════════════════════════════ */
const SETTINGS_KEYS = {
  MAINTENANCE_MODE:        "conseqx_maintenance_mode",
  DEFAULT_TIER:            "conseqx_default_subscription_tier",
  TRIAL_DAYS:              "conseqx_trial_period_days",
  ENFORCE_EMAIL_VERIFY:    "conseqx_enforce_email_verification",
  MAX_USERS_PER_ORG:       "conseqx_max_users_per_org",
  SESSION_TIMEOUT_MINS:    "conseqx_session_timeout_mins",
  ADMIN_NOTIF_EMAIL:       "conseqx_admin_notification_email",
  NOTIF_CHANNELS:          "conseqx_default_notification_channels",
  AUTO_SUSPEND_INACTIVE:   "conseqx_auto_suspend_inactive_days",
  GOVERNANCE_LOG:          "conseqx_governance_audit_log",
};

function loadSetting(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveSetting(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ═══════════════════════════════════════════════════════════
   TAB CONFIGS
   ═══════════════════════════════════════════════════════════ */
const TABS = [
  { key: "general",      label: "General",      icon: FaCog },
  { key: "connection",   label: "Connection",   icon: FaServer },
  { key: "security",     label: "Security",     icon: FaShieldAlt },
  { key: "governance",   label: "Governance",   icon: FaUserShield },
  { key: "subscriptions",label: "Subscriptions",icon: FaClipboardList },
  { key: "notifications",label: "Notifications",icon: FaBell },
  { key: "appearance",   label: "Appearance",   icon: FaPalette },
  { key: "maintenance",  label: "Maintenance",  icon: FaTools },
  { key: "about",        label: "About",        icon: FaInfoCircle },
];

/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL (inline — matches project pattern)
   ═══════════════════════════════════════════════════════════ */
function ConfirmModal({ open, title, message, confirmLabel = "Confirm", confirmVariant = "danger", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS TOGGLE
   ═══════════════════════════════════════════════════════════ */
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS ROW
   ═══════════════════════════════════════════════════════════ */
function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>}
      </div>
      <div className="sm:w-64 flex-shrink-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AdminSettings() {
  const admin = useAdmin();
  const {
    apiBase, setApiBase, adminToken, adminMe, apiFetch,
    setAdminToken, setAdminMe, logout, setUi, loadOrgs, loadUsers,
    orgs, users, darkMode
  } = admin;
  const { toggleDarkMode } = useOutletContext();

  const [activeTab, setActiveTab] = useState("general");
  const [busy, setBusy] = useState(false);

  /* ─── Connection ─── */
  const [healthStatus, setHealthStatus] = useState({ state: "idle", message: "", latency: null });

  /* ─── Auth (for when not logged in) ─── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [bootstrapResult, setBootstrapResult] = useState(null);

  /* ─── Security ─── */
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(() => loadSetting(SETTINGS_KEYS.SESSION_TIMEOUT_MINS, 60));
  const [enforceEmailVerify, setEnforceEmailVerify] = useState(() => loadSetting(SETTINGS_KEYS.ENFORCE_EMAIL_VERIFY, false));

  /* ─── Governance ─── */
  const [maxUsersPerOrg, setMaxUsersPerOrg] = useState(() => loadSetting(SETTINGS_KEYS.MAX_USERS_PER_ORG, 50));
  const [autoSuspendDays, setAutoSuspendDays] = useState(() => loadSetting(SETTINGS_KEYS.AUTO_SUSPEND_INACTIVE, 0));
  const [governanceLog, setGovernanceLog] = useState(() => loadSetting(SETTINGS_KEYS.GOVERNANCE_LOG, []));

  /* ─── Subscriptions ─── */
  const [defaultTier, setDefaultTier] = useState(() => loadSetting(SETTINGS_KEYS.DEFAULT_TIER, "free"));
  const [trialDays, setTrialDays] = useState(() => loadSetting(SETTINGS_KEYS.TRIAL_DAYS, 14));

  /* ─── Notifications ─── */
  const [adminNotifEmail, setAdminNotifEmail] = useState(() => loadSetting(SETTINGS_KEYS.ADMIN_NOTIF_EMAIL, ""));
  const [notifChannels, setNotifChannels] = useState(() => loadSetting(SETTINGS_KEYS.NOTIF_CHANNELS, { email: true, sms: false, internal: true }));

  /* ─── Maintenance ─── */
  const [maintenanceMode, setMaintenanceMode] = useState(() => loadSetting(SETTINGS_KEYS.MAINTENANCE_MODE, false));
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", action: null, variant: "danger" });

  /* ─── Platform Stats (for General tab) ─── */
  const [platformStats, setPlatformStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  /* ═══════ Helpers ═══════ */
  const wrap = async (fn) => {
    setBusy(true); setUi(s => ({...s, error: "", ok: ""}));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  /* Save setting + show confirmation */
  const saveAndNotify = (key, value, label) => {
    saveSetting(key, value);
    logGovernanceAction(`Updated ${label}`);
    setUi({ loading: false, error: "", ok: `${label} updated successfully` });
  };

  /* Governance audit log */
  const logGovernanceAction = useCallback((action) => {
    const entry = { action, by: adminMe?.user?.email || "system", at: new Date().toISOString() };
    setGovernanceLog(prev => {
      const newLog = [entry, ...prev].slice(0, 100); // Keep last 100
      saveSetting(SETTINGS_KEYS.GOVERNANCE_LOG, newLog);
      return newLog;
    });
  }, [adminMe]);

  /* ═══════ Connection ═══════ */
  const checkHealth = async () => {
    const base = String(apiBase || "http://127.0.0.1:8000").replace(/\/$/, "");
    const url = `${base}/api/health`;
    setHealthStatus({ state: "checking", message: `Checking ${url}...`, latency: null });
    const start = performance.now();
    try {
      const res = await fetch(url, { method: "GET" });
      const latency = Math.round(performance.now() - start);
      const text = await res.text();
      if (!res.ok) {
        setHealthStatus({ state: "bad", message: `HTTP ${res.status}: ${text.slice(0, 200)}`, latency });
      } else {
        setHealthStatus({ state: "good", message: `Backend is healthy (${latency}ms)`, latency });
      }
    } catch (e) {
      const latency = Math.round(performance.now() - start);
      setHealthStatus({ state: "bad", message: `Connection failed: ${String(e?.message || e)}`, latency });
    }
  };

  /* ═══════ Auth ═══════ */
  const signIn = () => wrap(async () => {
    const payload = await apiFetch("/auth/token/", {
      method: "POST",
      body: { username: loginEmail.trim(), password: loginPassword },
      tokenOverride: "",
    });
    const token = payload?.access || "";
    if (!token) throw new Error("No access token returned");
    const refresh = payload?.refresh || "";
    try { localStorage.setItem("conseqx_admin_access_token_v1", token); } catch {}
    if (refresh) try { localStorage.setItem("conseqx_admin_refresh_token_v1", refresh); } catch {}
    setAdminToken(token);
    const me = await apiFetch("/auth/me", { tokenOverride: token });
    if (!me?.user?.is_superuser) throw new Error("Access denied: Super Admin account required.");
    setAdminMe(me);
    await loadOrgs();
    await loadUsers();
    setLoginEmail(""); setLoginPassword("");
    setUi({ loading: false, error: "", ok: "Signed in successfully" });
  });

  const bootstrapDemo = () => wrap(async () => {
    const data = await apiFetch("/auth/demo-bootstrap-superadmin/", { method: "POST", tokenOverride: "" });
    setBootstrapResult(data?.demo || null);
    if (data?.demo?.username) {
      setLoginEmail(data.demo.username);
      setLoginPassword(data.demo.password || "DemoPass123!");
    }
    setUi({ loading: false, error: "", ok: "Demo Super Admin created. You can now sign in." });
  });

  /* ═══════ Security — Change Password ═══════ */
  const changePassword = () => wrap(async () => {
    if (newPassword !== confirmPassword) throw new Error("New passwords do not match");
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
    await apiFetch("/auth/change-password/", {
      method: "POST",
      body: { old_password: oldPassword, new_password: newPassword },
    });
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    logGovernanceAction("Changed admin password");
    setUi({ loading: false, error: "", ok: "Password changed successfully" });
  });

  /* ═══════ Platform Stats ═══════ */
  const loadPlatformStats = useCallback(async () => {
    if (!adminToken) return;
    setStatsLoading(true);
    try {
      const analytics = await apiFetch("/admin/analytics");
      setPlatformStats(analytics);
    } catch { setPlatformStats(null); }
    setStatsLoading(false);
  }, [adminToken, apiFetch]);

  useEffect(() => { if (activeTab === "general") loadPlatformStats(); }, [activeTab, loadPlatformStats]);

  /* ═══════ Maintenance Mode Toggle ═══════ */
  const handleMaintenanceToggle = (enabled) => {
    if (enabled) {
      setConfirmModal({
        open: true,
        title: "Enable Maintenance Mode?",
        message: "This will display a maintenance notice to all platform users. Admin access will remain available. Are you sure?",
        variant: "primary",
        action: () => {
          setMaintenanceMode(true);
          saveAndNotify(SETTINGS_KEYS.MAINTENANCE_MODE, true, "Maintenance Mode");
          setConfirmModal(c => ({ ...c, open: false }));
        },
      });
    } else {
      setMaintenanceMode(false);
      saveAndNotify(SETTINGS_KEYS.MAINTENANCE_MODE, false, "Maintenance Mode");
    }
  };

  /* ═══════ Data Management ═══════ */
  const clearAllCaches = () => {
    setConfirmModal({
      open: true,
      title: "Clear All Caches?",
      message: "This will clear all locally cached data including preferences, session caches, and temporary data. Your admin session will remain active.",
      variant: "danger",
      action: () => {
        const keysToKeep = ["conseqx_admin_access_token_v1", "conseqx_admin_refresh_token_v1", "conseqx_admin_api_base_v1", "darkMode"];
        const preserved = {};
        keysToKeep.forEach(k => { try { preserved[k] = localStorage.getItem(k); } catch {} });
        try { localStorage.clear(); } catch {}
        Object.entries(preserved).forEach(([k, v]) => { if (v !== null) try { localStorage.setItem(k, v); } catch {} });
        logGovernanceAction("Cleared all platform caches");
        setUi({ loading: false, error: "", ok: "All caches cleared successfully" });
        setConfirmModal(c => ({ ...c, open: false }));
      },
    });
  };

  const resetAllSettings = () => {
    setConfirmModal({
      open: true,
      title: "Reset All Settings to Defaults?",
      message: "This will restore all platform settings to their factory defaults. This action cannot be undone.",
      variant: "danger",
      action: () => {
        Object.values(SETTINGS_KEYS).forEach(k => { try { localStorage.removeItem(k); } catch {} });
        setMaintenanceMode(false);
        setDefaultTier("free");
        setTrialDays(14);
        setEnforceEmailVerify(false);
        setMaxUsersPerOrg(50);
        setAutoSuspendDays(0);
        setSessionTimeout(60);
        setAdminNotifEmail("");
        setNotifChannels({ email: true, sms: false, internal: true });
        logGovernanceAction("Reset all settings to defaults");
        setUi({ loading: false, error: "", ok: "All settings restored to defaults" });
        setConfirmModal(c => ({ ...c, open: false }));
      },
    });
  };

  const exportPlatformData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      exportedBy: adminMe?.user?.email || "unknown",
      platform: {
        environment: process.env.NODE_ENV,
        apiBase,
        framework: { frontend: "React 19 + Tailwind CSS", backend: "Django 6 + DRF", auth: "SimpleJWT" },
      },
      settings: {
        maintenanceMode: loadSetting(SETTINGS_KEYS.MAINTENANCE_MODE, false),
        defaultTier: loadSetting(SETTINGS_KEYS.DEFAULT_TIER, "free"),
        trialDays: loadSetting(SETTINGS_KEYS.TRIAL_DAYS, 14),
        enforceEmailVerification: loadSetting(SETTINGS_KEYS.ENFORCE_EMAIL_VERIFY, false),
        maxUsersPerOrg: loadSetting(SETTINGS_KEYS.MAX_USERS_PER_ORG, 50),
        autoSuspendInactiveDays: loadSetting(SETTINGS_KEYS.AUTO_SUSPEND_INACTIVE, 0),
        sessionTimeoutMins: loadSetting(SETTINGS_KEYS.SESSION_TIMEOUT_MINS, 60),
        notificationChannels: loadSetting(SETTINGS_KEYS.NOTIF_CHANNELS, {}),
      },
      stats: {
        totalOrganizations: orgs?.length || 0,
        totalUsers: users?.length || 0,
        activeOrgs: orgs?.filter(o => o.status === "active")?.length || 0,
        suspendedOrgs: orgs?.filter(o => o.status === "suspended")?.length || 0,
        bannedOrgs: orgs?.filter(o => o.status === "banned")?.length || 0,
      },
      governanceLog: governanceLog.slice(0, 50),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `conseqx-platform-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    logGovernanceAction("Exported platform data");
    setUi({ loading: false, error: "", ok: "Platform data exported" });
  };

  /* ═══════════════════════════════════════════════════════════
     TAB RENDERERS
     ═══════════════════════════════════════════════════════════ */

  /* ──────── GENERAL ──────── */
  const renderGeneral = () => {
    const activeOrgs = orgs?.filter(o => o.status === "active")?.length || 0;
    const suspendedOrgs = orgs?.filter(o => o.status === "suspended")?.length || 0;
    const bannedOrgs = orgs?.filter(o => o.status === "banned")?.length || 0;
    const premiumOrgs = orgs?.filter(o => o.subscription_tier === "premium")?.length || 0;

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Companies" value={orgs?.length || 0} icon={FaBuilding} />
          <StatCard label="Total Users" value={platformStats?.totals?.visitors ?? "—"} icon={FaUsers} />
          <StatCard label="Active Companies" value={activeOrgs} icon={FaCheckCircle} tone="good" />
          <StatCard label="Premium Tier" value={premiumOrgs} icon={FaClipboardList} tone="info" />
        </div>

        {/* Session Info */}
        <SectionCard title="Current Session">
          <div className="space-y-3">
            {adminToken ? (
              <>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCheckCircle className="text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Authenticated</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>Email: <span className="font-semibold text-gray-900 dark:text-gray-100">{adminMe?.user?.email || "—"}</span></div>
                    <div>Username: <span className="font-semibold text-gray-900 dark:text-gray-100">{adminMe?.user?.username || "—"}</span></div>
                    <div>Role: <span className="font-semibold text-gray-900 dark:text-gray-100">{adminMe?.user?.is_superuser ? "Super Admin" : "Staff"}</span></div>
                    {adminMe?.org && <div>Organization: <span className="font-semibold text-gray-900 dark:text-gray-100">{adminMe.org.name || "—"}</span></div>}
                    <div>Last Login: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatDateTime(adminMe?.user?.last_login) || "—"}</span></div>
                    <div>Date Joined: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatDateTime(adminMe?.user?.date_joined) || "—"}</span></div>
                  </div>
                </div>
                <Btn variant="danger" onClick={logout} className="w-full">
                  <FaSignOutAlt size={12} className="mr-2" /> Sign Out
                </Btn>
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="flex items-center gap-2">
                  <FaTimesCircle className="text-amber-500" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">No Active Session</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Navigate to the Connection tab to sign in</div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Platform Health Summary */}
        <SectionCard title="Platform Health Summary" actions={
          <Btn size="sm" onClick={loadPlatformStats} disabled={statsLoading}>
            <FaSync size={10} className={`mr-1.5 ${statsLoading ? "animate-spin" : ""}`} /> Refresh
          </Btn>
        }>
          {platformStats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{platformStats?.totals?.visitors || 0}</div>
                <div className="text-[10px] uppercase font-medium text-gray-500">Users</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{platformStats?.totals?.visitor_assessments || 0}</div>
                <div className="text-[10px] uppercase font-medium text-gray-500">Assessments</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{platformStats?.totals?.uploads || 0}</div>
                <div className="text-[10px] uppercase font-medium text-gray-500">Uploads</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{platformStats?.totals?.jobs || 0}</div>
                <div className="text-[10px] uppercase font-medium text-gray-500">Jobs</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{platformStats?.totals?.notifications || 0}</div>
                <div className="text-[10px] uppercase font-medium text-gray-500">Notifications</div>
              </div>
            </div>
          ) : (
            <EmptyState message={statsLoading ? "Loading platform analytics..." : "Connect to backend to view platform stats"} />
          )}
        </SectionCard>

        {/* Governance Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Suspended Orgs" value={suspendedOrgs} icon={FaExclamationTriangle} tone={suspendedOrgs > 0 ? "warn" : "good"} />
          <StatCard label="Banned Orgs" value={bannedOrgs} icon={FaTimesCircle} tone={bannedOrgs > 0 ? "bad" : "good"} />
          <StatCard label="Maintenance Mode" value={maintenanceMode ? "ON" : "OFF"} icon={FaTools} tone={maintenanceMode ? "warn" : "good"} />
        </div>
      </div>
    );
  };

  /* ──────── CONNECTION ──────── */
  const renderConnection = () => (
    <div className="space-y-6">
      <SectionCard title="Backend Connection">
        <div className="space-y-4">
          <SettingRow label="API Base URL" description="The root URL for the Django backend API server">
            <Input value={apiBase} onChange={setApiBase} placeholder="http://127.0.0.1:8000" />
          </SettingRow>

          <div className="flex items-center gap-3">
            <Btn variant="primary" disabled={healthStatus.state === "checking"} onClick={checkHealth}>
              <FaHeartbeat size={12} className="mr-2" /> Check Connection
            </Btn>
            {healthStatus.state !== "idle" && (
              <Pill tone={healthStatus.state === "good" ? "good" : healthStatus.state === "checking" ? "warn" : "bad"}>
                {healthStatus.state === "good" ? `Healthy${healthStatus.latency ? ` · ${healthStatus.latency}ms` : ""}` : healthStatus.state === "checking" ? "Checking..." : "Unreachable"}
              </Pill>
            )}
          </div>

          {healthStatus.message && healthStatus.state !== "idle" && (
            <div className={`rounded-lg border p-3 text-xs ${
              healthStatus.state === "good" 
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                : healthStatus.state === "bad"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}>
              {healthStatus.message}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Sign In (only when not authenticated) */}
      {!adminToken && (
        <SectionCard title="Admin Authentication">
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300">
              <FaExclamationTriangle className="inline mr-1.5" size={11} />
              You must sign in with a Django Super Admin account to access admin features.
            </div>
            <Input value={loginEmail} onChange={setLoginEmail} placeholder="Admin email (username)" />
            <Input value={loginPassword} onChange={setLoginPassword} type="password" placeholder="Password" />
            <Btn variant="primary" disabled={busy || !loginEmail.trim() || !loginPassword} onClick={signIn} className="w-full">
              <FaKey size={12} className="mr-2" /> Sign In
            </Btn>
          </div>
        </SectionCard>
      )}

      {/* Demo Bootstrap (only when not authenticated) */}
      {!adminToken && (
        <SectionCard title="Demo Bootstrap (Local Development)">
          <div className="space-y-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Create a demo Super Admin account. Only available on localhost with Django <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">DEBUG=True</code>.
            </p>
            <div className="flex gap-2">
              <Btn variant="primary" disabled={busy} onClick={bootstrapDemo} className="flex-1">
                <FaServer size={12} className="mr-2" /> Create Demo Admin
              </Btn>
              <Btn disabled={busy} onClick={() => { setLoginEmail("demo.superadmin@example.com"); setLoginPassword("DemoPass123!"); }} className="flex-1">
                Fill Demo Credentials
              </Btn>
            </div>
            {bootstrapResult && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                <FaCheckCircle className="inline mr-1.5" size={11} />
                Created: <span className="font-semibold">{bootstrapResult.username}</span>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );

  /* ──────── SECURITY ──────── */
  const renderSecurity = () => (
    <div className="space-y-6">
      <SectionCard title="Authentication & Tokens">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          <SettingRow label="Token Status" description="JWT access token for API authentication">
            <Pill tone={adminToken ? "good" : "warn"} className="text-sm">{adminToken ? "Active" : "No Token"}</Pill>
          </SettingRow>
          <SettingRow label="Authentication Method" description="Token-based authentication protocol">
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">JWT (SimpleJWT)</span>
          </SettingRow>
          <SettingRow label="Token Type" description="Bearer token in Authorization header">
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">Bearer</span>
          </SettingRow>
          <div className="py-3">
            <Toggle
              enabled={enforceEmailVerify}
              onChange={(v) => { setEnforceEmailVerify(v); saveAndNotify(SETTINGS_KEYS.ENFORCE_EMAIL_VERIFY, v, "Email Verification Enforcement"); }}
              label="Enforce Email Verification"
              description="Require users to verify their email address before accessing the platform"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Session Management">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          <SettingRow label="Session Timeout (minutes)" description="Automatically sign out inactive admin sessions after this duration">
            <div className="flex items-center gap-2">
              <Input
                value={String(sessionTimeout)}
                onChange={(v) => {
                  const n = parseInt(v) || 0;
                  setSessionTimeout(n);
                }}
                placeholder="60"
              />
              <Btn size="sm" variant="primary" onClick={() => saveAndNotify(SETTINGS_KEYS.SESSION_TIMEOUT_MINS, sessionTimeout, "Session Timeout")}>
                Save
              </Btn>
            </div>
          </SettingRow>
        </div>
      </SectionCard>

      {adminToken && (
        <SectionCard title="Change Password">
          <div className="space-y-3">
            <Input value={oldPassword} onChange={setOldPassword} type="password" placeholder="Current password" />
            <Input value={newPassword} onChange={setNewPassword} type="password" placeholder="New password (min 8 chars)" />
            <Input value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Confirm new password" />
            <Btn
              variant="primary"
              disabled={busy || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              onClick={changePassword}
              className="w-full"
            >
              <FaLock size={12} className="mr-2" /> Update Password
            </Btn>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="text-xs text-red-500">Passwords do not match</div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );

  /* ──────── GOVERNANCE ──────── */
  const renderGovernance = () => (
    <div className="space-y-6">
      <SectionCard title="Organization Governance Policies">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          <SettingRow label="Max Users Per Organization" description="Maximum number of users allowed in a single organization (0 = unlimited)">
            <div className="flex items-center gap-2">
              <Input
                value={String(maxUsersPerOrg)}
                onChange={(v) => setMaxUsersPerOrg(parseInt(v) || 0)}
                placeholder="50"
              />
              <Btn size="sm" variant="primary" onClick={() => saveAndNotify(SETTINGS_KEYS.MAX_USERS_PER_ORG, maxUsersPerOrg, "Max Users Per Org")}>
                Save
              </Btn>
            </div>
          </SettingRow>
          <SettingRow label="Auto-Suspend Inactive (days)" description="Automatically suspend organizations inactive for this many days (0 = disabled)">
            <div className="flex items-center gap-2">
              <Input
                value={String(autoSuspendDays)}
                onChange={(v) => setAutoSuspendDays(parseInt(v) || 0)}
                placeholder="0"
              />
              <Btn size="sm" variant="primary" onClick={() => saveAndNotify(SETTINGS_KEYS.AUTO_SUSPEND_INACTIVE, autoSuspendDays, "Auto-Suspend Policy")}>
                Save
              </Btn>
            </div>
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Governance Policy Notice">
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-indigo-500" size={16} />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Platform Governance Framework</span>
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
            <p><strong>Suspension:</strong> Temporarily restricts access. The organization/user retains all data and can be restored at any time by a Super Admin.</p>
            <p><strong>Ban:</strong> Permanently restricts access with a documented reason. Can only be reversed by a Super Admin with justification.</p>
            <p><strong>No Deletion:</strong> Organizations and users are never permanently deleted from the platform. This ensures audit compliance and data integrity.</p>
            <p><strong>Audit Trail:</strong> All governance actions are logged with timestamp, actor, and reason for accountability.</p>
          </div>
        </div>
      </SectionCard>

      {/* Audit Log */}
      <SectionCard title="Governance Audit Log" actions={
        governanceLog.length > 0 && (
          <Btn size="sm" onClick={() => {
            setConfirmModal({
              open: true,
              title: "Clear Audit Log?",
              message: "This will permanently clear the governance audit log. This action cannot be undone.",
              variant: "danger",
              action: () => {
                setGovernanceLog([]);
                saveSetting(SETTINGS_KEYS.GOVERNANCE_LOG, []);
                setConfirmModal(c => ({ ...c, open: false }));
                setUi({ loading: false, error: "", ok: "Audit log cleared" });
              },
            });
          }}>
            <FaTrashAlt size={10} className="mr-1.5" /> Clear Log
          </Btn>
        )
      }>
        {governanceLog.length > 0 ? (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {governanceLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs">
                <FaHistory className="text-gray-400 mt-0.5 flex-shrink-0" size={11} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{entry.action}</span>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {entry.by} · {formatDateTime(entry.at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No governance actions recorded yet" />
        )}
      </SectionCard>
    </div>
  );

  /* ──────── SUBSCRIPTIONS ──────── */
  const renderSubscriptions = () => {
    const freeOrgs = orgs?.filter(o => o.subscription_tier === "free")?.length || 0;
    const premiumOrgs = orgs?.filter(o => o.subscription_tier === "premium")?.length || 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Companies" value={orgs?.length || 0} icon={FaBuilding} />
          <StatCard label="Free Tier" value={freeOrgs} icon={FaUsers} />
          <StatCard label="Premium Tier" value={premiumOrgs} icon={FaClipboardList} tone="good" />
        </div>

        <SectionCard title="Subscription Defaults">
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
            <SettingRow label="Default Subscription Tier" description="The tier assigned to newly registered organizations">
              <div className="flex items-center gap-2">
                <select
                  value={defaultTier}
                  onChange={(e) => setDefaultTier(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
                <Btn size="sm" variant="primary" onClick={() => saveAndNotify(SETTINGS_KEYS.DEFAULT_TIER, defaultTier, "Default Subscription Tier")}>
                  Save
                </Btn>
              </div>
            </SettingRow>
            <SettingRow label="Trial Period (days)" description="Number of days for premium trial access before reverting to free tier">
              <div className="flex items-center gap-2">
                <Input
                  value={String(trialDays)}
                  onChange={(v) => setTrialDays(parseInt(v) || 0)}
                  placeholder="14"
                />
                <Btn size="sm" variant="primary" onClick={() => saveAndNotify(SETTINGS_KEYS.TRIAL_DAYS, trialDays, "Trial Period")}>
                  Save
                </Btn>
              </div>
            </SettingRow>
          </div>
        </SectionCard>

        <SectionCard title="Subscription Tier Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Tier */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FaUsers className="text-gray-500" size={14} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Free Tier</div>
                  <div className="text-[10px] text-gray-500">{freeOrgs} organizations</div>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Basic assessment access</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Single system analysis</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Standard reports</li>
                <li className="flex items-center gap-2"><FaTimesCircle className="text-gray-400" size={10} /> Advanced analytics</li>
                <li className="flex items-center gap-2"><FaTimesCircle className="text-gray-400" size={10} /> Partner dashboard</li>
              </ul>
            </div>
            {/* Premium Tier */}
            <div className="rounded-lg border border-indigo-200 dark:border-indigo-700 p-4 bg-indigo-50/30 dark:bg-indigo-900/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <FaClipboardList className="text-indigo-600 dark:text-indigo-400" size={14} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Premium Tier</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400">{premiumOrgs} organizations</div>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Full assessment suite</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> All six systems analysis</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Advanced AI analytics</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Partner intelligence dashboard</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-500" size={10} /> Priority support</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  };

  /* ──────── NOTIFICATIONS ──────── */
  const renderNotifications = () => (
    <div className="space-y-6">
      <SectionCard title="Admin Notification Preferences">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          <SettingRow label="Admin Notification Email" description="Primary email address for receiving platform alerts and reports">
            <div className="flex items-center gap-2">
              <Input
                value={adminNotifEmail}
                onChange={setAdminNotifEmail}
                placeholder="admin@company.com"
              />
              <Btn size="sm" variant="primary" onClick={() => saveAndNotify(SETTINGS_KEYS.ADMIN_NOTIF_EMAIL, adminNotifEmail, "Admin Notification Email")}>
                Save
              </Btn>
            </div>
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Default Notification Channels">
        <div className="space-y-1">
          <Toggle
            enabled={notifChannels.email}
            onChange={(v) => {
              const updated = { ...notifChannels, email: v };
              setNotifChannels(updated);
              saveAndNotify(SETTINGS_KEYS.NOTIF_CHANNELS, updated, "Email Notifications");
            }}
            label="Email Notifications"
            description="Send notifications via email to organization members"
          />
          <Toggle
            enabled={notifChannels.sms}
            onChange={(v) => {
              const updated = { ...notifChannels, sms: v };
              setNotifChannels(updated);
              saveAndNotify(SETTINGS_KEYS.NOTIF_CHANNELS, updated, "SMS Notifications");
            }}
            label="SMS Notifications"
            description="Send notifications via SMS (requires SMS gateway configuration)"
          />
          <Toggle
            enabled={notifChannels.internal}
            onChange={(v) => {
              const updated = { ...notifChannels, internal: v };
              setNotifChannels(updated);
              saveAndNotify(SETTINGS_KEYS.NOTIF_CHANNELS, updated, "Internal Notifications");
            }}
            label="Internal Notifications"
            description="Display in-app notification alerts to users on the platform"
          />
        </div>
      </SectionCard>

      <SectionCard title="Notification Delivery Info">
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 text-xs text-blue-700 dark:text-blue-300 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <FaInfoCircle size={13} /> Channel Configuration
          </div>
          <p><strong>Email:</strong> Uses the configured SMTP backend in Django settings. Ensure <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-800">EMAIL_BACKEND</code> and SMTP credentials are set.</p>
          <p><strong>SMS:</strong> Requires integration with an SMS gateway (e.g., Twilio). Configure in Django settings.</p>
          <p><strong>Internal:</strong> Built-in notification system. Notifications appear in the platform's notification center.</p>
        </div>
      </SectionCard>
    </div>
  );

  /* ──────── APPEARANCE ──────── */
  const renderAppearance = () => (
    <div className="space-y-6">
      <SectionCard title="Theme & Display">
        <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dark Mode</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark color themes</div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                darkMode
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {darkMode ? <FaMoon size={14} /> : <FaSun size={14} />}
              {darkMode ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Theme Preview */}
      <SectionCard title="Theme Preview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Color Palette</div>
            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-1 text-center">
                <div className="h-8 rounded-lg bg-indigo-600" />
                <div className="text-[10px] text-gray-500">Primary</div>
              </div>
              <div className="space-y-1 text-center">
                <div className="h-8 rounded-lg bg-emerald-500" />
                <div className="text-[10px] text-gray-500">Success</div>
              </div>
              <div className="space-y-1 text-center">
                <div className="h-8 rounded-lg bg-amber-500" />
                <div className="text-[10px] text-gray-500">Warning</div>
              </div>
              <div className="space-y-1 text-center">
                <div className="h-8 rounded-lg bg-red-500" />
                <div className="text-[10px] text-gray-500">Danger</div>
              </div>
              <div className="space-y-1 text-center">
                <div className="h-8 rounded-lg bg-blue-500" />
                <div className="text-[10px] text-gray-500">Info</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Component Samples</div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="good">Active</Pill>
              <Pill tone="warn">Suspended</Pill>
              <Pill tone="bad">Banned</Pill>
              <Pill tone="info">Premium</Pill>
              <Pill>Default</Pill>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" size="sm">Primary</Btn>
              <Btn variant="success" size="sm">Success</Btn>
              <Btn variant="danger" size="sm">Danger</Btn>
              <Btn size="sm">Secondary</Btn>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  /* ──────── MAINTENANCE ──────── */
  const renderMaintenance = () => (
    <div className="space-y-6">
      <SectionCard title="Platform Maintenance">
        <div className="space-y-4">
          {maintenanceMode && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" size={16} />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Maintenance Mode is Active</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Platform users will see a maintenance notice. Admin panel remains accessible.
              </p>
            </div>
          )}
          <Toggle
            enabled={maintenanceMode}
            onChange={handleMaintenanceToggle}
            label="Maintenance Mode"
            description="Display a maintenance notice to all platform users while performing updates or repairs"
          />
        </div>
      </SectionCard>

      <SectionCard title="Data Management">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Btn onClick={clearAllCaches} className="flex-1">
              <FaTrashAlt size={12} className="mr-2" /> Clear All Caches
            </Btn>
            <Btn onClick={exportPlatformData} className="flex-1">
              <FaDownload size={12} className="mr-2" /> Export Platform Data
            </Btn>
            <Btn variant="danger" onClick={resetAllSettings} className="flex-1">
              <FaSync size={12} className="mr-2" /> Reset All to Defaults
            </Btn>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>Clear Caches:</strong> Removes locally cached data. Does not affect your admin session or server data.</p>
            <p><strong>Export:</strong> Downloads a JSON snapshot of platform settings, statistics, and governance log.</p>
            <p><strong>Reset:</strong> Restores all configurable settings to their factory default values.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Storage Information">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          <SettingRow label="Local Storage Usage" description="Browser localStorage usage for admin settings">
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {(() => { try { let total = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); total += (k?.length || 0) + (localStorage.getItem(k)?.length || 0); } return `${(total / 1024).toFixed(1)} KB`; } catch { return "N/A"; } })()}
            </span>
          </SettingRow>
          <SettingRow label="Settings Keys" description="Number of platform-managed settings stored locally">
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {Object.values(SETTINGS_KEYS).filter(k => { try { return localStorage.getItem(k) !== null; } catch { return false; } }).length} / {Object.keys(SETTINGS_KEYS).length}
            </span>
          </SettingRow>
          <SettingRow label="Database Backend" description="Server-side data persistence layer">
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">Django + SQLite</span>
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );

  /* ──────── ABOUT ──────── */
  const renderAbout = () => (
    <div className="space-y-6">
      <SectionCard title="Platform Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaCog size={14} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Environment</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">NODE_ENV</span><Pill>{process.env.NODE_ENV || "—"}</Pill></div>
              <div className="flex justify-between"><span className="text-gray-500">USE_API</span><Pill>{process.env.REACT_APP_USE_API || "false"}</Pill></div>
              <div className="flex justify-between"><span className="text-gray-500">API Base</span><Pill>{process.env.REACT_APP_API_BASE_URL || "—"}</Pill></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaDatabase size={14} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Storage & Auth</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Auth</span><span className="font-mono text-gray-700 dark:text-gray-300">JWT (SimpleJWT)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Admin Token</span><Pill tone={adminToken ? "good" : "warn"}>{adminToken ? "present" : "absent"}</Pill></div>
              <div className="flex justify-between"><span className="text-gray-500">Backend DB</span><span className="font-mono text-gray-700 dark:text-gray-300">SQLite</span></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaServer size={14} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Framework</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Frontend</span><span className="font-mono text-gray-700 dark:text-gray-300">React 19 + Tailwind</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Backend</span><span className="font-mono text-gray-700 dark:text-gray-300">Django 6 + DRF</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Auth</span><span className="font-mono text-gray-700 dark:text-gray-300">SimpleJWT</span></div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="ConseQ-X Assessment Platform">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <img src={Logo3D} alt="ConseQ-X" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100">ConseQ-X</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">CEO Assessment & Organizational Health Platform</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mt-3">
            <p>ConseQ-X is a comprehensive organizational health assessment platform that evaluates six critical systems:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {admin.CANONICAL_SYSTEMS.map(sys => (
                <div key={sys.key} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-medium">{sys.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Admin Panel Information">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800 text-xs">
          <SettingRow label="Platform Version" description="Current release version">
            <Pill tone="info">v1.0.0</Pill>
          </SettingRow>
          <SettingRow label="Admin Panel" description="Super Admin management dashboard">
            <span className="font-mono text-gray-700 dark:text-gray-300">SuperAdminShell v2</span>
          </SettingRow>
          <SettingRow label="Admin Pages" description="Available admin management modules">
            <span className="font-mono text-gray-700 dark:text-gray-300">8 modules</span>
          </SettingRow>
          <SettingRow label="License" description="Platform licensing">
            <span className="font-mono text-gray-700 dark:text-gray-300">Proprietary</span>
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     TAB RENDERER MAP
     ═══════════════════════════════════════════════════════════ */
  const tabRenderers = {
    general: renderGeneral,
    connection: renderConnection,
    security: renderSecurity,
    governance: renderGovernance,
    subscriptions: renderSubscriptions,
    notifications: renderNotifications,
    appearance: renderAppearance,
    maintenance: renderMaintenance,
    about: renderAbout,
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform configuration, security, governance policies, and system management
        </p>
      </div>

      {/* Maintenance Mode Banner */}
      {maintenanceMode && (
        <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-amber-500 flex-shrink-0" size={20} />
          <div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-300">Maintenance Mode Active</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">Platform users are seeing a maintenance notice. Go to Maintenance tab to disable.</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 -mb-px min-w-max">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div>
        {tabRenderers[activeTab]?.() || <EmptyState message="Tab not found" />}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Confirm"
        confirmVariant={confirmModal.variant}
        onConfirm={() => confirmModal.action?.()}
        onCancel={() => setConfirmModal(c => ({ ...c, open: false }))}
      />
    </div>
  );
}
