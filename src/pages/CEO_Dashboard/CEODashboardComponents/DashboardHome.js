
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as svc from "../services/serviceSelector";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";
import {
  FaEye, FaBrain, FaExclamationTriangle, FaArrowUp, FaArrowDown,
  FaChartLine, FaLightbulb, FaCheckCircle, FaRocket, FaClock,
  FaFileAlt, FaShieldAlt, FaNetworkWired, FaSearch, FaUsers,
  FaPalette, FaBullseye, FaSyncAlt, FaChevronRight, FaTimes,
  FaPlay, FaSignal
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";

const UPLOADS_KEY = "conseqx_uploads_v1";

// ─── System metadata enrichment ───────────────────────────────────────
const SYSTEM_META = {
  interdependency: {
    emoji: "🔗", color: "#3B82F6", gradient: "from-blue-500 to-blue-700",
    insight: "Cross-functional collaboration & dependency flow",
    shortAdvice: "Strengthen handoff protocols between departments",
  },
  orchestration: {
    emoji: "🔄", color: "#10B981", gradient: "from-emerald-500 to-emerald-700",
    insight: "Adaptive capacity & continuous improvement cycles",
    shortAdvice: "Implement faster feedback loops for agility",
  },
  investigation: {
    emoji: "🔍", color: "#F59E0B", gradient: "from-amber-500 to-amber-700",
    insight: "Root cause analysis & data-driven decision making",
    shortAdvice: "Deploy automated diagnostic monitoring systems",
  },
  interpretation: {
    emoji: "💡", color: "#8B5CF6", gradient: "from-violet-500 to-violet-700",
    insight: "Intelligence synthesis & strategic sense-making",
    shortAdvice: "Establish decision intelligence center of excellence",
  },
  illustration: {
    emoji: "📊", color: "#EF4444", gradient: "from-red-500 to-red-700",
    insight: "Communication effectiveness & knowledge transfer",
    shortAdvice: "Improve cross-functional information visualization",
  },
  inlignment: {
    emoji: "🎯", color: "#06B6D4", gradient: "from-cyan-500 to-cyan-700",
    insight: "Strategic coherence & goal synchronization",
    shortAdvice: "Align departmental objectives with enterprise OKRs",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────
function getHealthLabel(score) {
  if (score >= 80) return { text: "Excellent", color: "text-green-500" };
  if (score >= 65) return { text: "Good", color: "text-blue-500" };
  if (score >= 50) return { text: "Fair", color: "text-yellow-500" };
  if (score >= 30) return { text: "Needs Attention", color: "text-orange-500" };
  return { text: "Critical", color: "text-red-500" };
}

function getHealthBg(score, dk) {
  if (score >= 80) return dk ? "bg-green-900/30" : "bg-green-100";
  if (score >= 65) return dk ? "bg-blue-900/30" : "bg-blue-100";
  if (score >= 50) return dk ? "bg-yellow-900/30" : "bg-yellow-100";
  if (score >= 30) return dk ? "bg-orange-900/30" : "bg-orange-100";
  return dk ? "bg-red-900/30" : "bg-red-100";
}

function generateSparkline(base, points = 7) {
  const data = [];
  let val = base || 50;
  for (let i = 0; i < points; i++) {
    val = Math.max(10, Math.min(100, val + (Math.random() - 0.45) * 8));
    data.push({ day: `D${i + 1}`, value: Math.round(val) });
  }
  return data;
}

// ─── Sub-components ───────────────────────────────────────────────────

/* Overall Health Gauge — circular SVG */
function HealthGauge({ score, darkMode }) {
  const health = getHealthLabel(score);
  const circumference = 2 * Math.PI * 54;
  const progress = score > 0 ? (score / 100) * circumference : 0;
  const gaugeColor = score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={darkMode ? "#374151" : "#E5E7EB"} strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={gaugeColor} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            {score > 0 ? score : "—"}
          </span>
          <span className={`text-xs font-medium ${health.color}`}>{score > 0 ? health.text : "No Data"}</span>
        </div>
      </div>
    </div>
  );
}

/* Mini sparkline */
function MiniSparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color?.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
          fill={`url(#spark-${color?.replace("#","")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* System Health Card (interactive) */
function SystemCard({ systemKey, score, darkMode, onClick }) {
  const canonical = CANONICAL_SYSTEMS.find(s => s.key === systemKey);
  const meta = SYSTEM_META[systemKey] || {};
  const health = getHealthLabel(score || 0);
  const trend = useMemo(() => Math.round((Math.random() - 0.4) * 10), [score]); // eslint-disable-line
  const sparkData = useMemo(() => generateSparkline(score), [score]); // eslint-disable-line
  const isAssessed = score !== null && score !== undefined;
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      onClick={onClick}
      className={`rounded-xl p-4 border cursor-pointer transition-all ${
        darkMode ? "bg-gray-800/80 border-gray-700 hover:border-gray-500"
                 : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${meta.gradient}`}>
            <span className="text-sm">{meta.emoji}</span>
          </div>
          <div>
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              {canonical?.title || systemKey}
            </div>
            <div className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {(canonical?.description || "").slice(0, 38)}…
            </div>
          </div>
        </div>
        {isAssessed && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend >= 0 ? "text-green-500" : "text-red-500"
          }`}>
            {trend >= 0 ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {isAssessed ? (
        <>
          <div className="flex items-end justify-between mb-2">
            <div className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{score}%</div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getHealthBg(score, darkMode)} ${health.color}`}>
              {health.text}
            </span>
          </div>
          <MiniSparkline data={sparkData} color={meta.color} />
        </>
      ) : (
        <div className={`text-center py-3 rounded-lg ${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Not yet assessed</div>
          <div className="text-blue-500 text-xs font-medium mt-1">Take Assessment →</div>
        </div>
      )}
    </motion.div>
  );
}

/* Radar chart — 6 systems */
function SystemsRadarChart({ scores, darkMode }) {
  const data = CANONICAL_SYSTEMS.map(s => ({
    system: s.title, score: scores[s.key] || 0, benchmark: 70,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke={darkMode ? "#374151" : "#E5E7EB"} />
        <PolarAngleAxis dataKey="system" tick={{ fontSize: 11, fill: darkMode ? "#9CA3AF" : "#6B7280" }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: darkMode ? "#6B7280" : "#9CA3AF" }} tickCount={5} />
        <Radar name="Your Org" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
        <Radar name="Benchmark" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
        <Tooltip contentStyle={{
          backgroundColor: darkMode ? "#1F2937" : "#FFF",
          border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
          borderRadius: 8, fontSize: 12,
        }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* Key Alerts panel */
function KeyAlertsPanel({ scores, darkMode, onViewSystem }) {
  const alerts = useMemo(() => {
    const list = [];
    Object.entries(scores).forEach(([key, score]) => {
      if (score === null || score === undefined) return;
      const name = CANONICAL_SYSTEMS.find(s => s.key === key)?.title || key;
      if (score < 40)
        list.push({ type: "critical", system: key, msg: `${name} critically low at ${score}% — immediate intervention required` });
      else if (score < 60)
        list.push({ type: "warning", system: key, msg: `${name} at ${score}% — below organizational targets` });
    });
    // Cross-system imbalance alert
    const assessed = Object.entries(scores).filter(([, v]) => v !== null);
    if (assessed.length >= 4) {
      const highest = assessed.reduce((a, b) => b[1] > a[1] ? b : a);
      const lowest = assessed.reduce((a, b) => b[1] < a[1] ? b : a);
      const gap = highest[1] - lowest[1];
      if (gap > 25) {
        const hName = CANONICAL_SYSTEMS.find(s => s.key === highest[0])?.title || highest[0];
        const lName = CANONICAL_SYSTEMS.find(s => s.key === lowest[0])?.title || lowest[0];
        list.push({ type: "insight", system: lowest[0],
          msg: `${gap}-point gap between ${hName} (${highest[1]}%) and ${lName} (${lowest[1]}%) — system imbalance detected` });
      }
    }
    const order = { critical: 0, warning: 1, insight: 2 };
    return list.sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9)).slice(0, 5);
  }, [scores]);

  if (alerts.length === 0) {
    return (
      <div className={`text-center py-6 rounded-xl ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
        <FaCheckCircle className="mx-auto text-3xl text-green-500 mb-2" />
        <div className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>All systems within healthy range</div>
        <div className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No critical alerts at this time</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
          onClick={() => onViewSystem(alert.system)}
          className={`flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
            alert.type === "critical" ? `border-red-500 ${darkMode ? "bg-red-900/10" : "bg-red-50"}`
              : alert.type === "warning" ? `border-yellow-500 ${darkMode ? "bg-yellow-900/10" : "bg-yellow-50"}`
              : `border-blue-500 ${darkMode ? "bg-blue-900/10" : "bg-blue-50"}`
          }`}
        >
          <div className={`mt-0.5 ${alert.type === "critical" ? "text-red-500" : alert.type === "warning" ? "text-yellow-500" : "text-blue-500"}`}>
            {alert.type === "critical" ? <FaExclamationTriangle /> : alert.type === "warning" ? <FaShieldAlt /> : <FaLightbulb />}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{alert.msg}</div>
            <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {alert.type === "critical" ? "Immediate action recommended" : alert.type === "warning" ? "Monitor closely" : "Strategic consideration"}
            </div>
          </div>
          <FaChevronRight className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
        </motion.div>
      ))}
    </div>
  );
}

/* Strategic Insights AI panel */
function StrategicInsightsPanel({ scores, darkMode }) {
  const assessed = Object.entries(scores).filter(([, v]) => v !== null);
  if (assessed.length === 0) return null;
  const avg = Math.round(assessed.reduce((s, [, v]) => s + v, 0) / assessed.length);
  const highest = assessed.reduce((a, b) => b[1] > a[1] ? b : a);
  const lowest = assessed.reduce((a, b) => b[1] < a[1] ? b : a);
  const hMeta = SYSTEM_META[highest[0]] || {};
  const lMeta = SYSTEM_META[lowest[0]] || {};
  const hName = CANONICAL_SYSTEMS.find(s => s.key === highest[0])?.title || highest[0];
  const lName = CANONICAL_SYSTEMS.find(s => s.key === lowest[0])?.title || lowest[0];

  const insights = [
    {
      icon: <FaBrain className="text-purple-500" />, title: "Overall Diagnosis",
      text: avg >= 70
        ? `Organization shows strong health at ${avg}%. Focus on maintaining momentum and addressing the ${6 - assessed.length} unassessed system(s).`
        : avg >= 50
        ? `Health at ${avg}% indicates room for improvement. Prioritize ${lName} (${lowest[1]}%) for the highest ROI intervention.`
        : `Health score of ${avg}% signals urgent need for a structured transformation program across multiple systems.`,
    },
    {
      icon: <FaRocket className="text-green-500" />, title: "Leverage Strength",
      text: `${hName} is your strongest system at ${highest[1]}%. ${hMeta.shortAdvice || "Use it as an anchor to uplift weaker systems."}`,
    },
    {
      icon: <FaExclamationTriangle className="text-amber-500" />, title: "Priority Intervention",
      text: `${lName} at ${lowest[1]}% is your most critical gap. ${lMeta.shortAdvice || "Deploy targeted capability programs to stabilize."}`,
    },
  ];

  // Cultural health sub-insight
  const culturalKeys = ["interpretation", "illustration", "inlignment"];
  const culturalScores = culturalKeys.map(k => scores[k]).filter(v => v !== null);
  if (culturalScores.length >= 2) {
    const cAvg = Math.round(culturalScores.reduce((a, b) => a + b, 0) / culturalScores.length);
    insights.push({
      icon: <FaUsers className="text-pink-500" />, title: "Cultural Health",
      text: cAvg >= 70
        ? `Cultural systems averaging ${cAvg}% — healthy, aligned culture. Continue reinforcing communication and strategic coherence.`
        : `Cultural health at ${cAvg}% indicates potential misalignment between strategy, communication, and organizational goals.`,
    });
  }

  return (
    <div className="space-y-3">
      {insights.map((item, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
          className={`p-4 rounded-xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{item.icon}</div>
            <div>
              <div className={`text-sm font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{item.title}</div>
              <div className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{item.text}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* Quick Actions Bar */
function QuickActionsBar({ navigate, assessedCount, darkMode }) {
  const actions = [
    { label: "Full Report", icon: <FaFileAlt />, path: "/ceo/org-health", show: assessedCount > 0 },
    { label: "Partner Dashboard", icon: <FaSignal />, path: "/ceo/partner-dashboard/overview", show: true },
    { label: "Data Management", icon: <FaChartLine />, path: "/ceo/data", show: true },
  ].filter(a => a.show);
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a, i) => (
        <button key={i} onClick={() => navigate(a.path)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            i === 0
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
              : darkMode ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                         : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {a.icon} {a.label}
        </button>
      ))}
    </div>
  );
}

/* Assessment Progress Tracker */
function AssessmentProgressTracker({ scores, darkMode, onStartAssessment }) {
  const assessed = Object.values(scores).filter(v => v !== null).length;
  const total = CANONICAL_SYSTEMS.length;
  const pct = Math.round((assessed / total) * 100);
  return (
    <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Assessment Progress</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          pct === 100 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                     : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        }`}>{assessed} / {total} systems</span>
      </div>
      <div className={`w-full h-2.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
        <div style={{ width: `${pct}%` }} className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-green-500" : "bg-blue-500"}`} />
      </div>
      <div className="grid grid-cols-6 gap-1 mt-4">
        {CANONICAL_SYSTEMS.map(s => {
          const isOK = scores[s.key] !== null && scores[s.key] !== undefined;
          const meta = SYSTEM_META[s.key] || {};
          return (
            <div key={s.key}
              onClick={() => !isOK && onStartAssessment(s.key)}
              className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
                isOK ? (darkMode ? "bg-gray-700/50" : "bg-gray-50")
                     : "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                isOK ? `bg-gradient-to-br ${meta.gradient} text-white`
                     : darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
              }`}>
                {isOK ? <FaCheckCircle className="text-[10px]" /> : <span className="text-[10px]">{meta.emoji}</span>}
              </div>
              <div className={`text-[10px] leading-tight ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.title.slice(0, 7)}</div>
              {isOK && (
                <div className={`text-[10px] font-bold mt-0.5 ${
                  scores[s.key] >= 70 ? "text-green-500" : scores[s.key] >= 50 ? "text-yellow-500" : "text-red-500"
                }`}>{scores[s.key]}%</div>
              )}
            </div>
          );
        })}
      </div>
      {assessed < total && (
        <button
          onClick={() => { const u = CANONICAL_SYSTEMS.find(s => scores[s.key] === null || scores[s.key] === undefined); if (u) onStartAssessment(u.key); }}
          className="mt-3 w-full py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Continue Assessment — {total - assessed} system{total - assessed > 1 ? "s" : ""} remaining
        </button>
      )}
    </div>
  );
}

/* Org Health Forecast Mini-Chart */
function HealthForecastMini({ overallScore, darkMode }) {
  const forecastData = useMemo(() => {
    const data = []; let val = overallScore || 50;
    ["Now", "Mo 1", "Mo 2", "Mo 3", "Mo 4", "Mo 5", "Mo 6"].forEach((m, i) => {
      data.push({ month: m, projected: Math.round(val), optimistic: Math.round(Math.min(100, val + i * 2.5)), conservative: Math.round(Math.max(20, val - i * 1.5)) });
      val = Math.min(100, val + (Math.random() * 3 - 0.5));
    });
    return data;
  }, [overallScore]);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#F3F4F6"} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: darkMode ? "#9CA3AF" : "#6B7280" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: darkMode ? "#9CA3AF" : "#6B7280" }} />
        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1F2937" : "#FFF", border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`, borderRadius: 8, fontSize: 11 }} />
        <Area type="monotone" dataKey="optimistic" stroke="#10B981" fill="#10B981" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" name="Optimistic" />
        <Area type="monotone" dataKey="projected" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} name="Projected" />
        <Area type="monotone" dataKey="conservative" stroke="#EF4444" fill="#EF4444" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" name="Conservative" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function DashboardHome() {
  const { darkMode, org } = useOutletContext();
  const auth = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [systemScoresFromUpload, setSystemScoresFromUpload] = useState({});
  const [latestUpload, setLatestUpload] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickModalPayload, setQuickModalPayload] = useState(null);

  // Load summary
  useEffect(() => {
    let mounted = true;
    const orgId = auth?.org?.id || org?.id;
    if (orgId) {
      (async () => {
        try {
          const s = await svc.getDashboardSummary(orgId);
          if (mounted) setSummary(s);
        } catch { if (mounted) setSummary(null); }
      })();
    }
    return () => { mounted = false; };
  }, [auth?.org?.id, org?.id]);

  // Load assessment data
  const loadLatest = useCallback(() => {
    try {
      const raw = localStorage.getItem(UPLOADS_KEY);
      const all = raw ? JSON.parse(raw) : [];
      const latest = all?.[0] || null;
      setLatestUpload(latest);

      const byAssessRaw = localStorage.getItem("conseqx_assessments_v1");
      const byOrg = byAssessRaw ? JSON.parse(byAssessRaw) : {};
      const orgId = auth?.org?.id || org?.id || "anon";
      const orgAssessments = byOrg[orgId] || [];

      const assessmentsBySystem = {};
      orgAssessments.forEach((a) => {
        const sysKey = normalizeSystemKey(a.systemId || a.system || a.systemKey || "");
        if (!sysKey) return;
        if (!assessmentsBySystem[sysKey] || (a.timestamp || 0) > (assessmentsBySystem[sysKey].timestamp || 0)) {
          assessmentsBySystem[sysKey] = a;
        }
      });

      const scores = {};
      CANONICAL_SYSTEMS.forEach((s) => {
        const assessment = assessmentsBySystem[s.key];
        if (assessment && typeof assessment.score === "number") {
          scores[s.key] = Math.max(0, Math.min(100, Math.round(assessment.score)));
        } else if (latest?.analyzedSystems?.includes(s.key)) {
          scores[s.key] = 70;
        } else {
          scores[s.key] = null;
        }
      });

      setSystemScoresFromUpload(scores);
    } catch {
      setLatestUpload(null);
      setSystemScoresFromUpload({});
    }
  }, [auth?.org?.id, org?.id]);

  useEffect(() => {
    loadLatest();

    const onStorage = (e) => {
      if (!e.key || e.key === UPLOADS_KEY || e.key === "conseqx_assessments_v1") loadLatest();
    };
    const onAssessment = () => { setLastRefresh(Date.now()); setTimeout(loadLatest, 100); };

    window.addEventListener("storage", onStorage);
    window.addEventListener("conseqx:assessment:completed", onAssessment);
    window.addEventListener("conseqx:assessment:update", onAssessment);

    let bc;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("conseqx_assessments");
        bc.addEventListener("message", (ev) => {
          if (ev?.data?.type?.includes("assessment")) loadLatest();
        });
      }
    } catch {} // eslint-disable-line no-empty

    const poll = setInterval(loadLatest, 3000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("conseqx:assessment:completed", onAssessment);
      window.removeEventListener("conseqx:assessment:update", onAssessment);
      if (bc) bc.close();
      clearInterval(poll);
    };
  }, [loadLatest, lastRefresh]);

  // Computed values
  const overallScore = useMemo(() => {
    const vals = Object.values(systemScoresFromUpload).filter(v => v !== null);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [systemScoresFromUpload]);

  const assessedCount = useMemo(
    () => Object.values(systemScoresFromUpload).filter(v => v !== null).length,
    [systemScoresFromUpload]
  );

  const lastUpdated = useMemo(() => {
    if (latestUpload?.timestamp) return new Date(latestUpload.timestamp).toLocaleDateString();
    return null;
  }, [latestUpload]);

  // Handlers
  function handleViewSystem(systemKey) {
    const systemInfo = CANONICAL_SYSTEMS.find(s => s.key === systemKey) || { title: systemKey };
    const meta = SYSTEM_META[systemKey] || {};
    setQuickModalPayload({
      systemKey, title: systemInfo.title, description: systemInfo.description,
      score: systemScoresFromUpload[systemKey], meta,
      source: latestUpload ? `${latestUpload.name || "Upload"}` : null,
    });
    setShowQuickModal(true);
  }

  function startOrRetakeAssessment(systemKey) {
    try {
      window.dispatchEvent(new CustomEvent("conseqx:assessment:start", {
        detail: { systemId: systemKey, orgId: auth?.org?.id || org?.id },
      }));
    } catch {} // eslint-disable-line no-empty
    navigate(`/ceo/assessments?focus=${encodeURIComponent(systemKey)}`);
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
       
        <QuickActionsBar navigate={navigate} assessedCount={assessedCount} darkMode={darkMode} />
      </div>

      {/* ─── Hero Row: Health Gauge + Radar ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Health */}
        <div className={`lg:col-span-4 rounded-2xl p-6 border ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                   : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        }`}>
          <div className={`text-sm font-semibold mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Overall Organizational Health
          </div>
          <HealthGauge score={overallScore} darkMode={darkMode} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className={`text-lg font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>{assessedCount}</div>
              <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Assessed</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>{6 - assessedCount}</div>
              <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Pending</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                overallScore >= 70 ? (darkMode ? "text-blue-400" : "text-blue-600")
                                   : (darkMode ? "text-orange-400" : "text-orange-600")
              }`}>{getHealthLabel(overallScore).text}</div>
              <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Rating</div>
            </div>
          </div>
        </div>

        {/* Right: Radar Chart */}
        <div className={`lg:col-span-8 rounded-2xl p-6 border ${
          darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Six Systems Health Profile
              </div>
              <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Your organization vs industry benchmark (70%)
              </div>
            </div>
            <button onClick={() => navigate("/ceo/partner-dashboard/deep-dive")}
              className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Deep Dive <FaChevronRight className="text-[8px]" />
            </button>
          </div>
          <SystemsRadarChart scores={systemScoresFromUpload} darkMode={darkMode} />
        </div>
      </div>

      {/* ─── Middle Row: Alerts + Insights ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Alerts Panel */}
        <div className={`rounded-2xl p-5 border ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-4">
            <FaExclamationTriangle className="text-amber-500" />
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Key Alerts & Notifications</div>
          </div>
          <KeyAlertsPanel scores={systemScoresFromUpload} darkMode={darkMode} onViewSystem={handleViewSystem} />
        </div>

        {/* Strategic Insights */}
        <div className={`rounded-2xl p-5 border ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-4">
            <FaBrain className="text-purple-500" />
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>X-ULTRA Strategic Insights</div>
          </div>
          {assessedCount > 0 ? (
            <StrategicInsightsPanel scores={systemScoresFromUpload} darkMode={darkMode} />
          ) : (
            <div className={`text-center py-8 rounded-xl ${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
              <FaBrain className="mx-auto text-3xl text-gray-400 mb-2" />
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Complete at least one assessment to unlock XUltra-powered strategic insights
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Row: Forecast + Assessment Progress ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Forecast */}
        <div className={`rounded-2xl p-5 border ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>6-Month Health Forecast</div>
            </div>
            <button onClick={() => navigate("/ceo/partner-dashboard/forecast")}
              className={`text-xs flex items-center gap-1 ${darkMode ? "text-blue-400" : "text-blue-600"} hover:underline`}
            >
              Full Forecast <FaChevronRight className="text-[8px]" />
            </button>
          </div>
          {overallScore > 0 ? (
            <HealthForecastMini overallScore={overallScore} darkMode={darkMode} />
          ) : (
            <div className={`text-center py-12 rounded-xl ${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
              <FaChartLine className="mx-auto text-3xl text-gray-400 mb-2" />
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Complete assessments to generate predictive forecasts
              </div>
            </div>
          )}
        </div>

        {/* Assessment Progress */}
        <AssessmentProgressTracker scores={systemScoresFromUpload} darkMode={darkMode} onStartAssessment={startOrRetakeAssessment} />
      </div>

      {/* ─── Quick View Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showQuickModal && quickModalPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowQuickModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden border ${
                darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
              } shadow-2xl`}
            >
              {/* Modal Header */}
              <div className={`px-6 py-4 border-b flex items-start justify-between ${
                darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-gray-50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${
                    quickModalPayload.meta?.gradient || "from-blue-500 to-blue-700"
                  }`}>
                    <span className="text-lg">{quickModalPayload.meta?.emoji || "📋"}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{quickModalPayload.title}</h3>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{quickModalPayload.description}</p>
                  </div>
                </div>
                <button onClick={() => setShowQuickModal(false)}
                  className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {quickModalPayload.score !== null && quickModalPayload.score !== undefined ? (
                  <>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className={`text-xs uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>System Score</div>
                        <div className="text-4xl font-bold mt-1">{quickModalPayload.score}%</div>
                        <div className={`text-xs mt-1 ${getHealthLabel(quickModalPayload.score).color}`}>
                          {getHealthLabel(quickModalPayload.score).text}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                          <div style={{ width: `${quickModalPayload.score}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              quickModalPayload.score >= 70 ? "bg-green-500" : quickModalPayload.score >= 50 ? "bg-yellow-500" : "bg-red-500"
                            }`} />
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-blue-50 border border-blue-100"}`}>
                      <div className="flex items-start gap-3">
                        <FaBrain className="text-blue-500 mt-0.5" />
                        <div>
                          <div className={`text-sm font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>X-ULTRA Analysis</div>
                          <div className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {quickModalPayload.meta?.insight || "Analyzing system performance patterns..."}
                            {quickModalPayload.score < 60 && (
                              <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                                Recommended: {quickModalPayload.meta?.shortAdvice || "Deploy targeted improvement protocols."}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Strategic Recommendations</h4>
                      <div className="space-y-2">
                        {[
                          "Run a focused improvement sprint (2–4 weeks) targeting the top 3 pain points.",
                          "Establish KPI dashboards with weekly stakeholder reviews for accountability.",
                          "Benchmark against industry peers and implement proven playbooks.",
                        ].map((rec, i) => (
                          <div key={i} className={`flex items-start gap-2 p-3 rounded-lg text-xs ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
                            <FaCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0 text-[10px]" />
                            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-3">📋</div>
                    <h4 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Assessment Not Yet Taken</h4>
                    <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Take a short assessment (~10–20 min) to unlock a complete report with X-ULTRA
                      recommendations, forecasts, and industry benchmarks.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`px-6 py-4 border-t flex justify-end gap-3 ${
                darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-gray-50"
              }`}>
                {quickModalPayload.score !== null && quickModalPayload.score !== undefined ? (
                  <>
                    <button onClick={() => { navigate("/ceo/org-health"); setShowQuickModal(false); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <FaFileAlt className="inline mr-2" />Full Report
                    </button>
                    <button onClick={() => { navigate("/ceo/partner-dashboard/deep-dive"); setShowQuickModal(false); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                      <FaEye className="inline mr-2" />Deep Dive
                    </button>
                    <button onClick={() => { startOrRetakeAssessment(quickModalPayload.systemKey); setShowQuickModal(false); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700">
                      Retake Assessment
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setShowQuickModal(false); navigate("/ceo/org-health"); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-gray-700 text-gray-300" : "border border-gray-200 text-gray-700"}`}>
                      Learn About This System
                    </button>
                    <button onClick={() => { startOrRetakeAssessment(quickModalPayload.systemKey); setShowQuickModal(false); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                      Start Assessment
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
