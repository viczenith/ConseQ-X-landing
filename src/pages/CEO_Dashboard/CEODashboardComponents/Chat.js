import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaPaperPlane, FaPaperclip, FaCube, FaChartLine, FaFileAlt, FaDownload,
  FaBars, FaPlus, FaRegCopy, FaCheck, FaRedo, FaTrash, FaEllipsisH,
  FaRegEdit, FaTimes, FaSearch
} from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import { useIntelligence } from "../../../contexts/IntelligenceContext";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";
import { buildIndex, queryIndex, parseFileToChunks, loadStoredDocs, saveDocChunks } from "../../../lib/rag";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Chat3DVisualizer from './Chat3DVisualizer';


/* ─── Typing dots ─── */
function TypingDots({ darkMode }) {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`block w-2 h-2 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}
          style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

/* ─── Copy button ─── */
function CopyButton({ text, darkMode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };
  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'}`}
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? <FaCheck size={13} /> : <FaRegCopy size={13} />}
    </button>
  );
}

/* ─── Single message row (ChatGPT style) ─── */
function MessageBubble({ m, darkMode, onRegenerate, isLast, isGenerating }) {
  const isUser = m.role === "user";
  const shouldShow3D = !isUser && m.visualization3D;

  return (
    <div className={`group py-3 sm:py-5 ${isUser ? '' : ''}`}>
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 px-3 sm:px-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'}`}>
              X
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Role label */}
          <div className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {isUser ? 'You' : 'X-ULTRA'}
          </div>

          {/* Message text */}
          <div className={`prose max-w-none text-sm sm:text-[15px] leading-6 sm:leading-7 ${darkMode ? 'prose-invert text-gray-300' : 'text-gray-700'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {m.text}
            </ReactMarkdown>
          </div>

          {/* 3D Visualization */}
          {shouldShow3D && (
            <div className="mt-4">
              <Chat3DVisualizer
                visualType={m.visualType || 'globe'}
                data={m.visualData || {}}
                darkMode={darkMode}
                title={m.visualTitle || "Real-time 3D Analysis"}
                interactive={true}
              />
            </div>
          )}

          {/* File attachment */}
          {m.file && (
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
              <FaFileAlt size={14} />
              <a href={m.file.url} target="_blank" rel="noreferrer" className="hover:underline">{m.file.name}</a>
            </div>
          )}

          {/* Action buttons (visible on hover for assistant messages) */}
          {!isUser && m.text && m.text !== "..." && (
            <div className={`flex items-center gap-1 mt-2 transition-opacity ${isLast ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <CopyButton text={m.text} darkMode={darkMode} />
              {isLast && !isGenerating && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'}`}
                  title="Regenerate"
                >
                  <FaRedo size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
 *  MAIN COMPONENT
 * ═════════════════════════════════════════════════════════════ */
export default function CEOChat() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();
  const intelligence = useIntelligence();

  /* ─── Sidebar state ─── */
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarTab, setSidebarTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showConvMenu, setShowConvMenu] = useState(null);

  /* ─── Conversation state ─── */
  const [selectedConversationId, setSelectedConversationId] = useState("c1");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_conversations_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "c1", title: "New chat", lastMessage: "", timestamp: new Date().toISOString(), lastActivity: new Date().toISOString(), messageCount: 0 }
    ];
  });

  /* ─── Chat state ─── */
  const [isGenerating, setIsGenerating] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ─── Analysis archive ─── */
  const [analysisArchive, setAnalysisArchive] = useState(() => {
    try {
      const saved = localStorage.getItem('conseqx_analysis_archive_v1');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedFilter, setSelectedFilter] = useState('All');

  /* ─── Assessment data ─── */
  const orgId = auth?.org?.id || "anon";
  const [assessments, setAssessments] = useState(() => {
    try {
      const raw = localStorage.getItem("conseqx_assessments_v1");
      const all = raw ? JSON.parse(raw) : {};
      return all[orgId] || [];
    } catch { return []; }
  });

  /* ═══ EFFECTS ═══ */

  // Sync conversations to localStorage
  useEffect(() => {
    try { localStorage.setItem('conseqx_conversations_v1', JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  // Load messages on conversation switch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`conseqx_messages_${selectedConversationId}_v1`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [selectedConversationId]);

  // Save messages
  useEffect(() => {
    try { localStorage.setItem(`conseqx_messages_${selectedConversationId}_v1`, JSON.stringify(messages)); } catch {}
  }, [messages, selectedConversationId]);

  // Update conversation metadata from messages
  useEffect(() => {
    if (messages.length === 0) return;
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== selectedConversationId) return conv;
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        let title = conv.title;
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (title === 'New chat' && firstUserMsg) {
          title = firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? '...' : '');
        }
        return {
          ...conv,
          title,
          lastMessage: lastUserMsg?.text || conv.lastMessage,
          lastActivity: new Date().toISOString(),
          messageCount: messages.length,
          hasVisualization: messages.some(msg => msg.visualization3D)
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Assessment data polling
  useEffect(() => {
    function refresh() {
      try {
        const raw = localStorage.getItem("conseqx_assessments_v1");
        const all = raw ? JSON.parse(raw) : {};
        setAssessments(all[orgId] || []);
      } catch {}
    }
    const onStorage = (e) => { if (e.key === "conseqx_assessments_v1" || e.key === null) refresh(); };
    window.addEventListener("storage", onStorage);
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
    refresh();
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(poll);
      if (bc) try { bc.close(); } catch {}
    };
  }, [orgId]);

  /* ═══ DERIVED DATA ═══ */

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

  const filteredArchive = useMemo(() => {
    if (selectedFilter === 'All') return analysisArchive;
    return analysisArchive.filter(item => item.category === selectedFilter);
  }, [analysisArchive, selectedFilter]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.title.toLowerCase().includes(q) || (c.lastMessage || '').toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  /* ═══ HELPER FUNCTIONS ═══ */

  const needs3DVisualization = (t) => {
    if (!t) return false;
    return /\b(3d|visuali[sz]|globe|pyramid|matrix view)\b/i.test(t);
  };

  const prepare3DData = useCallback(() => {
    const systemsData = {};
    Object.keys(latestBySystem).forEach(key => {
      const system = latestBySystem[key];
      const canonicalSystem = titleByKey[key] || key;
      systemsData[key] = {
        name: canonicalSystem, score: system?.score || 0,
        trend: system?.score > 70 ? 'up' : system?.score < 40 ? 'down' : 'stable',
        systemId: key, source: 'assessment', timestamp: system?.timestamp || new Date().toISOString()
      };
    });
    const systems = CANONICAL_SYSTEMS.map(sys =>
      systemsData[sys.key] || { name: sys.title, score: 0, trend: 'stable', systemId: sys.key, source: 'not-assessed', timestamp: new Date().toISOString() }
    );
    const overall_health = systems.length > 0 ? Math.round(systems.reduce((sum, s) => sum + s.score, 0) / systems.length) : 0;
    return {
      systems, overall_health, timestamp: new Date().toISOString(),
      total_systems: systems.length,
      critical_systems: systems.filter(s => s.score < 40).length,
      excellent_systems: systems.filter(s => s.score > 80).length,
      improving_systems: systems.filter(s => s.trend === 'up').length,
      assessed_systems: systems.filter(s => s.source === 'assessment').length,
      not_assessed: systems.filter(s => s.source === 'not-assessed').length
    };
  }, [latestBySystem, titleByKey]);

  /* ── Intelligence analysis helpers ── */
  const analyzeMessageForInsights = (message, messageId) => {
    if (!message || message.role !== 'assistant') return null;
    const text = message.text.toLowerCase();
    const timestamp = new Date().toISOString();
    const extractSummary = (t, keywords) => {
      const found = keywords.filter(k => t.includes(k));
      return found.length > 0 ? found.join(', ') + ' analyzed' : t.substring(0, 120) + (t.length > 120 ? '...' : '');
    };
    const priority = text.includes('critical') || text.includes('urgent') ? 'Critical'
      : text.includes('important') || text.includes('significant') ? 'High Priority' : 'Medium';

    const categories = [
      { match: ['revenue', 'financial', 'cost', 'profit', 'budget', 'roi'], title: 'Financial Discussion', category: 'Financial' },
      { match: ['strategic', 'planning', 'roadmap', 'objectives', 'goals'], title: 'Strategic Conversation', category: 'Strategic' },
      { match: ['3d', 'visualization', 'interactive'], title: '3D Visual Analysis', category: '3D Reports' },
      { match: ['operational', 'efficiency', 'process', 'performance', 'optimization'], title: 'Operations Discussion', category: 'Operational' },
      { match: ['risk', 'compliance', 'security', 'threat', 'vulnerability'], title: 'Risk Discussion', category: 'Risk' }
    ];
    for (const cat of categories) {
      if (cat.match.some(k => text.includes(k))) {
        return {
          id: `analysis_${messageId}_${Date.now()}`, title: cat.title, category: cat.category,
          type: cat.category.toLowerCase(), summary: extractSummary(text, cat.match),
          content: message.text, timestamp, messageId, downloadable: true, priority,
          ...(cat.category === '3D Reports' && { isInteractive: true })
        };
      }
    }
    if (text.length > 200 && (text.includes('analysis') || text.includes('insights') || text.includes('recommendations'))) {
      return {
        id: `analysis_${messageId}_${Date.now()}`, title: 'X-ULTRA Conversation Summary',
        category: 'Strategic', type: 'executive', summary: text.substring(0, 120) + '...',
        content: message.text, timestamp, messageId, downloadable: true, priority
      };
    }
    return null;
  };

  const saveAnalysisToArchive = (data) => {
    if (!data) return;
    setAnalysisArchive(prev => {
      const updated = [data, ...prev].slice(0, 50);
      try { localStorage.setItem('conseqx_analysis_archive_v1', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const extractRelatedMetrics = (category) => {
    const map = { 'Financial': ['financialHealth'], 'Strategic': ['strategicAlignment'], 'Operational': ['operationalEfficiency'], 'Risk': ['riskLevel'], '3D Reports': ['overallHealth'] };
    return map[category] || [];
  };



  const captureIntelligence = (assistantId, output, include3D, visualData, visualType) => {
    const finalMsg = { id: assistantId, role: 'assistant', text: output, timestamp: new Date().toISOString(), ...(include3D && { visualization3D: true, visualData, visualType }) };
    const insight = analyzeMessageForInsights(finalMsg, assistantId);
    if (insight) {
      saveAnalysisToArchive(insight);
      intelligence.addInsight({ title: insight.title, category: insight.category, summary: insight.summary, priority: insight.priority, source: 'x-ultra-chat', relatedMetrics: extractRelatedMetrics(insight.category) });
    }
  };

  const downloadAnalysis = (item) => {
    const content = `CONSEQ-X CHAT REPORT\n${'='.repeat(22)}\n\nTitle: ${item.title}\nCategory: ${item.category}\nPriority: ${item.priority}\nDate: ${new Date(item.timestamp).toLocaleString()}\n\nSUMMARY\n${'-'.repeat(8)}\n${item.summary}\n\nFULL CONVERSATION\n${'-'.repeat(18)}\n${item.content}\n\n---\nGenerated from X-ULTRA Chat\nConseQ-X Platform\nID: ${item.id}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ═══ SIMULATE REPLY (fallback when no API key) ═══ */

  const simulateAssistantReply = useCallback((prompt, existingId) => {
    setIsGenerating(true);
    const lowerPrompt = prompt.toLowerCase();
    const data3D = prepare3DData();
    let lines = [];

    // ─── Interview Mode: detect decision/problem queries and ask clarifying questions first ───
    const isDecisionQuery = /\b(should i|should we|what if|how to|decide|option|choice|consider|thinking about|planning to|want to|need to)\b/i.test(prompt);
    const isProblemQuery = /\b(problem|issue|challenge|struggling|failing|losing|crisis|urgent|help with|advice on)\b/i.test(prompt);
    const hasEnoughContext = prompt.length > 200 || /\b(because|since|context|background|details|specifically)\b/i.test(prompt);

    if ((isDecisionQuery || isProblemQuery) && !hasEnoughContext) {
      lines.push(`Good question — let me make sure I give you the right answer. A few things would help me understand the situation better:\n`);
      lines.push(`**Quick questions before I advise:**\n`);
      if (isDecisionQuery) {
        lines.push(`1. **What exactly are you deciding between?** Walk me through the options you're considering.`);
        lines.push(`2. **What's the timeline?** Is this something you need to act on right away, or do you have a few weeks?`);
        lines.push(`3. **Who else is involved?** Are there other people or teams who need to be on board?`);
        lines.push(`4. **Any hard constraints?** Budget limits, regulations, or other things that are non-negotiable.`);
      } else {
        lines.push(`1. **When did you first notice this?** Has it been building up, or did it come on suddenly?`);
        lines.push(`2. **What's the impact so far?** Is it affecting revenue, operations, your team, or something else?`);
        lines.push(`3. **What have you tried?** Any fixes or workarounds you've already put in place.`);
        lines.push(`4. **How urgent is it?** Does this need sorting this week, or can it wait a month?`);
      }
      lines.push(`\n**Tip:** If you have any supporting documents — a report, a spreadsheet, a contract — upload them using the 📎 button below. The more context I have, the sharper my advice will be.\n`);
      lines.push(`Once I understand the full picture, I'll give you **three clear options** with the likely consequences of each.`);
    } else {
      const greetings = ["Here's what I can see from your data:", "Let me look at your numbers and break it down:", "Alright, let me pull up what we know:"];
      lines.push(greetings[Math.floor(Math.random() * greetings.length)]);
    }

    if (!(isDecisionQuery || isProblemQuery) || hasEnoughContext) {
    if (lowerPrompt.includes('score') || lowerPrompt.includes('performance') || lowerPrompt.includes('health')) {
      lines.push(`\n**Here's where your organisation stands: ${data3D.overall_health}%**`);
      lines.push(`- **${data3D.total_systems}** systems tracked in total`);
      if (data3D.critical_systems > 0) lines.push(`- **${data3D.critical_systems}** system${data3D.critical_systems > 1 ? 's' : ''} need urgent attention`);
      if (data3D.excellent_systems > 0) lines.push(`- **${data3D.excellent_systems}** system${data3D.excellent_systems > 1 ? 's are' : ' is'} performing really well`);
      if (data3D.improving_systems > 0) lines.push(`- **${data3D.improving_systems}** system${data3D.improving_systems > 1 ? 's are' : ' is'} trending upward`);
    }
    if (lowerPrompt.includes('system') || lowerPrompt.includes('department')) {
      lines.push("\n**How each system is doing:**");
      data3D.systems.filter(sys => sys.score > 0).forEach(sys => {
        const icon = sys.score > 80 ? '✅' : sys.score > 60 ? '⚠️' : '🚨';
        lines.push(`${icon} **${sys.name}**: ${sys.score}%`);
      });
      const unassessed = data3D.systems.filter(sys => sys.score === 0);
      if (unassessed.length > 0) {
        lines.push(`\n📋 **Not yet assessed:** ${unassessed.map(s => s.name).join(', ')}`);
      }
    }
    if (lowerPrompt.includes('recommendation') || lowerPrompt.includes('action') || lowerPrompt.includes('plan')) {
      lines.push("\n**What I'd suggest focusing on:**");
      if (data3D.critical_systems > 0) lines.push(`1. Tackle the ${data3D.critical_systems} system${data3D.critical_systems > 1 ? 's' : ''} that scored below 40% — those are holding things back`);
      lines.push("2. Look at what's working in your stronger systems and apply those lessons to the weaker ones");
      lines.push("3. Set up a regular check-in rhythm so you can spot problems before they grow");
    }
    if (lowerPrompt.includes('financial') || lowerPrompt.includes('revenue') || lowerPrompt.includes('cost')) {
      lines.push("\n**On the financial side:**");
      lines.push("I'd need to see your financial data to give you specific numbers. Upload a report or spreadsheet using the 📎 button and I'll work through it with you.");
    }
    if (Object.keys(latestBySystem).length === 0) {
      lines.push("\nYou haven't run any assessments yet, so I'm working with limited information. Once you complete a few system assessments, I'll be able to give you much more specific guidance.");
    } else {
      lines.push("\nWant me to dig deeper into any of these systems, or would you like to talk through a specific challenge you're facing?");
    }
    } // end if hasEnoughContext

    const include3D = needs3DVisualization(prompt);
    if (include3D) {
      lines.push("\n**3D Visualization** — Generating interactive view of your organizational data...");
    }

    const replyText = lines.join("\n");
    const id = existingId || `m-assistant-${Date.now()}`;
    const visualData = include3D ? data3D : null;
    let visualType = 'globe';
    if (prompt.toLowerCase().includes('matrix')) visualType = 'matrix';
    if (prompt.toLowerCase().includes('pyramid')) visualType = 'pyramid';

    if (!existingId) {
      setMessages(prev => [...prev, { id, role: "assistant", text: "", timestamp: new Date().toISOString() }]);
    }

    let idx = 0;
    const interval = setInterval(() => {
      idx += 30;
      const chunk = replyText.slice(0, idx);
      const props = {
        text: chunk,
        ...(include3D && idx >= replyText.length && { visualization3D: true, visualData, visualType, visualTitle: `Organizational Health ${visualType === 'matrix' ? 'Matrix' : visualType === 'pyramid' ? 'Hierarchy' : 'Globe'}` })
      };
      setMessages(prev => prev.map(m => m.id === id ? { ...m, ...props } : m));
      if (idx >= replyText.length) {
        clearInterval(interval);
        setIsGenerating(false);
        captureIntelligence(id, replyText, include3D, visualData, visualType);
      }
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepare3DData, latestBySystem]);

  /* ═══ SEND MESSAGE (with OpenRouter API) ═══ */

  async function handleSendMessage(text) {
    if (!text.trim() || isGenerating) return;
    const userMsg = { id: `m-user-${Date.now()}`, role: "user", text, timestamp: new Date().toISOString(), file: uploadedFile ? { ...uploadedFile } : undefined };
    setMessages(prev => [...prev, userMsg]);
    setUploadedFile(null);
    setTextValue("");

    const assistantId = `m-assistant-${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", text: "...", timestamp: new Date().toISOString() }]);
    setIsGenerating(true);

    const scores = {};
    Object.keys(latestBySystem).forEach(k => { scores[k] = latestBySystem[k]?.score ?? null; });

    const needsAssessmentContext = (t) => /\b(assess|score|system|results|report|priority|action plan|org|organization|company|revenue|metrics|kpi|how did we do|what is my score)\b/i.test(t);
    const askingForLink = (t) => /\b(link|url|navigate|go to|take me to|where|how do I|access|run|start)\b.*\b(assess|assessment|test|evaluation)\b/i.test(t);

    const openRouterKey = process.env.REACT_APP_OPENROUTER_KEY;
    const modelUrl = "https://openrouter.ai/api/v1/chat/completions";

    try {
      // Assessment link shortcut
      if (askingForLink(text)) {
        const linkReply = `**Ready to assess your organisation?**\n\nHere's how to get started:\n\n1. Go to the **Assessments** tab in the sidebar\n2. Pick a system you'd like to assess\n3. Work through the questions — it usually takes about 10–20 minutes per system\n\nOnce you've completed a few assessments, come back here and I'll be able to give you much more specific, data-backed advice.`;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: linkReply } : m));
        setIsGenerating(false);
        return;
      }

      if (!openRouterKey) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        simulateAssistantReply(text);
        return;
      }

      const hasAssessmentData = Object.keys(scores).length > 0;
      const needsAssessments = needsAssessmentContext(text) && hasAssessmentData;
      const include3D = needs3DVisualization(text);
      const visualData = include3D ? prepare3DData() : null;
      let visualType = 'globe';
      if (text.toLowerCase().includes('matrix') || text.toLowerCase().includes('comparison')) visualType = 'matrix';
      else if (text.toLowerCase().includes('hierarchy') || text.toLowerCase().includes('pyramid')) visualType = 'pyramid';

      let chatPayload;

      // Build conversation history for multi-turn context (last 10 messages)
      const recentHistory = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map(m => ({ role: m.role, content: m.text || "" }));

      const interviewSystemPrompt = `You are X-ULTRA, the AI assistant built into the ConseQ-X platform. You help CEOs and business leaders understand their organisation's health and make better decisions.

HOW YOU SHOULD BEHAVE:
- Write like a trusted advisor, not a machine. Be warm, direct, and practical.
- Use plain English. No jargon, no corporate buzzwords, no filler.
- When the CEO asks about a decision or problem, ask 2-3 clarifying questions first before giving advice.
- If relevant, suggest they upload supporting documents (contracts, financials, reports) using the file upload button.

WHEN YOU GIVE ADVICE:
- Present 3 clear options when the situation calls for it:
  - Option A (Play it safe): Lower risk, incremental steps
  - Option B (Balanced approach): Moderate risk, structured change
  - Option C (Go bold): Higher risk, bigger potential payoff
- For each option, explain: what to do, roughly how long it takes, and what could go right or wrong.

RULES:
- You are being used primarily in the Nigerian and African business context. Reference relevant local examples when helpful.
- Use actual numbers and scores from assessment data when they are available.
- If you do not have enough data to give a confident answer, say so honestly.
- Keep responses focused. A CEO's time is valuable — do not ramble.`;

      if (needsAssessments) {
        const assessmentDocs = Object.values(latestBySystem).map(r => ({
          id: r.id || `${r.systemId}-${r.timestamp}`,
          text: `System: ${r.systemId}\nScore: ${r.score}\nNotes: ${JSON.stringify(r.meta || {})}`,
          meta: { systemId: r.systemId, score: r.score, timestamp: r.timestamp }
        }));
        // Include persisted uploaded document chunks
        const storedDocs = loadStoredDocs(orgId);
        const allDocs = [...assessmentDocs, ...storedDocs];
        const index = buildIndex(allDocs);
        const hits = queryIndex(index, text, 6);
        const report = hits.map(h => `- [${h.doc.meta.systemId || h.doc.meta.source || 'doc'}] ${h.doc.meta.score ? `score: ${h.doc.meta.score} — ` : ''}excerpt: ${h.doc.text.slice(0, 200)}`).join('\n');

        chatPayload = {
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: interviewSystemPrompt },
            { role: "system", content: `ASSESSMENT DATA & UPLOADED DOCUMENTS:\n${report}` },
            ...recentHistory,
            { role: "user", content: text }
          ]
        };
      } else {
        const contextualPrompt = intelligence.getContextualPrompt();
        // Also include uploaded docs in non-assessment queries
        const storedDocs = loadStoredDocs(orgId);
        let docContext = "";
        if (storedDocs.length > 0) {
          const docIndex = buildIndex(storedDocs);
          const docHits = queryIndex(docIndex, text, 3);
          if (docHits.length > 0) {
            docContext = `\n\nUPLOADED DOCUMENT EXCERPTS:\n${docHits.map(h => `- [${h.doc.meta.source}]: ${h.doc.text.slice(0, 200)}`).join('\n')}`;
          }
        }
        chatPayload = {
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: `${interviewSystemPrompt}\n\nCURRENT ORGANIZATIONAL CONTEXT: ${contextualPrompt}${docContext}` },
            ...recentHistory,
            { role: "user", content: text }
          ]
        };
      }

      const res = await fetch(modelUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${openRouterKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload)
      });

      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        simulateAssistantReply(text);
        return;
      }

      const payload = await res.json();
      const output = payload.choices?.[0]?.message?.content ?? "";

      // Typing animation
      let idx = 0;
      const total = output.length;
      const tick = setInterval(() => {
        idx = Math.min(total, idx + Math.max(20, Math.round(total / 30)));
        const chunk = output.slice(0, idx);
        const props = {
          text: chunk,
          ...(include3D && idx >= total && { visualization3D: true, visualData, visualType, visualTitle: `Organizational Health ${visualType === 'matrix' ? 'Matrix' : visualType === 'pyramid' ? 'Hierarchy' : 'Globe'}` })
        };
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, ...props } : m));
        if (idx >= total) {
          clearInterval(tick);
          setIsGenerating(false);
          captureIntelligence(assistantId, output, include3D, visualData, visualType);
        }
      }, 40);

    } catch {
      setMessages(prev => prev.filter(m => m.id !== assistantId));
      simulateAssistantReply(text);
    }
  }

  /* ═══ HANDLERS ═══ */

  function handleUploadFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, size: file.size, url });

    // Parse text-based files and persist chunks for RAG
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (text && text.length > 10) {
        const chunks = parseFileToChunks(file.name, text);
        saveDocChunks(orgId, chunks);
      }
    };
    if (/\.(txt|csv|json|md|log)$/i.test(file.name)) {
      reader.readAsText(file);
    }
  }

  const handleNewChat = () => {
    const newId = `c${Date.now()}`;
    setConversations(prev => [{ id: newId, title: "New chat", lastMessage: "", timestamp: new Date().toISOString(), lastActivity: new Date().toISOString(), messageCount: 0 }, ...prev]);
    setSelectedConversationId(newId);
  };

  const handleDeleteConversation = (convId) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== convId);
      if (updated.length === 0) {
        const fallback = { id: `c${Date.now()}`, title: "New chat", lastMessage: "", timestamp: new Date().toISOString(), lastActivity: new Date().toISOString(), messageCount: 0 };
        updated.push(fallback);
      }
      return updated;
    });
    if (selectedConversationId === convId) {
      const remaining = conversations.filter(c => c.id !== convId);
      setSelectedConversationId(remaining.length > 0 ? remaining[0].id : `c${Date.now()}`);
    }
    try { localStorage.removeItem(`conseqx_messages_${convId}_v1`); } catch {}
    setShowConvMenu(null);
  };

  const handleRenameConversation = (convId) => {
    if (!editTitle.trim()) { setEditingConvId(null); return; }
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editTitle.trim() } : c));
    setEditingConvId(null);
    setShowConvMenu(null);
  };

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    setMessages(prev => {
      const lastAssistantIdx = prev.map(m => m.role).lastIndexOf('assistant');
      if (lastAssistantIdx === -1) return prev;
      return prev.filter((_, i) => i !== lastAssistantIdx);
    });
    setTimeout(() => handleSendMessage(lastUser.text), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textValue.trim()) handleSendMessage(textValue.trim());
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [textValue]);

  /* ─── Suggestion chips for empty state ─── */
  const suggestions = [
    { icon: <FaChartLine size={16} />, label: "How is my organisation doing overall?", prompt: "Give me an honest overview of how my organisation is performing across all six systems" },
    { icon: <FaCube size={16} />, label: "Show me a visual of our health", prompt: "Show me a 3D visualization of how our six systems are performing" },
    { icon: <FaFileAlt size={16} />, label: "What should I focus on first?", prompt: "Based on our scores, what are the most important things I should be working on right now?" },
    { icon: <FaDownload size={16} />, label: "Help me think through a decision", prompt: "I have a decision I need to make and I'd like to talk it through with you" }
  ];

  const isEmpty = messages.length === 0;

  /* ═══ CLOSE CONTEXT MENU ON OUTSIDE CLICK ═══ */
  useEffect(() => {
    if (!showConvMenu) return;
    const handler = () => setShowConvMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showConvMenu]);

  /* ═══ TRACK MOBILE BREAKPOINT ═══ */
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => {
      setIsMobileView(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ═════════════════════════════════════════════════════════════
   *  RENDER
   * ═════════════════════════════════════════════════════════════ */
  return (
    <div className={`relative flex h-[calc(100vh-80px)] overflow-hidden rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>

      {/* ═══ Mobile backdrop ═══ */}
      {isMobileView && sidebarOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ╔══════════════════════════════════════╗
       *  ║  SIDEBAR                              ║
       *  ╚══════════════════════════════════════╝ */}
      <div
        className={`flex-shrink-0 flex flex-col transition-all duration-300 border-r ${
          darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'
        } ${
          isMobileView
            ? `absolute inset-y-0 left-0 z-50 w-[280px] shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
            title="Close sidebar"
          >
            <FaBars size={16} />
          </button>
          <button
            onClick={handleNewChat}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
            title="New chat"
          >
            <FaPlus size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className={`flex mx-3 mb-2 rounded-lg p-0.5 flex-shrink-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {[
            { key: 'chats', label: 'Chats' },
            { key: 'archive', label: 'Archive' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSidebarTab(tab.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sidebarTab === tab.key
                  ? darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 shadow-sm'
                  : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.key === 'archive' && analysisArchive.length > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{analysisArchive.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search (chats tab) */}
        {sidebarTab === 'chats' && (
          <div className="px-3 mb-2 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-200/70 text-gray-500'}`}>
              <FaSearch size={12} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
              />
            </div>
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 hide-scrollbar">
          {sidebarTab === 'chats' && (
            <>
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group relative flex items-center rounded-lg cursor-pointer transition-colors ${
                    selectedConversationId === conv.id
                      ? darkMode ? 'bg-gray-800' : 'bg-gray-200'
                      : darkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-200/60'
                  }`}
                >
                  {editingConvId === conv.id ? (
                    <div className="flex-1 flex items-center gap-1 px-3 py-2.5">
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameConversation(conv.id); if (e.key === 'Escape') setEditingConvId(null); }}
                        className={`flex-1 text-sm bg-transparent outline-none border-b ${darkMode ? 'border-gray-600 text-white' : 'border-gray-400 text-gray-900'}`}
                      />
                      <button onClick={() => handleRenameConversation(conv.id)} className="p-1"><FaCheck size={12} className="text-emerald-500" /></button>
                      <button onClick={() => setEditingConvId(null)} className="p-1"><FaTimes size={12} className={darkMode ? 'text-gray-500' : 'text-gray-400'} /></button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => { setSelectedConversationId(conv.id); if (isMobileView) setSidebarOpen(false); }}
                        className="flex-1 text-left px-3 py-2.5 min-w-0"
                      >
                        <span className={`block text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {conv.title}
                        </span>
                      </button>

                      {/* Hover actions */}
                      <div className={`absolute right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowConvMenu(showConvMenu === conv.id ? null : conv.id); }}
                          className={`p-1.5 rounded-md ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-300 text-gray-500'}`}
                        >
                          <FaEllipsisH size={12} />
                        </button>
                      </div>

                      {/* Context menu */}
                      {showConvMenu === conv.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className={`absolute right-0 top-full z-50 mt-1 py-1 rounded-lg shadow-xl border min-w-[140px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                          <button
                            onClick={() => { setEditTitle(conv.title); setEditingConvId(conv.id); setShowConvMenu(null); }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                          >
                            <FaRegEdit size={12} /> Rename
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conv.id)}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-red-500 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {sidebarTab === 'archive' && (
            <div className="px-1 space-y-2 py-2">
              {/* Filter chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                {['All', 'Financial', 'Operational', 'Strategic', 'Risk'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                      selectedFilter === f
                        ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
                        : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filteredArchive.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  <FaFileAlt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No saved conversations yet</p>
                </div>
              ) : (
                filteredArchive.map(item => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg ${darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 border border-gray-100'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                        item.priority === 'Critical' ? 'bg-red-100 text-red-700'
                          : item.priority?.includes('High') ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{item.priority}</span>
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.summary}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <button
                        onClick={() => downloadAnalysis(item)}
                        className={`text-[11px] flex items-center gap-1 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <FaDownload size={10} /> Save
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar footer - Live metrics */}
        {intelligence.sharedMetrics && sidebarTab === 'chats' && (
          <div className={`p-3 border-t flex-shrink-0 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <span>Health Score</span>
              <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {intelligence.sharedMetrics.overallHealth?.score ?? '—'}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ╔══════════════════════════════════════╗
       *  ║  MAIN CHAT AREA                       ║
       *  ╚══════════════════════════════════════╝ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b flex-shrink-0 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          {(!sidebarOpen || isMobileView) && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                title="Open sidebar"
              >
                <FaBars size={16} />
              </button>
              <button
                onClick={handleNewChat}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                title="New chat"
              >
                <FaPlus size={16} />
              </button>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              X-ULTRA
            </span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {isGenerating ? 'Thinking...' : 'Online'}
            </span>
          </div>
        </div>

        {/* Messages / Empty state */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {isEmpty ? (
            /* ─── Empty state (ChatGPT style) ─── */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${darkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`}>
                <span className="text-white text-2xl font-bold">X</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                What's on your mind?
              </h2>
              <p className={`text-xs sm:text-sm mb-6 sm:mb-8 max-w-md text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Ask me anything about your organisation — how your systems are doing, where to focus your energy, or talk through a decision you're weighing up.
              </p>

              {/* Suggestion chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl px-2 sm:px-0">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s.prompt)}
                    className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border text-left transition-colors ${
                      darkMode
                        ? 'border-gray-700 hover:bg-gray-800/80 text-gray-300'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className={`mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.icon}</span>
                    <span className="text-sm">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ─── Messages list ─── */
            <div className="pb-4">
              {messages.map((m, idx) => (
                <MessageBubble
                  key={m.id}
                  m={m}
                  darkMode={darkMode}
                  isLast={idx === messages.length - 1}
                  isGenerating={isGenerating}
                  onRegenerate={idx === messages.length - 1 && m.role === 'assistant' ? handleRegenerate : undefined}
                />
              ))}

              {isGenerating && messages.length > 0 && messages[messages.length - 1]?.text === '...' && (
                <div className="py-5">
                  <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 px-3 sm:px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${darkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'}`}>X</div>
                    <div>
                      <div className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>X-ULTRA</div>
                      <TypingDots darkMode={darkMode} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ─── Input area (ChatGPT style: centered, rounded) ─── */}
        <div className={`px-2 sm:px-4 pb-3 sm:pb-4 pt-2 flex-shrink-0 ${darkMode ? '' : ''}`}>
          <div className="max-w-3xl mx-auto">
            {/* Uploaded file preview */}
            {uploadedFile && (
              <div className={`mb-2 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <FaPaperclip size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <span className="text-sm truncate">{uploadedFile.name}</span>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={() => setUploadedFile(null)} className={`p-1 rounded-md ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {/* Composer */}
            <div className={`relative flex items-end gap-2 rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm ${
              darkMode
                ? 'bg-gray-800 border-gray-700 focus-within:border-gray-600'
                : 'bg-gray-50 border-gray-300 focus-within:border-gray-400'
            }`}>
              {/* Attach button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-1.5 rounded-lg self-end mb-0.5 transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                title="Attach file"
              >
                <FaPaperclip size={16} />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your organisation..."
                rows={1}
                className={`flex-1 resize-none bg-transparent outline-none text-sm sm:text-[15px] leading-6 hide-scrollbar ${
                  darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                }`}
                style={{ maxHeight: 200 }}
              />

              {/* Send button */}
              <button
                onClick={() => { if (textValue.trim()) handleSendMessage(textValue.trim()); }}
                disabled={!textValue.trim() || isGenerating}
                className={`p-2 rounded-lg self-end mb-0.5 transition-all ${
                  textValue.trim() && !isGenerating
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                }`}
                title="Send message"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>

            {/* Disclaimer */}
            <p className={`text-[11px] text-center mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              X-ULTRA is here to help, but always use your own judgement for big decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.csv,.xlsx,.txt"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
