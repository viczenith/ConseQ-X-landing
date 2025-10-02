// src/pages/CEO_Dashboard/CEODashboardComponents/Team.js
import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaUserPlus, FaTrash, FaShareAlt, FaEnvelope, FaDownload, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

/* localStorage key */
const KEY_TEAM = "conseqx_team_v1";

/* helpers */
const emailIsValid = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim().toLowerCase());
const now = () => Date.now();
const idFor = (prefix = "t") => `${prefix}-${now().toString(36)}-${Math.floor(Math.random()*9000 + 1000)}`;

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

/* Small presentational modal (accessible-ish) */
function Modal({ open, title, onClose, children, actions, darkMode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(2,6,23,0.6)" : "rgba(2,6,23,0.18)" }}
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-lg mx-auto rounded-2xl p-5 ${
          darkMode ? "bg-gray-900 border border-gray-700 text-gray-100 shadow-2xl" : "bg-white border border-gray-100 text-gray-900 shadow-xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} aria-label="Close modal" className={`${darkMode ? "text-gray-300" : "text-gray-600"} ml-2`}>✕</button>
        </div>

        <div className="mt-4 max-h-[65vh] overflow-auto hide-scrollbar">{children}</div>

        {actions && <div className="mt-4 flex justify-end gap-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

/* Confirm modal wrapper */
function ConfirmModal({ open, title, message, onCancel, onConfirm, darkMode }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      darkMode={darkMode}
      actions={
        <>
          <button onClick={onCancel} className="px-3 py-2 rounded-md border">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-md bg-red-600 text-white">Confirm</button>
        </>
      }
    >
      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{message}</div>
    </Modal>
  );
}

/* FancySelect wrapper to style native select while remaining accessible */
function FancySelect({ value, onChange, options = [], darkMode, className = "", ariaLabel }) {
  return (
    <div className={`relative inline-block w-full ${className}`}>
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`appearance-none w-full pr-10 pl-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <FaChevronDown className={`${darkMode ? "text-gray-300" : "text-gray-500"}`} />
      </div>
    </div>
  );
}

/* MAIN COMPONENT */
export default function CEOTeam() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();

  // load or default structure:
  const [store, setStore] = useState(() =>
    readJSON(KEY_TEAM, {
      members: [],
      invites: [],
    })
  );

  // form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor"); // admin|editor|viewer
  const [busy, setBusy] = useState(false);

  // UI state
  const [confirmRemove, setConfirmRemove] = useState({ open: false, memberId: null });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [membersFilter, setMembersFilter] = useState("all"); // all|active|pending
  const [infoModal, setInfoModal] = useState({ open: false, title: "", content: null });

  // persist store when it changes
  useEffect(() => {
    writeJSON(KEY_TEAM, store);
  }, [store]);

  // derived counts
  const counts = useMemo(() => {
    const members = store.members.length;
    const pending = store.invites.length;
    return { members, pending, total: members + pending };
  }, [store]);

  /* ---------- actions ---------- */

  function sanitizeEmail(e) {
    return String(e || "").trim().toLowerCase();
  }

  // Simulate sending invite; in prod call API and email provider.
  async function simulateSendInvite(invite) {
    await new Promise((r) => setTimeout(r, 350));
    setStore((prev) => {
      const invites = prev.invites.map((iv) => (iv.id === invite.id ? { ...iv, sentCount: (iv.sentCount || 0) + 1, createdAt: iv.createdAt || now() } : iv));
      return { ...prev, invites };
    });
    return true;
  }

  async function handleCreateInvite(e) {
    e?.preventDefault();
    const email = sanitizeEmail(inviteEmail);
    if (!emailIsValid(email)) {
      setInfoModal({ open: true, title: "Invalid email", content: <div>Please enter a valid email address.</div> });
      return;
    }
    if (!inviteRole) {
      setInfoModal({ open: true, title: "Pick a role", content: <div>Select a role for this invite (Admin / Editor / Viewer)</div> });
      return;
    }

    if (store.members.some((m) => sanitizeEmail(m.email) === email)) {
      setInfoModal({ open: true, title: "Already a member", content: <div>This email is already a member of your org.</div> });
      return;
    }
    if (store.invites.some((iv) => sanitizeEmail(iv.email) === email)) {
      setInfoModal({ open: true, title: "Invite pending", content: <div>An invite is already pending for this address.</div> });
      return;
    }

    setBusy(true);
    const token = idFor("inv");
    const invite = { id: idFor("i"), email, role: inviteRole, token, createdAt: now(), expiresAt: now() + 14 * 24 * 3600 * 1000, sentCount: 0 };

    setStore((prev) => ({ ...prev, invites: [invite, ...prev.invites] }));

    try {
      await simulateSendInvite(invite);
      setInviteEmail("");
      setInviteRole("editor");
      setShowInviteModal(false);
      setInfoModal({ open: true, title: "Invite sent", content: <div>Invitation created and (simulated) sent. Use "Resend" if needed.</div> });
    } catch (err) {
      setStore((prev) => ({ ...prev, invites: prev.invites.filter((iv) => iv.id !== invite.id) }));
      setInfoModal({ open: true, title: "Send failed", content: <div>Unable to send invite — try again.</div> });
    } finally {
      setBusy(false);
    }
  }

  function handleCancelInvite(inviteId) {
    setStore((prev) => ({ ...prev, invites: prev.invites.filter((iv) => iv.id !== inviteId) }));
  }

  async function handleResendInvite(invite) {
    setBusy(true);
    await simulateSendInvite(invite);
    setBusy(false);
    setInfoModal({ open: true, title: "Resent", content: <div>Invite resent to {invite.email}.</div> });
  }

  function acceptInviteToMember(inviteId) {
    const invite = store.invites.find((i) => i.id === inviteId);
    if (!invite) return;
    const newMember = {
      id: idFor("m"),
      name: invite.email.split("@")[0],
      email: invite.email,
      role: invite.role,
      addedAt: now(),
    };
    setStore((prev) => ({
      members: [newMember, ...prev.members],
      invites: prev.invites.filter((i) => i.id !== inviteId),
    }));
  }

  function handleChangeMemberRole(memberId, role) {
    setStore((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
    }));
  }

  function handleConfirmRemoveMember(memberId) {
    setConfirmRemove({ open: true, memberId });
  }

  function handleRemoveMember() {
    const id = confirmRemove.memberId;
    setStore((prev) => ({ ...prev, members: prev.members.filter((m) => m.id !== id) }));
    setConfirmRemove({ open: false, memberId: null });
  }

  /* export members CSV */
  function exportCSV() {
    const rows = [["name", "email", "role", "addedAt"]];
    store.members.forEach((m) => rows.push([m.name, m.email, m.role, new Date(m.addedAt).toISOString()]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conseqx_team_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* copy invite link */
  function copyInviteLink(invite) {
    const link = `${window.location.origin}/invite/${invite.token}`;
    navigator.clipboard && navigator.clipboard.writeText(link);
    setInfoModal({ open: true, title: "Copied", content: <div>Invite link copied to clipboard.</div> });
  }

  /* role badge colors */
  const roleColors = {
    admin: "bg-yellow-400 text-black",
    editor: "bg-indigo-600 text-white",
    viewer: "bg-gray-300 text-black",
  };

  /* small injected styles: hide scrollbar and improve select focus */
  const injectedStyle = `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .fancy-select select:focus { box-shadow: 0 0 0 4px rgba(99,102,241,0.12); }
  `;

  // readable light-mode text classes
  const primaryLight = "text-gray-900";
  const secondaryLight = "text-gray-600";
  const subtleLight = "text-gray-500";

  return (
    <section className="p-4 sm:p-6 md:p-8">
      <style>{injectedStyle}</style>

      <Modal open={infoModal.open} title={infoModal.title} onClose={() => setInfoModal({ open: false })} actions={<button onClick={() => setInfoModal({ open: false })} className="px-3 py-2 rounded-md border">Close</button>} darkMode={darkMode}>
        <div className={`${darkMode ? "text-gray-200" : primaryLight}`}>{infoModal.content}</div>
      </Modal>

      <ConfirmModal
        open={confirmRemove.open}
        title="Remove team member"
        message="Are you sure you want to remove this member from your organization? This action cannot be undone here (dev-mode)."
        onCancel={() => setConfirmRemove({ open: false, memberId: null })}
        onConfirm={handleRemoveMember}
        darkMode={darkMode}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-100" : primaryLight}`}>Team</h2>
          <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : secondaryLight}`}>Invite teammates, manage roles & permissions for the workspace.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={`text-xs ${darkMode ? "text-gray-300" : subtleLight}`}>{counts.members} members · {counts.pending} invites</div>
          <button onClick={() => setShowInviteModal(true)} className="ml-0 md:ml-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center gap-2 w-full md:w-auto justify-center">
            <FaUserPlus /> Invite
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members panel */}
        <div className={`${darkMode ? "bg-gray-900 text-gray-100 border border-gray-700" : "bg-white text-gray-900 border border-gray-100"} rounded-2xl p-4 lg:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Members</div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="w-full md:w-auto fancy-select">
                <FancySelect
                  value={membersFilter}
                  onChange={(e) => setMembersFilter(e.target.value)}
                  darkMode={darkMode}
                  ariaLabel="Filter members"
                  options={[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active members" },
                    { value: "pending", label: "Pending invites" },
                  ]}
                />
              </div>

              <button onClick={exportCSV} title="Export members" className="px-2 py-1 rounded-md border ml-0 md:ml-2">
                <FaDownload />
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-4">
            {/* Pending invites */}
            {store.invites.length > 0 && (membersFilter === "all" || membersFilter === "pending") && (
              <div>
                <div className={`text-xs ${darkMode ? "text-gray-300" : subtleLight} mb-2`}>Pending invites</div>
                <div className="space-y-2 max-h-56 overflow-auto hide-scrollbar">
                  {store.invites.map((iv) => (
                    <div key={iv.id} className={`${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"} p-3 rounded-md flex items-center justify-between gap-3`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{iv.email}</div>
                          <div className={`text-xs px-2 py-0.5 rounded ${roleColors[iv.role] || "bg-gray-300"}`}>{iv.role}</div>
                        </div>
                        <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : subtleLight}`}>Sent: {iv.createdAt ? new Date(iv.createdAt).toLocaleString() : "—"}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button title="Copy invite link" onClick={() => copyInviteLink(iv)} className="px-2 py-1 rounded-md border" aria-label={`Copy invite link for ${iv.email}`}>
                          <FaShareAlt />
                        </button>

                        <button title="Resend invite" onClick={() => handleResendInvite(iv)} className="px-2 py-1 rounded-md border" aria-label={`Resend invite to ${iv.email}`}>
                          <FaEnvelope />
                        </button>

                        <button title="Cancel invite" onClick={() => handleCancelInvite(iv.id)} className="px-2 py-1 rounded-md border text-red-600" aria-label={`Cancel invite for ${iv.email}`}>
                          Cancel
                        </button>

                        <button title="Simulate accept" onClick={() => acceptInviteToMember(iv.id)} className="px-2 py-1 rounded-md border text-green-600" aria-label={`Simulate accept for ${iv.email}`}>
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members list */}
            <div>
              <div className={`text-xs ${darkMode ? "text-gray-300" : subtleLight} mb-2`}>Active members</div>
              <div className="space-y-2">
                {store.members.length === 0 ? (
                  <div className={`text-sm ${darkMode ? "text-gray-300" : subtleLight}`}>No members yet. Invite colleagues to collaborate.</div>
                ) : (
                  <div className="space-y-2">
                    {store.members.map((m) => (
                      <div key={m.id} className={`${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"} p-3 rounded-md flex items-center justify-between gap-3`}>
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {String(m.name || m.email || "U").slice(0,1).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="font-medium truncate">{m.name || m.email}</div>
                            <div className={`text-xs ${darkMode ? "text-gray-400" : subtleLight} truncate`}>{m.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-36">
                            <FancySelect
                              value={m.role}
                              onChange={(e) => handleChangeMemberRole(m.id, e.target.value)}
                              darkMode={darkMode}
                              ariaLabel={`Change role for ${m.email}`}
                              options={[
                                { value: "admin", label: "Admin" },
                                { value: "editor", label: "Editor" },
                                { value: "viewer", label: "Viewer" },
                              ]}
                            />
                          </div>

                          <button title="Remove" onClick={() => handleConfirmRemoveMember(m.id)} className="px-2 py-1 rounded-md border text-red-600" aria-label={`Remove member ${m.email}`}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: quick actions & invite form */}
        <aside className={`${darkMode ? "bg-gray-900 text-gray-100 border border-gray-700" : "bg-white text-gray-900 border border-gray-100"} rounded-2xl p-4`}>
          <div className="text-sm font-semibold">Invite teammate</div>
          <div className={`mt-1 text-xs ${darkMode ? "text-gray-300" : secondaryLight}`}>Add a colleague by email and pick a role.</div>

          <form onSubmit={handleCreateInvite} className="mt-3 space-y-3">
            <div>
              <label className={`text-xs ${darkMode ? "text-gray-300" : subtleLight}`}>Email</label>
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full mt-1 px-3 py-2 rounded border text-sm focus:outline-none ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
                }`}
                aria-label="Invite email"
              />
            </div>

            <div>
              <label className={`text-xs ${darkMode ? "text-gray-300" : subtleLight}`}>Role</label>
              <div className="mt-1">
                <FancySelect
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  darkMode={darkMode}
                  ariaLabel="Invite role"
                  options={[
                    { value: "admin", label: "Admin — full access" },
                    { value: "editor", label: "Editor — create & edit" },
                    { value: "viewer", label: "Viewer — read-only" },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button type="submit" disabled={busy} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center gap-2 justify-center w-full sm:w-auto">
                <FaUserPlus /> {busy ? "Sending..." : "Send invite"}
              </button>
              <button type="button" onClick={() => { setInviteEmail(""); setInviteRole("editor"); }} className="px-3 py-2 rounded-md border w-full sm:w-auto">Clear</button>
            </div>
          </form>

          {/* <div className={`mt-4 border-t pt-3 text-xs ${darkMode ? "text-gray-400" : subtleLight}`}>
            <div className="mb-2">Quick actions</div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowInviteModal(true)} className="px-3 py-2 rounded-md border w-full text-sm">Open full invite modal</button>
              <button onClick={() => setInfoModal({ open: true, title: "Team management", content: <div className="text-sm">Team data is local in dev mode. Wire it to your backend (GET/POST/PATCH/DELETE endpoints) to persist centrally.</div> })} className="px-3 py-2 rounded-md border w-full text-sm">
                About sync
              </button>
            </div>
          </div> */}
        </aside>
      </div>

      {/* large Invite modal (duplicate of the small form) */}
      <Modal
        open={showInviteModal}
        title="Invite teammate"
        onClose={() => setShowInviteModal(false)}
        actions={
          <>
            <button onClick={() => setShowInviteModal(false)} className="px-3 py-2 rounded-md border">Close</button>
            <button onClick={handleCreateInvite} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">Create invite</button>
          </>
        }
        darkMode={darkMode}
      >
        <div className="space-y-3">
          <div>
            <label className={`text-xs ${darkMode ? "text-gray-300" : subtleLight}`}>Email</label>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@company.com"
              className={`w-full mt-1 px-3 py-2 rounded border text-sm ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}
            />
          </div>

          <div>
            <label className={`text-xs ${darkMode ? "text-gray-300" : subtleLight}`}>Role</label>
            <div className="mt-1">
              <FancySelect
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                darkMode={darkMode}
                ariaLabel="Invite role"
                options={[
                  { value: "admin", label: "Admin — full access" },
                  { value: "editor", label: "Editor — create & edit" },
                  { value: "viewer", label: "Viewer — read-only" },
                ]}
              />
            </div>
          </div>

          <div className={`text-xs ${darkMode ? "text-gray-400" : subtleLight}`}>Invites expire in 14 days by default. In production, use server-side expiry & audit logs.</div>
        </div>
      </Modal>
    </section>
  );
}
