import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { FaIndustry, FaChartLine, FaFilter, FaDownload, FaInfoCircle } from 'react-icons/fa';

// Industry benchmark data (this would typically come from API)
const INDUSTRY_BENCHMARKS = {
  'technology': {
    name: 'Technology',
    interdependency: 75,
    orchestration: 78,
    investigation: 82,
    interpretation: 77,
    illustration: 73,
    inlignment: 71
  },
  'healthcare': {
    name: 'Healthcare',
    interdependency: 68,
    orchestration: 71,
    investigation: 85,
    interpretation: 74,
    illustration: 69,
    inlignment: 78
  },
  'financial': {
    name: 'Financial Services',
    interdependency: 73,
    orchestration: 75,
    investigation: 79,
    interpretation: 81,
    illustration: 76,
    inlignment: 74
  },
  'manufacturing': {
    name: 'Manufacturing',
    interdependency: 70,
    orchestration: 82,
    investigation: 73,
    interpretation: 68,
    illustration: 81,
    inlignment: 75
  }
};

const SYSTEM_LABELS = {
  interdependency: 'Interdependency',
  orchestration: 'Orchestration', 
  investigation: 'Investigation',
  interpretation: 'Interpretation',
  illustration: 'Illustration',
  inlignment: 'Inlignment'
};

function CustomRadarChart({ data, darkMode }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid 
          stroke={darkMode ? '#374151' : '#e5e7eb'} 
          strokeDasharray="3 3"
        />
        <PolarAngleAxis 
          dataKey="system" 
          tick={{ fontSize: 12, fill: darkMode ? '#d1d5db' : '#6b7280' }}
          className="text-xs"
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#9ca3af' }}
          tickCount={6}
        />
        <Radar 
          name="Your Organization" 
          dataKey="current" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar 
          name="Industry Average" 
          dataKey="benchmark" 
          stroke="#10b981" 
          fill="#10b981" 
          fillOpacity={0.1}
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Radar 
          name="Top Quartile" 
          dataKey="topQuartile" 
          stroke="#f59e0b" 
          fill="#f59e0b" 
          fillOpacity={0.05}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: darkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function TrendChart({ data, darkMode, metric }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={darkMode ? '#374151' : '#e5e7eb'} 
        />
        <XAxis 
          dataKey="month" 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <YAxis 
          domain={[0, 100]}
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="benchmark" 
          stroke="#10b981" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function BenchmarkingTrends() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [timeframe, setTimeframe] = useState('6months');
  const [anomalyDetection, setAnomalyDetection] = useState(true);

  // Get current scores from localStorage
  const [currentScores, setCurrentScores] = useState({});
  
  useEffect(() => {
    // Simulate getting current scores - in real app this would come from props or context
    const mockCurrentScores = {
      interdependency: 72,
      orchestration: 68,
      investigation: 75,
      interpretation: 71,
      illustration: 69,
      inlignment: 73
    };
    setCurrentScores(mockCurrentScores);
  }, []);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    const benchmark = INDUSTRY_BENCHMARKS[selectedIndustry];
    if (!benchmark) return [];
    
    return Object.keys(SYSTEM_LABELS).map(key => ({
      system: SYSTEM_LABELS[key],
      current: currentScores[key] || 0,
      benchmark: benchmark[key] || 0,
      topQuartile: Math.min(100, (benchmark[key] || 0) + 15)
      }));
  }, [selectedIndustry, currentScores]);

  // Generate historical trend data
  const trendData = useMemo(() => {
    const months = timeframe === '6months' ? 6 : timeframe === '12months' ? 12 : 24;
    const data = [];
    const baseScore = selectedMetric === 'overall' ? 
      Object.values(currentScores).reduce((a, b) => a + b, 0) / Object.keys(currentScores).length :
      currentScores[selectedMetric] || 70;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const variation = Math.sin(i * 0.5) * 5 + Math.random() * 4 - 2;
      const value = Math.max(30, Math.min(95, baseScore + variation));
      const benchmark = INDUSTRY_BENCHMARKS[selectedIndustry] ? 
        (selectedMetric === 'overall' ? 
          Object.values(INDUSTRY_BENCHMARKS[selectedIndustry]).slice(1).reduce((a, b) => a + b, 0) / 6 :
          INDUSTRY_BENCHMARKS[selectedIndustry][selectedMetric]) : 72;
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round(value),
        benchmark: Math.round(benchmark),
        anomaly: anomalyDetection && Math.abs(value - benchmark) > 10
      });
    }
    return data;
  }, [selectedMetric, timeframe, currentScores, selectedIndustry, anomalyDetection]);

  // Calculate insights
  const insights = useMemo(() => {
    const benchmark = INDUSTRY_BENCHMARKS[selectedIndustry];
    if (!benchmark || !Object.keys(currentScores).length) return [];
    
    const insights = [];
    const overallCurrent = Object.values(currentScores).reduce((a, b) => a + b, 0) / Object.keys(currentScores).length;
    const overallBenchmark = Object.values(benchmark).slice(1).reduce((a, b) => a + b, 0) / 6;
    
    if (overallCurrent > overallBenchmark + 5) {
      insights.push({ type: 'positive', text: `You're performing ${Math.round(overallCurrent - overallBenchmark)}% above industry average` });
    } else if (overallCurrent < overallBenchmark - 5) {
      insights.push({ type: 'warning', text: `You're ${Math.round(overallBenchmark - overallCurrent)}% below industry average` });
    }
    
    // Find strongest and weakest systems relative to industry
    const comparisons = Object.keys(currentScores).map(key => ({
      system: key,
      diff: currentScores[key] - benchmark[key]
    }));
    
    const strongest = comparisons.reduce((a, b) => a.diff > b.diff ? a : b);
    const weakest = comparisons.reduce((a, b) => a.diff < b.diff ? a : b);
    
    if (strongest.diff > 0) {
      insights.push({ type: 'positive', text: `${SYSTEM_LABELS[strongest.system]} is your strongest system (+${Math.round(strongest.diff)})` });
    }
    if (weakest.diff < -3) {
      insights.push({ type: 'warning', text: `${SYSTEM_LABELS[weakest.system]} needs attention (${Math.round(weakest.diff)})` });
    }
    
    return insights;
  }, [selectedIndustry, currentScores]);

  const exportBenchmarkData = () => {
    const data = {
      radarData,
      trendData,
      insights,
      industry: selectedIndustry,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark-analysis-${selectedIndustry}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <FaIndustry className="text-blue-600" />
            Benchmarking & Trends
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Compare your performance against industry standards and track progress over time
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {Object.entries(INDUSTRY_BENCHMARKS).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
          
          <button
            onClick={exportBenchmarkData}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      {/* Industry Comparison Radar */}
      <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-lg">Industry Comparison</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your performance vs {INDUSTRY_BENCHMARKS[selectedIndustry]?.name} industry standards
            </p>
          </div>
        </div>
        
        <CustomRadarChart data={radarData} darkMode={darkMode} />
        
        {/* Performance Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {radarData.map((item) => (
            <div key={item.system} className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="text-xs font-medium mb-1">{item.system}</div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${
                  item.current >= item.benchmark ? 'text-green-500' : 'text-red-500'
                }`}>
                  {item.current}%
                </span>
                <span className={`text-xs ${
                  item.current >= item.benchmark ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.current >= item.benchmark ? '+' : ''}{item.current - item.benchmark}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-2xl p-6 border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FaChartLine className="text-green-600" />
                Historical Trends
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track your progress over time with anomaly detection
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className={`px-3 py-1 rounded border text-sm ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="overall">Overall Score</option>
                {Object.entries(SYSTEM_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className={`px-3 py-1 rounded border text-sm ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="6months">6 Months</option>
                <option value="12months">12 Months</option>
                <option value="24months">24 Months</option>
              </select>
            </div>
          </div>
          
          <TrendChart data={trendData} darkMode={darkMode} metric={selectedMetric} />
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={anomalyDetection}
                onChange={(e) => setAnomalyDetection(e.target.checked)}
              />
              <span>Anomaly Detection</span>
            </label>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Shows significant deviations from industry benchmarks
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" />
            Key Insights
          </h4>
          
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}>
                <div className={`text-sm ${
                  insight.type === 'positive' ? 'text-green-800 dark:text-green-200' :
                  insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {insight.text}
                </div>
              </div>
            ))}
            
            <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-sm font-medium mb-2">Benchmark Source</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Data aggregated from {INDUSTRY_BENCHMARKS[selectedIndustry]?.name} companies with similar organizational structure and size.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
