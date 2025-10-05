import React from 'react';
import { useOutletContext } from 'react-router-dom';

function ROICalculator() {
  const [cost, setCost] = React.useState(50000);
  const [savingPct, setSavingPct] = React.useState(10);
  const roi = Math.round((savingPct/100)*cost);
  return (
    <div>
      <div className="text-xs text-gray-400">ROI Calculator (annual)</div>
      <div className="mt-2">
        <label className="text-xs">Baseline cost</label>
        <input type="number" className="w-full border rounded px-2 py-1 mt-1" value={cost} onChange={(e)=>setCost(Number(e.target.value))} />
      </div>
      <div className="mt-2">
        <label className="text-xs">Estimated savings %</label>
        <input type="range" min="0" max="50" value={savingPct} onChange={(e)=>setSavingPct(Number(e.target.value))} />
        <div className="text-sm mt-1">Estimated savings: ₦{roi}</div>
      </div>
    </div>
  );
}

export default function RecommendationsActions() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;

  const [tasks, setTasks] = React.useState([
    { id: 't1', title: 'Assign orchestration owners', impact: 'high', status: 'todo' },
    { id: 't2', title: 'Run cross-functional weekly syncs', impact: 'medium', status: 'in-progress' },
  ]);

  return (
    <div>
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recommendations & Actions</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl p-4 md:col-span-2 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Prioritized Action List</div>
          <div className="mt-3 space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-gray-400">Impact: {t.impact}</div>
                </div>
                <div className="text-xs">{t.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <ROICalculator />
        </div>
      </div>
    </div>
  );
}
