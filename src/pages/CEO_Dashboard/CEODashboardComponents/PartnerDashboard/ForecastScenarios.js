import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ComposedChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  FaMagic, FaCalculator, FaSave, FaPlay, FaUndo, FaChartLine, FaExclamationTriangle, 
  FaLightbulb, FaBrain, FaRobot, FaHeart, FaCog, FaUsers, FaSearchPlus, FaArrowUp,
  FaShieldAlt, FaRocket, FaEye
} from 'react-icons/fa';

// ConseQ-X Six Systems Model - Organizational Health Framework
const CORE_SYSTEMS = {
  interdependency: { 
    name: 'Interdependency', 
    focus: 'Organizational Networks',
    impact: 0.18, 
    color: '#3b82f6',
    icon: '🔗',
    capabilities: ['Dependency mapping', 'Bottleneck detection', 'Collaboration analysis'],
    uniqueValue: 'Cross-functional network analysis beyond what ERPs provide'
  },
  iteration: { 
    name: 'Iteration', 
    focus: 'Adaptive Capacity',
    impact: 0.17, 
    color: '#10b981',
    icon: '🔄',
    capabilities: ['Cycle analysis', 'Improvement tracking', 'Agility metrics'],
    uniqueValue: 'Innovation velocity assessment vs standard project metrics'
  },
  investigation: { 
    name: 'Investigation', 
    focus: 'Analytical Depth',
    impact: 0.16, 
    color: '#f59e0b',
    icon: '🔍',
    capabilities: ['Root-cause analysis', 'Data quality assessment', 'Pattern discovery'],
    uniqueValue: 'Automated root-cause analysis vs manual BI investigation'
  },
  interpretation: { 
    name: 'Interpretation', 
    focus: 'Intelligence Synthesis',
    impact: 0.17, 
    color: '#ef4444',
    icon: '💡',
    capabilities: ['Sentiment analysis', 'Decision tracking', 'Insight generation'],
    uniqueValue: 'Decision quality analytics integrated with cultural factors'
  },
  illustration: { 
    name: 'Illustration', 
    focus: 'Information Flow',
    impact: 0.16, 
    color: '#8b5cf6',
    icon: '📊',
    capabilities: ['Communication analysis', 'Visualization quality', 'Knowledge transfer'],
    uniqueValue: 'Communication effectiveness measurement beyond process metrics'
  },
  alignment: { 
    name: 'Alignment', 
    focus: 'Strategic Coherence',
    impact: 0.16, 
    color: '#06b6d4',
    icon: '🎯',
    capabilities: ['Goal alignment', 'Strategy execution', 'Organizational synchronization'],
    uniqueValue: 'Strategic coherence assessment vs compliance reporting'
  }
};

// Advanced ConseQ-X Organizational Health Forecasting Engine
function generateAdvancedOrganizationalForecast(currentScores, adjustments = {}, interventions = {}, timeframe = 12) {
  const forecast = [];
  const baseDate = new Date();
  
  // Generate cultural analytics and behavioral patterns
  const generateCulturalFactors = (month) => {
    return {
      collaboration_index: 75 + Math.sin(month * 0.3) * 5,
      innovation_velocity: 68 + Math.cos(month * 0.4) * 7,
      communication_effectiveness: 82 + Math.sin(month * 0.2) * 4,
      decision_quality: 71 + Math.cos(month * 0.5) * 6,
      change_readiness: 65 + Math.sin(month * 0.25) * 8,
      leadership_effectiveness: 78 + Math.cos(month * 0.35) * 5
    };
  };

  // Generate predictive risk areas and opportunities
  const generatePredictiveInsights = (month, scores) => {
    const riskAreas = [];
    const opportunities = [];
    
    Object.entries(scores).forEach(([key, score]) => {
      if (score < 50) {
        riskAreas.push({
          system: key,
          risk_level: score < 40 ? 'critical' : 'high',
          probability: Math.min(0.9, 0.6 + (50 - score) * 0.01),
          impact: 'high'
        });
      } else if (score > 80) {
        opportunities.push({
          system: key,
          leverage_potential: score > 90 ? 'very_high' : 'high',
          impact_score: Math.round(score + Math.random() * 10),
          transformation_catalyst: true
        });
      }
    });

    return { riskAreas, opportunities };
  };
  
  for (let month = 0; month <= timeframe; month++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + month);
    
    let overallScore = 0;
    const systemScores = {};
    const culturalFactors = generateCulturalFactors(month);
    
    Object.entries(CORE_SYSTEMS).forEach(([key, system]) => {
      const currentScore = currentScores[key] || 70;
      const adjustment = adjustments[key] || 0;
      const interventionBoost = interventions[key] ? 15 : 0; // Intervention impact
      const targetScore = Math.max(20, Math.min(95, currentScore + adjustment + interventionBoost));
      
      // Advanced organizational dynamics simulation
      const progress = month / timeframe;
      const changeRate = 1 - Math.exp(-2.5 * progress); // Organizational change curve
      const culturalAlignment = (culturalFactors.collaboration_index / 100) * 0.1; // Cultural impact
      const systemSynergy = Math.sin(month * 0.3) * 0.05; // Cross-system effects
      const marketVolatility = (Math.random() - 0.5) * 3; // External factors
      
      const projectedScore = currentScore + 
        (targetScore - currentScore) * changeRate + 
        culturalAlignment + 
        systemSynergy + 
        marketVolatility;
      
      const finalScore = Math.max(20, Math.min(95, projectedScore));
      
      systemScores[key] = Math.round(finalScore);
      overallScore += finalScore * system.impact;
    });
    
    // Advanced confidence modeling based on organizational factors
    const dataCompleteness = Math.max(0.7, 1 - (month * 0.02)); // Decreasing data certainty
    const interventionConfidence = Object.keys(interventions).length > 0 ? 0.85 : 0.70;
    const organizationalStability = 0.8 + Math.sin(month * 0.1) * 0.1;
    const confidence = Math.round((dataCompleteness * interventionConfidence * organizationalStability) * 100);
    
    const confidenceWidth = Math.max(2, 10 - (confidence * 0.08));
    const upperBound = Math.min(95, overallScore + confidenceWidth);
    const lowerBound = Math.max(20, overallScore - confidenceWidth);
    
    const predictiveInsights = generatePredictiveInsights(month, systemScores);
    
    forecast.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      date: date.toISOString(),
      overall: Math.round(overallScore),
      upperBound: Math.round(upperBound),
      lowerBound: Math.round(lowerBound),
      confidence: confidence,
      transformation_readiness: Math.round(65 + Math.sin(month * 0.2) * 15),
      organizational_velocity: Math.round(70 + Math.cos(month * 0.25) * 12),
      cultural_health: Math.round((culturalFactors.collaboration_index + culturalFactors.innovation_velocity) / 2),
      risk_areas: predictiveInsights.riskAreas,
      opportunities: predictiveInsights.opportunities,
      ...systemScores,
      ...culturalFactors
    });
  }
  
  return forecast;
}

// Advanced Organizational Health Forecast Visualization
function AdvancedOrganizationalForecastChart({ data, darkMode, showConfidence = true, showCulturalMetrics = false }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="month" 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <YAxis 
          domain={[20, 100]}
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name) => {
            const formatters = {
              'overall': 'Organizational Health',
              'transformation_readiness': 'Transformation Readiness',
              'cultural_health': 'Cultural Health',
              'organizational_velocity': 'Organizational Velocity',
              'confidence': 'Confidence Level',
              'upperBound': 'Upper Confidence',
              'lowerBound': 'Lower Confidence',
              'collaboration_index': 'Collaboration Index',
              'innovation_velocity': 'Innovation Velocity',
              'communication_effectiveness': 'Communication Effectiveness'
            };
            return [
              `${typeof value === 'number' ? Math.round(value) : value}${name === 'confidence' ? '%' : name.includes('index') || name.includes('velocity') || name.includes('effectiveness') ? '%' : '%'}`,
              formatters[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ')
            ];
          }}
        />
        
        {showConfidence && (
          <Area
            type="monotone"
            dataKey="upperBound"
            stackId="1"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.15}
          />
        )}
        {showConfidence && (
          <Area
            type="monotone"
            dataKey="lowerBound"
            stackId="1"
            stroke="none"
            fill={darkMode ? '#1f2937' : '#ffffff'}
            fillOpacity={1}
          />
        )}
        
        {/* Primary Organizational Health Line */}
        <Line 
          type="monotone" 
          dataKey="overall" 
          stroke="#3b82f6" 
          strokeWidth={4}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 8, fill: '#1e40af' }}
          name="Organizational Health"
        />

        {/* Cultural Health Integration */}
        {showCulturalMetrics && (
          <>
            <Line 
              type="monotone" 
              dataKey="cultural_health" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
              strokeDasharray="5 5"
              name="Cultural Health"
            />
            <Line 
              type="monotone" 
              dataKey="transformation_readiness" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
              strokeDasharray="8 4"
              name="Transformation Readiness"
            />
          </>
        )}
        
        {showConfidence && (
          <>
            <Line 
              type="monotone" 
              dataKey="upperBound" 
              stroke="#3b82f6" 
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Confidence Band"
            />
            <Line 
              type="monotone" 
              dataKey="lowerBound" 
              stroke="#3b82f6" 
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name=""
            />
          </>
        )}
        
        <Legend />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Advanced Scenario Analysis Component 
function OrganizationalScenarioAnalysis({ scenarios, darkMode }) {
  return (
    <div className="space-y-4">
      {scenarios.map((scenario, idx) => (
        <div key={idx} className={`p-4 rounded-xl border-l-4 ${
          scenario.type === 'transformation' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
          scenario.type === 'optimization' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
          scenario.type === 'recovery' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
          'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                scenario.type === 'transformation' ? 'bg-blue-600' :
                scenario.type === 'optimization' ? 'bg-green-600' :
                scenario.type === 'recovery' ? 'bg-red-600' :
                'bg-purple-600'
              }`}>
                {scenario.type === 'transformation' ? <FaRocket className="text-white text-sm" /> :
                 scenario.type === 'optimization' ? <FaCog className="text-white text-sm" /> :
                 scenario.type === 'recovery' ? <FaShieldAlt className="text-white text-sm" /> :
                 <FaBrain className="text-white text-sm" />}
              </div>
              <div>
                <div className="font-semibold">{scenario.name}</div>
                <div className="text-xs text-gray-500">{scenario.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                scenario.projected_impact > 15 ? 'text-green-600' :
                scenario.projected_impact > 5 ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                +{scenario.projected_impact}%
              </div>
              <div className="text-xs text-gray-500">Expected Impact</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
              <div className="text-gray-500">Timeline</div>
              <div className="font-medium">{scenario.timeline}</div>
            </div>
            <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
              <div className="text-gray-500">Confidence</div>
              <div className="font-medium">{scenario.confidence}%</div>
            </div>
            <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
              <div className="text-gray-500">Risk Level</div>
              <div className={`font-medium ${
                scenario.risk_level === 'low' ? 'text-green-600' :
                scenario.risk_level === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {scenario.risk_level}
              </div>
            </div>
            <div className={`p-2 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
              <div className="text-gray-500">Investment</div>
              <div className="font-medium">${scenario.investment?.toLocaleString() || 'TBD'}</div>
            </div>
          </div>
          
          {scenario.key_interventions && (
            <div className="mt-3">
              <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Key Interventions:</div>
              <div className="flex flex-wrap gap-2">
                {scenario.key_interventions.map((intervention, i) => (
                  <span key={i} className={`px-2 py-1 text-xs rounded ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {intervention}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Advanced ROI Calculator with Organizational Health Value Modeling
function AdvancedOrganizationalROICalculator({ adjustments, interventions, currentScores, darkMode }) {
  const [baseCost, setBaseCost] = useState(2500000); // Larger organizational cost base
  const [implementationCost, setImplementationCost] = useState(150000);
  const [culturalTransformationCost, setCulturalTransformationCost] = useState(75000);
  const [changeManagementCost, setChangeManagementCost] = useState(50000);
  
  const calculations = useMemo(() => {
    const currentOverall = Object.entries(currentScores).reduce((sum, [key, score]) => 
      sum + (score || 70) * CORE_SYSTEMS[key].impact, 0);
    
    const adjustedOverall = Object.entries(currentScores).reduce((sum, [key, score]) => {
      const baseScore = score || 70;
      const adjustment = adjustments[key] || 0;
      const interventionBoost = interventions[key] ? 12 : 0; // Intervention impact
      return sum + (baseScore + adjustment + interventionBoost) * CORE_SYSTEMS[key].impact;
    }, 0);
    
    const improvement = adjustedOverall - currentOverall;
    
    // Advanced organizational value calculations
    const operationalEfficiencyGains = (improvement / 100) * baseCost * 0.6; // 60% operational
    const culturalProductivityGains = (improvement / 100) * baseCost * 0.25; // 25% cultural
    const strategicAlignmentValue = (improvement / 100) * baseCost * 0.15; // 15% strategic
    
    const totalAnnualValue = operationalEfficiencyGains + culturalProductivityGains + strategicAlignmentValue;
    
    const totalInvestment = implementationCost + 
      (Object.keys(interventions).length > 0 ? culturalTransformationCost : 0) +
      (improvement > 10 ? changeManagementCost : 0);
    
    const roi = ((totalAnnualValue - totalInvestment) / totalInvestment) * 100;
    const paybackMonths = totalInvestment / (totalAnnualValue / 12);
    
    // Risk-adjusted calculations
    const organizationalRisk = Math.max(0, (20 - improvement) * 0.02); // Higher risk for lower improvement
    const riskAdjustedValue = totalAnnualValue * (1 - organizationalRisk);
    
    return {
      improvement: Math.round(improvement * 10) / 10,
      operationalGains: Math.round(operationalEfficiencyGains),
      culturalGains: Math.round(culturalProductivityGains),
      strategicValue: Math.round(strategicAlignmentValue),
      totalAnnualValue: Math.round(totalAnnualValue),
      totalInvestment: Math.round(totalInvestment),
      roi: Math.round(roi * 10) / 10,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      threeYearValue: Math.round(riskAdjustedValue * 3 - totalInvestment),
      fiveYearValue: Math.round(riskAdjustedValue * 5 - totalInvestment),
      organizationalRisk: Math.round(organizationalRisk * 100),
      transformationScore: Math.round(65 + improvement * 2) // Transformation readiness
    };
  }, [adjustments, interventions, currentScores, baseCost, implementationCost, culturalTransformationCost, changeManagementCost]);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-2">Annual Organizational Cost</label>
          <input 
            type="number" 
            value={baseCost}
            onChange={(e) => setBaseCost(Number(e.target.value))}
            className={`w-full p-2 border rounded-lg text-sm ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2">Implementation Investment</label>
          <input 
            type="number" 
            value={implementationCost}
            onChange={(e) => setImplementationCost(Number(e.target.value))}
            className={`w-full p-2 border rounded-lg text-sm ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2">Cultural Transformation</label>
          <input 
            type="number" 
            value={culturalTransformationCost}
            onChange={(e) => setCulturalTransformationCost(Number(e.target.value))}
            className={`w-full p-2 border rounded-lg text-sm ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2">Change Management</label>
          <input 
            type="number" 
            value={changeManagementCost}
            onChange={(e) => setChangeManagementCost(Number(e.target.value))}
            className={`w-full p-2 border rounded-lg text-sm ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>
      
      {/* Value Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="text-xs text-gray-500 mb-1">Operational Gains</div>
          <div className="text-sm font-bold text-blue-600">
            ${calculations.operationalGains?.toLocaleString() || '0'}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="text-xs text-gray-500 mb-1">Cultural Gains</div>
          <div className="text-sm font-bold text-green-600">
            ${calculations.culturalGains?.toLocaleString() || '0'}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="text-xs text-gray-500 mb-1">Strategic Value</div>
          <div className="text-sm font-bold text-purple-600">
            ${calculations.strategicValue?.toLocaleString() || '0'}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Health Improvement</div>
          <div className={`text-lg font-bold ${calculations.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
            +{calculations.improvement}%
          </div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Annual Value</div>
          <div className="text-lg font-bold text-blue-600">
            ${calculations.totalAnnualValue?.toLocaleString() || '0'}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-xs text-gray-500 mb-1">ROI</div>
          <div className={`text-lg font-bold ${calculations.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {calculations.roi}%
          </div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Payback</div>
          <div className="text-lg font-bold text-purple-600">
            {calculations.paybackMonths} mo
          </div>
        </div>
      </div>

      {/* Long-term Value Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${
          calculations.threeYearValue > 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="font-medium mb-1">3-Year Value</div>
          <div className={`text-xl font-bold ${
            calculations.threeYearValue > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${calculations.threeYearValue?.toLocaleString() || '0'}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${
          calculations.fiveYearValue > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
          'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="font-medium mb-1">5-Year Value</div>
          <div className={`text-xl font-bold ${
            calculations.fiveYearValue > 0 ? 'text-blue-600' : 'text-yellow-600'
          }`}>
            ${calculations.fiveYearValue?.toLocaleString() || '0'}
          </div>
        </div>
      </div>

      {/* Transformation Assessment */}
      <div className={`p-4 rounded-xl mt-4 ${
        calculations.transformationScore >= 80 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' :
        calculations.transformationScore >= 65 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' :
        'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Transformation Readiness Score</div>
            <div className="text-xs text-gray-500 mt-1">
              Organizational change capacity assessment
            </div>
          </div>
          <div className={`text-2xl font-bold ${
            calculations.transformationScore >= 80 ? 'text-green-600' :
            calculations.transformationScore >= 65 ? 'text-blue-600' :
            'text-yellow-600'
          }`}>
            {calculations.transformationScore}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              calculations.transformationScore >= 80 ? 'bg-green-500' :
              calculations.transformationScore >= 65 ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}
            style={{ width: `${calculations.transformationScore}%` }}
          />
        </div>
        {calculations.organizationalRisk > 10 && (
          <div className="text-xs text-orange-600 mt-2">
            ⚠️ Organizational risk factor: {calculations.organizationalRisk}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdvancedForecastScenarios() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  
  const [currentScores] = useState({
    interdependency: 72,
    iteration: 68,
    investigation: 45, // Low performing system
    interpretation: 78,
    illustration: 63,
    alignment: 52 // Another low performer
  });
  
  const [adjustments, setAdjustments] = useState({});
  const [interventions, setInterventions] = useState({}); // New: Strategic interventions
  const [timeframe, setTimeframe] = useState(12);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showCulturalMetrics, setShowCulturalMetrics] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('predictive'); // predictive, scenarios, transformation
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  
  // Advanced organizational scenarios
  const [organizationalScenarios] = useState([
    {
      id: 1,
      name: 'Digital Transformation Initiative',
      type: 'transformation',
      description: 'Comprehensive digital transformation with cultural change management',
      projected_impact: 22,
      timeline: '18-24 months',
      confidence: 78,
      risk_level: 'medium',
      investment: 850000,
      key_interventions: ['Leadership Development', 'Process Automation', 'Cultural Change', 'Skills Development']
    },
    {
      id: 2,
      name: 'Operational Excellence Program',
      type: 'optimization',
      description: 'Lean Six Sigma implementation with cross-functional optimization',
      projected_impact: 18,
      timeline: '12-18 months',
      confidence: 85,
      risk_level: 'low',
      investment: 450000,
      key_interventions: ['Process Optimization', 'Quality Systems', 'Performance Management']
    },
    {
      id: 3,
      name: 'Cultural Transformation & Engagement',
      type: 'cultural',
      description: 'Organization-wide cultural transformation and employee engagement',
      projected_impact: 15,
      timeline: '24-36 months',
      confidence: 70,
      risk_level: 'high',
      investment: 650000,
      key_interventions: ['Leadership Alignment', 'Communication Systems', 'Change Champions', 'Feedback Mechanisms']
    },
    {
      id: 4,
      name: 'Crisis Recovery & Resilience',
      type: 'recovery',
      description: 'Organizational recovery with resilience building and risk mitigation',
      projected_impact: 25,
      timeline: '6-12 months',
      confidence: 82,
      risk_level: 'medium',
      investment: 350000,
      key_interventions: ['Crisis Management', 'Resilience Building', 'Risk Mitigation', 'Stakeholder Alignment']
    }
  ]);
  
  const forecast = useMemo(() => 
    generateAdvancedOrganizationalForecast(currentScores, adjustments, interventions, timeframe), 
    [currentScores, adjustments, interventions, timeframe]
  );
  
  const handleAdjustment = (system, value) => {
    setAdjustments(prev => ({
      ...prev,
      [system]: Number(value)
    }));
  };

  const handleIntervention = (system, enabled) => {
    setInterventions(prev => ({
      ...prev,
      [system]: enabled
    }));
  };
  
  const resetAdjustments = () => {
    setAdjustments({});
    setInterventions({});
  };
  
  const saveScenario = () => {
    if (!scenarioName.trim()) return;
    
    const scenario = {
      id: Date.now().toString(),
      name: scenarioName,
      adjustments: { ...adjustments },
      interventions: { ...interventions },
      timestamp: Date.now(),
      projectedImprovement: forecast[forecast.length - 1].overall - forecast[0].overall,
      culturalImpact: forecast[forecast.length - 1].cultural_health - forecast[0].cultural_health
    };
    
    setSavedScenarios(prev => [scenario, ...prev.slice(0, 4)]); // Keep last 5
    setScenarioName('');
  };
  
  const loadScenario = (scenario) => {
    setAdjustments(scenario.adjustments);
    setInterventions(scenario.interventions || {});
  };
  
  const getAdvancedOrganizationalInsights = () => {
    const finalScore = forecast[forecast.length - 1]?.overall || 0;
    const currentScore = forecast[0]?.overall || 0;
    const improvement = finalScore - currentScore;
    
    const culturalImprovement = (forecast[forecast.length - 1]?.cultural_health || 0) - (forecast[0]?.cultural_health || 0);
    const transformationReadiness = forecast[forecast.length - 1]?.transformation_readiness || 0;
    
    const insights = [];
    
    // Organizational health insights
    if (improvement > 15) {
      insights.push({ 
        type: 'success', 
        icon: <FaRocket />,
        text: `Exceptional organizational transformation projected: +${Math.round(improvement)}% health improvement` 
      });
    } else if (improvement > 8) {
      insights.push({ 
        type: 'success', 
        icon: <FaArrowUp />,
        text: `Strong organizational improvement expected: +${Math.round(improvement)}% health gain` 
      });
    } else if (improvement > 3) {
      insights.push({ 
        type: 'info', 
        icon: <FaEye />,
        text: `Moderate organizational enhancement: +${Math.round(improvement)}% improvement trajectory` 
      });
    } else if (improvement < -3) {
      insights.push({ 
        type: 'warning', 
        icon: <FaExclamationTriangle />,
        text: `Organizational health decline risk: ${Math.round(improvement)}% trajectory` 
      });
    }

    // Cultural transformation insights
    if (culturalImprovement > 8) {
      insights.push({ 
        type: 'cultural', 
        icon: <FaHeart />,
        text: `Significant cultural transformation projected: +${Math.round(culturalImprovement)}% cultural health` 
      });
    }

    // Transformation readiness assessment
    if (transformationReadiness > 80) {
      insights.push({ 
        type: 'transformation', 
        icon: <FaBrain />,
        text: `Organization highly ready for transformation: ${transformationReadiness}% readiness score` 
      });
    } else if (transformationReadiness < 50) {
      insights.push({ 
        type: 'warning', 
        icon: <FaShieldAlt />,
        text: `Transformation readiness requires attention: ${transformationReadiness}% readiness` 
      });
    }

    // System-specific insights
    const interventionSystems = Object.keys(interventions).filter(k => interventions[k]);
    if (interventionSystems.length > 0) {
      const systemNames = interventionSystems.map(k => CORE_SYSTEMS[k]?.name).join(', ');
      insights.push({ 
        type: 'intervention', 
        icon: <FaCog />,
        text: `Strategic interventions activated for: ${systemNames}` 
      });
    }
    
    return insights;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with ConseQ-X Branding */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            🔮 <FaBrain className="text-purple-600" />
            ConseQ-X Predictive Health Analytics
          </h3>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Advanced organizational health forecasting with cultural analytics integration - Your Organization's Predictive Partner
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className={`px-3 py-2 rounded-lg border text-sm ${
              darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
            <option value={18}>18 Months</option>
            <option value={24}>24 Months</option>
            <option value={36}>36 Months</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
            />
            Confidence Bands
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={showCulturalMetrics}
              onChange={(e) => setShowCulturalMetrics(e.target.checked)}
            />
            Cultural Metrics
          </label>
        </div>
      </div>

      {/* Analysis Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'predictive', label: '🔮 Predictive Health', color: 'purple' },
          { key: 'scenarios', label: '🎭 Strategic Scenarios', color: 'blue' },
          { key: 'transformation', label: '🚀 Transformation Planning', color: 'green' }
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

      {/* Main Analysis Content */}
      {analysisMode === 'predictive' && (
        <>
          {/* Advanced Organizational Health Forecast */}
          <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-bold text-xl flex items-center gap-3">
                  <FaChartLine className="text-blue-600" />
                  🏥 Organizational Health Forecast
                </h4>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ULTRA-driven predictive analytics with cultural integration and confidence modeling
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-right">
                <div>
                  <div className="text-xs text-gray-500">Current Health</div>
                  <div className="text-2xl font-bold text-blue-600">{forecast[0]?.overall}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Projected ({timeframe}mo)</div>
                  <div className="text-2xl font-bold text-purple-600">{forecast[forecast.length - 1]?.overall}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Cultural Health</div>
                  <div className="text-lg font-bold text-green-600">{Math.round(forecast[forecast.length - 1]?.cultural_health || 0)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="text-lg font-bold text-orange-600">{forecast[forecast.length - 1]?.confidence}%</div>
                </div>
              </div>
            </div>
            
            <AdvancedOrganizationalForecastChart 
              data={forecast} 
              darkMode={darkMode} 
              showConfidence={showConfidence}
              showCulturalMetrics={showCulturalMetrics}
            />
            
            {/* Advanced Organizational Insights */}
            {getAdvancedOrganizationalInsights().length > 0 && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getAdvancedOrganizationalInsights().map((insight, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${
                    insight.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    insight.type === 'cultural' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' :
                    insight.type === 'transformation' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                    insight.type === 'intervention' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                    'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      insight.type === 'success' ? 'bg-green-600' :
                      insight.type === 'warning' ? 'bg-yellow-600' :
                      insight.type === 'cultural' ? 'bg-pink-600' :
                      insight.type === 'transformation' ? 'bg-blue-600' :
                      insight.type === 'intervention' ? 'bg-purple-600' :
                      'bg-indigo-600'
                    } text-white text-sm`}>
                      {insight.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                      insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                      insight.type === 'cultural' ? 'text-pink-800 dark:text-pink-200' :
                      insight.type === 'transformation' ? 'text-blue-800 dark:text-blue-200' :
                      insight.type === 'intervention' ? 'text-purple-800 dark:text-purple-200' :
                      'text-indigo-800 dark:text-indigo-200'
                    }`}>{insight.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {analysisMode === 'scenarios' && (
        <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-blue-600 text-xl" />
            <div>
              <h4 className="font-bold text-xl">🎭 Strategic Organizational Scenarios</h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ULTRA-generated transformation scenarios with predictive impact modeling
              </p>
            </div>
          </div>
          <OrganizationalScenarioAnalysis scenarios={organizationalScenarios} darkMode={darkMode} />
        </div>
      )}

      {analysisMode === 'transformation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advanced What-If Simulator */}
          <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-lg flex items-center gap-3">
                <FaPlay className="text-green-600" />
                🔬 Transformation Simulator
              </h4>
              <button 
                onClick={resetAdjustments}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <FaUndo />
                Reset All
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(CORE_SYSTEMS).map(([key, system]) => (
                <div key={key} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{system.icon}</span>
                      <div>
                        <div className="font-medium">{system.name}</div>
                        <div className="text-xs text-gray-500">{system.focus}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Change: {adjustments[key] > 0 ? '+' : ''}{adjustments[key] || 0}%
                      </div>
                      <label className="flex items-center gap-2 text-xs">
                        <input 
                          type="checkbox" 
                          checked={interventions[key] || false}
                          onChange={(e) => handleIntervention(key, e.target.checked)}
                        />
                        Strategic Intervention
                      </label>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-25" 
                    max="30" 
                    value={adjustments[key] || 0}
                    onChange={(e) => handleAdjustment(key, e.target.value)}
                    className="w-full"
                    style={{ accentColor: system.color }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>-25%</span>
                    <span>Current: {currentScores[key]}%</span>
                    <span>+30%</span>
                  </div>
                  {interventions[key] && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      ⚡ +12% intervention boost applied
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Save Scenario */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Scenario name..." 
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
                <button 
                  onClick={saveScenario}
                  disabled={!scenarioName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <FaSave />
                  Save
                </button>
              </div>
              
              {savedScenarios.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Saved Scenarios:</div>
                  <div className="space-y-2">
                    {savedScenarios.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => loadScenario(scenario)}
                        className={`w-full text-left p-3 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          darkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Health Impact: +{Math.round(scenario.projectedImprovement)}% | 
                          Cultural Impact: +{Math.round(scenario.culturalImpact || 0)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced ROI Calculator */}
          <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-700/50' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'}`}>
            <h4 className="font-bold text-lg mb-6 flex items-center gap-3">
              <FaCalculator className="text-orange-600" />
              💰 Organizational Value Calculator
            </h4>
            
            <AdvancedOrganizationalROICalculator 
              adjustments={adjustments} 
              interventions={interventions}
              currentScores={currentScores} 
              darkMode={darkMode} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
