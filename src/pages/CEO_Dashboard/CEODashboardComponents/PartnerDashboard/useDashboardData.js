import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../../services/apiClient";
import * as svc from "../../services/serviceSelector";

const CACHE_TTL = 60_000;
let _cache = { summary: null, overview: null, uploads: null, ts: 0 };

export default function useDashboardData(orgId = "anon") {
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

      // If API returned a summary with real assessed systems, use it.
      // Otherwise fall back to localStorage via serviceSelector (which reads conseqx_assessments_v1).
      let finalSummary = sumRes;
      const apiHasScores = sumRes?.systems?.some(s => s.score != null && s.score > 0);
      if (!apiHasScores) {
        try {
          const localSummary = await svc.getDashboardSummary(orgId);
          const localHasScores = localSummary?.systems?.some(s => s.score != null && s.score > 0);
          if (localHasScores) finalSummary = localSummary;
        } catch {}
      }

      _cache = { summary: finalSummary, overview: ovRes, uploads: upRes, ts: Date.now() };
      setSummary(finalSummary);
      setOverview(ovRes);
      setUploads(Array.isArray(upRes) ? upRes : []);
    } catch (err) {
      // API totally failed — try localStorage as last resort
      try {
        const localSummary = await svc.getDashboardSummary(orgId);
        if (mountedRef.current) {
          _cache = { summary: localSummary, overview: null, uploads: [], ts: Date.now() };
          setSummary(localSummary);
          setOverview(null);
          setUploads([]);
        }
      } catch {
        if (mountedRef.current) setError(err.message || "Failed to load dashboard data");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => { mountedRef.current = false; };
  }, [fetchAll]);

  const simulateImpact = useCallback(async (systemKey, changePct) => {
    try {
      return await apiFetch("dashboard/simulate-impact", {
        method: "POST",
        body: { system_key: systemKey, change_pct: changePct },
      });
    } catch {
      // Fall back to local simulation
      return svc.simulateImpact(orgId, systemKey, changePct);
    }
  }, [orgId]);

  return { summary, overview, uploads, loading, error, refresh: () => fetchAll(true), simulateImpact };
}
