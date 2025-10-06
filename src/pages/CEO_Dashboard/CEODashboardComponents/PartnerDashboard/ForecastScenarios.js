import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ForecastScenarios() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  const [orchestrationBoost, setOrchestrationBoost] = React.useState(0);

  const simulated = Math.round(60 + orchestrationBoost * 0.6 + Math.random()*5);

  return (
    <div>
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Forecast & Scenarios</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Performance Forecast</div>
          <div className="mt-3 h-48 border rounded flex items-center justify-center">Predictive chart placeholder</div>
        </div>

        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">What-If Simulator</div>
          <div className="mt-3 text-sm">Increase Orchestration effectiveness: {orchestrationBoost}%</div>
          <input type="range" min="0" max="30" value={orchestrationBoost} onChange={(e)=>setOrchestrationBoost(Number(e.target.value))} />
          <div className="mt-3">Simulated overall score: <strong>{simulated}%</strong></div>
        </div>
      </div>
    </div>
  );
}
