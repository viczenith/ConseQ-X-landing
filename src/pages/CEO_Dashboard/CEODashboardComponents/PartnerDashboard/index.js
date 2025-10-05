import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import CustomizationPanel from './components/CustomizationPanel';
import useLiveUpdates from './useLiveUpdates';
import AINarration from './AINarration';
import { exportToCSV, exportToPDF, shareToEmail } from './exportUtils';

// Partner Dashboard shell: provides internal navigation for CEO-level views.
export default function PartnerDashboard() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;

  const KEY = 'conseqx_partner_dashboard_widgets_v1';
  const savedOrder = React.useMemo(() => {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }, []);

  const navItem = (to, label) => {
    const full = `/ceo/partner-dashboard/${to}`;
    return (
      <NavLink to={full} className={({isActive}) => `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-blue-600 text-white' : (darkMode ? 'text-gray-200 hover:bg-gray-800/30' : 'text-gray-700 hover:bg-gray-100')}`}>
        {label}
      </NavLink>
    );
  };

  const { connected } = useLiveUpdates('ws://localhost:4002');
  const [aiOpen, setAiOpen] = React.useState(false);
  const [lastUpload, setLastUpload] = React.useState(() => {
    try { const raw = localStorage.getItem('conseqx_uploads_v1'); const arr = raw ? JSON.parse(raw) : []; return arr && arr.length ? arr[0] : null; } catch { return null; }
  });

  React.useEffect(() => {
    function onStorage(e) {
      if (!e.key || e.key === 'conseqx_uploads_v1') {
        try { const raw = localStorage.getItem('conseqx_uploads_v1'); const arr = raw ? JSON.parse(raw) : []; setLastUpload(arr && arr.length ? arr[0] : null); } catch {}
      }
    }
    window.addEventListener('storage', onStorage);
    let bc = null;
    try {
      bc = new BroadcastChannel('conseqx_assessments');
      bc.addEventListener('message', (ev) => { if (ev?.data?.type === 'assessments:update') onStorage({ key: 'conseqx_uploads_v1' }); });
    } catch (e) {
      bc = null;
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="min-h-[60vh]">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>C-Suite Partner — CEO Command Center</h2>
          <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Growth, risk, and performance at a glance. Use the left navigation to explore views.</p>
        </div>
        <div>
          <CustomizationPanel />
        </div>
      </div>

      <div className="flex gap-4">
        <aside className={`w-56 rounded p-3 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <nav className="flex flex-col gap-2">
            {(savedOrder || ['overview','deep-dive','forecast','recommendations','benchmarking']).map((k) => {
              switch(k) {
                case 'overview': return navItem('overview', 'Overview');
                case 'deep-dive': return navItem('deep-dive', 'System Deep Dive');
                case 'forecast': return navItem('forecast', 'Forecast & Scenarios');
                case 'recommendations': return navItem('recommendations', 'Recommendations & Actions');
                case 'benchmarking': return navItem('benchmarking', 'Benchmarking & Trends');
                default: return null;
              }
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">Latest upload:</div>
              <div className="text-sm font-medium">{lastUpload ? `${lastUpload.name} · ${new Date(lastUpload.timestamp).toLocaleString()}` : 'No uploads'}</div>
              <div className={`px-2 py-1 rounded text-xs ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{connected ? 'Live' : 'Offline'}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* Exports/sharing only visible to CEO role */}
              {outlet?.user?.role === 'ceo' && (
                <>
                  <button onClick={() => exportToCSV('systems.csv', [{ name: 'placeholder' }])} className="px-3 py-1 rounded border text-sm">Export CSV</button>
                  <button onClick={() => exportToPDF(document.body, 'dashboard.txt')} className="px-3 py-1 rounded border text-sm">Export PDF</button>
                  <button onClick={() => shareToEmail('ceo@example.com', 'Dashboard snapshot', lastUpload ? `${lastUpload.name} - ${new Date(lastUpload.timestamp).toLocaleString()}` : 'No upload')} className="px-3 py-1 rounded border text-sm">Share</button>
                </>
              )}
              <button onClick={() => setAiOpen((s)=>!s)} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">AI Narration</button>
            </div>
          </div>

          {/* Render nested routes from App.js here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
