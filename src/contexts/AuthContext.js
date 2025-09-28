import React, { createContext, useContext, useEffect, useState } from "react";
const STORAGE_KEY = "conseqx_auth_mock";

const defaultState = {
  users: {},
  orgs: {},
  sessions: {},
  current: null,
};

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...defaultState };
  } catch (e) {
    return { ...defaultState };
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => readState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    writeState(state);
  }, [state]);

  const register = async ({ orgName, ceoName, email, phone, password }) => {
    setLoading(true);
    try {
      if (!email) throw new Error("Email required");
      const s = readState();
      // if user exists, throw
      if (s.users[email]) {
        throw new Error("User already exists");
      }
      // create org id
      const orgId = (orgName || "Org").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
      s.orgs[orgId] = {
        id: orgId,
        name: orgName || "Organization",
        subscription: { tier: "free", expiresAt: null },
      };
      s.users[email] = { email, name: ceoName || email.split("@")[0], phone: phone || "", password: password || "", orgId };
      s.current = email;
      setState(s);
      return { user: s.users[email], org: s.orgs[orgId] };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const s = readState();
      const user = s.users[email];
      if (!user) {
        return null;
      }
      if (password && user.password && password !== user.password) {
        throw new Error("Invalid password");
      }
      s.current = email;
      setState(s);
      return { user: s.users[email], org: s.orgs[user.orgId] };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const s = readState();
    s.current = null;
    setState(s);
  };

  const upgrade = ({ months = 12, tier = "premium" } = {}) => {
    // set current org subscription to premium for months
    const s = readState();
    const email = s.current;
    if (!email) return;
    const user = s.users[email];
    if (!user) return;
    const org = s.orgs[user.orgId];
    if (!org) return;
    const now = Date.now();
    const expiresAt = now + (months * 30 * 24 * 60 * 60 * 1000);
    org.subscription = { tier, expiresAt };
    setState(s);
    return org;
  };

  const getCurrent = () => {
    const s = readState();
    const email = s.current;
    if (!email) return null;
    const user = s.users[email];
    if (!user) return null;
    const org = s.orgs[user.orgId];
    return { user, org };
  };

  const ctx = {
    loading,
    register,
    login,
    logout,
    upgrade,
    getCurrent,
    // convenience properties that read live
    get user() {
      const cur = getCurrent();
      return cur?.user || null;
    },
    get org() {
      const cur = getCurrent();
      return cur?.org || null;
    },
  };

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

