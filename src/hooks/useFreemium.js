import { useState, useEffect, useCallback } from "react";

export default function useFreemium({ freemiumDurationHours = 24, maxRunsPerDay = 3 } = {}) {
  const [maxRunsPerDayState] = useState(() => Number(maxRunsPerDay) || 3);

  const getNextLocalMidnightTs = useCallback(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return nextMidnight.getTime();
  }, []);

  // expiry (global hint)
  const [expiresAt, setExpiresAt] = useState(() => {
    const raw = localStorage.getItem("conseqx_freemium_expires");
    return raw ? Number(raw) : getNextLocalMidnightTs();
  });

  useEffect(() => {
    // if expired, reset global expiry to next midnight
    const now = Date.now();
    if (!expiresAt || expiresAt <= now) {
      const next = getNextLocalMidnightTs();
      try {
        localStorage.setItem("conseqx_freemium_expires", String(next));
      } catch {}
      setExpiresAt(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, getNextLocalMidnightTs]);

  function consumeRunLocal() {
    try {
      const cur = Math.max(0, Number(localStorage.getItem("conseqx_freemium_remaining") || maxRunsPerDayState));
      const next = Math.max(0, cur - 1);
      localStorage.setItem("conseqx_freemium_remaining", String(next));
      return next;
    } catch (e) {
      return null;
    }
  }

  return {
    maxRunsPerDay: maxRunsPerDayState,
    expiresAt,
    getNextLocalMidnightTs,
    consumeRunLocal,
  };
}
