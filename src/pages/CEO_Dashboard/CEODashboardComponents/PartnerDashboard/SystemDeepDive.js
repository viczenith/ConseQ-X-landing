import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const SYSTEM_KEYS = ['interdependency','iteration','investigation','interpretation','illustration','inlignment'];

function SimpleDependencyMap({ systems, scores }) {
  // place nodes in a circle and draw simple links between sequential systems
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  return (
    <svg width={size} height={size} className="block mx-auto">
      {systems.map((s, i) => {
        const angle = (i / systems.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <g key={s.key} transform={`translate(${x},${y})`}>
            <circle r={20} fill={scores[s.key] >= 70 ? '#10B981' : scores[s.key] >= 50 ? '#FBBF24' : '#EF4444'} stroke="#111" strokeOpacity={0.06} />
            <text x={0} y={5} textAnchor="middle" fontSize={9} fill="#fff">{s.title.slice(0,2)}</text>
          </g>
        );
      })}
      {/* draw links */}
      {systems.map((s, i) => {
        const a1 = (i / systems.length) * Math.PI * 2 - Math.PI / 2;
        const a2 = (((i+1) % systems.length) / systems.length) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        return <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94A3B8" strokeWidth={1} strokeOpacity={0.6} />;
      })}
    </svg>
  );
}

function RootCauseTree({ rootCauses }) {
  const [openIds, setOpenIds] = React.useState({});
  return (
    <div className="space-y-2">
      {rootCauses.map((r) => (
        <div key={r.id}>
          <button onClick={() => setOpenIds((s)=> ({...s, [r.id]: !s[r.id]}))} className="w-full text-left p-2 border rounded">
            <div className="flex justify-between items-center"><div className="font-medium">{r.title}</div><div className="text-xs text-gray-500">{r.impact}</div></div>
          </button>
          {openIds[r.id] && (
            <div className="ml-3 mt-1 text-sm text-gray-600">
              <ul className="list-disc list-inside">
                {r.causes.map((c, idx) => <li key={idx}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SystemDeepDive() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;

  const [overview, setOverview] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    function makeSeriesFromBase(base, tsBase = Date.now()) {
      const arr = [];
      for (let i = 6; i >= 0; i--) {
        const ts = tsBase - i * 24 * 3600 * 1000;
        const v = Math.max(5, Math.min(95, base + Math.floor((Math.random() - 0.5) * 6)));
        arr.push({ ts, value: v });
      }
      return arr;
    }

    async function load() {
      try {
        const raw = localStorage.getItem('conseqx_uploads_v1');
        const uploads = raw ? JSON.parse(raw) : [];
        if (uploads && uploads.length) {
          const latest = uploads[0];
          const byAssessRaw = localStorage.getItem('conseqx_assessments_v1');
          const byOrg = byAssessRaw ? JSON.parse(byAssessRaw) : {};
          const assessments = (byOrg['anon'] || []).reduce((acc, a) => { const k = a.systemId || a.system || a.systemKey; if (k) acc[k] = a.score || acc[k] || 0; return acc; }, {});

          const scoresLocal = SYSTEM_KEYS.reduce((acc, k) => {
            if (assessments[k]) acc[k] = Math.round(Math.max(0, Math.min(100, assessments[k])));
            else if (Array.isArray(latest.analyzedSystems) && latest.analyzedSystems.includes(k)) acc[k] = 70;
            else acc[k] = 50;
            return acc;
          }, {});

          if (!mounted) return;
          setOverview({ scores: scoresLocal, perSystemSeries: SYSTEM_KEYS.reduce((a,k)=>{ a[k]=makeSeriesFromBase(scoresLocal[k]||50, latest.timestamp||Date.now()); return a; }, {}) });
          return;
        }

        // fallback to API
        const res = await fetch('http://localhost:4001/api/overview');
        const json = await res.json();
        if (!mounted) return;
        setOverview(json);
      } catch (e) {
        // ignore — overview remains null and placeholders will render
      }
    }

    load();

    function onStorage(e) { if (!e.key || e.key === 'conseqx_uploads_v1' || e.key === 'conseqx_assessments_v1') load(); }
    window.addEventListener('storage', onStorage);
    let bc;
    try { if (typeof BroadcastChannel !== 'undefined') { bc = new BroadcastChannel('conseqx_assessments'); bc.addEventListener('message', (ev)=> { if (ev?.data?.type === 'assessments:update') load(); }); } } catch {}

    return () => { mounted = false; window.removeEventListener('storage', onStorage); if (bc) try { bc.close(); } catch {} };
  }, []);

  const scores = overview?.scores || SYSTEM_KEYS.reduce((a,k)=> (a[k]=50,a), {});
  const perSystemSeries = overview?.perSystemSeries || {};

  // build simple root causes from low-scoring systems
  const rootCauses = Object.keys(scores).map((k, idx) => ({
    id: k,
    title: k,
    impact: scores[k] >= 70 ? 'low' : scores[k] >= 50 ? 'medium' : 'high',
    causes: [`Low metric in ${k}`, 'Process gap', 'Ownership unclear']
  })).filter(r => r);

  const iterationSeries = (perSystemSeries['iteration'] || []).map(d => ({ date: new Date(d.ts), value: d.value }));

  return (
    <div>
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100': 'text-gray-900'}`}>System Deep Dive</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Dependency Map</div>
          <div className="mt-3 text-xs text-gray-400">Interactive network graph (simple layout). Click nodes for more details in future iterations.</div>
          <div className="mt-4 h-64 border rounded bg-black/5 flex items-center justify-center">
            <SimpleDependencyMap systems={SYSTEM_KEYS.map(k => ({ key: k, title: k }))} scores={scores} />
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Iteration Trend Chart</div>
          <div className="mt-3 h-48 border rounded p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={iterationSeries} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={(d)=> new Date(d).toLocaleDateString()} />
                <YAxis domain={[0,100]} />
                <Tooltip labelFormatter={(l)=> l ? new Date(l).toLocaleString() : ''} formatter={(v)=> `${v}%`} />
                <Line type="monotone" dataKey="value" stroke="#60A5FA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Root Cause Tree</div>
          <div className="mt-3 text-xs text-gray-400">Expandable root cause list generated from current data.</div>
          <div className="mt-4 h-48 border rounded p-2 overflow-auto">
            <RootCauseTree rootCauses={rootCauses} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Narrative Insights</div>
          <div className="mt-3 text-xs text-gray-400">AI-generated summaries (synthetic):</div>
          <div className="mt-3 space-y-2">
            <div className="p-3 rounded border">Based on recent uploads, the highest risk areas are {Object.keys(scores).filter(k=>scores[k]<50).join(', ') || 'none'}. Recommend targeted sprints to address ownership and measurement.</div>
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Alignment Heatmap</div>
          <div className="mt-3 h-48 border rounded p-2">
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(scores).map((k) => (
                <div key={k} className="p-2 rounded flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${scores[k] >= 70 ? 'bg-green-500' : scores[k] >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>{scores[k]}%</div>
                  <div className="text-xs mt-2">{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
