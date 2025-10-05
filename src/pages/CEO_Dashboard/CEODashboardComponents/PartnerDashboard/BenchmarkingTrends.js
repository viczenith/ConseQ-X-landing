import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function BenchmarkingTrends() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;

  return (
    <div>
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Benchmarking & Trends</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Industry Comparison Radar</div>
          <div className="mt-3 h-48 border rounded flex items-center justify-center">Radar chart placeholder</div>
        </div>

        <div className={`rounded-2xl p-4 ${darkMode? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="font-semibold">Historical Trends</div>
          <div className="mt-3 h-48 border rounded flex items-center justify-center">Line charts placeholder</div>
        </div>
      </div>
    </div>
  );
}
