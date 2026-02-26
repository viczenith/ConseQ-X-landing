import React, { useEffect, useState } from "react";
import { FaTimes, FaCheck, FaEnvelope, FaCrown, FaRocket, FaShieldAlt, FaBolt, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { useAuth } from "../contexts/AuthContext";

export default function UpsellModal({
  open,
  onClose = () => {},
  // eslint-disable-next-line no-unused-vars
  onUpgrade = () => {},
  darkMode: darkModeProp,
  // eslint-disable-next-line no-unused-vars
  redirectTo = "/ceo",
}) {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");
  const [isDark, setIsDark] = useState(
    Boolean(
      typeof document !== "undefined" &&
        (darkModeProp ?? document.documentElement.classList.contains("dark"))
    )
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (typeof darkModeProp === "boolean") {
      setIsDark(darkModeProp);
      return;
    }
    const el = document.documentElement;
    const obs = new MutationObserver(() =>
      setIsDark(el.classList.contains("dark"))
    );
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    setIsDark(el.classList.contains("dark"));
    return () => obs.disconnect();
  }, [darkModeProp]);

  useEffect(() => {
    if (open) setBilling("monthly");
  }, [open]);

  // base prices
  const BASE_MONTHLY = 39900;
  const BASE_YEARLY = 399000;

  const PRICES = {
    daily: { amount: Math.round(BASE_MONTHLY / 30), label: "per day" },
    weekly: { amount: Math.round(BASE_MONTHLY / 4), label: "per week" },
    monthly: { amount: BASE_MONTHLY, label: "per month" },
    yearly: { amount: BASE_YEARLY, label: "per year" },
  };

  if (!open) return null;
  const price = PRICES[billing];
  const yearlySavings = BASE_MONTHLY * 12 - BASE_YEARLY;
  const monthlyEquivalent = Math.round(BASE_YEARLY / 12);

  function handleGetUltra() {
    // Close modal and navigate to billing page for purchase
    try { onClose && onClose(); } catch (e) { console.warn(e); }
    navigate("/ceo/billing", { replace: true });
  }

  // theme-aware classes
  const containerBg = isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";
  const panelBorder = isDark ? "border-gray-800" : "border-gray-100";
  const subtleText = isDark ? "text-gray-300" : "text-gray-600";
  const featureBg = isDark ? "bg-gray-800/60 border-gray-700/50" : "bg-gradient-to-br from-gray-50 to-indigo-50/30 border-gray-100";
  const smallText = isDark ? "text-gray-400" : "text-gray-500";

  const billingOptions = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly", popular: true },
    { key: "yearly", label: "Yearly", badge: "Save " + Math.round((yearlySavings / (BASE_MONTHLY * 12)) * 100) + "%" },
  ];

  const features = [
    { text: "Unlimited AI analyses", icon: <FaBolt className="text-amber-400" /> },
    { text: "CEO multi-user dashboard", icon: <FaCrown className="text-amber-400" /> },
    { text: "Priority support & onboarding", icon: <FaRocket className="text-blue-400" /> },
    { text: "Growth forecasting & scenario modeling", icon: <FaStar className="text-purple-400" /> },
    { text: "Team invites & role management", icon: <FaShieldAlt className="text-emerald-400" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Conseq-X Ultra"
      style={{ backgroundColor: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
    >
      {/* Inline animations */}
      <style>{`
        @keyframes upsellShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes upsellFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .upsell-shimmer { background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%); background-size: 200% 100%; animation: upsellShimmer 3s ease-in-out infinite; }
        .upsell-float { animation: upsellFloat 3s ease-in-out infinite; }
      `}</style>

      <div className={`w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl ${containerBg} border ${panelBorder}`}
        style={{ boxShadow: isDark ? "0 25px 80px rgba(99,102,241,0.15), 0 0 1px rgba(255,255,255,0.05)" : "0 25px 80px rgba(99,102,241,0.12)" }}
      >
        {/* ── Premium Header ── */}
        <div className="relative overflow-hidden px-6 py-6"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #3730a3 70%, #4338ca 100%)"
              : "linear-gradient(135deg, #4338ca 0%, #4f46e5 30%, #6366f1 60%, #818cf8 100%)",
          }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="absolute top-0 left-0 w-full h-full upsell-shimmer pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center upsell-float"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 8px 24px rgba(245,158,11,0.4)" }}
              >
                <FaCrown className="text-lg text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  ConseQ-X <span className="text-yellow-300">Ultra</span>
                </h2>
                <p className="mt-0.5 text-sm text-white/80 max-w-md">
                  Executive-grade AI, CEO Dashboard, unlimited analyses & priority support
                </p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close upgrade modal" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/30">
              <FaTimes className="text-white text-sm" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={`p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* LEFT: Pricing */}
            <div className="space-y-5">
              {/* Price display */}
              <div className={`rounded-2xl p-4 ${isDark ? "bg-gray-800/50 border border-gray-700/50" : "bg-gray-50 border border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${smallText}`}>Subscription</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                        ₦{price.amount.toLocaleString()}
                      </span>
                      <span className={`text-sm ${subtleText}`}>{price.label}</span>
                    </div>
                    {billing === "yearly" && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs ${smallText}`}>₦{monthlyEquivalent.toLocaleString()}/mo equivalent</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          SAVE ₦{yearlySavings.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (navigator && navigator.clipboard) navigator.clipboard.writeText("sales@conseq-x.com");
                    }}
                    title="Copy sales@conseq-x.com"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      isDark ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaEnvelope className="text-xs" />
                    <span className="hidden sm:inline">Contact Sales</span>
                  </button>
                </div>
              </div>

              {/* Billing period pills */}
              <div>
                <div className={`text-xs font-medium mb-2 ${smallText}`}>Billing Period</div>
                <div className="grid grid-cols-4 gap-2">
                  {billingOptions.map(({ key, label, popular, badge }) => (
                    <button
                      key={key}
                      onClick={() => setBilling(key)}
                      className={`relative px-2 py-2 rounded-xl text-sm font-semibold transition-all text-center ${
                        billing === key
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                          : isDark
                            ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-indigo-500/50 hover:text-gray-100"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-gray-800"
                      }`}
                    >
                      {popular && billing !== key && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white uppercase">
                          Popular
                        </span>
                      )}
                      {badge && billing === key && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                          {badge}
                        </span>
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Get Ultra CTA */}
              <button
                onClick={handleGetUltra}
                className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-extrabold text-white transition-all shadow-xl hover:shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%)",
                  boxShadow: "0 12px 40px rgba(99,102,241,0.35)",
                }}
              >
                <FaRocket className="text-base group-hover:translate-x-0.5 transition-transform" />
                Get Ultra
              </button>

              <div className={`text-[11px] text-center ${smallText}`}>
                Payment options: daily, weekly, monthly or yearly. Prices in Naira (₦).
              </div>
            </div>

            {/* RIGHT: Features */}
            <div className={`rounded-2xl p-5 border ${featureBg}`}>
              <div className="flex items-center gap-2 mb-4">
                <FaStar className="text-amber-400 text-sm" />
                <span className={`text-sm font-bold ${isDark ? "text-gray-100" : "text-gray-800"}`}>Everything included</span>
              </div>

              <ul className="space-y-3.5">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isDark ? "bg-gray-700/60" : "bg-white shadow-sm"
                    }`}>
                      {feat.icon}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{feat.text}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className={`mt-5 pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-200/60"}`}>
                <div className={`text-[11px] ${smallText}`}>
                  Secure checkout and enterprise invoicing available. For bespoke plans email{" "}
                  <a href="mailto:sales@conseq-x.com" className="text-indigo-400 hover:text-indigo-300 underline">sales@conseq-x.com</a>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-t ${panelBorder} ${isDark ? "bg-gray-900/80" : "bg-gray-50/80"}`}>
          <div className="flex items-center gap-4">
            {[
              { icon: <FaShieldAlt className="text-[10px]" />, text: "Secure" },
              { icon: <FaBolt className="text-[10px]" />, text: "Instant" },
              { icon: <FaCheck className="text-[10px]" />, text: "Enterprise-ready" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-[11px] ${smallText}`}>
                <span className="text-indigo-400">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
          <div className={`text-[11px] ${smallText}`}>Free runs unlock after upgrade</div>
        </div>
      </div>
    </div>
  );
}

