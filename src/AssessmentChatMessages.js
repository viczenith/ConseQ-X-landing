// src/AssessmentChatMessages.js
import React, { useEffect, useRef } from "react";
import { FaPaperPlane, FaPaperclip, FaPlay } from "react-icons/fa";

/**
 * MessageRow - single chat message bubble
 */
function MessageRow({ m, darkMode }) {
  const isUser = m.role === "user";
  const baseClasses = "rounded-xl px-4 py-3 break-words shadow-sm";
  const userClasses = `${baseClasses} bg-blue-600 text-white max-w-[92%] sm:max-w-[88%] md:max-w-[75%] lg:max-w-[65%]`;
  const assistantLight = `${baseClasses} bg-white border border-gray-100 text-gray-900 max-w-[92%] sm:max-w-[88%] md:max-w-[75%] lg:max-w-[65%]`;
  const assistantDark = `${baseClasses} bg-gray-700 text-gray-100 border border-gray-700 max-w-[92%] sm:max-w-[88%] md:max-w-[75%] lg:max-w-[65%]`;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-3`}>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0`}>
        <div className={isUser ? userClasses : darkMode ? assistantDark : assistantLight}>
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
          {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </div>
      </div>
    </div>
  );
}

/**
 * ChatComposer - text input area with send + attach controls
 */
function ChatComposer({ onSend, onAttachClick, darkMode, textareaRef, textValue, setTextValue }) {
  // Enter = send, Shift+Enter = newline
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textValue && textValue.trim()) {
        onSend(textValue.trim());
        setTextValue("");
      }
    }
  }

  // Auto-resize textarea (keeps scrollbar hidden unless user scrolls)
  useEffect(() => {
    if (!textareaRef?.current) return;
    const ta = textareaRef.current;
    ta.style.height = "auto";
    const newHeight = Math.min(ta.scrollHeight, 260);
    ta.style.height = `${newHeight}px`;
  }, [textValue, textareaRef]);

  return (
    <div className={`p-3 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
      <div className="flex items-end gap-2 min-w-0">
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your Executive Analyst..."
          className={`flex-1 min-w-0 resize-none rounded-lg px-4 py-3 border hide-scrollbar-textarea ${
            darkMode ? "border-gray-700 bg-gray-900 text-gray-100" : "border-gray-200 bg-gray-50 text-gray-900"
          } outline-none focus:ring-2 focus:ring-indigo-200`}
          rows={1}
          aria-label="Chat input"
          style={{ maxHeight: 260, overflow: "auto" }}
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
            className={`p-2 rounded-md ${textValue && textValue.trim() ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
            style={{ width: 40, height: 40 }}
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </div>

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

/**
 * ChatSection - main exported component
 *
 * Props:
 * - darkMode (bool)
 * - chatMessages (array)
 * - setChatMessages (fn)
 * - textareaRef (ref)
 * - textValue, setTextValue
 * - uploadedFile, setUploadedFile
 * - onAttachClick
 * - onBackToOptions
 * - onDownloadPDF
 * - onSchedule
 * - onFinance
 * - onRunAnalysis (fn)
 * - generatingAnalysis (optional bool) -> disables run button and shows spinner
 */
export default function ChatSection({
  darkMode,
  chatMessages = [],
  setChatMessages,
  textareaRef,
  textValue,
  setTextValue,
  uploadedFile,
  setUploadedFile,
  onAttachClick,
  onBackToOptions,
  onDownloadPDF,
  onSchedule,
  onFinance,
  onRunAnalysis,
  generatingAnalysis = false,
}) {
  const messagesRef = useRef(null);

  // keep scroll at bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, [chatMessages]);

  // internal send used by composer
  function handleSend(text) {
    if (!text) return;
    const msg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      file: uploadedFile ? { ...uploadedFile } : undefined,
    };

    setChatMessages((prev) => [...prev, msg]);
    // clear preview
    setUploadedFile && setUploadedFile(null);

    // Auto-reply from assistant (light, non-blocking)
    // We keep it simple and not triggered for system/analysis messages
    setTimeout(() => {
      const reply = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: `Thanks, I received your message: "${text}".\n\nIf you'd like, press "Run ConseQ-X Ultra Analysis" to generate a full report for your completed systems.`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      // ensure scroll
      try {
        const el = messagesRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        // noop
      }
    }, 700);
  }

  return (
    <div
      className={`rounded-2xl transition-colors ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm flex flex-col min-w-0 w-full`}
      role="region"
      aria-label="Executive Analyst chat"
    >
      {/* styles: hide scrollbars and responsive heights */}
      <style>{`
        .hide-scrollbar, .hide-scrollbar-textarea {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar, .hide-scrollbar-textarea::-webkit-scrollbar {
          display: none;
          height: 0;
          width: 0;
        }

        /* responsive heights for different devices */
        @media (max-width: 480px) {
          .chat-shell { height: 86vh; padding: 8px; }
          .messages-area { padding: 10px; }
          .run-btn { width: 100%; font-size: 15px; padding: 10px 12px; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .chat-shell { height: 84vh; padding: 10px; }
          .messages-area { padding: 12px; }
          .run-btn { width: 100%; font-size: 15px; padding: 10px 14px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .chat-shell { height: 78vh; padding: 14px; }
          .run-btn { width: auto; }
        }
        @media (min-width: 1025px) {
          .chat-shell { height: 75vh; padding: 20px; }
        }

        /* simple spinner for run button */
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: rgba(255,255,255,0.95);
          border-radius: 9999px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="chat-shell rounded-2xl p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Executive Analyst</div>
            <div className="text-xs text-gray-400">Analysis inserted into conversation</div>
          </div>
        </div>

        {/* messages area */}
        <div
          ref={messagesRef}
          className="messages-area flex-1 overflow-auto hide-scrollbar mb-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {(!chatMessages || chatMessages.length === 0) && (
            <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-700"}`}>
              <div className="text-lg font-semibold">No messages yet</div>
              <div className="mt-2 text-sm text-gray-400">Send a message or click Run Analysis to inject the report into this chat.</div>
            </div>
          )}

          {chatMessages && chatMessages.map((m) => (
            <MessageRow key={m.id} m={m} darkMode={darkMode} />
          ))}
        </div>

        {/* file preview */}
        {uploadedFile && (
          <div className={`mt-2 p-3 rounded-md border ${darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border border-indigo-50 text-gray-900"}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{uploadedFile.name}</div>
                <div className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-md border" onClick={() => setUploadedFile(null)}>x</button>
              </div>
            </div>
          </div>
        )}

        {/* composer */}
        <div className="mt-3">
          <ChatComposer
            onSend={handleSend}
            darkMode={darkMode}
            onAttachClick={onAttachClick}
            textareaRef={textareaRef}
            textValue={textValue}
            setTextValue={setTextValue}
          />
        </div>

        {/* Run analysis button */}
        <div className="mt-3 flex items-center justify-center">
          <button
            onClick={() => typeof onRunAnalysis === "function" && onRunAnalysis()}
            disabled={!onRunAnalysis || generatingAnalysis}
            aria-label="Rerun ConseQ-X Ultra"
            className={`run-btn inline-flex items-center justify-center gap-2 rounded-lg font-semibold ${onRunAnalysis && !generatingAnalysis ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
            style={{ padding: "10px 16px", minWidth: 160 }}
          >
            {generatingAnalysis ? <span className="spinner" aria-hidden /> : <FaPlay />}
            <span>{generatingAnalysis ? "Running Analysis..." : "Rerun ConseQ-X Ultra"}</span>
          </button>
        </div>

        {/* bottom action buttons */}
        <div className="mt-3">
            {/* Mobile: dropdown */}
            <div className="sm:hidden">
                <details className="w-full">
                <summary className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer">
                    More Options
                </summary>
                <div className="mt-2 flex flex-col gap-2">
                    <button
                    onClick={onBackToOptions}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                    Back to Options
                    </button>
                    <button
                    onClick={onDownloadPDF}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg"
                    >
                    Download PDF Report
                    </button>
                    <button
                    onClick={onSchedule}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg"
                    >
                    Schedule Consultation
                    </button>
                    <button
                    onClick={onFinance}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg"
                    >
                    Financial Impact Analysis
                    </button>
                </div>
                </details>
            </div>

            {/* Tablet/Desktop: inline row */}
            <div className="hidden sm:flex flex-wrap gap-3 justify-center">
                <button
                onClick={onBackToOptions}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                Back to Options
                </button>
                <button
                onClick={onDownloadPDF}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg"
                >
                Download PDF Report
                </button>
                <button
                onClick={onSchedule}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg"
                >
                Schedule Consultation
                </button>
                <button
                onClick={onFinance}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg"
                >
                Financial Impact Analysis
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
