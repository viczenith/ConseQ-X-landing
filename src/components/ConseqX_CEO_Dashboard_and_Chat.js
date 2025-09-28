"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo3D from "../assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaBars, FaTimes, FaPlus, FaPaperPlane, FaPaperclip } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import WelcomeCongrats from "../components/WelcomeCongrats";

/* -------------------- Mock data -------------------- */
const MOCK_KPIS = [
  { id: "k1", title: "Revenue (TTM)", value: "₦120M", delta: "+8%", trend: "up" },
  { id: "k2", title: "EBITDA Margin", value: "18%", delta: "-1%", trend: "down" },
  { id: "k3", title: "Active Assessments", value: "4", delta: "+1", trend: "up" },
  { id: "k4", title: "AI Insights (unread)", value: "3", delta: null, trend: "up" },
];

const MOCK_MEETINGS = [
  { id: "m1", title: "Leadership Review", time: "2025-10-03 10:00" },
  { id: "m2", title: "Product Roadmap", time: "2025-10-07 14:00" },
];

const MOCK_SYSTEMS = [
  { id: "s1", title: "Interpretation", scorePct: 74 },
  { id: "s2", title: "Investigation", scorePct: 55 },
  { id: "s3", title: "Orchestration", scorePct: 42 },
];

/* -------------------- Small UI primitives -------------------- */
function KPICard({ kpi, darkMode }) {
  return (
    <div
      className={`cx-kpi-card rounded-2xl p-4 shadow-sm border min-w-[12rem] flex-shrink-0 ${
        darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xs uppercase ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{kpi.title}</div>
          <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
        </div>
        {kpi.delta ? (
          <div
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              kpi.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {kpi.delta}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionTitle({ children, darkMode }) {
  return <h3 className={`${darkMode ? "text-gray-100" : "text-gray-800"} text-lg font-semibold`}>{children}</h3>;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="h-2 w-2 rounded-full animate-pulse bg-gray-400" />
      <div className="h-2 w-2 rounded-full animate-pulse bg-gray-400 delay-75" />
      <div className="h-2 w-2 rounded-full animate-pulse bg-gray-400 delay-150" />
    </div>
  );
}

function MessageRow({ m, darkMode }) {
  const isUser = m.role === "user";
  const userClasses = "bg-blue-600 text-white rounded-xl max-w-[90%] px-4 py-2 shadow-md break-words";
  const assistantLight =
    "bg-gradient-to-r from-gray-50 to-white border border-gray-100 text-gray-900 rounded-xl max-w-[90%] px-4 py-2 shadow-sm break-words";
  const assistantDark = "bg-gray-700 text-gray-100 rounded-xl max-w-[90%] px-4 py-2 shadow-sm border border-gray-700 break-words";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-3`}>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0`}>
        <div className={`${isUser ? userClasses : darkMode ? assistantDark : assistantLight}`}>
          <div className="text-sm whitespace-pre-wrap">{m.text}</div>
          {m.file ? (
            <div className="mt-2 text-xs">
              <a href={m.file.url} target="_blank" rel="noreferrer" className="underline">
                {m.file.name}
              </a>
            </div>
          ) : null}
        </div>
        <div className={`text-[11px] mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Composer -------------------- */
function ChatComposer({ onSend, darkMode, onAttachClick, textareaRef, textValue, setTextValue, uploadedFile, setUploadedFile }) {
  // Enter=send, Shift+Enter=newline
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
    const newHeight = Math.min(ta.scrollHeight, 220); // cap growth
    ta.style.height = `${newHeight}px`;
  }, [textValue, textareaRef]);

  return (
    <div
      className={`p-3 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
      style={{ boxShadow: darkMode ? "0 -2px 8px rgba(0,0,0,0.6)" : "0 -2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Preview block for uploaded file (appears above input, not posted until send) */}
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
        {/* items-end aligns send button to baseline */}
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your executive analyst"
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

      {/* Attach row below the textarea */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onAttachClick}
          aria-label="Attach file"
          className={`flex items-center gap-2 px-3 py-2 rounded-md border ${darkMode ? "border-gray-700 text-gray-100 bg-gray-800" : "border-gray-200 text-gray-800 bg-white"}`}
        >
          <FaPaperclip />
          <span className="text-sm">Upload Document</span>
        </button>
        <div className="text-xs text-gray-400">PDF, DOCX</div>
      </div>
    </div>
  );
}

/* -------------------- Main page -------------------- */
export default function ConseqXCEODashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [navScrolled, setNavScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [showConversationListMobile, setShowConversationListMobile] = useState(false);

  // congrats banner
  const [showCongrats, setShowCongrats] = useState(false);

  const kpis = useMemo(() => MOCK_KPIS, []);
  const meetings = useMemo(() => MOCK_MEETINGS, []);
  const systems = useMemo(() => MOCK_SYSTEMS, []);

  const [conversations] = useState(() => [
    { id: "c1", title: "Executive Summary Chat", lastMessage: "What's the top 3 priorities for the next quarter?" },
    { id: "c2", title: "Financial Health Review", lastMessage: "Explain EBITDA variance" },
  ]);
  const [selectedConversationId, setSelectedConversationId] = useState("c1");

  const [messages, setMessages] = useState(() => [
    { id: "m0", role: "system", text: "Welcome to ConseQ-X Ultra - your Executive Analyst.", timestamp: new Date().toISOString() },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const [textValue, setTextValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const convListRef = useRef(null);

  /* -------------------- Congrat banner effect --------------------
     Triggers when either:
     - location.state.justLoggedIn === true (navigate(..., { state: { justLoggedIn: true } }))
     - localStorage flag "show_congrats_next" === "true"
     Once shown it clears the flag and clears navigation state by replacing location (so it won't repeat)
  -----------------------------------------------------------------*/
  useEffect(() => {
    const justLoggedIn = Boolean(location?.state?.justLoggedIn);
    const showFlag = typeof window !== "undefined" && localStorage.getItem("show_congrats_next") === "true";

    if (justLoggedIn || showFlag) {
      setShowCongrats(true);

      // clear stored flag
      try {
        localStorage.removeItem("show_congrats_next");
      } catch (e) {
        // ignore
      }

      // clear navigation state so back/refresh doesn't retrigger
      // Only replace if location has state (avoid unnecessary navigation)
      if (location && location.state && Object.keys(location.state).length > 0) {
        // replace with same pathname but empty state
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
    // run on mount and when location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname, location?.state]);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight + 200;
    }
  }, [messages, isGenerating]);

  // click outside for Explorer (conversation list)
  useEffect(() => {
    function handleConvClick(e) {
      if (!convListRef.current) return;
      if (!convListRef.current.contains(e.target) && e.target.closest("#explorer-toggle") == null) {
        setShowConversationListMobile(false);
      }
    }
    if (showConversationListMobile) document.addEventListener("click", handleConvClick);
    return () => document.removeEventListener("click", handleConvClick);
  }, [showConversationListMobile]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("darkMode", next ? "true" : "false");
  };

  function simulateAssistantReply(prompt) {
    setIsGenerating(true);
    const replyText = `Based on the most recent assessment, top priorities: 1) Strengthen Orchestration, 2) Focus on operational KPIs, 3) Schedule leadership offsite.

Would you like me to create an action plan?`;
    let idx = 0;
    const id = `m-assistant-${Date.now()}`;
    const assistantMessage = { id, role: "assistant", text: "", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantMessage]);

    const interval = setInterval(() => {
      idx += 20;
      const chunk = replyText.slice(0, idx);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: chunk } : m)));
      if (idx >= replyText.length) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 60);
  }

  function handleSendMessage(text) {
    const userMsg = { id: `m-user-${Date.now()}`, role: "user", text, timestamp: new Date().toISOString(), file: uploadedFile ? { ...uploadedFile } : undefined };
    setMessages((prev) => [...prev, userMsg]);
    // clear preview after send
    setUploadedFile(null);
    simulateAssistantReply(text + (uploadedFile ? ` (attached ${uploadedFile.name})` : ""));
  }

  function handleUploadFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, size: file.size, url });
  }

  const signedInText = auth?.user ? `Signed in as ${auth.user.name || auth.user.email}` : "Not signed in";

  const drawerBg = darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900";
  const drawerBorder = darkMode ? "border-gray-700" : "border-gray-100";

  // extract first name for congrats (safe guard)
  const firstName = auth?.user?.name ? String(auth.user.name).split(" ")[0] : "";

  return (
    <div
      className={`${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100" : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900"} min-h-screen transition-colors duration-300`}
    >
      {/* WelcomeCongrats overlay: controlled by showCongrats */}
      <WelcomeCongrats open={showCongrats} onDone={() => setShowCongrats(false)} name={firstName} durationMs={1500} />

      <style>{`
        /* hide native scrollbars for cleaner UI */
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${navScrolled ? (darkMode ? "bg-gray-900/90 backdrop-blur-sm py-2 shadow-sm" : "bg-white/90 backdrop-blur-sm py-2 shadow-sm") : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button className={`sm:hidden p-2 rounded-md focus:ring-2 focus:ring-indigo-300 ${darkMode ? "text-gray-100" : "text-gray-800"}`} aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}>
              <FaBars />
            </button>

            <img src={Logo3D} alt="ConseQ-X Logo" className="h-10 w-auto sm:h-12" />
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm text-right">
              <div className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}>{signedInText}</div>
            </div>

            <button onClick={toggleDarkMode} aria-label="Toggle theme" className={`p-2 rounded-full ${darkMode ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-400"}`}>
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!mobileMenuOpen}>
        <div className={`fixed inset-0 transition-opacity ${mobileMenuOpen ? "opacity-70" : "opacity-0"}`} style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)" }} onClick={() => setMobileMenuOpen(false)} />
        <aside className={`fixed top-0 left-0 h-full w-80 max-w-[92%] transform transition-transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} p-4 ${drawerBg} border-r ${drawerBorder} shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3"></div>
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className={`p-2 rounded-md ${darkMode ? "text-gray-200" : "text-gray-600"}`}>
              <FaTimes />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <button onClick={() => { setTab("dashboard"); setMobileMenuOpen(false); }} className={`text-left px-3 py-2 rounded-md ${tab === "dashboard" ? (darkMode ? "bg-blue-900/20" : "bg-blue-50") : "hover:bg-blue-900/20"}`}>
              Dashboard
            </button>
            <button onClick={() => { setTab("chat"); setMobileMenuOpen(false); }} className={`text-left px-3 py-2 rounded-md ${tab === "chat" ? (darkMode ? "bg-blue-900/20" : "bg-blue-50") : "hover:bg-blue-900/20"}`}>
              Chat
            </button>
            <button className="text-left px-3 py-2 rounded-md hover:bg-blue-900/20">Assessments</button>
            <button className="text-left px-3 py-2 rounded-md hover:bg-blue-900/20">Reports</button>
            <button className="text-left px-3 py-2 rounded-md hover:bg-blue-900/20">Team</button>
            <button className="text-left px-3 py-2 rounded-md hover:bg-blue-900/20">Billing</button>
          </nav>

          <div className="mt-6">
            <SectionTitle darkMode={darkMode}>Upcoming</SectionTitle>
            <ul className="mt-3 space-y-3 text-sm">
              {meetings.map((m) => (
                <li key={m.id}>
                  <div className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{m.title}</div>
                  <div className="text-xs text-gray-400">{m.time}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <SectionTitle darkMode={darkMode}>Systems Snapshot</SectionTitle>
            <div className="mt-3 space-y-3">
              {systems.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div className={darkMode ? "text-gray-100" : "text-gray-900"}>{s.title}</div>
                  <div className={`px-2 py-1 rounded-full text-xs ${s.scorePct > 70 ? "bg-green-100 text-green-700" : s.scorePct > 45 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{s.scorePct}%</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Page content */}
      <div className="container mx-auto px-4 pt-28 pb-28">
        <div className="max-w-[1400px] mx-auto p-4 grid grid-cols-12 gap-6">
          {/* Sidebar (desktop) */}
          <aside className={`hidden md:block col-span-3 rounded-2xl p-4 h-[86vh] sticky top-6 transition-colors ${darkMode ? "bg-gray-800 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">C</div>
              <div>
                <div className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Conse<span className="text-yellow-500">Q</span>-X-Ultra</div>
                <div className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-500"}`}>CEO Workspace</div>
              </div>
            </div>

            <nav className="flex flex-col gap-2 mb-4">
              <button onClick={() => setTab("dashboard")} className={`text-left px-3 py-2 rounded-md ${tab === "dashboard" ? (darkMode ? "bg-blue-900/30" : "bg-blue-50") : "hover:bg-gray-50 dark:hover:bg-blue-900/20"}`}>
                Dashboard
              </button>
              <button onClick={() => setTab("chat")} className={`text-left px-3 py-2 rounded-md ${tab === "chat" ? (darkMode ? "bg-blue-900/30" : "bg-blue-50") : "hover:bg-gray-50 dark:hover:bg-blue-900/20"}`}>
                Chat
              </button>
              <button className="text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-blue-900/20">Assessments</button>
              <button className="text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-blue-900/20">Reports</button>
              <button className="text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-blue-900/20">Team</button>
              <button className="text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-blue-900/20">Billing</button>
            </nav>

            <div className="mt-4">
              <SectionTitle darkMode={darkMode}>Upcoming</SectionTitle>
              <ul className="mt-3 space-y-3 text-sm">
                {meetings.map((m) => (
                  <li key={m.id}>
                    <div className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-medium`}>{m.title}</div>
                    <div className="text-xs text-gray-400">{m.time}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <SectionTitle darkMode={darkMode}>Systems Snapshot</SectionTitle>
              <div className="mt-3 space-y-3">
                {systems.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div className={darkMode ? "text-gray-100" : ""}>{s.title}</div>
                    <div className={`px-2 py-1 rounded-full text-xs ${s.scorePct > 70 ? "bg-green-100 text-green-700" : s.scorePct > 45 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{s.scorePct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 md:col-span-9">
            <div className={`rounded-2xl p-4 md:p-6 transition-colors ${darkMode ? "bg-gray-800 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-xl md:text-2xl font-bold`}>Welcome back, CEO</h1>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-xs md:text-sm mt-1`}>Latest executive summary & actions for your organization</p>
                </div>
              </div>

              <div className="mt-4">
                {tab === "dashboard" ? (
                  <section>
                    <div className="mt-3">
                      <div className="hidden sm:grid grid-cols-4 gap-4">
                        {kpis.map((k) => (
                          <KPICard kpi={k} key={k.id} darkMode={darkMode} />
                        ))}
                      </div>

                      <div className="sm:hidden flex gap-4 overflow-x-auto py-1 -mx-2 px-2">
                        {kpis.map((k) => (
                          <KPICard kpi={k} key={k.id} darkMode={darkMode} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div className={`md:col-span-2 rounded-2xl p-4 transition-colors ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm`}>
                        <SectionTitle darkMode={darkMode}>Executive Insights</SectionTitle>
                        <div className={`${darkMode ? "text-gray-300" : "text-gray-700"} mt-3 text-sm`}>
                          <p className="mb-3">Top recommendation: Address Orchestration gaps — align owners, measure weekly sprints, and reduce cross-team blockers. <span className="underline">Create action plan</span>.</p>

                          <div className="mt-4">
                            <h4 className="font-semibold">Recent Reports</h4>
                            <ul className="mt-2 space-y-2 text-sm">
                              <li className={`flex items-center justify-between p-2 rounded-md hover:${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                <div>
                                  <div className="font-medium">Q3 Operations Review</div>
                                  <div className="text-xs text-gray-400">Generated Oct 01, 2025</div>
                                </div>
                                <div>
                                  <button className="px-3 py-1 rounded-md border">View</button>
                                </div>
                              </li>
                              <li className={`flex items-center justify-between p-2 rounded-md hover:${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                <div>
                                  <div className="font-medium">Leadership Assessment</div>
                                  <div className="text-xs text-gray-400">Generated Sep 12, 2025</div>
                                </div>
                                <div>
                                  <button className="px-3 py-1 rounded-md border">View</button>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <aside className={`rounded-2xl p-4 transition-colors ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm`}>
                        <SectionTitle darkMode={darkMode}>Action Items</SectionTitle>
                        <ul className="mt-3 space-y-2 text-sm">
                          <li className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">Draft offsite agenda</div>
                              <div className="text-xs text-gray-400">Owner: COO · Due: 2025-10-01</div>
                            </div>
                            <button className="px-2 py-1 rounded-md">Assign</button>
                          </li>
                          <li className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">KPI dashboard refresh</div>
                              <div className="text-xs text-gray-400">Owner: Head Analytics</div>
                            </div>
                            <button className="px-2 py-1 rounded-md">Assign</button>
                          </li>
                        </ul>
                      </aside>
                    </div>
                  </section>
                ) : (
                  /* Chat */
                  <section>
                    <div className="mb-3 flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <button
                          id="explorer-toggle"
                          className="px-3 py-2 rounded-md border md:hidden"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConversationListMobile((s) => !s);
                          }}
                          aria-expanded={showConversationListMobile}
                        >
                          Explorer
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        ref={convListRef}
                        className={`${showConversationListMobile ? "block" : "hidden"} md:block md:col-span-1 rounded-2xl p-4 transition-colors ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm h-auto md:h-[62vh] overflow-auto min-w-0 hide-scrollbar`}
                      >
                        <SectionTitle darkMode={darkMode}>
                          <div className="text-xs text-gray-400">{conversations.length} chats</div>
                        </SectionTitle>
                        <ul className="mt-3 space-y-2">
                          {conversations.map((c) => (
                            <li
                              key={c.id}
                              onClick={() => {
                                setSelectedConversationId(c.id);
                                setShowConversationListMobile(false);
                              }}
                              className={`p-2 rounded-md cursor-pointer ${selectedConversationId === c.id ? (darkMode ? "bg-blue-900/20" : "bg-blue-50") : "hover:bg-blue-900/20"}`}
                            >
                              <div className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-medium`}>{c.title}</div>
                              <div className="text-xs text-gray-400">{c.lastMessage}</div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`md:col-span-2 rounded-2xl p-0 md:p-4 transition-colors ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm h-[60vh] flex flex-col min-w-0`}>
                        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: darkMode ? "rgba(255,255,255,0.04)" : "" }}>
                          <div>
                            <div className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Executive Analyst</div>
                            <div className="text-xs text-gray-400">{isGenerating ? "Assistant is typing..." : "All caught up"}</div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-auto px-4 py-3 hide-scrollbar" ref={messagesRef} style={{ WebkitOverflowScrolling: "touch" }}>
                          {messages.length === 0 && (
                            <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-700"}`}>
                              <div className="text-lg font-semibold">No messages yet</div>
                              <div className="mt-2 text-sm text-gray-400">Start by asking your Executive Analyst a question - try: "What are the top 3 priorities this quarter?"</div>
                            </div>
                          )}

                          {messages.map((m) => (
                            <MessageRow key={m.id} m={m} darkMode={darkMode} />
                          ))}

                          {isGenerating && (
                            <div className="mt-2">
                              <div className={`inline-block rounded-xl px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
                                <TypingIndicator />
                              </div>
                            </div>
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
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); e.target.value = ""; }} />

      {/* Footer */}
      <footer className={`w-full py-6 border-t transition-colors ${darkMode ? "border-gray-700 bg-gray-900 text-gray-300" : "border-gray-200 bg-white text-gray-700"}`}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <span className="mr-4">© {new Date().getFullYear()} Conseq-X</span>
            <a href="/terms" className="underline mr-3">Terms</a>
            <a href="/privacy" className="underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
