
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as svc from "../services/serviceSelector";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";
import {
  FaBrain, FaExclamationTriangle,
  FaLightbulb, FaCheckCircle, FaRocket,
  FaFileAlt, FaShieldAlt, FaUsers,
  FaChevronRight, FaTimes
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Tooltip
} from "recharts";

const UPLOADS_KEY = "conseqx_uploads_v1";

// ─── System metadata enrichment ───────────────────────────────────────
const SYSTEM_META = {
  interdependency: {
    emoji: "🔗", color: "#3B82F6", gradient: "from-blue-500 to-blue-700",
    insight: "How well your teams and departments work together",
    shortAdvice: "Tighten up the handoffs between departments so nothing falls through the cracks",
  },
  orchestration: {
    emoji: "🔄", color: "#10B981", gradient: "from-emerald-500 to-emerald-700",
    insight: "How quickly your organisation adapts and improves",
    shortAdvice: "Speed up how fast feedback reaches the people who need it",
  },
  investigation: {
    emoji: "🔍", color: "#F59E0B", gradient: "from-amber-500 to-amber-700",
    insight: "How well you get to the root of problems before they spread",
    shortAdvice: "Set up better ways to spot and diagnose issues early",
  },
  interpretation: {
    emoji: "💡", color: "#8B5CF6", gradient: "from-violet-500 to-violet-700",
    insight: "How well you turn information into smart decisions",
    shortAdvice: "Start pulling your data together in one place so leadership can make sharper calls",
  },
  illustration: {
    emoji: "📊", color: "#EF4444", gradient: "from-red-500 to-red-700",
    insight: "How clearly ideas and knowledge flow across the organisation",
    shortAdvice: "Make it easier for teams to share what they know, especially across departments",
  },
  inlignment: {
    emoji: "🎯", color: "#06B6D4", gradient: "from-cyan-500 to-cyan-700",
    insight: "How well your day-to-day work lines up with your bigger goals",
    shortAdvice: "Make sure every team's targets connect back to the company's main priorities",
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

/* System Health Card (interactive) */
function SystemCard({ systemKey, score, darkMode, onClick }) {
  const canonical = CANONICAL_SYSTEMS.find(s => s.key === systemKey);
  const meta = SYSTEM_META[systemKey] || {};
  const health = getHealthLabel(score || 0);
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
              {meta.insight || ""}
            </div>
          </div>
        </div>
      </div>
      {isAssessed ? (
        <div className="flex items-end justify-between">
          <div className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{score}%</div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getHealthBg(score, darkMode)} ${health.color}`}>
            {health.text}
          </span>
        </div>
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
    system: s.title, score: scores[s.key] || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke={darkMode ? "#374151" : "#E5E7EB"} />
        <PolarAngleAxis dataKey="system" tick={{ fontSize: 11, fill: darkMode ? "#9CA3AF" : "#6B7280" }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: darkMode ? "#6B7280" : "#9CA3AF" }} tickCount={5} />
        <Radar name="Your Scores" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip contentStyle={{
          backgroundColor: darkMode ? "#1F2937" : "#FFF",
          border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
          borderRadius: 8, fontSize: 12,
        }} />
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
        list.push({ type: "critical", system: key, msg: `${name} is at ${score}% — this needs urgent attention before it starts dragging other areas down` });
      else if (score < 60)
        list.push({ type: "warning", system: key, msg: `${name} scored ${score}% — it's not critical yet, but it's worth keeping a close eye on` });
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
          msg: `There's a ${gap}-point gap between ${hName} (${highest[1]}%) and ${lName} (${lowest[1]}%) — that kind of imbalance tends to cause friction across the business` });
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
              {alert.type === "critical" ? "Deal with this soon" : alert.type === "warning" ? "Worth watching" : "Something to think about"}
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
      icon: <FaBrain className="text-purple-500" />, title: "The Big Picture",
      text: avg >= 70
        ? `Your organisation is in good shape at ${avg}%. Keep the momentum going and don't forget to assess the ${6 - assessed.length} system${6 - assessed.length !== 1 ? "s" : ""} you haven't covered yet.`
        : avg >= 50
        ? `At ${avg}%, there's definite room for improvement. Focusing on ${lName} (${lowest[1]}%) would give you the biggest return for your effort.`
        : `A score of ${avg}% tells us there are some serious gaps that need closing. The good news is — once you start fixing the right things, scores tend to move quickly.`,
    },
    {
      icon: <FaRocket className="text-green-500" />, title: "Build on What's Working",
      text: `${hName} is your strongest area at ${highest[1]}%. ${hMeta.shortAdvice || "Use what's working there as a model for the areas that need help."}`,
    },
    {
      icon: <FaExclamationTriangle className="text-amber-500" />, title: "Where to Focus First",
      text: `${lName} scored ${lowest[1]}% — that's the area where focused effort will make the biggest difference. ${lMeta.shortAdvice || "Start with one or two practical changes."}`,
    },
  ];

  // Cultural health sub-insight
  const culturalKeys = ["interpretation", "illustration", "inlignment"];
  const culturalScores = culturalKeys.map(k => scores[k]).filter(v => v !== null);
  if (culturalScores.length >= 2) {
    const cAvg = Math.round(culturalScores.reduce((a, b) => a + b, 0) / culturalScores.length);
    insights.push({
      icon: <FaUsers className="text-pink-500" />, title: "Your Team Culture",
      text: cAvg >= 70
        ? `The culture side of things is looking healthy at ${cAvg}%. People seem to understand the vision and communicate well — keep reinforcing that.`
        : `Culture scores are sitting at ${cAvg}%, which suggests that strategy, communication, and team alignment may not be quite in sync yet.`,
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

/* Removed standalone AssessmentProgressTracker — progress bar merged into system cards section */

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

      {/* ─── Hero Row: Health Gauge + Radar ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Health */}
        <div className={`lg:col-span-4 rounded-2xl p-6 border ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                   : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        }`}>
          <div className={`text-sm font-semibold mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            How Your Organisation Is Doing
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
                How Your Six Systems Compare
              </div>
              <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Each axis represents one of the six systems that drive your organisation
              </div>
            </div>
            <button onClick={() => navigate("/ceo/org-health")}
              className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              See Full Breakdown <FaChevronRight className="text-[8px]" />
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
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Things That Need Your Attention</div>
          </div>
          <KeyAlertsPanel scores={systemScoresFromUpload} darkMode={darkMode} onViewSystem={handleViewSystem} />
        </div>

        {/* Strategic Insights */}
        <div className={`rounded-2xl p-5 border ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-4">
            <FaBrain className="text-purple-500" />
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>What You Should Know</div>
          </div>
          {assessedCount > 0 ? (
            <StrategicInsightsPanel scores={systemScoresFromUpload} darkMode={darkMode} />
          ) : (
            <div className={`text-center py-8 rounded-xl ${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
              <FaBrain className="mx-auto text-3xl text-gray-400 mb-2" />
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Complete at least one assessment to see personalised insights about your organisation
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── System Cards + Progress ────────────────────────── */}
      <div className={`rounded-2xl p-5 border ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-1">
          <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Your Six Systems at a Glance
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            assessedCount === 6
              ? (darkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700")
              : (darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700")
          }`}>{assessedCount} of 6 assessed</span>
        </div>
        {assessedCount < 6 && (
          <div className="mb-4">
            <div className={`w-full h-1.5 rounded-full mt-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
              <div style={{ width: `${Math.round((assessedCount / 6) * 100)}%` }}
                className={`h-full rounded-full transition-all duration-700 ${assessedCount === 6 ? "bg-green-500" : "bg-blue-500"}`} />
            </div>
          </div>
        )}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${assessedCount === 6 ? "mt-4" : ""}`}>
          {CANONICAL_SYSTEMS.map(s => (
            <SystemCard key={s.key} systemKey={s.key} score={systemScoresFromUpload[s.key]} darkMode={darkMode} onClick={() => handleViewSystem(s.key)} />
          ))}
        </div>
        {assessedCount < 6 && (
          <button
            onClick={() => { const u = CANONICAL_SYSTEMS.find(s => systemScoresFromUpload[s.key] === null || systemScoresFromUpload[s.key] === undefined); if (u) startOrRetakeAssessment(u.key); }}
            className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Continue — {6 - assessedCount} system{6 - assessedCount > 1 ? "s" : ""} left to assess
          </button>
        )}
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
                          <div className={`text-sm font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>What This Means</div>
                          <div className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {quickModalPayload.meta?.insight || "Looking at how this system is performing..."}
                            {quickModalPayload.score < 60 && (
                              <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                                Our suggestion: {quickModalPayload.meta?.shortAdvice || "Start with one or two practical improvements."}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {quickModalPayload.score < 65 && quickModalPayload.meta?.shortAdvice && (
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-amber-900/10 border border-amber-800/30" : "bg-amber-50 border border-amber-100"}`}>
                        <div className="flex items-start gap-3">
                          <FaRocket className="text-amber-500 mt-0.5" />
                          <div>
                            <div className={`text-sm font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Where to Start</div>
                            <div className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {quickModalPayload.meta.shortAdvice}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-3">📋</div>
                    <h4 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>You Haven't Taken This Assessment Yet</h4>
                    <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      It takes about 10–20 minutes. Once you're done, you'll get a full report with scores, personalised recommendations, and practical next steps.
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
                      <FaFileAlt className="inline mr-2" />View Full Report
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
