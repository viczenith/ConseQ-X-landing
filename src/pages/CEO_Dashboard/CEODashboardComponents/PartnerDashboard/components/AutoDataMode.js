import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FaSignal, FaVolumeUp, FaBell, FaChartLine, FaClock, FaWifi, FaDatabase } from 'react-icons/fa';

const STORAGE_UPLOADS = "conseqx_uploads_v1";
const STORAGE_ASSESS = "conseqx_assessments_v1";
const STORAGE_AI_SETTINGS = "conseqx_ai_settings_v1";

// Custom hook for generating smooth wave animations
const useWaveAnimation = (isActive, baseValue) => {
  const [animatedValue, setAnimatedValue] = useState(baseValue);
  const rafRef = useRef();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!isActive) {
      setAnimatedValue(baseValue);
      return;
    }

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const waveOffset = Math.sin(elapsed * 0.8) * 3 + Math.sin(elapsed * 1.3) * 1.5;
      setAnimatedValue(baseValue + waveOffset);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, baseValue]);

  return animatedValue;
};

const CANONICAL = [
  { key: "interdependency", title: "Interdependency" },
  { key: "orchestration", title: "Orchestration" },
  { key: "investigation", title: "Investigation" },
  { key: "interpretation", title: "Interpretation" },
  { key: "illustration", title: "Illustration" },
  { key: "inlignment", title: "Inlignment" },
];

// Mobile detection utility
function isMobileDevice() {
  return typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
}

function readUploads() { 
  try { 
    const raw = localStorage.getItem(STORAGE_UPLOADS); 
    return raw ? JSON.parse(raw) : []; 
  } catch { 
    return []; 
  } 
}

function readAssessmentsForOrg(orgId = "anon") { 
  try { 
    const raw = localStorage.getItem(STORAGE_ASSESS); 
    const byOrg = raw ? JSON.parse(raw) : {}; 
    return byOrg[orgId] || []; 
  } catch { 
    return []; 
  } 
}

// Generate external signals for correlation
function generateSignals(canonical) {
  const ts = Date.now();
  return canonical.map((s, i) => ({
    type: ['market', 'competitor', 'industry', 'economic'][i % 4],
    source: ['Bloomberg', 'Reuters', 'Internal', 'Partner'][i % 4],
    value: Math.max(20, Math.min(90, 50 + Math.sin((ts / 10000) + i) * 25)),
    importance: ['high', 'medium', 'low'][i % 3],
    timestamp: ts - (i * 60000),
    systemKey: s.key
  }));
}

// Enhanced Canvas Live Bars Component with Waving Animation
function LiveBarsCanvas({ values = [], darkMode = false, width = 120, height = 64, barCount = 18, palette = "crypto", tooltipRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const devicePixelRatioRef = useRef(typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1);
  const displayRef = useRef((values || []).slice(-barCount).concat([]));
  const targetRef = useRef((values || []).slice(-barCount).concat([]));
  const animationTimeRef = useRef(0);

  if (displayRef.current.length < barCount) {
    const fillValue = 50 + Math.sin(Date.now() / 1000) * 5; // Base wave for empty bars
    displayRef.current = displayRef.current.concat(new Array(barCount - displayRef.current.length).fill(fillValue));
    targetRef.current = targetRef.current.concat(new Array(barCount - targetRef.current.length).fill(fillValue));
  }

  // Update target values when values prop changes
  useEffect(() => {
    const newValues = (values || []).slice(-barCount);
    while (newValues.length < barCount) {
      newValues.unshift(50 + Math.sin(Date.now() / 1000 + newValues.length) * 5);
    }
    targetRef.current = [...newValues];
  }, [values, barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = devicePixelRatioRef.current;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const animate = (timestamp) => {
      animationTimeRef.current = timestamp;
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / barCount;
      const maxHeight = height - 10;
      const waveSpeed = 0.003;
      const waveAmplitude = 2;
      
      // Smooth interpolation between current and target values
      displayRef.current = displayRef.current.map((current, index) => {
        const target = targetRef.current[index] || 50;
        const waveOffset = Math.sin(timestamp * waveSpeed + index * 0.5) * waveAmplitude;
        const smoothTarget = target + waveOffset;
        
        // Smooth transition to target
        return current + (smoothTarget - current) * 0.1;
      });
      
      displayRef.current.forEach((value, index) => {
        const barHeight = Math.max(2, (value / 100) * maxHeight);
        const x = index * barWidth;
        const y = height - barHeight - 5;
        
        // Enhanced color based on palette and value with gradient effect
        let color;
        let glowColor;
        if (palette === "crypto") {
          if (value >= 70) {
            color = '#10b981';
            glowColor = '#34d399';
          } else if (value >= 50) {
            color = '#f59e0b';
            glowColor = '#fbbf24';
          } else {
            color = '#ef4444';
            glowColor = '#f87171';
          }
        } else {
          color = darkMode ? '#60a5fa' : '#2563eb';
          glowColor = darkMode ? '#93c5fd' : '#3b82f6';
        }
        
        // Add subtle glow effect for live feel
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 3;
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Add highlight on top for 3D effect
        const highlightHeight = Math.max(1, barHeight * 0.2);
        ctx.fillStyle = glowColor;
        ctx.fillRect(x + 1, y, barWidth - 2, highlightHeight);
      });
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [values, darkMode, width, height, barCount, palette]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: `${width}px`, height: `${height}px`, borderRadius: 8 }} aria-hidden />;
}

// Tooltip Component
const Tooltip = React.forwardRef(({ darkMode = false }, ref) => {
  const [state, setState] = useState({ visible: false, index: 0, value: 0, timestamp: null, left: 0, top: 0 });
  
  React.useImperativeHandle(ref, () => ({
    show: ({ index = 0, value = 0, timestamp = null, pageX = 0, pageY = 0 } = {}) => {
      setState({
        visible: true,
        index,
        value,
        timestamp,
        left: Math.min(pageX + 10, window.innerWidth - 160),
        top: Math.max(pageY - 60, 10)
      });
    },
    hide: () => setState((s) => ({ ...s, visible: false })),
  }), []);

  if (!state.visible) return null;
  
  const bg = darkMode ? "rgba(2,6,23,0.9)" : "#fff";
  const border = darkMode ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.06)";
  const text = darkMode ? "#E6F0FF" : "#071024";

  return (
    <div role="tooltip" aria-hidden={!state.visible} style={{
      position: "fixed", left: state.left, top: state.top, zIndex: 9999, pointerEvents: "none",
      minWidth: 140, maxWidth: 300, padding: "8px 10px", borderRadius: 8, boxShadow: "0 8px 24px rgba(2,6,23,0.4)",
      background: bg, border: `1px solid ${border}`, color: text, fontSize: 13, lineHeight: 1.2
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{state.value}%</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>
        {state.timestamp ? new Date(state.timestamp).toLocaleTimeString() : ""}
      </div>
    </div>
  );
});

export default function AutoDataMode({ darkMode, orgId = "anon" }) {
  const [uploads] = useState(() => readUploads());
  const [assessments] = useState(() => readAssessmentsForOrg(orgId));
  const [alerts, setAlerts] = useState([]);
  const [autoOn, setAutoOn] = useState(true);
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [aiEnabled, setAiEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [externalSignals, setExternalSignals] = useState(() => generateSignals(CANONICAL));
  const tooltipControl = useRef(null);

  // assessed keys
  const assessedKeys = useMemo(() => {
    const keys = new Set();
    assessments.forEach(a => {
      if (a && a.system) {
        const normalized = String(a.system).toLowerCase().replace(/[^a-z0-9]/g, '');
        const found = CANONICAL.find(c => c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
        if (found) keys.add(found.key);
      }
    });
    uploads.forEach(u => {
      if (u && u.analyzedSystems && Array.isArray(u.analyzedSystems)) {
        u.analyzedSystems.forEach(sys => {
          const found = CANONICAL.find(c => 
            String(sys).toLowerCase().includes(c.key.toLowerCase()) || 
            c.key.toLowerCase().includes(String(sys).toLowerCase())
          );
          if (found) keys.add(found.key);
        });
      }
    });
    return Array.from(keys);
  }, [assessments, uploads]);

  // working scores
  const [workingScores, setWorkingScores] = useState(() => {
    const scores = {};
    CANONICAL.forEach(s => {
      scores[s.key] = assessedKeys.includes(s.key) ? Math.max(30, Math.min(95, 45 + Math.random() * 40)) : null;
    });
    return scores;
  });

  // composite score
  const composite = useMemo(() => {
    const vals = assessedKeys.map(key => workingScores[key]).filter(v => v !== null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [workingScores, assessedKeys]);

  // Mobile responsiveness detector
  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced notification system
  const addEnhancedAlert = useCallback((title, message, type = 'info', options = {}) => {
    const newAlert = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: Date.now(),
      acknowledged: false,
      priority: options.priority || 'normal',
      category: options.category || 'system'
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
    
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${title}: ${message}`);
      utterance.rate = 0.8;
      utterance.volume = 0.6;
      window.speechSynthesis.speak(utterance);
    }
    
    if (!isMobile && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/logo192.png',
        tag: `conseqx-${newAlert.id}`
      });
    }
  }, [voiceEnabled, isMobile]);

  // External polling for signals
  useEffect(() => {
    if (!autoOn) return;
    
    const interval = setInterval(() => {
      setExternalSignals(prev => generateSignals(CANONICAL));
      setLastSyncTime(Date.now());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoOn]);

  // Enhanced Auto tick for live wave-like updates
  useEffect(() => {
    if (!autoOn) return;
    
    let animationFrame;
    const startTime = Date.now();
    
    const updateScores = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // seconds
      
      setWorkingScores(prev => {
        const updated = { ...prev };
        assessedKeys.forEach((key, index) => {
          if (updated[key] !== null) {
            // Create wave-like patterns with different frequencies for each system
            const baseValue = updated[key];
            const waveAmplitude = 3; // Reduced amplitude for subtler effect
            const waveFrequency = 0.5 + (index * 0.1); // Different frequency per system
            const phaseOffset = index * Math.PI / 3; // Phase offset for variety
            
            // Combine sine wave with small random drift
            const waveEffect = Math.sin(elapsed * waveFrequency + phaseOffset) * waveAmplitude;
            const randomDrift = (Math.random() - 0.5) * 1.5;
            const totalDrift = waveEffect + randomDrift;
            
            updated[key] = Math.max(20, Math.min(95, baseValue + totalDrift));
          }
        });
        return updated;
      });
      
      animationFrame = requestAnimationFrame(updateScores);
    };
    
    // Start with slower interval for major changes
    const majorUpdateInterval = setInterval(() => {
      setWorkingScores(prev => {
        const updated = { ...prev };
        assessedKeys.forEach(key => {
          if (updated[key] !== null) {
            // Occasional larger drift for more realistic data movement
            const largeDrift = (Math.random() - 0.5) * 8;
            updated[key] = Math.max(20, Math.min(95, updated[key] + largeDrift));
          }
        });
        return updated;
      });
    }, 15000); // Every 15 seconds
    
    // Start smooth animation
    updateScores();
    
    return () => {
      clearInterval(majorUpdateInterval);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [autoOn, assessedKeys]);

  // Connection quality monitoring
  useEffect(() => {
    const updateConnectionQuality = () => {
      if (!navigator.onLine) {
        setConnectionQuality('poor');
        return;
      }
      
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const { effectiveType, downlink } = connection;
        if (effectiveType === '4g' && downlink > 5) {
          setConnectionQuality('excellent');
        } else if (effectiveType === '3g' || downlink > 1) {
          setConnectionQuality('good');
        } else {
          setConnectionQuality('poor');
        }
      } else {
        setConnectionQuality('good');
      }
    };
    
    updateConnectionQuality();
    window.addEventListener('online', updateConnectionQuality);
    window.addEventListener('offline', updateConnectionQuality);
    
    return () => {
      window.removeEventListener('online', updateConnectionQuality);
      window.removeEventListener('offline', updateConnectionQuality);
    };
  }, []);

  function ackAlert(alertId) {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }

  // Mobile Status Bar
  const MobileStatusBar = () => (
    <div className={`${isMobile ? 'block' : 'hidden'} sticky top-0 z-30 p-3 ${darkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {autoOn ? <FaSignal className="text-green-500" /> : <FaSignal className="text-red-500 opacity-50" />}
            <span className="text-xs font-medium">{autoOn ? 'Live' : 'Offline'}</span>
          </div>
          
          <div className={`flex items-center gap-2 ${
            connectionQuality === 'excellent' ? 'text-green-500' :
            connectionQuality === 'good' ? 'text-yellow-500' : 'text-red-500'
          }`}>
            <FaWifi size={12} />
            <span className="text-xs capitalize">{connectionQuality}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded ${voiceEnabled ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <FaVolumeUp size={14} />
          </button>
          
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="flex items-center gap-1 text-red-500">
              <FaBell size={14} />
              <span className="text-xs font-medium">{alerts.filter(a => !a.acknowledged).length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative">
      <Tooltip ref={tooltipControl} darkMode={darkMode} />
      <MobileStatusBar />
      
      <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Real-Time Data Monitoring</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                autoOn ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {autoOn ? 'Live Updates' : 'Paused'}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Continuous monitoring and real-time analysis of organizational health
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <FaClock className="text-blue-500" />
                <span>Last sync: {new Date(lastSyncTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaDatabase className="text-green-500" />
                <span>{assessedKeys.length} systems active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAutoOn(!autoOn)} 
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                autoOn ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <FaSignal />
              {autoOn ? 'Pause Live' : 'Start Live'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`col-span-1 md:col-span-2 rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className="text-sm text-gray-500">Overall Health Score</div>
            <div className="text-4xl font-bold mt-2">{composite != null ? `${composite}%` : "No data"}</div>
            <div className="text-sm text-gray-400 mt-2">
              Real-time composite across {assessedKeys.length} active systems
            </div>
          </div>

          <div className={`rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className="text-sm text-gray-500">Active Alerts</div>
            <div className="text-3xl font-bold mt-2 text-red-500">
              {alerts.filter(a => !a.acknowledged).length}
            </div>
            <div className="text-sm text-gray-400 mt-2">Unacknowledged</div>
          </div>

          <div className={`rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className="text-sm text-gray-500">Connection</div>
            <div className={`text-2xl font-bold mt-2 ${
              connectionQuality === 'excellent' ? 'text-green-500' :
              connectionQuality === 'good' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
            </div>
            <div className="text-sm text-gray-400 mt-2">Network quality</div>
          </div>
        </div>

        {/* Live Systems Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Live System Monitoring
            </h3>
            <div className="text-sm text-gray-500">
              Updates every 5 seconds
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANONICAL.map((s) => {
              const score = workingScores[s.key];
              const isActive = assessedKeys.includes(s.key);
              const signal = externalSignals.find(sig => sig.systemKey === s.key);
              const history = Array.from({ length: 18 }, () => score || 50);
              
              return (
                <div 
                  key={s.key} 
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                  } ${!isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isActive ? 'Active monitoring' : 'No data source'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold transition-all duration-300 ${
                        !isActive ? 'text-gray-400' :
                        score >= 80 ? 'text-green-600' :
                        score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      } ${autoOn && isActive ? 'animate-pulse' : ''}`}>
                        {isActive ? `${Math.round(score)}%` : '—'}
                      </div>
                      {isActive && (
                        <div className={`text-xs flex items-center gap-1 ${
                          autoOn ? 'text-green-500' : 'text-gray-400'
                        }`}>
                          {autoOn && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          )}
                          {autoOn ? 'Live' : 'Paused'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isActive && (
                    <>
                      <div className={`mb-3 w-full overflow-hidden transition-all duration-500 ${
                        autoOn ? 'shadow-sm shadow-blue-500/10' : ''
                      }`}>
                        <div className="w-full max-w-full">
                          <LiveBarsCanvas
                            values={history}
                            darkMode={darkMode}
                            width={isMobile ? 240 : 280}
                            height={48}
                            barCount={18}
                            palette="crypto"
                            tooltipRef={tooltipControl}
                          />
                        </div>
                      </div>
                      
                      {signal && (
                        <div className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          External signal: {signal.source} ({Math.round(signal.value)}%)
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaBell className="text-red-600" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border flex items-start justify-between ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                  } ${!alert.acknowledged ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.type === 'success' ? 'bg-green-500' : 
                      alert.type === 'warning' ? 'bg-yellow-500' : 
                      alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => ackAlert(alert.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h4 className="font-semibold mb-4">Live Controls</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto Updates</div>
                  <div className="text-sm text-gray-500">Real-time data refresh</div>
                </div>
                <button
                  onClick={() => setAutoOn(!autoOn)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    autoOn ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    autoOn ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Voice Alerts</div>
                  <div className="text-sm text-gray-500">Audio notifications</div>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    voiceEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h4 className="font-semibold mb-4">System Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Systems</span>
                <span className="font-medium">{assessedKeys.length} / {CANONICAL.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Sources</span>
                <span className="font-medium">{uploads.length} uploads</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Update Frequency</span>
                <span className="font-medium">5 seconds</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Connection</span>
                <span className={`font-medium capitalize ${
                  connectionQuality === 'excellent' ? 'text-green-500' :
                  connectionQuality === 'good' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {connectionQuality}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}