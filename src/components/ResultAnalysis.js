import React from 'react';

export default function ResultAnalysis({ analysis }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Organizational Health Analysis</h2>
      
      <div className="prose max-w-none">
        {analysis.split('\n\n').map((section, index) => (
          <p key={index} className="mb-4">{section}</p>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Recommended Next Steps</h3>
        <ul className="list-disc pl-5">
          <li>Schedule a consultation to discuss implementation</li>
          <li>Prioritize high-impact areas identified in the report</li>
          <li>Establish quarterly review cadence for progress tracking</li>
        </ul>
      </div>
    </div>
  );
}