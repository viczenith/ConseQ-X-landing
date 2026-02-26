import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAdmin, SectionCard, StatCard, Pill, Btn, EmptyState } from "./SuperAdminShell";
import {
  FaBuilding, FaUsers, FaClipboardList, FaCloudUploadAlt,
  FaCogs, FaBell, FaHeartbeat, FaSyncAlt, FaCrown,
  FaCheckCircle, FaPauseCircle, FaBan,
  FaTrophy,
} from "react-icons/fa";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════
   Simple Sparkline bar chart component
   ═══════════════════════════════════════ */
function MiniBarChart({ data = [], label = "", color = "indigo" }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const colorCls = {
    indigo:  "bg-indigo-500 dark:bg-indigo-400",
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber:   "bg-amber-500 dark:bg-amber-400",
    blue:    "bg-blue-500 dark:bg-blue-400",
  };

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{label}</div>
      <div className="flex items-end gap-1 h-20">
        {data.length === 0 ? (
          <div className="text-xs text-gray-400 italic self-center w-full text-center">No data</div>
        ) : data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.month}: ${d.count}`}>
            <div
              className={`w-full rounded-t ${colorCls[color] || colorCls.indigo} transition-all`}
              style={{ height: `${Math.max((d.count / max) * 100, 4)}%`, minHeight: 2 }}
            />
            <span className="text-[8px] text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">{d.month?.slice(5) || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
export default function AdminOverview() {
  const admin = useAdmin();
  const { orgs, users, apiFetch, loadOrgs, loadUsers, setUi } = admin;
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await apiFetch("/admin/analytics");
      setAnalytics(data);
    } catch { /* ignore */ }
  }, [apiFetch]);

  useEffect(() => {
    if (!admin.adminToken) return;
    let live = true;
    (async () => {
      setLoading(true);
      try {
        await loadAnalytics();
      } catch { /* ignore */ }
      if (live) setLoading(false);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin.adminToken]);

  const refresh = async () => {
    setLoading(true);
    try {
      await loadOrgs();
      await loadUsers();
      await loadAnalytics();
      setUi({ loading: false, error: "", ok: "Refreshed" });
    } catch (e) {
      setUi({ loading: false, error: String(e?.message || e), ok: "" });
    }
    setLoading(false);
  };

  /* Computed from analytics */
  const totals = analytics?.totals || {};
  const statusBd = analytics?.status_breakdown || {};
  const tierBd = analytics?.tier_breakdown || {};
  const topCompanies = analytics?.top_active_companies || [];

  /* Expiring soon from orgs */
  const expiringSoonOrgs = useMemo(() => {
    const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return orgs.filter(o => {
      if (!o.subscription_expires_at) return false;
      const exp = new Date(o.subscription_expires_at).getTime();
      return exp > Date.now() && exp < thirtyDays;
    });
  }, [orgs]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Platform Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Global health, growth analytics, and activity metrics</p>
        </div>
        <Btn onClick={refresh} disabled={loading} variant="secondary">
          <FaSyncAlt size={12} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Btn>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Companies"     value={totals.companies ?? orgs.length}  icon={FaBuilding} />
        <StatCard label="Users"         value={totals.visitors ?? "—"}            icon={FaUsers} />
        <StatCard label="Assessments"   value={totals.visitor_assessments ?? "—"} icon={FaClipboardList} />
        <StatCard label="Uploads"       value={totals.uploads ?? "—"}             icon={FaCloudUploadAlt} />
        <StatCard label="Jobs"          value={totals.jobs ?? "—"}                icon={FaCogs} />
        <StatCard label="Notifications" value={totals.notifications ?? "—"}       icon={FaBell} />
      </div>

      {/* Status & Tier Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Breakdown */}
        <SectionCard title="Company Status">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><FaCheckCircle className="text-emerald-500" /> Active</div>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{statusBd.active ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><FaPauseCircle className="text-amber-500" /> Suspended</div>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{statusBd.suspended ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><FaBan className="text-red-500" /> Banned</div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{statusBd.banned ?? 0}</span>
            </div>
            {/* Progress bar */}
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mt-2">
              {(statusBd.active ?? 0) > 0 && <div className="bg-emerald-500" style={{ width: `${((statusBd.active ?? 0) / Math.max(orgs.length, 1)) * 100}%` }} />}
              {(statusBd.suspended ?? 0) > 0 && <div className="bg-amber-500" style={{ width: `${((statusBd.suspended ?? 0) / Math.max(orgs.length, 1)) * 100}%` }} />}
              {(statusBd.banned ?? 0) > 0 && <div className="bg-red-500" style={{ width: `${((statusBd.banned ?? 0) / Math.max(orgs.length, 1)) * 100}%` }} />}
            </div>
          </div>
        </SectionCard>

        {/* Tier Breakdown */}
        <SectionCard title="Subscription Tiers">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><FaCrown className="text-blue-500" /> Premium</div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{tierBd.premium ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><FaBuilding className="text-gray-500" /> Free</div>
              <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{tierBd.free ?? 0}</span>
            </div>
            {/* Progress bar */}
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mt-2">
              {(tierBd.premium ?? 0) > 0 && <div className="bg-blue-500" style={{ width: `${((tierBd.premium ?? 0) / Math.max(orgs.length, 1)) * 100}%` }} />}
              {(tierBd.free ?? 0) > 0 && <div className="bg-gray-400" style={{ width: `${((tierBd.free ?? 0) / Math.max(orgs.length, 1)) * 100}%` }} />}
            </div>
          </div>
        </SectionCard>

        {/* Expiring Soon */}
        <SectionCard title="Expiring Soon">
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{expiringSoonOrgs.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">subscriptions expiring within 30 days</div>
          {expiringSoonOrgs.length > 0 ? (
            <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
              {expiringSoonOrgs.map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate mr-2">{o.name}</span>
                  <Pill tone="warn">{new Date(o.subscription_expires_at).toLocaleDateString()}</Pill>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-xs text-gray-400">No impending expirations</div>
          )}
        </SectionCard>
      </div>

      {/* Growth Charts */}
      <SectionCard title="Platform Growth (Last 12 Months)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniBarChart data={analytics?.company_growth || []} label="New Companies" color="indigo" />
          <MiniBarChart data={analytics?.visitor_growth || []} label="New Users" color="emerald" />
          <MiniBarChart data={analytics?.assessment_activity || []} label="Assessments" color="blue" />
          <MiniBarChart data={analytics?.upload_activity || []} label="Uploads" color="amber" />
        </div>
      </SectionCard>

      {/* Top Active Companies */}
      <SectionCard title="Top Active Companies">
        {topCompanies.length === 0 ? (
          <EmptyState message="No activity data yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Users</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessments</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploads</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {topCompanies.map((c, i) => {
                  const stTone = c.status === "active" ? "good" : c.status === "suspended" ? "warn" : c.status === "banned" ? "bad" : "neutral";
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2 px-3 text-xs font-bold text-gray-400">{i + 1}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.slug}</div>
                      </td>
                      <td className="py-2 px-3"><Pill tone={stTone}>{c.status || "active"}</Pill></td>
                      <td className="py-2 px-3">
                        <Pill tone={c.tier === "premium" ? "info" : "neutral"}>
                          {c.tier === "premium" && <FaCrown size={8} className="mr-1" />}{c.tier}
                        </Pill>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">{c.users}</td>
                      <td className="py-2 px-3 text-right font-medium">{c.assessments}</td>
                      <td className="py-2 px-3 text-right font-medium">{c.uploads}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          <FaTrophy size={10} /> {c.activity_score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Quick Links */}
      <SectionCard title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/admin/companies" className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FaBuilding size={14} className="text-indigo-500" /> Manage Companies
          </Link>
          <Link to="/admin/users" className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FaUsers size={14} className="text-indigo-500" /> Manage Users
          </Link>
          <Link to="/admin/notifications" className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FaBell size={14} className="text-indigo-500" /> Notifications
          </Link>
          <Link to="/admin/simulator" className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FaHeartbeat size={14} className="text-indigo-500" /> Impact Simulator
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
