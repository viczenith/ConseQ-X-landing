import React from 'react';
import { NavLink, Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import { FaBrain, FaRobot, FaComments, FaLightbulb, FaChartPie, FaExclamationTriangle } from 'react-icons/fa';
import CustomizationPanel from './components/CustomizationPanel';
import useLiveUpdates from './useLiveUpdates';
import AINarration from './AINarration';
import { exportToCSV, exportToPDF, shareToEmail } from './exportUtils';
import { useIntelligence } from '../../../../contexts/IntelligenceContext';

// Partner Dashboard shell: provides internal navigation for CEO-level views.
export default function PartnerDashboard() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  const orgId = outlet?.org?.id || outlet?.org?.orgId || "anon";
  const navigate = useNavigate();
  
  // X-ULTRA Intelligence Integration
  const intelligence = useIntelligence();
  
  // Live updates hook - must be declared before using 'connected' variable
  const { connected } = useLiveUpdates('ws://localhost:4002');

  const KEY = 'conseqx_partner_dashboard_widgets_v1';

  const savedOrder = React.useMemo(() => {
    try { 
      const raw = localStorage.getItem(KEY); 
      const saved = raw ? JSON.parse(raw) : null;
      return saved;
    } catch { 
      return null; 
    }
  }, []);




  // Force update localStorage with correct tab order
  React.useEffect(() => {
    const defaultOrder = ['overview','deep-dive','forecast','recommendations','benchmarking'];
    try {
      localStorage.setItem(KEY, JSON.stringify(defaultOrder));
    } catch (e) {
      console.warn('Could not update navigation order:', e);
    }
  }, []);



 
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
          <div className="flex items-center gap-3 mb-2">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>C-Suite</h2>
            {intelligence.sharedMetrics && (
              <div className="flex items-center gap-2">
                <FaRobot className="text-emerald-500" size={16} />
                <span className="text-xs text-emerald-600 font-medium">X-ULTRA Enhanced</span>
              </div>
            )}
          </div>
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
          
          {/* X-ULTRA Analysis Button */}
          <button 
            onClick={() => setAiOpen((s)=>!s)} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm hover:from-emerald-700 hover:to-blue-700 transition-all whitespace-nowrap shadow-lg"
          >
            <FaBrain size={14} />
            X-ULTRA Analysis
          </button>
          
          {/* Chat Integration Button */}
          <button 
            onClick={() => navigate('/ceo/chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <FaComments size={14} />
            Open X-ULTRA Chat
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

      {/* X-ULTRA Intelligence Panel */}
      {intelligence.sharedMetrics && (
        <div className={`mb-6 p-4 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-blue-50/50 to-emerald-50/50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaRobot className="text-emerald-500" size={18} />
              <h3 className="font-semibold text-lg">X-ULTRA Intelligence</h3>
            </div>
            {intelligence.conversationInsights && intelligence.conversationInsights.length > 0 && (
              <span className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                {intelligence.conversationInsights.length} Active Insights
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Live Metrics Summary */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FaChartPie className="text-blue-500" size={14} />
                <h4 className="font-medium text-sm">Live Metrics</h4>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Financial Health</span>
                  <span className="font-medium">{intelligence.sharedMetrics.financialHealth?.score || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Risk Level</span>
                  <span className={`font-medium ${
                    intelligence.sharedMetrics.riskLevel?.level === 'High' ? 'text-red-500' : 
                    intelligence.sharedMetrics.riskLevel?.level === 'Medium' ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {intelligence.sharedMetrics.riskLevel?.level || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Overall Health</span>
                  <span className="font-medium">{intelligence.sharedMetrics.overallHealth?.score || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Recent Insights */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FaLightbulb className="text-yellow-500" size={14} />
                <h4 className="font-medium text-sm">Latest Insight</h4>
              </div>
              {intelligence.conversationInsights && intelligence.conversationInsights.length > 0 ? (
                <div className="text-xs">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                    {intelligence.conversationInsights[0].insight.substring(0, 100)}...
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    intelligence.conversationInsights[0].category === 'Financial' ? 'bg-green-100 text-green-700' :
                    intelligence.conversationInsights[0].category === 'Strategic' ? 'bg-blue-100 text-blue-700' :
                    intelligence.conversationInsights[0].category === 'Risk' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {intelligence.conversationInsights[0].category}
                  </span>
                </div>
              ) : (
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No insights captured yet
                </p>
              )}
            </div>

            {/* Smart Recommendations */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-orange-500" size={14} />
                <h4 className="font-medium text-sm">Smart Alert</h4>
              </div>
              {intelligence.sharedMetrics && (
                <div className="text-xs">
                  {(() => {
                    const recommendations = intelligence.generateRecommendations();
                    return recommendations && recommendations.length > 0 ? (
                      <div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                          {recommendations[0].description}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          recommendations[0].priority === 'high' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {recommendations[0].priority} priority
                        </span>
                      </div>
                    ) : (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        All systems operating within normal parameters
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            {navItem('deep-dive', 'Deep Dive Analysis')}
            {navItem('forecast', 'Forecast & Scenarios')}
            {navItem('recommendations', 'Action Items')}
            {navItem('benchmarking', 'Industry Benchmarks')}
          </nav>
        </aside>


        <main className="flex-1">
          {/* Render nested routes from App.js here */}
          <Outlet context={{ darkMode, orgId }} />
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
