import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { FaToggleOn, FaToggleOff, FaDatabase, FaSignal, FaBrain } from 'react-icons/fa';
import CustomizationPanel from './components/CustomizationPanel';
import useLiveUpdates from './useLiveUpdates';
import AINarration from './AINarration';
import { exportToCSV, exportToPDF, shareToEmail } from './exportUtils';

// Partner Dashboard shell: provides internal navigation for CEO-level views.
export default function PartnerDashboard() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  const orgId = outlet?.org?.id || outlet?.org?.orgId || "anon";

  const KEY = 'conseqx_partner_dashboard_widgets_v1';
  const DASHBOARD_MODE_KEY = 'conseqx_dashboard_mode_v1';
  
  // Dashboard mode state - 'manual' or 'auto'
  const [dashboardMode, setDashboardMode] = React.useState(() => {
    try { 
      const saved = localStorage.getItem(DASHBOARD_MODE_KEY); 
      return saved || 'manual'; 
    } catch { 
      return 'manual'; 
    }
  });

  const savedOrder = React.useMemo(() => {
    try { 
      const raw = localStorage.getItem(KEY); 
      const saved = raw ? JSON.parse(raw) : null;
      // If saved order doesn't include data-management, reset to default
      if (saved && !saved.includes('data-management')) {
        return null;
      }
      return saved;
    } catch { 
      return null; 
    }
  }, []);




  // Force update localStorage with correct tab order
  React.useEffect(() => {
    const defaultOrder = ['overview','data-management','deep-dive','forecast','recommendations','benchmarking'];
    try {
      // Force clear and reset to ensure data-management appears
      localStorage.setItem(KEY, JSON.stringify(defaultOrder));
    } catch (e) {
      console.warn('Could not update navigation order:', e);
    }
  }, []);

  // Listen for mode changes from DataManagementView
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(DASHBOARD_MODE_KEY);
        if (saved && saved !== dashboardMode) {
          setDashboardMode(saved);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dashboardMode]);

 
  const navItem = (to, label) => {
    const full = `/ceo/partner-dashboard/${to}`;
    return (
      <NavLink 
        key={to}
        to={full} 
        className={({isActive}) => `px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : (darkMode ? 'text-gray-200 hover:bg-gray-800/30' : 'text-gray-700 hover:bg-gray-100')}`}
      >
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
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>C-Suite</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive organizational health monitoring and analysis
          </p>
        </div>
        
        {/* Dashboard Controls - Right Side */}
        <div className="flex flex-col gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${connected ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-700' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-700'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} ${connected ? 'animate-pulse' : ''}`}></div>
            <span className="font-medium whitespace-nowrap">
              {connected ? 'Real-time Data Connected' : 'Data Connection Offline'}
            </span>
          </div>
          
          {/* AI Analysis Button */}
          <button 
            onClick={() => setAiOpen((s)=>!s)} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <FaBrain size={14} />
            ULTRA Analysis
          </button>
        </div>
      </div>

      {/* Connection Status Details */}
      <div className="mb-6">
        {!connected && (
          <div className={`p-3 rounded-lg border ${darkMode ? 'bg-red-900/10 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <div className="text-xs text-red-600 dark:text-red-400">
              • WebSocket connection to localhost:4002 failed
              <br />
              • Live updates and real-time monitoring unavailable
              <br />
              • Run <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">node server/mockWsServer.js</code> to enable live data
            </div>
          </div>
        )}
        {connected && (
          <div className={`p-3 rounded-lg border ${darkMode ? 'bg-green-900/10 border-green-700' : 'bg-green-50 border-green-200'}`}>
            <div className="text-xs text-green-600 dark:text-green-400">
              • Real-time organizational health monitoring active
              <br />
              • Live system updates every 5-10 seconds
              <br />
              • WebSocket connection stable
            </div>
          </div>
        )}
      </div>


      {/* Navigation for detailed views - Desktop Only */}
      <div className="flex gap-4">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:block w-64 rounded-lg p-4 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-3">Detailed Analysis</h3>
            <p className="text-xs text-gray-500 mb-4">
              Explore in-depth views and advanced analytics
            </p>
          </div>
          
          <nav className="flex flex-col gap-2">
            {/* Force all tabs to appear in correct order */}
            {navItem('overview', 'System Overview')}
            <div className="relative">
              {navItem('data-management', 'Data Management')}
              <div className="absolute -right-2 -top-1 flex items-center">
                {dashboardMode === 'manual' ? (
                  <div className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <FaDatabase size={8} />
                    <span>M</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <FaSignal size={8} />
                    <span>A</span>
                  </div>
                )}
              </div>
            </div>
            {navItem('deep-dive', 'Deep Dive Analysis')}
            {navItem('forecast', 'Forecast & Scenarios')}
            {navItem('recommendations', 'Action Items')}
            {navItem('benchmarking', 'Industry Benchmarks')}
          </nav>
        </aside>


        <main className="flex-1">
          {/* Render nested routes from App.js here */}
          <Outlet context={{ darkMode, orgId, dashboardMode }} />
        </main>
      </div>

      {/* AI Narration Modal */}
      {aiOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <AINarration onClose={() => setAiOpen(false)} darkMode={darkMode} />
          </div>
        </div>
      )}
    </div>
  );
}
