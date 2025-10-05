import React from 'react';
import { FaCommentDots } from 'react-icons/fa';

export default function AINarration({ open, onClose, context }) {
  if (!open) return null;
  const summary = context?.summary || {};
  const lowSystems = Object.keys(summary.scores || {}).filter(k => summary.scores[k] < 50);
  const text = lowSystems.length ? `Your ${lowSystems.join(', ')} score${lowSystems.length>1?'s have':' has'} dipped — consider short sprints to clarify ownership and measure weekly.` : 'All systems are stable. Focus on growth initiatives for next quarter.';

  return (
    <div className="fixed right-4 bottom-4 z-50 w-96 max-w-full">
      <div className="p-3 rounded-xl shadow-lg bg-white dark:bg-gray-900 border">
        <div className="flex items-start gap-3">
          <div className="text-blue-600"><FaCommentDots /></div>
          <div className="flex-1">
            <div className="font-semibold">AI Narration</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{text}</div>
            <div className="mt-3 flex items-center gap-2">
              <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Create action</button>
              <button onClick={onClose} className="px-3 py-1 rounded border text-sm">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
