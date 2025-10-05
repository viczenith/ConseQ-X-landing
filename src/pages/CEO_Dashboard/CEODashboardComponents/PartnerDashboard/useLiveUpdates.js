import { useEffect, useRef, useState } from 'react';

// Simple WebSocket hook with reconnect and CustomEvent dispatching for local dev
export default function useLiveUpdates(url = 'ws://localhost:4002') {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(1000);

  useEffect(() => {
    let mounted = true;

    function connect() {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.addEventListener('open', () => { if (!mounted) return; setConnected(true); retryRef.current = 1000; });
        ws.addEventListener('message', (ev) => {
          try {
            const data = JSON.parse(ev.data);
            // dispatch an app-wide event for components to consume
            window.dispatchEvent(new CustomEvent('conseqx:live:update', { detail: data }));
          } catch (e) {
            // non-json payload
            window.dispatchEvent(new CustomEvent('conseqx:live:update', { detail: { raw: ev.data } }));
          }
        });
        ws.addEventListener('close', () => { if (!mounted) return; setConnected(false); setTimeout(() => { retryRef.current = Math.min(30000, retryRef.current * 1.5); connect(); }, retryRef.current); });
        ws.addEventListener('error', () => { /* ignore - will trigger close */ });
      } catch (e) { setConnected(false); setTimeout(connect, retryRef.current); }
    }

    connect();
    return () => { mounted = false; try { if (wsRef.current) wsRef.current.close(); } catch {} };
  }, [url]);

  function send(payload) {
    try { if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(payload)); }
    catch {}
  }

  return { connected, send, socket: wsRef.current };
}
