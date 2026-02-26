import React from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

function fmtDate(d) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

function ScoreCard({ sys, score, delta, series, darkMode }) {
  const color = sys.color || "#3B82F6";
  return (
    <div className={`rounded-xl p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{sys.title}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${score >= 70 ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700") : score >= 45 ? (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700") : (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700")}`}>
          {score != null ? `${score}%` : "—"}
        </span>
      </div>
      {delta !== 0 && delta != null && (
        <div className={`text-xs mb-1 ${delta > 0 ? "text-green-500" : "text-red-500"}`}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} pts vs prior
        </div>
      )}
      {series && series.length > 0 && (
        <ResponsiveContainer width="100%" height={48}>
          <LineChart data={series}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, padding: "2px 6px", borderRadius: 6, background: darkMode ? "#1f2937" : "#fff", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}
              labelFormatter={fmtDate}
              formatter={(v) => [`${v}%`, sys.title]}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function OverviewView() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, overview, loading, error, refresh } = ctx;

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading overview…
    </div>
  );

  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
    </div>
  );

  const orgHealth = summary?.org_health ?? 0;
  const confidence = summary?.confidence ?? 0;
  const systems = summary?.systems || [];
  const overallSeries = overview?.overallSeries || [];
  const perSystemSeries = overview?.perSystemSeries || {};
  const northStar = summary?.north_star;
  const forecast = summary?.health_forecast;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`col-span-1 md:col-span-2 rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold">Overall Organizational Health</h3>
            <span className={`text-3xl font-bold ${orgHealth >= 70 ? "text-green-500" : orgHealth >= 45 ? "text-yellow-500" : "text-red-500"}`}>{orgHealth}%</span>
          </div>
          <div className={`text-xs mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Confidence: {(confidence * 100).toFixed(0)}% · Based on {systems.filter(s => s.score != null).length} assessed systems
          </div>
          {overallSeries.length > 0 && (
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={overallSeries}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={fmtDate} />
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Tooltip formatter={(v) => [`${v}%`, "Health"]} labelFormatter={fmtDate}
                  contentStyle={{ fontSize: 11, borderRadius: 6, background: darkMode ? "#1f2937" : "#fff", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={`rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          {northStar && (
            <div className="mb-4">
              <div className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>North Star</div>
              <div className="text-sm font-semibold">{northStar.name}</div>
              <div className="text-lg font-bold mt-1">{northStar.value}{northStar.unit}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${northStar.trend === "improving" ? (darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700") : northStar.trend === "needs_attention" ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700") : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}`}>
                {northStar.trend?.replace("_", " ")}
              </span>
            </div>
          )}
          {forecast && (
            <div>
              <div className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>30-Day Forecast</div>
              <div className="text-2xl font-bold">{forecast.next_30_days}%</div>
              <div className={`text-xs ${forecast.next_30_days > orgHealth ? "text-green-500" : "text-red-500"}`}>
                {forecast.next_30_days > orgHealth ? "▲ Improving" : forecast.next_30_days < orgHealth ? "▼ Declining" : "→ Stable"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System score cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3">System Scores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CANONICAL_SYSTEMS.map((sys) => {
            const data = systems.find(s => s.key === sys.key);
            return (
              <ScoreCard
                key={sys.key}
                sys={sys}
                score={data?.score}
                delta={data?.delta_mom}
                series={perSystemSeries[sys.key]}
                darkMode={darkMode}
              />
            );
          })}
        </div>
      </div>

      {/* Risk alerts (from real backend data) */}
      {forecast?.risk_areas?.length > 0 && (
        <div className={`rounded-xl p-4 border ${darkMode ? "bg-red-900/10 border-red-900/30" : "bg-red-50 border-red-200"}`}>
          <h4 className={`text-sm font-semibold mb-2 ${darkMode ? "text-red-300" : "text-red-700"}`}>
            <FaExclamationTriangle className="inline mr-1" /> Risk Alerts
          </h4>
          <div className="space-y-2">
            {forecast.risk_areas.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="capitalize">{r.system}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.risk_level === "critical" ? (darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700") : (darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700")}`}>
                    {r.risk_level}
                  </span>
                  <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Mitigate in {r.mitigation_timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity highlights */}
      {forecast?.improvement_opportunities?.length > 0 && (
        <div className={`rounded-xl p-4 border ${darkMode ? "bg-green-900/10 border-green-900/30" : "bg-green-50 border-green-200"}`}>
          <h4 className={`text-sm font-semibold mb-2 ${darkMode ? "text-green-300" : "text-green-700"}`}>Leverage Opportunities</h4>
          <div className="space-y-2">
            {forecast.improvement_opportunities.map((o, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="capitalize">{o.system}</span>
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{o.suggested_action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
