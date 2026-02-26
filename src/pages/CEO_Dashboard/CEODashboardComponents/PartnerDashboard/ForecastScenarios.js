import React, { useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { FaSpinner, FaExclamationTriangle, FaPlay, FaUndo } from "react-icons/fa";

export default function ForecastScenarios() {
  const ctx = useOutletContext() || {};
  const { darkMode, summary, loading, error, refresh, simulateImpact } = ctx;

  const [adjustments, setAdjustments] = useState({});
  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState(null);

  const systems = summary?.systems || [];
  const orgHealth = summary?.org_health ?? 0;
  const forecast = summary?.health_forecast;

  const runSimulation = useCallback(async (systemKey, changePct) => {
    if (!simulateImpact) return;
    setSimulating(true);
    setSimError(null);
    try {
      const result = await simulateImpact(systemKey, changePct);
      setSimResults(prev => ({
        ...(prev || {}),
        [systemKey]: { changePct, before: result.before, after: result.after },
      }));
    } catch (err) {
      setSimError(err.message);
    } finally {
      setSimulating(false);
    }
  }, [simulateImpact]);

  const handleSliderChange = (sysKey, value) => {
    setAdjustments(prev => ({ ...prev, [sysKey]: Number(value) }));
  };

  const simulateAll = useCallback(async () => {
    const entries = Object.entries(adjustments).filter(([, v]) => v !== 0);
    if (entries.length === 0) return;
    setSimulating(true);
    setSimError(null);
    try {
      for (const [sysKey, changePct] of entries) {
        const result = await simulateImpact(sysKey, changePct);
        setSimResults(prev => ({
          ...(prev || {}),
          [sysKey]: { changePct, before: result.before, after: result.after },
        }));
      }
    } catch (err) {
      setSimError(err.message);
    } finally {
      setSimulating(false);
    }
  }, [adjustments, simulateImpact]);

  const resetAll = () => {
    setAdjustments({});
    setSimResults(null);
    setSimError(null);
  };

  // Build comparison chart data
  const comparisonData = CANONICAL_SYSTEMS.map(sys => {
    const data = systems.find(s => s.key === sys.key);
    const current = data?.score ?? 0;
    const sim = simResults?.[sys.key];
    const projected = sim
      ? Math.round(sim.after?.orgHealth ?? current)
      : current;
    return { name: sys.title, key: sys.key, current, adjustment: adjustments[sys.key] || 0, color: sys.color };
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Loading forecast data…
    </div>
  );

  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Header: current health + 30-day forecast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Current Org Health</div>
          <div className={`text-3xl font-bold mt-1 ${orgHealth >= 70 ? "text-green-500" : orgHealth >= 45 ? "text-yellow-500" : "text-red-500"}`}>{orgHealth}%</div>
        </div>
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>30-Day Forecast</div>
          <div className="text-3xl font-bold mt-1">{forecast?.next_30_days ?? "—"}%</div>
          {forecast && (
            <div className={`text-xs mt-1 ${forecast.next_30_days > orgHealth ? "text-green-500" : forecast.next_30_days < orgHealth ? "text-red-500" : (darkMode ? "text-gray-400" : "text-gray-500")}`}>
              {forecast.next_30_days > orgHealth ? "▲ Trending up" : forecast.next_30_days < orgHealth ? "▼ Trending down" : "→ Stable"}
            </div>
          )}
        </div>
        <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Active Risks</div>
          <div className="text-3xl font-bold mt-1">{forecast?.risk_areas?.length ?? 0}</div>
          <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {forecast?.improvement_opportunities?.length ?? 0} opportunities
          </div>
        </div>
      </div>

      {/* Impact Simulator */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Impact Simulator</h3>
          <div className="flex items-center gap-2">
            <button onClick={resetAll} disabled={simulating}
              className={`px-3 py-1.5 text-sm rounded-lg border flex items-center gap-1 ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}>
              <FaUndo className="text-xs" /> Reset
            </button>
            <button onClick={simulateAll} disabled={simulating || Object.values(adjustments).every(v => v === 0)}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
              {simulating ? <FaSpinner className="animate-spin text-xs" /> : <FaPlay className="text-xs" />}
              Simulate
            </button>
          </div>
        </div>

        <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Adjust system scores to see how changes impact overall organizational health. The simulation uses real backend calculations.
        </p>

        {simError && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
            {simError}
          </div>
        )}

        <div className="space-y-4">
          {CANONICAL_SYSTEMS.map(sys => {
            const data = systems.find(s => s.key === sys.key);
            const currentScore = data?.score ?? 50;
            const adj = adjustments[sys.key] || 0;
            const sim = simResults?.[sys.key];

            return (
              <div key={sys.key} className={`p-4 rounded-lg border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sys.color }} />
                    <span className="text-sm font-medium">{sys.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Current: {currentScore}%</span>
                    {adj !== 0 && (
                      <span className={`text-sm font-medium ${adj > 0 ? "text-green-500" : "text-red-500"}`}>
                        {adj > 0 ? "+" : ""}{adj}%
                      </span>
                    )}
                  </div>
                </div>

                <input type="range" min={-50} max={50} step={5} value={adj}
                  onChange={(e) => handleSliderChange(sys.key, e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  style={{ background: `linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)` }}
                />

                <div className="flex justify-between text-xs mt-1">
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>-50%</span>
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>0</span>
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>+50%</span>
                </div>

                {/* Simulation result for this system */}
                {sim && (
                  <div className={`mt-2 p-2 rounded text-xs ${darkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
                    <span className={darkMode ? "text-blue-300" : "text-blue-700"}>
                      Org Health: {Math.round(sim.before?.orgHealth ?? 0)}% → {Math.round(sim.after?.orgHealth ?? 0)}%
                      ({(sim.after?.orgHealth - sim.before?.orgHealth) > 0 ? "+" : ""}
                      {(sim.after?.orgHealth - sim.before?.orgHealth).toFixed(1)} pts)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current system scores bar chart */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className="text-sm font-semibold mb-3">System Comparison</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, background: darkMode ? "#1f2937" : "#fff", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}
              formatter={(v) => [`${v}%`]}
            />
            <Bar dataKey="current" name="Current Score" radius={[4, 4, 0, 0]}>
              {comparisonData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
