const KEY = "conseqx_auth_v1";

function nowTs() { return Date.now(); }
function defaultState() {
  return {
    user: null,
    orgs: {},    // orgId -> org
    membersIndex: {}, // email -> { orgId, memberId } (quick lookup)
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch (e) { return defaultState(); }
}
function saveState(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

// Helper to create a user id
function uid(prefix = "u") {
  return `${prefix}_${Math.random().toString(36).slice(2,9)}`;
}

/**
 * Register org + CEO (with phone & password)
 * Accepts { orgName, ceoName, email, phone, password }
 * Returns { user, org }
 */
export function mockRegisterOrg({ orgName, ceoName, email, phone = "", password = "" }) {
  const state = loadState();

  // If email already exists, return existing user/org and overwrite credentials (mock)
  const existing = state.membersIndex[email];
  if (existing) {
    const org = state.orgs[existing.orgId];
    const member = org.members.find(m => m.id === existing.memberId);
    // update stored credentials in mock
    member.phone = phone || member.phone;
    member.password = password || member.password;
    member.name = ceoName || member.name;
    state.user = { id: member.id, name: member.name, email: member.email, role: member.role, orgId: org.id };
    saveState(state);
    return { user: state.user, org };
  }

  const orgId = "org_" + Math.random().toString(36).slice(2,9);
  const userId = uid("user");
  const org = {
    id: orgId,
    name: orgName || `${ceoName || "Org"}'s Org`,
    members: [{ id: userId, name: ceoName || email.split("@")[0], role: "CEO", email, phone, password }],
    subscription: { tier: "free", expiresAt: Date.now() + 6 * 3600 * 1000 } // 6 hours freemium
  };
  state.orgs[orgId] = org;
  state.membersIndex[email] = { orgId, memberId: userId };
  state.user = { id: userId, name: org.members[0].name, email, role: "CEO", orgId };
  saveState(state);
  return { user: state.user, org };
}

/**
 * Mock login.
 * Accepts either:
 *   - { email, password } (normal)
 * If user not found or password mismatch, fallback to register if fallbackRegister=true (default true)
 *
 * Returns { user, org } or null if login failed and fallback disabled.
 */
export function mockLogin({ email, password = "", fallbackRegister = true, prefillOrgName = null, prefillName = null }) {
  const state = loadState();
  const lookup = state.membersIndex[email];
  if (lookup) {
    const org = state.orgs[lookup.orgId];
    const member = org.members.find(m => m.id === lookup.memberId);
    // if no password was set (legacy mock), accept login
    if (!member.password || !password || member.password === password) {
      state.user = { id: member.id, name: member.name, email: member.email, role: member.role, orgId: org.id };
      saveState(state);
      return { user: state.user, org };
    }
    // password mismatch -> fallback if allowed
    if (!fallbackRegister) return null;
    // fallback: sign in anyway (mock permissive) OR create fresh account — we will sign in anyway
    state.user = { id: member.id, name: member.name, email: member.email, role: member.role, orgId: org.id };
    saveState(state);
    return { user: state.user, org };
  } else {
    if (!fallbackRegister) return null;
    // create a new org & user automatically (lightweight)
    return mockRegisterOrg({ orgName: prefillOrgName || `${email.split("@")[1] || "Org"}`, ceoName: prefillName || email.split("@")[0], email, phone: "", password });
  }
}

export function mockLogout() {
  const state = loadState();
  state.user = null;
  saveState(state);
}

export function mockInviteMember(orgId, { name, email, role = "Member", phone = "", password = "" }) {
  const state = loadState();
  const org = state.orgs[orgId];
  if (!org) throw new Error("Org not found");
  const id = uid("user");
  const member = { id, name, email, role, phone, password };
  org.members.push(member);
  state.membersIndex[email] = { orgId: org.id, memberId: id };
  saveState(state);
  return member;
}

export function mockUpgradeOrgToPremium(orgId) {
  const state = loadState();
  const org = state.orgs[orgId];
  if (!org) throw new Error("Org not found");
  org.subscription = { tier: "premium", expiresAt: Date.now() + 1000 * 3600 * 24 * 365 }; // 1 year
  saveState(state);
  return org.subscription;
}

export function getCurrentUser() { return loadState().user; }
export function getOrg(orgId) { return loadState().orgs[orgId]; }
export function getCurrentOrg() {
  const s = loadState();
  return s.user ? s.orgs[s.user.orgId] : null;
}

export function ensureFreemium(orgId, hours = 6) {
  const state = loadState();
  const org = state.orgs[orgId];
  if (!org) return;
  if (!org.subscription || !org.subscription.expiresAt) {
    org.subscription = { tier: "free", expiresAt: Date.now() + hours * 3600 * 1000 };
    saveState(state);
  }
}
