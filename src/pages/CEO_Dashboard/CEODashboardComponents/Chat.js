import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaPaperPlane, FaPaperclip, FaCube, FaChartLine, FaFileAlt, FaCommentDots,
  FaBars, FaPlus, FaRegCopy, FaCheck, FaRedo, FaTrash, FaEllipsisH,
  FaRegEdit, FaTimes, FaSearch, FaChevronDown, FaChevronUp
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
  const [expandedArchiveId, setExpandedArchiveId] = useState(null);

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

  /** Build a full snapshot of ALL dashboard data for the AI to reference */
  const buildFullDashboardContext = useCallback(() => {
    const ctx = { org: {}, systems: {}, financials: null, actions: [], uploads: [], insights: [], progress: {} };

    // Org info
    ctx.org = { name: auth?.org?.name || 'Unknown', tier: auth?.org?.subscription?.tier || 'free', user: auth?.user?.name || 'CEO' };

    // System scores
    CANONICAL_SYSTEMS.forEach(sys => {
      const latest = latestBySystem[sys.key];
      ctx.systems[sys.key] = {
        name: sys.title,
        score: latest?.score ?? null,
        assessed: !!latest,
        subScores: latest?.meta?.subScores || [],
        interpretation: latest?.meta?.interpretation || null,
        timestamp: latest?.timestamp || null
      };
    });

    const assessed = Object.values(ctx.systems).filter(s => s.assessed);
    ctx.overallHealth = assessed.length > 0 ? Math.round(assessed.reduce((a, s) => a + s.score, 0) / assessed.length) : null;
    ctx.assessedCount = assessed.length;
    ctx.weakest = assessed.length > 0 ? assessed.sort((a, b) => a.score - b.score)[0] : null;
    ctx.strongest = assessed.length > 0 ? assessed.sort((a, b) => b.score - a.score)[0] : null;

    // Financial metrics
    try {
      const fin = localStorage.getItem('conseqx_fin_metrics_v1');
      if (fin) {
        const parsed = JSON.parse(fin);
        // Only treat as available if at least one metric has a real value
        const hasRealData = Object.values(parsed).some(v => v !== null && v !== undefined && v !== '' && v !== 0);
        if (hasRealData) ctx.financials = parsed;
      }
    } catch {}

    // Custom action items
    try {
      const acts = localStorage.getItem(`conseqx_custom_actions_v1_${orgId}`);
      if (acts) ctx.actions = JSON.parse(acts);
    } catch {}

    // Uploaded documents
    try {
      const docs = localStorage.getItem(`conseqx_analyzed_docs_${orgId}`);
      if (docs) {
        const parsed = JSON.parse(docs);
        ctx.uploads = parsed.map(d => ({ name: d.fileName, type: d.dataType, records: d.recordCount, systems: d.analyzedSystems }));
      }
    } catch {}

    // Assessment progress
    try {
      const prog = localStorage.getItem('conseqx_assessment_progress_v1');
      if (prog) {
        const all = JSON.parse(prog);
        ctx.progress = all[orgId] || {};
      }
    } catch {}

    // Intelligence insights
    ctx.insights = intelligence.activeInsights?.slice(0, 5) || [];
    ctx.sharedMetrics = intelligence.sharedMetrics || {};

    return ctx;
  }, [auth, latestBySystem, orgId, intelligence]);

  /** Convert the full context into a text block for the LLM system prompt */
  const buildContextString = useCallback(() => {
    const ctx = buildFullDashboardContext();
    const parts = [];

    parts.push(`ORGANISATION: ${ctx.org.name} (${ctx.org.tier} plan)`);
    parts.push(`USER: ${ctx.org.user}`);

    // Systems
    if (ctx.assessedCount > 0) {
      parts.push(`\nASSESSMENT RESULTS (${ctx.assessedCount} of 6 systems assessed, overall health: ${ctx.overallHealth}%):`);
      Object.entries(ctx.systems).forEach(([, sys]) => {
        if (sys.assessed) {
          parts.push(`  - ${sys.name}: ${sys.score}%${sys.interpretation ? ` — "${sys.interpretation}"` : ''}`);
          if (sys.subScores?.length > 0) {
            parts.push(`    Sub-scores: ${sys.subScores.map(s => `${s.name || s.label}: ${s.score}%`).join(', ')}`);
          }
        }
      });
      const notAssessed = Object.values(ctx.systems).filter(s => !s.assessed);
      if (notAssessed.length > 0) parts.push(`  Not yet assessed: ${notAssessed.map(s => s.name).join(', ')}`);
      if (ctx.weakest && ctx.strongest && ctx.weakest.name !== ctx.strongest.name) {
        parts.push(`  Weakest: ${ctx.weakest.name} (${ctx.weakest.score}%)`);
        parts.push(`  Strongest: ${ctx.strongest.name} (${ctx.strongest.score}%)`);
      }
    } else {
      parts.push('\nNo assessments completed yet.');
    }

    // Financials
    if (ctx.financials) {
      const f = ctx.financials;
      parts.push('\nFINANCIAL METRICS (from Billing/Revenue page):');
      if (f.annualRevenue) parts.push(`  Annual Revenue: ${f.annualRevenue}`);
      if (f.operatingCost) parts.push(`  Operating Cost: ${f.operatingCost}`);
      if (f.profitMarginPct != null) parts.push(`  Profit Margin: ${f.profitMarginPct}%`);
      if (f.costOfDelays) parts.push(`  Cost of Delays: ${f.costOfDelays}`);
      if (f.customerRetentionPct != null) parts.push(`  Customer Retention: ${f.customerRetentionPct}%`);
      if (f.employeeTurnoverPct != null) parts.push(`  Employee Turnover: ${f.employeeTurnoverPct}%`);
    }

    // Actions
    if (ctx.actions.length > 0) {
      const pending = ctx.actions.filter(a => a.status !== 'completed');
      const done = ctx.actions.filter(a => a.status === 'completed');
      parts.push(`\nACTION ITEMS: ${pending.length} pending, ${done.length} completed`);
      pending.slice(0, 5).forEach(a => parts.push(`  - [${a.priority || 'Medium'}] ${a.action || a.text || 'Unnamed task'}`));
    }

    // Uploads
    if (ctx.uploads.length > 0) {
      parts.push(`\nUPLOADED DATA: ${ctx.uploads.length} file(s)`);
      ctx.uploads.slice(0, 5).forEach(u => parts.push(`  - ${u.name} (${u.type}, ${u.records} records, systems: ${u.systems?.join(', ') || 'none'})`));
    }

    // Recent insights
    if (ctx.insights.length > 0) {
      parts.push('\nRECENT INSIGHTS:');
      ctx.insights.forEach(i => parts.push(`  - [${i.category}] ${i.title}: ${i.summary}`));
    }

    return parts.join('\n');
  }, [buildFullDashboardContext]);

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

  const captureIntelligence = (assistantId, output, include3D, visualData, visualType) => {
    const finalMsg = { id: assistantId, role: 'assistant', text: output, timestamp: new Date().toISOString(), ...(include3D && { visualization3D: true, visualData, visualType }) };
    const insight = analyzeMessageForInsights(finalMsg, assistantId);
    if (insight) {
      saveAnalysisToArchive(insight);
      intelligence.addInsight({ title: insight.title, category: insight.category, summary: insight.summary, priority: insight.priority, source: 'x-ultra-chat' });
    }
  };



  /* ═══ SIMULATE REPLY (fallback when no API key) ═══ */

  const simulateAssistantReply = useCallback((prompt, existingId) => {
    setIsGenerating(true);
    const lowerPrompt = prompt.toLowerCase();
    const data3D = prepare3DData();
    const ctx = buildFullDashboardContext();
    let lines = [];

    // ─── Interview Mode: detect decision/problem queries ───
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
      lines.push(`\n**Tip:** Upload supporting documents using the 📎 button — the more context I have, the sharper my advice.\n`);
      lines.push(`Once I understand the full picture, I'll give you **three clear options** with the likely consequences of each.`);
    } else {

    // ─── Follow-up detection: short replies like "yes", "go ahead", "tell me more" ───
    let effectivePrompt = prompt;
    if (/^(yes|yeah|yep|sure|go ahead|okay|ok|tell me|tell me more|continue|go on|please|do it|absolutely|definitely)\b/i.test(prompt.trim()) && prompt.trim().length < 30) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user' && m.text !== prompt);
      if (lastUserMsg) effectivePrompt = lastUserMsg.text;
    }
    const ep = effectivePrompt.toLowerCase();

    // ─── Route to the right dashboard section based on the question ───
    // Order matters: specific topics first, broad catch-all last

    // SPECIFIC SYSTEM deep-dive (most specific — check first)
    if (/\b(interdependency|orchestration|investigation|interpretation|illustration|inlignment)\b/i.test(ep)) {
      const match = ep.match(/\b(interdependency|orchestration|investigation|interpretation|illustration|inlignment)\b/i);
      const sysKey = match[1].toLowerCase();
      const sys = ctx.systems[sysKey];
      if (sys?.assessed) {
        lines.push(`**${sys.name} — ${sys.score}%**\n`);
        if (sys.interpretation) lines.push(`*"${sys.interpretation}"*\n`);
        if (sys.subScores?.length > 0) {
          lines.push(`**Breakdown:**`);
          sys.subScores.forEach(sub => {
            const icon = sub.score > 70 ? '✅' : sub.score > 45 ? '⚠️' : '🚨';
            lines.push(`${icon} ${sub.name || sub.label}: ${sub.score}%`);
          });
        }
        lines.push(`\nFor a full deep-dive with recommendations and African case studies, check the **Ultra View** page.`);
      } else {
        lines.push(`You haven't assessed **${sys?.name || sysKey}** yet. Head to **Assessments** to run it — once you do, I'll be able to break it down for you.`);
      }
    }

    // FINANCIALS / REVENUE / BILLING (before health — "financial metrics" contains "metric")
    else if (/\b(financ|revenue|cost|profit|margin|billing|budget|money|turnover|retention|metric)\b/i.test(ep)) {
      if (ctx.financials) {
        const f = ctx.financials;
        lines.push(`**Here's your financial picture:**\n`);
        if (f.annualRevenue) lines.push(`- **Annual Revenue:** ${typeof f.annualRevenue === 'number' ? '₦' + f.annualRevenue.toLocaleString() : f.annualRevenue}`);
        if (f.operatingCost) lines.push(`- **Operating Cost:** ${typeof f.operatingCost === 'number' ? '₦' + f.operatingCost.toLocaleString() : f.operatingCost}`);
        if (f.profitMarginPct != null) lines.push(`- **Profit Margin:** ${f.profitMarginPct}%`);
        if (f.costOfDelays) lines.push(`- **Cost of Delays:** ${typeof f.costOfDelays === 'number' ? '₦' + f.costOfDelays.toLocaleString() : f.costOfDelays}`);
        if (f.customerRetentionPct != null) lines.push(`- **Customer Retention:** ${f.customerRetentionPct}%`);
        if (f.employeeTurnoverPct != null) lines.push(`- **Employee Turnover:** ${f.employeeTurnoverPct}%`);
        // Cross-reference with system scores
        if (ctx.assessedCount > 0) {
          lines.push(`\n**How this connects to your systems:**`);
          if (f.profitMarginPct != null) lines.push(`- Profit margin links to **Orchestration** (process efficiency)`);
          if (f.employeeTurnoverPct != null) lines.push(`- Employee turnover links to **Interpretation** (culture & engagement)`);
          if (f.customerRetentionPct != null) lines.push(`- Customer retention links to **Interdependency** (stakeholder relationships)`);
        }
        if (f.profitMarginPct != null && f.profitMarginPct < 15) {
          lines.push(`\n⚠️ Your profit margin is below 15% — that's tight. I'd look at the **Orchestration** system for quick wins on cost reduction.`);
        }
        if (f.employeeTurnoverPct != null && f.employeeTurnoverPct > 20) {
          lines.push(`\n⚠️ Employee turnover above 20% is costly. Check your **Interpretation** scores — that covers culture, morale, and engagement.`);
        }
      } else {
        lines.push(`I don't have your financial data yet.\n`);
        lines.push(`Go to the **Org Metrics** (Billing) tab and enter your key numbers — revenue, operating costs, profit margins, customer retention, employee turnover.\n`);
        lines.push(`Once those are in, I'll be able to show you exactly how your finances connect to each of the six systems and where money is being lost.`);
      }
    }

    // ACTION ITEMS / RECOMMENDATIONS / PLAN
    else if (/\b(action|recommendation|plan|todo|task|next step|priorit|focus|what should)\b/i.test(ep)) {
      if (ctx.actions.length > 0) {
        const pending = ctx.actions.filter(a => a.status !== 'completed');
        const done = ctx.actions.filter(a => a.status === 'completed');
        lines.push(`**Your action items:**\n`);
        lines.push(`✅ ${done.length} completed · 📋 ${pending.length} still open\n`);
        if (pending.length > 0) {
          lines.push(`**Open items:**`);
          pending.slice(0, 6).forEach((a, i) => {
            lines.push(`${i + 1}. ${a.action || a.text || 'Unnamed'} — *${a.priority || 'Medium'} priority*${a.owner ? ` (${a.owner})` : ''}`);
          });
        }
        lines.push(`\nYou can manage these on the **Recommendations & Actions** page under Partner Dashboard.`);
      } else if (ctx.assessedCount > 0) {
        lines.push(`You don't have any custom action items yet, but based on your scores, here's what I'd prioritise:\n`);
        const sorted = Object.values(ctx.systems).filter(s => s.assessed).sort((a, b) => a.score - b.score);
        sorted.slice(0, 3).forEach((sys, i) => {
          lines.push(`${i + 1}. **${sys.name}** (${sys.score}%) — this needs the most attention`);
        });
        lines.push(`\nGo to **Recommendations & Actions** in the Partner Dashboard to create specific tasks and assign owners.`);
      } else {
        lines.push(`Complete your first assessment so I can give you data-driven recommendations. Head to the **Assessments** tab to get started.`);
      }
    }

    // BENCHMARK / INDUSTRY / COMPARISON
    else if (/\b(benchmark|industry|compar|ranking|percentile|peer|sector)\b/i.test(ep)) {
      if (ctx.assessedCount > 0) {
        lines.push(`**Industry Benchmarking**\n`);
        lines.push(`Your overall health is **${ctx.overallHealth}%**. Here's how that typically stacks up:\n`);
        lines.push(`- Above 75%: Top quartile — you're outperforming most organisations`);
        lines.push(`- 50–75%: Middle of the pack — solid but with clear room to grow`);
        lines.push(`- Below 50%: Below average — there are fundamentals to fix\n`);
        lines.push(`For a detailed breakdown showing how each of your six systems compares to industry averages and top performers, check the **Industry Benchmarks** page under Partner Dashboard.`);
      } else {
        lines.push(`I'll need your assessment scores before I can benchmark you against the industry. Run at least one assessment from the **Assessments** tab.`);
      }
    }

    // FORECAST / SCENARIO / IMPACT
    else if (/\b(forecast|scenario|impact|project|simulat|what.*happen|predict)\b/i.test(ep)) {
      if (ctx.assessedCount > 0) {
        lines.push(`**Impact Simulator**\n`);
        lines.push(`Based on your current scores, here's a quick read:\n`);
        const critical = Object.values(ctx.systems).filter(s => s.assessed && s.score < 40);
        if (critical.length > 0) {
          lines.push(`If you improve ${critical.map(s => `**${s.name}**`).join(' and ')} by even 15–20 points, your overall health could jump from ${ctx.overallHealth}% to roughly ${Math.min(100, ctx.overallHealth + Math.round(critical.length * 5))}%.`);
        } else {
          lines.push(`Your scores are fairly balanced. A 10-point improvement in your weakest system (**${ctx.weakest?.name}**) would push your overall health to about ${Math.min(100, ctx.overallHealth + 2)}%.`);
        }
        lines.push(`\nFor interactive "what if" scenarios with sliders, go to **Forecast & Scenarios** in the Partner Dashboard.`);
      } else {
        lines.push(`I can't run forecasts without assessment data. Complete your assessments first, then use the **Forecast & Scenarios** tool on the Partner Dashboard to model different outcomes.`);
      }
    }

    // DATA / UPLOADS / DOCUMENTS
    else if (/\b(upload|data|document|file|spreadsheet|csv|excel|report.*upload)\b/i.test(ep)) {
      if (ctx.uploads.length > 0) {
        lines.push(`**Your uploaded data:**\n`);
        ctx.uploads.slice(0, 5).forEach(u => {
          lines.push(`- **${u.name}** (${u.type.toUpperCase()}, ${u.records} rows) → linked to: ${u.systems?.length > 0 ? u.systems.map(s => titleByKey[s] || s).join(', ') : 'no system detected'}`);
        });
        if (ctx.uploads.length > 5) lines.push(`- ...and ${ctx.uploads.length - 5} more`);
        lines.push(`\nYou can manage these on the **Data Management** page, or upload more right here using the 📎 button.`);
      } else {
        lines.push(`You haven't uploaded any data files yet.\n`);
        lines.push(`You can upload spreadsheets, reports, or documents two ways:`);
        lines.push(`1. Use the 📎 button right here in chat — I'll read it and use it in our conversation`);
        lines.push(`2. Go to the **Data Management** page for a full upload with automatic system mapping`);
      }
    }

    // ASSESSMENT PROGRESS
    else if (/\b(assess|progress|which.*done|which.*left|completed|remaining)\b/i.test(ep)) {
      const assessed = Object.values(ctx.systems).filter(s => s.assessed);
      const notAssessed = Object.values(ctx.systems).filter(s => !s.assessed);
      lines.push(`**Assessment progress: ${assessed.length} of 6 complete**\n`);
      if (assessed.length > 0) {
        lines.push(`✅ **Done:**`);
        assessed.forEach(s => lines.push(`  - ${s.name}: ${s.score}%`));
      }
      if (notAssessed.length > 0) {
        lines.push(`\n📋 **Still to go:**`);
        notAssessed.forEach(s => lines.push(`  - ${s.name}`));
        lines.push(`\nEach assessment takes about 10–15 minutes. Head to the **Assessments** tab to continue.`);
      } else {
        lines.push(`\n🎉 All six systems assessed! You now have a complete picture.`);
      }
    }

    // REPORT / ARCHIVE / SAVED
    else if (/\b(report|archive|saved|history|past|previous|export|pdf)\b/i.test(ep)) {
      lines.push(`**Reports & Archive**\n`);
      if (ctx.assessedCount > 0) {
        lines.push(`You can generate and download reports in two places:\n`);
        lines.push(`- **Reports** page — full PDF report covering all your assessment results, sub-scores, and recommendations`);
        lines.push(`- **Ultra View** — deep-dive PDF for any individual system\n`);
        lines.push(`Your assessment history is saved in the **Archive** tab, where you can see how your scores have changed over time.`);
      } else {
        lines.push(`Once you complete assessments, you'll be able to generate PDF reports and view your history in the **Archive** tab.`);
      }
    }

    // TEAM
    else if (/\b(team|member|employee|staff|people|colleague|invite)\b/i.test(ep)) {
      lines.push(`**Team management** is handled on the **Team** page in the sidebar.\n`);
      lines.push(`From there you can invite team members, assign roles, and manage access to the platform.`);
    }

    // SCORES / HEALTH / OVERVIEW (broad — after all specific topics)
    else if (/\b(health|overview|how.*doing|how.*we|status|standing|performance|score)\b/i.test(ep)) {
      if (ctx.assessedCount > 0) {
        lines.push(`**Your organisation's health: ${ctx.overallHealth}%** (based on ${ctx.assessedCount} of 6 systems)\n`);
        Object.values(ctx.systems).filter(s => s.assessed).sort((a, b) => b.score - a.score).forEach(sys => {
          const icon = sys.score > 80 ? '✅' : sys.score > 60 ? '⚠️' : '🚨';
          lines.push(`${icon} **${sys.name}**: ${sys.score}%${sys.interpretation ? ` — ${sys.interpretation}` : ''}`);
        });
        const unassessed = Object.values(ctx.systems).filter(s => !s.assessed);
        if (unassessed.length > 0) lines.push(`\n📋 **Not yet assessed:** ${unassessed.map(s => s.name).join(', ')}`);
        if (ctx.weakest && ctx.strongest && ctx.weakest.name !== ctx.strongest.name) {
          lines.push(`\nYour biggest opportunity for improvement is **${ctx.weakest.name}** at ${ctx.weakest.score}%. I'd start there.`);
        }
      } else {
        lines.push(`You haven't completed any assessments yet, so I don't have scores to show you.\n`);
        lines.push(`Head to the **Assessments** tab in the sidebar and work through your first system — it takes about 10–15 minutes. Once you do, I'll be able to give you a full health breakdown.`);
      }
    }

    // GENERAL CATCH-ALL
    else {
      if (ctx.assessedCount > 0) {
        lines.push(`Here's a snapshot of where things stand:\n`);
        lines.push(`📊 **Overall Health:** ${ctx.overallHealth}% (${ctx.assessedCount}/6 systems assessed)`);
        if (ctx.assessedCount > 1) {
          if (ctx.weakest && ctx.weakest.score < 60) lines.push(`⚠️ **Needs attention:** ${ctx.weakest.name} (${ctx.weakest.score}%)`);
          if (ctx.strongest) lines.push(`✅ **Going well:** ${ctx.strongest.name} (${ctx.strongest.score}%)`);
        } else {
          // Only 1 system — don't repeat it as both weakest and strongest
          const only = Object.values(ctx.systems).find(s => s.assessed);
          if (only) {
            const icon = only.score >= 70 ? '✅' : only.score >= 50 ? '⚠️' : '🚨';
            lines.push(`${icon} **${only.name}:** ${only.score}%`);
            lines.push(`\nYou've assessed 1 of 6 systems so far. Complete more to get a fuller picture.`);
          }
        }
        if (ctx.actions.length > 0) {
          const pending = ctx.actions.filter(a => a.status !== 'completed').length;
          if (pending > 0) lines.push(`📋 **Open action items:** ${pending}`);
        }
        if (ctx.financials) lines.push(`💰 **Financial data:** Available`);
        if (ctx.uploads.length > 0) lines.push(`📁 **Uploaded files:** ${ctx.uploads.length}`);
        lines.push(`\nWhat would you like to dig into? I can talk about any of your six systems, your financials, benchmarks, forecasts, action items, or help you work through a decision.`);
      } else {
        lines.push(`Welcome! I'm X-ULTRA — your AI advisor on this platform.\n`);
        lines.push(`Right now I don't have much data to work with because you haven't completed any assessments yet. Here's how to get started:\n`);
        lines.push(`1. **Assessments** — Run your first system assessment (takes ~15 minutes)`);
        lines.push(`2. **Billing** — Enter your financial metrics so I can link them to your systems`);
        lines.push(`3. **Data Management** — Upload spreadsheets or reports for deeper analysis\n`);
        lines.push(`Once you've done even one assessment, I'll be able to give you actionable insights across your entire dashboard.`);
      }
    }

    } // end else (not decision/problem)


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

YOU HAVE ACCESS TO THE CEO'S FULL DASHBOARD DATA:
- Assessment scores for each of the 6 systems (Interdependency, Orchestration, Investigation, Interpretation, Illustration, Inlignment)
- Financial metrics (revenue, costs, margins, retention, turnover)
- Action items and recommendations
- Uploaded documents and data files
- Industry benchmarks and forecasts
- Recent AI insights

GUIDE FOR NAVIGATING THE PLATFORM:
- Ultra View: Deep-dive into each system with sub-scores, case studies, and recommendations
- Data Management: Upload spreadsheets and documents for analysis
- Partner Dashboard → Forecast & Scenarios: Interactive "what if" simulator
- Partner Dashboard → Recommendations & Actions: Task management and priorities
- Partner Dashboard → Industry Benchmarks: Compare against industry averages
- Assessments: Run or continue system assessments
- Reports: Generate PDF reports of results
- Billing: Financial metrics linked to systems
- Archive: Historical assessment data and trends
- Team: Invite and manage team members

HOW YOU SHOULD BEHAVE:
- Write like a trusted advisor, not a machine. Be warm, direct, and practical.
- Use plain English. No jargon, no corporate buzzwords, no filler.
- When the CEO asks about a decision or problem, ask 2-3 clarifying questions first.
- Always reference the user's actual data and scores when they are available.
- When relevant, point the CEO to the right page on the dashboard for more detail.

WHEN YOU GIVE ADVICE:
- Present 3 clear options when the situation calls for it.
- For each option: what to do, roughly how long, and what could go right or wrong.

RULES:
- Primarily Nigerian and African business context. Reference relevant local examples.
- If you do not have enough data, say so honestly.
- Keep responses focused — a CEO's time is valuable.`;

      // Build rich context from ALL dashboard sections
      const fullContext = buildContextString();

      // Include RAG hits from uploaded docs
      const storedDocs = loadStoredDocs(orgId);
      let ragContext = "";
      if (storedDocs.length > 0) {
        const docIndex = buildIndex(storedDocs);
        const docHits = queryIndex(docIndex, text, 4);
        if (docHits.length > 0) {
          ragContext = `\n\nRELEVANT UPLOADED DOCUMENT EXCERPTS:\n${docHits.map(h => `- [${h.doc.meta.source || 'doc'}]: ${h.doc.text.slice(0, 250)}`).join('\n')}`;
        }
      }

      chatPayload = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: `${interviewSystemPrompt}\n\nFULL DASHBOARD SNAPSHOT:\n${fullContext}${ragContext}` },
          ...recentHistory,
          { role: "user", content: text }
        ]
      };

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
    { icon: <FaFileAlt size={16} />, label: "What should I focus on first?", prompt: "Based on our scores and action items, what are the most important things I should be working on right now?" },
    { icon: <FaCube size={16} />, label: "Show me my financial picture", prompt: "Walk me through our financial metrics and how they connect to our system scores" },
    { icon: <FaCommentDots size={16} />, label: "Help me think through a decision", prompt: "I have a decision I need to make and I'd like to talk it through with you" }
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
                    className={`p-2.5 rounded-lg cursor-pointer ${darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 border border-gray-100'}`}
                    onClick={() => setExpandedArchiveId(expandedArchiveId === item.id ? null : item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium ${expandedArchiveId === item.id ? '' : 'truncate'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                        item.priority === 'Critical' ? 'bg-red-100 text-red-700'
                          : item.priority?.includes('High') ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{item.priority}</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${expandedArchiveId === item.id ? '' : 'line-clamp-2'} ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {expandedArchiveId === item.id ? item.content : item.summary}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {expandedArchiveId === item.id ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
                        {expandedArchiveId === item.id ? 'Collapse' : 'Read'}
                      </span>
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
