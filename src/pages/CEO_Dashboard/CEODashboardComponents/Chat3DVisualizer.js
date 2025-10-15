import React, { useEffect, useRef, useState } from "react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Advanced 3D CSS transforms and animations
const CHART_STYLES = `
  .chart-3d-container {
    perspective: 1200px;
    perspective-origin: center center;
    transform-style: preserve-3d;
  }
  
  .chart-3d-surface {
    transform: rotateX(15deg) rotateY(-8deg) translateZ(20px);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.1), 
      rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .chart-3d-surface:hover {
    transform: rotateX(10deg) rotateY(-5deg) translateZ(40px) scale(1.02);
    box-shadow: 
      0 35px 70px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .chart-hologram {
    position: relative;
    overflow: hidden;
  }
  
  .chart-hologram::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(0, 255, 255, 0.1),
      transparent,
      rgba(255, 0, 255, 0.1),
      transparent
    );
    animation: hologram-scan 4s linear infinite;
    pointer-events: none;
    z-index: 1;
  }
  
  @keyframes hologram-scan {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
  
  .metric-cube {
    transform-style: preserve-3d;
    animation: rotate-cube 8s linear infinite;
  }
  
  @keyframes rotate-cube {
    0% { transform: rotateX(0deg) rotateY(0deg); }
    25% { transform: rotateX(90deg) rotateY(0deg); }
    50% { transform: rotateX(90deg) rotateY(90deg); }
    75% { transform: rotateX(0deg) rotateY(90deg); }
    100% { transform: rotateX(0deg) rotateY(0deg); }
  }
  
  .neural-network {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0.3;
  }
  
  .neural-node {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: radial-gradient(circle, #00ff88, #0066ff);
    animation: pulse-node 2s ease-in-out infinite;
  }
  
  @keyframes pulse-node {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.5); opacity: 1; }
  }
  
  .data-stream {
    position: absolute;
    width: 2px;
    height: 100px;
    background: linear-gradient(to bottom, #00ff88, transparent);
    animation: data-flow 1.5s linear infinite;
  }
  
  @keyframes data-flow {
    0% { transform: translateY(-100px); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(100px); opacity: 0; }
  }
`;

// 3D Organizational Health Globe
function OrganizationalHealthGlobe({ data, darkMode }) {
  const globeRef = useRef(null);
  
  useEffect(() => {
    // Add rotation animation
    if (globeRef.current) {
      globeRef.current.style.animation = 'rotate-globe 20s linear infinite';
    }
  }, []);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <style>{`
        @keyframes rotate-globe {
          0% { transform: rotateY(0deg) rotateX(10deg); }
          100% { transform: rotateY(360deg) rotateX(10deg); }
        }
        .globe-sphere {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(0, 255, 136, 0.8), 
            rgba(0, 102, 255, 0.6), 
            rgba(128, 0, 255, 0.4));
          position: relative;
          transform-style: preserve-3d;
          box-shadow: 
            inset -20px -20px 50px rgba(0, 0, 0, 0.5),
            0 0 50px rgba(0, 255, 136, 0.3);
        }
        .globe-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: 
            repeating-conic-gradient(from 0deg, 
              transparent 0deg, 
              rgba(255, 255, 255, 0.1) 15deg, 
              transparent 30deg),
            repeating-linear-gradient(0deg, 
              transparent 0px, 
              rgba(255, 255, 255, 0.05) 10px, 
              transparent 20px);
        }
      `}</style>
      
      <div ref={globeRef} className="globe-sphere">
        <div className="globe-overlay" />
        
        {/* System Health Indicators */}
        {data.systems?.map((system, index) => (
          <div
            key={system.name}
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: system.score > 70 ? '#00ff88' : system.score > 40 ? '#ffaa00' : '#ff4444',
              top: `${20 + (index * 25)}%`,
              left: `${30 + Math.sin(index) * 30}%`,
              boxShadow: `0 0 15px ${system.score > 70 ? '#00ff88' : system.score > 40 ? '#ffaa00' : '#ff4444'}`,
              animation: `pulse-node ${1 + index * 0.3}s ease-in-out infinite`
            }}
            title={`${system.name}: ${system.score}%`}
          />
        ))}
      </div>
      
      <div className={`absolute bottom-4 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="font-semibold">Organizational Health Universe</div>
        <div className="text-xs">Real-time system interconnections</div>
      </div>
    </div>
  );
}

// 3D Matrix Visualization
function SystemMatrix({ data, darkMode }) {
  return (
    <div className="relative w-full h-80">
      <style>{`
        .matrix-grid {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .matrix-cell {
          transform-style: preserve-3d;
          transition: all 0.3s ease;
        }
        .matrix-cell:hover {
          transform: translateZ(20px) scale(1.1);
        }
      `}</style>
      
      <div className="matrix-grid h-full grid grid-cols-3 gap-4 p-4">
        {data.systems?.slice(0, 6).map((system, index) => (
          <div
            key={system.name}
            className={`matrix-cell relative rounded-lg p-4 ${
              darkMode ? 'bg-gray-800/50' : 'bg-white/50'
            } backdrop-blur-sm border border-white/20`}
            style={{
              transform: `rotateX(${10 + index * 5}deg) rotateY(${-5 + index * 3}deg) translateZ(${index * 10}px)`,
              background: `linear-gradient(135deg, 
                hsla(${120 + system.score * 2}, 70%, 50%, 0.2), 
                hsla(${240 - system.score}, 70%, 50%, 0.1))`
            }}
          >
            <div className="text-lg font-bold text-center mb-2">
              {system.score}%
            </div>
            <div className="text-xs text-center opacity-80">
              {system.name}
            </div>
            
            {/* 3D Bar */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div
                className="w-2 bg-gradient-to-t from-blue-500 to-cyan-400"
                style={{
                  height: `${system.score}px`,
                  transform: 'rotateX(90deg)',
                  transformOrigin: 'bottom'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3D Performance Pyramid
function PerformancePyramid({ data, darkMode }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <style>{`
        .pyramid {
          width: 0;
          height: 0;
          border-left: 100px solid transparent;
          border-right: 100px solid transparent;
          border-bottom: 150px solid rgba(0, 255, 136, 0.6);
          position: relative;
          transform: rotateX(20deg) rotateY(20deg);
          transform-style: preserve-3d;
          animation: pyramid-rotate 10s linear infinite;
        }
        @keyframes pyramid-rotate {
          0% { transform: rotateX(20deg) rotateY(0deg); }
          100% { transform: rotateX(20deg) rotateY(360deg); }
        }
        .pyramid-level {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        }
      `}</style>
      
      <div className="pyramid">
        {/* Performance levels */}
        <div 
          className="pyramid-level"
          style={{
            width: '60px',
            height: '20px',
            background: 'rgba(255, 68, 68, 0.8)',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Critical
        </div>
        
        <div 
          className="pyramid-level"
          style={{
            width: '80px',
            height: '25px',
            background: 'rgba(255, 170, 0, 0.8)',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Improving
        </div>
        
        <div 
          className="pyramid-level"
          style={{
            width: '100px',
            height: '30px',
            background: 'rgba(0, 255, 136, 0.8)',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Excellent
        </div>
      </div>
      
      <div className={`absolute bottom-0 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="font-semibold">Performance Hierarchy</div>
        <div className="text-xs">System excellence distribution</div>
      </div>
    </div>
  );
}

// Main 3D Visualizer Component
export default function Chat3DVisualizer({ 
  visualType = 'globe', 
  data = {}, 
  darkMode = false,
  title = "3D Analysis",
  interactive = true 
}) {
  const [currentView, setCurrentView] = useState(visualType);
  const [liveData, setLiveData] = useState(data);
  const containerRef = useRef(null);

  // Listen for live data updates
  useEffect(() => {
    const handleDataUpdate = (event) => {
      if (event.detail && event.detail.assessments) {
        // Update visualization with new assessment data
        setLiveData(prevData => ({
          ...prevData,
          lastUpdated: new Date().toISOString(),
          isLive: true
        }));
      }
    };

    window.addEventListener('assessmentDataUpdated', handleDataUpdate);
    
    // Also listen for storage changes directly
    const handleStorageChange = (e) => {
      if (e.key === 'conseqx_assessments_v1' || e.key === 'conseqx_uploads_v1') {
        setLiveData(prevData => ({
          ...prevData,
          lastUpdated: new Date().toISOString(),
          isLive: true
        }));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('assessmentDataUpdated', handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update view when visualType prop changes
  useEffect(() => {
    setCurrentView(visualType);
  }, [visualType]);

  // Sample data structure for visualization
  const defaultData = {
    systems: [
      { name: 'Interdependency', score: 78, trend: 'up', source: 'assessment' },
      { name: 'Iteration', score: 65, trend: 'stable', source: 'upload' },
      { name: 'Investigation', score: 82, trend: 'up', source: 'assessment' },
      { name: 'Interpretation', score: 59, trend: 'down', source: 'estimated' },
      { name: 'Illustration', score: 74, trend: 'up', source: 'upload' },
      { name: 'Alignment', score: 68, trend: 'stable', source: 'assessment' }
    ],
    overall_health: 71,
    timestamp: new Date().toISOString(),
    total_systems: 6,
    critical_systems: 1,
    excellent_systems: 2,
    improving_systems: 3,
    data_sources: {
      assessments: 3,
      uploads: 2,
      estimated: 1,
      default: 0
    }
  };

  const visualData = { ...defaultData, ...data, ...liveData };

  const renderVisualization = () => {
    switch (currentView) {
      case 'globe':
        return <OrganizationalHealthGlobe data={visualData} darkMode={darkMode} />;
      case 'matrix':
        return <SystemMatrix data={visualData} darkMode={darkMode} />;
      case 'pyramid':
        return <PerformancePyramid data={visualData} darkMode={darkMode} />;
      default:
        return <OrganizationalHealthGlobe data={visualData} darkMode={darkMode} />;
    }
  };

  return (
    <div className="w-full my-4">
      <style>{CHART_STYLES}</style>
      
      <div className={`chart-3d-container ${darkMode ? 'bg-gray-900/30' : 'bg-white/30'} rounded-xl p-4`}>
        {/* Header with view controls */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {title}
          </h3>
          
          {interactive && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('globe')}
                className={`px-3 py-1 rounded text-xs ${
                  currentView === 'globe'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Globe
              </button>
              <button
                onClick={() => setCurrentView('matrix')}
                className={`px-3 py-1 rounded text-xs ${
                  currentView === 'matrix'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Matrix
              </button>
              <button
                onClick={() => setCurrentView('pyramid')}
                className={`px-3 py-1 rounded text-xs ${
                  currentView === 'pyramid'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Pyramid
              </button>
            </div>
          )}
        </div>

        {/* 3D Visualization Container */}
        <div 
          ref={containerRef}
          className="chart-3d-surface chart-hologram relative"
        >
          {renderVisualization()}
          
          {/* Neural Network Overlay */}
          <div className="neural-network">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="neural-node"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
            
            {[...Array(4)].map((_, i) => (
              <div
                key={`stream-${i}`}
                className="data-stream"
                style={{
                  left: `${20 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Metrics Display */}
        <div className="mt-4 space-y-4">
          {/* Primary Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${darkMode ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="text-2xl font-bold text-green-400">{visualData.overall_health}%</div>
                {visualData.isLive && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Overall Health {visualData.isLive ? '• Live' : ''}
              </div>
            </div>
            
            <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${darkMode ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
              <div className="text-2xl font-bold text-blue-400">{visualData.total_systems || visualData.systems?.length || 6}</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Systems Active</div>
            </div>
            
            <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${darkMode ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
              <div className="text-2xl font-bold text-purple-400">
                {visualData.improving_systems || visualData.systems?.filter(s => s.trend === 'up').length || 3}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Improving</div>
            </div>
          </div>

          {/* Data Sources Indicator */}
          {visualData.data_sources && (
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-sm border ${darkMode ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
              <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Data Sources
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {visualData.data_sources.assessments || 0}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Assessed
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {visualData.data_sources.uploads || 0}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Uploaded
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {visualData.data_sources.estimated || 0}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Estimated
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {(visualData.critical_systems || 0) + (visualData.excellent_systems || 0)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Key Systems
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center">
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated: {visualData.lastUpdated 
                ? new Date(visualData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(visualData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

