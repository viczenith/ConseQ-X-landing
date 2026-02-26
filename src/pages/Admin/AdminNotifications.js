import React, { useMemo, useState } from "react";
import {
  useAdmin, SectionCard, Btn, Select, Pill, EmptyState,
  formatDateTime, Input,
} from "./SuperAdminShell";
import {
  FaSyncAlt, FaBell, FaEnvelope, FaSms, FaHome,
  FaPaperPlane, FaUsers, FaBuilding, FaCheckCircle,
} from "react-icons/fa";

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
export default function AdminNotifications() {
  const admin = useAdmin();
  const {
    orgs, orgNotifications, selectedOrgId, setSelectedOrgId,
    loadOrgData, apiFetch, setUi,
  } = admin;

  const [busy, setBusy]                 = useState(false);
  const [filterChannel, setFilterChannel] = useState("");
  const [search, setSearch]             = useState("");

  /* Send form state */
  const [sendTab, setSendTab]           = useState("single"); // single | bulk | all
  const [sendSubject, setSendSubject]   = useState("");
  const [sendBody, setSendBody]         = useState("");
  const [sendChannel, setSendChannel]   = useState("internal");
  const [sendTargetOrg, setSendTargetOrg] = useState("");
  const [sendBulkIds, setSendBulkIds]   = useState(new Set());
  const [sentOk, setSentOk]             = useState("");

  const wrap = async (fn) => {
    setBusy(true); setUi(s => ({...s, error: "", ok: ""}));
    try { await fn(); } catch (e) { setUi({ loading: false, error: String(e?.message || e), ok: "" }); }
    setBusy(false);
  };

  /* ─── Viewing: filter existing notifications ─── */
  const filtered = useMemo(() => {
    let list = orgNotifications;
    if (filterChannel) list = list.filter(n => n.channel === filterChannel);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(n => (n.subject || "").toLowerCase().includes(q) || (n.to || "").toLowerCase().includes(q) || (n.body || "").toLowerCase().includes(q));
    return list;
  }, [orgNotifications, filterChannel, search]);

  const channelCounts = useMemo(() => {
    const c = { email: 0, sms: 0, internal: 0 };
    orgNotifications.forEach(n => { if (c[n.channel] !== undefined) c[n.channel]++; else c[n.channel] = 1; });
    return c;
  }, [orgNotifications]);

  const channelIcon = (ch) => {
    if (ch === "email") return <FaEnvelope size={12} />;
    if (ch === "sms")   return <FaSms size={12} />;
    return <FaHome size={12} />;
  };

  /* ─── Send notification ─── */
  const handleSend = () => wrap(async () => {
    if (!sendSubject.trim() || !sendBody.trim()) {
      setUi({ loading: false, error: "Subject and body are required", ok: "" }); return;
    }

    let org_ids;
    if (sendTab === "all") {
      org_ids = ["all"];
    } else if (sendTab === "bulk") {
      org_ids = [...sendBulkIds];
      if (!org_ids.length) { setUi({ loading: false, error: "Select at least one company", ok: "" }); return; }
    } else {
      if (!sendTargetOrg) { setUi({ loading: false, error: "Select a target company", ok: "" }); return; }
      org_ids = [sendTargetOrg];
    }

    await apiFetch("/admin/send-notification", {
      method: "POST",
      body: { org_ids, subject: sendSubject.trim(), body: sendBody.trim(), channel: sendChannel },
    });

    const target = sendTab === "all" ? "all active companies" : `${org_ids.length} company(ies)`;
    setSendSubject("");
    setSendBody("");
    setSendBulkIds(new Set());
    setSentOk(`Notification sent to ${target}`);
    setUi({ loading: false, error: "", ok: `Notification sent to ${target}` });
    setTimeout(() => setSentOk(""), 5000);
  });

  const toggleBulk = (id) => {
    setSendBulkIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send and view notifications across tenants</p>
        </div>
      </div>

      {/* ═══ SEND NOTIFICATION SECTION ═══ */}
      <SectionCard title="Send Notification">
        {/* Tab selector */}
        <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "single", label: "Single Company",   icon: FaBuilding },
            { key: "bulk",   label: "Multiple Companies", icon: FaUsers },
            { key: "all",    label: "All Active Companies", icon: FaBell },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setSendTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                sendTab === tab.key
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}>
              <tab.icon size={11} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Single company selector */}
        {sendTab === "single" && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Target Company</label>
            <Select value={sendTargetOrg} onChange={v => setSendTargetOrg(v)}
              options={[{ value: "", label: "— Select company —" }, ...orgs.filter(o => (o.status || "active") === "active").map(o => ({ value: String(o.id), label: o.name }))]} />
          </div>
        )}

        {/* Bulk company selector */}
        {sendTab === "bulk" && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">
              Select Companies ({sendBulkIds.size} selected)
            </label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2 space-y-1">
              {orgs.filter(o => (o.status || "active") === "active").map(o => (
                <label key={o.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm">
                  <input type="checkbox"
                    checked={sendBulkIds.has(String(o.id))}
                    onChange={() => toggleBulk(String(o.id))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="font-medium">{o.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{o.slug}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* All companies note */}
        {sendTab === "all" && (
          <div className="mb-3 rounded-lg border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/10 p-3 text-xs text-blue-700 dark:text-blue-300">
            <FaBell size={10} className="inline mr-1.5" />
            This notification will be sent to <strong>all active companies</strong> on the platform.
          </div>
        )}

        {/* Message fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Subject</label>
            <input type="text" value={sendSubject} onChange={(e) => setSendSubject(e.target.value)}
              placeholder="Notification subject..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Message</label>
            <textarea value={sendBody} onChange={(e) => setSendBody(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500" />
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Channel</label>
              <select value={sendChannel} onChange={(e) => setSendChannel(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
                <option value="internal">Internal Notification</option>
                <option value="email">Email</option>
              </select>
            </div>
            <Btn onClick={handleSend} variant="primary" disabled={busy || !sendSubject.trim() || !sendBody.trim()}>
              <FaPaperPlane size={11} className="mr-1.5" /> Send Notification
            </Btn>
          </div>

          {sentOk && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <FaCheckCircle size={12} /> {sentOk}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ═══ VIEW NOTIFICATIONS SECTION ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <SectionCard title="Select Company">
            <Select value={selectedOrgId} onChange={v => setSelectedOrgId(v)}
              options={[{ value: "", label: "— Choose company —" }, ...orgs.map(o => ({ value: String(o.id), label: `${o.name} (${o.slug})` }))]} />
            <Btn onClick={() => wrap(() => loadOrgData(selectedOrgId))} disabled={busy || !selectedOrgId} className="mt-2 w-full">
              <FaSyncAlt size={12} className={`mr-2 ${busy ? "animate-spin" : ""}`} /> Load Notifications
            </Btn>
          </SectionCard>

          <SectionCard title="Channel Breakdown">
            <div className="space-y-3">
              {Object.entries(channelCounts).map(([ch, count]) => (
                <div key={ch} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm capitalize">{channelIcon(ch)} {ch}</div>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
              {orgNotifications.length === 0 && <EmptyState message="No notifications" />}
            </div>
          </SectionCard>

          <SectionCard title="Filter">
            <Select value={filterChannel} onChange={setFilterChannel}
              options={[{ value: "", label: "All channels" }, { value: "email", label: "Email" }, { value: "sms", label: "SMS" }, { value: "internal", label: "Internal" }]} />
          </SectionCard>
        </div>

        <div className="lg:col-span-8">
          <SectionCard title={`Notifications (${filtered.length})`}>
            <Input value={search} onChange={setSearch} placeholder="Search notifications..." className="mb-3" />
            {filtered.length === 0 ? <EmptyState message="No notifications found — select a company and load" /> : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.map((n, i) => {
                  const isAdminSent = n.meta?.admin_notification;
                  return (
                    <div key={n.id || i} className={`rounded-lg border p-4 ${isAdminSent ? "border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-gray-200 dark:border-gray-700"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5 ${
                            isAdminSent
                              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}>
                            {isAdminSent ? <FaPaperPlane size={12} /> : channelIcon(n.channel)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{n.subject || "(no subject)"}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">to: {n.to || "—"}</div>
                            {isAdminSent && n.meta?.sent_by && (
                              <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">sent by: {n.meta.sent_by}</div>
                            )}
                            {n.body && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{String(n.body).slice(0, 200)}{String(n.body).length > 200 ? "..." : ""}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDateTime(n.timestamp_ms ? new Date(n.timestamp_ms) : n.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Pill tone="info">{n.channel}</Pill>
                          {isAdminSent && <Pill tone="warn">admin</Pill>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
