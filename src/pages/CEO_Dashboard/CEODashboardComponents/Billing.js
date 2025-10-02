import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaDownload, FaCreditCard, FaPrint, FaSave } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

/* ---------- localStorage helpers & keys ---------- */
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

/* ---------- small helpers (unique names) ---------- */
function digitsOnly(str = "") {
  return String(str).replace(/\D/g, "");
}
function formatCurrency(n = 0) {
  try {
    return `₦${Number(n).toLocaleString()}`;
  } catch {
    return `₦${n}`;
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

/* ---------- Modal (themed) ---------- */
function Modal({ open, onClose, title, children, footer, confirmLabel = "Confirm", onConfirm, darkMode = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)" }}
        onClick={onClose}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full max-w-2xl rounded-2xl p-5 shadow-2xl transition-transform transform ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}
      >
        <div className="flex items-start justify-between">
          <div id="modal-title" className="text-lg font-semibold">
            {title}
          </div>
          <button onClick={onClose} aria-label="Close" className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>✕</button>
        </div>

        <div className="mt-4 text-sm">{children}</div>

        <div className="mt-4 flex justify-end gap-3">
          {footer ? (
            footer
          ) : onConfirm ? (
            <>
              <button onClick={onClose} className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700"}`}>
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                }}
                className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
              >
                {confirmLabel}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- receipt HTML builder (dark-mode aware) ---------- */
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
        <div style="margin-top:4px">${methodLabel}${cardLast4 ? ` • • • • ${cardLast4}` : ""}</div>
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

/* ---------- expiry parsing/validation helpers ---------- */
/**
 * Accepts formats:
 *  - MM/YY
 *  - MMYY
 *  - MM/YYYY
 *  - MMYYYY
 * Returns { mon, yr } normalized (yr full 4-digit) or null if invalid format.
 */
function parseExpiry(v = "") {
  if (!v) return null;
  const cleaned = String(v).trim().replace(/\s/g, "");
  // allow optional slash
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

/* ---------- main CEOBilling component ---------- */
export default function CEOBilling() {
  const { darkMode } = useOutletContext();
  const auth = useAuth();

  // persisted state
  const [paymentMethod, setPaymentMethod] = useState(() => readJSON(KEY_PAYMENT, null));
  const [receipts, setReceipts] = useState(() => readJSON(KEY_RECEIPTS, []));
  const [subscription, setSubscription] = useState(() => readJSON(KEY_SUBS, auth?.org?.subscription || { tier: "free", expiresAt: null }));

  // form/transient UI
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [autoPay, setAutoPay] = useState(() => (paymentMethod?.autoPay || false));
  const [busy, setBusy] = useState(false);

  // inline validation errors
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardExpiryError, setCardExpiryError] = useState("");
  const [cardCVVError, setCardCVVError] = useState("");

  // modal system: { open, type: 'info'|'confirm', title, body, confirmLabel, onConfirm, footer }
  const [modalState, setModalState] = useState({ open: false });

  useEffect(() => writeJSON(KEY_PAYMENT, paymentMethod), [paymentMethod]);
  useEffect(() => writeJSON(KEY_RECEIPTS, receipts), [receipts]);
  useEffect(() => writeJSON(KEY_SUBS, subscription), [subscription]);

  // plan prices
  const PRICES = useMemo(() => ({ monthly: 39900, yearly: 399000 }), []);

  const cardOnFile = Boolean(paymentMethod);
  const planTier = subscription?.tier || "free";
  const planName = planTier === "premium" ? "ConseQ-X Ultra" : "Free";
  const planExpiry = subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "—";
  const subscriptionActive = subscription?.expiresAt && new Date(subscription.expiresAt).getTime() > Date.now();

  /**
   * TEMP OVERRIDE: allow pay buttons to be usable even when a subscription is active.
   * Set to `false` in production to re-enable the guard preventing duplicate active subscriptions.
   */
  const ALLOW_PAY_WHILE_ACTIVE = true; // <-- set to false for production behavior

  /* ---------- validation helpers ---------- */
  function isValidCardNumber(num = "") {
    const s = digitsOnly(num);
    return s.length >= 13 && s.length <= 19;
  }
  function isValidCVV(cvv = "", brand = "Card") {
    const s = digitsOnly(cvv);
    if (brand === "Amex") return s.length === 4;
    return s.length === 3;
  }

  /* ---------- receipt & payment processing (mock) ---------- */
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
      await new Promise((r) => setTimeout(r, 650)); // network simulation

      // require card for auto/online card charges
      if (method === "card" && !paymentMethod) {
        setModalState({ open: true, type: "info", title: "Card required", body: <div>Please add a card before charging.</div> });
        setBusy(false);
        return false;
      }

      const cardLast4 = paymentMethod?.last4 || null;
      const methodLabel = method === "card" ? "Card" : "Manual";
      const receipt = createReceipt({
        amount,
        itemDesc: `${planName} subscription (${periodLabel || "payment"})`,
        methodLabel,
        cardLast4,
        periodLabel,
      });

      // update subscription expiry if charge was for monthly/yearly
      const nowTs = Date.now();
      if (periodLabel === "monthly") {
        const expiresAt = nowTs + 30 * 24 * 3600 * 1000;
        setSubscription((s) => ({ ...(s || {}), tier: "premium", expiresAt }));
      } else if (periodLabel === "yearly") {
        const expiresAt = nowTs + 365 * 24 * 3600 * 1000;
        setSubscription((s) => ({ ...(s || {}), tier: "premium", expiresAt }));
      }

      setBusy(false);

      setModalState({
        open: true,
        type: "info",
        title: "Payment success",
        body: (
          <div>
            Payment processed successfully — a receipt was created ({receipt.id}). You can download or print it from the receipts list.
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

    // reset inline errors
    setCardNumberError("");
    setCardExpiryError("");
    setCardCVVError("");

    const brand = guessCardBrand(cardNumber);

    if (!isValidCardNumber(cardNumber)) {
      setCardNumberError("Enter 13–19 digits for card number.");
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
    setModalState({ open: true, type: "info", title: "Card saved", body: <div>Card saved locally (dev). In production, use a PCI-compliant provider.</div> });
  }

  function handleRemoveCardConfirm() {
    setModalState({
      open: true,
      type: "confirm",
      title: "Remove card?",
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
    setModalState({ open: true, type: "info", title: next ? "Auto-pay enabled" : "Auto-pay disabled", body: <div>Auto subscription setting updated.</div> });
  }

  /* ---------- pay flow (confirm first, allow override for testing) ---------- */
  function confirmPay(period) {
    // Production behavior: block if already active
    if (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive) {
      setModalState({ open: true, type: "info", title: "Subscription active", body: <div>You already have an active subscription. Renewals are not allowed while active.</div> });
      return;
    }

    const amount = period === "yearly" ? PRICES.yearly : PRICES.monthly;
    const methodLabel = paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : "No card on file (manual)";
    const periodLabel = period === "yearly" ? "Yearly" : "Monthly";

    setModalState({
      open: true,
      type: "confirm",
      title: `Confirm ${periodLabel} payment`,
      body: (
        <div className="space-y-2">
          <div>Plan: <strong>{planName}</strong></div>
          <div>Amount: <strong>{formatCurrency(amount)}</strong></div>
          <div>Billing: <strong>{periodLabel}</strong></div>
          <div>Payment method: <strong>{methodLabel}</strong></div>
          {subscriptionActive && ALLOW_PAY_WHILE_ACTIVE && (
            <div className="text-sm text-yellow-600">Note: subscription is currently active — you are allowed to test payment while this override is enabled.</div>
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

  /* ---------- receipts status (Active / Expired) ---------- */
  function getReceiptStatus(r) {
    const nowTs = Date.now();
    if (!r.periodLabel) return { label: "Issued", active: false };
    const periodMs = r.periodLabel === "yearly" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
    const expiresAt = r.date + periodMs;
    if (nowTs <= expiresAt) return { label: "Active", active: true, expiresAt };
    return { label: "Expired", active: false, expiresAt };
  }

  /* ---------- receipts actions with confirm modals (no delete) ---------- */
  function confirmDownloadReceipt(r) {
    setModalState({
      open: true,
      type: "confirm",
      title: "Download receipt?",
      body: <div>Download receipt <strong>{r.id}</strong> ({formatCurrency(r.amount)}) to your device?</div>,
      confirmLabel: "Download",
      onConfirm: () => {
        setModalState({ open: false });
        downloadReceipt(r);
      },
    });
  }

  function confirmPrintReceipt(r) {
    setModalState({
      open: true,
      type: "confirm",
      title: "Print receipt?",
      body: <div>Open a print view for receipt <strong>{r.id}</strong> ({formatCurrency(r.amount)})?</div>,
      confirmLabel: "Open print",
      onConfirm: () => {
        setModalState({ open: false });
        openPrintView(r);
      },
    });
  }

  /* ---------- other small handlers ---------- */
  function handleClearForm() {
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVV("");
    setCardNumberError("");
    setCardExpiryError("");
    setCardCVVError("");
  }

  return (
    <section>
      <Modal
        open={Boolean(modalState.open)}
        onClose={() => setModalState({ open: false })}
        title={modalState.title}
        footer={modalState.footer}
        confirmLabel={modalState.confirmLabel}
        onConfirm={modalState.onConfirm}
        darkMode={darkMode}
      >
        <div className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>{modalState.body}</div>
      </Modal>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg font-semibold`}>Billing & Receipts</h2>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Manage subscription, card on file, and download printable receipts. Receipts are generated locally and can be saved as PDF via your browser's Print dialog.
          </p>
        </div>

        <div className="text-sm text-right">
          <div>
            Plan: <strong className={darkMode ? "text-gray-100" : ""}>{planName}</strong>
            <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ background: subscriptionActive ? (darkMode ? "#052e0f" : "#ecfdf5") : (darkMode ? "#2b0b0b" : "#fff5f5"), color: subscriptionActive ? (darkMode ? "#9ee2a7" : "#059669") : (darkMode ? "#fda4af" : "#dc2626") }}>
              {subscriptionActive ? `Active • Expires ${planExpiry}` : "Expired / Inactive"}
            </span>
          </div>
          <div className={`${darkMode ? "text-gray-300 text-xs" : "text-xs text-gray-500"}`}>Expires: {planExpiry}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: subscription & receipts */}
        <div className={`${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} rounded-2xl p-4 lg:col-span-2 shadow-sm`}>
          <div className="flex items-start justify-between">
            <div>
              <div className={`${darkMode ? "text-gray-400" : "text-sm text-gray-400"}`}>Subscription</div>
              <div className="text-2xl font-semibold mt-1">{planName}</div>
              <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-500"} mt-2`}>Upgrade for CEO features, unlimited analyses, and priority support.</div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={`${darkMode ? "text-xs text-green-400" : "text-xs text-green-500"}`}>Save ~2 months</div>
              <div className="flex gap-2">
                <button
                  onClick={() => confirmPay("monthly")}
                  disabled={busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive)}
                  className={`px-4 py-2 rounded-md ${busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"}`}
                >
                  {busy ? "Processing..." : `Pay Monthly — ${formatCurrency(PRICES.monthly)}`}
                </button>
                <button
                  onClick={() => confirmPay("yearly")}
                  disabled={busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive)}
                  className={`px-4 py-2 rounded-md ${busy || (!ALLOW_PAY_WHILE_ACTIVE && subscriptionActive) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : (darkMode ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-200 text-gray-700")}`}
                >
                  {busy ? "Processing..." : `Pay Yearly — ${formatCurrency(PRICES.yearly)}`}
                </button>
              </div>
            </div>
          </div>

          <hr className={`my-4 ${darkMode ? "border-gray-800" : "border-gray-200"}`} />

          <div>
            <h4 className="text-sm font-semibold">Receipts</h4>
            <div className="mt-3 space-y-3 max-h-96 overflow-auto">
              {receipts.length === 0 ? (
                <div className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm`}>No receipts yet. Payments will generate receipts automatically.</div>
              ) : (
                receipts.map((r) => {
                  const status = getReceiptStatus(r);
                  return (
                    <div key={r.id} className={`${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"} p-3 rounded-md flex items-center justify-between`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{r.itemDesc}</div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${status.active ? (darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700") : (darkMode ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700")}`}>
                            {status.label}
                          </div>
                        </div>
                        <div className={`${darkMode ? "text-gray-400" : "text-xs text-gray-400"}`}>{prettyDate(r.date)}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold">{formatCurrency(r.amount)}</div>

                        <button
                          onClick={() => confirmDownloadReceipt(r)}
                          title="Download receipt"
                          className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}
                        >
                          <FaDownload />
                        </button>

                        <button
                          onClick={() => confirmPrintReceipt(r)}
                          title="Print receipt"
                          className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}
                        >
                          <FaPrint />
                        </button>

                        {/* delete removed per request */}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: payment method / card management */}
        <aside className={`${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"} rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">Payment method</div>
              <div className="text-xs text-gray-400">Card on file and auto-subscription settings</div>
            </div>
            <div>
              {cardOnFile ? (
                <button onClick={handleRemoveCardConfirm} className={`px-2 py-1 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : ""}`}>Remove</button>
              ) : null}
            </div>
          </div>

          {cardOnFile ? (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-indigo-600 text-white px-3 py-2">
                  <FaCreditCard />
                </div>
                <div>
                  <div className="font-medium">{paymentMethod.brand || "Card"}</div>
                  <div className="text-xs text-gray-400">•••• •••• •••• {paymentMethod.last4}</div>
                  <div className="text-xs text-gray-400">Expiry: {paymentMethod.expiry}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className={`${darkMode ? "text-gray-400" : "text-sm text-gray-400"}`}>Auto withdraw</div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleAutoPay} className={`px-2 py-1 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white"}`}>
                    {autoPay ? <span className="flex items-center gap-2 text-green-400">Enabled</span> : <span className="flex items-center gap-2 text-gray-400">Disabled</span>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 text-sm text-gray-500">No card on file. Add a card below to enable auto-subscription.</div>
          )}

          <form onSubmit={handleSaveCard} className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Card number</label>
              <input
                value={cardNumber}
                onChange={(e) => {
                  const raw = e.target.value;
                  const cleaned = raw.replace(/[^\d\s]/g, "");
                  setCardNumber(cleaned.slice(0, 23));
                  if (cardNumberError) setCardNumberError("");
                }}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                aria-label="Card number"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400 mt-1">Digits only, 13–19 characters.</div>
                {cardNumberError && <div className="text-xs text-red-500 mt-1">{cardNumberError}</div>}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Name on card</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Full name"
                className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400">Expiry (MM/YY)</label>
                <input
                  value={cardExpiry}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d\/]/g, "").slice(0, 6);
                    setCardExpiry(v);
                    if (cardExpiryError) setCardExpiryError("");
                  }}
                  onBlur={() => {
                    const parsed = parseExpiry(cardExpiry);
                    if (parsed) {
                      const mm = String(parsed.mon).padStart(2, "0");
                      const yy = String(parsed.yr).slice(-2);
                      setCardExpiry(`${mm}/${yy}`);
                    }
                  }}
                  placeholder="08/28"
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400 mt-1">MM/YY or MMYY</div>
                  {cardExpiryError && <div className="text-xs text-red-500 mt-1">{cardExpiryError}</div>}
                </div>
              </div>

              <div style={{ width: 120 }}>
                <label className="text-xs text-gray-400">CVV</label>
                <input
                  value={cardCVV}
                  onChange={(e) => {
                    const v = digitsOnly(e.target.value).slice(0, 4);
                    setCardCVV(v);
                    if (cardCVVError) setCardCVVError("");
                  }}
                  placeholder="123"
                  inputMode="numeric"
                  className={`w-full mt-1 px-3 py-2 rounded border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200"}`}
                />
                <div className="flex items-center justify-between">
                  <div />
                  {cardCVVError && <div className="text-xs text-red-500 mt-1">{cardCVVError}</div>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="autopay" type="checkbox" checked={autoPay} onChange={(e) => setAutoPay(e.target.checked)} />
              <label htmlFor="autopay" className="text-sm text-gray-400">Enable auto-subscription (auto withdraw)</label>
            </div>

            <div className="flex items-center gap-2">
              <button type="submit" className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <FaSave className="inline-block mr-2" /> Save card
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className={`px-3 py-2 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}
              >
                Clear
              </button>

              {cardOnFile && (
                <button type="button" onClick={handleRemoveCardConfirm} className="px-3 py-2 rounded-md border text-red-600">
                  Remove
                </button>
              )}
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}
