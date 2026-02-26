import React, { useMemo, useState } from "react";
import {
  useAdmin, SectionCard, Btn, Pill, StatCard,
  EmptyState, formatDate, formatDateTime,
} from "./SuperAdminShell";
import {
  FaSyncAlt, FaBuilding, FaSearch, FaDownload, FaCrown,
  FaCheckCircle, FaBan, FaPauseCircle,
  FaExclamationTriangle, FaUndoAlt, FaEnvelope,
  FaInfoCircle, FaShieldAlt, FaBell,
  FaChevronDown, FaChevronUp, FaTimes, FaUsers,
} from "react-icons/fa";

/* ═══════════════════════════════════════
   Constants
   ═══════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: "name-asc",    label: "Name A → Z" },
  { value: "name-desc",   label: "Name Z → A" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc",  label: "Oldest first" },
  { value: "tier-asc",    label: "Tier A → Z" },
];

const STATUS_FILTERS = [
  { value: "all",       label: "All statuses" },
  { value: "active",    label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned",    label: "Banned" },
];

const TIER_FILTERS = [
  { value: "all",     label: "All tiers" },
  { value: "free",    label: "Free" },
  { value: "premium", label: "Premium" },
];

const STATUS_PILL = {
  active:    { tone: "good", icon: FaCheckCircle, label: "Active" },
  suspended: { tone: "warn", icon: FaPauseCircle, label: "Suspended" },
  banned:    { tone: "bad",  icon: FaBan,         label: "Banned" },
};

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
export default function AdminCompanies() {
  const admin = useAdmin();
  const { orgs, users, apiFetch, loadOrgs, setUi } = admin;

  /* ─── Local state ─── */
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter]     = useState("all");
  const [sortBy, setSortBy]             = useState("created-desc");
  const [busy, setBusy]                 = useState(false);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [expandedId, setExpandedId]     = useState(null);
  const [detailTab, setDetailTab]       = useState("info");

  /* Governance form */
  const [govAction, setGovAction]       = useState("");
  const [govReason, setGovReason]       = useState("");

  /* Notification form */
  const [notifSubject, setNotifSubject] = useState("");
  const [notifBody, setNotifBody]       = useState("");
  const [notifChannel, setNotifChannel] = useState("internal");

  /* Confirmation modal */
  const [confirmModal, setConfirmModal] = useState(null);

  /* ─── Summary stats ─── */
  const totalOrgs     = orgs.length;
  const activeOrgs    = orgs.filter(o => (o.status || "active") === "active").length;
  const suspendedOrgs = orgs.filter(o => o.status === "suspended").length;
  const bannedOrgs    = orgs.filter(o => o.status === "banned").length;
  const premiumOrgs   = orgs.filter(o => o.subscription_tier === "premium").length;
  const freeOrgs      = totalOrgs - premiumOrgs;

  /* ─── User count per org (for table column) ─── */
  const userCountByOrg = useMemo(() => {
    const counts = {};
    users.forEach(u => {
      const oid = String(u.orgId || u.org_id || "");
      if (oid) counts[oid] = (counts[oid] || 0) + 1;
    });
    return counts;
  }, [users]);

  /* ─── Filtering + Sorting ─── */
  const filtered = useMemo(() => {
    let list = [...orgs];

    if (statusFilter !== "all") list = list.filter(o => (o.status || "active") === statusFilter);
    if (tierFilter !== "all")   list = list.filter(o => o.subscription_tier === tierFilter);

    const q = search.trim().toLowerCase();
    if (q) list = list.filter(o =>
      (o.name || "").toLowerCase().includes(q) ||
      (o.slug || "").toLowerCase().includes(q) ||
      String(o.id).toLowerCase().includes(q)
    );

    const [field, dir] = sortBy.split("-");
    list.sort((a, b) => {
      let cmp = 0;
      if (field === "name")    cmp = (a.name || "").localeCompare(b.name || "");
      if (field === "created") cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (field === "tier")    cmp = (a.subscription_tier || "").localeCompare(b.subscription_tier || "");
      return dir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [orgs, search, statusFilter, tierFilter, sortBy]);

  /* ─── Helpers ─── */
  const wrap = async (fn) => {
    setBusy(true);
    setUi(s => ({ ...s, error: "", ok: "" }));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  /* ─── Governance Actions ─── */
  const changeOrgStatus = (orgId, newStatus, reason = "") => {
    const labels  = { suspended: "Suspend", banned: "Ban", active: "Restore" };
    const icons   = { suspended: FaPauseCircle, banned: FaBan, active: FaUndoAlt };
    const colors  = { suspended: "warn", banned: "danger", active: "success" };
    const warnings = {
      suspended: "This will immediately suspend the company. All associated users will lose platform access until restored. Active sessions will be terminated.",
      banned:    "This will permanently ban this company from the platform. All users under this organization will be locked out indefinitely. This is a serious governance action.",
      active:    "This will restore full access for the company and all its associated users.",
    };
    setConfirmModal({
      title: `${labels[newStatus]} Company`,
      message: warnings[newStatus],
      variant: colors[newStatus],
      icon: icons[newStatus],
      confirmLabel: `Yes, ${labels[newStatus]} Company`,
      onConfirm: () => { setConfirmModal(null); wrap(async () => {
        await apiFetch(`/orgs/${orgId}`, { method: "PATCH", body: { status: newStatus, status_reason: reason } });
        await loadOrgs();
        setGovAction(""); setGovReason("");
        setUi({ loading: false, error: "", ok: `Company ${labels[newStatus].toLowerCase()}ed successfully` });
      }); },
    });
  };

  /* ─── Send Notification ─── */
  const sendNotification = (orgIds) => wrap(async () => {
    if (!notifSubject.trim() || !notifBody.trim()) { setUi({ loading: false, error: "Subject and body are required", ok: "" }); return; }
    await apiFetch("/admin/send-notification", { method: "POST", body: { org_ids: orgIds, subject: notifSubject.trim(), body: notifBody.trim(), channel: notifChannel } });
    setNotifSubject("");
    setNotifBody("");
    setUi({ loading: false, error: "", ok: `Notification sent to ${Array.isArray(orgIds) && orgIds[0] === "all" ? "all companies" : orgIds.length + " company(ies)"}` });
  });

  /* ─── Bulk Actions ─── */
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(o => String(o.id))));
  };

  const bulkStatusChange = (newStatus) => {
    if (!selectedIds.size) return;
    const labels = { active: "restore", suspended: "suspend", banned: "ban" };
    const icons  = { suspended: FaPauseCircle, banned: FaBan, active: FaUndoAlt };
    const colors = { suspended: "warn", banned: "danger", active: "success" };
    const count  = selectedIds.size;
    setConfirmModal({
      title: `Bulk ${labels[newStatus]?.charAt(0).toUpperCase() + labels[newStatus]?.slice(1)} — ${count} Companies`,
      message: `You are about to ${labels[newStatus]} ${count} company(ies). ${newStatus !== "active" ? "All users across these organizations will lose platform access immediately." : "All users will regain access."}`,
      variant: colors[newStatus],
      icon: icons[newStatus],
      confirmLabel: `${labels[newStatus]?.charAt(0).toUpperCase() + labels[newStatus]?.slice(1)} ${count} Companies`,
      onConfirm: () => { setConfirmModal(null); wrap(async () => {
        await Promise.allSettled(
          [...selectedIds].map(id => apiFetch(`/orgs/${id}`, { method: "PATCH", body: { status: newStatus, status_reason: `Bulk ${labels[newStatus]} by SuperAdmin` } }))
        );
        setSelectedIds(new Set());
        await loadOrgs();
        setUi({ loading: false, error: "", ok: `${count} companies ${labels[newStatus]}ed` });
      }); },
    });
  };

  const bulkNotify = () => {
    if (!selectedIds.size) return;
    setDetailTab("notify");
    setExpandedId("__bulk__");
  };

  /* ─── CSV export ─── */
  const exportCSV = () => {
    const rows = [["ID", "Name", "Slug", "Tier", "Status", "Status Reason", "Created"]];
    filtered.forEach(o => {
      rows.push([o.id, o.name, o.slug, o.subscription_tier, o.status || "active", o.status_reason || "", formatDate(o.created_at)]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `companies-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  /* ─── Get expanded org ─── */
  const expandedOrg = expandedId && expandedId !== "__bulk__" ? orgs.find(o => String(o.id) === expandedId) : null;

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Companies</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Govern company accounts — monitor status, enforce policies, and communicate
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn onClick={() => wrap(() => loadOrgs())} disabled={busy}>
            <FaSyncAlt size={11} className={`mr-1.5 ${busy ? "animate-spin" : ""}`} /> Refresh
          </Btn>
          <Btn onClick={exportCSV} variant="secondary">
            <FaDownload size={11} className="mr-1.5" /> Export CSV
          </Btn>
        </div>
      </div>

      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total"      value={totalOrgs}     icon={FaBuilding} />
        <StatCard label="Active"     value={activeOrgs}    icon={FaCheckCircle}  tone="good" />
        <StatCard label="Suspended"  value={suspendedOrgs} icon={FaPauseCircle}  tone={suspendedOrgs > 0 ? "warn" : undefined} />
        <StatCard label="Banned"     value={bannedOrgs}    icon={FaBan}          tone={bannedOrgs > 0 ? "bad" : undefined} />
        <StatCard label="Premium"    value={premiumOrgs}   icon={FaCrown}        tone="info" />
        <StatCard label="Free"       value={freeOrgs}      icon={FaBuilding} />
      </div>

      {/* ─── Filters & Search ─── */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug, or ID..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {STATUS_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {TIER_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {totalOrgs} companies
        </div>
      </SectionCard>

      {/* ─── Bulk Actions ─── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40">
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{selectedIds.size} selected</span>
          <div className="h-5 w-px bg-indigo-200 dark:bg-indigo-700" />
          <Btn size="sm" variant="success" onClick={() => bulkStatusChange("active")} disabled={busy}>
            <FaUndoAlt size={10} className="mr-1" /> Restore
          </Btn>
          <Btn size="sm" onClick={() => bulkStatusChange("suspended")} disabled={busy}>
            <FaPauseCircle size={10} className="mr-1" /> Suspend
          </Btn>
          <Btn size="sm" variant="danger" onClick={() => bulkStatusChange("banned")} disabled={busy}>
            <FaBan size={10} className="mr-1" /> Ban
          </Btn>
          <div className="h-5 w-px bg-indigo-200 dark:bg-indigo-700" />
          <Btn size="sm" onClick={bulkNotify} disabled={busy}>
            <FaEnvelope size={10} className="mr-1" /> Notify Selected
          </Btn>
          <div className="h-5 w-px bg-indigo-200 dark:bg-indigo-700" />
          <Btn size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Btn>
        </div>
      )}

      {/* ─── Bulk Notification Panel ─── */}
      {expandedId === "__bulk__" && detailTab === "notify" && (
        <SectionCard title={`Send Notification to ${selectedIds.size} Companies`}
          actions={<button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-gray-600"><FaTimes size={14} /></button>}>
          <NotificationForm
            subject={notifSubject} setSubject={setNotifSubject}
            body={notifBody} setBody={setNotifBody}
            channel={notifChannel} setChannel={setNotifChannel}
            busy={busy}
            onSend={() => sendNotification([...selectedIds])}
          />
        </SectionCard>
      )}

      {/* ─── Company Table ─── */}
      <SectionCard title={`Company Directory (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState message="No companies match your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-2 text-left w-8">
                    <input type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Users</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(o => {
                  const orgId = String(o.id);
                  const st = STATUS_PILL[o.status || "active"] || STATUS_PILL.active;
                  const isExpanded = expandedId === orgId;

                  return (
                    <React.Fragment key={orgId}>
                      <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? "bg-indigo-50/40 dark:bg-indigo-900/10" : ""}`}>
                        <td className="py-2.5 px-2">
                          <input type="checkbox"
                            checked={selectedIds.has(orgId)}
                            onChange={() => toggleSelect(orgId)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 flex-shrink-0">
                              {(o.name || "C")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{o.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{o.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Pill tone={o.subscription_tier === "premium" ? "info" : "neutral"}>
                            {o.subscription_tier === "premium" && <FaCrown size={8} className="mr-1" />}
                            {o.subscription_tier}
                          </Pill>
                        </td>
                        <td className="py-2.5 px-3">
                          <Pill tone={st.tone}><st.icon size={8} className="mr-1" />{st.label}</Pill>
                        </td>
                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <FaUsers size={10} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{userCountByOrg[orgId] || 0}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(o.created_at)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => { setExpandedId(isExpanded ? null : orgId); setDetailTab("info"); setGovAction(""); setGovReason(""); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="View details"
                          >
                            {isExpanded ? <FaChevronUp size={12} className="text-indigo-500" /> : <FaChevronDown size={12} className="text-gray-400" />}
                          </button>
                        </td>
                      </tr>

                      {/* ─── Expanded Detail Panel ─── */}
                      {isExpanded && expandedOrg && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="bg-gray-50 dark:bg-gray-800/30 border-t border-b border-gray-200 dark:border-gray-700 p-5">
                              {/* Tab nav */}
                              <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
                                {[
                                  { key: "info",    label: "Company Info",  icon: FaInfoCircle },
                                  { key: "users",   label: "Users",         icon: FaUsers },
                                  { key: "govern",  label: "Governance",    icon: FaShieldAlt },
                                  { key: "notify",  label: "Notify",        icon: FaBell },
                                ].map(tab => (
                                  <button key={tab.key}
                                    onClick={() => setDetailTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                                      detailTab === tab.key
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}>
                                    <tab.icon size={11} /> {tab.label}
                                  </button>
                                ))}
                              </div>

                              {/* ─── INFO TAB (read-only) ─── */}
                              {detailTab === "info" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <ReadOnlyField label="Company Name" value={expandedOrg.name} />
                                  <ReadOnlyField label="Slug" value={expandedOrg.slug} />
                                  <ReadOnlyField label="ID" value={String(expandedOrg.id)} />
                                  <ReadOnlyField label="Subscription Tier" value={expandedOrg.subscription_tier} />
                                  <ReadOnlyField label="Subscription Expires" value={expandedOrg.subscription_expires_at ? formatDateTime(expandedOrg.subscription_expires_at) : "N/A"} />
                                  <ReadOnlyField label="Status" value={expandedOrg.status || "active"} />
                                  <ReadOnlyField label="Status Reason" value={expandedOrg.status_reason || "—"} />
                                  <ReadOnlyField label="Status Changed" value={expandedOrg.status_changed_at ? formatDateTime(expandedOrg.status_changed_at) : "—"} />
                                  <ReadOnlyField label="Status Changed By" value={expandedOrg.status_changed_by || "—"} />
                                  <ReadOnlyField label="Created" value={formatDateTime(expandedOrg.created_at)} />
                                </div>
                              )}

                              {/* ─── USERS TAB ─── */}
                              {detailTab === "users" && (() => {
                                const companyUsers = users.filter(u => String(u.orgId || u.org_id || "") === orgId && !u.is_superuser);
                                return (
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Company Users ({companyUsers.length})
                                      </h4>
                                    </div>
                                    {companyUsers.length === 0 ? (
                                      <EmptyState message="No users registered under this company" />
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Phone</th>
                                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Last Login</th>
                                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Joined</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {companyUsers.map(cu => {
                                              const cuStatus = cu.profile_status || "active";
                                              const cuSt = STATUS_PILL[cuStatus] || STATUS_PILL.active;
                                              return (
                                                <tr key={cu.id} className="hover:bg-white/50 dark:hover:bg-gray-800/50">
                                                  <td className="py-2 px-3">
                                                    <div className="flex items-center gap-2">
                                                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                        {(cu.first_name || cu.email || "U")[0].toUpperCase()}
                                                      </div>
                                                      <div>
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                                                          {`${cu.first_name || ""} ${cu.last_name || ""}`.trim() || "\u2014"}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{cu.email}</div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="py-2 px-3">
                                                    <Pill tone={cuSt.tone}><cuSt.icon size={8} className="mr-1" />{cuSt.label}</Pill>
                                                  </td>
                                                  <td className="py-2 px-3 hidden md:table-cell">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{cu.phone || "\u2014"}</span>
                                                  </td>
                                                  <td className="py-2 px-3 hidden md:table-cell">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{cu.last_login ? formatDateTime(cu.last_login) : "Never"}</span>
                                                  </td>
                                                  <td className="py-2 px-3 hidden lg:table-cell">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(cu.date_joined)}</span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* ─── GOVERNANCE TAB ─── */}
                              {detailTab === "govern" && (
                                <div className="space-y-5">
                                  {/* Quick actions */}
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {(expandedOrg.status || "active") !== "active" && (
                                        <Btn size="sm" variant="success" onClick={() => changeOrgStatus(orgId, "active", "Restored by SuperAdmin")} disabled={busy}>
                                          <FaUndoAlt size={10} className="mr-1" /> Restore to Active
                                        </Btn>
                                      )}
                                      {(expandedOrg.status || "active") !== "suspended" && (
                                        <Btn size="sm" onClick={() => setGovAction("suspend")} disabled={busy}>
                                          <FaPauseCircle size={10} className="mr-1" /> Suspend
                                        </Btn>
                                      )}
                                      {(expandedOrg.status || "active") !== "banned" && (
                                        <Btn size="sm" variant="danger" onClick={() => setGovAction("ban")} disabled={busy}>
                                          <FaBan size={10} className="mr-1" /> Ban Permanently
                                        </Btn>
                                      )}
                                    </div>
                                  </div>

                                  {/* Reason form (shown when suspend/ban selected) */}
                                  {(govAction === "suspend" || govAction === "ban") && (
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                      <h4 className="text-sm font-bold mb-2 capitalize">{govAction} Company</h4>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {govAction === "suspend"
                                          ? "Temporarily restrict access. All users will be deactivated."
                                          : "Permanently ban this company. All users will be deactivated."}
                                      </p>
                                      <textarea
                                        placeholder="Reason for action (required for audit trail)..."
                                        value={govReason} onChange={(e) => setGovReason(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 mb-3"
                                      />
                                      <div className="flex gap-2">
                                        <Btn size="sm" variant={govAction === "ban" ? "danger" : "primary"}
                                          onClick={() => changeOrgStatus(orgId, govAction === "ban" ? "banned" : "suspended", govReason)}
                                          disabled={busy || !govReason.trim()}>
                                          Confirm {govAction === "ban" ? "Ban" : "Suspension"}
                                        </Btn>
                                        <Btn size="sm" onClick={() => { setGovAction(""); setGovReason(""); }}>Cancel</Btn>
                                      </div>
                                    </div>
                                  )}

                                  {/* Policy notice */}
                                  <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 p-4 bg-amber-50/50 dark:bg-amber-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaExclamationTriangle size={12} className="text-amber-500" />
                                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">Governance Policy</h4>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                      Company deletion is not permitted. To restrict a company, use <strong>Suspend</strong> (temporary) or <strong>Ban</strong> (permanent). Banned companies retain their data for audit purposes but all users lose access.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* ─── NOTIFY TAB ─── */}
                              {detailTab === "notify" && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Send a notification or email to {expandedOrg.name}</p>
                                  <NotificationForm
                                    subject={notifSubject} setSubject={setNotifSubject}
                                    body={notifBody} setBody={setNotifBody}
                                    channel={notifChannel} setChannel={setNotifChannel}
                                    busy={busy}
                                    onSend={() => sendNotification([orgId])}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      {/* ─── Confirmation Modal ─── */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          variant={confirmModal.variant}
          icon={confirmModal.icon}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════ */

/* ─── Confirmation Modal ─── */
function ConfirmModal({ title, message, variant = "danger", icon: Icon, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const ring = { danger: "ring-red-500/20", warn: "ring-amber-500/20", success: "ring-green-500/20" }[variant] || "ring-indigo-500/20";
  const iconBg = { danger: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", warn: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", success: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" }[variant] || "bg-indigo-100 text-indigo-600";
  const btnClass = { danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500", warn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500", success: "bg-green-600 hover:bg-green-700 focus:ring-green-500" }[variant] || "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  const FallbackIcon = FaExclamationTriangle;
  const DisplayIcon = Icon || FallbackIcon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      {/* Panel */}
      <div className={`relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ${ring} overflow-hidden animate-in`}>
        {/* Top accent bar */}
        <div className={`h-1.5 w-full ${{ danger: "bg-red-500", warn: "bg-amber-500", success: "bg-green-500" }[variant] || "bg-indigo-500"}`} />
        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <DisplayIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
          </div>
          {/* Warning box */}
          <div className={`rounded-lg border p-3.5 mb-5 ${{ danger: "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10", warn: "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10", success: "border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-900/10" }[variant] || "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"}`}>
            <div className="flex items-start gap-2">
              <FaExclamationTriangle size={13} className={`mt-0.5 flex-shrink-0 ${{ danger: "text-red-500", warn: "text-amber-500", success: "text-green-500" }[variant] || "text-gray-500"}`} />
              <p className={`text-sm leading-relaxed ${{ danger: "text-red-700 dark:text-red-300", warn: "text-amber-700 dark:text-amber-300", success: "text-green-700 dark:text-green-300" }[variant] || "text-gray-700 dark:text-gray-300"}`}>{message}</p>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${btnClass}`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.animate-in{animation:modalIn .2s ease-out}`}</style>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 select-all">{value}</div>
    </div>
  );
}

function NotificationForm({ subject, setSubject, body, setBody, channel, setChannel, busy, onSend }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Subject</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Notification subject..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Channel</label>
        <select value={channel} onChange={(e) => setChannel(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
          <option value="internal">Internal Notification</option>
          <option value="email">Email</option>
        </select>
      </div>
      <Btn onClick={onSend} variant="primary" disabled={busy || !subject.trim() || !body.trim()}>
        <FaEnvelope size={11} className="mr-1.5" /> Send Notification
      </Btn>
    </div>
  );
}
