import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";

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
  const userClasses = "bg-blue-600 text-white rounded-xl max-w-[90%] px-4 py-2 shadow-md break-words";
  const assistantLight =
    "bg-gradient-to-r from-gray-50 to-white border border-gray-100 text-gray-900 rounded-xl max-w-[90%] px-4 py-2 shadow-sm break-words";
  const assistantDark = "bg-gray-700 text-gray-100 rounded-xl max-w-[90%] px-4 py-2 shadow-sm border border-gray-700 break-words";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-3`}>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0`}>
        <div className={`${isUser ? userClasses : darkMode ? assistantDark : assistantLight}`}>
          <div className="text-sm whitespace-pre-wrap">{m.text}</div>
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

function ChatComposer({ onSend, darkMode, onAttachClick, textareaRef, textValue, setTextValue, uploadedFile, setUploadedFile }) {
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

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onAttachClick}
          aria-label="Attach file"
          className={`flex items-center gap-2 px-3 py-2 rounded-md border ${darkMode ? "border-gray-700 text-gray-100 bg-gray-800" : "border-gray-200 text-gray-800 bg-white"}`}
        >
          <FaPaperclip /> <span className="text-sm">Upload Document</span>
        </button>
        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>PDF, DOCX</div>
      </div>
    </div>
  );
}

export default function CEOChat() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();

  const [conversations] = useState([
    { id: "c1", title: "Executive Summary Chat", lastMessage: "What's the top 3 priorities for the next quarter?" },
    { id: "c2", title: "Financial Health Review", lastMessage: "Explain EBITDA variance" },
  ]);
  const [selectedConversationId, setSelectedConversationId] = useState("c1");

  const [messages, setMessages] = useState([
    { id: "m0", role: "system", text: "Welcome to ConseQ-X Ultra - your Executive Analyst.", timestamp: new Date().toISOString() },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      } catch {}
    }
    const onStorage = (e) => {
      if (e.key === "conseqx_assessments_v1" || e.key === null) refresh();
    };
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
    return () => {
      window.removeEventListener("storage", onStorage);
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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight + 200;
    }
  }, [messages, isGenerating]);

  function simulateAssistantReply(prompt) {
    setIsGenerating(true);
    // build explainable recommendations from latestBySystem meta
    const lines = [
      "Based on the most recent assessments, here are explainable priorities:",
    ];
    const systems = Object.keys(latestBySystem);
    if (systems.length === 0) {
      lines.push("- No recent system runs found. Start an assessment in the Assessments tab.");
    } else {
      systems.slice(0, 3).forEach((sid) => {
        const r = latestBySystem[sid];
        const explain = r?.meta?.explain || [];
        const top = explain.slice(0, 2).map((d) => `${d.key} (${Math.round(d.weight * 100)}%)`).join(", ");
        const label = titleByKey[sid] || r?.title || sid;
        lines.push(`- ${label}: score ${r?.score ?? "-"}%. Key drivers: ${top || "n/a"}`);
      });
    }
    lines.push("\nWould you like me to draft a 4-week action plan with owners and KPIs?");
    const replyText = lines.join("\n");
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
    setUploadedFile(null);
    simulateAssistantReply(text + (uploadedFile ? ` (attached ${uploadedFile.name})` : ""));
  }

  function handleUploadFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, size: file.size, url });
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`md:col-span-1 rounded-2xl p-4 h-[62vh] overflow-auto hide-scrollbar ${
            darkMode ? "border border-gray-700 bg-gray-900 text-gray-100" : "border border-gray-100 bg-white text-gray-900"
          }`}
        >
          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{conversations.length} chats</div>
          <ul className="mt-3 space-y-2">
            {conversations.map((c) => {
              const selected = selectedConversationId === c.id;
              const itemClass = selected
                ? darkMode
                  ? "bg-blue-900/20"
                  : "bg-blue-50"
                : darkMode
                ? "hover:bg-blue-900/20"
                : "hover:bg-blue-50";
              return (
                <li
                  key={c.id}
                  onClick={() => setSelectedConversationId(c.id)}
                  className={`p-2 rounded-md cursor-pointer ${itemClass}`}
                >
                  <div className={`font-medium ${darkMode ? "text-gray-100" : ""}`}>{c.title}</div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}>{c.lastMessage}</div>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className={`md:col-span-2 rounded-2xl p-0 md:p-4 h-[60vh] flex flex-col min-w-0 ${
            darkMode ? "border border-gray-700 bg-gray-900 text-gray-100" : "border border-gray-100 bg-white text-gray-900"
          }`}
        >
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: darkMode ? "rgba(255,255,255,0.04)" : "" }}>
            <div>
              <div className="font-semibold">Executive Analyst</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}>{isGenerating ? "Assistant is typing..." : "All caught up"}</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 hide-scrollbar" ref={messagesRef} style={{ WebkitOverflowScrolling: "touch" }}>
            {messages.map((m) => (
              <MessageRow key={m.id} m={m} darkMode={darkMode} />
            ))}

            {isGenerating && (
              <div className="mt-2">
                <div className={`inline-block rounded-xl px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
                  <TypingIndicator darkMode={darkMode} />
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
