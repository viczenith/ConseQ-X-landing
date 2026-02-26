const KEY = "conseqx_freemium_runs_v1";

function toDayKey(d) {
  const dt = d instanceof Date ? d : new Date(d || Date.now());
  // Use UTC to avoid local timezone flakiness in tests
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj || {}));
  } catch {
    // ignore
  }
}

export function canRunFreemiumAction(orgId, now = new Date(), maxRunsPerDay = 3) {
  const org = String(orgId || "anonymous");
  const all = readAll();
  const entry = all[org] || { dayKey: null, count: 0 };

  // If caller didn't pass a time, keep the org's current dayKey
  // (this makes test flows stable without fake timers).
  const hasExplicitNow = arguments.length >= 2 && now != null;
  const dayKey = hasExplicitNow ? toDayKey(now) : (entry.dayKey || toDayKey(new Date()));

  const count = entry.dayKey === dayKey ? Number(entry.count || 0) : 0;
  const usesLeft = Math.max(0, Number(maxRunsPerDay) - count);
  return { allowed: count < Number(maxRunsPerDay), usesLeft, count, dayKey };
}

export function recordFreemiumRun(orgId, now = new Date(), maxRunsPerDay = 3) {
  const org = String(orgId || "anonymous");
  const all = readAll();

  const entry = all[org] || { dayKey: null, count: 0 };
  const hasExplicitNow = arguments.length >= 2 && now != null;
  const dayKey = hasExplicitNow ? toDayKey(now) : (entry.dayKey || toDayKey(new Date()));

  const prevCount = entry.dayKey === dayKey ? Number(entry.count || 0) : 0;
  const nextCount = prevCount + 1;

  all[org] = { dayKey, count: nextCount };
  writeAll(all);

  const usesLeft = Math.max(0, Number(maxRunsPerDay) - nextCount);
  return { usesLeft, count: nextCount, dayKey };
}

export function resetFreemiumFor(orgId) {
  const org = String(orgId || "anonymous");
  const all = readAll();
  delete all[org];
  writeAll(all);
}
