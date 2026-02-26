import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  useAdmin, SectionCard, Btn, Pill, StatCard,
  EmptyState, formatDate, formatDateTime,
} from "./SuperAdminShell";
import {
  FaSyncAlt, FaSearch, FaDownload, FaUsers,
  FaUserCheck,
  FaCheckCircle, FaBan,
  FaExclamationTriangle, FaPauseCircle,
  FaChevronDown, FaChevronUp, FaBuilding,
  FaInfoCircle, FaShieldAlt,
  FaCalendarCheck, FaSignInAlt,
  FaClipboardList, FaComments, FaEnvelope,
  FaGlobe, FaDesktop,
} from "react-icons/fa";

/* ═══════════════════════════════════════
   Constants
   ═══════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first" },
  { value: "oldest",     label: "Oldest first" },
  { value: "name-asc",   label: "Organization A → Z" },
  { value: "name-desc",  label: "Organization Z → A" },
  { value: "email-asc",  label: "Email A → Z" },
  { value: "email-desc", label: "Email Z → A" },
  { value: "assessments-desc", label: "Most assessments" },
];

const STATUS_FILTERS = [
  { value: "all",        label: "All statuses" },
  { value: "new",        label: "New" },
  { value: "contacted",  label: "Contacted" },
  { value: "converted",  label: "Converted" },
  { value: "dismissed",  label: "Dismissed" },
  { value: "suspended",  label: "Suspended" },
  { value: "banned",     label: "Banned" },
];

const PERIOD_FILTERS = [
  { value: "all",     label: "All time" },
  { value: "today",   label: "Today" },
  { value: "week",    label: "This week" },
  { value: "month",   label: "This month" },
  { value: "quarter", label: "This quarter" },
];

const STATUS_PILL_MAP = {
  new:        { tone: "info",    icon: FaUserCheck,     label: "New" },
  contacted:  { tone: "good",    icon: FaEnvelope,      label: "Contacted" },
  converted:  { tone: "good",    icon: FaCheckCircle,   label: "Converted" },
  dismissed:  { tone: "neutral", icon: FaBan,           label: "Dismissed" },
  suspended:  { tone: "warn",    icon: FaPauseCircle,   label: "Suspended" },
  banned:     { tone: "bad",     icon: FaBan,           label: "Banned" },
};

/* helper: period boundary */
function periodStart(period) {
  const d = new Date();
  if (period === "today") return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (period === "week")  { const s = new Date(d); s.setDate(d.getDate() - d.getDay()); s.setHours(0,0,0,0); return s; }
  if (period === "month") return new Date(d.getFullYear(), d.getMonth(), 1);
  if (period === "quarter") { const qm = Math.floor(d.getMonth() / 3) * 3; return new Date(d.getFullYear(), qm, 1); }
  return new Date(0);
}

/* ═══════════════════════════════════════
   COMPONENT — Assessment User Management
   (Shows visitors who filled the Client
    Information form on the assessment page)
   ═══════════════════════════════════════ */
export default function AdminUsers() {
  const admin = useAdmin();
  const { apiFetch, setUi } = admin;

  /* ─── Visitor state ─── */
  const [visitors, setVisitors]         = useState([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortBy, setSortBy]             = useState("newest");
  const [busy, setBusy]                 = useState(false);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [expandedId, setExpandedId]     = useState(null);
  const [detailTab, setDetailTab]       = useState("profile");
  const [expandedReport, setExpandedReport] = useState(null);

  /* Status update form */
  const [newStatus, setNewStatus]   = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  /* Confirmation modal */
  const [confirmModal, setConfirmModal] = useState(null);

  /* ─── Load visitors from backend ─── */
  const loadVisitors = useCallback(async () => {
    setBusy(true);
    try {
      const data = await apiFetch("/admin/visitors");
      setVisitors(Array.isArray(data) ? data : []);
    } catch (e) {
      setUi(s => ({ ...s, error: String(e?.message || e) }));
    } finally {
      setBusy(false);
    }
  }, [apiFetch, setUi]);

  useEffect(() => { loadVisitors(); }, [loadVisitors]);

  /* ─── Summary stats ─── */
  const total          = visitors.length;
  const newCount       = visitors.filter(v => v.status === "new").length;
  const contactedCount = visitors.filter(v => v.status === "contacted").length;
  const convertedCount = visitors.filter(v => v.status === "converted").length;
  const dismissedCount = visitors.filter(v => v.status === "dismissed").length;
  const suspendedCount = visitors.filter(v => v.status === "suspended").length;
  const bannedCount    = visitors.filter(v => v.status === "banned").length;
  const withAssessments = visitors.filter(v => (v.assessment_count || 0) > 0).length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = visitors.filter(v => new Date(v.created_at) >= monthStart).length;

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const activeRecently = visitors.filter(v => v.updated_at && new Date(v.updated_at) >= weekAgo).length;

  /* ─── Unique organizations count ─── */
  const uniqueOrgs = useMemo(() => {
    const set = new Set(visitors.map(v => (v.organization_name || "").trim().toLowerCase()).filter(Boolean));
    return set.size;
  }, [visitors]);

  /* ─── Filtering + Sorting ─── */
  const filtered = useMemo(() => {
    let list = [...visitors];

    if (statusFilter !== "all") list = list.filter(v => v.status === statusFilter);

    if (periodFilter !== "all") {
      const cutoff = periodStart(periodFilter);
      list = list.filter(v => new Date(v.created_at) >= cutoff);
    }

    const q = search.trim().toLowerCase();
    if (q) list = list.filter(v =>
      (v.email || "").toLowerCase().includes(q) ||
      (v.organization_name || "").toLowerCase().includes(q) ||
      (v.name || "").toLowerCase().includes(q) ||
      (v.role || "").toLowerCase().includes(q)
    );

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === "oldest") return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortBy === "name-asc") return (a.organization_name || "").localeCompare(b.organization_name || "");
      if (sortBy === "name-desc") return (b.organization_name || "").localeCompare(a.organization_name || "");
      if (sortBy === "email-asc") return (a.email || "").localeCompare(b.email || "");
      if (sortBy === "email-desc") return (b.email || "").localeCompare(a.email || "");
      if (sortBy === "assessments-desc") return (b.assessment_count || 0) - (a.assessment_count || 0);
      return 0;
    });
    return list;
  }, [visitors, search, statusFilter, periodFilter, sortBy]);

  /* ─── Helpers ─── */
  const wrap = async (fn) => {
    setBusy(true);
    setUi(s => ({ ...s, error: "", ok: "" }));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  /* ─── Status change ─── */
  const changeVisitorStatus = (visitorId, status, notes = "") => {
    const labels = { new: "Mark as New", contacted: "Mark as Contacted", converted: "Convert", dismissed: "Dismiss", suspended: "Suspend", banned: "Ban" };
    const variants = { suspended: "warn", banned: "danger", dismissed: "warn" };
    setConfirmModal({
      title: `${labels[status] || status} — User`,
      message: status === "banned" ? `Permanently ban this user? They will be blocked from all platform access.`
             : status === "suspended" ? `Suspend this user? Their access will be temporarily restricted.`
             : `Change this user's status to "${status}"?`,
      variant: variants[status] || "success",
      icon: STATUS_PILL_MAP[status]?.icon || FaCheckCircle,
      confirmLabel: labels[status] || `Set to ${status}`,
      onConfirm: () => { setConfirmModal(null); wrap(async () => {
        await apiFetch(`/admin/visitors/${visitorId}`, { method: "PATCH", body: { status, notes } });
        await loadVisitors();
        setNewStatus(""); setStatusNotes("");
        setUi({ loading: false, error: "", ok: `User status updated to "${status}"` });
      }); },
    });
  };

  /* ─── Bulk status change ─── */
  const bulkStatusChange = (status) => {
    if (!selectedIds.size) return;
    const count = selectedIds.size;
    setConfirmModal({
      title: `Bulk Update — ${count} Users`,
      message: `Set ${count} user(s) status to "${status}"?`,
      variant: "warn",
      icon: FaExclamationTriangle,
      confirmLabel: `Update ${count} Users`,
      onConfirm: () => { setConfirmModal(null); wrap(async () => {
        await Promise.allSettled(
          [...selectedIds].map(id => apiFetch(`/admin/visitors/${id}`, { method: "PATCH", body: { status } }))
        );
        setSelectedIds(new Set());
        await loadVisitors();
        setUi({ loading: false, error: "", ok: `${count} users updated` });
      }); },
    });
  };

  /* ─── Toggle selections ─── */
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(v => String(v.id))));
  };

  /* ─── CSV export ─── */
  const exportCSV = () => {
    const rows = [["ID", "Email", "Name", "Organization", "Role", "Status", "Assessments", "Last Assessment", "First Visit", "Last Active", "IP Address", "Browser / Device"]];
    filtered.forEach(v => {
      rows.push([
        v.id, v.email || "", v.name || "", v.organization_name || "",
        v.role || "", v.status || "new", v.assessment_count || 0,
        v.last_assessment_at ? formatDateTime(v.last_assessment_at) : "Never",
        formatDate(v.created_at), v.updated_at ? formatDateTime(v.updated_at) : "—",
        v.ip_address || "—", v.user_agent || "—",
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `assessment-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  /* ─── Expanded user ─── */
  const expandedUser = expandedId ? visitors.find(v => String(v.id) === expandedId) : null;

  /* ─── Date helpers ─── */
  const accountAge = (dateStr) => {
    if (!dateStr) return "—";
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days < 1) return "Today";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  };

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Assessment Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            All users who entered their information on the assessment page — track engagement, assessments &amp; follow-ups
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn onClick={() => wrap(() => loadVisitors())} disabled={busy}>
            <FaSyncAlt size={11} className={`mr-1.5 ${busy ? "animate-spin" : ""}`} /> Refresh
          </Btn>
          <Btn onClick={exportCSV} variant="secondary">
            <FaDownload size={11} className="mr-1.5" /> Export CSV
          </Btn>
        </div>
      </div>

      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        <StatCard label="Total Users"       value={total}            icon={FaUsers} />
        <StatCard label="Organizations"     value={uniqueOrgs}       icon={FaBuilding}      tone="info" />
        <StatCard label="New"               value={newCount}         icon={FaUserCheck}     tone={newCount > 0 ? "good" : undefined} />
        <StatCard label="Contacted"         value={contactedCount}   icon={FaEnvelope}      tone="info" />
        <StatCard label="Converted"         value={convertedCount}   icon={FaCheckCircle}   tone="good" />
        <StatCard label="Dismissed"         value={dismissedCount}   icon={FaBan}           tone={dismissedCount > 0 ? "warn" : undefined} />
        <StatCard label="Suspended"         value={suspendedCount}   icon={FaPauseCircle}   tone={suspendedCount > 0 ? "warn" : undefined} />
        <StatCard label="Banned"            value={bannedCount}      icon={FaBan}           tone={bannedCount > 0 ? "bad" : undefined} />
        <StatCard label="With Assessments"  value={withAssessments}  icon={FaClipboardList} tone="info" />
        <StatCard label="New (month)"       value={newThisMonth}     icon={FaCalendarCheck} tone={newThisMonth > 0 ? "good" : undefined} />
      </div>

      {/* ─── Quick Insights ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaClipboardList size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Assessment Rate</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {total ? Math.round((withAssessments / total) * 100) : 0}%
              </div>
              <div className="text-[10px] text-gray-400">Users who completed at least 1 assessment</div>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FaCalendarCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Growth (This Month)</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">+{newThisMonth}</div>
              <div className="text-[10px] text-gray-400">New assessment users</div>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FaSignInAlt size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Active (7 days)</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{activeRecently}</div>
              <div className="text-[10px] text-gray-400">Users active in the last week</div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ─── Filters & Search ─── */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, organization, or role..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {STATUS_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {PERIOD_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {total} assessment users
        </div>
      </SectionCard>

      {/* ─── Bulk Actions ─── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40">
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{selectedIds.size} selected</span>
          <div className="h-5 w-px bg-indigo-200 dark:bg-indigo-700" />
          <Btn size="sm" variant="success" onClick={() => bulkStatusChange("contacted")} disabled={busy}>
            <FaEnvelope size={10} className="mr-1" /> Mark Contacted
          </Btn>
          <Btn size="sm" variant="success" onClick={() => bulkStatusChange("converted")} disabled={busy}>
            <FaCheckCircle size={10} className="mr-1" /> Convert
          </Btn>
          <Btn size="sm" onClick={() => bulkStatusChange("dismissed")} disabled={busy}>
            <FaBan size={10} className="mr-1" /> Dismiss
          </Btn>
          <Btn size="sm" variant="danger" onClick={() => bulkStatusChange("suspended")} disabled={busy}>
            <FaPauseCircle size={10} className="mr-1" /> Suspend
          </Btn>
          <Btn size="sm" variant="danger" onClick={() => bulkStatusChange("banned")} disabled={busy}>
            <FaBan size={10} className="mr-1" /> Ban
          </Btn>
          <div className="h-5 w-px bg-indigo-200 dark:bg-indigo-700" />
          <Btn size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Btn>
        </div>
      )}

      {/* ─── Users Table ─── */}
      <SectionCard title={`User Directory (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState message="No assessment users match your filters" />
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User / Organization</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessments</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">First Visit</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(v => {
                  const visitorId = String(v.id);
                  const st = STATUS_PILL_MAP[v.status] || STATUS_PILL_MAP.new;
                  const isExpanded = expandedId === visitorId;

                  return (
                    <React.Fragment key={visitorId}>
                      <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? "bg-indigo-50/40 dark:bg-indigo-900/10" : ""}`}>
                        <td className="py-2.5 px-2">
                          <input type="checkbox"
                            checked={selectedIds.has(visitorId)}
                            onChange={() => toggleSelect(visitorId)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                              {(v.organization_name || v.email || "U")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{v.organization_name || "—"}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{v.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{v.role || "—"}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <Pill tone={st.tone}><st.icon size={8} className="mr-1" />{st.label}</Pill>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${(v.assessment_count || 0) > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                            <FaClipboardList size={9} /> {v.assessment_count || 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(v.created_at)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => { setExpandedId(isExpanded ? null : visitorId); setDetailTab("profile"); setNewStatus(""); setStatusNotes(""); setExpandedReport(null); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="View details"
                          >
                            {isExpanded ? <FaChevronUp size={12} className="text-indigo-500" /> : <FaChevronDown size={12} className="text-gray-400" />}
                          </button>
                        </td>
                      </tr>

                      {/* ─── Expanded Detail Panel ─── */}
                      {isExpanded && expandedUser && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="bg-gray-50 dark:bg-gray-800/30 border-t border-b border-gray-200 dark:border-gray-700 p-5">

                              {/* Tab nav */}
                              <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
                                {[
                                  { key: "profile",     label: "Profile",       icon: FaInfoCircle },
                                  { key: "assessments", label: "Assessments",   icon: FaClipboardList },
                                  { key: "chat",        label: "Chat History",  icon: FaComments },
                                  { key: "manage",      label: "Manage",        icon: FaShieldAlt },
                                  { key: "governance",  label: "Governance",    icon: FaBan },
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

                              {/* ─── PROFILE TAB ─── */}
                              {detailTab === "profile" && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <ReadOnlyField label="Organization" value={expandedUser.organization_name || "—"} />
                                    <ReadOnlyField label="Name" value={expandedUser.name || "—"} />
                                    <ReadOnlyField label="Email" value={expandedUser.email} />
                                    <ReadOnlyField label="Role" value={expandedUser.role || "—"} />
                                    <ReadOnlyField label="Status" value={expandedUser.status || "new"} />
                                    <ReadOnlyField label="First Visit" value={formatDateTime(expandedUser.created_at)} />
                                    <ReadOnlyField label="Last Active" value={expandedUser.updated_at ? formatDateTime(expandedUser.updated_at) : "—"} />
                                    <ReadOnlyField label="Account Age" value={accountAge(expandedUser.created_at)} />
                                    <ReadOnlyField label="Total Assessments" value={String(expandedUser.assessment_count || 0)} />
                                    <ReadOnlyField label="Last Assessment" value={expandedUser.last_assessment_at ? formatDateTime(expandedUser.last_assessment_at) : "Never"} />
                                    <ReadOnlyField label="Systems Attempted" value={(expandedUser.systems_attempted || []).join(", ") || "None"} />
                                    <ReadOnlyField label="IP Address" value={expandedUser.ip_address || "—"} />
                                    <ReadOnlyField label="Browser / Device" value={expandedUser.user_agent || "—"} />
                                  </div>
                                  {expandedUser.notes && (
                                    <div className="mt-3">
                                      <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</div>
                                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">{expandedUser.notes}</div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ─── ASSESSMENTS TAB ─── */}
                              {detailTab === "assessments" && (
                                <div className="space-y-3">
                                  {(expandedUser.assessment_data || []).length === 0 ? (
                                    <EmptyState message="No assessments recorded yet" />
                                  ) : (
                                    <div className="space-y-3">
                                      {[...(expandedUser.assessment_data || [])].reverse().map((a, i) => (
                                        <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Assessment #{(expandedUser.assessment_data || []).length - i}</div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400">{a.date ? formatDateTime(a.date) : "—"}</div>
                                            </div>
                                            <Pill tone="info">
                                              {(a.systems_completed || []).length} system{(a.systems_completed || []).length !== 1 ? "s" : ""}
                                            </Pill>
                                          </div>
                                          {a.systems_completed && a.systems_completed.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                              {a.systems_completed.map(sys => (
                                                <span key={sys} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">{sys}</span>
                                              ))}
                                            </div>
                                          )}
                                          {a.scores && Object.keys(a.scores).length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                              {Object.entries(a.scores).map(([sysId, sysData]) => {
                                                const pct = sysData.maxSystemScore ? Math.round((sysData.systemScore / sysData.maxSystemScore) * 100) : 0;
                                                return (
                                                  <div key={sysId} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase truncate">{sysId.replace(/_/g, " ")}</div>
                                                    <div className={`text-lg font-bold ${pct >= 70 ? "text-green-600" : pct >= 40 ? "text-yellow-600" : "text-red-600"}`}>{pct}%</div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                          {a.analysis_summary && (() => {
                                            const aIdx = (expandedUser.assessment_data || []).length - i;
                                            const isOpen = expandedReport === aIdx;
                                            return (
                                              <div className="mt-3">
                                                <button
                                                  onClick={() => setExpandedReport(isOpen ? null : aIdx)}
                                                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                                >
                                                  {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                                                  {isOpen ? "Hide Report" : "View Full Report"}
                                                </button>
                                                {isOpen && (
                                                  <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 max-h-[500px] overflow-y-auto">
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                      <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                                        components={{
                                                          table: ({ node, ...props }) => (
                                                            <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                              <table className="min-w-full text-xs" {...props} />
                                                            </div>
                                                          ),
                                                          th: ({ node, ...props }) => (
                                                            <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" {...props} />
                                                          ),
                                                          td: ({ node, ...props }) => (
                                                            <td className="px-3 py-1.5 text-xs border-b border-gray-100 dark:border-gray-700" {...props} />
                                                          ),
                                                          h1: ({ node, ...props }) => <h1 className="text-base font-bold mt-3 mb-1" {...props} />,
                                                          h2: ({ node, ...props }) => <h2 className="text-sm font-bold mt-3 mb-1" {...props} />,
                                                          h3: ({ node, ...props }) => <h3 className="text-xs font-bold mt-2 mb-1" {...props} />,
                                                          p: ({ node, ...props }) => <p className="text-xs leading-relaxed mb-1.5" {...props} />,
                                                          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-xs space-y-0.5 mb-1.5" {...props} />,
                                                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-xs space-y-0.5 mb-1.5" {...props} />,
                                                          li: ({ node, ...props }) => <li className="text-xs leading-relaxed" {...props} />,
                                                          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                                          hr: () => <hr className="my-2 border-gray-200 dark:border-gray-600" />,
                                                          blockquote: ({ node, ...props }) => (
                                                            <blockquote className="border-l-3 border-gray-300 dark:border-gray-600 pl-3 my-1.5 text-xs italic text-gray-600 dark:text-gray-400" {...props} />
                                                          ),
                                                          code: ({ node, inline, ...props }) => (
                                                            inline
                                                              ? <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px] font-mono" {...props} />
                                                              : <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-[11px] font-mono overflow-x-auto my-1" {...props} />
                                                          ),
                                                        }}
                                                      >
                                                        {a.analysis_summary}
                                                      </ReactMarkdown>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ─── CHAT HISTORY TAB ─── */}
                              {detailTab === "chat" && (
                                <div className="space-y-2">
                                  {(expandedUser.chat_history || []).length === 0 ? (
                                    <EmptyState message="No chat history found" />
                                  ) : (
                                    <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                                      {(expandedUser.chat_history || []).map((msg, i) => {
                                        const isUser = msg.role === "user";
                                        return (
                                          <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[85%] rounded-2xl shadow-sm ${
                                              isUser
                                                ? "bg-indigo-600 text-white rounded-br-md"
                                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md"
                                            }`}>
                                              {/* Header */}
                                              <div className={`flex items-center gap-2 px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider ${
                                                isUser ? "text-indigo-200" : "text-gray-400 dark:text-gray-500"
                                              }`}>
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                                                  isUser
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                                                }`}>
                                                  {isUser ? "U" : "AI"}
                                                </span>
                                                <span>{isUser ? "User" : "X Ultra Assistant"}</span>
                                                {msg.timestamp && (
                                                  <span className="ml-auto font-normal">{new Date(msg.timestamp).toLocaleString()}</span>
                                                )}
                                              </div>
                                              {/* Body */}
                                              <div className={`px-4 pb-3 ${
                                                isUser
                                                  ? "text-sm leading-relaxed"
                                                  : "prose prose-sm dark:prose-invert max-w-none"
                                              }`}>
                                                {isUser ? (
                                                  <p className="whitespace-pre-wrap break-words m-0">{msg.text || ""}</p>
                                                ) : (
                                                  <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                                    components={{
                                                      table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                          <table className="min-w-full text-xs" {...props} />
                                                        </div>
                                                      ),
                                                      th: ({ node, ...props }) => (
                                                        <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" {...props} />
                                                      ),
                                                      td: ({ node, ...props }) => (
                                                        <td className="px-3 py-1.5 text-xs border-b border-gray-100 dark:border-gray-700" {...props} />
                                                      ),
                                                      h1: ({ node, ...props }) => <h1 className="text-base font-bold mt-3 mb-1" {...props} />,
                                                      h2: ({ node, ...props }) => <h2 className="text-sm font-bold mt-3 mb-1" {...props} />,
                                                      h3: ({ node, ...props }) => <h3 className="text-xs font-bold mt-2 mb-1" {...props} />,
                                                      p: ({ node, ...props }) => <p className="text-xs leading-relaxed mb-1.5" {...props} />,
                                                      ul: ({ node, ...props }) => <ul className="list-disc list-inside text-xs space-y-0.5 mb-1.5" {...props} />,
                                                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-xs space-y-0.5 mb-1.5" {...props} />,
                                                      li: ({ node, ...props }) => <li className="text-xs leading-relaxed" {...props} />,
                                                      strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                                      hr: () => <hr className="my-2 border-gray-200 dark:border-gray-600" />,
                                                      blockquote: ({ node, ...props }) => (
                                                        <blockquote className="border-l-3 border-gray-300 dark:border-gray-600 pl-3 my-1.5 text-xs italic text-gray-600 dark:text-gray-400" {...props} />
                                                      ),
                                                      code: ({ node, inline, ...props }) => (
                                                        inline
                                                          ? <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px] font-mono" {...props} />
                                                          : <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-[11px] font-mono overflow-x-auto my-1" {...props} />
                                                      ),
                                                    }}
                                                  >
                                                    {msg.text || ""}
                                                  </ReactMarkdown>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ─── MANAGE TAB ─── */}
                              {detailTab === "manage" && (
                                <div className="space-y-5">
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {["new", "contacted", "converted", "dismissed"].filter(s => s !== expandedUser.status).map(s => {
                                        const sp = STATUS_PILL_MAP[s] || {};
                                        return (
                                          <Btn key={s} size="sm" variant={s === "dismissed" ? undefined : "success"}
                                            onClick={() => changeVisitorStatus(visitorId, s)} disabled={busy}>
                                            {sp.icon && <sp.icon size={10} className="mr-1" />} Mark as {sp.label || s}
                                          </Btn>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                    <h4 className="text-sm font-bold mb-2">Update Status with Notes</h4>
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 mb-3">
                                      <option value="">Select new status...</option>
                                      {["new", "contacted", "converted", "dismissed", "suspended", "banned"].filter(s => s !== expandedUser.status).map(s => (
                                        <option key={s} value={s}>{(STATUS_PILL_MAP[s]?.label || s)}</option>
                                      ))}
                                    </select>
                                    <textarea
                                      placeholder="Notes (optional — visible in admin panel only)..."
                                      value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)}
                                      rows={3}
                                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 mb-3"
                                    />
                                    <div className="flex gap-2">
                                      <Btn size="sm" variant="primary"
                                        onClick={() => { if (newStatus) changeVisitorStatus(visitorId, newStatus, statusNotes); }}
                                        disabled={busy || !newStatus}>
                                        Update Status
                                      </Btn>
                                    </div>
                                  </div>

                                  <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 p-4 bg-amber-50/50 dark:bg-amber-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaExclamationTriangle size={12} className="text-amber-500" />
                                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">Data Policy</h4>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                      Assessment user data (including chat history and past results) is retained for analytics and future reference. Status changes affect how this user appears in reports and follow-up workflows.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* ─── GOVERNANCE TAB ─── */}
                              {detailTab === "governance" && (
                                <div className="space-y-5">
                                  {/* Current Status Banner */}
                                  <div className={`rounded-lg border p-4 flex items-center gap-3 ${
                                    expandedUser.status === "banned"    ? "border-red-200 bg-red-50/60 dark:border-red-800/40 dark:bg-red-900/10" :
                                    expandedUser.status === "suspended" ? "border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/10" :
                                    "border-green-200 bg-green-50/60 dark:border-green-800/40 dark:bg-green-900/10"
                                  }`}>
                                    <Pill tone={STATUS_PILL_MAP[expandedUser.status]?.tone || "info"}>
                                      {React.createElement(STATUS_PILL_MAP[expandedUser.status]?.icon || FaUserCheck, { size: 10, className: "mr-1" })}
                                      {STATUS_PILL_MAP[expandedUser.status]?.label || expandedUser.status}
                                    </Pill>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                      This user is currently <strong>{expandedUser.status}</strong>.
                                    </span>
                                  </div>

                                  {/* Governance Actions */}
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {expandedUser.status !== "suspended" && (
                                        <Btn size="sm" variant="danger"
                                          onClick={() => changeVisitorStatus(visitorId, "suspended", statusNotes)} disabled={busy}>
                                          <FaPauseCircle size={10} className="mr-1" /> Suspend User
                                        </Btn>
                                      )}
                                      {expandedUser.status !== "banned" && (
                                        <Btn size="sm" variant="danger"
                                          onClick={() => changeVisitorStatus(visitorId, "banned", statusNotes)} disabled={busy}>
                                          <FaBan size={10} className="mr-1" /> Ban User
                                        </Btn>
                                      )}
                                      {(expandedUser.status === "suspended" || expandedUser.status === "banned") && (
                                        <Btn size="sm" variant="success"
                                          onClick={() => changeVisitorStatus(visitorId, "new", statusNotes)} disabled={busy}>
                                          <FaCheckCircle size={10} className="mr-1" /> Restore User
                                        </Btn>
                                      )}
                                    </div>
                                  </div>

                                  {/* Governance Notes */}
                                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                    <h4 className="text-sm font-bold mb-2">Governance Notes</h4>
                                    <textarea
                                      placeholder="Reason for suspension or ban (visible to admins only)..."
                                      value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)}
                                      rows={3}
                                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                                    />
                                  </div>

                                  {/* Warning */}
                                  <div className="rounded-lg border border-red-200 dark:border-red-800/40 p-4 bg-red-50/50 dark:bg-red-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaExclamationTriangle size={12} className="text-red-500" />
                                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Important</h4>
                                    </div>
                                    <p className="text-xs text-red-700 dark:text-red-400">
                                      Suspending a user temporarily restricts their access. Banning permanently blocks them from the platform. Both actions are logged and can be reversed by restoring the user.
                                    </p>
                                  </div>
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className={`relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ${ring} overflow-hidden animate-in`}>
        <div className={`h-1.5 w-full ${{ danger: "bg-red-500", warn: "bg-amber-500", success: "bg-green-500" }[variant] || "bg-indigo-500"}`} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <DisplayIcon size={20} />
            </div>
            <div><h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3></div>
          </div>
          <div className={`rounded-lg border p-3.5 mb-5 ${{ danger: "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10", warn: "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10", success: "border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-900/10" }[variant] || "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"}`}>
            <div className="flex items-start gap-2">
              <FaExclamationTriangle size={13} className={`mt-0.5 flex-shrink-0 ${{ danger: "text-red-500", warn: "text-amber-500", success: "text-green-500" }[variant] || "text-gray-500"}`} />
              <p className={`text-sm leading-relaxed ${{ danger: "text-red-700 dark:text-red-300", warn: "text-amber-700 dark:text-amber-300", success: "text-green-700 dark:text-green-300" }[variant] || "text-gray-700 dark:text-gray-300"}`}>{message}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
            <button onClick={onConfirm} className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${btnClass}`}>{confirmLabel}</button>
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
