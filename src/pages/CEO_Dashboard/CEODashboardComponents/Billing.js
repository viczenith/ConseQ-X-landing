import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaDownload, FaCreditCard, FaPrint, FaSave, FaCrown,
  FaCheck, FaShieldAlt, FaBolt, FaWifi, FaReceipt,
  FaCheckCircle, FaTimesCircle, FaStar, FaTimes, FaRocket,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";

/* ================================================================
   localStorage helpers & keys
   ================================================================ */
const KEY_PAYMENT = "conseqx_billing_payment_v1";
const KEY_RECEIPTS = "conseqx_billing_receipts_v1";
const KEY_SUBS = "conseqx_billing_subscription_v1";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ================================================================
   Small helpers
   ================================================================ */
function digitsOnly(str = "") {
  return String(str).replace(/\D/g, "");
}
function formatCurrency(n = 0) {
  try {
    return `\u20A6${Number(n).toLocaleString()}`;
  } catch {
    return `\u20A6${n}`;
  }
}
function genId(prefix = "TX") {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
function prettyDate(ts = Date.now()) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}
function guessCardBrand(num = "") {
  const s = digitsOnly(num);
  if (s.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(s)) return "Mastercard";
  if (/^3[47]/.test(s)) return "Amex";
  return "Card";
}

/* ================================================================
   Modal (enhanced with motion)
   ================================================================ */
function Modal({ open, onClose, title, children, footer, confirmLabel = "Confirm", onConfirm, darkMode = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        role="presentation"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl ${
          darkMode ? "bg-gray-900 border border-gray-700/60 text-gray-100" : "bg-white border border-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div id="modal-title" className="text-lg font-bold">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`rounded-lg p-1.5 transition-colors ${
              darkMode ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            <FaTimes />
          </button>
        </div>
        <div className="text-sm">{children}</div>
        <div className="mt-5 flex justify-end gap-3">
          {footer ? (
            footer
          ) : onConfirm ? (
            <>
              <button
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                {confirmLabel}
              </button>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

/* ================================================================
   Receipt HTML builder (dark-mode aware)
   ================================================================ */
function buildReceiptHTML({ receipt, darkMode }) {
  const bg = darkMode ? "#0b1220" : "#ffffff";
  const text = darkMode ? "#e6eef8" : "#0f1724";
  const accent = "#4f46e5";
  const { id, date, amount, itemDesc, methodLabel, cardLast4, orgName, periodLabel } = receipt;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Receipt ${id}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root{ --bg:${bg}; --text:${text}; --accent:${accent}; }
  body{ margin:0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:var(--bg); color:var(--text); padding:24px; }
  .card{ max-width:720px; margin:0 auto; background: linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0)); border-radius:12px; padding:28px; box-shadow: 0 8px 30px rgba(2,6,23,0.35); }
  h1{ margin:0; color:var(--accent); font-size:20px; }
  .meta{ display:flex; justify-content:space-between; margin-top:12px; color: #9aa6c6; font-size:13px; }
  .line{ height:1px; background:rgba(0,0,0,0.06); margin:18px 0; border-radius:1px; }
  table{ width:100%; border-collapse:collapse; margin-top:8px; }
  th, td{ text-align:left; padding:8px 0; font-size:14px; }
  .right{ text-align:right; }
  .total{ font-weight:700; font-size:18px; color:var(--text); }
  .small{ font-size:12px; color:#9aa6c6; }
  .footer{ margin-top:18px; font-size:12px; color:#9aa6c6; }
  @media print {
    body{ padding:0; }
    .card{ box-shadow:none; border-radius:0; }
  }
</style>
</head>
<body>
  <div class="card" role="document" aria-label="Receipt">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h1>ConseQ-X</h1>
        <div class="small">Receipt</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:600">${orgName || "Organization"}</div>
        <div class="small">${periodLabel || ""}</div>
      </div>
    </div>

    <div class="meta">
      <div>Receipt #: <strong>${id}</strong></div>
      <div>${new Date(date).toLocaleString()}</div>
    </div>

    <div class="line"></div>

    <table aria-hidden="false">
      <thead>
        <tr><th>Item</th><th class="right">Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${itemDesc}</td>
          <td class="right">${formatCurrency(amount)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr><td class="right total">Total</td><td class="right total">${formatCurrency(amount)}</td></tr>
      </tfoot>
    </table>

    <div style="margin-top:14px; display:flex; justify-content:space-between; gap:16px; align-items:center;">
      <div>
        <div class="small">Payment method</div>
        <div style="margin-top:4px">${methodLabel}${cardLast4 ? ` \u2022 \u2022 \u2022 \u2022 ${cardLast4}` : ""}</div>
      </div>
      <div style="text-align:right;">
        <div class="small">Receipt ID</div>
        <div style="margin-top:4px">${id}</div>
      </div>
    </div>

    <div class="footer">
      Thank you for your payment. If you need assistance, contact sales@conseq-x.com.
    </div>
  </div>
</body>
</html>`;
}

/* ================================================================
   Expiry parsing / validation
   ================================================================ */
function parseExpiry(v = "") {
  if (!v) return null;
  const cleaned = String(v).trim().replace(/\s/g, "");
  const m = cleaned.match(/^(\d{1,2})\/?(\d{2}|\d{4})$/);
  if (!m) return null;
  let mon = Number(m[1]);
  let yr = Number(m[2]);
  if (Number.isNaN(mon) || Number.isNaN(yr)) return null;
  if (yr < 100) yr = 2000 + yr;
  return { mon, yr };
}
function isExpiryInFuture(v = "") {
  const parsed = parseExpiry(v);
  if (!parsed) return false;
  const { mon, yr } = parsed;
  if (mon < 1 || mon > 12) return false;
  const expDate = new Date(yr, mon - 1, 1);
  const endOfMonth = new Date(expDate.getFullYear(), expDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return endOfMonth.getTime() > Date.now();
}

/* ================================================================
   Subscription Progress Ring
   ================================================================ */
function SubscriptionRing({ percentage = 0, size = 92, strokeWidth = 7, darkMode }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, percentage));
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#billing-ring-grad)" strokeWidth={strokeWidth}
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <defs>
        <linearGradient id="billing-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <text
        x={size / 2} y={size / 2 - 6} textAnchor="middle" dominantBaseline="central"
        fill={darkMode ? "#e0e7ff" : "#4338ca"} fontSize="18" fontWeight="700"
      >
        {Math.round(pct)}%
      </text>
      <text
        x={size / 2} y={size / 2 + 12} textAnchor="middle" dominantBaseline="central"
        fill={darkMode ? "#a5b4fc" : "#6366f1"} fontSize="9" fontWeight="500"
      >
        remaining
      </text>
    </svg>
  );
}

/* ================================================================
   Credit Card Visual
   ================================================================ */
function CreditCardVisual({ brand = "Card", last4 = "0000", name = "CARDHOLDER", expiry = "00/00" }) {
  const brandColors = {
    Visa: ["#1a1f71", "#2563eb"],
    Mastercard: ["#cc0000", "#ff6600"],
    Amex: ["#006fcf", "#00a5e0"],
    Card: ["#374151", "#6b7280"],
  };
  const [from, to] = brandColors[brand] || brandColors.Card;
  return (
    <motion.div
      initial={{ rotateY: -8, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full rounded-2xl p-5 overflow-hidden select-none cursor-default"
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        aspectRatio: "1.586 / 1",
        maxWidth: 340,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35), 0 0 1px rgba(255,255,255,0.1) inset",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%)" }} />

      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top: chip + contactless */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-11 h-8 rounded-md overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-7 h-5 border border-yellow-700/30 rounded-sm" />
            </div>
          </div>
          <FaWifi className="text-white/30 text-base" style={{ transform: "rotate(90deg)" }} />
        </div>

        {/* Card number */}
        <div className="font-mono tracking-[0.18em] text-white text-base mb-4 drop-shadow-sm">
          ••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;{last4}
        </div>

        {/* Bottom: name + expiry */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Card Holder</div>
            <div className="text-white text-sm font-semibold tracking-wide uppercase">{name}</div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Expires</div>
            <div className="text-white text-sm font-semibold">{expiry}</div>
          </div>
        </div>
      </div>

      {/* Brand watermark */}
      <div className="absolute top-4 right-5 text-white/50 text-lg font-bold tracking-wider z-10">{brand}</div>
    </motion.div>
  );
}

/* ================================================================
   Premium feature list
   ================================================================ */
const PREMIUM_FEATURES = [
  "All 6 organizational health systems",
  "Unlimited assessment re-runs",
  "Rubric-based scoring & insights",
  "Advanced reports & PDF export",
  "X Ultra-powered recommendations",
  "Priority support & consulting",
  "Real-time progress dashboards",
  "Multi-period trend analysis",
];

/* ================================================================
   CEOBilling — main component
   ================================================================ */
export default function CEOBilling() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();

  /* ---------- persisted state ---------- */
  const [paymentMethod, setPaymentMethod] = useState(() => readJSON(KEY_PAYMENT, null));
  const [receipts, setReceipts] = useState(() => readJSON(KEY_RECEIPTS, []));
  const [subscription, setSubscription] = useState(
    () => readJSON(KEY_SUBS, auth?.org?.subscription || { tier: "free", expiresAt: null })
  );

  /* ---------- form / transient state ---------- */
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [autoPay, setAutoPay] = useState(() => paymentMethod?.autoPay || false);
  const [busy, setBusy] = useState(false);

  /* ---------- inline validation errors ---------- */
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardExpiryError, setCardExpiryError] = useState("");
  const [cardCVVError, setCardCVVError] = useState("");

  /* ---------- modal ---------- */
  const [modalState, setModalState] = useState({ open: false });

  /* ---------- active pricing tab (visual only) ---------- */
  const [pricingTab, setPricingTab] = useState("yearly");

  /* ---------- persist to localStorage ---------- */
  useEffect(() => writeJSON(KEY_PAYMENT, paymentMethod), [paymentMethod]);
  useEffect(() => writeJSON(KEY_RECEIPTS, receipts), [receipts]);
  useEffect(() => writeJSON(KEY_SUBS, subscription), [subscription]);

  /* ---------- computed values ---------- */
  const PRICES = useMemo(() => ({ monthly: 39900, yearly: 399000 }), []);
  const cardOnFile = Boolean(paymentMethod);
  const planTier = subscription?.tier || "free";
  const planName = planTier === "premium" ? "ConseQ-X Ultra" : "Free";
  const planExpiry = subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "\u2014";
  const subscriptionActive = subscription?.expiresAt && new Date(subscription.expiresAt).getTime() > Date.now();
  const ALLOW_PAY_WHILE_ACTIVE = true;

  /* new computed helpers for the UI */
  const daysRemaining = subscriptionActive
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)))
    : 0;
  const estimatedTotalDays = subscription?.period === "yearly" ? 365 : 30;
  const percentRemaining = subscriptionActive
    ? Math.min(100, (daysRemaining / estimatedTotalDays) * 100)
    : 0;
  const monthlySavings = PRICES.monthly * 12 - PRICES.yearly;
  const monthlyEquivalent = Math.round(PRICES.yearly / 12);

  /* ---------- validation ---------- */
  function isValidCardNumber(num = "") {
    const s = digitsOnly(num);
    return s.length >= 13 && s.length <= 19;
  }
  function isValidCVV(cvv = "", brand = "Card") {
    const s = digitsOnly(cvv);
    if (brand === "Amex") return s.length === 4;
    return s.length === 3;
  }

  /* ---------- receipt & payment processing ---------- */
  function createReceipt({ amount, itemDesc, methodLabel, cardLast4, periodLabel }) {
    const receipt = {
      id: genId("RCPT"),
      date: Date.now(),
      amount,
      itemDesc,
      methodLabel,
      cardLast4,
      periodLabel,
      orgName: auth?.org?.name || (auth?.user?.email ? auth.user.email.split("@")[1] : "Organization"),
    };
    setReceipts((prev) => [receipt, ...prev]);
    return receipt;
  }

  function downloadReceipt(receipt) {
    const html = buildReceiptHTML({ receipt, darkMode });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function openPrintView(receipt) {
    const html = buildReceiptHTML({ receipt, darkMode });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch (e) {
        console.warn("Print blocked or failed", e);
      }
    }, 300);
  }

  async function mockProcessPayment({ amount, method = "card", periodLabel = "" } = {}) {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 650));

      if (method === "card" && !paymentMethod) {
        setModalState({ open: true, type: "info", title: "Card required", body: <div>Please add a card before charging.</div> });
        setBusy(false);
        return false;
      }

      const cardLast4 = paymentMethod?.last4 || null;
      const methodLbl = method === "card" ? "Card" : "Manual";
      const receipt = createReceipt({
        amount,
        itemDesc: `${planName} subscription (${periodLabel || "payment"})`,
        methodLabel: methodLbl,
        cardLast4,
        periodLabel,
      });

      const nowTs = Date.now();
      if (periodLabel === "monthly") {
        const expiresAt = nowTs + 30 * 24 * 3600 * 1000;
        setSubscription((s) => ({ ...(s || {}), tier: "premium", expiresAt, period: "monthly" }));
      } else if (periodLabel === "yearly") {
        const expiresAt = nowTs + 365 * 24 * 3600 * 1000;
        setSubscription((s) => ({ ...(s || {}), tier: "premium", expiresAt, period: "yearly" }));
      }

      setBusy(false);
      setModalState({
        open: true,
        type: "info",
        title: "Payment successful!",
        body: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-500">
              <FaCheckCircle />
              <span className="font-medium">Your payment has been processed</span>
            </div>
            <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
              Receipt <strong>{receipt.id}</strong> created. Download or print it from Payment History below.
            </div>
          </div>
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      setBusy(false);
      setModalState({ open: true, type: "info", title: "Payment failed", body: <div>Payment failed (dev). Check console.</div> });
      return false;
    }
  }

  /* ---------- card management ---------- */
  function handleSaveCard(e) {
    e?.preventDefault?.();
    setCardNumberError("");
    setCardExpiryError("");
    setCardCVVError("");

    const brand = guessCardBrand(cardNumber);
    if (!isValidCardNumber(cardNumber)) {
      setCardNumberError("Enter 13\u201319 digits for card number.");
      return;
    }
    if (!cardName || cardName.trim().length < 2) {
      setModalState({ open: true, type: "info", title: "Name required", body: <div>Please enter the cardholder's name.</div> });
      return;
    }
    if (!parseExpiry(cardExpiry)) {
      setCardExpiryError("Use MM/YY or MMYYYY (e.g. 08/28 or 0828).");
      return;
    }
    if (!isExpiryInFuture(cardExpiry)) {
      setCardExpiryError("Card expiry must be a future month.");
      return;
    }
    if (!isValidCVV(cardCVV, brand)) {
      setCardCVVError(brand === "Amex" ? "Enter 4-digit CVV for Amex." : "Enter 3-digit CVV.");
      return;
    }

    const saved = {
      brand,
      last4: digitsOnly(cardNumber).slice(-4),
      name: cardName,
      expiry: cardExpiry.trim(),
      autoPay,
      addedAt: Date.now(),
    };
    setPaymentMethod(saved);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVV("");
    setModalState({
      open: true, type: "info", title: "Card saved",
      body: (
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span>Card saved locally. In production, use a PCI-compliant provider.</span>
        </div>
      ),
    });
  }

  function handleRemoveCardConfirm() {
    setModalState({
      open: true, type: "confirm", title: "Remove card?",
      body: <div>Remove saved card and disable auto-pay?</div>,
      confirmLabel: "Remove",
      onConfirm: () => {
        setPaymentMethod(null);
        setAutoPay(false);
        setModalState({ open: true, type: "info", title: "Card removed", body: <div>Card removed and auto-pay disabled.</div> });
      },
    });
  }

  function toggleAutoPay() {
    if (!paymentMethod) {
      setModalState({ open: true, type: "info", title: "Add card first", body: <div>Please add a card before enabling auto-pay.</div> });
      return;
    }
    const next = !autoPay;
    setAutoPay(next);
    setPaymentMethod((pm) => (pm ? { ...pm, autoPay: next } : pm));
    setModalState({
      open: true, type: "info",
      title: next ? "Auto-pay enabled" : "Auto-pay disabled",
      body: <div>Auto subscription setting updated.</div>,
    });
  }

  /* ---------- pay flow ---------- */
  function confirmPay(period) {
    if (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive) {
      setModalState({
        open: true, type: "info", title: "Subscription active",
        body: <div>You already have an active subscription. Renewals are not allowed while active.</div>,
      });
      return;
    }

    const amount = period === "yearly" ? PRICES.yearly : PRICES.monthly;
    const methodLbl = paymentMethod ? `${paymentMethod.brand} \u2022\u2022\u2022\u2022 ${paymentMethod.last4}` : "No card on file (manual)";
    const periodLabel = period === "yearly" ? "Yearly" : "Monthly";

    setModalState({
      open: true, type: "confirm",
      title: `Confirm ${periodLabel} payment`,
      body: (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
            <div className="flex justify-between text-sm"><span>Plan</span><strong>{planName}</strong></div>
            <div className="flex justify-between text-sm mt-2"><span>Billing</span><strong>{periodLabel}</strong></div>
            <div className="flex justify-between text-sm mt-2"><span>Method</span><strong>{methodLbl}</strong></div>
            <hr className={`my-3 ${darkMode ? "border-gray-700" : "border-gray-200"}`} />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(amount)}</span></div>
          </div>
          {subscriptionActive && ALLOW_PAY_WHILE_ACTIVE && (
            <div className="text-xs text-yellow-500 flex items-center gap-1.5">
              <FaBolt /> Testing override active \u2014 subscription is currently active.
            </div>
          )}
        </div>
      ),
      confirmLabel: `Pay ${formatCurrency(amount)}`,
      onConfirm: async () => {
        setModalState({ open: false });
        await mockProcessPayment({ amount, method: paymentMethod ? "card" : "manual", periodLabel: period === "yearly" ? "yearly" : "monthly" });
      },
    });
  }

  /* ---------- receipt helpers ---------- */
  function getReceiptStatus(r) {
    const nowTs = Date.now();
    if (!r.periodLabel) return { label: "Issued", active: false };
    const periodMs = r.periodLabel === "yearly" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
    const expiresAt = r.date + periodMs;
    if (nowTs <= expiresAt) return { label: "Active", active: true, expiresAt };
    return { label: "Expired", active: false, expiresAt };
  }

  function confirmDownloadReceipt(r) {
    setModalState({
      open: true, type: "confirm", title: "Download receipt?",
      body: <div>Download receipt <strong>{r.id}</strong> ({formatCurrency(r.amount)}) to your device?</div>,
      confirmLabel: "Download",
      onConfirm: () => { setModalState({ open: false }); downloadReceipt(r); },
    });
  }

  function confirmPrintReceipt(r) {
    setModalState({
      open: true, type: "confirm", title: "Print receipt?",
      body: <div>Open a print view for receipt <strong>{r.id}</strong> ({formatCurrency(r.amount)})?</div>,
      confirmLabel: "Open print",
      onConfirm: () => { setModalState({ open: false }); openPrintView(r); },
    });
  }

  function handleClearForm() {
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVV("");
    setCardNumberError("");
    setCardExpiryError("");
    setCardCVVError("");
  }

  /* ---------- reusable style helpers ---------- */
  const cardBg = darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-100";
  const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-sm transition-all outline-none ${
    darkMode
      ? "bg-gray-800/50 border-gray-700 text-gray-100 focus:border-indigo-500 placeholder-gray-500"
      : "bg-gray-50/80 border-gray-200 text-gray-900 focus:border-indigo-500 placeholder-gray-400"
  } focus:ring-2 focus:ring-indigo-500/20`;

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 pb-8 max-w-6xl mx-auto"
    >
      {/* Modal */}
      <AnimatePresence>
        {modalState.open && (
          <Modal
            open={Boolean(modalState.open)}
            onClose={() => setModalState({ open: false })}
            title={modalState.title}
            footer={modalState.footer}
            confirmLabel={modalState.confirmLabel}
            onConfirm={modalState.onConfirm}
            darkMode={darkMode}
          >
            <div className={darkMode ? "text-gray-200" : "text-gray-700"}>{modalState.body}</div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Inline animation styles */}
      <style>{`
        @keyframes billingPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes billingGlow { 0%,100%{box-shadow:0 0 12px rgba(99,102,241,0.25)} 50%{box-shadow:0 0 24px rgba(99,102,241,0.5)} }
        @keyframes cardShine { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .billing-pulse { animation: billingPulse 2s ease-in-out infinite; }
        .billing-glow { animation: billingGlow 3s ease-in-out infinite; }
      `}</style>
  
      {/* ============================================================
          SUBSCRIPTION STATUS HERO
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)"
            : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)",
          borderColor: darkMode ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)",
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full" style={{ background: darkMode ? "rgba(129,140,248,0.08)" : "rgba(99,102,241,0.06)" }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style={{ background: darkMode ? "rgba(167,139,250,0.06)" : "rgba(139,92,246,0.04)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: darkMode ? "rgba(129,140,248,0.03)" : "rgba(99,102,241,0.03)" }} />

        <div className="relative z-10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: ring + info */}
          <div className="flex items-center gap-5">
            {subscriptionActive ? (
              <SubscriptionRing percentage={percentRemaining} darkMode={darkMode} />
            ) : (
              <div className={`w-[92px] h-[92px] rounded-full flex items-center justify-center border-[3px] ${
                darkMode ? "border-gray-700 bg-gray-800/40" : "border-gray-300 bg-white/60"
              }`}>
                <FaTimesCircle className={`text-2xl ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <FaCrown className={subscriptionActive ? "text-amber-400 text-lg" : (darkMode ? "text-gray-600" : "text-gray-400")} />
                <span className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{planName}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                    subscriptionActive
                      ? (darkMode ? "bg-emerald-500/20 text-emerald-300 billing-pulse" : "bg-emerald-100 text-emerald-700")
                      : (darkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600")
                  }`}
                >
                  {subscriptionActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className={`text-sm ${darkMode ? "text-indigo-200" : "text-indigo-700"}`}>
                {subscriptionActive
                  ? <>Expires: <strong>{planExpiry}</strong> &mdash; <strong>{daysRemaining}</strong> day{daysRemaining !== 1 ? "s" : ""} remaining</>
                  : "No active subscription. Choose a plan below to get started."
                }
              </div>
              {cardOnFile && (
                <div className={`mt-1 text-xs ${darkMode ? "text-indigo-300/60" : "text-indigo-400"}`}>
                  Card on file: {paymentMethod.brand} ••••{paymentMethod.last4}
                </div>
              )}
            </div>
          </div>

          {/* Right: auto-pay badge */}
          <div className="flex flex-col items-end gap-2">
            {cardOnFile && (
              <button
                onClick={toggleAutoPay}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  autoPay
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30"
                    : (darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300")
                }`}
              >
                <FaBolt className={autoPay ? "text-yellow-300" : (darkMode ? "text-gray-300" : "text-gray-600")} />
                Auto-renewal {autoPay ? "ON" : "OFF"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          MAIN GRID: Plans + Payment Method
          ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              Choose Your Plan
            </h3>
            <div className={`flex rounded-xl p-1 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {["monthly", "yearly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPricingTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    pricingTab === t
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : (darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MONTHLY PLAN CARD */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                pricingTab === "monthly"
                  ? (darkMode
                      ? "border-indigo-500/50 bg-gray-900/90 shadow-lg shadow-indigo-500/10"
                      : "border-indigo-400 bg-white shadow-lg shadow-indigo-100")
                  : (darkMode
                      ? "border-gray-800 bg-gray-900/60 hover:border-gray-700"
                      : "border-gray-200 bg-white hover:border-gray-300")
              }`}
            >
              <div className="mb-4">
                <div className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Monthly
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {formatCurrency(PRICES.monthly)}
                  </span>
                  <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>/month</span>
                </div>
                <div className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Flexible monthly billing, cancel anytime
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {PREMIUM_FEATURES.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <FaCheck className={`mt-0.5 flex-shrink-0 ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => confirmPay("monthly")}
                disabled={busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive)
                    ? (darkMode ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                    : pricingTab === "monthly"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700"
                      : (darkMode
                          ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100")
                }`}
              >
                {busy ? "Processing\u2026" : "Subscribe Monthly"}
              </button>
            </motion.div>

            {/* YEARLY PLAN CARD */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                pricingTab === "yearly"
                  ? (darkMode
                      ? "border-indigo-500/50 bg-gray-900/90 shadow-lg shadow-indigo-500/10"
                      : "border-indigo-400 bg-white shadow-lg shadow-indigo-100")
                  : (darkMode
                      ? "border-gray-800 bg-gray-900/60 hover:border-gray-700"
                      : "border-gray-200 bg-white hover:border-gray-300")
              }`}
            >
              {/* BEST VALUE badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/30">
                  <FaStar className="text-[8px]" /> BEST VALUE
                </div>
              </div>

              <div className="mb-4 mt-2">
                <div className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Yearly
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {formatCurrency(PRICES.yearly)}
                  </span>
                  <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>/year</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {formatCurrency(monthlyEquivalent)}/mo equivalent
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    SAVE {formatCurrency(monthlySavings)}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <FaCheck className={`mt-0.5 flex-shrink-0 ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => confirmPay("yearly")}
                disabled={busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive)
                    ? (darkMode ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                    : pricingTab === "yearly"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700"
                      : (darkMode
                          ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100")
                }`}
              >
                {busy ? "Processing\u2026" : "Subscribe Yearly"}
              </button>
            </motion.div>
          </div>

          {/* Feature highlights bar */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3`}>
            {[
              { icon: <FaShieldAlt />, label: "Secure Processing", desc: "256-bit encryption" },
              { icon: <FaBolt />, label: "Instant Access", desc: "Activate immediately" },
              { icon: <FaReceipt />, label: "Auto Receipts", desc: "Generated per payment" },
              { icon: <FaRocket />, label: "Cancel Anytime", desc: "No lock-in contracts" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  darkMode ? "bg-gray-900/60 border border-gray-800" : "bg-gray-50 border border-gray-100"
                }`}
              >
                <div className={`text-sm ${darkMode ? "text-indigo-400" : "text-indigo-500"}`}>{item.icon}</div>
                <div>
                  <div className={`text-xs font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{item.label}</div>
                  <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Payment Method */}
        <div className="space-y-5">
          <h3 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            Payment Method
          </h3>

          {/* Card visual or empty state */}
          <AnimatePresence mode="wait">
            {cardOnFile ? (
              <motion.div
                key="card-visual"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <CreditCardVisual
                  brand={paymentMethod.brand}
                  last4={paymentMethod.last4}
                  name={paymentMethod.name}
                  expiry={paymentMethod.expiry}
                  darkMode={darkMode}
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={toggleAutoPay}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      autoPay
                        ? "bg-emerald-600 text-white border border-emerald-600 shadow-sm shadow-emerald-500/25"
                        : (darkMode ? "bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600" : "bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300")
                    }`}
                  >
                    <FaBolt className={autoPay ? "text-yellow-300" : ""} /> Auto-pay {autoPay ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={handleRemoveCardConfirm}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      darkMode ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-6 rounded-2xl border-2 border-dashed ${
                  darkMode ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                }`}>
                  <FaCreditCard className={`text-xl ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                </div>
                <div className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No card on file</div>
                <div className={`text-xs mt-1 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>Add a card below to enable auto-pay</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card form */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className={`text-sm font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
              {cardOnFile ? "Update Card" : "Add Card"}
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3.5">
              {/* Card Number — auto-formats: 1234 5678 9012 3456 */}
              <div>
                <label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Card Number</label>
                <div className="relative mt-1">
                  <input
                    value={cardNumber}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                      setCardNumber(formatted);
                      if (cardNumberError) setCardNumberError("");
                    }}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    maxLength={19}
                    className={inputCls}
                    aria-label="Card number"
                  />
                  {cardNumber && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-bold ${
                        guessCardBrand(cardNumber) === "Visa" ? "text-blue-500"
                        : guessCardBrand(cardNumber) === "Mastercard" ? "text-orange-500"
                        : guessCardBrand(cardNumber) === "Amex" ? "text-blue-400"
                        : (darkMode ? "text-gray-500" : "text-gray-400")
                      }`}>
                        {guessCardBrand(cardNumber)}
                      </span>
                    </div>
                  )}
                </div>
                {cardNumberError && (
                  <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <FaTimesCircle className="text-[10px]" /> {cardNumberError}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Name on Card</label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Full name"
                  className={`${inputCls} mt-1`}
                />
              </div>

              {/* Expiry + CVV row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Expiry</label>
                  <input
                    value={cardExpiry}
                    onChange={(e) => {
                      /* strip everything except digits, cap at 4 digits (MMYY) */
                      let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                      /* clamp month to 01-12 */
                      if (raw.length >= 2) {
                        let mm = parseInt(raw.slice(0, 2), 10);
                        if (mm < 1) mm = 1;
                        if (mm > 12) mm = 12;
                        raw = String(mm).padStart(2, "0") + raw.slice(2);
                      }
                      /* auto-insert "/" after 2 digits */
                      const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                      setCardExpiry(formatted);
                      if (cardExpiryError) setCardExpiryError("");
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    inputMode="numeric"
                    className={`${inputCls} mt-1`}
                  />
                  {cardExpiryError && (
                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <FaTimesCircle className="text-[10px]" /> {cardExpiryError}
                    </div>
                  )}
                </div>
                <div>
                  <label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>CVV</label>
                  <input
                    value={cardCVV}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCardCVV(v);
                      if (cardCVVError) setCardCVVError("");
                    }}
                    placeholder="123"
                    inputMode="numeric"
                    maxLength={4}
                    type="password"
                    className={`${inputCls} mt-1`}
                  />
                  {cardCVVError && (
                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <FaTimesCircle className="text-[10px]" /> {cardCVVError}
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-pay checkbox */}
              <label className={`flex items-center gap-2.5 cursor-pointer select-none py-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                <input
                  type="checkbox"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Enable auto-renewal</span>
              </label>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  <FaSave /> Save Card
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
                  }`}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ============================================================
          PAYMENT HISTORY
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl border p-6 ${cardBg}`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? "bg-indigo-500/15" : "bg-indigo-50"
            }`}>
              <FaReceipt className={`text-sm ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                Payment History
              </h3>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Download or print receipts for your records
              </p>
            </div>
          </div>
          {receipts.length > 0 && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              darkMode ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-600"
            }`}>
              {receipts.length} receipt{receipts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {receipts.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}>
              <FaReceipt className={`text-2xl ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
            </div>
            <h4 className={`font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No receipts yet
            </h4>
            <p className={`text-sm mt-1 max-w-xs mx-auto ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
              Your payment receipts will appear here automatically after each transaction.
            </p>
          </motion.div>
        ) : (
          /* Receipt list */
          <div className="space-y-2.5">
            {/* Header (desktop) */}
            <div className={`hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
              <div className="col-span-3">Receipt</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {receipts.map((r, i) => {
              const status = getReceiptStatus(r);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group rounded-xl border px-4 py-3.5 transition-all hover:shadow-md ${
                    darkMode
                      ? "bg-gray-800/40 border-gray-800 hover:bg-gray-800/70 hover:border-gray-700"
                      : "bg-gray-50/50 border-gray-100 hover:bg-white hover:border-gray-200"
                  }`}
                >
                  {/* Mobile layout */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          darkMode ? "bg-indigo-500/10" : "bg-indigo-50"
                        }`}>
                          <FaReceipt className={`text-xs ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{r.itemDesc}</div>
                          <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{r.id}</div>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                        {formatCurrency(r.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{prettyDate(r.date)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          status.active
                            ? (darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-600")
                            : (darkMode ? "bg-red-500/10 text-red-400" : "bg-red-100 text-red-600")
                        }`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => confirmDownloadReceipt(r)} title="Download" className={`p-2 rounded-lg text-xs transition-colors ${
                          darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                        }`}><FaDownload /></button>
                        <button onClick={() => confirmPrintReceipt(r)} title="Print" className={`p-2 rounded-lg text-xs transition-colors ${
                          darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                        }`}><FaPrint /></button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        darkMode ? "bg-indigo-500/10" : "bg-indigo-50"
                      }`}>
                        <FaReceipt className={`text-xs ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{r.itemDesc}</div>
                        <div className={`text-[10px] font-mono ${darkMode ? "text-gray-600" : "text-gray-400"}`}>{r.id}</div>
                      </div>
                    </div>
                    <div className={`col-span-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {prettyDate(r.date)}
                    </div>
                    <div className={`col-span-2 text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {formatCurrency(r.amount)}
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        status.active
                          ? (darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-600")
                          : (darkMode ? "bg-red-500/10 text-red-400" : "bg-red-100 text-red-600")
                      }`}>
                        {status.active ? <FaCheckCircle className="text-[9px]" /> : <FaTimesCircle className="text-[9px]" />}
                        {status.label}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => confirmDownloadReceipt(r)}
                        title="Download receipt"
                        className={`p-2 rounded-lg text-xs transition-all opacity-60 group-hover:opacity-100 ${
                          darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-indigo-400" : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => confirmPrintReceipt(r)}
                        title="Print receipt"
                        className={`p-2 rounded-lg text-xs transition-all opacity-60 group-hover:opacity-100 ${
                          darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-indigo-400" : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
