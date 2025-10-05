// src/layouts/ConseqXCEODashboardShell.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo3D from "../../assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaBars, FaTimes, FaChevronDown, FaBell } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Notification format stored in localStorage under STORAGE_NOTIFS:
 * [{ id, title, body, ts, read: bool, meta: { type, uploadId } }, ...]
 */
const STORAGE_NOTIFS = "conseqx_reports_notifications_v3";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

/* Hidden scrollbar CSS (beautiful) */
const HIDE_SCROLL_CSS = `
  .nice-scroll { scrollbar-width: thin; scrollbar-color: rgba(100,100,100,0.2) transparent; }
  .nice-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
  .nice-scroll::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.22); border-radius: 999px; }
  .nice-scroll::-webkit-scrollbar-track { background: transparent; }
  .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
`;

export default function ConseqXCEODashboardShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => readJSON(STORAGE_NOTIFS, []));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  // keep notifications live across tabs and events
  useEffect(() => {
    function refreshFromStorage() {
      const nots = readJSON(STORAGE_NOTIFS, []);
      setNotifications(nots || []);
    }
    function onStorage(e) {
      if (!e.key || e.key === STORAGE_NOTIFS) refreshFromStorage();
    }
    function onEvent(e) {
      refreshFromStorage();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("conseqx:notifications:updated", onEvent);
    const poll = setInterval(refreshFromStorage, 1500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("conseqx:notifications:updated", onEvent);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  function markAsRead(id) {
    const updated = (notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    writeJSON(STORAGE_NOTIFS, updated);
    // notify other parts of app
    try { window.dispatchEvent(new CustomEvent("conseqx:notifications:updated", { detail: { id } })); } catch {}
  }

  function markAllRead() {
    const updated = (notifications || []).map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    writeJSON(STORAGE_NOTIFS, updated);
    try { window.dispatchEvent(new CustomEvent("conseqx:notifications:updated", { })); } catch {}
  }

  function openNotification(n) {
    // Example: focus upload or go to Reports
    markAsRead(n.id);
    if (n.meta?.uploadId) {
      navigate(`/ceo/data?focusUpload=${n.meta.uploadId}`);
    } else {
      navigate("/ceo/reports");
    }
    setDropdownOpen(false);
  }

  // demo helper: seed a mock notification (useful during development)
  function seedMock() {
    const now = Date.now();
    const n = { id: `n-${now}`, title: "Analysis ready", body: "Your recent upload has finished processing.", ts: now, read: false, meta: { type: "upload" } };
    const next = [n, ...notifications];
    setNotifications(next);
    writeJSON(STORAGE_NOTIFS, next);
    try { window.dispatchEvent(new CustomEvent("conseqx:notifications:updated", {detail:{}})); } catch {}
  }

  const signedInText = auth?.user ? `Signed in as ${auth.user.name || auth.user.email}` : "Not signed in";

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <style>{HIDE_SCROLL_CSS}</style>
      <nav className={`fixed w-full z-50 ${darkMode ? "bg-gray-900/90 text-gray-100" : "bg-white/90 text-gray-900"} backdrop-blur-sm py-3 shadow-sm`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="sm:hidden p-2" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu"><FaBars /></button>
            <img src={Logo3D} alt="logo" className="h-10" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-right mr-3">
              <div className={darkMode ? "text-gray-300" : "text-gray-500"}>{signedInText}</div>
            </div>

            <button onClick={() => setDarkMode((s) => !s)} aria-label="Toggle theme" className={`p-2 rounded-full ${darkMode ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-400"}`}>
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            {/* Notification bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((s) => !s)}
                aria-label="Notifications"
                className={`relative p-2 rounded-full hover:bg-gray-100 ${darkMode ? "hover:bg-gray-800" : ""}`}
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 w-96 max-h-[420px] rounded-lg shadow-xl overflow-hidden z-50 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
                  <div className="p-3 flex items-center justify-between border-b" style={{ borderColor: darkMode ? "rgba(255,255,255,0.03)" : undefined }}>
                    <div className="font-semibold">Notifications</div>
                    <div className="flex items-center gap-2">
                      <button onClick={seedMock} className="text-xs px-2 py-1 rounded border">Seed</button>
                      <button onClick={markAllRead} className="text-xs px-2 py-1 rounded border">Mark all read</button>
                    </div>
                  </div>

                  <div className="p-2 overflow-auto nice-scroll" style={{ maxHeight: 320 }}>
                    {/* unread first, sorted by ts desc */}
                    {(() => {
                      const sorted = (notifications || []).slice().sort((a, b) => b.ts - a.ts);
                      const unread = sorted.filter((n) => !n.read);
                      const read = sorted.filter((n) => n.read);
                      return (
                        <>
                          {unread.length === 0 && read.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}
                          {unread.map((n) => (
                            <div key={n.id} className={`p-3 rounded-md mb-2 cursor-pointer ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`} onClick={() => openNotification(n)}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-medium">{n.title}</div>
                                <div className="text-xs text-gray-400">{new Date(n.ts).toLocaleString()}</div>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">{n.body}</div>
                            </div>
                          ))}
                          {read.map((n) => (
                            <div key={n.id} className={`p-3 rounded-md mb-2 opacity-80 cursor-pointer ${darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`} onClick={() => openNotification(n)}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-medium">{n.title}</div>
                                <div className="text-xs text-gray-400">{new Date(n.ts).toLocaleString()}</div>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">{n.body}</div>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  <div className="p-2 border-t text-xs" style={{ borderColor: darkMode ? "rgba(255,255,255,0.03)" : undefined }}>
                    <div className="flex items-center justify-between">
                      <div className="text-gray-400">Manage</div>
                      <div>
                        <button onClick={() => { writeJSON(STORAGE_NOTIFS, []); setNotifications([]); }} className="px-2 py-1 rounded text-xs border">Clear all</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* small nav (desktop only) */}
            <div className="hidden sm:flex items-center gap-3 ml-2">
              <button onClick={() => navigate("/ceo/dashboard")} className="text-sm px-3 py-1 rounded">Dashboard</button>
              <button onClick={() => navigate("/ceo/data")} className="text-sm px-3 py-1 rounded">Data</button>
            </div>
          </div>
        </div>
      </nav>

      {/* mobile menu drawer (kept simple) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className={`absolute left-0 top-0 h-full w-72 p-4 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><img src={Logo3D} className="h-8" alt="logo" /><div className="font-semibold">ConseQ-X</div></div>
              <button onClick={() => setMobileMenuOpen(false)}><FaTimes /></button>
            </div>
            <nav className="flex flex-col gap-2">
              <button onClick={() => { navigate("/ceo/dashboard"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded">Dashboard</button>
              <button onClick={() => { navigate("/ceo/assessments"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded">Assessments</button>
              <button onClick={() => { navigate("/ceo/data"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded">Data Management</button>
              <button onClick={() => { navigate("/ceo/org-health"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded">Org Health</button>
              <button onClick={() => { navigate("/ceo/reports"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded">Reports</button>
            </nav>
          </aside>
        </div>
      )}

      {/* page container */}
      <div className="pt-20">
        <Outlet context={{ darkMode, toggleDarkMode: () => setDarkMode((s) => !s), user: auth.user, org: auth.org }} />
      </div>

      <footer className={`w-full py-6 border-t ${darkMode ? "border-gray-700 bg-gray-900 text-gray-300" : "border-gray-200 bg-white text-gray-700"}`}>
        <div className="container mx-auto px-4 text-sm">© {new Date().getFullYear()} Conseq-X</div>
      </footer>
    </div>
  );
}
