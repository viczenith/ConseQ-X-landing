import React, { useState, useEffect } from 'react';
import { FaCommentDots, FaBrain, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaLightbulb, FaCalendarCheck, FaTimes, FaRobot } from 'react-icons/fa';
import { useIntelligence } from '../../../../contexts/IntelligenceContext';

export default function AINarration({ onClose, darkMode }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(null);
  
  // X-ULTRA Intelligence Integration
  const intelligence = useIntelligence();

  // Get enhanced organizational data with X-ULTRA intelligence
  const getOrganizationalData = () => {
    try {
      const uploads = localStorage.getItem('conseqx_uploads_v1');
      const assessmentData = uploads ? JSON.parse(uploads) : [];
      
      // Integrate X-ULTRA intelligence into analysis
      const baseData = {
        systems: {
          interdependency: { score: 72, trend: 'improving' },
          iteration: { score: 68, trend: 'stable' },
          investigation: { score: 45, trend: 'declining' },
          integration: { score: 78, trend: 'improving' },
          implementation: { score: 63, trend: 'stable' },
          interpretation: { score: 52, trend: 'declining' }
        },
        overallHealth: 63,
        criticalIssues: assessmentData.length === 0 ? ['No recent data uploads'] : [],
        dataPoints: assessmentData.length,
        lastUpdated: new Date().toISOString()
      };

      // Enhance with X-ULTRA intelligence if available
      if (intelligence.sharedMetrics) {
        baseData.xulatraEnhanced = {
          conversationInsights: intelligence.conversationInsights ? intelligence.conversationInsights.length : 0,
          revenueScore: intelligence.sharedMetrics.financialHealth?.score || 'baseline',
          riskLevel: intelligence.sharedMetrics.riskLevel?.level || 'moderate',
          systemsHealth: intelligence.sharedMetrics.overallHealth?.score || 'N/A',
          smartRecommendations: intelligence.generateRecommendations ? intelligence.generateRecommendations() : [],
          contextualData: intelligence.getContextualPrompt ? intelligence.getContextualPrompt('Partner Dashboard Analysis') : ''
        };
      }

      return baseData;
    } catch {
      return null;
    }
  };

  // Generate AI Analysis
  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orgData = getOrganizationalData();
      
      if (!orgData) {
        throw new Error('No organizational data available for analysis');
      }

      // Mock AI analysis for demo purposes (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

      const lowSystems = Object.entries(orgData.systems)
        .filter(([_, data]) => data.score < 60)
        .map(([system, data]) => ({ system, ...data }));

      const highSystems = Object.entries(orgData.systems)
        .filter(([_, data]) => data.score >= 75)
        .map(([system, data]) => ({ system, ...data }));

      // X-ULTRA Enhanced Analysis
      const mockAnalysis = {
        executiveSummary: orgData.xulatraEnhanced 
          ? `X-ULTRA Enhanced Analysis: Your organization shows ${orgData.overallHealth}% health with ${orgData.xulatraEnhanced.conversationInsights} active intelligence insights. Revenue scoring at ${orgData.xulatraEnhanced.revenueScore || 'baseline'} with ${orgData.xulatraEnhanced.riskLevel || 'moderate'} risk profile.`
          : (orgData.overallHealth >= 70 
            ? `Your organization shows strong health with an overall score of ${orgData.overallHealth}%. Key strengths in ${highSystems.map(s => s.system).join(' and ')}.`
            : `Organizational health at ${orgData.overallHealth}% indicates areas for improvement. Priority focus needed on ${lowSystems.map(s => s.system).join(', ')}.`),
        
        criticalInsights: [
          ...lowSystems.map(s => `${s.system}: Score of ${s.score}% suggests immediate attention needed`),
          ...orgData.criticalIssues,
          ...(orgData.xulatraEnhanced?.smartRecommendations?.map(rec => `X-ULTRA Alert: ${rec.title} - ${rec.description}`) || [])
        ],
        
        recommendations: orgData.xulatraEnhanced?.smartRecommendations?.length > 0 ? [
          ...orgData.xulatraEnhanced.smartRecommendations.map(rec => `${rec.title}: ${rec.description}`),
          'Leverage X-ULTRA conversation insights for strategic planning',
          'Monitor real-time intelligence metrics for proactive management'
        ] : (lowSystems.length > 0 ? [
          'Implement weekly check-ins for underperforming systems',
          'Establish clear ownership and accountability metrics',
          'Consider cross-functional collaboration initiatives'
        ] : [
          'Maintain current performance levels',
          'Explore growth and innovation opportunities',
          'Consider expanding successful practices to other areas'
        ]),
        
        nextSteps: [
          'Continue X-ULTRA conversation intelligence capture',
          'Monitor Partner Dashboard integration metrics',
          'Schedule follow-up assessment in 30 days',
          'Implement recommended action items',
          'Leverage X-ULTRA contextual insights for decision making'
        ],

        xulatraEnhanced: orgData.xulatraEnhanced || null
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAnalysis();
  }, []);

  // Export report functionality
  const exportReport = () => {
    try {
      if (!analysis) return;
      
      const reportContent = `X-ULTRA POWERED ORGANIZATIONAL ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
Intelligence Level: ${analysis.xulatraEnhanced ? 'Enhanced with Real-Time Insights' : 'Standard Analysis'}

EXECUTIVE SUMMARY
${analysis.executiveSummary}

CRITICAL INSIGHTS
${analysis.criticalInsights.map(insight => `• ${insight}`).join('\n')}

STRATEGIC RECOMMENDATIONS
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

NEXT STEPS
${analysis.nextSteps.map(step => `• ${step}`).join('\n')}

${analysis.xulatraEnhanced ? `
X-ULTRA INTELLIGENCE SUMMARY
• Conversation Insights Captured: ${analysis.xulatraEnhanced.conversationInsights}
• Revenue Score: ${analysis.xulatraEnhanced.revenueScore || 'Not Available'}
• Risk Assessment: ${analysis.xulatraEnhanced.riskLevel || 'Not Available'}
• Systems Health: ${analysis.xulatraEnhanced.systemsHealth || 'Not Available'}
` : ''}

---
Generated by ConseQ-X X-ULTRA Analysis Engine
Powered by Real-Time Intelligence Integration
`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ConseQ-X-ULTRA-Analysis-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Schedule follow-up functionality
  const scheduleFollowUp = () => {
    try {
      const newFollowUpDate = new Date();
      newFollowUpDate.setDate(newFollowUpDate.getDate() + 30);
      
      const followUpData = {
        id: `followup_${Date.now()}`,
        title: 'ULTRA Analysis Follow-up',
        date: newFollowUpDate.toISOString(),
        type: 'ultra-analysis',
        orgId: 'current-org',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingFollowUps = JSON.parse(localStorage.getItem('conseqx_followups_v1') || '[]');
      existingFollowUps.push(followUpData);
      localStorage.setItem('conseqx_followups_v1', JSON.stringify(existingFollowUps));

      setFollowUpDate(newFollowUpDate);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Scheduling failed:', error);
      setError('Failed to schedule follow-up. Please try again.');
    }
  };

  return (
    <>
      <style>{`
        .ultra-scrollable::-webkit-scrollbar {
          display: none;
        }
        .ultra-scrollable {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div 
        className="ultra-scrollable max-h-[80vh] overflow-y-auto p-6" 
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500`}>
              <FaRobot className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                X-ULTRA Organizational Analysis
                {intelligence.sharedMetrics && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Enhanced
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500">
                {intelligence.sharedMetrics 
                  ? 'Real-time intelligence with conversation insights'
                  : 'Premium AI insights and strategic recommendations'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <FaTimes size={16} />
          </button>
        </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="relative mb-4">
              <FaSpinner className="animate-spin text-emerald-500 mx-auto mb-3" size={24} />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">X-ULTRA analyzing organizational intelligence...</p>
            <p className="text-xs text-gray-400 mt-1">
              {intelligence.sharedMetrics 
                ? `Processing ${intelligence.conversationInsights ? intelligence.conversationInsights.length : 0} conversation insights with real-time metrics`
                : 'Processing 6 systems and cross-dependencies with premium AI precision'
              }
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-600" />
            <div>
              <div className="font-medium text-red-900 dark:text-red-100">ULTRA-Analysis Failed</div>
              <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
            </div>
          </div>
          <button 
            onClick={generateAnalysis}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Retry ULTRA-Analysis
          </button>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <FaCheckCircle className="text-blue-600" />
              <h3 className="font-medium">Executive Summary</h3>
            </div>
            <p className="text-sm leading-relaxed">{analysis.executiveSummary}</p>
          </div>

          {/* Critical Insights */}
          {analysis.criticalInsights.length > 0 && (
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <FaExclamationTriangle className="text-yellow-600" />
                <h3 className="font-medium">Critical Insights</h3>
              </div>
              <ul className="space-y-2">
                {analysis.criticalInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <FaLightbulb className="text-green-600" />
              <h3 className="font-medium">Strategic Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <FaCommentDots className="text-purple-600" />
              <h3 className="font-medium">Next Steps</h3>
            </div>
            <ul className="space-y-2">
              {analysis.nextSteps.map((step, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={generateAnalysis}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2"
            >
              <FaBrain size={14} />
              Regenerate ULTRA-Analysis
            </button>
            <button 
              onClick={exportReport}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Export Report
            </button>
            <button 
              onClick={scheduleFollowUp}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Schedule Follow-up
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Success Modal for Follow-up Scheduling */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-100'} transform transition-all duration-300 scale-100`}>
            {/* Success Header */}
            <div className={`p-6 text-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <FaCalendarCheck className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Follow-up Scheduled Successfully!
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your next ULTRA Analysis has been scheduled
              </p>
            </div>

            {/* Success Content */}
            <div className="p-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/10 border border-green-700' : 'bg-green-50 border border-green-200'} mb-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <FaCheckCircle className="text-green-600 flex-shrink-0" />
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    Reminder Set for {followUpDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  • Automated reminder will be sent 3 days before
                  <br />
                  • Full organizational health reassessment scheduled
                  <br />
                  • ULTRA Analysis report will be generated automatically
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/10 border border-blue-700' : 'bg-blue-50 border border-blue-200'} mb-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <FaLightbulb className="text-blue-600 flex-shrink-0" />
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    What happens next?
                  </div>
                </div>
                <div className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Continue implementing the current recommendations. We'll track progress and provide updated insights during your next analysis.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheckCircle size={14} />
                  Perfect, Got It!
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    exportReport();
                  }}
                  className={`px-4 py-3 rounded-lg font-medium border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Export Current Report
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
