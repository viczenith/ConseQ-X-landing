import React, { useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { CANONICAL_SYSTEMS } from "../../constants/systems";
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
  const hasAnyScore = systems.some(s => s.score != null && s.score > 0);

  const handleSliderChange = (sysKey, value) => {
    setAdjustments(prev => ({ ...prev, [sysKey]: Number(value) }));
  };

  const simulateAll = useCallback(async () => {
    const entries = Object.entries(adjustments).filter(([, v]) => v !== 0);
    if (entries.length === 0 || !simulateImpact) return;
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

  // Compute the net projected org health from all simulations
  const latestSimOrgHealth = (() => {
    if (!simResults) return null;
    const keys = Object.keys(simResults);
    if (keys.length === 0) return null;
    const last = simResults[keys[keys.length - 1]];
    return Math.round(last?.after?.orgHealth ?? orgHealth);
  })();

  const orgHealthDelta = latestSimOrgHealth != null ? latestSimOrgHealth - orgHealth : null;

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <FaSpinner className="animate-spin" /> Getting your forecast ready…
    </div>
  );

  if (error) return (
    <div className={`rounded-xl p-6 text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
      <FaExclamationTriangle className="mx-auto mb-2 text-xl" />
      <div className="text-sm">{error}</div>
      <button onClick={refresh} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try again</button>
    </div>
  );

  if (!hasAnyScore) return (
    <section className={`rounded-xl p-10 text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
      <FaExclamationTriangle className="mx-auto text-3xl mb-3 text-yellow-500" />
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Nothing to simulate yet</h3>
      <p className="text-sm max-w-md mx-auto">
        Once you've completed at least one assessment, you'll be able to use this tool to explore
        how changes to any system would affect your overall organisational health. Take an assessment first,
        then come back here to play with the numbers.
      </p>
    </section>
  );

  return (
    <section className="space-y-6">
      {/* Impact Simulator — the core of this page */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>What Would Happen If…</h3>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Drag any slider to see how improving or neglecting a system would shift your overall health score. This runs on your actual assessment data — no guesswork.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={resetAll} disabled={simulating}
              className={`px-3 py-1.5 text-sm rounded-lg border flex items-center gap-1 ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}>
              <FaUndo className="text-xs" /> Start over
            </button>
            <button onClick={simulateAll} disabled={simulating || Object.values(adjustments).every(v => v === 0)}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
              {simulating ? <FaSpinner className="animate-spin text-xs" /> : <FaPlay className="text-xs" />}
              Run it
            </button>
          </div>
        </div>

        {simError && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
            {simError}
          </div>
        )}

        {/* Projected result banner — only shows after running a simulation */}
        {latestSimOrgHealth != null && (
          <div className={`mb-5 p-4 rounded-xl flex items-center justify-between ${
            orgHealthDelta > 0
              ? (darkMode ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-100")
              : orgHealthDelta < 0
                ? (darkMode ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-100")
                : (darkMode ? "bg-gray-700 border border-gray-600" : "bg-gray-100 border border-gray-200")
          }`}>
            <div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>If you made these changes…</div>
              <div className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Your overall health would move from <strong>{orgHealth}%</strong> to <strong>{latestSimOrgHealth}%</strong>
              </div>
            </div>
            <div className={`text-2xl font-bold ${orgHealthDelta > 0 ? "text-green-500" : orgHealthDelta < 0 ? "text-red-500" : (darkMode ? "text-gray-400" : "text-gray-500")}`}>
              {orgHealthDelta > 0 ? "+" : ""}{orgHealthDelta?.toFixed(1)} pts
            </div>
          </div>
        )}

        <div className="space-y-3">
          {CANONICAL_SYSTEMS.map(sys => {
            const data = systems.find(s => s.key === sys.key);
            const currentScore = data?.score ?? 0;
            const assessed = currentScore > 0;
            const adj = adjustments[sys.key] || 0;
            const sim = simResults?.[sys.key];

            return (
              <div key={sys.key} className={`p-4 rounded-lg border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sys.color }} />
                    <span className={`text-sm font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{sys.title}</span>
                    {!assessed && <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`}>Not assessed</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {assessed && <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Now: {currentScore}%</span>}
                    {adj !== 0 && (
                      <span className={`text-sm font-semibold ${adj > 0 ? "text-green-500" : "text-red-500"}`}>
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
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>Decline</span>
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>No change</span>
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>Improve</span>
                </div>

                {sim && (
                  <div className={`mt-2 p-2 rounded text-xs ${darkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
                    <span className={darkMode ? "text-blue-300" : "text-blue-700"}>
                      Overall health: {Math.round(sim.before?.orgHealth ?? 0)}% → {Math.round(sim.after?.orgHealth ?? 0)}%
                      {" "}({(sim.after?.orgHealth - sim.before?.orgHealth) > 0 ? "+" : ""}
                      {(sim.after?.orgHealth - sim.before?.orgHealth).toFixed(1)} pts)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick interpretation */}
      <div className={`rounded-xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>How to read this</h3>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Each slider lets you model what would happen if a particular system got better or worse.
          Slide to the right to imagine you invested in that area. Slide to the left to see what happens if it deteriorates.
          Hit "Run it" and the numbers will update based on how your systems are actually weighted and connected.
          This is not a prediction — it's a way to think through where your effort would have the biggest impact.
        </p>
      </div>
    </section>
  );
}
