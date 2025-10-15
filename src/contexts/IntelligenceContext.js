import React, { createContext, useContext, useState, useEffect } from 'react';

// Shared Intelligence Context for X-ULTRA and Partner Dashboard Integration
const IntelligenceContext = createContext();

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within IntelligenceProvider');
  }
  return context;
};

export const IntelligenceProvider = ({ children }) => {
  // Shared state between X-ULTRA Chat and Partner Dashboard
  const [sharedMetrics, setSharedMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_shared_metrics_v1');
      return saved ? JSON.parse(saved) : {
        financialHealth: { score: 85, trend: '+12%', lastUpdate: new Date().toISOString() },
        operationalEfficiency: { score: 78, trend: '+8%', lastUpdate: new Date().toISOString() },
        strategicAlignment: { score: 92, trend: '+15%', lastUpdate: new Date().toISOString() },
        riskLevel: { level: 'Medium', score: 35, trend: '-5%', lastUpdate: new Date().toISOString() },
        overallHealth: { score: 83, grade: 'B+', trend: '+10%', lastUpdate: new Date().toISOString() }
      };
    } catch {
      return {
        financialHealth: { score: 85, trend: '+12%', lastUpdate: new Date().toISOString() },
        operationalEfficiency: { score: 78, trend: '+8%', lastUpdate: new Date().toISOString() },
        strategicAlignment: { score: 92, trend: '+15%', lastUpdate: new Date().toISOString() },
        riskLevel: { level: 'Medium', score: 35, trend: '-5%', lastUpdate: new Date().toISOString() },
        overallHealth: { score: 83, grade: 'B+', trend: '+10%', lastUpdate: new Date().toISOString() }
      };
    }
  });

  const [activeInsights, setActiveInsights] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_active_insights_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [partnerDashboardData, setPartnerDashboardData] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_partner_data_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [chatContext, setChatContext] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_chat_context_v1');
      return saved ? JSON.parse(saved) : {
        currentFocus: null,
        recentAnalysis: [],
        suggestedActions: []
      };
    } catch {
      return {
        currentFocus: null,
        recentAnalysis: [],
        suggestedActions: []
      };
    }
  });

  // Sync shared metrics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('conseqx_shared_metrics_v1', JSON.stringify(sharedMetrics));
    } catch (error) {
      console.warn('Failed to save shared metrics:', error);
    }
  }, [sharedMetrics]);

  // Sync active insights to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('conseqx_active_insights_v1', JSON.stringify(activeInsights));
    } catch (error) {
      console.warn('Failed to save active insights:', error);
    }
  }, [activeInsights]);

  // Sync partner dashboard data to localStorage
  useEffect(() => {
    if (partnerDashboardData) {
      try {
        localStorage.setItem('conseqx_partner_data_v1', JSON.stringify(partnerDashboardData));
      } catch (error) {
        console.warn('Failed to save partner dashboard data:', error);
      }
    }
  }, [partnerDashboardData]);

  // Sync chat context to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('conseqx_chat_context_v1', JSON.stringify(chatContext));
    } catch (error) {
      console.warn('Failed to save chat context:', error);
    }
  }, [chatContext]);

  // Intelligence Bridge Functions
  const updateMetricFromChat = (metricType, newData) => {
    setSharedMetrics(prev => ({
      ...prev,
      [metricType]: {
        ...prev[metricType],
        ...newData,
        lastUpdate: new Date().toISOString(),
        source: 'x-ultra-chat'
      }
    }));
  };

  const updateMetricFromDashboard = (metricType, newData) => {
    setSharedMetrics(prev => ({
      ...prev,
      [metricType]: {
        ...prev[metricType],
        ...newData,
        lastUpdate: new Date().toISOString(),
        source: 'partner-dashboard'
      }
    }));
  };

  const addInsight = (insight) => {
    const newInsight = {
      id: `insight_${Date.now()}`,
      ...insight,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    
    setActiveInsights(prev => [newInsight, ...prev].slice(0, 20)); // Keep latest 20 insights
  };

  const markInsightActioned = (insightId) => {
    setActiveInsights(prev => 
      prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: 'actioned', actionedAt: new Date().toISOString() }
          : insight
      )
    );
  };

  const getContextualPrompt = () => {
    const recentMetrics = Object.entries(sharedMetrics)
      .map(([key, value]) => `${key}: ${value.score || value.level} (${value.trend})`)
      .join(', ');
    
    const recentInsights = activeInsights
      .filter(insight => insight.status === 'active')
      .slice(0, 3)
      .map(insight => insight.title)
      .join(', ');

    return `Current organizational metrics: ${recentMetrics}. Recent insights: ${recentInsights}. `;
  };

  const updateChatContext = (updates) => {
    setChatContext(prev => ({
      ...prev,
      ...updates,
      lastUpdate: new Date().toISOString()
    }));
  };

  const syncPartnerDashboardData = (data) => {
    setPartnerDashboardData({
      ...data,
      lastSync: new Date().toISOString()
    });
  };

  // Intelligence recommendation engine
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Financial recommendations
    if (sharedMetrics.financialHealth.score < 70) {
      recommendations.push({
        type: 'financial',
        priority: 'high',
        title: 'Financial Health Improvement',
        description: 'Focus on cost optimization and revenue growth strategies',
        suggestedActions: ['Review expense categories', 'Identify new revenue streams', 'Optimize pricing strategy']
      });
    }

    // Operational recommendations
    if (sharedMetrics.operationalEfficiency.score < 80) {
      recommendations.push({
        type: 'operational',
        priority: 'medium',
        title: 'Operational Efficiency Enhancement',
        description: 'Streamline processes and improve workflow automation',
        suggestedActions: ['Process mapping', 'Automation assessment', 'Team productivity analysis']
      });
    }

    // Strategic recommendations
    if (sharedMetrics.strategicAlignment.score < 85) {
      recommendations.push({
        type: 'strategic',
        priority: 'high',
        title: 'Strategic Alignment Improvement',
        description: 'Enhance cross-departmental coordination and goal alignment',
        suggestedActions: ['Leadership alignment sessions', 'Goal cascade review', 'Communication improvement']
      });
    }

    return recommendations;
  };

  const value = {
    // State
    sharedMetrics,
    activeInsights,
    conversationInsights: activeInsights, // Alias for compatibility
    partnerDashboardData,
    chatContext,
    
    // Actions
    updateMetricFromChat,
    updateMetricFromDashboard,
    addInsight,
    markInsightActioned,
    updateChatContext,
    syncPartnerDashboardData,
    
    // Intelligence
    getContextualPrompt,
    generateRecommendations
  };

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
};

export default IntelligenceContext;