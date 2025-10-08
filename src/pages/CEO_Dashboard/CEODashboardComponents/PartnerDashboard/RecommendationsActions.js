import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaBrain, FaRobot, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaClock,
  FaUsers, FaCog, FaChartLine, FaShieldAlt, FaRocket, FaEye, FaHeart, FaNetworkWired,
  FaSearchPlus, FaArrowUp, FaCalculator, FaPlay, FaTasks, FaBookOpen, FaGraduationCap,
  FaHandshake, FaTools, FaClipboardCheck, FaBullseye, FaSync, FaFlag, FaCogs, FaRoad, FaPlus
} from 'react-icons/fa';

// ConseQ-X Six Systems Model - Organizational Health Framework
const CORE_SYSTEMS = {
  interdependency: {
    name: 'Interdependency',
    focus: 'Organizational Networks',
    icon: '🔗',
    color: '#3b82f6',
    capabilities: ['Dependency mapping', 'Bottleneck detection', 'Collaboration analysis']
  },
  iteration: {
    name: 'Iteration', 
    focus: 'Adaptive Capacity',
    icon: '🔄',
    color: '#10b981',
    capabilities: ['Cycle analysis', 'Improvement tracking', 'Agility metrics']
  },
  investigation: {
    name: 'Investigation',
    focus: 'Analytical Depth', 
    icon: '🔍',
    color: '#f59e0b',
    capabilities: ['Root-cause analysis', 'Data quality assessment', 'Pattern discovery']
  },
  interpretation: {
    name: 'Interpretation',
    focus: 'Intelligence Synthesis',
    icon: '💡', 
    color: '#ef4444',
    capabilities: ['Sentiment analysis', 'Decision tracking', 'Insight generation']
  },
  illustration: {
    name: 'Illustration',
    focus: 'Information Flow',
    icon: '📊',
    color: '#8b5cf6', 
    capabilities: ['Communication analysis', 'Visualization quality', 'Knowledge transfer']
  },
  alignment: {
    name: 'Alignment',
    focus: 'Strategic Coherence',
    icon: '🎯',
    color: '#06b6d4',
    capabilities: ['Goal alignment', 'Strategy execution', 'Organizational synchronization']
  }
};

// Advanced Organizational Impact Calculator
function AdvancedOrganizationalImpactCalculator({ darkMode }) {
  const [organizationalMetrics, setOrganizationalMetrics] = useState({
    annualRevenue: 5000000,
    employeeCount: 150,
    operationalCost: 3500000,
    changeReadiness: 72
  });

  const [implementationScenario, setImplementationScenario] = useState('comprehensive');
  
  const calculations = useMemo(() => {
    const { annualRevenue, employeeCount, operationalCost, changeReadiness } = organizationalMetrics;
    
    // Scenario-based impact modeling
    const scenarios = {
      quick_wins: { 
        investment: 85000, 
        timeframe: '3-6 months',
        healthImprovement: 12,
        riskLevel: 'low'
      },
      comprehensive: { 
        investment: 250000, 
        timeframe: '12-18 months',
        healthImprovement: 28,
        riskLevel: 'medium'
      },
      transformation: { 
        investment: 500000, 
        timeframe: '18-36 months',
        healthImprovement: 45,
        riskLevel: 'high'
      }
    };

    const scenario = scenarios[implementationScenario];
    
    // Advanced organizational value calculation
    const operationalEfficiencyGains = (scenario.healthImprovement / 100) * operationalCost * 0.15;
    const revenueGrowthImpact = (scenario.healthImprovement / 100) * annualRevenue * 0.08;
    const culturalProductivityGains = (scenario.healthImprovement / 100) * (employeeCount * 65000) * 0.12; // Average productivity value
    const strategicAlignmentValue = (scenario.healthImprovement / 100) * annualRevenue * 0.05;
    
    const totalAnnualValue = operationalEfficiencyGains + revenueGrowthImpact + culturalProductivityGains + strategicAlignmentValue;
    const roi = ((totalAnnualValue - scenario.investment) / scenario.investment) * 100;
    const paybackMonths = scenario.investment / (totalAnnualValue / 12);
    
    // Change readiness impact on ROI
    const readinessMultiplier = Math.min(1.2, changeReadiness / 100 + 0.2);
    const adjustedROI = roi * readinessMultiplier;
    
    return {
      scenario,
      operationalGains: Math.round(operationalEfficiencyGains),
      revenueImpact: Math.round(revenueGrowthImpact),  
      culturalGains: Math.round(culturalProductivityGains),
      strategicValue: Math.round(strategicAlignmentValue),
      totalAnnualValue: Math.round(totalAnnualValue),
      roi: Math.round(adjustedROI * 10) / 10,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      threeYearValue: Math.round(totalAnnualValue * 3 - scenario.investment),
      healthImprovement: scenario.healthImprovement,
      readinessMultiplier: Math.round(readinessMultiplier * 100)
    };
  }, [organizationalMetrics, implementationScenario]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <FaCalculator className="text-green-600" />
        <div>
          <div className="font-semibold">🏥 Organizational Impact Calculator</div>
          <div className="text-xs text-gray-500">Advanced ROI modeling for organizational health initiatives</div>
        </div>
      </div>

      {/* Organizational Metrics Input */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block mb-1 font-medium">Annual Revenue ($)</label>
          <input 
            type="number" 
            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={organizationalMetrics.annualRevenue}
            onChange={(e) => setOrganizationalMetrics(prev => ({ ...prev, annualRevenue: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Employee Count</label>
          <input 
            type="number" 
            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={organizationalMetrics.employeeCount}
            onChange={(e) => setOrganizationalMetrics(prev => ({ ...prev, employeeCount: Number(e.target.value) }))}
          />
        </div>
      </div>

      {/* Scenario Selection */}
      <div>
        <label className="block mb-2 text-xs font-medium">Implementation Scenario</label>
        <select 
          value={implementationScenario}
          onChange={(e) => setImplementationScenario(e.target.value)}
          className={`w-full p-2 border rounded text-xs ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
        >
          <option value="quick_wins">Quick Wins (+12% health)</option>
          <option value="comprehensive">Comprehensive (+28% health)</option>
          <option value="transformation">Transformation (+45% health)</option>
        </select>
      </div>

      {/* Impact Results */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="text-gray-500">Operational Gains</div>
          <div className="font-bold text-blue-600">${calculations.operationalGains.toLocaleString()}</div>
        </div>
        <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="text-gray-500">Revenue Impact</div>
          <div className="font-bold text-green-600">${calculations.revenueImpact.toLocaleString()}</div>
        </div>
        <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="text-gray-500">ROI</div>
          <div className={`font-bold ${calculations.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {calculations.roi}%
          </div>
        </div>
        <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="text-gray-500">Payback</div>
          <div className="font-bold text-purple-600">{calculations.paybackMonths}mo</div>
        </div>
      </div>

      {/* 3-Year Value */}
      <div className={`p-3 rounded-lg border ${
        calculations.threeYearValue > 0 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="text-xs font-medium mb-1">3-Year Net Value</div>
        <div className={`text-lg font-bold ${calculations.threeYearValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${calculations.threeYearValue.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Health improvement: +{calculations.healthImprovement}% | Readiness factor: {calculations.readinessMultiplier}%
        </div>
      </div>
    </div>
  );
}

export default function ConseqXIntelligentRecommendations() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  
  const [recommendationMode, setRecommendationMode] = useState('ai_prescribed'); // ai_prescribed, system_focused, transformation_roadmap
  const [timeHorizon, setTimeHorizon] = useState('90_days'); // 30_days, 90_days, 180_days, 12_months
  const [activeView, setActiveView] = useState('ai'); // ai, custom
  const [showAddCustomAction, setShowAddCustomAction] = useState(false);
  const [newCustomAction, setNewCustomAction] = useState({ title: '', system: 'interdependency', priority: 'medium', assignee: '', dueDate: '' });
  const [tasks] = useState([]); // Legacy tasks for compatibility
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showRecommendationDetails, setShowRecommendationDetails] = useState(false);
  const [implementingRecommendation, setImplementingRecommendation] = useState(null);
  const [showImplementationSuccess, setShowImplementationSuccess] = useState(false);
  const [implementedRecommendationTitle, setImplementedRecommendationTitle] = useState('');

  // Advanced ULTRA-Generated Organizational Prescriptions
  const [intelligentRecommendations] = useState({
    ai_prescribed: [
      {
        id: 'ai-1',
        type: 'critical_intervention',
        system: 'investigation',
        title: 'Implement Advanced Root-Cause Analysis Framework',
        description: 'ULTRA detected 73% degradation in analytical depth capabilities. Deploy automated investigation protocols to restore organizational diagnostic capacity.',
        impact: 'high',
        urgency: 'critical',
        ultraConfidence: 94,
        estimatedLift: 18,
        timeline: '4-6 weeks',
        resources: ['Data Analytics Team', 'Process Optimization Specialist', 'Change Management'],
        kpis: ['Investigation Score: +18%', 'Decision Quality: +12%', 'Problem Resolution Time: -35%'],
        businessJustification: 'Low investigation capability (45%) creating organizational blind spots and reactive decision-making patterns.',
        prescriptiveActions: [
          'Deploy automated data quality monitoring systems',
          'Establish cross-functional investigation protocols', 
          'Implement real-time pattern recognition algorithms',
          'Create investigative capability assessment framework'
        ]
      },
      {
        id: 'ai-2', 
        type: 'strategic_optimization',
        system: 'alignment',
        title: 'Launch Strategic Coherence Transformation Program',
        description: 'Multi-system analysis reveals 52% alignment effectiveness. Execute comprehensive strategic synchronization initiative.',
        impact: 'high',
        urgency: 'high', 
        ultraConfidence: 87,
        estimatedLift: 22,
        timeline: '8-12 weeks',
        resources: ['Executive Leadership', 'Strategy Team', 'Communications Lead'],
        kpis: ['Alignment Score: +22%', 'Strategic Execution: +28%', 'Goal Coherence: +31%'],
        businessJustification: 'Strategic misalignment (52%) causing execution delays and resource inefficiencies across organizational systems.',
        prescriptiveActions: [
          'Implement strategic alignment measurement framework',
          'Deploy goal synchronization protocols across departments',
          'Establish strategic coherence monitoring dashboards',
          'Create alignment accountability mechanisms'
        ]
      },
      {
        id: 'ai-3',
        type: 'cultural_transformation', 
        system: 'interpretation',
        title: 'Enhance Decision Intelligence Synthesis Capabilities',
        description: 'Strong interpretation performance (78%) can leverage weaker systems. Deploy cross-system intelligence amplification.',
        impact: 'medium',
        urgency: 'medium',
        ultraConfidence: 82,
        estimatedLift: 15,
        timeline: '6-8 weeks',
        resources: ['Decision Science Team', 'Analytics Platform', 'Training Facilitator'],
        kpis: ['Interpretation Effectiveness: +15%', 'Cross-System Integration: +20%', 'Decision Velocity: +25%'],
        businessJustification: 'High-performing interpretation system (78%) can catalyze improvement in investigation and alignment systems.',
        prescriptiveActions: [
          'Establish decision intelligence center of excellence',
          'Deploy sentiment analysis and decision tracking systems',
          'Create interpretation-driven improvement protocols',
          'Implement cultural intelligence measurement frameworks'
        ]
      }
    ],
    system_focused: Object.keys(CORE_SYSTEMS).map(systemKey => {
      const system = CORE_SYSTEMS[systemKey];
      return {
        id: `sys-${systemKey}`,
        type: 'system_enhancement',
        system: systemKey,
        title: `${system.name} System Optimization Initiative`,
        description: `Targeted enhancement program for ${system.focus.toLowerCase()} capabilities`,
        impact: 'medium',
        urgency: 'medium',
        systemScore: systemKey === 'investigation' ? 45 : systemKey === 'alignment' ? 52 : Math.floor(Math.random() * 30) + 65,
        capabilities: system.capabilities,
        timeline: '6-10 weeks'
      };
    }),
    transformation_roadmap: [
      {
        id: 'tr-1',
        type: 'transformation_phase',
        phase: 'Foundation',
        title: 'Organizational Health Assessment & Baseline Establishment',
        description: 'Comprehensive diagnostic phase to establish organizational health baseline and identify critical intervention points.',
        duration: '4-6 weeks',
        objectives: ['Complete system health assessment', 'Identify critical dependencies', 'Establish measurement frameworks'],
        deliverables: ['Health Assessment Report', 'System Dependency Map', 'KPI Framework', 'Risk Assessment']
      },
      {
        id: 'tr-2', 
        type: 'transformation_phase',
        phase: 'Stabilization',
        title: 'Critical System Interventions & Quick Wins',
        description: 'Target underperforming systems with high-impact interventions to stabilize organizational health.',
        duration: '8-12 weeks', 
        objectives: ['Address critical system gaps', 'Implement quick-win solutions', 'Establish monitoring systems'],
        deliverables: ['System Optimization Plans', 'Quick-Win Implementation', 'Performance Dashboards', 'Change Management Framework']
      },
      {
        id: 'tr-3',
        type: 'transformation_phase', 
        phase: 'Optimization',
        title: 'Cross-System Integration & Cultural Transformation',
        description: 'Advanced optimization focusing on system synergies and cultural transformation initiatives.',
        duration: '12-16 weeks',
        objectives: ['Optimize system interactions', 'Drive cultural transformation', 'Enhance organizational velocity'],
        deliverables: ['Integration Protocols', 'Cultural Change Programs', 'Advanced Analytics', 'Leadership Development']
      }
    ]
  });

  // Transformation Phases for Roadmap
  const transformationPhases = intelligentRecommendations.transformation_roadmap;

  const [customActions, setCustomActions] = useState([
    {
      id: 'ca-1',
      title: 'Leadership Alignment Workshop Series',
      system: 'alignment', 
      status: 'in-progress',
      priority: 'high',
      assignee: 'Executive Team',
      dueDate: '2025-10-25',
      progress: 60
    },
    {
      id: 'ca-2',
      title: 'Cross-Functional Investigation Protocol Implementation',
      system: 'investigation',
      status: 'planned', 
      priority: 'critical',
      assignee: 'Analytics Team',
      dueDate: '2025-11-15',
      progress: 0
    }
  ]);

  const addCustomAction = () => {
    if (newCustomAction.title.trim()) {
      const action = {
        id: `ca-${Date.now()}`,
        title: newCustomAction.title,
        system: newCustomAction.system,
        status: 'planned',
        priority: newCustomAction.priority,
        assignee: newCustomAction.assignee || 'Unassigned',
        dueDate: newCustomAction.dueDate || new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
        progress: 0
      };
      setCustomActions(prev => [...prev, action]);
      setNewCustomAction({ title: '', system: 'interdependency', priority: 'medium', assignee: '', dueDate: '' });
      setShowAddCustomAction(false);
    }
  };

  const updateActionStatus = (actionId, newStatus) => {
    setCustomActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
  };

  const updateActionProgress = (actionId, progress) => {
    setCustomActions(prev => prev.map(a => a.id === actionId ? { ...a, progress: Number(progress) } : a));
  };

  // Button Functions
  const handleImplementRecommendation = (recommendation) => {
    setImplementingRecommendation(recommendation.id);
    
    // Mock implementation process
    setTimeout(() => {
      // Add to custom actions as implemented
      const implementedAction = {
        id: `impl-${Date.now()}`,
        title: recommendation.title,
        system: recommendation.system,
        status: 'in-progress',
        priority: recommendation.urgency === 'critical' ? 'critical' : 
                 recommendation.urgency === 'high' ? 'high' : 'medium',
        assignee: 'ULTRA System',
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
        progress: 25
      };
      
      setCustomActions(prev => [...prev, implementedAction]);
      setImplementingRecommendation(null);
      
      // Show beautiful success modal instead of alert
      setImplementedRecommendationTitle(recommendation.title);
      setShowImplementationSuccess(true);
    }, 2000);
  };

  const handleViewDetails = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendationDetails(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'blocked': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'planned': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ULTRA-Driven Organizational Health Prescriptions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Intelligent recommendations based on ConseQ-X Six Systems Analysis
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveView('ai')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'ai' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            ULTRA Recommendations
          </button>
          <button
            onClick={() => setActiveView('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'custom' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Custom Actions
          </button>
        </div>
      </div>

      {/* ULTRA Recommendations View */}
      {activeView === 'ai' && (
        <div className="space-y-6">
          {/* ULTRA-Generated Recommendations Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3 mb-4">
              <FaBrain className="w-8 h-8" />
              <h3 className="text-xl font-bold">ULTRA-Generated Organizational Health Prescriptions</h3>
            </div>
            <p className="text-purple-100">
              Intelligent recommendations based on ConseQ-X Six Systems Analysis with 94.7% confidence
            </p>
          </div>

          {/* Intelligent Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {intelligentRecommendations.ai_prescribed.map((rec, index) => (
              <div key={index} className={`rounded-lg border p-6 hover:shadow-lg transition-shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getUrgencyColor(rec.urgency)}`}>
                      <FaCogs className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>System: <span className="text-blue-600 dark:text-blue-400 capitalize">{rec.system}</span></p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(rec.urgency)}`}>
                    {rec.urgency.charAt(0).toUpperCase() + rec.urgency.slice(1)}
                  </div>
                </div>

                <p className={`mb-4 text-sm leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {rec.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaBrain className="w-4 h-4 text-purple-500" />
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confidence: {rec.ultraConfidence}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaChartLine className="w-4 h-4 text-green-500" />
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lift: +{rec.estimatedLift}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="w-4 h-4 text-blue-500" />
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Timeline: {rec.timeline}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUsers className="w-4 h-4 text-orange-500" />
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Resources: {rec.resources.length}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => handleImplementRecommendation(rec)}
                    disabled={implementingRecommendation === rec.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      implementingRecommendation === rec.id 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {implementingRecommendation === rec.id ? 'Implementing...' : 'Implement Recommendation'}
                  </button>
                  <button 
                    onClick={() => handleViewDetails(rec)}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* System-Focused Interventions */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaCogs className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System-Focused Interventions
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(CORE_SYSTEMS).map(([key, system]) => {
                const systemActions = intelligentRecommendations.ai_prescribed.filter(rec => 
                  rec.system.toLowerCase().includes(key) || rec.system.toLowerCase().includes(system.name?.toLowerCase() || system.toLowerCase())
                );
                
                return (
                  <div key={key} className={`p-4 border rounded-lg ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white shadow-sm'}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{system.name || system}</h4>
                    </div>
                    
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span>Active Interventions:</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{systemActions.length}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Avg. Confidence:</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {systemActions.length > 0 ? 
                            Math.round(systemActions.reduce((acc, action) => acc + action.ultraConfidence, 0) / systemActions.length) + '%' : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Priority Score:</span>
                        <span className="font-semibold text-orange-600">
                          {systemActions.filter(a => a.urgency === 'high' || a.urgency === 'critical').length > 0 ? 'High' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transformation Roadmap */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaRoad className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Organizational Transformation Roadmap
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {transformationPhases.map((phase, index) => (
                <div key={phase.id} className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{phase.phase}</h4>
                  </div>
                  
                  <div className={`p-4 border-l-4 ${
                    index === 0 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    index === 1 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-green-500 bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-2">{phase.title}</h5>
                    <p className={`text-xs mb-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{phase.description}</p>
                    
                    <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Duration:</strong> {phase.duration}
                    </div>
                    
                    <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Key Objectives:</strong>
                      <ul className="mt-1 list-disc list-inside">
                        {phase.objectives.slice(0, 2).map((obj, objIndex) => (
                          <li key={objIndex}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          index === 0 ? 'bg-red-500 w-3/4' :
                          index === 1 ? 'bg-yellow-500 w-1/4' :
                          'bg-green-500 w-0'
                        }`}></div>
                      </div>
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {index === 0 ? '75%' : index === 1 ? '25%' : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Actions View */}
      {activeView === 'custom' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Custom Actions & Initiatives
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage custom organizational health initiatives and track progress
              </p>
            </div>
            
            <button
              onClick={() => setShowAddCustomAction(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add Custom Action</span>
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm text-gray-500">Total Actions</div>
              <div className="text-2xl font-bold mt-1">{customActions.length}</div>
            </div>
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm text-gray-500">In Progress</div>
              <div className="text-2xl font-bold mt-1 text-blue-600">{customActions.filter(a => a.status === 'in-progress').length}</div>
            </div>
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-2xl font-bold mt-1 text-green-600">{customActions.filter(a => a.status === 'completed').length}</div>
            </div>
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm text-gray-500">Critical Priority</div>
              <div className="text-2xl font-bold mt-1 text-red-600">{customActions.filter(a => a.priority === 'critical').length}</div>
            </div>
          </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-sm text-gray-500">Total Actions</div>
          <div className="text-2xl font-bold mt-1">{tasks.length}</div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{tasks.filter(t => t.status === 'in-progress').length}</div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{tasks.filter(t => t.status === 'completed').length}</div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-sm text-gray-500">High Priority</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{tasks.filter(t => t.impact === 'high').length}</div>
        </div>
      </div>

          {/* Custom Actions List */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Active Custom Actions</h4>
              <span className="text-sm text-gray-500">{customActions.length} total</span>
            </div>
            
            <div className="space-y-4">
              {customActions.map(action => (
                <div key={action.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">{action.title}</h5>
                      <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        System: <span className="capitalize text-blue-600 dark:text-blue-400">{action.system}</span> • Assignee: <span className="text-green-600 dark:text-green-400">{action.assignee}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(action.priority)}`}>
                        {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(action.status)}`}>
                        {action.status.replace('-', ' ').charAt(0).toUpperCase() + action.status.replace('-', ' ').slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Progress: {action.progress}%</span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${action.progress}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={action.progress}
                        onChange={(e) => updateActionProgress(action.id, e.target.value)}
                        className="w-20"
                      />
                      <select
                        value={action.status}
                        onChange={(e) => updateActionStatus(action.id, e.target.value)}
                        className={`text-xs p-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Organizational Impact Calculator */}
          <AdvancedOrganizationalImpactCalculator darkMode={darkMode} />
        </div>
      )}

      {/* Add Custom Action Modal */}
      {showAddCustomAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-lg w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="p-6">
              <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Custom Organizational Action</h4>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Action Title</label>
                  <input
                    type="text"
                    value={newCustomAction.title}
                    onChange={(e) => setNewCustomAction(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter organizational action title"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Target System</label>
                  <select
                    value={newCustomAction.system}
                    onChange={(e) => setNewCustomAction(prev => ({ ...prev, system: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    {Object.entries(CORE_SYSTEMS).map(([key, system]) => (
                      <option key={key} value={key}>{system.name || system}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority Level</label>
                  <select
                    value={newCustomAction.priority}
                    onChange={(e) => setNewCustomAction(prev => ({ ...prev, priority: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Assignee</label>
                  <input
                    type="text"
                    value={newCustomAction.assignee}
                    onChange={(e) => setNewCustomAction(prev => ({ ...prev, assignee: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter assignee name or team"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                  <input
                    type="date"
                    value={newCustomAction.dueDate}
                    onChange={(e) => setNewCustomAction(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddCustomAction(false)}
                  className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomAction}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md"
                >
                  Add Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Details Modal */}
      {showRecommendationDetails && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedRecommendation.title}
                  </h4>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(selectedRecommendation.urgency)}`}>
                      {selectedRecommendation.urgency.charAt(0).toUpperCase() + selectedRecommendation.urgency.slice(1)} Priority
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      System: <span className="text-blue-600 dark:text-blue-400 capitalize">{selectedRecommendation.system}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecommendationDetails(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Description & Analysis</h5>
                  <p className={`mb-4 leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedRecommendation.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ULTRA Confidence:</span>
                      <span className="text-sm font-semibold text-purple-600">{selectedRecommendation.ultraConfidence}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estimated Impact:</span>
                      <span className="text-sm font-semibold text-green-600">+{selectedRecommendation.estimatedLift}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Timeline:</span>
                      <span className="text-sm font-semibold text-blue-600">{selectedRecommendation.timeline}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Implementation Details</h5>
                  
                  <div className="mb-4">
                    <h6 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Required Resources:</h6>
                    <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedRecommendation.resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Key Performance Indicators:</h6>
                    <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedRecommendation.kpis.map((kpi, idx) => (
                        <li key={idx}>{kpi}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h6 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Prescriptive Actions:</h6>
                    <ul className={`list-decimal list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedRecommendation.prescriptiveActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h6 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Business Justification:</h6>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedRecommendation.businessJustification}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowRecommendationDetails(false)}
                  className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleImplementRecommendation(selectedRecommendation);
                    setShowRecommendationDetails(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md"
                >
                  Implement This Recommendation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Implementation Success Modal */}
      {showImplementationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="p-6 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <FaCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              {/* Success Title */}
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Implementation Started! 🚀
              </h3>
              
              {/* Success Message */}
              <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Your ULTRA recommendation has been successfully initiated and added to your custom actions for tracking.
              </p>
              
              {/* Recommendation Title */}
              <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
                <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {implementedRecommendationTitle}
                </h4>
              </div>
              
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Initial Progress</span>
                  <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>25%</span>
                </div>
                <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-1/4"></div>
                </div>
              </div>
              
              {/* Success Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">In Progress</div>
                </div>
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assignee</div>
                  <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">ULTRA System</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowImplementationSuccess(false);
                    setActiveView('custom'); // Switch to custom actions to see the new item
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  View in Actions
                </button>
                <button
                  onClick={() => setShowImplementationSuccess(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all shadow-md"
                >
                  Continue
                </button>
              </div>
              
              {/* Celebration Effect */}
              <div className="absolute top-4 right-4">
                <span className="text-2xl animate-bounce">🎉</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
