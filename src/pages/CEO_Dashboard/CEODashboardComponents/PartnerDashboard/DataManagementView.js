import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ManualDataMode from './components/ManualDataMode';
import AutoDataMode from './components/AutoDataMode';
import { FaDatabase, FaSignal, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function DataManagementView() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  const orgId = outlet?.orgId || "anon";
  const globalDashboardMode = outlet?.dashboardMode || 'manual';

  // Local mode state for this tab (independent of global mode)
  const [localMode, setLocalMode] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_data_management_mode_v1');
      return saved || globalDashboardMode;
    } catch {
      return globalDashboardMode;
    }
  });

  const toggleLocalMode = () => {
    const newMode = localMode === 'manual' ? 'auto' : 'manual';
    setLocalMode(newMode);
    try {
      localStorage.setItem('conseqx_data_management_mode_v1', newMode);
      // Update the global dashboard mode as well
      localStorage.setItem('conseqx_dashboard_mode_v1', newMode);
      // Trigger storage event to notify parent component
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'conseqx_dashboard_mode_v1',
        newValue: newMode
      }));
    } catch {}
  };

  return (
    <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"}`}>
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Data Management</h2>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Manage data sources and configure data management protocols preferences
          </p>
          <p className="text-xs text-blue-500 mt-1">
            ✅ Data Management tab is now active and working
          </p>
        </div>

        {/* Local Mode Toggle */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <FaDatabase className={`${localMode === 'manual' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${localMode === 'manual' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>
              Manual Upload
            </span>
          </div>
          
          <button
            onClick={toggleLocalMode}
            className="flex items-center"
            title={`Switch to ${localMode === 'manual' ? 'Auto Sync' : 'Manual Upload'} mode`}
          >
            {localMode === 'manual' ? (
              <FaToggleOff className="text-2xl text-gray-400 hover:text-blue-600 transition-colors" />
            ) : (
              <FaToggleOn className="text-2xl text-blue-600 hover:text-blue-700 transition-colors" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <FaSignal className={`${localMode === 'auto' ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${localMode === 'auto' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>
              Auto Sync
            </span>
          </div>
        </div>
      </div>

      {/* Mode Description */}
      <div className={`mb-6 p-4 rounded-lg border ${
        localMode === 'manual' 
          ? (darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-100/50 border-blue-300')
          : (darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-100/50 border-green-300')
      }`}>
        <div className="flex items-center gap-3">
          {localMode === 'manual' ? (
            <>
              <FaDatabase className={`flex-shrink-0 ${
                darkMode ? 'text-blue-400' : 'text-blue-700'
              }`} />
              <div>
                <div className={`font-semibold ${
                  darkMode ? 'text-blue-100' : 'text-blue-900'
                }`}>Manual Upload Mode</div>
                <div className={`text-sm ${
                  darkMode ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  Upload organizational datasets through guided workflows. Perfect for periodic analysis and comprehensive reporting.
                </div>
              </div>
            </>
          ) : (
            <>
              <FaSignal className={`flex-shrink-0 ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`} />
              <div>
                <div className={`font-semibold ${
                  darkMode ? 'text-green-100' : 'text-green-900'
                }`}>Auto Sync Mode</div>
                <div className={`text-sm ${
                  darkMode ? 'text-green-200' : 'text-green-800'
                }`}>
                  Configure automatic data synchronization and real-time data management protocols. Ideal for continuous operational oversight.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Render appropriate data management mode */}
      <div>
        {localMode === 'manual' ? (
          <ManualDataMode darkMode={darkMode} orgId={orgId} />
        ) : (
          <AutoDataMode darkMode={darkMode} orgId={orgId} />
        )}
      </div>
    </div>
  );
}