import React, { useMemo, useState } from "react";
import { useAdmin, SectionCard, Btn, Select, Input, Pill, EmptyState, formatDateTime } from "./SuperAdminShell";
import { FaCloudUploadAlt, FaSyncAlt, FaFileAlt, FaFilter } from "react-icons/fa";

export default function AdminUploads() {
  const admin = useAdmin();
  const { orgs, orgUploads, selectedOrgId, setSelectedOrgId, selectedOrg, apiFetch, loadOrgData, setUi, adminToken } = admin;

  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState("");

  const wrap = async (fn) => {
    setBusy(true); setUi(s => ({...s, error: "", ok: ""}));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  const filtered = useMemo(() => {
    let list = orgUploads;
    if (filterSystem) list = list.filter(u => Array.isArray(u.analyzed_systems) && u.analyzed_systems.some(s => s.toLowerCase() === filterSystem));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(u => (u.name || "").toLowerCase().includes(q));
    return list;
  }, [orgUploads, search, filterSystem]);

  // File type stats
  const typeStats = useMemo(() => {
    const m = {};
    orgUploads.forEach(u => {
      const ext = (u.name || "").split(".").pop()?.toLowerCase() || "unknown";
      m[ext] = (m[ext] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [orgUploads]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Uploads</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor tenant data uploads across all companies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <div className="lg:col-span-4 space-y-4">
          <SectionCard title="Select Company">
            <Select value={selectedOrgId} onChange={v => setSelectedOrgId(v)}
              options={[{ value: "", label: "— Choose company —" }, ...orgs.map(o => ({ value: String(o.id), label: `${o.name} (${o.slug})` }))]} />
            <Btn onClick={() => wrap(() => loadOrgData(selectedOrgId))} disabled={busy || !selectedOrgId} className="mt-2 w-full">
              <FaSyncAlt size={12} className={`mr-2 ${busy ? "animate-spin" : ""}`} /> Refresh
            </Btn>
          </SectionCard>

          <SectionCard title="File Types">
            {typeStats.length === 0 ? <EmptyState message="No uploads" /> : (
              <div className="space-y-1.5">
                {typeStats.map(([ext, count]) => (
                  <div key={ext} className="flex items-center justify-between text-xs">
                    <span className="font-medium uppercase">.{ext}</span>
                    <Pill>{count}</Pill>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Uploads list */}
        <div className="lg:col-span-8">
          <SectionCard title={`Uploads (${filtered.length})`} actions={
            <Select value={filterSystem} onChange={setFilterSystem} className="w-40"
              options={[{ value: "", label: "All systems" }, ...admin.CANONICAL_SYSTEMS.map(s => ({ value: s.key, label: s.title }))]} />
          }>
            <Input value={search} onChange={setSearch} placeholder="Search uploads..." className="mb-3" />
            {filtered.length === 0 ? <EmptyState message="No uploads found for this company" /> : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.map((u, i) => (
                  <div key={u.id || i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0 mt-0.5">
                          <FaFileAlt size={14} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{u.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatDateTime(u.timestamp_ms ? new Date(u.timestamp_ms) : u.created_at)}
                          </div>
                          {u.summary && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{String(u.summary).slice(0, 120)}{String(u.summary).length > 120 ? "..." : ""}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(u.analyzed_systems) && u.analyzed_systems.map(s => (
                          <Pill key={s} tone="info">{s}</Pill>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
