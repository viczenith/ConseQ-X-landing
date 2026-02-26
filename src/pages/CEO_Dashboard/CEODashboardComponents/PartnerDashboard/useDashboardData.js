import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../../services/apiClient";

const CACHE_TTL = 60_000;
let _cache = { summary: null, overview: null, uploads: null, ts: 0 };

export default function useDashboardData() {
  const [summary, setSummary] = useState(_cache.summary);
  const [overview, setOverview] = useState(_cache.overview);
  const [uploads, setUploads] = useState(_cache.uploads || []);
  const [loading, setLoading] = useState(!_cache.summary);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async (force = false) => {
    if (!force && _cache.summary && Date.now() - _cache.ts < CACHE_TTL) {
      setSummary(_cache.summary);
      setOverview(_cache.overview);
      setUploads(_cache.uploads || []);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [sumRes, ovRes, upRes] = await Promise.all([
        apiFetch("dashboard/summary").catch(() => null),
        apiFetch("overview").catch(() => null),
        apiFetch("uploads").catch(() => []),
      ]);
      if (!mountedRef.current) return;
      _cache = { summary: sumRes, overview: ovRes, uploads: upRes, ts: Date.now() };
      setSummary(sumRes);
      setOverview(ovRes);
      setUploads(Array.isArray(upRes) ? upRes : []);
    } catch (err) {
      if (mountedRef.current) setError(err.message || "Failed to load dashboard data");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => { mountedRef.current = false; };
  }, [fetchAll]);

  const simulateImpact = useCallback(async (systemKey, changePct) => {
    return apiFetch("dashboard/simulate-impact", {
      method: "POST",
      body: { system_key: systemKey, change_pct: changePct },
    });
  }, []);

  return { summary, overview, uploads, loading, error, refresh: () => fetchAll(true), simulateImpact };
}
