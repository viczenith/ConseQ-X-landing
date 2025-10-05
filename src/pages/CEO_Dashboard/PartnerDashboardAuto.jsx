import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaBolt, FaPlay, FaPause, FaTimes, FaDownload, FaChartLine } from "react-icons/fa";
import { CANONICAL_SYSTEMS, normalizeSystemKey } from "./constants/systems";

/* ---------------- helpers ---------------- */
function seedForKey(key, index) {
  const s = String(key || "");
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return Math.max(30, Math.min(95, (sum % 60) + 30 + (index % 6) * 2));
}
function randBetween(min, max) { return Math.round(min + Math.random() * (max - min)); }
function toneClassFor(pct) {
  if (pct >= 80) return "text-green-500";
  if (pct >= 60) return "text-yellow-500";
  return "text-red-500";
}
function formatTime(ts) { try { return new Date(ts).toLocaleTimeString(); } catch { return ""; } }

const STORAGE_UPLOADS = "conseqx_uploads_v1";
const STORAGE_ASSESS = "conseqx_assessments_v1";
const STORAGE_SCENARIOS = "conseqx_saved_scenarios_v1";

function readUploads() { try { const raw = localStorage.getItem(STORAGE_UPLOADS); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function readAssessmentsForOrg(orgId = "anon") { try { const raw = localStorage.getItem(STORAGE_ASSESS); const byOrg = raw ? JSON.parse(raw) : {}; return byOrg[orgId] || []; } catch { return []; } }
function readSavedScenarios() { try { const raw = localStorage.getItem(STORAGE_SCENARIOS); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function writeSavedScenarios(list = []) { try { localStorage.setItem(STORAGE_SCENARIOS, JSON.stringify(list)); } catch { } }

/* ---------------- external signals + correlation ---------------- */
function generateSignals(canonical) {
  const ts = Date.now();
  return canonical.map((s, i) => {
    const keySeed = Array.from(String(s.key || "")).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const base = (keySeed % 40) + 40 + (i * 3);
    const wobble = Math.round(Math.sin((ts / (5000 + i * 1000)) + (i * 0.5)) * 12);
    const value = Math.max(0, Math.min(100, base + wobble - 10));
    return {
      id: `ext-${s.key}-${Math.floor(ts / 1000)}`,
      systemKey: s.key,
      type: ["market", "regulatory", "competitor", "macro"][i % 4],
      value,
      importance: (value > 75) ? "high" : (value > 55) ? "medium" : "low",
      description: `${s.title} external signal snapshot`,
      timestamp: ts,
      source: "external-feed",
    };
  });
}
function correlate(systemScore, signals = []) {
  const s = signals[0];
  if (!s) return { impactLevel: "none", expectedDelta: 0, reason: "No external signal" };
  const importanceFactor = s.importance === "high" ? 1.0 : s.importance === "medium" ? 0.6 : 0.3;
  const diff = Math.round((s.value - 50) / 2);
  const expectedDelta = Math.round(diff * importanceFactor);
  const abs = Math.abs(expectedDelta);
  const impactLevel = abs >= 12 ? "high" : abs >= 6 ? "medium" : (abs >= 1 ? "low" : "none");
  const reason = `${s.type} (${s.source}) value ${s.value} → expected ${expectedDelta >= 0 ? "+" : ""}${expectedDelta}`;
  return { impactLevel, expectedDelta, reason, signal: s };
}

/* ---------------- Canvas Live Bars ---------------- */
function LiveBarsCanvas({ values = [], darkMode = false, width = 120, height = 64, barCount = 18, palette = "crypto", tooltipRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const devicePixelRatioRef = useRef(typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1);
  const displayRef = useRef((values || []).slice(-barCount).concat([]));

  if (displayRef.current.length < barCount) {
    displayRef.current = Array.from({ length: barCount - displayRef.current.length }, () => 0).concat(displayRef.current);
  }

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = devicePixelRatioRef.current || 1;
    cvs.width = Math.round(width * dpr);
    cvs.height = Math.round(height * dpr);
    cvs.style.width = `${width}px`;
    cvs.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let running = true;
    function drawFrame() {
      if (!running) return;
      const tail = (values || []).slice(-barCount);
      const target = Array.from({ length: Math.max(0, barCount - tail.length) }, () => 0).concat(tail.map((v) => Number(v || 0)));
      for (let i = 0; i < barCount; i++) {
        const a = displayRef.current[i] == null ? 0 : displayRef.current[i];
        const b = target[i] == null ? 0 : target[i];
        displayRef.current[i] = a + (b - a) * 0.18;
      }

      // background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = darkMode ? "#061226" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const spacing = width / barCount;
      const barW = Math.max(3, Math.floor(spacing * 0.62));
      const padX = (spacing - barW) / 2;
      const maxBarH = height - 16;

      const realVals = target.filter((v) => typeof v === "number");
      const l2 = realVals.length >= 2 ? realVals[realVals.length - 2] : realVals[realVals.length - 1] || 0;
      const l1 = realVals.length >= 1 ? realVals[realVals.length - 1] : 0;
      const trend = l1 >= l2 ? "up" : "down";

      let gradTop, gradMid, gradBot;
      if (palette === "crypto") {
        gradTop = trend === "up" ? (darkMode ? "#34d399" : "#10b981") : (darkMode ? "#fb7185" : "#ef4444");
        gradMid = trend === "up" ? (darkMode ? "#10b981" : "#059669") : (darkMode ? "#fb923c" : "#f97316");
        gradBot = darkMode ? "#021022" : "#ffffff";
      } else {
        gradTop = darkMode ? "#60a5fa" : "#3b82f6";
        gradMid = darkMode ? "#2563eb" : "#2563eb";
        gradBot = darkMode ? "#071025" : "#ffffff";
      }

      // draw bars left-to-right
      for (let i = 0; i < barCount; i++) {
        const val = Math.max(0, Math.min(100, displayRef.current[i] || 0));
        const h = Math.max(2, Math.round((val / 100) * maxBarH));
        const x = i * spacing + padX;
        const y = height - h - 10;
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, gradTop);
        g.addColorStop(0.6, gradMid);
        g.addColorStop(1, gradBot);

        ctx.fillStyle = g;
        const radius = Math.min(barW / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, y + h - radius);
        ctx.quadraticCurveTo(x + barW, y + h, x + barW - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      ctx.fillRect(0, height - 6, width, 2);

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [values, darkMode, width, height, barCount, palette]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    function getPointerX(e) { if (e.touches && e.touches[0]) return e.touches[0].clientX; return e.clientX; }
    function getPointerY(e) { if (e.touches && e.touches[0]) return e.touches[0].clientY; return e.clientY; }
    function onMove(e) {
      const rect = cvs.getBoundingClientRect();
      const x = getPointerX(e) - rect.left;
      const spacing = width / barCount;
      let index = Math.floor(x / spacing);
      if (index < 0) index = 0;
      if (index >= barCount) index = barCount - 1;
      const tail = (values || []).slice(-barCount);
      const padded = Array.from({ length: Math.max(0, barCount - tail.length) }, () => 0).concat(tail.map((v) => Number(v || 0)));
      const value = padded[index] || 0;
      const timestamp = Date.now();
      if (tooltipRef && tooltipRef.current && typeof tooltipRef.current.show === "function") {
        tooltipRef.current.show({ index, value, timestamp, pageX: getPointerX(e), pageY: getPointerY(e) });
      }
    }
    function onLeave() {
      if (tooltipRef && tooltipRef.current && typeof tooltipRef.current.hide === "function") tooltipRef.current.hide();
    }
    cvs.addEventListener("mousemove", onMove);
    cvs.addEventListener("mouseleave", onLeave);
    cvs.addEventListener("touchstart", onMove, { passive: true });
    cvs.addEventListener("touchmove", onMove, { passive: true });
    cvs.addEventListener("touchend", onLeave, { passive: true });
    return () => {
      cvs.removeEventListener("mousemove", onMove);
      cvs.removeEventListener("mouseleave", onLeave);
      cvs.removeEventListener("touchstart", onMove);
      cvs.removeEventListener("touchmove", onMove);
      cvs.removeEventListener("touchend", onLeave);
    };
  }, [values, barCount, width, tooltipRef]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: `${width}px`, height: `${height}px`, borderRadius: 8 }} aria-hidden />;
}

/* ---------------- Tooltip (forwarded ref) ---------------- */
const Tooltip = React.forwardRef(({ darkMode = false }, ref) => {
  const [state, setState] = useState({ visible: false, index: 0, value: 0, timestamp: null, left: 0, top: 0 });
  React.useImperativeHandle(ref, () => ({
    show: ({ index = 0, value = 0, timestamp = null, pageX = 0, pageY = 0 } = {}) => {
      const offsetX = 12, offsetY = -36;
      let left = pageX + offsetX;
      let top = pageY + offsetY;
      const vw = window.innerWidth, vh = window.innerHeight;
      const estW = 160, estH = 56;
      if (left + estW > vw - 8) left = Math.max(8, pageX - estW - offsetX);
      if (top < 8) top = Math.min(vh - estH - 8, pageY + 12);
      setState({ visible: true, index, value: Math.round(Number(value) || 0), timestamp, left, top });
    },
    hide: () => setState((s) => ({ ...s, visible: false })),
  }), []);

  if (!state.visible) return null;
  const bg = darkMode ? "rgba(2,6,23,0.9)" : "#fff";
  const border = darkMode ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.06)";
  const text = darkMode ? "#E6F0FF" : "#071024";

  return (
    <div role="tooltip" aria-hidden={!state.visible} style={{
      position: "fixed", left: state.left, top: state.top, zIndex: 9999, pointerEvents: "none",
      minWidth: 140, maxWidth: 300, padding: "8px 10px", borderRadius: 8, boxShadow: "0 8px 24px rgba(2,6,23,0.4)",
      background: bg, border: `1px solid ${border}`, color: text, fontSize: 13, lineHeight: 1.2
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{state.value}%</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>{state.timestamp ? formatTime(state.timestamp) : ""}</div>
    </div>
  );
});

/* ---------------- main component ---------------- */
export default function PartnerDashboardAuto({ orgId: propOrgId = null }) {
  const { darkMode, org } = useOutletContext();
  const navigate = useNavigate();
  const effectiveOrgId = propOrgId || (org && (org.id || org.orgId)) || "anon";

  const canonical = useMemo(() => {
    if (Array.isArray(CANONICAL_SYSTEMS) && CANONICAL_SYSTEMS.length) {
      return CANONICAL_SYSTEMS.map((s, i) => ({
        key: normalizeSystemKey ? normalizeSystemKey(s.key || s.id || s.system || "") : String(s.key || s.id || "").toLowerCase(),
        title: s.title || s.label || s.key || `System ${i + 1}`,
        desc: s.description || s.blurb || "",
      }));
    }
    return [
      { key: "interdependency", title: "Interdependency", desc: "" },
      { key: "iteration", title: "Iteration", desc: "" },
      { key: "investigation", title: "Investigation", desc: "" },
      { key: "interpretation", title: "Interpretation", desc: "" },
      { key: "illustration", title: "Illustration", desc: "" },
      { key: "inlignment", title: "Inlignment", desc: "" },
    ];
  }, []);

  // uploads & assessments
  const [uploads, setUploads] = useState(() => readUploads());
  const [assessments, setAssessments] = useState(() => readAssessmentsForOrg(effectiveOrgId));
  useEffect(() => {
    function refresh() { setUploads(readUploads()); setAssessments(readAssessmentsForOrg(effectiveOrgId)); }
    window.addEventListener("storage", refresh);
    window.addEventListener("conseqx:notifications:updated", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("conseqx:notifications:updated", refresh); };
  }, [effectiveOrgId]);

  // assessed keys
  const assessedKeys = useMemo(() => {
    const keys = new Set();
    (assessments || []).forEach((a) => {
      const raw = a.systemId || a.system || a.systemKey || a.meta?.systemId || "";
      if (!raw) return;
      const k = normalizeSystemKey ? normalizeSystemKey(raw) : String(raw || "").toLowerCase();
      if (k) keys.add(k);
    });
    const latest = uploads && uploads.length ? uploads[0] : null;
    if (latest && Array.isArray(latest.analyzedSystems)) {
      latest.analyzedSystems.forEach((s) => {
        const k = normalizeSystemKey ? normalizeSystemKey(s) : String(s || "").toLowerCase();
        if (k) keys.add(k);
      });
    }
    return keys;
  }, [assessments, uploads]);

  // working scores & history
  const [workingScores, setWorkingScores] = useState(() => {
    const o = {};
    canonical.forEach((s, i) => (o[s.key] = seedForKey(s.key, i)));
    return o;
  });
  const historyRef = useRef({});
  canonical.forEach((s) => { historyRef.current[s.key] = historyRef.current[s.key] || [workingScores[s.key] || 50]; });

  // what-if deltas (preview only)
  const [deltas, setDeltas] = useState({});
  const [whatIfOpen, setWhatIfOpen] = useState({});
  function setWhatIfVal(systemKey, val) {
    if (!assessedKeys.has(systemKey)) return;
    setDeltas((d) => ({ ...d, [systemKey]: Number(val) }));
  }
  function clearWhatIf(systemKey) {
    setDeltas((d) => { const n = { ...d }; delete n[systemKey]; return n; });
    setWhatIfOpen((s) => ({ ...s, [systemKey]: false }));
  }
  function applyWhatIfToWorking(systemKey) {
    if (!assessedKeys.has(systemKey)) return;
    const add = Number(deltas[systemKey] || 0);
    if (!add) return;
    setWorkingScores((prev) => {
      const next = { ...prev };
      next[systemKey] = Math.max(0, Math.min(100, Math.round((next[systemKey] || 0) + add)));
      historyRef.current[systemKey] = (historyRef.current[systemKey] || []).concat(next[systemKey]).slice(-36);
      return next;
    });
    setAlerts((a) => [{ id: `S-${Date.now()}`, level: "info", type: "scenario", systemKey, title: `Scenario applied: ${systemKey}`, text: `Applied preview change ${add >= 0 ? "+" + add : add} to ${systemKey}`, ts: Date.now() }, ...a].slice(0, 12));
    clearWhatIf(systemKey);
    try { window.dispatchEvent(new CustomEvent("conseqx:simulation:applied", { detail: { systemKey, delta: add, appliedAt: Date.now() } })); } catch {}
  }

  // preview derived
  const previewScores = useMemo(() => {
    const p = { ...workingScores };
    Object.keys(deltas).forEach((k) => {
      const add = Number(deltas[k]) || 0;
      if (typeof p[k] === "number") p[k] = Math.max(0, Math.min(100, Math.round(p[k] + add)));
    });
    return p;
  }, [workingScores, deltas]);

  // composite preview across assessed only
  const compositePreview = useMemo(() => {
    const vals = canonical.filter(c => assessedKeys.has(c.key)).map(c => previewScores[c.key]).filter(v => typeof v === "number");
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [previewScores, canonical, assessedKeys]);

  // alerts
  const [alerts, setAlerts] = useState([]);
  const [autoOn, setAutoOn] = useState(true);
  const intervalRef = useRef(null);
  const [externalSignals, setExternalSignals] = useState(() => generateSignals(canonical));
  const [deepModal, setDeepModal] = useState({ open: false, systemKey: null });
  const [palette, setPalette] = useState("crypto");
  const tooltipControl = useRef(null);

  // scenario panel state
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [savedScenarios, setSavedScenarios] = useState(() => readSavedScenarios());
  const [editingScenarioId, setEditingScenarioId] = useState(null);

  // composite (current)
  const composite = useMemo(() => {
    const vals = canonical.filter(c => assessedKeys.has(c.key)).map(c => workingScores[c.key]).filter(v => typeof v === "number");
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [workingScores, canonical, assessedKeys]);

  // external polling
  useEffect(() => {
    let extInt = null;
    function pollExternal() {
      const sigs = generateSignals(canonical);
      setExternalSignals(sigs);
      try { window.dispatchEvent(new CustomEvent("conseqx:external:updated", { detail: { signals: sigs } })); } catch (e) {}
    }
    if (autoOn) {
      pollExternal();
      extInt = setInterval(pollExternal, 5000);
    } else {
      pollExternal();
    }
    return () => { if (extInt) clearInterval(extInt); };
  }, [autoOn, canonical]);

  // auto tick — only update assessed systems
  useEffect(() => {
    function tick() {
      setWorkingScores((prev) => {
        const next = { ...prev };
        canonical.forEach((s) => {
          if (!assessedKeys.has(s.key)) return;
          const delta = randBetween(-2, 3);
          next[s.key] = Math.max(10, Math.min(95, (next[s.key] || 50) + delta));
          historyRef.current[s.key] = (historyRef.current[s.key] || []).concat(next[s.key]).slice(-36);
        });
        return next;
      });
    }

    if (autoOn) {
      tick();
      intervalRef.current = setInterval(tick, 3000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }

    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [autoOn, canonical, assessedKeys]);

  /* ---------------- Alert evaluator (kept from earlier) ---------------- */
  const prevScoresRef = useRef({});
  useEffect(() => {
    function evaluateAlerts() {
      const newAlerts = [];
      const now = Date.now();

      canonical.forEach((s) => {
        if (!assessedKeys.has(s.key)) return;
        const prev = prevScoresRef.current[s.key];
        const cur = workingScores[s.key];
        if (typeof prev === "number" && typeof cur === "number") {
          const diff = cur - prev;
          if (Math.abs(diff) >= 8) {
            newAlerts.push({
              id: `score-${s.key}-${now}`,
              level: Math.abs(diff) >= 12 ? "high" : "medium",
              type: "score-shock",
              systemKey: s.key,
              title: `${s.title} ${diff < 0 ? "dropped" : "rose"} ${Math.abs(diff)} pts`,
              text: `${s.title} score ${diff < 0 ? "declined" : "increased"} by ${diff} points since last check.`,
              ts: now,
              suggestedAction: { label: "Open deep dive", action: () => openDeepModal(s.key) },
            });
          }
        }
      });

      externalSignals.forEach((sig) => {
        const sKey = sig.systemKey;
        const isAssessed = assessedKeys.has(sKey);
        const corr = correlate((workingScores[sKey] ?? 0), [sig]);
        if (isAssessed) {
          if (corr.impactLevel === "high") {
            newAlerts.push({
              id: `ext-${sig.id}`,
              level: "high",
              type: "external-impact",
              systemKey: sKey,
              title: `External (${sig.type}) impact on ${(canonical.find(x => x.key === sKey) || {}).title}`,
              text: `${sig.type} signal at ${sig.value} (importance ${sig.importance}) — expected ${corr.expectedDelta >= 0 ? "+" + corr.expectedDelta : corr.expectedDelta} pts.`,
              ts: sig.timestamp,
              signal: sig,
              suggestedAction: { label: "Open deep dive", action: () => openDeepModal(sKey) },
            });
          }
        } else {
          if (sig.value >= 75) {
            newAlerts.push({
              id: `assess-missing-${sKey}-${sig.id}`,
              level: "medium",
              type: "assessment-missing",
              systemKey: sKey,
              title: `Assessment recommended: ${(canonical.find(x => x.key === sKey) || {}).title}`,
              text: `High external signal (${sig.type} ${sig.value}). Consider assessing this system to enable diagnostics.`,
              ts: sig.timestamp,
              suggestedAction: { label: "Take assessment", action: () => startAssessmentFor(sKey) },
            });
          }
        }
      });

      setAlerts((current) => {
        const byKey = new Map();
        current.forEach((a) => {
          const key = `${a.type || a.id}-${a.systemKey || ""}`;
          byKey.set(key, a);
        });
        newAlerts.forEach((a) => {
          const key = `${a.type || a.id}-${a.systemKey || ""}`;
          byKey.set(key, a);
        });
        const arr = Array.from(byKey.values()).sort((A, B) => {
          const score = (level) => ({ high: 3, medium: 2, low: 1, info: 0 }[level] || 0);
          const s = score(B.level) - score(A.level);
          if (s !== 0) return s;
          return B.ts - A.ts;
        });
        return arr.slice(0, 24);
      });

      prevScoresRef.current = { ...workingScores };
    }

    evaluateAlerts();
  }, [workingScores, externalSignals, canonical, assessedKeys]);

  // actions / modal
  function openDeepModal(systemKey) {
    if (!assessedKeys.has(systemKey)) return;
    setDeepModal({ open: true, systemKey });
  }
  function closeDeepModal() { setDeepModal({ open: false, systemKey: null }); }

  function exportSystemJSON(systemKey) {
    try {
      const payload = {
        systemKey,
        title: (canonical.find(s => s.key === systemKey) || {}).title,
        current: workingScores[systemKey],
        preview: previewScores[systemKey],
        history: historyRef.current[systemKey] || [],
        external: (externalSignals || []).find(x => x.systemKey === systemKey) || null,
        exportedAt: Date.now(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(payload.title || systemKey)}_deepdive.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {}
  }

  function printDeep(systemKey) {
    const sys = canonical.find(s => s.key === systemKey) || { title: systemKey };
    const hist = (historyRef.current[systemKey] || []).slice(-24);
    const ext = (externalSignals || []).find(x => x.systemKey === systemKey);
    const content = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${sys.title} — Deep Dive</title><style>
      @page{margin:20mm}body{font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial;color:#111;margin:0;padding:0;background:#fff}
      .wrap{max-width:820px;margin:18px auto;padding:18px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
      header h1{font-size:20px;margin:0}.meta{color:#555;font-size:13px}.panel{border-radius:10px;padding:12px;margin-bottom:12px;background:#fff;border:1px solid #e6e6e6}
      .score{font-size:34px;font-weight:700}.muted{color:#666;font-size:13px}.row{display:flex;justify-content:space-between;gap:12px;align-items:center}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:8px}
      pre{white-space:pre-wrap;word-break:break-word;font-size:12px;color:#222;background:transparent;padding:0;border:none}footer{margin-top:18px;color:#666;font-size:12px;text-align:right}
      @media print{body{-webkit-print-color-adjust:exact}.wrap{box-shadow:none}}</style></head><body>
      <div class="wrap"><header><div><h1>${sys.title} — Deep Dive</h1><div class="meta">${new Date().toLocaleString()}</div></div>
      <div style="text-align:right"><div class="score">${previewScores[systemKey] ?? "—"}%</div><div class="muted">Current: ${workingScores[systemKey] ?? "—"}%</div></div></header>
      <div class="panel"><div class="row"><div><div style="font-weight:600">Insights</div><div class="muted">${(synthInsights(systemKey)).join(" • ")}</div></div>
      <div style="width:38%"><div style="font-weight:600">External signal</div><div class="muted">${ext ? `${ext.type} ${ext.value} (${ext.importance}) — ${ext.source}` : "None"}</div></div></div></div>
      <div class="panel"><div style="font-weight:600;margin-bottom:8px">Recent history (last ${hist.length} points)</div><pre>${JSON.stringify(hist,null,2)}</pre></div>
      <div class="panel grid"><div><div style="font-weight:600">Forecast (4 weeks)</div><div class="muted">${synthForecasts(systemKey)[0].text}</div></div>
      <div><div style="font-weight:600">Recommendations</div><div class="muted">${synthRecs(systemKey)[0].items.join("; ")}</div></div>
      <div><div style="font-weight:600">Export</div><div class="muted">Use browser Print -> Save as PDF to create a PDF report.</div></div></div>
      <footer>Generated by Conseq-X • ${new Date().toLocaleString()}</footer></div><script>setTimeout(()=>{window.print();},500);</script></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(content);
    w.document.close();
    w.focus();
  }

  function synthInsights(systemKey) {
    const cur = workingScores[systemKey] ?? 0;
    const ext = (externalSignals || []).filter(x => x.systemKey === systemKey);
    const corr = correlate(cur, ext ? ext : []);
    const base = [
      cur >= 75 ? "Strong capability demonstrated — maintain governance and measure velocity." : "Observed gaps in handoffs and ownership; prioritize short sprints.",
      cur < 60 ? "Risk of delays under pressure; assign dedicated owners and SLAs." : "Stable under current conditions; test scale scenarios.",
    ];
    if (corr.impactLevel && corr.impactLevel !== "none") base.push(`External signal impact: ${corr.impactLevel.toUpperCase()} — ${corr.reason}`);
    return base;
  }
  function synthForecasts(systemKey) {
    return [
      { horizon: "4 weeks", text: "Small stabilization expected with focused sprints." },
      { horizon: "3 months", text: "Measurable lift if owners and KPIs are enforced." },
      { horizon: "12 months", text: "Sustained improvement requires capability uplift and playbooks." },
    ];
  }
  function synthRecs(systemKey) {
    return [
      { title: "Short", items: ["Assign triage owner for top blockers", "Start 2-week improvement sprint"] },
      { title: "Mid", items: ["Set weekly KPIs", "Document common handoffs"] },
      { title: "Long", items: ["Embed playbooks", "Run capability uplift program"] },
    ];
  }

  function startAssessmentFor(systemKey) {
    navigate(`/ceo/assessments?focus=${encodeURIComponent(systemKey)}`);
  }

  function ackAlert(alertId) {
    setAlerts((a) => a.filter(x => x.id !== alertId));
  }

  /* ---------------- Scenario Panel logic ---------------- */
  function openScenarioPanel() {
    setSavedScenarios(readSavedScenarios());
    setScenarioOpen(true);
    setEditingScenarioId(null);
    setScenarioName("");
  }
  function closeScenarioPanel() {
    setScenarioOpen(false);
    setEditingScenarioId(null);
    setScenarioName("");
  }

  // Build a scenario object from current deltas
  function createScenarioObject(name = "Untitled scenario") {
    const entries = Object.keys(deltas).map(k => ({ systemKey: k, delta: Number(deltas[k] || 0) }));
    return {
      id: `sc-${Date.now()}`,
      name: name || `Scenario ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      items: entries,
    };
  }

  function saveScenario(name = null) {
    const finalName = name || scenarioName || `Scenario ${new Date().toLocaleString()}`;
    const sc = createScenarioObject(finalName);
    const list = readSavedScenarios();
    list.unshift(sc);
    writeSavedScenarios(list);
    setSavedScenarios(list);
    setScenarioName("");
    setEditingScenarioId(null);
  }

  function deleteScenario(id) {
    const list = readSavedScenarios().filter(s => s.id !== id);
    writeSavedScenarios(list);
    setSavedScenarios(list);
  }

  function loadScenarioToPreview(id) {
    const sc = readSavedScenarios().find(s => s.id === id);
    if (!sc) return;
    // set deltas to scenario items (preview only)
    const next = {};
    sc.items.forEach((it) => { next[it.systemKey] = it.delta; });
    setDeltas(next);
    // ensure drawer closed for clarity
    setScenarioOpen(false);
  }

  function applyScenarioToWorking(id) {
    const sc = readSavedScenarios().find(s => s.id === id);
    if (!sc) return;
    // apply each delta to workingScores
    setWorkingScores((prev) => {
      const next = { ...prev };
      sc.items.forEach((it) => {
        if (!assessedKeys.has(it.systemKey)) return;
        next[it.systemKey] = Math.max(0, Math.min(100, Math.round((next[it.systemKey] || 0) + Number(it.delta || 0))));
        historyRef.current[it.systemKey] = (historyRef.current[it.systemKey] || []).concat(next[it.systemKey]).slice(-36);
      });
      return next;
    });
    setAlerts((a) => [{ id: `S-${Date.now()}`, level: "info", type: "scenario", title: `Scenario applied: ${sc.name}`, text: `Applied scenario to working scores.`, ts: Date.now() }, ...a].slice(0, 12));
    setScenarioOpen(false);
  }

  function applyCurrentPreviewScenario(name = null) {
    // create a temporary scenario from current deltas and apply it (without saving)
    const sc = createScenarioObject(name || ("Preview " + new Date().toLocaleTimeString()));
    // apply items
    setWorkingScores((prev) => {
      const next = { ...prev };
      sc.items.forEach((it) => {
        if (!assessedKeys.has(it.systemKey)) return;
        next[it.systemKey] = Math.max(0, Math.min(100, Math.round((next[it.systemKey] || 0) + Number(it.delta || 0))));
        historyRef.current[it.systemKey] = (historyRef.current[it.systemKey] || []).concat(next[it.systemKey]).slice(-36);
      });
      return next;
    });
    setAlerts((a) => [{ id: `S-${Date.now()}`, level: "info", type: "scenario", title: `Preview scenario applied`, text: `Applied preview scenario to working scores.`, ts: Date.now() }, ...a].slice(0, 12));
    // clear preview
    setDeltas({});
    setWhatIfOpen({});
  }

  /* ---------------- UI rendering ---------------- */
  const modalBg = darkMode ? "bg-gray-900" : "bg-white";
  const modalText = darkMode ? "text-gray-100" : "text-gray-900";
  const muted = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <section>
      <style>{`.hide-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>

      <div className={`rounded-2xl p-4 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">C-Suite Automatic Ingestion</h2>
            <div className="text-xs text-gray-400 mt-1">Live evidence feed — assessed systems update in real time. Use Scenarios to compose multi-system what-if changes.</div>
          </div>

          <div className="flex items-center gap-3">
            {/* <button onClick={openScenarioPanel} className="px-3 py-1 border rounded text-sm hidden sm:inline">Scenario Panel</button> */}
            <button
              onClick={openScenarioPanel}
              className={`px-3 py-1 text-sm rounded hidden sm:inline
                ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"}`}
            >
              Open Scenario Panel
            </button>

            <div className="text-xs text-gray-400 hidden sm:block">Palette</div>
            {/* <select value={palette} onChange={(e) => setPalette(e.target.value)} className="px-2 py-1 border rounded text-sm"> */}
            <select
              value={palette}
              onChange={(e) => setPalette(e.target.value)}
              className={`px-2 py-1 rounded text-sm
                ${darkMode
                  ? "bg-gray-800 border border-gray-700 text-gray-100"
                  : "bg-white border border-gray-100 text-gray-900"}`}
            >

              <option value="crypto">Crypto (green/red)</option>
              <option value="neutral">Neutral</option>
            </select>

            <div className="text-xs text-gray-400">Auto</div>
            <button onClick={() => setAutoOn((s) => !s)} className={`px-3 py-1 rounded-md border flex items-center gap-2 text-xs ${autoOn ? "bg-green-600 text-white" : ""}`} title={autoOn ? "Live ingestion running" : "Live ingestion paused"}>
              {autoOn ? <FaPause /> : <FaPlay />} <span>{autoOn ? "On" : "Off"}</span>
            </button>

            <div className="text-xs text-gray-400 hidden sm:block">Composite</div>
            <div className={`font-semibold text-2xl ${composite >= 80 ? "text-green-400" : composite >= 60 ? "text-yellow-400" : "text-red-400"}`}>{composite}%</div>
          </div>
        </div>

        {/* systems grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canonical.map((s) => {
            const live = workingScores[s.key] ?? 0;
            const preview = previewScores[s.key] ?? live;
            const delta = Number(deltas[s.key] || 0);
            const hist = (historyRef.current[s.key] || []).slice(-36);
            const isAssessed = assessedKeys.has(s.key);

            // only show external/impact for assessed systems
            const ext = isAssessed ? (externalSignals || []).find(x => x.systemKey === s.key) : null;
            const corr = isAssessed ? correlate(preview, ext ? [ext] : []) : null;

            return (
              <div key={s.key} className={`p-3 rounded-md border flex flex-col ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                {/* title / desc */}
                <div>
                  <div className="font-semibold text-sm truncate">{s.title}</div>
                  <div className={`text-xs ${muted} mt-1 truncate`}>{s.desc || `${s.title} live score`}</div>
                </div>

                {/* external / impact region (assessed only) */}
                {isAssessed && ext && (
                  <div className={`mt-3 p-2 rounded ${darkMode ? "bg-gray-900/40 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-medium">External:</span> <span className="truncate">{ext.type} {ext.value} ({ext.importance})</span>
                      </div>
                      <div className="text-xs text-yellow-400">{corr && corr.impactLevel ? `${corr.impactLevel.toUpperCase()} • ${corr.expectedDelta >= 0 ? `+${corr.expectedDelta}` : corr.expectedDelta}` : "No impact"}</div>
                    </div>
                  </div>
                )}

                {/* spacer grows so chart+actions sit at bottom */}
                <div className="flex-1 mt-3 flex flex-col justify-end">
                  {/* Chart + actions row — chart on left, actions at right bottom */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-shrink-0">
                      {isAssessed ? (
                        <LiveBarsCanvas values={hist} darkMode={darkMode} barCount={18} width={140} height={72} palette={palette} tooltipRef={tooltipControl} />
                      ) : (
                        <div className="w-36 h-12 flex items-center justify-center text-xs text-gray-400 rounded border border-dashed">
                          No history
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${toneClassFor(preview)}`}>{isAssessed ? `${preview}%` : "Not assessed"}</div>
                        <div className="text-xs text-gray-400">{isAssessed ? (delta !== 0 ? `Preview • Δ ${delta >= 0 ? `+${delta}` : delta}` : "Real-time") : "No assessment"}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAssessed ? (
                          <>
                            <button onClickCapture={(e) => { e.stopPropagation(); setWhatIfOpen((prev) => ({ ...prev, [s.key]: !prev[s.key] })); }} className="px-2 py-1 text-xs border rounded" title="Toggle what-if">What-if</button>
                            <button onClick={() => setWhatIfVal(s.key, (Number(deltas[s.key] || 0) + 5))} className="px-2 py-1 text-xs border rounded" title="+5 preview">+5</button>
                            <button onClick={() => openDeepModal(s.key)} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded">Deep dive</button>
                          </>
                        ) : (
                          <button onClick={() => startAssessmentFor(s.key)} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded">Take assessment</button>
                        )}
                      </div>

                      {/* inline what-if slider */}
                      {isAssessed && whatIfOpen[s.key] && (
                        <div className="mt-2 w-full bg-transparent">
                          <div className="text-xs text-gray-400 mb-1">Adjust scenario (%)</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={-20}
                              max={20}
                              step={1}
                              value={Number(deltas[s.key] || 0)}
                              onChange={(e) => setWhatIfVal(s.key, Number(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-xs w-12 text-right">{(deltas[s.key] || 0) >= 0 ? `+${deltas[s.key] || 0}` : (deltas[s.key] || 0)}</div>
                          </div>
                          <div className="mt-2 flex gap-2 justify-end">
                            <button onClick={() => clearWhatIf(s.key)} className="px-2 py-1 text-xs border rounded">Reset</button>
                            <button onClick={() => applyWhatIfToWorking(s.key)} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* alerts / notes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><FaBolt /> Alerts</div>
              <div className="text-xs text-gray-400">Prioritized</div>
            </div>

            <ul className="mt-3 text-sm space-y-2">
              {alerts.length === 0 && <li className="text-xs text-gray-500">No alerts</li>}
              {alerts.map((a) => (
                <li key={a.id} className={`p-2 rounded ${a.level === "high" ? "bg-red-900/10 border border-red-700" : a.level === "medium" ? "bg-yellow-900/10 border border-yellow-700" : "bg-gray-100/10 border border-gray-200"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.title || a.text}</div>
                      <div className="text-xs text-gray-400 mt-1 truncate">{a.text}</div>
                      <div className="text-xs text-gray-400 mt-1">Type: {a.type || "info"} • {a.systemKey || "system"}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-400">{formatTime(a.ts)}</div>
                      <div className="flex gap-2">
                        {a.suggestedAction && a.suggestedAction.action ? (
                          <button onClick={() => a.suggestedAction.action()} className="px-2 py-1 text-xs border rounded">{a.suggestedAction.label}</button>
                        ) : null}
                        <button onClick={() => ackAlert(a.id)} className="px-2 py-1 text-xs border rounded">Acknowledge</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={`p-4 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="font-semibold">Notes</div>
            <div className="text-xs text-gray-400 mt-2">
              Live updates and external correlation are shown only for systems that have a recorded assessment (Assessment results → Diagnose vs external signals). Use the Assessments tab to add missing system data.
            </div>
            <div className="text-xs text-gray-400 mt-3">Composite (preview): <span className="font-semibold">{compositePreview}%</span></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setDeltas({}); setWhatIfOpen({}); }} className="px-3 py-1 border rounded text-xs">Clear Preview</button>
              <button onClick={() => applyCurrentPreviewScenario()} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Apply Preview</button>
              {/* <button onClick={openScenarioPanel} className="px-3 py-1 bg-gray-200 text-sm rounded hidden sm:inline">Open Scenario Panel</button> */}
              <button
                onClick={openScenarioPanel}
                className={`px-3 py-1 rounded text-sm hidden sm:inline
                  ${darkMode
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-white border border-gray-100 text-gray-900"}`}
              >
                Scenario Panel
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Scenario Panel Drawer */}
      {scenarioOpen && (
        <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0" style={{ backgroundColor: darkMode ? "rgba(2,6,23,0.6)" : "rgba(0,0,0,0.45)" }} onClick={closeScenarioPanel} />
          <div className={`relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto rounded-t-xl md:rounded-2xl p-4 ${modalBg} ${modalText} border shadow-lg hide-scrollbar`} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Scenario Panel</h3>
                <div className="text-xs text-gray-400">Compose multi-system scenarios, preview, save, and apply.</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={closeScenarioPanel} className="px-3 py-1 rounded-md border text-sm"><FaTimes /></button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-3 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="text-sm font-semibold">Current scenario (preview)</div>
                <div className="text-xs text-gray-400 mt-1">Adjust sliders for assessed systems to compose a scenario. Use Save to store it, Apply to commit to this session.</div>

                <div className="mt-3 space-y-3">
                  {canonical.filter(c => assessedKeys.has(c.key)).map((c) => (
                    <div key={c.key} className="flex items-center gap-3">
                      <div className="w-28 text-sm truncate">{c.title}</div>
                      <input
                        type="range"
                        min={-30}
                        max={30}
                        step={1}
                        value={Number(deltas[c.key] || 0)}
                        onChange={(e) => setWhatIfVal(c.key, Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-12 text-right text-xs">{(deltas[c.key] || 0) >= 0 ? `+${deltas[c.key] || 0}` : (deltas[c.key] || 0)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {/* <input placeholder="Scenario name" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="px-2 py-1 border rounded text-sm w-full" /> */}
                  <input
                    placeholder="Scenario name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className={`px-2 py-1 rounded text-sm w-full
                      ${darkMode
                        ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400"
                        : "bg-white border border-gray-100 text-gray-900 placeholder-gray-500"}`}
                  />

                  <button onClick={() => saveScenario()} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Save</button>
                  <button onClick={() => { setDeltas({}); setWhatIfOpen({}); }} className="px-3 py-1 border rounded text-sm">Reset</button>
                  <button onClick={() => applyCurrentPreviewScenario()} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Apply</button>
                </div>

                <div className="mt-3 text-xs text-gray-400">Preview composite: <span className="font-semibold">{compositePreview}%</span></div>
              </div>

              <div className={`p-3 rounded-md border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Saved scenarios</div>
                </div>

                <div className="mt-3 space-y-2 max-h-64 overflow-auto">
                  {savedScenarios.length === 0 && <div className="text-xs text-gray-400">No saved scenarios</div>}
                  {savedScenarios.map((sc) => (
                    <div key={sc.id} className="p-2 rounded border flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{sc.name}</div>
                        <div className="text-xs text-gray-400 truncate">{new Date(sc.createdAt).toLocaleString()} • {sc.items.length} systems</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => loadScenarioToPreview(sc.id)} className="px-2 py-1 text-xs border rounded">Load</button>
                        <button onClick={() => applyScenarioToWorking(sc.id)} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Apply</button>
                        <button onClick={() => deleteScenario(sc.id)} className="px-2 py-1 text-xs border rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Deep Dive Modal */}
      {deepModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ backgroundColor: darkMode ? "rgba(2,6,23,0.6)" : "rgba(0,0,0,0.45)" }} onClick={closeDeepModal} />
          <div className={`relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl p-6 ${modalBg} ${modalText} border shadow-2xl hide-scrollbar`}>
            <div className="flex items-start justify-between gap-3 sticky top-0 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold"><FaChartLine /></div>
                <div>
                  <h3 className="text-xl font-bold">{(canonical.find(s => s.key === deepModal.systemKey) || {}).title} — Deep Dive</h3>
                  <div className={`text-sm ${muted}`}>In-place analysis and recommendations for this system</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => exportSystemJSON(deepModal.systemKey)} className="px-3 py-1 rounded-md border text-sm" title="Export JSON"><FaDownload className="inline mr-2" />Export</button>
                <button onClick={() => printDeep(deepModal.systemKey)} className="px-3 py-1 rounded-md border text-sm">Print</button>
                <button onClick={closeDeepModal} className="p-2 rounded-md text-gray-400" aria-label="Close deep dive"><FaTimes /></button>
              </div>
            </div>

            <div className="mt-4 space-y-5">
              <div className={`rounded-xl p-4 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Overall score</div>
                    <div className={`text-3xl font-bold ${toneClassFor(workingScores[deepModal.systemKey])}`}>{workingScores[deepModal.systemKey] ?? "—"}%</div>
                    <div className="text-xs text-gray-400 mt-1">Current</div>
                  </div>
                  <div className="w-56">
                    <div className="text-xs text-gray-400 mb-2">Recent history</div>
                    <div style={{ height: 48 }}>
                      <LiveBarsCanvas values={(historyRef.current[deepModal.systemKey] || []).slice(-36)} darkMode={darkMode} barCount={24} width={196} height={56} palette={palette} tooltipRef={tooltipControl} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">External Signals</h4>
                <div className="mt-2 space-y-2">
                  {(() => {
                    const ext = (externalSignals || []).filter(x => x.systemKey === deepModal.systemKey);
                    if (!ext || ext.length === 0) return <div className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>No external signals available</div>;
                    return ext.map((e) => (
                      <div key={e.id} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{e.type} • {e.source}</div>
                            <div className="text-sm text-gray-500 mt-1">{e.description}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${e.value >= 75 ? "text-red-500" : e.value >= 55 ? "text-yellow-500" : "text-green-500"}`}>{e.value}</div>
                            <div className="text-xs text-gray-400">{e.importance}</div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Insights</h4>
                <div className="mt-2 space-y-2">
                  {synthInsights(deepModal.systemKey).map((ins, i) => (
                    <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                      <div className="text-sm">{ins}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Forecasts</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {synthForecasts(deepModal.systemKey).map((f, i) => (
                    <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}>
                      <div className="font-medium">{f.horizon}</div>
                      <div className="text-sm text-gray-500 mt-1">{f.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Recommendations</h4>
                <div className="mt-2 space-y-2">
                  {synthRecs(deepModal.systemKey).map((r, i) => (
                    <div key={i} className={`p-3 rounded-md ${darkMode ? "bg-blue-900/6 border border-blue-800" : "bg-blue-50 border border-blue-100"}`}>
                      <div className="font-medium">{r.title}</div>
                      <ul className="list-disc pl-5 mt-2 text-sm">{r.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                <div className="text-xs text-gray-400">Use Retake to begin a new assessment (assessment flow will open). Use the Assessments tab to include unassessed systems.</div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button onClick={() => { try { window.dispatchEvent(new CustomEvent("conseqx:assessment:start", { detail: { systemId: deepModal.systemKey, orgId: effectiveOrgId } })); } catch {} navigate(`/ceo/assessments?focus=${encodeURIComponent(deepModal.systemKey)}`); }} className="px-3 py-2 rounded-md border text-sm">Retake</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip overlay */}
      <div style={{ position: "fixed", left: 0, top: 0, pointerEvents: "none", zIndex: 80 }}>
        <Tooltip ref={tooltipControl} darkMode={darkMode} />
      </div>
    </section>
  );
}
