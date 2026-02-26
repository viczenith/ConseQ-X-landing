"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Logo3D from "./assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaStar, FaRegStar, FaTimes, FaCheck, FaDownload, FaPlay, FaEye, FaTrash, FaExclamationCircle, FaSignOutAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { systems } from "./data/systems";
import InterdependencySystem from "./pages/Systems/InterdependencySystem";
import SystemOfInlignment from "./pages/Systems/SystemOfInlignment";
import SystemOfInvestigation from "./pages/Systems/SystemOfInvestigation";
import SystemOfOrchestration from "./pages/Systems/SystemOfOrchestration";
import SystemOfIllustration from "./pages/Systems/SystemOfIllustration";
import SystemOfInterpretation from "./pages/Systems/SystemOfInterpretation";

import { generateSystemReport } from "./utils/aiPromptGenerator";
import { calculateSubAssessmentScore, getSystemInterpretation } from "./utils/scoringUtils";
import { downloadPDFReport, buildPDFBlobUrl } from "./utils/pdfReportBuilder";

import useFreemium from "./hooks/useFreemium";
import UpsellModal from "./components/UpsellModal";
import { useAuth } from "./contexts/AuthContext";
import ChatSection from "./AssessmentChatMessages";

// export default function AssessmentPlatform() {
export default function AssessmentPlatform(props) {
  const { 
    showClientInfo = true, 
    onQuestionAnswered,
    onSystemStart,
    onAnswersChange,
    customSystems,
    ceoPartnerMode = false,
    orgId,
    initialAnswers = {},
    enableRealTimeTracking = false,
    systemStates: externalSystemStates,
    onRunAnalysis,
    onViewResults,
    onRemoveResult,
  } = props || {};
  
  // NAV, DARK MODE, STEPS, ETC.
  const [navScrolled, setNavScrolled] = useState(false);
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ organization: "", role: "", email: "" });
  const [darkMode, setDarkMode] = useState(props.darkMode !== undefined ? props.darkMode : false);
  const [currentSystem, setCurrentSystem] = useState(null);
  const [answers, setAnswers] = useState(initialAnswers);

  // ─── Visitor / user session ───
  const [visitorId, setVisitorId] = useState(() => localStorage.getItem("conseqx_visitor_id") || "");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returningUser, setReturningUser] = useState(false);
  const [previousAssessments, setPreviousAssessments] = useState([]);
  const chatSaveTimerRef = useRef(null);

  // Sync answers when initialAnswers changes
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers((prev) => {
        // Only update if current answers are empty but initialAnswers has data
        if (Object.keys(prev).length === 0) return initialAnswers;
        return prev;
      });
    }
  }, [initialAnswers]);
  const [resultsType, setResultsType] = useState("all");
  const [activeModal, setActiveModal] = useState(null);

  // AI ANALYSIS STATE
  const [analysisContent, setAnalysisContent] = useState(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [rating, setRating] = useState(0);
  const [scores, setScores] = useState({});

  // Chat state (integrated)
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const chatTextareaRef = useRef(null);
  const [uploadedFileChat, setUploadedFileChat] = useState(null);
  const chatFileInputRef = useRef(null);

  // Auth & Freemium UI state
  const [showRegisterCTA, setShowRegisterCTA] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState({ orgName: "", name: "", email: "" });
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  // CEO CTA modal state
  const [showCEOPrompt, setShowCEOPrompt] = useState(false);
  const [ceoPhone, setCeoPhone] = useState("");
  const [ceoPassword, setCeoPassword] = useState("");
  const [ceoConfirmPassword, setCeoConfirmPassword] = useState("");
  const [ceoLoginPassword, setCeoLoginPassword] = useState("");
  const [ceoIsLoginMode, setCeoIsLoginMode] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [ceoAuthError, setCeoAuthError] = useState(null);
  const [isProcessingCeoAuth, setIsProcessingCeoAuth] = useState(false);

  // Finance modal & compute
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeInputs, setFinanceInputs] = useState({ annualRevenue: "", operatingCost: "", profitMargin: "", costDelays: "", costErrors: "", retentionRate: "", innovationBudget: "", turnoverRate: "" });
  const [financeAnalysis, setFinanceAnalysis] = useState(null);

  // Freemium expired modal state
  const [showFreemiumExpired, setShowFreemiumExpired] = useState(false);

  // ---------- Hooks ----------
  const auth = useAuth();
  const freemium = useFreemium({ freemiumDurationHours: 24, maxRunsPerDay: 3 });
  const navigate = useNavigate();

  // ======= Permission / freemium helpers =======
  const FREE_RUNS_KEY = "conseqx_free_runs_v1";
  const FREE_RUNS_LIMIT = 3;

  function isOrgPremium() {
    const org = auth?.org || (auth && auth.user && auth.user.org);
    if (!org || !org.subscription) return false;
    return org.subscription.tier === "premium" && (org.subscription.expiresAt || 0) > Date.now();
  }

  function ensureAuthOrPrompt() {
    if (!auth || !auth.user) {
      setAuthMode("register");
      setAuthForm({ orgName: userInfo.organization || "", name: userInfo.role || "", email: userInfo.email || "" });
      setShowAuthModal(true);
      return false;
    }
    return true;
  }

  function ensurePremiumOrUpsell() {
    if (!isOrgPremium()) {
      setShowUpsellModal(true);
      return false;
    }
    return true;
  }

  function getOrgIdForStorage() {
    const u = auth?.user || auth?.user;
    const orgId = (auth && auth.org && auth.org.id) || (u && u.orgId) || (u && u.id) || "anonymous";
    return orgId;
  }

  function canRunFreemiumAction() {
    if (isOrgPremium()) return { allowed: true, usesLeft: Infinity };
    const orgId = getOrgIdForStorage();
    let raw = localStorage.getItem(FREE_RUNS_KEY);
    let state = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    const orgState = state[orgId] || {};
    const expiresAt = orgState.expiresAt || (freemium?.expiresAt || (Date.now() + 1000 * 60 * 60 * 24));
    if (!orgState.expiresAt || expiresAt <= now) {
      state[orgId] = { expiresAt: freemium?.expiresAt || (Date.now() + 1000 * 60 * 60 * 24), count: 0 };
      localStorage.setItem(FREE_RUNS_KEY, JSON.stringify(state));
      return { allowed: true, usesLeft: FREE_RUNS_LIMIT };
    }
    const count = orgState.count || 0;
    const usesLeft = Math.max(0, FREE_RUNS_LIMIT - count);
    return { allowed: count < FREE_RUNS_LIMIT, usesLeft, count, expiresAt };
  }

  function recordFreemiumRun() {
    if (isOrgPremium()) return { remaining: Infinity, count: 0, expiresAt: Infinity };
    const orgId = getOrgIdForStorage();
    let raw = localStorage.getItem(FREE_RUNS_KEY);
    let state = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    const defaultExp = freemium?.expiresAt || (now + 1000 * 60 * 60 * 24);
    const cur = state[orgId] || { expiresAt: defaultExp, count: 0 };
    let newCur;
    if (!cur.expiresAt || cur.expiresAt <= now) {
      newCur = { expiresAt: defaultExp, count: 1 };
    } else {
      newCur = { expiresAt: cur.expiresAt, count: (cur.count || 0) + 1 };
    }
    state[orgId] = newCur;
    localStorage.setItem(FREE_RUNS_KEY, JSON.stringify(state));

    // also decrement global hint counter if available
    try {
      if (freemium && typeof freemium.consumeRunLocal === "function") freemium.consumeRunLocal();
    } catch (e) {
      // ignore
    }

    const remaining = Math.max(0, FREE_RUNS_LIMIT - newCur.count);
    return { remaining, count: newCur.count, expiresAt: newCur.expiresAt };
  }


  function openFreemiumExpiredModal() {
    setShowUpsellModal(false);
    setShowAuthModal(false);
    setShowCEOPrompt(false);
    setActiveModal(null);
    setShowFinanceModal(false);
    setShowRegisterCTA(false);
    setShowFreemiumExpired(true);
  }

  // ---------- Markdown renderers ----------
  const MarkdownComponents = {
    h1: ({ node, ...props }) => <h1 className={`text-3xl font-bold mt-6 mb-4 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} {...props} />,
    h2: ({ node, ...props }) => <h2 className={`text-2xl font-bold mt-5 mb-3 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} {...props} />,
    h3: ({ node, ...props }) => <h3 className={`text-xl font-bold mt-4 mb-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} {...props} />,
    table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse shadow-lg" {...props} /></div>,
    thead: ({ node, ...props }) => <thead className={`${darkMode ? "bg-gray-800" : "bg-gray-100"}`} {...props} />,
    th: ({ node, ...props }) => <th className={`px-4 py-3 text-left font-bold ${darkMode ? "border-gray-700 text-yellow-400" : "border-gray-300 text-yellow-600"}`} {...props} />,
    td: ({ node, ...props }) => <td className={`px-4 py-2 border ${darkMode ? "border-gray-700" : "border-gray-300"}`} {...props} />,
    tr: ({ node, ...props }) => <tr className={`${darkMode ? "even:bg-gray-800/50 hover:bg-gray-700/30" : "even:bg-gray-50 hover:bg-gray-100"}`} {...props} />,
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter style={darkMode ? materialDark : materialLight} language={match[1]} PreTag="div" {...props} className="rounded-lg mb-4">
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={`px-1.5 py-0.5 rounded ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-yellow-100 text-yellow-800"}`} {...props}>
          {children}
        </code>
      );
    },
    a: ({ node, ...props }) => <a className={`font-medium ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} underline`} target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 ${darkMode ? "border-yellow-500" : "border-yellow-400"} pl-4 italic my-4`} {...props} />,
    ul: ({ node, ...props }) => <ul className={`list-disc pl-8 my-3 space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`} {...props} />,
    ol: ({ node, ...props }) => <ol className={`list-decimal pl-8 my-3 space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`} {...props} />,
    li: ({ node, ...props }) => <li className="py-0.5" {...props} />,
    p: ({ node, ...props }) => <p className={`my-3 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`} {...props} />,
    div: ({ node, className, ...props }) => {
      if (className === "health-status") {
        return (
          <div className={`relative my-6 p-5 rounded-lg border-l-4 ${darkMode ? "border-blue-400 bg-gray-800/50" : "border-blue-500 bg-blue-50"}`}>
            <div className="absolute top-0 left-0 text-6xl opacity-10 font-bold">"</div>
            <p className={`italic text-lg ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{props.children}</p>
          </div>
        );
      }
      return <div {...props} />;
    },
    em: ({ node, ...props }) => <span className="italic text-yellow-500" {...props} />,
    strong: ({ node, ...props }) => <strong className={`font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} {...props} />,
  };

  // Navbar scroll effect
  const handleScroll = () => setNavScrolled(window.scrollY > 50);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("darkMode", next ? "true" : "false");
  };
  useEffect(() => {
    // If darkMode is provided via props, use it; otherwise check localStorage
    if (props.darkMode !== undefined) {
      setDarkMode(props.darkMode);
      document.documentElement.classList.toggle("dark", props.darkMode);
    } else {
      const saved = localStorage.getItem("darkMode") === "true";
      setDarkMode(saved);
      document.documentElement.classList.toggle("dark", saved);
    }
  }, [props.darkMode]);

  // Use customSystems if provided, otherwise default systems
  const activeSystems = useMemo(() => {
    return customSystems || systems;
  }, [customSystems]);

  // Wrapped setAnswers for real-time tracking
  const setAnswersWithTracking = useMemo(() => {
    return (newAnswersOrUpdater) => {
      setAnswers((prev) => {
        const updated = typeof newAnswersOrUpdater === 'function' 
          ? newAnswersOrUpdater(prev) 
          : newAnswersOrUpdater;

        // Notify parent of answer state change
        if (onAnswersChange) {
          try {
            onAnswersChange(updated);
          } catch (err) {
            console.warn('Failed to call onAnswersChange:', err);
          }
        }

        // Emit real-time tracking events if enabled
        if (enableRealTimeTracking && currentSystem && onQuestionAnswered) {
          // Calculate total questions and answered count for current system
          const systemId = currentSystem.id;
          const systemAnswers = updated;
          
          // Count total questions across all sub-assessments
          const totalQuestions = currentSystem.subAssessments?.reduce((sum, sub) => {
            return sum + (sub.questions?.length || 0);
          }, 0) || 0;

          // Count answered questions
          let answeredCount = 0;
          currentSystem.subAssessments?.forEach((sub) => {
            const subAnswers = systemAnswers[sub.id] || {};
            answeredCount += Object.keys(subAnswers).filter(key => {
              const answer = subAnswers[key];
              return answer !== null && answer !== undefined && answer !== '';
            }).length;
          });

          // Find the most recently answered question
          const lastSubAssessment = currentSystem.subAssessments?.find(sub => 
            systemAnswers[sub.id] && Object.keys(systemAnswers[sub.id]).length > 0
          );
          const lastQuestionId = lastSubAssessment ? 
            Object.keys(systemAnswers[lastSubAssessment.id]).pop() : null;

          // Emit the event
          try {
            onQuestionAnswered({
              systemId,
              questionId: lastQuestionId || `${systemId}_q_${answeredCount}`,
              answer: lastQuestionId ? systemAnswers[lastSubAssessment.id][lastQuestionId] : null,
              totalQuestions,
              answeredCount,
              timestamp: Date.now()
            });
          } catch (err) {
            console.warn('Failed to emit question answered event:', err);
          }
        }

        return updated;
      });
    };
  }, [enableRealTimeTracking, currentSystem, onQuestionAnswered, onAnswersChange]);

  // Emit system start event when system is selected
  useEffect(() => {
    if (currentSystem && onSystemStart && enableRealTimeTracking) {
      try {
        onSystemStart(currentSystem.id);
      } catch (err) {
        console.warn('Failed to emit system start event:', err);
      }
    }
  }, [currentSystem, onSystemStart, enableRealTimeTracking]);

  // ─── API base helper ───
  const apiBase = useMemo(() => String(process.env.REACT_APP_API_BASE_URL || localStorage.getItem("conseqx_admin_api_base_v1") || "http://127.0.0.1:8000").replace(/\/$/, ""), []);

  // ─── Email validation ───
  const isValidEmail = (email) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);

  // ─── Session restore: if visitorId exists in localStorage, load user data on mount ───
  useEffect(() => {
    const savedEmail = localStorage.getItem("conseqx_visitor_email");
    const savedOrg = localStorage.getItem("conseqx_visitor_org");
    const savedRole = localStorage.getItem("conseqx_visitor_role");
    if (savedEmail) {
      setUserInfo(prev => ({
        organization: prev.organization || savedOrg || "",
        role: prev.role || savedRole || "",
        email: prev.email || savedEmail || "",
      }));
    }
  }, []);

  // ─── Chat auto-save (debounced: saves 3s after last message change) ───
  useEffect(() => {
    if (!visitorId || chatMessages.length === 0) return;
    if (chatSaveTimerRef.current) clearTimeout(chatSaveTimerRef.current);
    chatSaveTimerRef.current = setTimeout(() => {
      fetch(`${apiBase}/api/visitors/save-chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_id: visitorId, messages: chatMessages }),
      }).catch(() => {});
    }, 3000);
    return () => { if (chatSaveTimerRef.current) clearTimeout(chatSaveTimerRef.current); };
  }, [chatMessages, visitorId, apiBase]);

  // ─── Save assessment to backend after analysis is generated ───
  const saveAssessmentToBackend = (scoresObj, systemIds, analysisSummary) => {
    if (!visitorId) return;
    fetch(`${apiBase}/api/visitors/save-assessment/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_id: visitorId,
        scores: scoresObj,
        systems_completed: systemIds,
        analysis_summary: (analysisSummary || "").slice(0, 2000),
      }),
    }).catch(() => {});
  };

  // Step handlers
  const handleUserInfoSubmit = async () => {
    // ── Validation ──
    const errors = {};
    if (!userInfo.organization.trim()) errors.organization = "Organization name is required.";
    if (!userInfo.email.trim()) errors.email = "Email address is required.";
    else if (!isValidEmail(userInfo.email.trim())) errors.email = "Please enter a valid email address.";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setIsSubmitting(true);

    setAuthForm({ orgName: userInfo.organization || "", name: userInfo.role || "", email: userInfo.email || "" });

    try {
      const res = await fetch(`${apiBase}/api/visitors/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          organization_name: userInfo.organization.trim(),
          role: userInfo.role.trim(),
          email: userInfo.email.trim().toLowerCase(),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setFormErrors({ email: json.error || "Something went wrong. Try again." });
        setIsSubmitting(false);
        return;
      }

      // Store visitor session
      const vid = json.visitor_id;
      setVisitorId(vid);
      localStorage.setItem("conseqx_visitor_id", vid);
      localStorage.setItem("conseqx_visitor_email", userInfo.email.trim().toLowerCase());
      localStorage.setItem("conseqx_visitor_org", userInfo.organization.trim());
      localStorage.setItem("conseqx_visitor_role", userInfo.role.trim());

      // If returning user, load their previous data
      if (json.returning && json.visitor) {
        setReturningUser(true);
        const v = json.visitor;

        // Restore previous assessments list
        if (v.assessment_data && v.assessment_data.length > 0) {
          setPreviousAssessments(v.assessment_data);
        }

        // Restore chat history into chat
        if (v.chat_history && v.chat_history.length > 0) {
          setChatMessages(v.chat_history);
        }

        // Add welcome-back message to chat
        const welcomeMsg = {
          id: `welcome-back-${Date.now()}`,
          role: "assistant",
          text: `## Welcome Back, ${userInfo.role || "there"}!\n\nGood to see you again from **${v.organization_name}**.\n\n${v.assessment_count > 0 ? `You have **${v.assessment_count}** previous assessment${v.assessment_count > 1 ? "s" : ""} on record**. Your conversation history has been restored.\n\nPick up where you left off or start a fresh assessment.` : "Your previous conversation has been restored. Let\u2019s continue where you left off."}`,
          timestamp: new Date().toISOString(),
        };
        setChatMessages(prev => [...prev, welcomeMsg]);
      }

      setShowRegisterCTA(true);
    } catch {
      // If backend is down, proceed anyway (graceful degradation)
      setShowRegisterCTA(true);
    } finally {
      setIsSubmitting(false);
    }

    setStep(1);
  };
  const handleSystemSelect = (system) => {
    setCurrentSystem(system);
    setStep(3);
  };
  const handleResultsRequest = () => {
    setActiveModal("results");
    const completed = activeSystems.filter((sys) => sys.subAssessments.every((sub) => answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length)).map((sys) => sys.id);
    setSelectedSystems(completed);
  };
  const handleBookingRequest = () => setActiveModal("booking");

  // Progress calculations
  const completionPercentage = () => {
    const done = activeSystems.filter((sys) => sys.subAssessments.every((sub) => answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length)).length;
    return Math.round((done / activeSystems.length) * 100);
  };
  const calculateSystemCompletion = (system) => {
    const done = system.subAssessments.filter((sub) => answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length).length;
    return { isCompleted: done === system.subAssessments.length, answered: done, total: system.subAssessments.length };
  };
  const toggleSystemSelection = (id) => setSelectedSystems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Finance handlers
  const openFinanceModal = () => {
    setFinanceAnalysis(null);
    setShowFinanceModal(true);
  };
  const closeFinanceModal = () => setShowFinanceModal(false);
  const handleFinanceChange = (e) => {
    const { name, value } = e.target;
    setFinanceInputs((prev) => ({ ...prev, [name]: value }));
  };

  // computeFinancialImpact
  const computeFinancialImpact = () => {
    const result = "Financial Impact Overview:\n- Estimated annual savings: NGN 1,200,000\n- Efficiency gains 12%\n- Suggested next steps: Allocate innovation budget to pilot automation."; // placeholder
    setFinanceAnalysis(result);

    const assistantMsg = {
      id: `finance-${Date.now()}`,
      role: "assistant",
      text: `Financial Impact Analysis:\n\n${result}`,
      timestamp: new Date().toISOString(),
      isAnalysis: true,
    };
    setChatMessages((prev) => [...prev, assistantMsg]);
    setShowFinanceModal(false);
  };

  // Chat helpers
  function handleAttachClickForChat() {
    if (chatFileInputRef.current) chatFileInputRef.current.click();
  }
  function handleUploadFileForChat(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFileChat({ name: file.name, size: file.size, url });
  }

  // AI analysis
  const generateAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const scoresObj = {};
      const completedSystems = activeSystems.filter((sys) =>
        sys.subAssessments.every((sub) => answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length)
      );

      completedSystems.forEach((system) => {
        if (resultsType === "specific" && !selectedSystems.includes(system.id)) return;
        const systemScores = { systemScore: 0, maxSystemScore: 0, subAssessments: {} };
        system.subAssessments.forEach((sub) => {
          const { score, interpretation } = calculateSubAssessmentScore(sub, answers[sub.id] || {});
          const maxSub = Math.max(...sub.scoringRubric.map((r) => r.score)) * sub.questions.length;
          systemScores.subAssessments[sub.id] = { score, maxScore: maxSub, interpretation };
          systemScores.systemScore += score;
          systemScores.maxSystemScore += maxSub;
        });
        systemScores.interpretation = getSystemInterpretation(system, systemScores.systemScore);
        scoresObj[system.id] = systemScores;
      });

      setScores(scoresObj);

      // freemium gating - final check (caller also checks)
      const can = canRunFreemiumAction();
      if (!can.allowed) {
        openFreemiumExpiredModal();
        setGeneratingAnalysis(false);
        return;
      }

      // get the analysis text (LLM or mock)
      const analysisText = await generateSystemReport({
        scores: scoresObj,
        userInfo,
        selectedSystems: resultsType === "specific" ? selectedSystems : completedSystems.map((sys) => sys.id),
      });

      const finalText = analysisText || "Mock analysis (no LLM configured)";

      // determine title for the report
      let title = "Assessment Report";
      if (resultsType === "specific" && selectedSystems.length === 1) {
        const s = systems.find((x) => x.id === selectedSystems[0]);
        title = s ? s.title : title;
      } else if (resultsType === "all") {
        title = "Full Assessment Report";
      } else if (resultsType === "specific" && selectedSystems.length > 1) {
        const names = selectedSystems
          .map((id) => systems.find((s) => s.id === id)?.title || id)
          .filter(Boolean);
        title = names.join(", ");
      } else if (completedSystems.length === 1) {
        title = completedSystems[0].title;
      }

      // ─── IMMEDIATELY inject the full analysis into chat ───
      const analysisMsg = {
        id: `analysis-text-${Date.now()}`,
        role: "assistant",
        text: `## \u{1F4CA} ConseQ-X Ultra Analysis \u2014 ${title}\n\n${finalText}`,
        timestamp: new Date().toISOString(),
        isAnalysis: true,
      };
      setChatMessages((prev) => [...prev, analysisMsg]);

      // record the run
      const record = recordFreemiumRun();
      if (record.remaining <= 0) {
        openFreemiumExpiredModal();
      }

      setAnalysisContent(finalText);
      setActiveModal("results");

      // ─── Persist assessment to backend ───
      const systemIds = resultsType === "specific" ? selectedSystems : completedSystems.map((sys) => sys.id);
      saveAssessmentToBackend(scoresObj, systemIds, finalText);

      // ─── Background: generate professional PDF and attach as bonus message ───
      setTimeout(() => {
        try {
          const blobUrl = buildPDFBlobUrl({ scores: scoresObj, userInfo, analysisText: finalText });
          const pdfMsg = {
            id: `analysis-pdf-${Date.now()}`,
            role: "assistant",
            text: `\u{1F4C4} **PDF Report Generated** \u2014 Your detailed ConseQ-X report for **${title}** is ready for download. Click the file below to save it to your device.`,
            timestamp: new Date().toISOString(),
            file: { name: `${(userInfo?.organization || title).replace(/\s+/g, "_")}_ConseQX_Report.pdf`, url: blobUrl },
            isAnalysis: true,
          };
          setChatMessages((prev) => [...prev, pdfMsg]);
        } catch (err) {
          console.error("PDF generation error (analysis already displayed in chat):", err);
        }
      }, 400);
    } catch (error) {
      console.error("AI GENERATION ERROR:", error);
      const errorText = error?.message || "Error generating analysis";
      setAnalysisContent(errorText);

      // ─── Even on error, inject a message so the user sees something ───
      const errorMsg = {
        id: `analysis-error-${Date.now()}`,
        role: "assistant",
        text: `## \u26A0\uFE0F Analysis Error\n\nSomething went wrong while generating your analysis:\n\n> ${errorText}\n\nPlease try again by clicking **"Run ConseQ-X Ultra Analysis"** or ask me a question using the helper buttons below.`,
        timestamp: new Date().toISOString(),
        isAnalysis: true,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  async function handleRunAnalysisClick() {
    const can = canRunFreemiumAction();
    if (!can.allowed) {
      openFreemiumExpiredModal();
      return;
    }
    const completedSystems = systems.filter((sys) =>
      sys.subAssessments.every((sub) => answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length)
    );
    if (completedSystems.length === 0) {
      setActiveModal("results");
      setAnalysisContent("Please complete at least one system before running the analysis.");
      return;
    }
    await generateAnalysis();
  }


  function handleDownloadPDF() {
    if (!ensureAuthOrPrompt()) return;
    if (!isOrgPremium()) {
      setShowUpsellModal(true);
      return;
    }
    downloadPDF();
  }

  function handleScheduleClick() {
    if (!ensureAuthOrPrompt()) return;
    setActiveModal("booking");
  }

  function handleOpenFinance() {
    if (!ensureAuthOrPrompt()) return;
    openFinanceModal();
  }

  // Download professional PDF report directly to device
  const downloadPDF = () => {
    try {
      downloadPDFReport({ scores, userInfo, analysisText: analysisContent });
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  // Auth modal handlers
  const openAuthModal = (mode = "register") => {
    setAuthMode(mode);
    setAuthForm({ orgName: userInfo.organization || "", name: userInfo.role || "", email: userInfo.email || "" });
    setShowAuthModal(true);
  };
  const closeAuthModal = () => setShowAuthModal(false);

  async function handleAuthSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    const email = (authForm.email || "").trim();
    if (!email) return;
    if (authMode === "register") {
      try {
        const orgName = authForm.orgName || userInfo.organization || "Personal Org";
        const name = authForm.name || userInfo.role || "CEO";
        await auth.register?.({ orgName, ceoName: name, email });
        setShowAuthModal(false);
        setShowRegisterCTA(false);
      } catch (err) {
        console.error("Register failed", err);
        try {
          await auth.login?.({ email });
          setShowAuthModal(false);
          setShowRegisterCTA(false);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      try {
        const res = await auth.login?.({ email, password: authForm.password });
        if (!res) {
          const orgName = authForm.orgName || userInfo.organization || "Personal Org";
          const name = authForm.name || userInfo.role || "User";
          await auth.register?.({ orgName, ceoName: name, email });
        }
        setShowAuthModal(false);
        setShowRegisterCTA(false);
      } catch (err) {
        console.error("Login/register fallback error", err);
      }
    }
  }

  // CEO modal handlers
  async function handleRegisterSubmitForCEO({ email, phone, password, orgName, ceoName }) {
    setCeoAuthError(null);
    if (!phone) return setCeoAuthError("Please enter your phone number.");
    if (!password || password.length < 4) return setCeoAuthError("Please enter a password (min 4 chars).");
    setIsProcessingCeoAuth(true);
    try {
      const realOrg = orgName || userInfo.organization || authForm.orgName || "Org";
      const realCeoName = ceoName || userInfo.role || authForm.name || "CEO";
      const realEmail = email || userInfo.email || authForm.email || `ceo@${(realOrg || "org").replace(/\s+/g, "").toLowerCase()}.local`;
      await auth.register?.({ orgName: realOrg, ceoName: realCeoName, email: realEmail, phone, password });
      setShowCEOPrompt(false);
      navigate("/ceo");
    } catch (err) {
      console.error(err);
      setCeoAuthError(err.message || "Registration failed");
    } finally {
      setIsProcessingCeoAuth(false);
    }
  }

  async function handleLoginSubmitForCEO({ email, password, orgName, ceoName, phone }) {
    setCeoAuthError(null);
    if (!email) return setCeoAuthError("Email required.");
    if (!password) return setCeoAuthError("Password required.");
    setIsProcessingCeoAuth(true);
    try {
      await auth.login?.({ email, password, prefillOrgName: orgName || userInfo.organization || authForm.orgName, prefillName: ceoName || userInfo.role || authForm.name });
      setShowCEOPrompt(false);
      navigate("/ceo");
    } catch (err) {
      console.error(err);
      try {
        const realOrg = orgName || userInfo.organization || authForm.orgName || "Org";
        const realCeoName = ceoName || userInfo.role || authForm.name || email.split("@")[0];
        await auth.register?.({ orgName: realOrg, ceoName: realCeoName, email, phone, password });
        setShowCEOPrompt(false);
        navigate("/ceo");
      } catch (e) {
        setCeoAuthError(e.message || "Login failed");
      }
    } finally {
      setIsProcessingCeoAuth(false);
    }
  }

  // GuestRegisterBanner component
  const GuestRegisterBanner = () => {
    if (auth && auth.user) return null;
    if (!showRegisterCTA) return null;

    // prefer explicit darkMode boolean from parent; fallback to document class
    const isDark =
      typeof darkMode !== "undefined"
        ? darkMode
        : typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    // Theme-aware classes
    const bg = isDark ? "bg-gray-900/85 text-gray-100" : "bg-white/95 text-gray-900";
    const borderColor = isDark ? "border-gray-700" : "border-gray-200";
    const descCls = isDark ? "text-xs text-gray-300" : "text-xs text-gray-500";

    const primaryBtn =
      "px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition";
    const primaryTheme = isDark
      ? "bg-amber-400 text-gray-900 hover:bg-amber-500 focus:ring-amber-400"
      : "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300";

    const ghostBtn =
      "px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 transition";
    const ghostTheme = isDark
      ? "border-gray-700 text-gray-300 hover:bg-gray-800/40 focus:ring-gray-600"
      : "border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300";

    return (
      <div className="fixed bottom-5 right-4 z-50">
        <div
          role="region"
          aria-live="polite"
          aria-label="Save your assessment"
          className={`max-w-xs sm:max-w-sm w-full ${bg} rounded-lg p-3 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-lg border-2 border-dotted ${borderColor}`}
        >
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Save your assessment</div>
            <div className={descCls}>Register to save progress, invite team & unlock CEO dashboard</div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <button
              onClick={() => openAuthModal("register")}
              className={`${primaryBtn} ${primaryTheme} w-full sm:w-auto`}
              aria-label="Register to save assessment"
              title="Register to save your assessment"
            >
              Register
            </button>

            
          </div>

          {/* small close for quick dismiss (keeps layout slim) */}
          <button
            onClick={() => setShowRegisterCTA(false)}
            aria-label="Close"
            title="Close"
            className={`ml-auto sm:ml-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 transition ${isDark ? "text-gray-400 hover:text-gray-200 focus:ring-gray-600" : "text-gray-500 hover:text-gray-700 focus:ring-gray-300"}`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };



  // CEODashboard CTA button
  function CEODashboardButton() {
    return (
      <button onClick={() => setShowCEOPrompt(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow hover:opacity-95">
        C-Suite Partner
      </button>
    );
  }

  // CEOPromptModal component
  function CEOPromptModal() {
    const orgName = userInfo.organization || authForm.orgName || "";
    const initialEmail = userInfo.email || authForm.email || "";

    const [localEmail, setLocalEmail] = useState(initialEmail);
    const [localPhone, setLocalPhone] = useState("");
    const [localPassword, setLocalPassword] = useState("");
    const [localConfirmPassword, setLocalConfirmPassword] = useState("");
    const [localLoginPassword, setLocalLoginPassword] = useState("");
    const [localIsLogin, setLocalIsLogin] = useState(ceoIsLoginMode);
    const [localProcessing, setLocalProcessing] = useState(false);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
      if (showCEOPrompt) {
        setLocalEmail(initialEmail || "");
        setLocalPhone("");
        setLocalPassword("");
        setLocalConfirmPassword("");
        setLocalLoginPassword("");
        setLocalIsLogin(ceoIsLoginMode);
        setLocalError(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCEOPrompt, initialEmail]);

    if (!showCEOPrompt) return null;

    const containerBg = darkMode ? "bg-gray-900" : "bg-white";
    const panelBg = darkMode ? "bg-gray-800" : "bg-white";
    const sectionBg = darkMode ? "bg-gray-800" : "bg-white";
    const subtleText = darkMode ? "text-gray-300" : "text-gray-600";
    const strongText = darkMode ? "text-white" : "text-gray-900";
    const cardBorder = darkMode ? "border-gray-700" : "border-gray-200";
    const inputClass = `w-full px-3 py-2 rounded border ${darkMode ? "bg-gray-700 border-gray-600 placeholder-gray-300 text-white" : "bg-white border-gray-300 placeholder-black text-gray-900"}`;
    const smallBtnClass = `px-3 py-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`;
    const primaryBtnClass = `px-4 py-2 rounded ${darkMode ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`;

    // async function submitRegister(e) {
    //   e && e.preventDefault && e.preventDefault();
    //   setLocalError(null);
    //   if (!localPhone) return setLocalError("Phone required");
    //   if (!localPassword || localPassword.length < 4) return setLocalError("Password must be at least 4 characters");
    //   if (localPassword !== localConfirmPassword) return setLocalError("Passwords must match");
    //   setLocalProcessing(true);
    //   await handleRegisterSubmitForCEO({ email: localEmail, phone: localPhone, password: localPassword, orgName, ceoName: userInfo.role || authForm.name });
    //   setLocalProcessing(false);
    // }

    // async function submitLogin(e) {
    //   e && e.preventDefault && e.preventDefault();
    //   setLocalError(null);
    //   if (!localEmail) return setLocalError("Email required");
    //   if (!localLoginPassword) return setLocalError("Password required");
    //   setLocalProcessing(true);
    //   await handleLoginSubmitForCEO({ email: localEmail, password: localLoginPassword, orgName, ceoName: userInfo.role || authForm.name, phone: localPhone });
    //   setLocalProcessing(false);
    // }

    // inside CEOPrompt component
    async function submitRegister(e) {
      e.preventDefault();
      setLocalProcessing(true);
      setLocalError(null);

      // basic client-side checks
      if (!localEmail) {
        setLocalError("Please provide an email.");
        setLocalProcessing(false);
        return;
      }
      if (!localPassword || localPassword !== localConfirmPassword) {
        setLocalError("Passwords are required and must match.");
        setLocalProcessing(false);
        return;
      }

      try {
        // call AuthContext.register (this mock registers and sets current in your context)
        const res = await auth.register({
          orgName: typeof orgName !== "undefined" ? orgName : "Org",
          ceoName: "",
          email: localEmail,
          phone: localPhone || "",
          password: localPassword,
        });

        // registration succeeded. For demo, we DO NOT keep the user signed in.
        // Force sign-out so we end up on the Login view instead.
        try {
          if (typeof auth.logout === "function") {
            auth.logout();
          }
        } catch (logoutErr) {
          console.warn("Logout after register failed (demo):", logoutErr);
        }

        // Switch the modal to the Login form and prefill the email (and optionally password)
        setLocalIsLogin(true);
        // prefill the login email, and optionally the password for convenience
        if (typeof setLocalEmail === "function") setLocalEmail(localEmail);
        if (typeof setLocalLoginPassword === "function") setLocalLoginPassword(localPassword);

        // Give the user a small success message
        setLocalError(null);
        // optionally show a short success toast/banner here (not required)

      } catch (err) {
        console.error("Register error", err);
        setLocalError(err?.message || "Registration failed. Try again.");
      } finally {
        setLocalProcessing(false);
      }
    }


    // inside CEOPrompt component
    async function submitLogin(e) {
      e.preventDefault();
      setLocalProcessing(true);
      setLocalError(null);

      if (!localEmail || !localLoginPassword) {
        setLocalError("Email and password are required.");
        setLocalProcessing(false);
        return;
      }

      try {
        const res = await auth.login({ email: localEmail, password: localLoginPassword });
        if (!res) {
          setLocalError("Invalid credentials or user not found. Try registering.");
          setLocalProcessing(false);
          return;
        }

        // Close the prompt
        try { setShowCEOPrompt(false); } catch (e) { /* ignore if not defined */ }

        // Wait briefly / poll the auth context to ensure AuthProvider has persisted state
        const start = Date.now();
        const timeout = 3000;
        let confirmed = false;
        while (Date.now() - start < timeout) {
          try {
            const cur = auth.getCurrent ? auth.getCurrent() : null;
            if (cur && cur.user && cur.user.email === res.user.email) {
              confirmed = true;
              break;
            }
          } catch (e) {
            // ignore
          }
          // short sleep
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 120));
        }

        // Navigate once confirmed (or anyway after short delay)
        setTimeout(() => navigate("/ceo", { replace: true }), 100);

      } catch (err) {
        console.error("Login error", err);
        setLocalError(err?.message || "Login failed. Try again.");
      } finally {
        setLocalProcessing(false);
      }
    }


    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
        <div className={`w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden ${containerBg}`}>
          {/* header */}
          <div className={`p-6 ${darkMode ? "bg-gradient-to-r from-indigo-700 to-blue-600 text-white" : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white"}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold">You're about to access <span className="font-extrabold">ConseQ-X Ultra</span></h3>
                <p className={`mt-2 text-sm ${subtleText}`}>Please sign in or create an account to continue to the C-Suite dashboard.</p>
              </div>
              <button onClick={() => { setShowCEOPrompt(false); }} className="ml-4 text-white/80 hover:text-white">✕</button>
            </div>
          </div>

          <div className={`p-6 grid grid-cols-1 md:grid-cols-2 gap-6 ${panelBg}`}>
            {/* left info column */}
            <div className="space-y-3">
              <div className={`text-sm ${subtleText}`}>Organization</div>
              <div className={`font-semibold text-lg ${strongText}`}>{orgName || <span className="text-gray-400">Not provided</span>}</div>

              <div className="mt-3 text-sm">
                <div className={subtleText}>Email</div>
                <div className={`font-semibold ${strongText}`}>{initialEmail || <span className="text-gray-400">Not provided</span>}</div>
              </div>

              <div className={`mt-4 text-xs ${subtleText}`}>By continuing you agree to receive onboarding emails. Your data is secured with our end to end security.</div>
            </div>

            {/* right auth panel */}
            <div className={`${sectionBg} p-4 rounded-lg border ${cardBorder}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${strongText}`}>{localIsLogin ? "Sign in" : "Create CEO account"}</div>
                <button
                  className="text-xs"
                  onClick={() => { setLocalIsLogin((m) => !m); setLocalError(null); }}
                  style={{ color: darkMode ? "#93C5FD" : "#2563EB" }}
                >
                  {localIsLogin ? "New? create account" : "Have an account? sign in"}
                </button>
              </div>

              {localError && <div className="text-sm text-red-500 mb-2">{localError}</div>}

              {!localIsLogin ? (
                <form onSubmit={submitRegister} className="space-y-3" autoComplete="off" spellCheck={false}>
                  <label className="text-xs">Phone</label>
                  <input name="phone" value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} placeholder="+234..." className={inputClass} autoFocus />

                  <label className="text-xs">Password</label>
                  <input type="password" name="password" value={localPassword} onChange={(e) => setLocalPassword(e.target.value)} placeholder="Create a password" className={inputClass} />

                  <label className="text-xs">Confirm Password</label>
                  <input type="password" name="confirm" value={localConfirmPassword} onChange={(e) => setLocalConfirmPassword(e.target.value)} placeholder="Confirm password" className={inputClass} />

                  <div className="flex items-center justify-between">
                    <button type="submit" disabled={localProcessing} className={primaryBtnClass}>
                      {localProcessing ? "Registering..." : "Register"}
                    </button>
                    <button type="button" onClick={() => setShowCEOPrompt(false)} className={smallBtnClass}>Cancel</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitLogin} className="space-y-3" autoComplete="off" spellCheck={false}>
                  <label className="text-xs">Email</label>
                  <input name="email" value={localEmail} onChange={(e) => setLocalEmail(e.target.value)} placeholder="you@company.com" className={inputClass} readOnly />

                  <label className="text-xs">Password</label>
                  <input type="password" name="loginPassword" value={localLoginPassword} onChange={(e) => setLocalLoginPassword(e.target.value)} placeholder="Your password" autoFocus className={inputClass} />

                  <div className="flex items-center justify-between">
                    <button type="submit" disabled={localProcessing} className={primaryBtnClass}>
                      {localProcessing ? "Signing in..." : "Login"}
                    </button>
                    <button type="button" onClick={() => setShowCEOPrompt(false)} className={smallBtnClass}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  //
  // FreemiumExpiredModal
  //
  function FreemiumExpiredModal() {
    if (!showFreemiumExpired) return null;

    const containerBg = darkMode ? "bg-gradient-to-tr from-gray-900/90 to-gray-800/90" : "bg-white";
    const cardBg = darkMode ? "bg-gray-800" : "bg-white";
    const textSubtle = darkMode ? "text-gray-300" : "text-gray-600";

    function closeAndDismiss() {
      setShowFreemiumExpired(false);
    }

    function openUpgrade() {
      setShowFreemiumExpired(false);
      setShowUpsellModal(true);
    }

    return (
      <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4">
        <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${containerBg} border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`p-6 ${darkMode ? "bg-gradient-to-r from-gray-900/60 to-gray-800/60 text-white" : "bg-gradient-to-r from-white to-gray-50 text-gray-900"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">You've used all free runs</h3>
                <p className={`mt-2 text-sm ${textSubtle}`}>Your free ConseQ-X analysis limit has been reached for the day. Upgrade to ConseQ-X Ultra to continue enjoying unlimited analysis, CEO dashboard and priority support.</p>
              </div>
              <button onClick={closeAndDismiss} className="text-gray-400 hover:text-gray-600" aria-label="Close"><FaTimes /></button>
            </div>
          </div>

          <div className={`p-6 ${cardBg}`}>
            <ul className={`mb-4 space-y-2 text-sm ${textSubtle}`}>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-500"><FaCheck /></div>
                <div><strong className={`${darkMode ? "text-white" : "text-gray-900"}`}>Unlimited AI analysis</strong> - run as many reports as your team needs.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-500"><FaCheck /></div>
                <div><strong>CEO Dashboard</strong> - executive summary, trends and team invites.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-500"><FaCheck /></div>
                <div><strong>Priority support & forecasting</strong> - get expert time for strategy sessions.</div>
              </li>
            </ul>

            <div className="flex gap-3">
              <button onClick={openUpgrade} className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg">See upgrade options</button>
              <button onClick={closeAndDismiss} className="flex-1 px-4 py-2 border rounded-lg">Maybe later</button>
            </div>

            <div className={`mt-4 text-xs ${textSubtle}`}>
              Need help? <a href="mailto:sales@conseq-x.com" className="underline">sales@conseq-x.com</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // show register CTA after 2 minutes when anonymous
  useEffect(() => {
    if (!auth?.user) {
      const timer = setTimeout(() => setShowRegisterCTA(true), 1000 * 60 * 2);
      return () => clearTimeout(timer);
    }
  }, [auth]);

  // showClientInfo skip step
  useEffect(() => {
    if (showClientInfo === false) {
      setStep((s) => (s === 0 ? 1 : s));
    }
  }, [showClientInfo, setStep]);


  // ---------- Render ----------
  return (
    <div className={`${ceoPartnerMode ? '' : 'min-h-screen'} font-sans overflow-x-hidden transition-colors duration-500 ${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200" : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800"}`}>
      {/* Navigation */}
      <nav className={`${!showClientInfo ? "hidden " : ""}fixed w-full z-50 transition-all duration-500 ${navScrolled ? (darkMode ? "bg-gray-900/90 backdrop-blur-sm py-2 shadow-sm" : "bg-white/90 backdrop-blur-sm py-2 shadow-sm") : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center">
            <motion.img src={Logo3D} alt="ConseQ-X Logo" className="h-16 w-auto mr-3 transition-all duration-500" />
          </motion.div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {auth?.user ? `Signed in as ${auth.user.name || auth.user.email}`
              : userInfo.email ? `Signed in as ${userInfo.organization ? userInfo.organization + " — " : ""}${userInfo.email}`
              : "Not signed in (freemium)"}
            </div>
            {(auth?.user || userInfo.email) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (auth?.logout) auth.logout();
                  navigate("/");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  darkMode
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/40"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
                title="Sign out"
              >
                <FaSignOutAlt size={12} />
                Logout
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-400"}`} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </motion.button>
          </div>
        </div>
      </nav>

      <div className={`${ceoPartnerMode ? 'px-1 sm:px-3 py-2' : `container mx-auto px-4 ${navScrolled ? "pt-24" : "pt-32"} pb-24`}`}>
        <AnimatePresence mode="wait">
          {/* Step 0 */}
          {/* {step === 0 && ( */}
          {showClientInfo !== false && step === 0 && (
            <motion.div key="user-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <div className="text-3xl font-bold text-center mb-4">
                <span className={darkMode ? "text-white" : "text-gray-600"}>Conse<span className="text-yellow-500">Q</span>-Ultra</span>
              </div>

              <h1 className={`text-4xl md:text-5xl font-bold mb-8 text-center ${darkMode ? "text-white" : "text-gray-900"}`}>Organizational Assessment</h1>
              <p className={`text-xl text-center max-w-2xl mx-auto mb-12 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Complete our comprehensive assessment to gain insights into your organisation's health.</p>

              <div className={`bg-gradient-to-br ${darkMode ? "from-gray-800/50 to-gray-900/50 border border-gray-700" : "from-white to-gray-50 border border-gray-200"} rounded-2xl shadow-xl p-8`}>
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>Client Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Organization <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Your organization" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 ${formErrors.organization ? "border-red-500 ring-1 ring-red-500" : ""} ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`} value={userInfo.organization} onChange={(e) => { setUserInfo({ ...userInfo, organization: e.target.value }); setFormErrors(f => ({ ...f, organization: "" })); }} />
                    {formErrors.organization && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FaExclamationCircle size={10} /> {formErrors.organization}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role</label>
                    <input type="text" placeholder="Your role (e.g. CEO, COO)" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`} value={userInfo.role} onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email Address <span className="text-red-500">*</span></label>
                    <input type="email" placeholder="your.email@company.com" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 ${formErrors.email ? "border-red-500 ring-1 ring-red-500" : ""} ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`} value={userInfo.email} onChange={(e) => { setUserInfo({ ...userInfo, email: e.target.value }); setFormErrors(f => ({ ...f, email: "" })); }} onKeyDown={(e) => { if (e.key === "Enter") handleUserInfoSubmit(); }} />
                    {formErrors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FaExclamationCircle size={10} /> {formErrors.email}</p>}
                    <p className={`mt-1 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Use your work or personal email. Returning users will see their previous assessments.</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <motion.button whileHover={{ scale: isSubmitting ? 1 : 1.05, boxShadow: isSubmitting ? "none" : "0 5px 15px rgba(0,0,0,0.2)" }} whileTap={{ scale: isSubmitting ? 1 : 0.95 }} onClick={() => handleUserInfoSubmit()} disabled={isSubmitting || !userInfo.organization || !userInfo.email} className={`px-8 py-3 rounded-lg text-lg font-medium transition flex items-center gap-2 ${!isSubmitting && userInfo.organization && userInfo.email ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                    {isSubmitting && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />}
                    {isSubmitting ? "Verifying..." : "Continue to Assessment"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}>
                <motion.div className="mb-2 text-center">
                  <span className={`font-bold text-sm uppercase tracking-wider ${darkMode ? "text-yellow-400" : "text-yellow-500"}`}>TORIL Assessment System</span>
                </motion.div>
                <motion.h2 className={`text-4xl md:text-5xl font-bold mb-8 text-center ${darkMode ? "text-white" : "text-gray-900"}`}>Organizational Health Assessment</motion.h2>

                <motion.div className={`${ceoPartnerMode ? 'mb-6 p-4 sm:p-6 rounded-xl' : 'mb-12 p-8 rounded-2xl'} shadow-lg ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"}`}>
                  <h3 className={`${ceoPartnerMode ? 'text-lg sm:text-xl' : 'text-2xl'} font-bold mb-3 sm:mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>About the TORIL System</h3>
                  <p className={`${ceoPartnerMode ? 'text-sm sm:text-base' : 'text-lg'} mb-3 sm:mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>The TORIL framework evaluates six critical dimensions of organizational health. Each system represents a key area where alignment, clarity, and effectiveness contribute to overall performance.</p>
                  <p className={`${ceoPartnerMode ? 'text-sm sm:text-base' : 'text-lg'} ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Complete each assessment to receive a comprehensive organizational health report with actionable insights.</p>
                </motion.div>

                {/* CEO button inserted immediately after the "About" section for visibility */}
                {/* <div className="mb-8 flex justify-center">
                  <CEODashboardButton />
                </div> */}

                <motion.div className={`grid grid-cols-1 ${ceoPartnerMode ? 'sm:grid-cols-2 gap-3 sm:gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
                  {activeSystems.map((system) => {
                    const completion = calculateSystemCompletion(system);
                    const isCompleted = completion.isCompleted;
                    const isInProgress = !isCompleted && completion.answered > 0;
                    return (
                      <motion.div key={system.id} whileHover={{ y: -6 }} className={`${ceoPartnerMode ? 'p-3 sm:p-4' : 'p-6'} rounded-xl border transition-all h-full flex flex-col cursor-pointer ${darkMode ? "bg-gray-800/30 border-gray-700 hover:border-yellow-500" : "bg-white border border-gray-200 hover:border-yellow-500"} shadow-lg hover:shadow-xl ${isCompleted ? (darkMode ? "border-green-500/50" : "border-green-500/30 bg-green-50/50") : ""}`} onClick={() => handleSystemSelect(system)}>
                        <div className={`${ceoPartnerMode ? 'text-2xl sm:text-3xl mb-2 sm:mb-3' : 'text-4xl mb-4'}`}>{system.icon}</div>
                        <h3 className={`${ceoPartnerMode ? 'text-sm sm:text-base' : 'text-xl'} font-bold mb-1 sm:mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{system.title}</h3>
                        <p className={`${ceoPartnerMode ? 'text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-3' : 'text-sm mb-4'} ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{system.description}</p>
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-medium ${isCompleted ? "text-green-500" : isInProgress ? "text-yellow-500" : darkMode ? "text-gray-500" : "text-gray-400"}`}>{isCompleted ? "Completed" : isInProgress ? "In Progress" : "Not Started"}</span>
                            <span className="text-xs font-medium text-gray-500">{isCompleted ? `${completion.answered}/${completion.total}` : isInProgress ? `${completion.answered}/${completion.total}` : `0/${completion.total}`}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${isCompleted ? "bg-green-500" : isInProgress ? "bg-yellow-500" : "bg-gray-300"}`} style={{ width: isCompleted ? "100%" : isInProgress ? `${(completion.answered / completion.total) * 100}%` : "0%" }} />
                          </div>

                          {/* CEO Partner Mode: inline action buttons */}
                          {ceoPartnerMode && externalSystemStates && (() => {
                            const sState = externalSystemStates[system.id] || {};
                            const hasResult = !!sState.latestResult;
                            const isRunning = sState.status === "in-progress";
                            const runProgress = sState.progress || 0;
                            const hasAnswers = (sState.answeredCount || 0) > 0;
                            const score = hasResult ? (sState.latestResult.score || 0) : null;
                            return (
                              <div className="mt-2 sm:mt-3" onClick={(e) => e.stopPropagation()}>
                                {/* Analysis progress bar — shown while running */}
                                {isRunning && (
                                  <div className={`mb-2 p-2 rounded-lg ${darkMode ? 'bg-blue-950/50 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className={`text-xs font-semibold flex items-center gap-1.5 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                        <span className="animate-spin inline-block">🧠</span> X-Ultra Analyzing...
                                      </span>
                                      <span className={`text-xs font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{runProgress}%</span>
                                    </div>
                                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-blue-900/50' : 'bg-blue-200'}`}>
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out relative overflow-hidden"
                                        style={{ width: `${runProgress}%` }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" 
                                          style={{ animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
                                      </div>
                                    </div>
                                    <p className={`text-[10px] mt-1 ${darkMode ? 'text-blue-400/70' : 'text-blue-500/70'}`}>
                                      {runProgress < 30 ? 'Collecting assessment data...' : runProgress < 60 ? 'Running AI analysis...' : runProgress < 90 ? 'Generating insights...' : 'Finalizing report...'}
                                    </p>
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={(e) => { e.stopPropagation(); onRunAnalysis?.(system.id); }}
                                  disabled={!hasAnswers || isRunning}
                                  className={`px-2 py-1 rounded-md border text-xs font-medium transition-all duration-200 ${
                                    isRunning
                                      ? (darkMode ? 'bg-blue-900/40 border-blue-500 text-blue-300 cursor-wait opacity-60' : 'bg-blue-100 border-blue-400 text-blue-700 cursor-wait opacity-60')
                                      : !hasAnswers
                                      ? (darkMode ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed')
                                      : (darkMode ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300 hover:bg-indigo-800/60' : 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100')
                                  }`}
                                >
                                  {isRunning ? (
                                    <>Analyzing...</>
                                  ) : !hasAnswers ? (
                                    <><span className="inline-block mr-1">🔒</span> Locked</>
                                  ) : (
                                    <><FaPlay className="inline-block mr-1" size={9} /> Run Analysis</>
                                  )}
                                </button>
                                {hasResult && (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onViewResults?.(system.id); }}
                                      className={`px-2 py-1 rounded-md border text-xs font-medium transition-all ${
                                        darkMode ? 'bg-green-900/30 border-green-600 text-green-300 hover:bg-green-800/50' : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                                      }`}
                                    >
                                      <FaEye className="inline-block mr-1" size={9} /> {score}%
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onRemoveResult?.(sState.latestResult.id); }}
                                      className={`px-1.5 py-1 rounded-md text-xs transition-all ${
                                        darkMode ? 'text-gray-500 hover:text-red-400 hover:bg-gray-800' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                                      }`}
                                      title="Remove result"
                                    >
                                      <FaTrash size={9} />
                                    </button>
                                  </>
                                )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
{/* {showClientInfo !== false && step === 0 && ( */}
                {Object.keys(answers).length > 0 && (
                  <motion.div className={`${!showClientInfo ? "hidden " : ""}mt-16`}>
                    <div className={`p-6 rounded-xl ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700" : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"}`}>
                      <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                          <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>Assessment Progress</h3>
                          <p className={darkMode ? "text-gray-300" : "text-gray-700"}>You've completed {Object.keys(answers).length} of {systems.length} systems</p>
                        </div>
                        <div className="flex gap-3 items-center">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleResultsRequest} className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition">
                            Get Results
                          </motion.button>
                          <CEODashboardButton />
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${completionPercentage()}%` }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: system pages */}
          {step === 3 && currentSystem && (
            <>
              {currentSystem.id === "interdependency" && <InterdependencySystem system={currentSystem} answers={answers} setAnswers={setAnswersWithTracking} onBack={() => setStep(1)} darkMode={darkMode} />}
              {currentSystem.id === "inlignment" && <SystemOfInlignment system={currentSystem} answers={answers} setAnswers={setAnswersWithTracking} onBack={() => setStep(1)} darkMode={darkMode} />}
              {currentSystem.id === "investigation" && <SystemOfInvestigation system={currentSystem} answers={answers} setAnswers={setAnswersWithTracking} onBack={() => setStep(1)} darkMode={darkMode} />}
              {currentSystem.id === "orchestration" && <SystemOfOrchestration system={currentSystem} answers={answers} setAnswers={setAnswersWithTracking} onBack={() => setStep(1)} darkMode={darkMode} />}
              {currentSystem.id === "illustration" && <SystemOfIllustration system={currentSystem} answers={answers} setAnswers={setAnswersWithTracking} onBack={() => setStep(1)} darkMode={darkMode} />}
              {currentSystem.id === "interpretation" && <SystemOfInterpretation system={currentSystem} answers={answers} setAnswers={setAnswersWithTracking} onBack={() => setStep(1)} darkMode={darkMode} />}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Guest register CTA */}
      {/* <GuestRegisterBanner /> */}

      {/* Upsell Modal (Premium) */}
      <UpsellModal
        open={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onUpgrade={() => {
          auth.upgrade && auth.upgrade();
          setShowUpsellModal(false);
        }}
        darkMode={darkMode}
      />

      {/* Guest Auth Modal (Register / Login) */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={authMode === "register" ? "Register Organization" : "Sign in"}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className={`w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl transform transition-all duration-200
              ${darkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-white"}`}>
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {authMode === "register" ? "Register Organization" : "Sign in"}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                aria-label="Close auth modal"
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                  darkMode ? "text-gray-300 hover:text-white focus:ring-gray-600" : "text-gray-500 hover:text-gray-700 focus:ring-gray-300"
                }`}
              >
                <FaTimes />
              </button>
            </div>

            {/* Body / Form */}
            <form onSubmit={handleAuthSubmit} className={`px-6 py-5 space-y-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`} autoComplete="off" spellCheck="false">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Organization</label>
                <input
                  value={authForm.orgName}
                  onChange={(e) => setAuthForm((f) => ({ ...f, orgName: e.target.value }))}
                  placeholder="Organization name"
                  className={`mt-1 w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 transition
                    ${darkMode ? "bg-gray-800 border-gray-700 placeholder-gray-400 text-gray-100 focus:ring-indigo-600" : "bg-white border-gray-200 placeholder-gray-500 text-gray-900 focus:ring-indigo-500"}`}
                  aria-label="Organization name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Your name / Role</label>
                <input
                  value={authForm.name}
                  onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name or role"
                  className={`mt-1 w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 transition
                    ${darkMode ? "bg-gray-800 border-gray-700 placeholder-gray-400 text-gray-100 focus:ring-indigo-600" : "bg-white border-gray-200 placeholder-gray-500 text-gray-900 focus:ring-indigo-500"}`}
                  aria-label="Your name or role"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                <input
                  value={authForm.email}
                  onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  className={`mt-1 w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 transition
                    ${darkMode ? "bg-gray-800 border-gray-700 placeholder-gray-400 text-gray-100 focus:ring-indigo-600" : "bg-white border-gray-200 placeholder-gray-500 text-gray-900 focus:ring-indigo-500"}`}
                  aria-label="Email address"
                  type="email"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <input
                    id="mode"
                    type="checkbox"
                    checked={authMode === "login"}
                    onChange={() => setAuthMode((m) => (m === "login" ? "register" : "login"))}
                    className={`h-4 w-4 rounded focus:ring-2 focus:outline-none ${darkMode ? "accent-indigo-400" : "accent-indigo-600"}`}
                    aria-label="Toggle sign in"
                  />
                  <label className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Already have an account?</label>
                </div>

                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className={`px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 transition ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800/40 focus:ring-gray-600" : "border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300"}`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition ${
                      darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500" : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
                    }`}
                  >
                    {authMode === "register" ? "Register" : "Sign in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* CEO prompt modal */}
      {showCEOPrompt && <CEOPromptModal />}

      {/* Freemium expired modal */}
      {showFreemiumExpired && <FreemiumExpiredModal />}

      {/* Results / Booking / Thankyou / Finance modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div key="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80" onClick={() => setActiveModal(null)}>
            <motion.div key="modal-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`relative max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"}`} onClick={(e) => e.stopPropagation()}>
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${activeModal === "results" ? "bg-gradient-to-r from-blue-500 to-indigo-600" : activeModal === "booking" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-600"}`} />
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal(null)} className={`absolute top-3 right-3 z-10 p-1.5 rounded-full ${darkMode ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300 backdrop-blur-sm" : "bg-gray-200/80 hover:bg-gray-300 text-gray-700 backdrop-blur-sm"}`}><FaTimes className="text-sm" /></motion.button>

              <div className="overflow-y-auto custom-scrollbar flex-grow p-5">
                {/* RESULTS modal content */}
                {activeModal === "results" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>Assessment Results</h2>
                      <p className={`${darkMode ? "text-blue-300" : "text-blue-600"}`}>{analysisContent ? "Your Analysis Report is available in the chat below" : "Select your report preferences"}</p>
                    </div>

                    {generatingAnalysis ? (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4" />
                          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>ConseQ-X Analysing... <br /><span className="text-yellow-500 font-semibold"><i>Working on your result</i></span></p>
                        </div>
                      </div>
                    ) : analysisContent ? (
                      <div className="space-y-5">
                        {/* Chat dashboard embedded here */}
                        <div className="rounded-xl overflow-hidden">
                          <ChatSection
                            darkMode={darkMode}
                            chatMessages={chatMessages}
                            setChatMessages={setChatMessages}
                            textareaRef={chatTextareaRef}
                            textValue={chatText}
                            setTextValue={setChatText}
                            uploadedFile={uploadedFileChat}
                            setUploadedFile={setUploadedFileChat}
                            onAttachClick={handleAttachClickForChat}
                            onBackToOptions={() => { setAnalysisContent(null); setActiveModal(null); }}
                            onDownloadPDF={handleDownloadPDF}
                            onSchedule={() => setActiveModal("booking")}
                            onFinance={() => openFinanceModal()}
                            onRunAnalysis={handleRunAnalysisClick}
                            generatingAnalysis={generatingAnalysis}
                            assessmentContext={{
                              scores,
                              systems: activeSystems,
                              userInfo,
                              answers,
                              selectedSystems: resultsType === "specific" ? selectedSystems : activeSystems.map(s => s.id),
                            }}
                          />
                        </div>


                      </div>
                    ) : (
                      <>
                        <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}>
                          <h3 className={`font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Summary</h3>
                          <div className="flex items-center mb-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width: `${completionPercentage()}%` }} />
                            </div>
                            <span className="font-medium">{completionPercentage()}%</span>
                          </div>
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>Completed {Object.keys(answers).length} of {systems.length} systems</p>
                        </div>

                        <div className="space-y-4">
                          <div className={`p-3 rounded-lg cursor-pointer transition-all ${resultsType === "all" ? (darkMode ? "bg-indigo-900/30 border border-indigo-700" : "bg-indigo-100 border border-indigo-300") : (darkMode ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" : "bg-gray-100 border border-gray-200 hover:border-indigo-300")}`} onClick={() => setResultsType("all")}>
                            <div className="flex items-start">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${resultsType === "all" ? "bg-indigo-600 text-white" : (darkMode ? "bg-gray-700" : "bg-gray-300")}`}>{resultsType === "all" && "✓"}</div>
                              <div>
                                <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Full Report</h3>
                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Comprehensive report with all completed assessments</p>
                              </div>
                            </div>
                          </div>

                          <div className={`p-3 rounded-lg cursor-pointer transition-all ${resultsType === "specific" ? (darkMode ? "bg-indigo-900/30 border border-indigo-700" : "bg-indigo-100 border border-indigo-300") : (darkMode ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" : "bg-gray-100 border border-gray-200 hover:border-indigo-300")}`} onClick={() => setResultsType("specific")}>
                            <div className="flex items-start">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${resultsType === "specific" ? "bg-indigo-600 text-white" : (darkMode ? "bg-gray-700" : "bg-gray-300")}`}>{resultsType === "specific" && "✓"}</div>
                              <div>
                                <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Selected Systems</h3>
                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Reports for specific systems only</p>
                              </div>
                            </div>
                          </div>

                          {resultsType === "specific" && (
                            <div className="ml-8 mt-2 space-y-2 overflow-hidden">
                              {systems.map((sys) => {
                                const isDone = sys.subAssessments.every((sub) => answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length);
                                return (
                                  <div key={sys.id} className={`p-2 rounded cursor-pointer ${isDone ? (darkMode ? "bg-gray-700/30 hover:bg-gray-700/50" : "bg-gray-100 hover:bg-gray-200") : "opacity-50 cursor-not-allowed"} ${selectedSystems.includes(sys.id) ? (darkMode ? "bg-blue-900/30" : "bg-blue-100") : ""}`} onClick={() => isDone && toggleSystemSelection(sys.id)}>
                                    <div className="flex items-center">
                                      <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${darkMode ? "bg-gray-600" : "bg-gray-300"} ${selectedSystems.includes(sys.id) ? "bg-blue-500" : ""}`}>{selectedSystems.includes(sys.id) && <FaCheck className="text-xs text-white" />}</div>
                                      <span className={`text-xs ${isDone ? (darkMode ? "text-white" : "text-gray-900") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>{sys.title}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="text-center pt-2">
                            <button onClick={handleRunAnalysisClick} disabled={generatingAnalysis} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-50">
                              Run ConseQ-X Ultra Analysis
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* BOOKING */}
                {activeModal === "booking" && (
                  <div className="space-y-5 text-center p-6">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Schedule Consultation</h2>
                      <p className={`${darkMode ? "text-yellow-300" : "text-yellow-600"}`}>Discuss your results with our experts</p>
                    </div>

                    <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}>
                      <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Our organizational health experts will help you interpret your assessment results and develop an action plan.</p>
                      <p className={`font-medium ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>Email us at: <span className="font-bold">consultation@conseq-x.com</span></p>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                      <button onClick={() => setActiveModal("results")} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Back to Results</button>
                      <button onClick={() => (window.location.href = "mailto:consultation@conseq-x.com?subject=Assessment%20Consultation")} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg">Email Us Now</button>
                    </div>
                  </div>
                )}

                {/* THANKYOU */}
                {activeModal === "thankyou" && (
                  <div className="text-center space-y-5 p-8">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Thank You!</h2>
                      <p className={`${darkMode ? "text-green-300" : "text-green-600"}`}>Your assessment has been submitted</p>
                    </div>

                    <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}>
                      <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Your comprehensive organizational health report will be emailed to you shortly.</p>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>For any questions, contact us at <span className="font-medium">support@conseq-x.com</span></p>
                    </div>

                    <div className="flex flex-col items-center mt-6">
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>How would you rate your experience?</h3>
                      <div className="flex space-x-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className={`text-2xl ${darkMode ? "text-gray-400" : "text-gray-300"} ${rating >= star ? "text-yellow-400" : ""}`} onClick={() => setRating(star)}>
                            {rating >= star ? <FaStar /> : <FaRegStar />}
                          </motion.button>
                        ))}
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setActiveModal(null); setStep(0); setAnswers({}); setAnalysisContent(null); setChatMessages([]); }} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg">Complete Assessment</motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finance modal */}
      <AnimatePresence>
        {showFinanceModal && (
          <motion.div key="finance-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeFinanceModal}>
            <motion.div key="finance-modal-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeFinanceModal} className="float-right text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><FaTimes /></button>

              {!financeAnalysis ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">Enter Your Financials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ["annualRevenue", "Annual Revenue"],
                      ["operatingCost", "Operating Cost"],
                      ["profitMargin", "Profit Margin (%)"],
                      ["costDelays", "Cost of Delays"],
                      ["costErrors", "Cost of Errors"],
                      ["retentionRate", "Customer Retention (%)"],
                      ["innovationBudget", "Innovation Budget"],
                      ["turnoverRate", "Employee Turnover (%)"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">{label}</label>
                        <input type="text" name={key} value={financeInputs[key]} onChange={handleFinanceChange} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-right">
                    <button onClick={computeFinancialImpact} className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600">Compute Impact</button>
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-dark max-w-none">
                  <button className="mb-4 text-sm text-blue-500 hover:underline" onClick={() => setFinanceAnalysis(null)}>← Edit Inputs</button>
                  <div dangerouslySetInnerHTML={{ __html: financeAnalysis.replace(/\n/g, "<br/>") }} />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hidden file input for chat attachments */}
      <input ref={chatFileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFileForChat(f); e.target.value = ""; }} />

      {/* Scrollbar and report content styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar:-webkit-scrollbar-track { background: ${darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)"}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? "rgba(156, 163, 175, 0.5)" : "rgba(156, 163, 175, 0.5)"}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${darkMode ? "rgba(209, 213, 219, 0.7)" : "rgba(107, 114, 128, 0.7)"}; }

        .report-content { font-family: 'Inter', sans-serif; line-height: 1.6; }

        /* placeholder colors improved for accessibility */
        input::placeholder { opacity: 0.9; }
      `}</style>
    </div>
  );
}
