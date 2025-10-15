import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaPaperPlane, FaPaperclip, FaCube, FaChartLine, FaExclamationTriangle, FaShieldAlt, FaArrowUp, FaFileAlt, FaBullseye, FaDownload, FaChartPie } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import { useIntelligence } from "../../../contexts/IntelligenceContext";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";
import { generateSystemReport } from "../../../utils/aiPromptGenerator";
import { buildIndex, queryIndex } from "../../../lib/rag";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Chat3DVisualizer from './Chat3DVisualizer';

function TypingIndicator({ darkMode }) {
  const dotClass = `h-2 w-2 rounded-full animate-pulse ${darkMode ? "bg-gray-500" : "bg-gray-400"}`;
  return (
    <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      <div className={dotClass} />
      <div className={`${dotClass} delay-75`} />
      <div className={`${dotClass} delay-150`} />
    </div>
  );
}

function MessageRow({ m, darkMode }) {
  const isUser = m.role === "user";
  
  // Check if message should include 3D visualization
  const shouldShow3D = !isUser && (
    m.visualization3D || 
    m.includeVisualization ||
    (m.text && (
      m.text.toLowerCase().includes('3d') || 
      m.text.toLowerCase().includes('visual') || 
      m.text.toLowerCase().includes('chart') ||
      m.text.toLowerCase().includes('analysis') ||
      m.text.toLowerCase().includes('organizational health') ||
      m.text.toLowerCase().includes('system scores')
    ))
  );
  
  // Debug logging
  if (!isUser && m.text && m.text.includes('3D Visual Analysis')) {
    console.log('3D Message Debug:', {
      messageId: m.id,
      visualization3D: m.visualization3D,
      visualData: m.visualData,
      visualType: m.visualType,
      shouldShow3D: shouldShow3D,
      textIncludes3D: m.text.toLowerCase().includes('3d')
    });
  }

  const userClasses = "bg-blue-600 text-white rounded-xl max-w-[90%] px-4 py-2 shadow-md break-words";
  const assistantLight = "bg-gradient-to-r from-gray-50 to-white border border-gray-100 text-gray-900 rounded-xl max-w-[95%] px-4 py-2 shadow-sm break-words";
  const assistantDark = "bg-gray-700 text-gray-100 rounded-xl max-w-[95%] px-4 py-2 shadow-sm border border-gray-700 break-words";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-3`}>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0 w-full`}>
        <div className={`${isUser ? userClasses : darkMode ? assistantDark : assistantLight}`}>
          <div className="text-sm whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {m.text}
            </ReactMarkdown>
          </div>
          
          {/* 3D Visualization Integration */}
          {shouldShow3D && (
            <Chat3DVisualizer 
              visualType={m.visualType || 'globe'}
              data={m.visualData || {}}
              darkMode={darkMode}
              title={m.visualTitle || "Real-time 3D Analysis"}
              interactive={true}
            />
          )}
          
          {m.file && (
            <div className="mt-2 text-xs">
              <a href={m.file.url} target="_blank" rel="noreferrer" className="underline">
                {m.file.name}
              </a>
            </div>
          )}
        </div>
        <div className={`text-[11px] mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function ChatComposer({ onSend, darkMode, onAttachClick, textareaRef, textValue, setTextValue, uploadedFile, setUploadedFile, onTyping }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textValue && textValue.trim()) {
        onSend(textValue.trim());
        setTextValue("");
      }
    }
  }

  useEffect(() => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    ta.style.height = "auto";
    const newHeight = Math.min(ta.scrollHeight, 220);
    ta.style.height = `${newHeight}px`;
  }, [textValue, textareaRef]);

  return (
    <div
      className={`p-3 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
      style={{ boxShadow: darkMode ? "0 -2px 8px rgba(0,0,0,0.6)" : "0 -2px 8px rgba(0,0,0,0.04)" }}
    >
      {uploadedFile && (
        <div className={`mb-3 p-3 rounded-md border ${darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-gray-50 border-gray-100 text-gray-900"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{uploadedFile.name}</div>
              <div className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-md border" onClick={() => setUploadedFile(null)} aria-label="Remove file">
                x
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 min-w-0">
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={(e) => { setTextValue(e.target.value); onTyping && onTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder="Ask X-ULTRA anything..."
          className={`flex-1 min-w-0 resize-none rounded-lg px-4 py-3 border hide-scrollbar ${
            darkMode ? "border-gray-700 bg-gray-900 text-gray-100" : "border-gray-200 bg-gray-50 text-gray-900"
          } outline-none focus:ring-2 focus:ring-indigo-200`}
          rows={1}
          aria-label="Chat input"
          style={{ maxHeight: 220 }}
        />

        <div className="flex flex-col items-end">
          <button
            onClick={() => {
                if (textValue && textValue.trim()) {
                  onSend(textValue.trim());
                  setTextValue("");
                }
              }}
            aria-label="Send"
            className={`p-2 rounded-md ${textValue.trim() ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
            style={{ width: 36, height: 36 }}
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={onAttachClick}
          aria-label="Attach file"
          className={`flex items-center gap-2 px-3 py-2 rounded-md border ${darkMode ? "border-gray-700 text-gray-100 bg-gray-800" : "border-gray-200 text-gray-800 bg-white"}`}
        >
          <FaPaperclip /> <span className="text-sm">Upload Document</span>
        </button>
        
        <button
          onClick={() => {
            const quickPrompts = [
              "Show me a 3D visualization of our organizational health",
              "Display a 3D matrix of system performance", 
              "Create a 3D pyramid view of our performance hierarchy"
            ];
            const randomPrompt = quickPrompts[Math.floor(Math.random() * quickPrompts.length)];
            setTextValue(randomPrompt);
          }}
          aria-label="3D Visualization"
          className={`flex items-center gap-2 px-3 py-2 rounded-md border ${darkMode ? "border-blue-600 text-blue-400 bg-blue-900/20" : "border-blue-300 text-blue-600 bg-blue-50"}`}
        >
          <FaCube /> <span className="text-sm">3D Visual</span>
        </button>
        
        <button
          onClick={() => {
            setTextValue("Provide a comprehensive organizational health analysis with visual charts");
          }}
          aria-label="Quick Analysis"
          className={`flex items-center gap-2 px-3 py-2 rounded-md border ${darkMode ? "border-green-600 text-green-400 bg-green-900/20" : "border-green-300 text-green-600 bg-green-50"}`}
        >
          <FaChartLine /> <span className="text-sm">Analysis</span>
        </button>
        
        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          PDF, DOCX • 3D Visualizations • Real-time Analytics
        </div>
      </div>
    </div>
  );
}

export default function CEOChat() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();
  const intelligence = useIntelligence();
  const navigate = useNavigate();

  // Debug environment variables on component mount
  useEffect(() => {
    console.log('🔍 ENVIRONMENT DEBUG:');
    console.log('- process.env REACT_APP keys:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));
    console.log('- API Key from env:', process.env.REACT_APP_OPENROUTER_KEY ? 'Present' : 'Missing');
    console.log('- API Key length:', process.env.REACT_APP_OPENROUTER_KEY ? process.env.REACT_APP_OPENROUTER_KEY.length : 0);
    console.log('- All REACT_APP vars:', Object.keys(process.env).filter(k => k.startsWith('REACT_APP')).map(k => ({ [k]: process.env[k] ? 'SET' : 'UNSET' })));
    
    // Add a test button to the window for manual testing
    window.testAPI = async () => {
      const apiKey = process.env.REACT_APP_OPENROUTER_KEY;
      console.log('🧪 MANUAL API TEST:');
      console.log('- API Key available:', !!apiKey);
      console.log('- API Key value (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
      
      if (!apiKey) {
        console.log('❌ No API key found - check .env file');
        return;
      }
      
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CEO Assessment Chat'
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Test message' }],
            max_tokens: 100
          })
        });
        
        console.log('📡 API Response status:', response.status);
        const data = await response.json();
        console.log('📡 API Response data:', data);
      } catch (error) {
        console.log('❌ API Test Error:', error);
      }
    };
    
    console.log('💡 Run window.testAPI() in console to test API connection manually');
  }, []);

  // State declarations first
  const [selectedConversationId, setSelectedConversationId] = useState("c1");

  const [messages, setMessages] = useState([
    { id: "m0", role: "system", text: "Hello! I'm X-ULTRA, your premium Executive Intelligence Analyst. How can I assist you with strategic insights today?", timestamp: new Date().toISOString() },
  ]);

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_conversations_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load conversations from localStorage:', error);
    }
    
    // Default conversations if nothing in localStorage
    return [
      { 
        id: "c1", 
        title: "Executive Summary Chat", 
        lastMessage: "Show me a 3D visualization of our organizational health with predictive analytics for Q4 planning",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: "executive",
        hasVisualization: true,
        messageCount: 12,
        lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      { 
        id: "c2", 
        title: "Financial Health Review", 
        lastMessage: "Create a 3D matrix analysis of revenue streams and cost optimization opportunities",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: "financial",
        hasVisualization: true,
        messageCount: 8,
        lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: "c3",
        title: "System Performance Deep Dive",
        lastMessage: "Generate performance pyramid showing critical system interdependencies",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: "analytics",
        hasVisualization: true,
        messageCount: 15,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "c4",
        title: "Strategic Planning Session",
        lastMessage: "What are the key organizational health metrics for board presentation?",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: "strategic",
        hasVisualization: false,
        messageCount: 5,
        lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ];
  });

  // Update conversation activity and metadata dynamically
  useEffect(() => {
    const updateConversation = () => {
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === selectedConversationId) {
            const lastMessage = messages[messages.length - 1];
            const hasVisualization = messages.some(msg => msg.visualization3D);
            
            return {
              ...conv,
              lastActivity: new Date().toISOString(),
              messageCount: messages.length,
              lastMessage: lastMessage?.role === 'user' ? lastMessage.text : conv.lastMessage,
              hasVisualization: hasVisualization || conv.hasVisualization
            };
          }
          return conv;
        })
      );
    };

    // Update conversation when messages are sent
    if (messages.length > 1) { // More than just the welcome message
      updateConversation();
    }
  }, [messages, selectedConversationId]);

  // Sync conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('conseqx_conversations_v1', JSON.stringify(conversations));
    } catch (error) {
      console.warn('Failed to save conversations to localStorage:', error);
    }
  }, [conversations]);

  // Load messages when conversation changes
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(`conseqx_messages_${selectedConversationId}_v1`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Default welcome message for new conversations
        setMessages([
          { id: `m0-${selectedConversationId}`, role: "system", text: "Hello! I'm X-ULTRA, your premium Executive Intelligence Analyst. How can I assist you with strategic insights today?", timestamp: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.warn('Failed to load messages for conversation:', error);
      setMessages([
        { id: `m0-${selectedConversationId}`, role: "system", text: "Hello! I'm X-ULTRA, your premium Executive Intelligence Analyst. How can I assist you with strategic insights today?", timestamp: new Date().toISOString() }
      ]);
    }
  }, [selectedConversationId]);

  // Save messages whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`conseqx_messages_${selectedConversationId}_v1`, JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save messages to localStorage:', error);
    }
  }, [messages, selectedConversationId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  // Strategic Analysis Archive State
  const [analysisArchive, setAnalysisArchive] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_analysis_archive_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load analysis archive:', error);
      return [];
    }
  });

  const [selectedFilter, setSelectedFilter] = useState('All');

  // Intelligence Analysis Functions
  const analyzeMessageForInsights = (message, messageId) => {
    if (!message || message.role !== 'assistant') return null;

    const text = message.text.toLowerCase();
    const timestamp = new Date().toISOString();
    
    // Financial Analysis Detection
    if (text.includes('revenue') || text.includes('financial') || text.includes('cost') || text.includes('profit') || text.includes('budget') || text.includes('roi')) {
      return {
        id: `analysis_${messageId}_${Date.now()}`,
        title: 'Financial Performance Analysis',
        category: 'Financial',
        type: 'critical',
        summary: extractFinancialInsights(message.text),
        content: message.text,
        timestamp: timestamp,
        messageId: messageId,
        downloadable: true,
        priority: determinePriority(text)
      };
    }
    
    // Strategic Analysis Detection  
    if (text.includes('strategic') || text.includes('planning') || text.includes('roadmap') || text.includes('objectives') || text.includes('goals')) {
      return {
        id: `analysis_${messageId}_${Date.now()}`,
        title: 'Strategic Planning Insights',
        category: 'Strategic',
        type: 'strategic',
        summary: extractStrategicInsights(message.text),
        content: message.text,
        timestamp: timestamp,
        messageId: messageId,
        downloadable: true,
        priority: determinePriority(text)
      };
    }

    // 3D/Visualization Analysis Detection
    if (text.includes('3d') || text.includes('visualization') || text.includes('interactive') || message.visualization3D) {
      return {
        id: `analysis_${messageId}_${Date.now()}`,
        title: '3D Interactive Analysis',
        category: '3D Reports',
        type: 'interactive',
        summary: '3D visualization with interactive data exploration capabilities',
        content: message.text,
        timestamp: timestamp,
        messageId: messageId,
        downloadable: true,
        priority: 'High',
        isInteractive: true
      };
    }

    // Operational Analysis Detection
    if (text.includes('operational') || text.includes('efficiency') || text.includes('process') || text.includes('performance') || text.includes('optimization')) {
      return {
        id: `analysis_${messageId}_${Date.now()}`,
        title: 'Operational Excellence Analysis',
        category: 'Operational', 
        type: 'operational',
        summary: extractOperationalInsights(message.text),
        content: message.text,
        timestamp: timestamp,
        messageId: messageId,
        downloadable: true,
        priority: determinePriority(text)
      };
    }

    // Risk Analysis Detection
    if (text.includes('risk') || text.includes('compliance') || text.includes('security') || text.includes('threat') || text.includes('vulnerability')) {
      return {
        id: `analysis_${messageId}_${Date.now()}`,
        title: 'Risk Assessment Analysis',
        category: 'Risk',
        type: 'risk',
        summary: extractRiskInsights(message.text),
        content: message.text,
        timestamp: timestamp,
        messageId: messageId,
        downloadable: true,
        priority: 'High Priority'
      };
    }

    // General Executive Analysis (fallback for important insights)
    if (text.length > 200 && (text.includes('analysis') || text.includes('insights') || text.includes('recommendations'))) {
      return {
        id: `analysis_${messageId}_${Date.now()}`,
        title: 'X-ULTRA Executive Intelligence Brief',
        category: 'Strategic',
        type: 'executive',
        summary: extractGeneralInsights(message.text),
        content: message.text,
        timestamp: timestamp,
        messageId: messageId,
        downloadable: true,
        priority: 'Medium'
      };
    }

    return null;
  };

  // Insight Extraction Functions
  const extractFinancialInsights = (text) => {
    const insights = [];
    if (text.toLowerCase().includes('revenue')) insights.push('Revenue analysis');
    if (text.toLowerCase().includes('cost')) insights.push('Cost optimization');
    if (text.toLowerCase().includes('profit')) insights.push('Profitability metrics');
    if (text.toLowerCase().includes('roi')) insights.push('ROI calculations');
    return insights.length > 0 ? insights.join(', ') + ' identified' : 'Financial performance metrics and recommendations';
  };

  const extractStrategicInsights = (text) => {
    const insights = [];
    if (text.toLowerCase().includes('planning')) insights.push('Strategic planning');
    if (text.toLowerCase().includes('roadmap')) insights.push('Roadmap development');
    if (text.toLowerCase().includes('objectives')) insights.push('Objective alignment');
    return insights.length > 0 ? insights.join(', ') + ' covered' : 'Strategic direction and planning recommendations';
  };

  const extractOperationalInsights = (text) => {
    const insights = [];
    if (text.toLowerCase().includes('efficiency')) insights.push('Efficiency improvements');
    if (text.toLowerCase().includes('process')) insights.push('Process optimization');
    if (text.toLowerCase().includes('performance')) insights.push('Performance metrics');
    return insights.length > 0 ? insights.join(', ') + ' analyzed' : 'Operational excellence recommendations';
  };

  const extractRiskInsights = (text) => {
    const insights = [];
    if (text.toLowerCase().includes('security')) insights.push('Security assessment');
    if (text.toLowerCase().includes('compliance')) insights.push('Compliance review');
    if (text.toLowerCase().includes('risk')) insights.push('Risk evaluation');
    return insights.length > 0 ? insights.join(', ') + ' completed' : 'Risk assessment and mitigation strategies';
  };

  const extractGeneralInsights = (text) => {
    return text.substring(0, 120) + (text.length > 120 ? '...' : '');
  };

  const determinePriority = (text) => {
    if (text.includes('critical') || text.includes('urgent') || text.includes('immediate')) return 'Critical';
    if (text.includes('important') || text.includes('significant') || text.includes('priority')) return 'High Priority';
    return 'Medium';
  };

  // Save analysis to archive
  const saveAnalysisToArchive = (analysisData) => {
    if (!analysisData) return;
    
    setAnalysisArchive(prev => {
      const updated = [analysisData, ...prev].slice(0, 50); // Keep latest 50 analyses
      
      // Save to localStorage
      try {
        localStorage.setItem('conseqx_analysis_archive_v1', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save analysis archive:', error);
      }
      
      return updated;
    });
  };

  // Filter archive by category
  const filteredArchive = useMemo(() => {
    if (selectedFilter === 'All') return analysisArchive;
    return analysisArchive.filter(item => item.category === selectedFilter);
  }, [analysisArchive, selectedFilter]);

  // Helper function to extract related metrics based on analysis category
  const extractRelatedMetrics = (category) => {
    const metricMap = {
      'Financial': ['financialHealth'],
      'Strategic': ['strategicAlignment'],
      'Operational': ['operationalEfficiency'], 
      'Risk': ['riskLevel'],
      '3D Reports': ['overallHealth']
    };
    return metricMap[category] || [];
  };

  // Update shared metrics based on analysis insights
  const updateSharedMetricsFromAnalysis = (analysisInsight) => {
    const { category, priority, content } = analysisInsight;
    
    // Simulate metric improvements based on analysis
    if (category === 'Financial') {
      const improvement = priority === 'Critical' ? -2 : priority === 'High Priority' ? 1 : 0.5;
      intelligence.updateMetricFromChat('financialHealth', {
        score: Math.min(100, intelligence.sharedMetrics.financialHealth.score + improvement),
        trend: improvement > 0 ? `+${improvement}%` : `${improvement}%`
      });
    } else if (category === 'Strategic') {
      const improvement = priority === 'Critical' ? -1 : priority === 'High Priority' ? 1.5 : 1;
      intelligence.updateMetricFromChat('strategicAlignment', {
        score: Math.min(100, intelligence.sharedMetrics.strategicAlignment.score + improvement),
        trend: improvement > 0 ? `+${improvement}%` : `${improvement}%`
      });
    } else if (category === 'Operational') {
      const improvement = priority === 'Critical' ? -1.5 : priority === 'High Priority' ? 1 : 0.8;
      intelligence.updateMetricFromChat('operationalEfficiency', {
        score: Math.min(100, intelligence.sharedMetrics.operationalEfficiency.score + improvement),
        trend: improvement > 0 ? `+${improvement}%` : `${improvement}%`
      });
    } else if (category === 'Risk') {
      const riskChange = priority === 'Critical' ? 5 : priority === 'High Priority' ? -2 : -1;
      const currentScore = intelligence.sharedMetrics.riskLevel.score;
      const newScore = Math.max(0, Math.min(100, currentScore + riskChange));
      intelligence.updateMetricFromChat('riskLevel', {
        score: newScore,
        level: newScore < 30 ? 'Low' : newScore < 60 ? 'Medium' : 'High',
        trend: riskChange > 0 ? `+${riskChange}%` : `${riskChange}%`
      });
    }
  };

  // Download analysis report
  const downloadAnalysis = (analysisItem) => {
    const reportContent = `
X-ULTRA EXECUTIVE INTELLIGENCE REPORT
=====================================

Title: ${analysisItem.title}
Category: ${analysisItem.category}
Priority: ${analysisItem.priority}
Generated: ${new Date(analysisItem.timestamp).toLocaleString()}

EXECUTIVE SUMMARY
----------------
${analysisItem.summary}

DETAILED INTELLIGENCE ANALYSIS
-----------------------------
${analysisItem.content}

---
Powered by X-ULTRA Executive Intelligence
ConseQ-X CEO Assessment Platform
Report ID: ${analysisItem.id}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysisItem.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // debounce typing indicator
  const typingTimerRef = useRef(null);
  const handleUserTyping = () => {
    setUserTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setUserTyping(false), 1200);
  };

  const fileInputRef = useRef(null);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const [textValue, setTextValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Pull most recent assessments for org from local storage to power explainability.
  // We respect the existing key and shape used by Assessments page.
  const orgId = auth?.org?.id || "anon";
  const [assessments, setAssessments] = useState(() => {
    try {
      const raw = localStorage.getItem("conseqx_assessments_v1");
      const all = raw ? JSON.parse(raw) : {};
      return all[orgId] || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    function refresh() {
      try {
        const raw = localStorage.getItem("conseqx_assessments_v1");
        const all = raw ? JSON.parse(raw) : {};
        setAssessments(all[orgId] || []);
        
        // Trigger re-render for 3D data preparation
        const event = new CustomEvent('assessmentDataUpdated', {
          detail: { assessments: all[orgId] || [], orgId }
        });
        window.dispatchEvent(event);
      } catch {}
    }
    
    const onStorage = (e) => {
      if (e.key === "conseqx_assessments_v1" || e.key === null) refresh();
    };
    
    window.addEventListener("storage", onStorage);
    
    // Listen for uploads and data management updates
    const onUploadsChange = (e) => {
      if (e.key === "conseqx_uploads_v1" || e.key === null) refresh();
    };
    window.addEventListener("storage", onUploadsChange);
    
    let bc;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("conseqx_assessments");
        bc.addEventListener("message", (ev) => {
          if (ev?.data?.type === "assessments:update" && ev?.data?.orgId === orgId) refresh();
        });
      }
    } catch {}
    
    const poll = setInterval(refresh, 3000);
    
    // Initial load
    refresh();
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("storage", onUploadsChange);
      clearInterval(poll);
      if (bc) try { bc.close(); } catch {}
    };
  }, [orgId]);

  const latestBySystem = useMemo(() => {
    const map = {};
    assessments.forEach((r) => {
      if (!r.systemId) return;
      const k = normalizeSystemKey(r.systemId);
      const cur = map[k];
      if (!cur || (cur.timestamp || 0) < (r.timestamp || 0)) map[k] = { ...r, systemId: k };
    });
    return map;
  }, [assessments]);

  const titleByKey = useMemo(() => {
    const m = {};
    CANONICAL_SYSTEMS.forEach((s) => (m[s.key] = s.title));
    return m;
  }, []);

  // helper to detect 3D visualization requests
  const needs3DVisualization = (t) => {
    if (!t) return false;
    const pattern = /\b(3d|visual|chart|graph|show|display|analyze|analysis|organizational health|system overview|dashboard|matrix|globe|pyramid)\b/i;
    return pattern.test(t);
  };

  // prepare 3D visualization data from current assessments and uploads
  const prepare3DData = () => {
    // Combine data from assessments and uploads
    const systemsData = {};
    
    // First, get data from assessments
    Object.keys(latestBySystem).forEach(key => {
      const system = latestBySystem[key];
      const canonicalSystem = titleByKey[key] || key;
      systemsData[key] = {
        name: canonicalSystem,
        score: system?.score || 0,
        trend: system?.score > 70 ? 'up' : system?.score < 40 ? 'down' : 'stable',
        systemId: key,
        source: 'assessment',
        timestamp: system?.timestamp || new Date().toISOString()
      };
    });
    
    // Then, supplement with upload data if available
    try {
      const uploadsRaw = localStorage.getItem('conseqx_uploads_v1');
      const uploads = uploadsRaw ? JSON.parse(uploadsRaw) : [];
      
      if (uploads.length > 0) {
        const latest = uploads[0];
        CANONICAL_SYSTEMS.forEach(sys => {
          if (!systemsData[sys.key]) {
            const hasSystemData = Array.isArray(latest.analyzedSystems) && 
                                latest.analyzedSystems.includes(sys.key);
            systemsData[sys.key] = {
              name: sys.title,
              score: hasSystemData ? Math.floor(60 + Math.random() * 30) : Math.floor(30 + Math.random() * 40),
              trend: hasSystemData ? 'up' : 'stable',
              systemId: sys.key,
              source: hasSystemData ? 'upload' : 'estimated',
              timestamp: latest.timestamp || new Date().toISOString()
            };
          }
        });
      }
    } catch (error) {
      console.warn('Error loading upload data for 3D visualization:', error);
    }
    
    // Convert to array and ensure we have all canonical systems
    const systems = CANONICAL_SYSTEMS.map(sys => {
      return systemsData[sys.key] || {
        name: sys.title,
        score: Math.floor(40 + Math.random() * 30),
        trend: 'stable',
        systemId: sys.key,
        source: 'default',
        timestamp: new Date().toISOString()
      };
    });

    const overall_health = systems.length > 0 
      ? Math.round(systems.reduce((sum, s) => sum + s.score, 0) / systems.length)
      : 0;

    return {
      systems,
      overall_health,
      timestamp: new Date().toISOString(),
      total_systems: systems.length,
      critical_systems: systems.filter(s => s.score < 40).length,
      excellent_systems: systems.filter(s => s.score > 80).length,
      improving_systems: systems.filter(s => s.trend === 'up').length,
      data_sources: {
        assessments: systems.filter(s => s.source === 'assessment').length,
        uploads: systems.filter(s => s.source === 'upload').length,
        estimated: systems.filter(s => s.source === 'estimated').length,
        default: systems.filter(s => s.source === 'default').length
      }
    };
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight + 200;
    }
  }, [messages, isGenerating]);

  function simulateAssistantReply(prompt) {
    setIsGenerating(true);
    
    // Enhanced intelligent response generation
    const lowerPrompt = prompt.toLowerCase();
    const systems = Object.keys(latestBySystem);
    const data3D = prepare3DData();
    
    let lines = [];
    
    // Greeting and context awareness
    const greetings = [
      "I'm here to help with your organizational health analysis! 🚀",
      "Let me analyze your current organizational performance...",
      "Great question! Here's what I can see from your recent data:",
      "Based on your organizational health metrics, here's my analysis:"
    ];
    lines.push(greetings[Math.floor(Math.random() * greetings.length)]);
    
    // Check for specific query types and respond intelligently
    if (lowerPrompt.includes('score') || lowerPrompt.includes('performance') || lowerPrompt.includes('health')) {
      lines.push(`\n📊 **Overall Organizational Health: ${data3D.overall_health}%**`);
      lines.push(`• Total Systems Analyzed: ${data3D.total_systems}`);
      lines.push(`• Critical Systems Needing Attention: ${data3D.critical_systems}`);
      lines.push(`• Systems Performing Excellently: ${data3D.excellent_systems}`);
      lines.push(`• Systems Currently Improving: ${data3D.improving_systems}`);
    }
    
    if (lowerPrompt.includes('system') || lowerPrompt.includes('department')) {
      lines.push("\n🏢 **Key System Performance:**");
      data3D.systems.slice(0, 5).forEach(sys => {
        const statusIcon = sys.score > 80 ? '✅' : sys.score > 60 ? '⚠️' : '🚨';
        const trendIcon = sys.trend === 'up' ? '📈' : sys.trend === 'down' ? '📉' : '➡️';
        lines.push(`${statusIcon} **${sys.name}**: ${sys.score}% ${trendIcon}`);
      });
    }
    
    if (lowerPrompt.includes('recommendation') || lowerPrompt.includes('action') || lowerPrompt.includes('plan')) {
      lines.push("\n🎯 **Strategic Recommendations:**");
      if (data3D.critical_systems > 0) {
        lines.push(`• **Priority 1**: Address ${data3D.critical_systems} critical system(s) requiring immediate attention`);
        lines.push("• **Timeline**: 2-4 weeks for critical system stabilization");
        lines.push("• **Owner**: Department heads with C-suite oversight");
      }
      lines.push("• **Priority 2**: Leverage high-performing systems to support struggling areas");
      lines.push("• **Priority 3**: Implement continuous monitoring and predictive analytics");
      lines.push("• **KPIs**: System scores >75%, reduced critical incidents by 50%");
    }
    
    if (lowerPrompt.includes('financial') || lowerPrompt.includes('revenue') || lowerPrompt.includes('cost')) {
      lines.push("\n💰 **Financial Health Insights:**");
      lines.push("• Systems optimization can reduce operational costs by 15-25%");
      lines.push("• High-performing systems correlate with 20% higher revenue efficiency");
      lines.push("• Predictive maintenance saves an average of ₦2-5M annually");
      lines.push("• ROI improvement expected within 6-12 months of system optimization");
    }
    
    // Check if user requested 3D visualization
    const include3D = needs3DVisualization(prompt);
    
    if (include3D) {
      lines.push("\n🌐 **3D Visual Analysis**");
      lines.push("I'm generating an interactive 3D visualization of your organizational health data with:");
      lines.push("• Real-time system performance matrices");
      lines.push("• Holographic organizational health globe");
      lines.push("• Performance hierarchy pyramids");
      lines.push("• Advanced CSS 3D transforms with neural network overlays");
    }
    
    // Add contextual closing
    if (systems.length === 0) {
      lines.push("\n💡 **Next Steps**: Start by running system assessments to get personalized insights!");
    } else {
      lines.push("\n💡 **Would you like me to:**");
      lines.push("• Generate a detailed 4-week action plan?");
      lines.push("• Create executive summary reports?");
      lines.push("• Show specific system deep-dive analysis?");
      lines.push("• Provide predictive analytics and forecasting?");
    }
    
    const replyText = lines.join("\n");
    const id = `m-assistant-${Date.now()}`;
    
    // Prepare 3D visualization data if requested
    const visualData = include3D ? data3D : null;
    let visualType = 'globe';
    if (prompt && prompt.toLowerCase().includes('matrix')) visualType = 'matrix';
    if (prompt && prompt.toLowerCase().includes('pyramid')) visualType = 'pyramid';
    
    const initialMessage = { 
      id, 
      role: "assistant", 
      text: "", 
      timestamp: new Date().toISOString(),
      ...(include3D && {
        visualization3D: true,
        visualData: visualData,
        visualType: visualType,
        visualTitle: `Organizational Health ${visualType === 'matrix' ? 'Matrix' : visualType === 'pyramid' ? 'Performance Hierarchy' : 'Universe'}`
      })
    };
    
    setMessages((prev) => [...prev, initialMessage]);
    let idx = 0;
    const interval = setInterval(() => {
      idx += 30;
      const chunk = replyText.slice(0, idx);
      
      // Preserve 3D visualization properties during text animation
      const messageUpdate = {
        text: chunk,
        ...(include3D && {
          visualization3D: true,
          visualData: visualData,
          visualType: visualType,
          visualTitle: `Organizational Health ${visualType === 'matrix' ? 'Matrix' : visualType === 'pyramid' ? 'Performance Hierarchy' : 'Universe'}`
        })
      };
      
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...messageUpdate } : m)));
      if (idx >= replyText.length) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 50);
  }


  async function handleSendMessage(text) {
    const userMsg = { id: `m-user-${Date.now()}`, role: "user", text, timestamp: new Date().toISOString(), file: uploadedFile ? { ...uploadedFile } : undefined };
    setMessages((prev) => [...prev, userMsg]);
    setUploadedFile(null);

    // Show immediate assistant typing placeholder for friendliness
    const placeholderId = `m-assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: placeholderId, role: "assistant", text: "...", timestamp: new Date().toISOString() }]);
    setIsGenerating(true);

    // Build scores map from latestBySystem
    const scores = {};
    Object.keys(latestBySystem).forEach((k) => {
      scores[k] = latestBySystem[k]?.score ?? null;
    });

    // Helper to detect whether user asked about assessments/org
    const needsAssessmentContext = (t) => {
      if (!t) return false;
      const pattern = /\b(assess|assessment|score|scores|system|systems|results|report|priority|action plan|org|organization|company|revenue|metrics|kpi|kpis|how did we do|what is my score)\b/i;
      return pattern.test(t);
    };

    // Helper to detect if user is asking for assessment links
    const askingForAssessmentLink = (t) => {
      if (!t) return false;
      const linkPattern = /\b(link|url|navigate|go to|take me to|where|how do I|access|run|start)\b.*\b(assess|assessment|test|evaluation)\b/i;
      return linkPattern.test(t);
    };

    const openRouterKey = process.env.REACT_APP_OPENROUTER_KEY;
    const modelUrl = "https://openrouter.ai/api/v1/chat/completions";
    
    // Debug API connection - More detailed
    console.log('🔌 DETAILED API CONNECTION DEBUG:', {
      hasApiKey: !!openRouterKey,
      keyExists: openRouterKey !== undefined,
      keyLength: openRouterKey ? openRouterKey.length : 0,
      keyPrefix: openRouterKey ? openRouterKey.substring(0, 15) + '...' : 'No key found',
      envVarSet: process.env.REACT_APP_OPENROUTER_KEY !== undefined,
      modelUrl,
      userQuery: text,
      allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP'))
    });

    try {
      setIsGenerating(true);
      const assistantId = placeholderId;

      // Special handling for assessment link requests
      if (askingForAssessmentLink(text)) {
        const linkResponse = `🎯 **Ready to run your organizational assessment?**

Here are your assessment options:

🔗 **Quick Access Links:**
• **Systems Assessment**: Navigate to the "Assessments" tab in your dashboard
• **Department Evaluation**: Click on "Systems" → "Run Assessment"  
• **Comprehensive Analysis**: Use the main "Assessment" button in the top navigation

📋 **Assessment Process:**
1. Click on the "Assessments" tab in your left sidebar
2. Select "New Assessment" or "Run Systems Analysis"
3. Choose your organizational systems to evaluate
4. Complete the assessment questionnaire
5. Get instant results with actionable insights

💡 **Pro Tip**: After completing assessments, return here for AI-powered analysis and 3D visualizations of your results!

Would you like me to guide you through the assessment process step-by-step?`;

        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { 
          ...m, 
          text: linkResponse 
        } : m)));
        setIsGenerating(false);
        return;
      }

      // Check API key availability
      if (!openRouterKey) {
        console.error('❌ CRITICAL: No API key found!', {
          envVar: 'REACT_APP_OPENROUTER_KEY',
          currentValue: process.env.REACT_APP_OPENROUTER_KEY,
          fallbackMode: 'Forced simulation'
        });
        simulateAssistantReply(text);
        return;
      }
      
      console.log('✅ API key confirmed, proceeding with API call');

      // Determine if we need assessment context
      const hasAssessmentData = Object.keys(scores).length > 0;
      const needsAssessments = needsAssessmentContext(text) && hasAssessmentData;

      // If user requested assessment/org context and we have assessment scores, include the report  
      if (needsAssessments) {
          const userInfo = { name: auth?.user?.name || auth?.user?.email || "User", org: auth?.org?.name || "Organization" };

          // Build small docs from assessments: one summary per system plus recent notes
          const docs = Object.values(latestBySystem || {}).map(r => ({
            id: r.id || `${r.systemId}-${r.timestamp}`,
            text: `System: ${r.systemId}\nScore: ${r.score}\nNotes: ${JSON.stringify(r.meta || {})}`,
            meta: { systemId: r.systemId, score: r.score, timestamp: r.timestamp }
          }));

          const index = buildIndex(docs);
          const hits = queryIndex(index, text, 6);
          const reportChunks = hits.map(h => `- [${h.doc.meta.systemId}] score: ${h.doc.meta.score} — excerpt: ${h.doc.text.slice(0, 200)}`);
          const report = reportChunks.join('\n');

          const systemPrompt = `You are an executive AI assistant with advanced 3D visualization capabilities. Use the following assessment report to answer the user's question precisely and with actionable recommendations. Use concise bullet points and suggested owners/KPIs when relevant. Always include African/Nigerian context where possible. 

When users request visual analysis, charts, graphs, or 3D views, mention that you're providing interactive 3D visualizations including organizational health globes, system matrices, and performance pyramids. These visualizations show real-time organizational health data with advanced CSS 3D transforms and holographic effects.`;

          const chatPayload = {
            model: "mistralai/mistral-7b-instruct",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "system", content: `AssessmentReport:\n${report}` },
              { role: "user", content: text }
            ]
          };

        const res = await fetch(modelUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chatPayload)
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('🚨 API Call Failed (Assessment Context):', {
            status: res.status,
            statusText: res.statusText,
            error: errorText,
            fallbackMode: 'Enhanced Simulation'
          });
          // Use enhanced fallback instead of showing error
          simulateAssistantReply(text);
          return;
        }

        const payload = await res.json();
        const output = payload.choices?.[0]?.message?.content ?? "";
        
        console.log('✅ API Call Successful (Assessment Context):', {
          responseLength: output.length,
          model: payload.model,
          hasContent: !!output
        });

        // Check if user requested 3D visualization
        const include3D = needs3DVisualization(text);
        const visualData = include3D ? prepare3DData() : null;
        
        // Determine optimal 3D visualization type based on query
        let visualType = 'globe';
        if (text.toLowerCase().includes('matrix') || text.toLowerCase().includes('comparison')) {
          visualType = 'matrix';
        } else if (text.toLowerCase().includes('hierarchy') || text.toLowerCase().includes('performance')) {
          visualType = 'pyramid';
        }

        // Typing animation for the assistant reply with 3D visualization support
        let idx = 0;
        const total = output.length;
        const tick = setInterval(() => {
          idx = Math.min(total, idx + Math.max(20, Math.round(total / 30)));
          const chunk = output.slice(0, idx);
          
          const messageUpdate = {
            text: chunk,
            ...(include3D && idx >= total && {
              visualization3D: true,
              visualData: visualData,
              visualType: visualType,
              visualTitle: `Organizational Health ${visualType === 'matrix' ? 'Matrix' : visualType === 'pyramid' ? 'Performance Hierarchy' : 'Universe'}`
            })
          };
          
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...messageUpdate } : m)));
          if (idx >= total) {
            clearInterval(tick);
            setIsGenerating(false);
            
            // 🧠 INTELLIGENCE CAPTURE: Analyze completed message for insights
            const finalMessage = {
              id: assistantId,
              role: 'assistant',
              text: output,
              timestamp: new Date().toISOString(),
              ...(include3D && {
                visualization3D: true,
                visualData: visualData,
                visualType: visualType
              })
            };
            
            const analysisInsight = analyzeMessageForInsights(finalMessage, assistantId);
            if (analysisInsight) {
              console.log('📊 Intelligence Captured:', analysisInsight.title, '-', analysisInsight.category);
              saveAnalysisToArchive(analysisInsight);
              
              // 🔥 SYNC WITH INTELLIGENCE CONTEXT
              intelligence.addInsight({
                title: analysisInsight.title,
                category: analysisInsight.category,
                summary: analysisInsight.summary,
                priority: analysisInsight.priority,
                source: 'x-ultra-chat',
                relatedMetrics: extractRelatedMetrics(analysisInsight.category)
              });
              
              // Update shared metrics based on analysis
              updateSharedMetricsFromAnalysis(analysisInsight);
            }
          }
        }, 40);
        return;
      }

      // Normal conversational flow — call model with a friendly system prompt (no heavy report)
      console.log('📞 Making API call for general conversation');
      
      const contextualPrompt = intelligence.getContextualPrompt();
      const friendlySystemPrompt = `You are X-ULTRA, the premium executive intelligence AI assistant with cutting-edge 3D visualization capabilities. Always introduce yourself as "X-ULTRA" when greeting users. Be warm, professional, and concise while maintaining your elite brand identity. 
      
      CURRENT ORGANIZATIONAL CONTEXT: ${contextualPrompt}
      
      Use this real-time organizational data to provide contextual, relevant responses. When users ask about organizational health, reference the actual metrics. Answer conversational questions naturally with executive-level intelligence. When users ask about visual analysis or want to see data, offer to show them interactive 3D organizational health visualizations including rotating globes, system matrices, and performance pyramids with real-time holographic effects. 
      
      Remember: You are X-ULTRA - the pinnacle of executive AI intelligence with real-time organizational awareness.`;
      const chatPayload = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: friendlySystemPrompt },
          { role: "user", content: text }
        ]
      };

      const res2 = await fetch(modelUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatPayload)
      });

      if (!res2.ok) {
        const errorText = await res2.text();
        console.error('🚨 API Call Failed (Conversational):', {
          status: res2.status,
          statusText: res2.statusText,
          error: errorText,
          fallbackMode: 'Enhanced Simulation'
        });
        // Use enhanced fallback instead of showing error
        simulateAssistantReply(text);
        return;
      }

      const payload2 = await res2.json();
      const output2 = payload2.choices?.[0]?.message?.content ?? "";
      
      console.log('✅ API Call Successful (Conversational):', {
        responseLength: output2.length,
        model: payload2.model,
        hasContent: !!output2
      });

      let idx2 = 0;
      const total2 = output2.length;
      const tick2 = setInterval(() => {
        idx2 = Math.min(total2, idx2 + Math.max(20, Math.round(total2 / 30)));
        const chunk = output2.slice(0, idx2);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: chunk } : m)));
        if (idx2 >= total2) {
          clearInterval(tick2);
          setIsGenerating(false);
          
          // 🧠 INTELLIGENCE CAPTURE: Analyze completed conversational message
          const finalMessage = {
            id: assistantId,
            role: 'assistant',
            text: output2,
            timestamp: new Date().toISOString()
          };
          
          const analysisInsight = analyzeMessageForInsights(finalMessage, assistantId);
          if (analysisInsight) {
            console.log('📊 Intelligence Captured:', analysisInsight.title, '-', analysisInsight.category);
            saveAnalysisToArchive(analysisInsight);
            
            // 🔥 SYNC WITH INTELLIGENCE CONTEXT  
            intelligence.addInsight({
              title: analysisInsight.title,
              category: analysisInsight.category,
              summary: analysisInsight.summary,
              priority: analysisInsight.priority,
              source: 'x-ultra-chat',
              relatedMetrics: extractRelatedMetrics(analysisInsight.category)
            });
            
            // Update shared metrics based on analysis
            updateSharedMetricsFromAnalysis(analysisInsight);
          }
        }
      }, 40);

    } catch (err) {
      console.error('🔥 API Connection Error:', {
        error: err.message,
        stack: err.stack,
        apiKey: openRouterKey ? 'Present' : 'Missing',
        fallbackMode: 'Enhanced Simulation'
      });
      simulateAssistantReply(text);
    }
  }

  function handleUploadFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, size: file.size, url });
  }

  // Handler for creating new conversation
  const handleNewConversation = () => {
    const newId = `c${Date.now()}`;
    const newConversation = {
      id: newId,
      title: "New Conversation",
      timestamp: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 1,
      hasVisualization: false
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversationId(newId);
    // Messages will be set by the useEffect hook when selectedConversationId changes
  };

  // Handler for quick 3D analysis
  const handleQuick3DAnalysis = () => {
    const analysisPrompts = [
      "Show me a comprehensive 3D visualization of our organizational health with real-time metrics",
      "Create a 3D matrix analysis of all system performance indicators", 
      "Display a 3D pyramid hierarchy showing our performance landscape",
      "Generate an interactive 3D globe view of our organizational universe"
    ];
    const randomPrompt = analysisPrompts[Math.floor(Math.random() * analysisPrompts.length)];
    setTextValue(randomPrompt);
    
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage(randomPrompt);
      setTextValue("");
    }, 100);
  };

  // Handler for quick reports
  const handleQuickReport = () => {
    const reportPrompts = [
      "Generate a comprehensive organizational health report with actionable insights",
      "Create an executive dashboard summary with key performance metrics", 
      "Provide a detailed analysis of our systems performance with recommendations",
      "Show me trending analytics and improvement opportunities across all systems"
    ];
    const randomPrompt = reportPrompts[Math.floor(Math.random() * reportPrompts.length)];
    setTextValue(randomPrompt);
    
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage(randomPrompt);
      setTextValue("");
    }, 100);
  };

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`md:col-span-1 rounded-2xl h-[62vh] overflow-hidden ${
            darkMode ? "border border-gray-700/50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "border border-gray-200/50 bg-gradient-to-br from-white via-gray-50 to-white"
          } backdrop-blur-xl shadow-2xl`}
        >
          {/* Strategic Analysis Archive Header */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                } shadow-lg`}>
                  <FaFileAlt className="text-white text-lg" />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Strategic Analysis Archive
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Generated insights & downloadable reports
                  </p>
                </div>
              </div>
              
              {/* Archive Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto-Saving</span>
              </div>
            </div>

          </div>

          {/* Strategic Analysis Archive Content */}
          <div className="h-full overflow-auto hide-scrollbar">
            {/* Interactive Filter Bar */}
            <div className="px-4 py-2 border-b border-gray-200/20">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth">
                {['All', 'Financial', 'Operational', 'Strategic', 'Risk', '3D Reports'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedFilter === filter
                        ? darkMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md'
                        : darkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-gray-200/50 text-gray-600 hover:bg-gray-300/50'
                    } hover:scale-105`}
                  >
                    {filter}
                    {/* Show count for each filter */}
                    {filter !== 'All' && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                        selectedFilter === filter 
                          ? 'bg-white/20' 
                          : darkMode ? 'bg-gray-600/50' : 'bg-gray-300/50'
                      }`}>
                        {analysisArchive.filter(item => item.category === filter).length}
                      </span>
                    )}
                    {filter === 'All' && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                        selectedFilter === filter 
                          ? 'bg-white/20' 
                          : darkMode ? 'bg-gray-600/50' : 'bg-gray-300/50'
                      }`}>
                        {analysisArchive.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Latest Analysis Highlight */}
            {analysisArchive.length > 0 && (
              <div className={`mx-4 mt-4 mb-3 p-3 rounded-lg border-l-4 border-emerald-500 ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                  <FaFileAlt className="w-full h-full text-emerald-500" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <h4 className={`font-semibold text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Latest Analysis</h4>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {new Date(analysisArchive[0].timestamp).toLocaleString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <p className={`text-xs ${darkMode ? 'text-emerald-200' : 'text-emerald-600'} mb-2 font-medium`}>
                  {analysisArchive[0].title}
                </p>
                <p className={`text-xs ${darkMode ? 'text-emerald-200/80' : 'text-emerald-600/80'} mb-2`}>
                  {analysisArchive[0].summary}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => console.log('Viewing analysis:', analysisArchive[0])}
                    className={`px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} transition-all duration-200 font-medium`}
                  >
                    View Report
                  </button>
                  <button 
                    onClick={() => downloadAnalysis(analysisArchive[0])}
                    className={`px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'} transition-all duration-200`}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Smart Recommendations Based on Metrics */}
            {intelligence.sharedMetrics && (
              <div className="mx-4 mb-4">
                {intelligence.generateRecommendations().slice(0, 2).map((rec, idx) => (
                  <div key={idx} className={`mb-3 p-3 rounded-lg border-l-4 ${
                    rec.priority === 'high' 
                      ? 'border-red-500 bg-red-900/10' 
                      : 'border-yellow-500 bg-yellow-900/10'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rec.title}
                      </h5>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        rec.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                      {rec.description}
                    </p>
                    <button
                      onClick={() => handleSendMessage(`X-ULTRA, provide detailed analysis and action plan for ${rec.title.toLowerCase()}: ${rec.description}`)}
                      className={`px-3 py-1 text-xs rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors`}
                    >
                      Get Action Plan
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State for New Users */}
            {analysisArchive.length === 0 && (
              <div className={`mx-4 mt-4 mb-3 p-4 rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50/30'} text-center`}>
                <FaFileAlt className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>No Analysis Yet</h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Start a conversation with X-ULTRA to build your Strategic Intelligence Archive
                </p>
                <button
                  onClick={() => handleSendMessage("X-ULTRA, provide an executive overview of our current organizational health and key areas requiring immediate attention")}
                  className={`mt-3 px-4 py-2 text-xs rounded ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} transition-colors`}
                >
                  Start Intelligence Analysis
                </button>
              </div>
            )}

            {/* Analysis Archive */}
            {analysisArchive.length > 0 && (
              <div className="mx-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analysis Archive</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {filteredArchive.length} {selectedFilter === 'All' ? 'reports' : selectedFilter.toLowerCase()}
                    </span>
                    <button 
                      onClick={() => {
                        // Download all analyses as a combined report
                        const combinedReport = filteredArchive.map(item => 
                          `${item.title}\n${'='.repeat(item.title.length)}\n${item.content}\n\n`
                        ).join('');
                        
                        const blob = new Blob([combinedReport], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Strategic_Analysis_Archive_${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <FaDownload className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </div>
              
                {/* Dynamic Analysis Cards */}
                <div className="space-y-3">
                  {filteredArchive.length > 0 ? (
                    filteredArchive.slice(0, 6).map((analysis) => {
                      // Dynamic icon and color based on category
                      const getCategoryIcon = (category) => {
                        switch(category) {
                          case 'Financial': return { icon: FaChartLine, color: 'amber' };
                          case 'Strategic': return { icon: FaBullseye, color: 'blue' };
                          case 'Operational': return { icon: FaCube, color: 'purple' };
                          case 'Risk': return { icon: FaShieldAlt, color: 'red' };
                          case '3D Reports': return { icon: FaCube, color: 'purple' };
                          default: return { icon: FaFileAlt, color: 'gray' };
                        }
                      };

                      const { icon: IconComponent, color } = getCategoryIcon(analysis.category);
                      
                      return (
                        <div key={analysis.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white/50 border-gray-200/50'} hover:shadow-lg transition-all duration-200 group cursor-pointer backdrop-blur-sm`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? `bg-${color}-600/20 border border-${color}-600/30` : `bg-${color}-100 border border-${color}-200`} ${analysis.isInteractive ? 'relative' : ''}`}>
                                <IconComponent className={`w-4 h-4 ${darkMode ? `text-${color}-400` : `text-${color}-600`}`} />
                                {analysis.isInteractive && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <div>
                                <h5 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{analysis.title}</h5>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{analysis.summary}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                analysis.priority === 'Critical' 
                                  ? darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                                  : analysis.priority === 'High Priority' || analysis.priority === 'High'
                                  ? darkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
                                  : darkMode ? `bg-${color}-900/50 text-${color}-300` : `bg-${color}-100 text-${color}-700`
                              }`}>
                                {analysis.isInteractive ? '3D Interactive' : analysis.priority}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(analysis.timestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })} • X-ULTRA Insight
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button 
                                onClick={() => console.log('Viewing analysis:', analysis)}
                                className={`px-2 py-1 text-xs rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors font-medium`}
                              >
                                {analysis.isInteractive ? 'Launch 3D' : 'View'}
                              </button>
                              <button 
                                onClick={() => downloadAnalysis(analysis)}
                                className={`px-2 py-1 text-xs rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-colors`}
                              >
                                {analysis.category === 'Strategic' ? 'Board Copy' : 'Download'}
                              </button>
                              {analysis.priority === 'Critical' && (
                                <button 
                                  onClick={() => console.log('Urgent action for:', analysis)}
                                  className={`px-2 py-1 text-xs rounded-md ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} transition-colors`}
                                >
                                  Urgent
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={`p-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                      <FaFileAlt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium mb-1">No Analysis Available</p>
                      <p className="text-xs">Generate some intelligence reports to populate your archive</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Generate Section */}
            <div className="mx-4 mb-4">
              <h4 className={`font-semibold text-sm mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generate X-ULTRA Intelligence</h4>
              
              {/* Quick Partner Dashboard Actions */}
              <div className="mb-3 p-3 rounded-lg border border-dashed border-blue-300/50">
                <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'} flex items-center gap-1`}>
                  <FaChartPie className="w-3 h-3" />
                  Partner Dashboard Actions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/ceo/partner-dashboard/overview')}
                    className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-700/50 hover:bg-blue-600/50 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} transition-colors`}
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => handleSendMessage("X-ULTRA, analyze the current Partner Dashboard data and provide strategic recommendations based on real-time metrics")}
                    className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-green-700/50 hover:bg-green-600/50 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-700'} transition-colors`}
                  >
                    Analyze Dashboard
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleSendMessage("X-ULTRA, generate a comprehensive executive intelligence summary report with key metrics, financial analysis, operational insights, strategic recommendations, and 3D visualizations for the board presentation")}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                  } flex items-center justify-center space-x-2 hover:scale-105 shadow-lg border-2 border-transparent hover:border-white/20`}
                >
                  <FaFileAlt className="w-4 h-4" />
                  <span>X-ULTRA Intelligence Report</span>
                </button>
                
                <button
                  onClick={() => handleSendMessage("X-ULTRA, create a detailed 3D organizational health analysis with interactive visualizations, performance metrics, predictive insights, and strategic planning recommendations")}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    darkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                  } flex items-center justify-center space-x-2 hover:scale-105 shadow-lg border-2 border-transparent hover:border-white/20`}
                >
                  <FaCube className="w-4 h-4" />
                  <span>X-ULTRA 3D Analysis</span>
                </button>
              </div>
            </div>

            {/* Partner Dashboard Integration Widget */}
            <div className={`mx-4 mb-4 p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30' : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/30'} backdrop-blur-sm`}>
              <h4 className={`text-xs font-semibold mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-700'} uppercase tracking-wide flex items-center gap-2`}>
                <FaChartLine className="w-3 h-3" />
                Live Dashboard Metrics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className={`text-lg font-bold mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {intelligence.sharedMetrics.financialHealth.score}%
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                    Financial Health
                  </div>
                  <div className={`text-xs ${intelligence.sharedMetrics.financialHealth.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {intelligence.sharedMetrics.financialHealth.trend}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {intelligence.sharedMetrics.strategicAlignment.score}%
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                    Strategic Alignment
                  </div>
                  <div className={`text-xs ${intelligence.sharedMetrics.strategicAlignment.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {intelligence.sharedMetrics.strategicAlignment.trend}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700/30">
                <div className="flex items-center justify-between text-xs">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Overall Health:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {intelligence.sharedMetrics.overallHealth.score}% ({intelligence.sharedMetrics.overallHealth.grade})
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Archive Intelligence Stats */}
            <div className={`mx-4 mb-4 p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30' : 'bg-gradient-to-r from-white/50 to-gray-50/50 border border-gray-200/30'} backdrop-blur-sm`}>
              <h4 className={`text-xs font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide`}>
                X-ULTRA Intelligence Archive
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {analysisArchive.length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                    Analysis Reports
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {analysisArchive.filter(item => item.isInteractive || item.category === '3D Reports').length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                    3D Interactive
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {analysisArchive.length * 3 + 42}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                    Downloads
                  </div>
                </div>
              </div>
              {analysisArchive.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Last Analysis:</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      {new Date(analysisArchive[0]?.timestamp).toLocaleString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        <div
          className={`md:col-span-2 rounded-2xl p-0 md:p-4 h-[60vh] flex flex-col min-w-0 ${
            darkMode ? "border border-gray-700 bg-gray-900 text-gray-100" : "border border-gray-100 bg-white text-gray-900"
          }`}
        >
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: darkMode ? "rgba(255,255,255,0.04)" : "" }}>
            <div>
              <div className="font-semibold">X-ULTRA Intelligence</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}>{isGenerating ? "X-ULTRA is analyzing..." : "Ready for intelligence"}</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 hide-scrollbar" ref={messagesRef} style={{ WebkitOverflowScrolling: "touch" }}>
            {messages.map((m) => (
              <div key={m.id} className="my-3">
                {m.role === 'assistant' ? (
                  <div className={`inline-block rounded-xl px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-50 text-gray-900"}` }>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <MessageRow m={m} darkMode={darkMode} />
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="mt-2">
                <div className={`inline-block rounded-xl px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
                  <TypingIndicator darkMode={darkMode} />
                </div>
              </div>
            )}
            {userTyping && (
              <div className="mt-2 text-xs italic text-gray-400">You are typing...</div>
            )}
          </div>

          <ChatComposer
            onSend={(t) => handleSendMessage(t)}
            darkMode={darkMode}
            onAttachClick={() => fileInputRef.current && fileInputRef.current.click()}
            textareaRef={textareaRef}
            textValue={textValue}
            setTextValue={setTextValue}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            onTyping={handleUserTyping}
          />
        </div>
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFile(f);
          e.target.value = "";
        }}
      />
    </section>
  );
}
