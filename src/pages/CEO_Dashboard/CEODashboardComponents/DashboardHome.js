import React from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as svc from "../services/serviceSelector";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";

function KPICard({ title, value, hint, darkMode }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <div className={`text-xs uppercase ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs mt-1`}>{hint}</div>}
    </div>
  );
}

// Systems snapshot from local storage (non-destructive, uses conseqx_assessments_v1 and BroadcastChannel "conseqx_assessments")
function SystemsSnapshot({ darkMode, orgId }) {
  const [items, setItems] = React.useState(() => {
    try {
      const raw = localStorage.getItem("conseqx_assessments_v1");
      const byOrg = raw ? JSON.parse(raw) : {};
      const list = byOrg[orgId] || [];
      // take latest per systemId
      const map = {};
      list.forEach((r) => {
        if (!r.systemId) return;
        const key = normalizeSystemKey(r.systemId);
        const cur = map[key];
        if (!cur || (cur.timestamp || 0) < (r.timestamp || 0)) map[key] = { ...r, systemId: key };
      });
      return Object.values(map);
    } catch {
      return [];
    }
  });

  // keep in sync with storage changes and broadcast channel
  React.useEffect(() => {
    function refresh() {
      try {
        const raw = localStorage.getItem("conseqx_assessments_v1");
        const byOrg = raw ? JSON.parse(raw) : {};
        const list = byOrg[orgId] || [];
        const map = {};
        list.forEach((r) => {
          if (!r.systemId) return;
          const key = normalizeSystemKey(r.systemId);
          const cur = map[key];
          if (!cur || (cur.timestamp || 0) < (r.timestamp || 0)) map[key] = { ...r, systemId: key };
        });
        setItems(Object.values(map));
      } catch {}
    }
    const onStorage = (e) => {
      if (e.key === "conseqx_assessments_v1" || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    let bc;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("conseqx_assessments");
        bc.addEventListener("message", (ev) => {
          if (ev?.data?.type === "assessments:update" && ev?.data?.orgId === orgId) refresh();
        });
      }
    } catch {}
    const poll = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(poll);
      if (bc)
        try {
          bc.close();
        } catch {}
    };
  }, [orgId]);

  const titleByKey = React.useMemo(() => {
    const m = {};
    CANONICAL_SYSTEMS.forEach((s) => (m[s.key] = s.title));
    return m;
  }, []);

  if (!items.length) {
    return <div className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No recent system runs yet.</div>;
  }

  return (
    <div className="mt-3 space-y-2">
      {items.map((r) => {
        const badge = r.score > 70 ? "bg-green-100 text-green-700" : r.score > 45 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
        return (
          <div key={r.id} className="flex items-center justify-between text-sm">
            <div className={darkMode ? "text-gray-100" : "text-gray-900"}>{titleByKey[r.systemId] || r.title || r.systemId}</div>
            <div className={`px-2 py-1 rounded-full text-xs ${badge}`}>{r.score}%</div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardHome() {
  const { darkMode, org } = useOutletContext();
  const auth = useAuth();

  // safety: org may be null; derive a displayable name
  const orgName = (org && (org.name || org.orgName || org.label)) || null;

  const kpis = [
    { title: "Revenue (TTM)", value: "₦120M" },
    { title: "EBITDA Margin", value: "18%" },
    { title: "Active Assessments", value: "4" },
    { title: "AI Insights (unread)", value: "3" },
  ];

  // When USE_MOCK is enabled, fetch dashboard summary
  const USE_MOCK = true;
  const [summary, setSummary] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    if (USE_MOCK && (auth?.org?.id || org?.id)) {
      (async () => {
        try {
          const s = await svc.getDashboardSummary(auth?.org?.id || org?.id);
          if (mounted) setSummary(s);
        } catch {}
      })();
    }
    return () => {
      mounted = false;
    };
  }, [auth?.org?.id, org?.id, USE_MOCK]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-sm mt-1`}>
            <span className="text-yellow-500">{auth?.org?.name}</span> Workspace
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KPICard key={k.title} title={k.title} value={k.value} hint={k.hint} darkMode={darkMode} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`md:col-span-2 rounded-2xl p-4 border ${
            darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-900"
          }`}
        >
          <h3 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg font-semibold`}>Executive Insights</h3>
          <p className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Top recommendation: Address Orchestration gaps — align owners, measure weekly sprints, and reduce cross-team blockers.
          </p>

          <div className="mt-4">
            <h4 className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-semibold`}>Recent Reports</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li
                className={`flex items-center justify-between p-2 rounded-md ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className={`${darkMode ? "text-gray-100" : "font-medium"}`}>Q3 Operations Review</div>
                  <div className="text-xs text-gray-400">Generated Oct 01, 2025</div>
                </div>
                <div>
                  <button
                    className={`px-3 py-1 rounded-md border ${
                      darkMode ? "bg-transparent text-gray-100 border-gray-600" : "bg-transparent text-gray-900 border-gray-200"
                    }`}
                  >
                    View
                  </button>
                </div>
              </li>

              <li
                className={`flex items-center justify-between p-2 rounded-md ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className={`${darkMode ? "text-gray-100" : "font-medium"}`}>Leadership Assessment</div>
                  <div className="text-xs text-gray-400">Generated Sep 12, 2025</div>
                </div>
                <div>
                  <button
                    className={`px-3 py-1 rounded-md border ${
                      darkMode ? "bg-transparent text-gray-100 border-gray-600" : "bg-transparent text-gray-900 border-gray-200"
                    }`}
                  >
                    View
                  </button>
                </div>
              </li>
            </ul>

            {/* Systems Snapshot (non-destructive) */}
            <div className="mt-5">
              <h4 className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-semibold`}>Systems Snapshot</h4>
              <p className={`mt-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Snapshot of your systems based on recent assessments.
              </p>
              <SystemsSnapshot darkMode={darkMode} orgId={auth?.org?.id || "anon"} />
              {USE_MOCK && summary && (
                <div className="mt-4 text-sm">
                  <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Org Health: <span className="font-semibold">{summary.org_health}%</span> · Confidence: {Math.round((summary.confidence || 0) * 100)}%
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summary.systems.map((s) => (
                      <div key={s.key} className={`p-2 rounded-md ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                        <div className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-xs font-semibold`}>{s.title}</div>
                        <div className="text-xs mt-1">
                          {s.latest ? `Score: ${s.latest.score}%` : "No runs yet"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside
          className={`rounded-2xl p-4 border ${
            darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-900"
          }`}
        >
          <h3 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg font-semibold`}>Action Items</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start justify-between">
              <div>
                <div className={`${darkMode ? "text-gray-100" : "font-medium"}`}>Draft offsite agenda</div>
                <div className="text-xs text-gray-400">Owner: COO · Due: 2025-10-01</div>
              </div>
              <button
                className={`px-2 py-1 rounded-md border ${
                  darkMode ? "text-gray-100 border-gray-600 bg-transparent" : "text-gray-900 border-gray-200 bg-transparent"
                }`}
              >
                Assign
              </button>
            </li>

            <li className="flex items-start justify-between">
              <div>
                <div className={`${darkMode ? "text-gray-100" : "font-medium"}`}>KPI dashboard refresh</div>
                <div className="text-xs text-gray-400">Owner: Head Analytics</div>
              </div>
              <button
                className={`px-2 py-1 rounded-md border ${
                  darkMode ? "text-gray-100 border-gray-600 bg-transparent" : "text-gray-900 border-gray-200 bg-transparent"
                }`}
              >
                Assign
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
