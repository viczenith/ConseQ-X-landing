import React from 'react';

export default function CustomizationPanel() {
  const [open, setOpen] = React.useState(false);
  const KEY = 'conseqx_partner_dashboard_widgets_v1';
  const [order, setOrder] = React.useState(() => {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : ['overview','deep-dive','forecast','recommendations','benchmarking']; } catch { return ['overview','deep-dive','forecast','recommendations','benchmarking']; }
  });

  React.useEffect(()=>{ try { localStorage.setItem(KEY, JSON.stringify(order)); } catch {} }, [order]);

  return (
    <div className="">
      <button onClick={() => setOpen(s => !s)} className="px-3 py-1 rounded-md border">Customize</button>
      {open && (
        <div className="mt-2 p-3 rounded border bg-white shadow-md w-64 text-sm">
            <div className="font-semibold">Layout & Widgets</div>
            <div className="mt-2 text-xs text-gray-600">Re-order the dashboard sections. Order is saved to your browser.</div>
            <div className="mt-2 text-xs">Sections:</div>
            <ul className="mt-1 text-xs list-inside space-y-2">
              {order.map((key, idx) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key.replace('-', ' ')}</span>
                  <span className="flex items-center gap-1">
                    <button disabled={idx===0} onClick={()=>{ const next = [...order]; [next[idx-1], next[idx]] = [next[idx], next[idx-1]]; setOrder(next); }} className="px-2 py-0.5 border rounded text-xs">↑</button>
                    <button disabled={idx===order.length-1} onClick={()=>{ const next = [...order]; [next[idx+1], next[idx]] = [next[idx], next[idx+1]]; setOrder(next); }} className="px-2 py-0.5 border rounded text-xs">↓</button>
                  </span>
                </li>
              ))}
            </ul>
        </div>
      )}
    </div>
  );
}
