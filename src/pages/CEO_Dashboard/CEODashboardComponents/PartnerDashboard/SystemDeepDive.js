import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend } from 'recharts';
import { 
  FaSearch, FaChartLine, FaBrain, FaNetworkWired, FaExclamationTriangle, FaCheckCircle, 
  FaEye, FaTrendingUp, FaTrendingDown, FaArrowRight, FaLightbulb, FaCog, FaUsers, FaCogs 
} from 'react-icons/fa';

// ConseQ-X Six Systems Model - Organizational Health Framework
const CORE_SYSTEMS = {
  interdependency: {
    name: 'Interdependency',
    icon: '🔗',
    color: '#3B82F6',
    focus: 'Organizational Networks',
    description: 'Cross-functional collaboration and dependency mapping',
    capabilities: ['Dependency mapping', 'Bottleneck detection', 'Collaboration analysis'],
    keyMetrics: ['Network Density', 'Collaboration Index', 'Communication Flow', 'Cross-functional Engagement']
  },
  iteration: {
    name: 'Iteration', 
    icon: '🔄',
    color: '#10B981',
    focus: 'Adaptive Capacity',
    description: 'Innovation velocity and continuous improvement cycles',
    capabilities: ['Cycle analysis', 'Improvement tracking', 'Agility metrics'],
    keyMetrics: ['Innovation Velocity', 'Feedback Loops', 'Adaptation Speed', 'Learning Rate']
  },
  investigation: {
    name: 'Investigation',
    icon: '🔍', 
    color: '#8B5CF6',
    focus: 'Analytical Depth',
    description: 'Root-cause analysis and pattern discovery capabilities',
    capabilities: ['Root-cause analysis', 'Data quality assessment', 'Pattern discovery'],
    keyMetrics: ['Analysis Quality', 'Problem Resolution', 'Data Accuracy', 'Insight Generation']
  },
  interpretation: {
    name: 'Interpretation',
    icon: '💡',
    color: '#F59E0B',
    focus: 'Intelligence Synthesis', 
    description: 'Decision quality and insight generation processes',
    capabilities: ['Sentiment analysis', 'Decision tracking', 'Insight generation'],
    keyMetrics: ['Decision Quality', 'Insight Accuracy', 'Intelligence Synthesis', 'Strategic Clarity']
  },
  illustration: {
    name: 'Illustration',
    icon: '📊',
    color: '#EF4444',
    focus: 'Information Flow',
    description: 'Communication effectiveness and knowledge transfer',
    capabilities: ['Communication analysis', 'Visualization quality', 'Knowledge transfer'],
    keyMetrics: ['Communication Effectiveness', 'Information Clarity', 'Knowledge Transfer', 'Visual Impact']
  },
  alignment: {
    name: 'Alignment',
    icon: '🎯',
    color: '#6366F1',
    focus: 'Strategic Coherence',
    description: 'Goal alignment and strategy execution coordination',
    capabilities: ['Goal alignment', 'Strategy execution', 'Organizational synchronization'],
    keyMetrics: ['Strategic Alignment', 'Goal Achievement', 'Coordination Index', 'Execution Quality']
  }
};

// Advanced Cross-System Dependency Visualization
function SystemDependencyNetwork({ systems, scores, darkMode }) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const r = 120;
  
  return (
    <div className="relative">
      <svg width={size} height={size} className="block mx-auto">
        {/* Connection lines with strength indicators */}
        {Object.keys(systems).map((systemKey, i) => {
          const system = systems[systemKey];
          const nextSystem = Object.keys(systems)[(i + 1) % Object.keys(systems).length];
          
          const angle1 = (i / Object.keys(systems).length) * Math.PI * 2 - Math.PI / 2;
          const angle2 = (((i + 1) % Object.keys(systems).length) / Object.keys(systems).length) * Math.PI * 2 - Math.PI / 2;
          
          const x1 = cx + r * Math.cos(angle1);
          const y1 = cy + r * Math.sin(angle1);
          const x2 = cx + r * Math.cos(angle2);
          const y2 = cy + r * Math.sin(angle2);
          
          const connectionStrength = (scores[systemKey] + scores[nextSystem]) / 200;
          
          return (
            <line 
              key={`connection-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2} 
              stroke={system.color} 
              strokeWidth={2 + connectionStrength * 3}
              strokeOpacity={0.3 + connectionStrength * 0.4}
              strokeDasharray={scores[systemKey] < 50 ? "5,5" : "none"}
            />
          );
        })}
        
        {/* System nodes */}
        {Object.entries(systems).map(([systemKey, system], i) => {
          const angle = (i / Object.keys(systems).length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const score = scores[systemKey] || 50;
          
          return (
            <g key={systemKey} transform={`translate(${x},${y})`}>
              {/* Outer ring for health status */}
              <circle 
                r={32} 
                fill="none" 
                stroke={system.color} 
                strokeWidth={4}
                strokeOpacity={score >= 70 ? 1 : score >= 50 ? 0.7 : 0.4}
              />
              {/* Inner circle */}
              <circle 
                r={25} 
                fill={system.color}
                fillOpacity={0.1 + (score / 100) * 0.8}
              />
              {/* System icon/text */}
              <text 
                x={0} y={-5} 
                textAnchor="middle" 
                fontSize={16} 
                fill={system.color}
              >
                {system.icon}
              </text>
              <text 
                x={0} y={10} 
                textAnchor="middle" 
                fontSize={10} 
                fill={darkMode ? '#E5E7EB' : '#374151'}
                fontWeight="600"
              >
                {score}%
              </text>
              {/* System name */}
              <text 
                x={0} y={50} 
                textAnchor="middle" 
                fontSize={10} 
                fill={darkMode ? '#9CA3AF' : '#6B7280'}
              >
                {system.name}
              </text>
            </g>
          );
        })}
        
        {/* Central health indicator */}
        <g transform={`translate(${cx},${cy})`}>
          <circle r={20} fill={darkMode ? '#1F2937' : '#F9FAFB'} stroke={darkMode ? '#374151' : '#D1D5DB'} strokeWidth={2} />
          <text x={0} y={-5} textAnchor="middle" fontSize={10} fill={darkMode ? '#9CA3AF' : '#6B7280'}>Org</text>
          <text x={0} y={8} textAnchor="middle" fontSize={10} fill={darkMode ? '#E5E7EB' : '#374151'} fontWeight="600">
            {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)}%
          </text>
        </g>
      </svg>
    </div>
  );
}

// Advanced Root Cause Analysis Tree
function IntelligentRootCauseAnalysis({ systemKey, score, darkMode }) {
  const [selectedCause, setSelectedCause] = useState(null);
  
  const generateRootCauses = (systemKey, score) => {
    const system = CORE_SYSTEMS[systemKey];
    const causes = [];
    
    if (score < 50) {
      causes.push({
        id: `${systemKey}-low-1`,
        category: 'Critical',
        title: `${system.focus} Breakdown`,
        impact: 'High',
        probability: 0.8,
        description: `Fundamental ${system.focus.toLowerCase()} processes are failing`,
        rootCauses: [
          'Lack of clear ownership and accountability',
          'Insufficient measurement and feedback loops', 
          'Poor cross-functional communication',
          'Inadequate resource allocation'
        ],
        recommendations: [
          'Implement weekly ownership review sessions',
          'Establish clear KPIs and measurement frameworks',
          'Create cross-functional collaboration protocols',
          'Reassess resource allocation priorities'
        ]
      });
    }
    
    if (score < 70) {
      causes.push({
        id: `${systemKey}-med-1`,
        category: 'Moderate',
        title: `${system.name} Inefficiency`,
        impact: 'Medium',
        probability: 0.6,
        description: `${system.description} showing suboptimal performance`,
        rootCauses: [
          'Process gaps in current workflows',
          'Skills or capability misalignments',
          'Technology or tool limitations',
          'Cultural resistance to change'
        ],
        recommendations: [
          'Conduct detailed process mapping and optimization',
          'Implement targeted skill development programs',
          'Evaluate and upgrade supporting tools',
          'Launch change management initiatives'
        ]
      });
    }
    
    return causes;
  };
  
  const rootCauses = generateRootCauses(systemKey, score);
  
  return (
    <div className="space-y-4">
      {rootCauses.map((cause) => (
        <div key={cause.id} className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button 
            onClick={() => setSelectedCause(selectedCause === cause.id ? null : cause.id)}
            className={`w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50 transition-colors ${
              cause.category === 'Critical' 
                ? (darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50')
                : (darkMode ? 'hover:bg-yellow-900/20' : 'hover:bg-yellow-50')
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                cause.category === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div>
                <div className="font-medium">{cause.title}</div>
                <div className="text-sm text-gray-500 mt-1">{cause.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className={`font-medium ${cause.category === 'Critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {cause.impact} Impact
                </div>
                <div className="text-gray-500">{Math.round(cause.probability * 100)}% likelihood</div>
              </div>
              <FaArrowRight className={`transition-transform ${selectedCause === cause.id ? 'rotate-90' : ''}`} />
            </div>
          </button>
          
          {selectedCause === cause.id && (
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FaSearch className="text-blue-600" />
                    Root Causes
                  </h4>
                  <ul className="space-y-2">
                    {cause.rootCauses.map((rc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span>{rc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FaLightbulb className="text-green-600" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {cause.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Performance Trends Analysis Component
function PerformanceTrendsAnalysis({ systemKey, historicalData, darkMode }) {
  const system = CORE_SYSTEMS[systemKey];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={historicalData}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(d) => new Date(d).toLocaleDateString()}
            stroke={darkMode ? '#9CA3AF' : '#6B7280'}
          />
          <YAxis 
            domain={[0, 100]}
            stroke={darkMode ? '#9CA3AF' : '#6B7280'}
          />
          <Tooltip 
            labelFormatter={(l) => new Date(l).toLocaleDateString()}
            formatter={(v, name) => [`${v}%`, name]}
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              borderColor: darkMode ? '#374151' : '#D1D5DB',
              color: darkMode ? '#E5E7EB' : '#374151'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={system.color} 
            strokeWidth={3} 
            dot={{ fill: system.color, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: system.color }}
          />
          <Line 
            type="monotone" 
            dataKey="benchmark" 
            stroke={darkMode ? '#6B7280' : '#9CA3AF'} 
            strokeWidth={2} 
            strokeDasharray="5,5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// System keys for the six core systems
const SYSTEM_KEYS = ['interdependency', 'iteration', 'investigation', 'interpretation', 'illustration', 'inlignment'];

// Simple Dependency Map Component
const SimpleDependencyMap = ({ systems, scores }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-4">
        {systems.slice(0, 6).map((system, idx) => {
          const score = scores[system.key] || 0;
          const color = score > 70 ? '#10B981' : score > 50 ? '#F59E0B' : '#EF4444';
          return (
            <div key={system.key} className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto"
                style={{ backgroundColor: color }}
              >
                {system.key.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs mt-1 text-gray-600">{score}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Root Cause Tree Component
const RootCauseTree = ({ rootCauses }) => {
  return (
    <div className="space-y-3">
      {rootCauses.map((cause, idx) => (
        <div key={idx} className="border-l-2 border-red-300 pl-3">
          <div className="font-medium text-sm">{cause.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            Impact: <span className={`px-1 py-0.5 rounded text-xs ${
              cause.impact === 'high' ? 'bg-red-100 text-red-700' :
              cause.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>{cause.impact}</span>
          </div>
          <ul className="text-xs text-gray-600 mt-2 space-y-1">
            {cause.causes.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default function SystemDeepDive() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  
  const [selectedSystem, setSelectedSystem] = useState('interdependency');
  const [analysisMode, setAnalysisMode] = useState('organizational_intelligence'); // organizational_intelligence, predictive_health, cross_dependencies, transformation_readiness
  const [scores, setScores] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [crossSystemInsights, setCrossSystemInsights] = useState([]);
  const [organizationalIntelligence, setOrganizationalIntelligence] = useState({});
  const [predictiveHealth, setPredictiveHealth] = useState({});
  const [transformationReadiness, setTransformationReadiness] = useState({});

  // Advanced Organizational Health Analytics Engine
  const generateAdvancedOrganizationalData = () => {
    const baseScores = {
      interdependency: 72,
      iteration: 68, 
      investigation: 45,
      interpretation: 78,
      illustration: 63,
      alignment: 52
    };
    
    // Generate organizational intelligence metrics
    const orgIntelligence = {
      collaboration_index: 78,
      innovation_velocity: 65,
      communication_effectiveness: 82,
      overall_culture_health: 75,
      decision_quality: 68,
      knowledge_transfer: 71,
      strategic_coherence: 59,
      change_readiness: 63,
      leadership_effectiveness: 81
    };

    // Generate predictive health forecast
    const healthForecast = {
      current_health: Math.round(Object.values(baseScores).reduce((a, b) => a + b, 0) / Object.keys(baseScores).length),
      next_30_days: 74,
      risk_areas: [
        { system: 'investigation', risk_level: 'high', probability: 0.85 },
        { system: 'alignment', risk_level: 'moderate', probability: 0.65 }
      ],
      improvement_opportunities: [
        { system: 'interpretation', leverage_potential: 'high', impact_score: 92 },
        { system: 'interdependency', leverage_potential: 'medium', impact_score: 78 }
      ],
      cultural_health_trend: 'improving',
      organizational_velocity: 'moderate'
    };

    // Generate transformation readiness assessment
    const transformationReadiness = {
      overall_score: 67,
      leadership_commitment: 85,
      organizational_capability: 62,
      change_capacity: 58,
      cultural_alignment: 71,
      resource_availability: 54,
      communication_infrastructure: 76,
      feedback_mechanisms: 63,
      readiness_factors: [
        { factor: 'Leadership Alignment', score: 85, status: 'strong' },
        { factor: 'Change Champions Network', score: 72, status: 'moderate' },
        { factor: 'Process Adaptability', score: 58, status: 'needs_attention' },
        { factor: 'Cultural Openness', score: 71, status: 'moderate' },
        { factor: 'Resource Mobilization', score: 54, status: 'needs_attention' }
      ]
    };
    
    // Generate 90-day historical data with advanced patterns
    const historical = {};
    Object.keys(baseScores).forEach(systemKey => {
      const data = [];
      for (let i = 89; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const baseValue = baseScores[systemKey];
        
        // Add realistic organizational patterns
        const weeklyPattern = Math.sin((i / 7) * Math.PI) * 3; // Weekly fluctuations
        const monthlyTrend = (89 - i) * 0.1; // Slight improvement over time
        const seasonalVariation = Math.cos((i / 30) * Math.PI) * 2; // Monthly cycles
        const variation = (Math.random() - 0.5) * 8; // Random variation
        
        data.push({
          date: date.getTime(),
          value: Math.max(0, Math.min(100, baseValue + variation + weeklyPattern + monthlyTrend + seasonalVariation)),
          benchmark: 75, // Industry benchmark
          prediction: Math.max(0, Math.min(100, baseValue + monthlyTrend + 5)), // Future prediction
          confidence: Math.min(1, 0.5 + (89 - i) / 180) // Increasing confidence
        });
      }
      historical[systemKey] = data;
    });
    
    return { 
      baseScores, 
      historical, 
      orgIntelligence, 
      healthForecast, 
      transformationReadiness 
    };
  };

  // Generate cross-system insights using AI-like analysis
  const generateCrossSystemInsights = (scores) => {
    const insights = [];
    
    // Identify critical dependencies
    const lowPerformingSystems = Object.entries(scores).filter(([_, score]) => score < 60);
    const highPerformingSystems = Object.entries(scores).filter(([_, score]) => score >= 75);
    
    if (lowPerformingSystems.length > 0) {
      insights.push({
        type: 'critical',
        title: 'System Dependencies at Risk',
        description: `Low performance in ${lowPerformingSystems.map(([name]) => CORE_SYSTEMS[name].name).join(', ')} is creating bottlenecks across the organization.`,
        impact: 'High',
        recommendation: 'Implement immediate intervention protocols for underperforming systems.',
        affectedSystems: lowPerformingSystems.map(([name]) => name)
      });
    }
    
    if (highPerformingSystems.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Leverage High-Performing Systems',
        description: `Strong performance in ${highPerformingSystems.map(([name]) => CORE_SYSTEMS[name].name).join(', ')} can be leveraged to improve weaker areas.`,
        impact: 'Medium',
        recommendation: 'Create cross-system improvement initiatives using high-performing areas as anchors.',
        affectedSystems: highPerformingSystems.map(([name]) => name)
      });
    }
    
    // Cultural health assessment
    const culturalScore = (scores.interpretation + scores.illustration + scores.alignment) / 3;
    if (culturalScore < 60) {
      insights.push({
        type: 'cultural',
        title: 'Cultural Transformation Required',
        description: 'Communication, interpretation, and alignment systems suggest cultural challenges that need executive attention.',
        impact: 'High',
        recommendation: 'Launch comprehensive cultural transformation program with leadership alignment.',
        affectedSystems: ['interpretation', 'illustration', 'alignment']
      });
    }
    
    return insights;
  };

  useEffect(() => {
    // Load or generate advanced organizational data
    const { 
      baseScores, 
      historical, 
      orgIntelligence, 
      healthForecast, 
      transformationReadiness 
    } = generateAdvancedOrganizationalData();
    
    setScores(baseScores);
    setHistoricalData(historical);
    setOrganizationalIntelligence(orgIntelligence);
    setPredictiveHealth(healthForecast);
    setTransformationReadiness(transformationReadiness);
    setCrossSystemInsights(generateCrossSystemInsights(baseScores));
  }, []);

  // Get current system data
  const currentSystem = CORE_SYSTEMS[selectedSystem];
  const currentScore = scores[selectedSystem] || 0;

  // Generate orchestration trend data with predictions
  const orchestrationSeries = (historicalData[selectedSystem] || []).slice(-30).map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    actual: item.value,
    benchmark: item.benchmark,
    prediction: item.prediction,
    confidence: item.confidence
  }));

  // Enhanced root causes analysis
  const rootCauses = SYSTEM_KEYS
    .filter(key => scores[key] < 70)
    .map(key => ({
      title: CORE_SYSTEMS[key]?.name || key,
      system_key: key,
      current_score: scores[key],
      impact: scores[key] >= 50 ? 'medium' : 'high',
      urgency: scores[key] < 45 ? 'critical' : scores[key] < 60 ? 'high' : 'medium',
      root_causes: [
        `${CORE_SYSTEMS[key]?.focus} processes showing degradation`,
        'Cross-functional coordination gaps identified',
        'Resource allocation misalignment detected',
        'Cultural resistance patterns emerging'
      ],
      business_impact: [
        'Reduced organizational velocity',
        'Increased operational friction',
        'Stakeholder confidence erosion',
        'Strategic execution delays'
      ],
      recommended_interventions: [
        `Implement ${CORE_SYSTEMS[key]?.focus.toLowerCase()} optimization protocols`,
        'Launch targeted capability development programs',
        'Establish cross-system coordination mechanisms',
        'Deploy cultural transformation initiatives'
      ]
    }));

  // Render advanced analysis modes
  const renderAnalysisMode = () => {
    switch (analysisMode) {
      case 'organizational_intelligence':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Organizational Intelligence Panel */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <FaCog className="text-white" />
                </div>
                <h4 className="text-lg font-semibold">🧠 Organizational Intelligence</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(organizationalIntelligence).map(([key, value]) => (
                  <div key={key} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                    <div className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
                    <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                      {value}%
                      <div className={`w-2 h-2 rounded-full ${value >= 75 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Analytics Deep Dive */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <FaUsers className="text-white" />
                </div>
                <h4 className="text-lg font-semibold">🎭 Cultural Analytics</h4>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                  <div className="text-sm font-medium mb-2">Innovation Velocity Index</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${organizationalIntelligence.innovation_velocity}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {organizationalIntelligence.innovation_velocity >= 70 ? 'High innovation capacity' : 
                     organizationalIntelligence.innovation_velocity >= 50 ? 'Moderate innovation flow' : 'Innovation bottlenecks detected'}
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                  <div className="text-sm font-medium mb-2">Communication Effectiveness</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${organizationalIntelligence.communication_effectiveness}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cross-functional information flow analysis
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                  <div className="text-sm font-medium mb-2">Decision Quality Analytics</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${organizationalIntelligence.decision_quality}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Decision tracking & outcome correlation
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'predictive_health':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Health Forecast */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <FaChartLine className="text-white" />
                </div>
                <h4 className="text-lg font-semibold">🔮 Predictive Health Forecast</h4>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{predictiveHealth.next_30_days}%</div>
                <div className="text-sm text-gray-500">30-Day Health Projection</div>
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                  <div className="text-xs text-gray-500">Trend: {predictiveHealth.cultural_health_trend}</div>
                  <div className="text-xs text-gray-500">Velocity: {predictiveHealth.organizational_velocity}</div>
                </div>
              </div>
            </div>

            {/* Risk Areas */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-700/50' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                  <FaExclamationTriangle className="text-white" />
                </div>
                <h4 className="text-lg font-semibold">⚠️ Risk Areas</h4>
              </div>
              <div className="space-y-3">
                {predictiveHealth.risk_areas?.map((risk, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{risk.system.replace('_', ' ')}</div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        risk.risk_level === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {risk.risk_level}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(risk.probability * 100)}% probability
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Opportunities */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <FaLightbulb className="text-white" />
                </div>
                <h4 className="text-lg font-semibold">💡 Leverage Opportunities</h4>
              </div>
              <div className="space-y-3">
                {predictiveHealth.improvement_opportunities?.map((opp, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{opp.system.replace('_', ' ')}</div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        opp.leverage_potential === 'high' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {opp.leverage_potential}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Impact Score: {opp.impact_score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cross_dependencies':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Advanced Dependency Network */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <FaNetworkWired className="text-blue-600" />
                <h4 className="text-lg font-semibold">🕸️ System Dependencies Network</h4>
              </div>
              <SystemDependencyNetwork systems={CORE_SYSTEMS} scores={scores} darkMode={darkMode} />
            </div>

            {/* Cross-System Impact Analysis */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <FaSearch className="text-purple-600" />
                <h4 className="text-lg font-semibold">🔍 Cross-System Insights</h4>
              </div>
              <div className="space-y-4">
                {crossSystemInsights.map((insight, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'critical' 
                      ? `border-red-500 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}` :
                    insight.type === 'opportunity' 
                      ? `border-green-500 ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}` :
                      `border-yellow-500 ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`
                  }`}>
                    <div className={`font-medium text-sm mb-2 ${
                      insight.type === 'critical' 
                        ? `${darkMode ? 'text-red-300' : 'text-red-800'}` :
                      insight.type === 'opportunity' 
                        ? `${darkMode ? 'text-green-300' : 'text-green-800'}` :
                        `${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`
                    }`}>{insight.title}</div>
                    <div className={`text-xs mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{insight.description}</div>
                    <div className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{insight.recommendation}</div>
                    <div className="flex gap-1 mt-2">
                      {insight.affectedSystems?.map((system, i) => (
                        <span key={i} className={`px-2 py-1 text-xs rounded ${
                          darkMode 
                            ? 'bg-blue-900/30 text-blue-200' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {CORE_SYSTEMS[system]?.name || system}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'transformation_readiness':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Overall Readiness Score */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-700/50' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <FaCogs className="text-white" />
                </div>
                <h4 className="text-lg font-semibold">🚀 Transformation Readiness</h4>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">{transformationReadiness.overall_score}%</div>
                <div className="text-sm text-gray-500 mb-4">Overall Readiness Score</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                    <div>Leadership</div>
                    <div className="font-bold text-green-600">{transformationReadiness.leadership_commitment}%</div>
                  </div>
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                    <div>Capability</div>
                    <div className="font-bold text-blue-600">{transformationReadiness.organizational_capability}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Readiness Factors */}
            <div className={`col-span-2 rounded-2xl p-6 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="text-green-600" />
                <h4 className="text-lg font-semibold">📊 Readiness Factors Analysis</h4>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {transformationReadiness.readiness_factors?.map((factor, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{factor.factor}</div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        factor.status === 'strong' ? 'bg-green-100 text-green-700' :
                        factor.status === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {factor.status.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          factor.status === 'strong' ? 'bg-green-500' :
                          factor.status === 'moderate' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">{factor.score}% readiness</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <IntelligentRootCauseAnalysis systemKey={selectedSystem} score={currentScore} darkMode={darkMode} />
            <PerformanceTrendsAnalysis systemKey={selectedSystem} historicalData={orchestrationSeries} darkMode={darkMode} />
            <SystemDependencyNetwork systems={CORE_SYSTEMS} scores={scores} darkMode={darkMode} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with ConseQ-X Branding */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100': 'text-gray-900'}`}>
            🏥 ConseQ-X Deep Dive Analysis
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Your Organization's Health Partner - Advanced Diagnostic Intelligence
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'} text-sm font-medium`}>
          Overall Health: {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)}%
        </div>
      </div>

      {/* Analysis Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'organizational_intelligence', label: '🧠 Organizational Intelligence', color: 'blue' },
          { key: 'predictive_health', label: '🔮 Predictive Health', color: 'purple' },
          { key: 'cross_dependencies', label: '🕸️ Cross Dependencies', color: 'green' },
          { key: 'transformation_readiness', label: '🚀 Transformation Readiness', color: 'indigo' }
        ].map(mode => (
          <button
            key={mode.key}
            onClick={() => setAnalysisMode(mode.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              analysisMode === mode.key
                ? `bg-${mode.color}-600 text-white shadow-lg`
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Dynamic Analysis Content */}
      {renderAnalysisMode()}

      {/* Advanced Root Cause Analysis */}
      {rootCauses.length > 0 && (
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-700/50' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'} border`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <FaExclamationTriangle className="text-white" />
            </div>
            <h4 className="text-lg font-semibold">🔬 Advanced Root Cause Analysis</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rootCauses.map((cause, idx) => (
              <div key={idx} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} border-l-4 border-red-500`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-lg">{cause.title}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cause.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    cause.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {cause.urgency} urgency
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Current Score: <span className="font-bold text-red-600">{cause.current_score}%</span>
                </div>
                
                {/* Root Causes */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FaSearch className="text-blue-600" />
                    Identified Root Causes
                  </div>
                  <ul className="space-y-1">
                    {cause.root_causes.map((rc, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {rc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Business Impact */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-600" />
                    Business Impact
                  </div>
                  <ul className="space-y-1">
                    {cause.business_impact.map((impact, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        {impact}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Interventions */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FaLightbulb className="text-green-600" />
                    Recommended Interventions
                  </div>
                  <ul className="space-y-1">
                    {cause.recommended_interventions.map((intervention, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {intervention}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
