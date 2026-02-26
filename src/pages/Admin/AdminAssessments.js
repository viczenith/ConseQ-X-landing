import React, { useMemo, useState } from "react";
import { useAdmin, SectionCard, Btn, Select, Pill, EmptyState, formatDateTime, Input } from "./SuperAdminShell";
import { FaSyncAlt, FaClipboardList } from "react-icons/fa";

export default function AdminAssessments() {
  const admin = useAdmin();
  const { orgs, orgAssessments, selectedOrgId, setSelectedOrgId, selectedOrg, apiFetch, loadOrgData, setUi, adminToken, CANONICAL_SYSTEMS } = admin;

  const [busy, setBusy] = useState(false);
  const [filterSystem, setFilterSystem] = useState("");
  const [search, setSearch] = useState("");

  const wrap = async (fn) => {
    setBusy(true); setUi(s => ({...s, error: "", ok: ""}));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  const filtered = useMemo(() => {
    let list = orgAssessments;
    if (filterSystem) list = list.filter(a => (a.systemId || a.system_id || "").toLowerCase() === filterSystem);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(a => (a.title || "").toLowerCase().includes(q) || (a.systemId || a.system_id || "").toLowerCase().includes(q));
    return list;
  }, [orgAssessments, filterSystem, search]);

  // Score distribution
  const scoreBuckets = useMemo(() => {
    const buckets = { high: 0, medium: 0, low: 0 };
    orgAssessments.forEach(a => {
      const s = Number(a.score);
      if (s >= 70) buckets.high++;
      else if (s >= 40) buckets.medium++;
      else buckets.low++;
    });
    return buckets;
  }, [orgAssessments]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Assessments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor system assessment results across all tenants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-4 space-y-4">
          <SectionCard title="Select Company">
            <Select value={selectedOrgId} onChange={v => setSelectedOrgId(v)}
              options={[{ value: "", label: "— Choose company —" }, ...orgs.map(o => ({ value: String(o.id), label: `${o.name} (${o.slug})` }))]} />
            {selectedOrg && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">{selectedOrg.name}</span>
                <div className="text-xs text-gray-500 mt-0.5">slug: {selectedOrg.slug}</div>
              </div>
            )}
            <Btn onClick={() => wrap(() => loadOrgData(selectedOrgId))} disabled={busy || !selectedOrgId} className="mt-3 w-full">
              <FaSyncAlt size={12} className={`mr-2 ${busy ? "animate-spin" : ""}`} /> Refresh Data
            </Btn>
          </SectionCard>

          <SectionCard title="Score Distribution">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">High (≥70)</span>
                <Pill tone="good">{scoreBuckets.high}</Pill>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${orgAssessments.length ? (scoreBuckets.high / orgAssessments.length * 100) : 0}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Medium (40-69)</span>
                <Pill tone="warn">{scoreBuckets.medium}</Pill>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${orgAssessments.length ? (scoreBuckets.medium / orgAssessments.length * 100) : 0}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Low (&lt;40)</span>
                <Pill tone="bad">{scoreBuckets.low}</Pill>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${orgAssessments.length ? (scoreBuckets.low / orgAssessments.length * 100) : 0}%` }} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: Assessment list */}
        <div className="lg:col-span-8">
          <SectionCard title={`Assessments (${filtered.length})`} actions={
            <div className="flex gap-2">
              <Select value={filterSystem} onChange={setFilterSystem} className="w-40"
                options={[{ value: "", label: "All systems" }, ...CANONICAL_SYSTEMS.map(s => ({ value: s.key, label: s.title }))]} />
            </div>
          }>
            <Input value={search} onChange={setSearch} placeholder="Search assessments..." className="mb-3" />
            {filtered.length === 0 ? <EmptyState message="No assessments found" /> : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.map((a, i) => (
                  <div key={a.id || i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">{a.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          system: {a.systemId || a.system_id || "—"} · {formatDateTime(a.timestamp_ms ? new Date(a.timestamp_ms) : a.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={Number(a.score) >= 70 ? "good" : Number(a.score) >= 40 ? "warn" : "bad"}>
                          score: {a.score}
                        </Pill>
                        {a.coverage !== undefined && (
                          <Pill>{(Number(a.coverage) * 100).toFixed(0)}% coverage</Pill>
                        )}
                      </div>
                    </div>
                    {a.meta?.rationale && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        {a.meta.rationale}
                      </div>
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
