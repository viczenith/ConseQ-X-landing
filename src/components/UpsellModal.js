import React, { useEffect, useState } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function UpsellModal({ open, onClose = () => {}, onUpgrade = () => {}, darkMode: darkModeProp }) {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly"); // 'monthly' | 'yearly'
  const [isDark, setIsDark] = useState(Boolean(typeof document !== "undefined" && (darkModeProp ?? document.documentElement.classList.contains("dark"))));

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (typeof darkModeProp === "boolean") {
      setIsDark(darkModeProp);
      return;
    }
    
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setIsDark(el.classList.contains("dark"));
    });
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    // initial sync
    setIsDark(el.classList.contains("dark"));
    return () => obs.disconnect();
  }, [darkModeProp]);

  useEffect(() => {
    if (open) setBilling("monthly");
  }, [open]);

  const PRICES = {
    monthly: { amount: 39900, label: "per month" },
    yearly: { amount: 399000, label: "per year" },
  };

  if (!open) return null;
  const price = PRICES[billing];

  async function handleGetUltra() {
    try {
      const maybePromise = onUpgrade({ period: billing, amount: price.amount });
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } catch (err) {
      console.error("Upgrade handler error:", err);
    } finally {
      try { onClose && onClose(); } catch (e) {}
      navigate("/ceo-dashboard");
    }
  }

  // theme-aware utility classes
  const containerBg = isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";
  const panelBorder = isDark ? "border-gray-800" : "border-gray-100";
  const subtleText = isDark ? "text-gray-300" : "text-gray-600";
  const featureBg = isDark ? "bg-gray-800 border-gray-800" : "bg-gray-50 border-gray-100";
  const smallText = isDark ? "text-gray-400" : "text-gray-600";
  const pillActive = "bg-indigo-600 text-white";
  const pillInactive = isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Conseq-X Ultra"
    >
      <div className={`w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl ${containerBg} border ${panelBorder}`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-500">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">ConseQ-X Ultra</h2>
            <p className="mt-1 text-sm text-white/90 max-w-xl">Executive-grade AI, CEO Dashboard, unlimited analyses, priority support and forecasting.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Close upgrade modal"
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition focus:outline-none"
            >
              <FaTimes className="text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Pricing and CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-400 text-gray-900 p-3 shadow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1v22" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 7h14" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 17h14" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div>
                  <div className={`text-xs ${smallText}`}>Subscription</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-extrabold">{`₦${price.amount.toLocaleString()}`}</div>
                    <div className={`text-sm ${subtleText}`}>{price.label}</div>
                  </div>
                </div>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setBilling("monthly")}
                  className={`cursor-pointer px-3 py-1 rounded-full text-sm ${billing === "monthly" ? pillActive : pillInactive}`}
                >
                  Monthly
                </div>
                <div
                  onClick={() => setBilling("yearly")}
                  className={`cursor-pointer px-3 py-1 rounded-full text-sm ${billing === "yearly" ? pillActive : pillInactive}`}
                >
                  Yearly
                </div>

                <div className={`ml-3 text-sm ${billing === "yearly" ? "text-green-400" : smallText}`}>
                  {billing === "yearly" ? "Save ~2 months" : "Pay monthly"}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleGetUltra}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow hover:from-indigo-700 hover:to-blue-700 transition"
                >
                  Get Ultra
                </button>

                <button
                  onClick={() => { if (navigator && navigator.clipboard) navigator.clipboard.writeText("sales@conseq-x.com"); }}
                  className={`px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-700" } text-sm`}
                  title="Copy sales email"
                >
                  Contact Sales
                </button>
              </div>

              <div className={`text-xs ${smallText}`}>
                Payment options: monthly or yearly billing. Prices shown in Nigerian Naira (₦). This is a mock — no charges will be made.
              </div>
            </div>

            {/* Right: Feature list */}
            <div className={`rounded-xl p-4 ${featureBg} border ${panelBorder}`}>
              <ul className="space-y-3">
                {[
                  "Unlimited AI analyses",
                  "CEO multi-user dashboard",
                  "Priority support & onboarding",
                  "Growth forecasting & scenario modeling",
                  "Team invites & role management",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <span className="mt-1 text-green-500">
                      <FaCheck />
                    </span>
                    <div className={`${isDark ? "text-gray-200" : "text-gray-800"} text-sm`}>{feat}</div>
                  </li>
                ))}
              </ul>

              <div className={`mt-4 text-xs ${smallText}`}>
                Secure checkout and enterprise invoicing available. For bespoke plans or discounts email{" "}
                <a href="mailto:sales@conseq-x.com" className="underline">sales@conseq-x.com</a>.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-3 border-t ${panelBorder} ${isDark ? "bg-gray-900" : "bg-white"}`}>
          <div className={`text-xs ${smallText}`}>Your free runs will unlock once you upgrade.</div>
          <div className={`text-xs ${smallText}`}>Secure • Trusted • Enterprise-ready</div>
        </div>
      </div>
    </div>
  );
}
