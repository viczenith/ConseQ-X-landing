import React from 'react';
import { CANONICAL_SYSTEMS } from '../../constants/systems';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, Tooltip, Area, XAxis, YAxis } from 'recharts';

// lightweight local date formatting to avoid adding a dependency
function fmtShort(d) {
  try { return new Date(d).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }); } catch { return '' + d; }
}
function fmtLong(d) {
  try { return new Date(d).toLocaleString(); } catch { return '' + d; }
}

/**
 * OverviewView
 * - Clean system overview with high-level health scores and trends
 * - Focuses purely on overview metrics without data management functionality
 */
export default function OverviewView() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  const dashboardMode = outlet?.dashboardMode ?? 'manual';
  const orgId = outlet?.orgId || "anon";

  // Fetch overview data from mock API
  const [scores, setScores] = React.useState({});
  const [series, setSeries] = React.useState([]);
  const [perSystemSeries, setPerSystemSeries] = React.useState({});

  React.useEffect(() => {
    let mounted = true;

    function makeSeriesFromBase(base, tsBase = Date.now()) {
      const arr = [];
      for (let i = 6; i >= 0; i--) {
        const ts = tsBase - i * 24 * 3600 * 1000;
        const v = Math.max(5, Math.min(95, base + Math.floor((Math.random() - 0.5) * 6)));
        arr.push({ ts, value: v, upper: Math.min(100, v + 4), lower: Math.max(0, v - 4), date: new Date(ts) });
      }
      return arr;
    }

    async function load() {
      try {
        // Prefer client-side latest upload (manual upload-driven flow)
        const raw = localStorage.getItem('conseqx_uploads_v1');
        const uploads = raw ? JSON.parse(raw) : [];
        if (uploads && uploads.length) {
          const latest = uploads[0];
          // derive simple scores: presence -> 70, absent -> 45, allow assessments to override (if present in local assessments)
          const byAssessRaw = localStorage.getItem('conseqx_assessments_v1');
          const byOrg = byAssessRaw ? JSON.parse(byAssessRaw) : {};
          const assessments = (byOrg[outlet?.org?.id || 'anon'] || []).reduce((acc, a) => { const k = a.systemId || a.system || a.systemKey; if (k) acc[k] = a.score || acc[k] || 0; return acc; }, {});

          const scoresLocal = CANONICAL_SYSTEMS.reduce((acc, s) => {
            if (assessments[s.key]) acc[s.key] = Math.round(Math.max(0, Math.min(100, assessments[s.key])));
            else if (Array.isArray(latest.analyzedSystems) && latest.analyzedSystems.includes(s.key)) acc[s.key] = 70;
            else acc[s.key] = 45;
            return acc;
          }, {});

          if (!mounted) return;
          setScores(scoresLocal);
          const overallBase = Math.round(Object.values(scoresLocal).reduce((a,b)=>a+b,0)/Math.max(1,Object.keys(scoresLocal).length));
          setSeries(makeSeriesFromBase(overallBase, latest.timestamp || Date.now()));
          const per = {};
          CANONICAL_SYSTEMS.forEach((s) => { per[s.key] = makeSeriesFromBase(scoresLocal[s.key] || 50, latest.timestamp || Date.now()); });
          setPerSystemSeries(per);
          return;
        }

        // fallback to mock API when no manual uploads present
        const res = await fetch('http://localhost:4001/api/overview');
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        if (!mounted) return;
        setSeries(data.overallSeries.map(d => ({ ...d, date: new Date(d.ts) })));
        setPerSystemSeries(Object.keys(data.perSystemSeries).reduce((acc, k) => { acc[k] = data.perSystemSeries[k].map(d => ({ ...d, date: new Date(d.ts) })); return acc; }, {}));
        setScores(data.scores || {});
      } catch (e) {
        // final fallback: generate reasonable mock series
        const scoresLocal = CANONICAL_SYSTEMS.reduce((acc, s) => { acc[s.key] = Math.floor(40 + Math.random() * 50); return acc; }, {});
        if (!mounted) return;
        setScores(scoresLocal);
        setSeries(makeSeriesFromBase(62));
        setPerSystemSeries(CANONICAL_SYSTEMS.reduce((acc, s) => { acc[s.key] = makeSeriesFromBase(40 + Math.floor(Math.random()*40)); return acc; }, {}));
      }
    }

    load();

    // Listen for storage changes (uploads may be added by Data Management)
    function onStorage(e) {
      if (!e.key || e.key === 'conseqx_uploads_v1' || e.key === 'conseqx_assessments_v1') load();
    }
    window.addEventListener('storage', onStorage);
    let bc;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('conseqx_assessments');
        bc.addEventListener('message', (ev) => { if (ev?.data?.type === 'assessments:update') load(); });
      }
    } catch {}

    return () => { mounted = false; window.removeEventListener('storage', onStorage); if (bc) try { bc.close(); } catch {} };
  }, [outlet?.org]);

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / (Object.keys(scores).length || 1));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`rounded-2xl p-4 col-span-1 md:col-span-1 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="text-xs text-gray-400">Overall Health</div>
          <div className="text-3xl font-bold mt-2">{overall}%</div>
          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={(d)=> fmtShort(d)} />
                <YAxis domain={[0,100]} />
                <Tooltip formatter={(v) => `${v}%`} labelFormatter={(label) => (label ? fmtLong(label) : '')} />
                {/* confidence band */}
                <Area type="monotone" dataKey="upper" stroke={false} fill="#60A5FA" fillOpacity={0.08} />
                <Area type="monotone" dataKey="lower" stroke={false} fill="#60A5FA" fillOpacity={0.08} />
                <Line type="monotone" dataKey="value" stroke="#60A5FA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl p-4 col-span-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="text-sm font-semibold">System Score Cards</div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {CANONICAL_SYSTEMS.map((s) => (
              <div key={s.key} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-xl font-bold">{scores[s.key]}%</div>
                </div>
                <div className="text-xs text-gray-400 mt-2">Quick insight: {s.description?.slice(0, 80)}</div>
                <div className="mt-3 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perSystemSeries[s.key] || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l)=> l ? fmtShort(l) : ''} />
                      <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4">
        <h3 className="font-semibold">Key Alerts</h3>
        <div className="mt-2 text-sm text-gray-500">No critical alerts (placeholder). Thresholds and predictive warnings will show here.</div>
      </div>
    </div>
  );
}
