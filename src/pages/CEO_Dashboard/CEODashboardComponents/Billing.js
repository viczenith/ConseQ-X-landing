import React, { useMemo, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaCrown, FaCheck, FaShieldAlt, FaBolt, FaStar,
  FaRocket, FaEnvelope, FaCheckCircle,
  FaReceipt, FaDownload, FaPrint, FaTimes,
  FaCreditCard, FaWifi, FaPen, FaSync,
  FaCcVisa, FaCcMastercard, FaCcAmex,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";

/* localStorage helpers */
const KEY_RECEIPTS = "conseqx_billing_receipts_v1";
const KEY_CARD = "conseqx_billing_card_v1";
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function formatNaira(n) { return "\u20A6" + Number(n).toLocaleString(); }
function genId(pfx = "TX") { return pfx + "-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 9000 + 1000); }

/* Card brand detection from first digits */
function detectCardBrand(num) {
  const n = (num || "").replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^6(?:011|5)/.test(n)) return "discover";
  if (/^(50|5[6-9]|6[0-9])/.test(n)) return "verve";
  return "card";
}
const BRAND_LABELS = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover", verve: "Verve", card: "Card" };
function BrandIcon({ brand, className = "" }) {
  if (brand === "visa") return <FaCcVisa className={className} />;
  if (brand === "mastercard") return <FaCcMastercard className={className} />;
  if (brand === "amex") return <FaCcAmex className={className} />;
  return <FaCreditCard className={className} />;
}

/* Format card number as groups of 4 while typing */
function formatCardInput(raw) {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiryInput(raw) {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

/* Receipt HTML */
function buildReceiptHTML({ receipt, darkMode }) {
  const bg = darkMode ? "#0b1220" : "#fff"; const txt = darkMode ? "#e6eef8" : "#0f1724";
  return "<!doctype html><html><head><meta charset=\"utf-8\"/><title>Receipt " + receipt.id + "</title>" +
    "<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:" + bg + ";color:" + txt + ";padding:24px}" +
    ".c{max-width:640px;margin:0 auto;border-radius:12px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.15)}" +
    "h1{margin:0;color:#4f46e5;font-size:20px}.s{color:#9aa6c6;font-size:12px}" +
    "table{width:100%;border-collapse:collapse;margin-top:16px}th,td{text-align:left;padding:8px 0;font-size:14px}" +
    ".r{text-align:right}.b{font-weight:700;font-size:18px}" +
    "@media print{body{padding:0}.c{box-shadow:none}}</style></head>" +
    "<body><div class=\"c\">" +
    "<div style=\"display:flex;justify-content:space-between;align-items:center\">" +
    "<div><h1>ConseQ-X</h1><div class=\"s\">Payment Receipt</div></div>" +
    "<div style=\"text-align:right\"><div style=\"font-weight:600\">" + (receipt.orgName || "Organisation") + "</div>" +
    "<div class=\"s\">" + (receipt.periodLabel || "") + "</div></div></div>" +
    "<div style=\"display:flex;justify-content:space-between;margin:16px 0;font-size:13px;color:#9aa6c6\">" +
    "<div>Receipt: <strong>" + receipt.id + "</strong></div><div>" + new Date(receipt.date).toLocaleString() + "</div></div>" +
    "<hr style=\"border:none;height:1px;background:rgba(0,0,0,.08)\"/>" +
    "<table><thead><tr><th>Description</th><th class=\"r\">Amount</th></tr></thead>" +
    "<tbody><tr><td>" + receipt.itemDesc + "</td><td class=\"r\">" + formatNaira(receipt.amount) + "</td></tr></tbody>" +
    "<tfoot><tr><td class=\"r b\">Total</td><td class=\"r b\">" + formatNaira(receipt.amount) + "</td></tr></tfoot></table>" +
    "<div style=\"margin-top:16px;font-size:12px;color:#9aa6c6\">" +
    "Questions? Email <a href=\"mailto:sales@conseq-x.com\">sales@conseq-x.com</a></div></div></body></html>";
}

/* Simple modal */
function Modal({ open, onClose, title, children, onConfirm, confirmLabel, darkMode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white text-gray-900"}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="text-lg font-bold">{title}</div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"}`}><FaTimes /></button>
        </div>
        <div className="text-sm">{children}</div>
        {onConfirm && (
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white">{confirmLabel || "Confirm"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Pricing  aligned with UpsellModal */
const BASE_MONTHLY = 39900;
const BASE_YEARLY = 399000;
const BILLING_OPTIONS = [
  { key: "daily",   label: "Daily",   amount: Math.round(BASE_MONTHLY / 30), suffix: "/day",   days: 1 },
  { key: "weekly",  label: "Weekly",  amount: Math.round(BASE_MONTHLY / 4),  suffix: "/week",  days: 7 },
  { key: "monthly", label: "Monthly", amount: BASE_MONTHLY,                  suffix: "/month", days: 30, popular: true },
  { key: "yearly",  label: "Yearly",  amount: BASE_YEARLY,                   suffix: "/year",  days: 365 },
];

/* Package descriptions for billing period cards */
const PACKAGE_CARDS = [
  { key: "daily",   title: "Day Pass",       tagline: "Try it risk-free",       desc: "Perfect for a quick test drive. Full Ultra access for 24 hours — no commitment.", highlight: false },
  { key: "weekly",  title: "Weekly Sprint",   tagline: "Short-term power",       desc: "Ideal for intensive planning sessions or board-prep weeks. Everything unlocked for 7 days.", highlight: false },
  { key: "monthly", title: "Monthly Pro",     tagline: "Most popular",           desc: "The sweet spot for most teams. Unlimited analyses, CEO dashboard, forecasting and team management — renewed monthly.", highlight: true },
  { key: "yearly",  title: "Annual Ultra",    tagline: "Best value",             desc: "Lock in the lowest rate and forget about renewals. Full platform access for an entire year with priority support.", highlight: false },
];

/* Credit card visual — reflects saved card data */
function CreditCardVisual({ darkMode, orgName, isActive, savedCard }) {
  const last4 = savedCard?.last4 || (isActive ? "ULTRA" : "FREE");
  const brand = savedCard?.brand || "card";
  const holderName = savedCard?.holderName || orgName || "Organisation";
  const expiry = savedCard?.expiry || "••/••";

  return (
    <div className="relative w-full aspect-[1.6/1] max-w-sm mx-auto select-none" style={{ perspective: "800px" }}>
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: isActive
            ? "linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #7c3aed 70%, #a855f7 100%)"
            : darkMode
              ? "linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)"
              : "linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)",
          boxShadow: isActive
            ? "0 20px 60px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset"
            : "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* Chip + WiFi row */}
        <div className="absolute top-5 left-6 flex items-center gap-3">
          <div className="w-10 h-7 rounded-md" style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", boxShadow: "0 2px 8px rgba(217,119,6,0.3)" }} />
          <FaWifi className="text-white/50 text-sm rotate-90" />
        </div>

        {/* Card Number — last 4 digits only */}
        <div className="absolute top-[52%] left-6 right-6 flex justify-between text-white/80 text-sm font-mono tracking-[0.2em]">
          <span>••••</span><span>••••</span><span>••••</span><span>{last4}</span>
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Card Holder</div>
            <div className="text-xs font-semibold text-white/90 truncate max-w-[160px]">{holderName}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Expires</div>
            <div className="text-xs font-bold text-white/70">{expiry}</div>
          </div>
        </div>

        {/* Brand logo */}
        <div className="absolute top-5 right-6 flex items-center gap-1">
          <BrandIcon brand={brand} className="text-white/60 text-2xl" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">{BRAND_LABELS[brand] || "Card"}</span>
        </div>
      </div>
    </div>
  );
}
const FEATURES = [
  { text: "Unlimited analyses",                   icon: <FaBolt className="text-amber-400" /> },
  { text: "CEO multi-user dashboard",                icon: <FaCrown className="text-amber-400" /> },
  { text: "Priority support & onboarding",           icon: <FaRocket className="text-blue-400" /> },
  { text: "Growth forecasting & scenario modelling",  icon: <FaStar className="text-purple-400" /> },
  { text: "Team invites & role management",          icon: <FaShieldAlt className="text-emerald-400" /> },
];

/* Main component */
export default function CEOBilling() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();
  const sub = auth?.org?.subscription || { tier: "free", expiresAt: null };
  const isActive = sub.tier === "premium" && (sub.expiresAt === null || Number(sub.expiresAt || 0) > Date.now());

  const [receipts, setReceipts] = useState(() => readJSON(KEY_RECEIPTS, []));
  const [savedCard, setSavedCard] = useState(() => readJSON(KEY_CARD, null));
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [autoRenew, setAutoRenew] = useState(() => readJSON(KEY_CARD, null)?.autoRenew ?? false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", holderName: "" });
  const [cardErrors, setCardErrors] = useState({});

  const selected = BILLING_OPTIONS.find(o => o.key === billingPeriod);
  const yearlySavings = BASE_MONTHLY * 12 - BASE_YEARLY;
  const monthlyEquivalent = Math.round(BASE_YEARLY / 12);

  const daysLeft = useMemo(() => {
    if (!isActive || !sub.expiresAt) return 0;
    return Math.max(0, Math.ceil((Number(sub.expiresAt) - Date.now()) / 86400000));
  }, [isActive, sub.expiresAt]);

  const expiryDate = sub.expiresAt
    ? new Date(Number(sub.expiresAt)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  async function handleSubscribe() {
    if (!selected) return;
    if (!savedCard) {
      setShowCardForm(true);
      setTimeout(() => document.getElementById("card-form-section")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      return;
    }
    setBusy(true);
    try {
      const months = selected.key === "yearly" ? 12 : selected.key === "monthly" ? 1 : selected.key === "weekly" ? 0.25 : 1 / 30;
      if (auth?.upgrade) await auth.upgrade({ months, tier: "premium" });
      const receipt = { id: genId("RCPT"), date: Date.now(), amount: selected.amount, itemDesc: "ConseQ-X Ultra \u2014 " + selected.label, periodLabel: selected.label, orgName: auth?.org?.name || "Organisation" };
      const updated = [receipt, ...receipts];
      setReceipts(updated);
      writeJSON(KEY_RECEIPTS, updated);
      setModal({ open: true, title: "You\u2019re on Ultra!", body: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-500"><FaCheckCircle /> <span className="font-medium">Subscription activated</span></div>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Your ConseQ-X Ultra plan is live. All premium features are now unlocked \u2014 unlimited analyses, forecasting, team management, everything.</p>
          <p className={"text-xs " + (darkMode ? "text-gray-500" : "text-gray-400")}>Receipt <strong>{receipt.id}</strong> saved to your payment history below.</p>
        </div>
      ) });
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: "Something went wrong", body: <p>We couldn\u2019t process that. Try again or email sales@conseq-x.com for help.</p> });
    } finally { setBusy(false); }
  }

  function confirmSubscribe() {
    if (!savedCard) {
      setShowCardForm(true);
      setTimeout(() => document.getElementById("card-form-section")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      return;
    }
    setModal({ open: true, title: "Confirm " + selected.label + " subscription", confirmLabel: "Pay " + formatNaira(selected.amount), onConfirm: () => { setModal({ open: false }); handleSubscribe(); }, body: (
      <div className={"rounded-xl p-4 space-y-2 " + (darkMode ? "bg-gray-800/60" : "bg-gray-50")}>
        <div className="flex justify-between text-sm"><span>Plan</span><strong>ConseQ-X Ultra</strong></div>
        <div className="flex justify-between text-sm"><span>Billing</span><strong>{selected.label}</strong></div>
        <div className="flex justify-between text-sm items-center"><span>Payment</span><span className="flex items-center gap-1.5"><BrandIcon brand={savedCard.brand} className="text-base" /> <strong>····{savedCard.last4}</strong></span></div>
        {autoRenew && <div className="flex justify-between text-sm"><span>Auto-Renew</span><span className="text-emerald-500 font-medium flex items-center gap-1"><FaSync className="text-xs" /> On</span></div>}
        <hr className={darkMode ? "border-gray-700" : "border-gray-200"} />
        <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatNaira(selected.amount)}</span></div>
      </div>
    ) });
  }

  /* ── Card management ── */
  const toggleAutoRenew = useCallback(() => {
    const next = !autoRenew;
    setAutoRenew(next);
    if (savedCard) {
      const updated = { ...savedCard, autoRenew: next };
      setSavedCard(updated);
      writeJSON(KEY_CARD, updated);
    }
  }, [autoRenew, savedCard]);

  function validateCardForm() {
    const e = {};
    const digits = cardForm.number.replace(/\D/g, "");
    // When editing an existing card, number is optional (keeps saved last4/brand)
    if (!isEditingCard || digits.length > 0) {
      if (digits.length < 13 || digits.length > 19) e.number = "Enter a valid card number";
    }
    const expParts = cardForm.expiry.split("/");
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) e.expiry = "Use MM/YY format";
    else {
      const m = parseInt(expParts[0], 10);
      if (m < 1 || m > 12) e.expiry = "Invalid month";
    }
    const cvvDigits = cardForm.cvv.replace(/\D/g, "");
    if (cvvDigits.length < 3 || cvvDigits.length > 4) e.cvv = "3 or 4 digits";
    if (!cardForm.holderName.trim()) e.holderName = "Name is required";
    return e;
  }

  function handleSaveCard() {
    const errs = validateCardForm();
    setCardErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const digits = cardForm.number.replace(/\D/g, "");
    const hasNewNumber = digits.length >= 13;
    const card = {
      last4: hasNewNumber ? digits.slice(-4) : (savedCard?.last4 || "0000"),
      brand: hasNewNumber ? detectCardBrand(digits) : (savedCard?.brand || "card"),
      holderName: cardForm.holderName.trim(),
      expiry: cardForm.expiry,
      autoRenew,
      savedAt: Date.now(),
    };
    setSavedCard(card);
    writeJSON(KEY_CARD, card);
    setCardForm({ number: "", expiry: "", cvv: "", holderName: "" });
    setCardErrors({});
    setShowCardForm(false);
    setIsEditingCard(false);
    setModal({ open: true, title: "Card saved", body: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-500"><FaCheckCircle /> <span className="font-medium">Payment method updated</span></div>
        <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Your <strong>{BRAND_LABELS[card.brand]}</strong> ending in <strong>{card.last4}</strong> is now saved. {autoRenew ? "Auto-renewal is on — your plan will renew automatically." : "Auto-renewal is off. You can turn it on anytime."}</p>
      </div>
    ) });
  }

  function handleRemoveCard() {
    setModal({ open: true, title: "Remove saved card?", confirmLabel: "Remove", onConfirm: () => {
      setSavedCard(null);
      setAutoRenew(false);
      localStorage.removeItem(KEY_CARD);
      setModal({ open: true, title: "Card removed", body: <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Your payment method has been removed and auto-renewal has been turned off.</p> });
    }, body: <p className={darkMode ? "text-gray-400" : "text-gray-500"}>This will remove your saved card and turn off auto-renewal. You can add a new card at any time.</p> });
  }

  function downloadReceipt(r) {
    const html = buildReceiptHTML({ receipt: r, darkMode });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = r.id + ".html";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function printReceipt(r) {
    const html = buildReceiptHTML({ receipt: r, darkMode });
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(html); w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
  }

  const cardBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const muted = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-10">
      <AnimatePresence>{modal.open && (<Modal open onClose={() => setModal({ open: false })} title={modal.title} onConfirm={modal.onConfirm} confirmLabel={modal.confirmLabel} darkMode={darkMode}><div className={darkMode ? "text-gray-200" : "text-gray-700"}>{modal.body}</div></Modal>)}</AnimatePresence>

      {/* Current Plan Status */}
      <div className="relative overflow-hidden rounded-2xl border" style={{ background: darkMode ? "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#3730a3 100%)" : "linear-gradient(135deg,#eef2ff 0%,#e0e7ff 50%,#c7d2fe 100%)", borderColor: darkMode ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)" }}>
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full" style={{ background: darkMode ? "rgba(129,140,248,0.08)" : "rgba(99,102,241,0.06)" }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style={{ background: darkMode ? "rgba(167,139,250,0.06)" : "rgba(139,92,246,0.04)" }} />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: isActive ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"), boxShadow: isActive ? "0 8px 24px rgba(245,158,11,0.3)" : "none" }}>
              <FaCrown className={"text-xl " + (isActive ? "text-white" : (darkMode ? "text-gray-600" : "text-gray-400"))} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={"font-bold text-lg " + (darkMode ? "text-white" : "text-gray-900")}>{isActive ? "ConseQ-X Ultra" : "Free Plan"}</span>
                <span className={"px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider " + (isActive ? (darkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700") : (darkMode ? "bg-gray-600/30 text-gray-400" : "bg-gray-200 text-gray-500"))}>{isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className={"text-sm mt-0.5 " + (darkMode ? "text-indigo-200" : "text-indigo-700")}>
                {isActive ? <span>Renews {expiryDate} &mdash; <strong>{daysLeft}</strong> day{daysLeft !== 1 ? "s" : ""} left</span> : "Upgrade to Ultra to unlock unlimited analyses, forecasting, and team management."}
              </div>
            </div>
          </div>
          {isActive && (<div className={"text-xs px-4 py-2 rounded-xl " + (darkMode ? "bg-white/5 text-indigo-200" : "bg-white/60 text-indigo-700")}>All features unlocked</div>)}
        </div>
      </div>

      {/* Credit Card Visual + Card Info / Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <CreditCardVisual darkMode={darkMode} orgName={auth?.org?.name} isActive={isActive} savedCard={savedCard} />
          {savedCard && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setShowCardForm(true); setIsEditingCard(true); setCardForm({ number: "", expiry: savedCard.expiry || "", cvv: "", holderName: savedCard.holderName || "" }); }} className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100")}><FaPen className="text-[10px]" /> Edit Card</button>
              <button onClick={handleRemoveCard} className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (darkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-500 hover:bg-red-50")}><FaTimes className="text-[10px]" /> Remove</button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h3 className={"text-lg font-bold " + (darkMode ? "text-gray-100" : "text-gray-900")}>
            {isActive ? "Your Ultra membership is active" : "Upgrade to ConseQ-X Ultra"}
          </h3>
          <p className={"text-sm leading-relaxed " + (darkMode ? "text-gray-400" : "text-gray-500")}>
            {isActive
              ? `Your subscription renews on ${expiryDate}. You have ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining. All premium features — unlimited analyses, growth forecasting, team management — are fully unlocked.`
              : "Get the complete ConseQ-X experience. Unlimited analyses, CEO-level dashboards, growth forecasting, scenario modelling, team invites and priority support — all in one plan."}
          </p>

          {/* Auto-Renew Toggle */}
          <div className={"flex items-center justify-between rounded-xl border p-4 " + (darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")}>
            <div className="flex items-center gap-3">
              <FaSync className={"text-sm " + (autoRenew ? "text-emerald-400" : muted)} />
              <div>
                <div className={"text-sm font-semibold " + (darkMode ? "text-gray-100" : "text-gray-800")}>Auto-Renewal</div>
                <div className={"text-xs " + muted}>{autoRenew ? "Your plan will renew automatically" : "Manual renewal — you'll be reminded before expiry"}</div>
              </div>
            </div>
            <button onClick={toggleAutoRenew} className={"relative w-12 h-6 rounded-full transition-colors flex-shrink-0 " + (autoRenew ? "bg-emerald-500" : (darkMode ? "bg-gray-600" : "bg-gray-300"))} aria-label="Toggle auto-renewal">
              <div className={"absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform " + (autoRenew ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>

          {/* Saved Card Summary or Add Card button */}
          {savedCard ? (
            <div className={"flex items-center gap-3 rounded-xl border p-4 " + (darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")}>
              <BrandIcon brand={savedCard.brand} className={"text-2xl " + (darkMode ? "text-gray-300" : "text-gray-600")} />
              <div className="flex-1 min-w-0">
                <div className={"text-sm font-medium " + (darkMode ? "text-gray-200" : "text-gray-700")}>{BRAND_LABELS[savedCard.brand]} ending in {savedCard.last4}</div>
                <div className={"text-xs " + muted}>Expires {savedCard.expiry} &middot; {savedCard.holderName}</div>
              </div>
              <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full " + (darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>Default</span>
            </div>
          ) : (
            <button onClick={() => setShowCardForm(true)} className={"w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors " + (darkMode ? "border-gray-700 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400" : "border-gray-300 text-gray-500 hover:border-indigo-300 hover:text-indigo-600")}>
              <FaCreditCard className="text-xs" /> Add a card
            </button>
          )}

          {!isActive && !showCardForm && (
            <button onClick={() => document.getElementById("billing-plans")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              View plans below &darr;
            </button>
          )}
        </div>
      </div>

      {/* Card Form — Add / Edit */}
      <AnimatePresence>
        {showCardForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div id="card-form-section" className={"rounded-2xl border p-6 " + cardBg}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={"w-9 h-9 rounded-xl flex items-center justify-center " + (darkMode ? "bg-indigo-500/15" : "bg-indigo-50")}><FaCreditCard className={"text-sm " + (darkMode ? "text-indigo-400" : "text-indigo-500")} /></div>
                  <div><h3 className={"text-base font-bold " + (darkMode ? "text-gray-100" : "text-gray-900")}>{savedCard ? "Update Payment Method" : "Add Payment Method"}</h3><p className={"text-xs " + muted}>Your card details are never stored in full — only the last 4 digits and brand.</p></div>
                </div>
                <button onClick={() => { setShowCardForm(false); setIsEditingCard(false); setCardErrors({}); }} className={"p-1.5 rounded-lg " + (darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100")}><FaTimes /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card Number */}
                <div className="sm:col-span-2">
                  <label className={"block text-xs font-medium mb-1.5 " + (darkMode ? "text-gray-300" : "text-gray-600")}>Card Number</label>
                  <div className="relative">
                    <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: formatCardInput(e.target.value) }))} className={"w-full pl-4 pr-12 py-3 rounded-xl border text-sm font-mono tracking-wider outline-none transition-colors " + (cardErrors.number ? "border-red-400 " : "") + (darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400")} />
                    {cardForm.number.replace(/\D/g, "").length >= 2 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <BrandIcon brand={detectCardBrand(cardForm.number)} className={"text-xl " + (darkMode ? "text-gray-400" : "text-gray-500")} />
                      </div>
                    )}
                  </div>
                  {cardErrors.number && <p className="text-xs text-red-400 mt-1">{cardErrors.number}</p>}
                </div>
                {/* Cardholder Name */}
                <div className="sm:col-span-2">
                  <label className={"block text-xs font-medium mb-1.5 " + (darkMode ? "text-gray-300" : "text-gray-600")}>Cardholder Name</label>
                  <input type="text" autoComplete="cc-name" placeholder="As shown on card" value={cardForm.holderName} onChange={e => setCardForm(f => ({ ...f, holderName: e.target.value }))} className={"w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors " + (cardErrors.holderName ? "border-red-400 " : "") + (darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400")} />
                  {cardErrors.holderName && <p className="text-xs text-red-400 mt-1">{cardErrors.holderName}</p>}
                </div>
                {/* Expiry */}
                <div>
                  <label className={"block text-xs font-medium mb-1.5 " + (darkMode ? "text-gray-300" : "text-gray-600")}>Expiry Date</label>
                  <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiryInput(e.target.value) }))} className={"w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-colors " + (cardErrors.expiry ? "border-red-400 " : "") + (darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400")} />
                  {cardErrors.expiry && <p className="text-xs text-red-400 mt-1">{cardErrors.expiry}</p>}
                </div>
                {/* CVV */}
                <div>
                  <label className={"block text-xs font-medium mb-1.5 " + (darkMode ? "text-gray-300" : "text-gray-600")}>CVV</label>
                  <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className={"w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-colors " + (cardErrors.cvv ? "border-red-400 " : "") + (darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400")} />
                  {cardErrors.cvv && <p className="text-xs text-red-400 mt-1">{cardErrors.cvv}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-5">
                <p className={"text-[11px] flex items-center gap-1.5 " + muted}><FaShieldAlt className="text-emerald-400" /> Only last 4 digits & brand are stored locally</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowCardForm(false); setIsEditingCard(false); setCardErrors({}); }} className={"px-4 py-2.5 rounded-xl text-sm font-medium " + (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>Cancel</button>
                  <button onClick={handleSaveCard} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">Save Card</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Period Package Cards */}
      <div id="billing-plans">
        <div className={"text-xs font-semibold uppercase tracking-wider mb-4 " + muted}>Choose your plan</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACKAGE_CARDS.map((pkg) => {
            const opt = BILLING_OPTIONS.find(o => o.key === pkg.key);
            const isSelected = billingPeriod === pkg.key;
            return (
              <button
                key={pkg.key}
                onClick={() => setBillingPeriod(pkg.key)}
                className={`relative text-left rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/15 " + (darkMode ? "bg-indigo-950/40 border-indigo-500/50" : "bg-indigo-50/80 border-indigo-300")
                    : darkMode
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Badges */}
                {pkg.highlight && !isSelected && (
                  <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">Popular</span>
                )}
                {pkg.key === "yearly" && isSelected && (
                  <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">Save {Math.round((yearlySavings / (BASE_MONTHLY * 12)) * 100)}%</span>
                )}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <FaCheck className="text-white text-[8px]" />
                  </div>
                )}

                <div className={"text-xs font-medium uppercase tracking-wider mb-1 " + (isSelected ? "text-indigo-400" : muted)}>{pkg.tagline}</div>
                <div className={"text-base font-bold mb-0.5 " + (darkMode ? "text-gray-100" : "text-gray-900")}>{pkg.title}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={"text-xl font-extrabold " + (isSelected ? "text-indigo-400" : (darkMode ? "text-gray-200" : "text-gray-800"))}>{formatNaira(opt.amount)}</span>
                  <span className={"text-xs " + muted}>{opt.suffix}</span>
                </div>
                <p className={"text-xs leading-relaxed " + (darkMode ? "text-gray-400" : "text-gray-500")}>{pkg.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscribe + Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className={"rounded-2xl border p-6 " + cardBg}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className={"text-xs font-medium uppercase tracking-wider " + muted}>Selected Plan</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={"text-3xl font-extrabold " + (darkMode ? "text-white" : "text-gray-900")}>{formatNaira(selected.amount)}</span>
                  <span className={"text-sm " + muted}>{selected.suffix}</span>
                </div>
                <div className={"text-sm mt-1 font-medium " + (darkMode ? "text-indigo-300" : "text-indigo-600")}>{PACKAGE_CARDS.find(p => p.key === billingPeriod)?.title}</div>
                {billingPeriod === "yearly" && (<div className="flex items-center gap-2 mt-1"><span className={"text-xs " + muted}>{formatNaira(monthlyEquivalent)}/mo equivalent</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">SAVE {formatNaira(yearlySavings)}</span></div>)}
              </div>
              <a href="mailto:sales@conseq-x.com" className={"flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors " + (darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-100")}><FaEnvelope className="text-xs" /> Contact Sales</a>
            </div>
            <button onClick={confirmSubscribe} disabled={busy} className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-extrabold text-white transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#7c3aed 100%)", boxShadow: "0 12px 40px rgba(99,102,241,0.3)" }}>
              <FaRocket className="text-base group-hover:translate-x-0.5 transition-transform" />
              {busy ? "Processing\u2026" : isActive ? "Renew / Change Plan" : "Get Ultra"}
            </button>
            <p className={"text-[11px] text-center mt-3 " + muted}>Payment options: daily, weekly, monthly or yearly. Prices in Naira (\u20A6).</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ icon: <FaShieldAlt />, label: "Secure", desc: "256-bit encryption" }, { icon: <FaBolt />, label: "Instant", desc: "Activated immediately" }, { icon: <FaCheck />, label: "Enterprise-ready", desc: "Invoicing available" }].map((item, i) => (
              <div key={i} className={"flex items-center gap-3 p-3 rounded-xl border " + (darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}>
                <div className="text-indigo-400 text-sm">{item.icon}</div>
                <div><div className={"text-xs font-semibold " + (darkMode ? "text-gray-200" : "text-gray-700")}>{item.label}</div><div className={"text-[10px] " + muted}>{item.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className={"rounded-2xl border p-5 h-full " + (darkMode ? "bg-gray-800/60 border-gray-700" : "bg-gradient-to-br from-gray-50 to-indigo-50/30 border-gray-100")}>
            <div className="flex items-center gap-2 mb-5"><FaStar className="text-amber-400 text-sm" /><span className={"text-sm font-bold " + (darkMode ? "text-gray-100" : "text-gray-800")}>Everything included</span></div>
            <ul className="space-y-4">
              {FEATURES.map((f, i) => (<li key={i} className="flex items-start gap-3"><div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + (darkMode ? "bg-gray-700/60" : "bg-white shadow-sm")}>{f.icon}</div><span className={"text-sm font-medium pt-1.5 " + (darkMode ? "text-gray-200" : "text-gray-700")}>{f.text}</span></li>))}
            </ul>
            <div className={"mt-6 pt-4 border-t " + (darkMode ? "border-gray-700/50" : "border-gray-200/60")}>
              <p className={"text-[11px] " + muted}>Secure checkout and enterprise invoicing available. For bespoke plans email <a href="mailto:sales@conseq-x.com" className="text-indigo-400 hover:underline">sales@conseq-x.com</a>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className={"rounded-2xl border p-6 " + cardBg}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={"w-9 h-9 rounded-xl flex items-center justify-center " + (darkMode ? "bg-indigo-500/15" : "bg-indigo-50")}><FaReceipt className={"text-sm " + (darkMode ? "text-indigo-400" : "text-indigo-500")} /></div>
            <div><h3 className={"text-base font-bold " + (darkMode ? "text-gray-100" : "text-gray-900")}>Payment History</h3><p className={"text-xs " + muted}>Your receipts are stored here for reference</p></div>
          </div>
          {receipts.length > 0 && (<span className={"px-2.5 py-1 rounded-full text-xs font-semibold " + (darkMode ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-600")}>{receipts.length} receipt{receipts.length !== 1 ? "s" : ""}</span>)}
        </div>
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className={"w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center " + (darkMode ? "bg-gray-700" : "bg-gray-100")}><FaReceipt className={"text-xl " + (darkMode ? "text-gray-600" : "text-gray-300")} /></div>
            <p className={"font-medium " + (darkMode ? "text-gray-400" : "text-gray-500")}>No receipts yet</p>
            <p className={"text-sm mt-1 max-w-xs mx-auto " + muted}>When you subscribe, your payment receipts will show up here automatically.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {receipts.map((r) => (
              <div key={r.id} className={"flex items-center justify-between px-4 py-3 rounded-xl border transition-colors " + (darkMode ? "bg-gray-700/30 border-gray-700 hover:bg-gray-700/50" : "bg-gray-50/50 border-gray-100 hover:bg-white")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + (darkMode ? "bg-indigo-500/10" : "bg-indigo-50")}><FaReceipt className={"text-xs " + (darkMode ? "text-indigo-400" : "text-indigo-500")} /></div>
                  <div className="min-w-0">
                    <div className={"text-sm font-medium truncate " + (darkMode ? "text-gray-200" : "text-gray-700")}>{r.itemDesc}</div>
                    <div className={"text-xs " + muted}>{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} &middot; {r.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={"text-sm font-bold " + (darkMode ? "text-gray-100" : "text-gray-900")}>{formatNaira(r.amount)}</span>
                  <button onClick={() => downloadReceipt(r)} title="Download" className={"p-2 rounded-lg text-xs transition-colors " + (darkMode ? "text-gray-400 hover:bg-gray-600 hover:text-gray-200" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700")}><FaDownload /></button>
                  <button onClick={() => printReceipt(r)} title="Print" className={"p-2 rounded-lg text-xs transition-colors " + (darkMode ? "text-gray-400 hover:bg-gray-600 hover:text-gray-200" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700")}><FaPrint /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
