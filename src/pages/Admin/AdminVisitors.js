import React, { useState, useEffect, useCallback } from "react";
import { useAdmin, SectionCard, Btn, Input, Pill, StatCard, EmptyState, formatDateTime } from "./SuperAdminShell";
import {
  FaUserFriends, FaEnvelope, FaBuilding, FaBriefcase, FaSearch,
  FaSync, FaCheckCircle, FaPhoneAlt, FaTimesCircle, FaEye,
  FaCalendarAlt, FaGlobe, FaStickyNote, FaFilter, FaTimes,
  FaArrowUp, FaArrowDown, FaExclamationTriangle
} from "react-icons/fa";

/* ═══════════════════════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  new:       { label: "New",       tone: "info",  icon: FaExclamationTriangle },
  contacted: { label: "Contacted", tone: "warn",  icon: FaPhoneAlt },
  converted: { label: "Converted", tone: "good",  icon: FaCheckCircle },
  dismissed: { label: "Dismissed", tone: "bad",   icon: FaTimesCircle },
};

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════════════════ */
function VisitorDetailModal({ visitor, onClose, onUpdate, busy }) {
  const [status, setStatus] = useState(visitor?.status || "new");
  const [notes, setNotes] = useState(visitor?.notes || "");

  if (!visitor) return null;

  const cfg = STATUS_CONFIG[visitor.status] || STATUS_CONFIG.new;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {(visitor.email || "V")[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{visitor.email}</div>
              <Pill tone={cfg.tone}>{cfg.label}</Pill>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaTimes size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaBuilding size={10} /> Organization</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{visitor.organization_name || "—"}</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaBriefcase size={10} /> Role</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{visitor.role || "—"}</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaEnvelope size={10} /> Email</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{visitor.email}</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaCalendarAlt size={10} /> Visited</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{formatDateTime(visitor.created_at)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaGlobe size={10} /> IP Address</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">{visitor.ip_address || "—"}</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaEye size={10} /> Assessment</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{visitor.started_assessment ? "Started" : "Not Started"}</div>
            </div>
          </div>

          {/* User Agent */}
          {visitor.user_agent && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-xs">
              <div className="text-gray-500 dark:text-gray-400 mb-1">Browser / Device</div>
              <div className="text-gray-700 dark:text-gray-300 font-mono text-[10px] break-all">{visitor.user_agent}</div>
            </div>
          )}

          {/* Status Update */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">Update Status</label>
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    status === key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <cfg.icon size={10} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this visitor/lead..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            variant="primary"
            disabled={busy}
            onClick={() => onUpdate(visitor.id, { status, notes })}
          >
            <FaCheckCircle size={12} className="mr-1.5" /> Save Changes
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AdminVisitors() {
  const { apiFetch, setUi, adminToken } = useAdmin();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [busy, setBusy] = useState(false);

  /* ─── Load visitors ─── */
  const loadVisitors = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const data = await apiFetch("/admin/visitors");
      setVisitors(Array.isArray(data) ? data : []);
    } catch (e) {
      setUi(s => ({ ...s, error: String(e?.message || e) }));
    }
    setLoading(false);
  }, [adminToken, apiFetch, setUi]);

  useEffect(() => { loadVisitors(); }, [loadVisitors]);

  /* ─── Update visitor ─── */
  const handleUpdate = async (visitorId, updates) => {
    setBusy(true);
    try {
      const updated = await apiFetch(`/admin/visitors/${visitorId}`, {
        method: "PATCH",
        body: updates,
      });
      setVisitors(prev => prev.map(v => v.id === visitorId ? updated : v));
      setSelectedVisitor(null);
      setUi({ loading: false, error: "", ok: "Visitor updated successfully" });
    } catch (e) {
      setUi(s => ({ ...s, error: String(e?.message || e) }));
    }
    setBusy(false);
  };

  /* ─── Quick status change ─── */
  const quickStatusChange = async (visitorId, newStatus) => {
    setBusy(true);
    try {
      const updated = await apiFetch(`/admin/visitors/${visitorId}`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      setVisitors(prev => prev.map(v => v.id === visitorId ? updated : v));
      setUi({ loading: false, error: "", ok: `Marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}` });
    } catch (e) {
      setUi(s => ({ ...s, error: String(e?.message || e) }));
    }
    setBusy(false);
  };

  /* ─── Filter & Sort ─── */
  const filtered = visitors
    .filter(v => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (v.email || "").toLowerCase().includes(q) ||
          (v.organization_name || "").toLowerCase().includes(q) ||
          (v.role || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <FaArrowUp size={9} className="ml-1 inline" /> : <FaArrowDown size={9} className="ml-1 inline" />;
  };

  /* ─── Stats ─── */
  const total = visitors.length;
  const newCount = visitors.filter(v => v.status === "new").length;
  const contactedCount = visitors.filter(v => v.status === "contacted").length;
  const convertedCount = visitors.filter(v => v.status === "converted").length;

  /* ─── Unique orgs ─── */
  const uniqueOrgs = new Set(visitors.map(v => (v.organization_name || "").toLowerCase().trim()).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Visitor Leads</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            People who started the assessment — potential clients & leads
          </p>
        </div>
        <Btn onClick={loadVisitors} disabled={loading}>
          <FaSync size={12} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Btn>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Visitors" value={total} icon={FaUserFriends} />
        <StatCard label="New Leads" value={newCount} icon={FaExclamationTriangle} tone={newCount > 0 ? "info" : "good"} />
        <StatCard label="Contacted" value={contactedCount} icon={FaPhoneAlt} tone="warn" />
        <StatCard label="Converted" value={convertedCount} icon={FaCheckCircle} tone="good" />
        <StatCard label="Unique Orgs" value={uniqueOrgs} icon={FaBuilding} />
      </div>

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, organization, or role..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <FaFilter size={11} className="text-gray-400" />
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === "all" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >All</button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === key ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >{cfg.label}</button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard title={`Visitors (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState message={loading ? "Loading visitors..." : visitors.length === 0 ? "No visitor leads captured yet. Visitors will appear here when they start the assessment." : "No visitors match your filters."} />
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer select-none" onClick={() => toggleSort("email")}>
                    Email <SortIcon field="email" />
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer select-none" onClick={() => toggleSort("organization_name")}>
                    Organization <SortIcon field="organization_name" />
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell cursor-pointer select-none" onClick={() => toggleSort("role")}>
                    Role <SortIcon field="role" />
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort("created_at")}>
                    Date <SortIcon field="created_at" />
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(v => {
                  const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.new;
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVisitor(v)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                            {(v.email || "V")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{v.email}</div>
                            {v.notes && <div className="text-[10px] text-gray-400 truncate max-w-[200px]"><FaStickyNote size={8} className="inline mr-1" />{v.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-gray-700 dark:text-gray-300 font-medium">{v.organization_name || "—"}</div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="text-gray-600 dark:text-gray-400">{v.role || "—"}</div>
                      </td>
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={v.status}
                          onChange={(e) => quickStatusChange(v.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            v.status === "new" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : v.status === "contacted" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : v.status === "converted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                            <option key={key} value={key}>{c.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(v.created_at)}</div>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Btn size="sm" onClick={() => setSelectedVisitor(v)}>
                          <FaEye size={10} className="mr-1" /> View
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Detail Modal */}
      {selectedVisitor && (
        <VisitorDetailModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
          onUpdate={handleUpdate}
          busy={busy}
        />
      )}
    </div>
  );
}
