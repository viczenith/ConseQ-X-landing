import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CEOModal({ open, onClose, prefillEmail = "", prefillOrgName = "", prefillName = "" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(prefillEmail || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(prefillEmail || "");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setIsLogin(true);
    }
  }, [open, prefillEmail]);

  if (!open) return null;

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    if (!email) return setError("Email is required");
    if (!phone) return setError("Phone is required");
    if (!password || password.length < 4) return setError("Password must be at least 4 characters");
    if (password !== confirmPassword) return setError("Passwords must match");
    setBusy(true);
    try {
      await auth.register?.({ orgName: prefillOrgName || "Org", ceoName: prefillName || email.split("@")[0], email, phone, password });
      // switch to login after successful signup
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      setError("Account created — please sign in");
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    if (!email) return setError("Email required");
    if (!password) return setError("Password required");
    setBusy(true);
    try {
      const res = await auth.login?.({ email, password });
      if (!res) {
        // permissive: register on the fly then login
        await auth.register?.({ orgName: prefillOrgName || "Org", ceoName: prefillName || email.split("@")[0], email, phone, password });
        await auth.login?.({ email, password });
      }
      onClose && onClose();
      // navigate to CEO dashboard
      navigate("/ceo");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-semibold">Conseq-X Ultra</h3>
            <p className="text-sm opacity-90">Executive workspace — sign in or create an account to continue.</p>
          </div>
          <button onClick={onClose} className="text-white"><FaTimes /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Organization</div>
            <div className="font-semibold text-lg">{prefillOrgName || "Not provided"}</div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">Contact</div>
            <div>{email || <span className="text-gray-400">Not provided</span>}</div>

            <div className="mt-4 text-xs text-gray-500">
              By using Conseq-X Ultra you agree to receive onboarding emails. This is a mock signup (dev-only).
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">{isLogin ? "Sign in" : "Create account"}</div>
              <button className="text-xs text-blue-600" onClick={() => { setIsLogin((s) => !s); setError(null); }}>
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

            {!isLogin ? (
              <form onSubmit={handleSignup} className="space-y-3">
                <label className="text-xs text-gray-600">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded border" placeholder="you@company.com" />

                <label className="text-xs text-gray-600">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded border" placeholder="+234..." />

                <label className="text-xs text-gray-600">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded border" placeholder="Create a password" />

                <label className="text-xs text-gray-600">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded border" placeholder="Confirm password" />

                <div className="flex items-center justify-between">
                  <button type="submit" disabled={busy} className="px-4 py-2 bg-indigo-600 text-white rounded">{busy ? "Registering..." : "Create Account"}</button>
                  <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <label className="text-xs text-gray-600">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded border" placeholder="you@company.com" />

                <label className="text-xs text-gray-600">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded border" placeholder="Your password" />

                <div className="flex items-center justify-between">
                  <button type="submit" disabled={busy} className="px-4 py-2 bg-indigo-600 text-white rounded">{busy ? "Signing in..." : "Sign in & Open Dashboard"}</button>
                  <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
