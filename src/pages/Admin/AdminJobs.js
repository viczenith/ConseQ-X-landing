import React, { useMemo, useState } from "react";
import { useAdmin, SectionCard, Btn, Select, Pill, EmptyState, formatDateTime, Input } from "./SuperAdminShell";
import { FaSyncAlt, FaCogs, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

export default function AdminJobs() {
  const admin = useAdmin();
  const { orgs, orgJobs, selectedOrgId, setSelectedOrgId, selectedOrg, loadOrgData, setUi } = admin;

  const [busy, setBusy] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const wrap = async (fn) => {
    setBusy(true); setUi(s => ({...s, error: "", ok: ""}));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  const filtered = useMemo(() => {
    let list = orgJobs;
    if (filterStatus) list = list.filter(j => j.status === filterStatus);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(j => (j.name || j.system_id || "").toLowerCase().includes(q) || (j.jobId || "").toLowerCase().includes(q));
    return list;
  }, [orgJobs, filterStatus, search]);

  const statusCounts = useMemo(() => {
    const c = { pending: 0, completed: 0, failed: 0 };
    orgJobs.forEach(j => { if (c[j.status] !== undefined) c[j.status]++; });
    return c;
  }, [orgJobs]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Jobs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor analysis job queues across tenants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <SectionCard title="Select Company">
            <Select value={selectedOrgId} onChange={v => setSelectedOrgId(v)}
              options={[{ value: "", label: "— Choose company —" }, ...orgs.map(o => ({ value: String(o.id), label: `${o.name} (${o.slug})` }))]} />
            <Btn onClick={() => wrap(() => loadOrgData(selectedOrgId))} disabled={busy || !selectedOrgId} className="mt-2 w-full">
              <FaSyncAlt size={12} className={`mr-2 ${busy ? "animate-spin" : ""}`} /> Refresh
            </Btn>
          </SectionCard>

          <SectionCard title="Status Summary">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><FaClock className="text-amber-500" /> Pending</div>
                <span className="text-lg font-bold">{statusCounts.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><FaCheckCircle className="text-emerald-500" /> Completed</div>
                <span className="text-lg font-bold">{statusCounts.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><FaTimesCircle className="text-red-500" /> Failed</div>
                <span className="text-lg font-bold">{statusCounts.failed}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Filter">
            <Select value={filterStatus} onChange={setFilterStatus}
              options={[{ value: "", label: "All statuses" }, { value: "pending", label: "Pending" }, { value: "completed", label: "Completed" }, { value: "failed", label: "Failed" }]} />
          </SectionCard>
        </div>

        <div className="lg:col-span-8">
          <SectionCard title={`Jobs (${filtered.length})`}>
            <Input value={search} onChange={setSearch} placeholder="Search jobs..." className="mb-3" />
            {filtered.length === 0 ? <EmptyState message="No jobs found" /> : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.map((j, i) => (
                  <div key={j.jobId || i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">{j.name || j.system_id || "Job"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          ID: {j.jobId || j.id || "—"} · system: {j.system_id || "—"}
                        </div>
                        {j.notify_to && <div className="text-xs text-gray-400 mt-0.5">notify: {j.notify_to}</div>}
                        {j.created_at && <div className="text-xs text-gray-400 mt-0.5">{formatDateTime(j.created_at)}</div>}
                      </div>
                      <Pill tone={j.status === "completed" ? "good" : j.status === "failed" ? "bad" : "warn"}>{j.status}</Pill>
                    </div>
                    {j.error && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{j.error}</div>
                    )}
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
