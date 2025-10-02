// Thin wrapper around CustomEvent to keep event names consistent and provide typed helpers

export const EVENT_NAMES = {
  start: "conseqx:assessment:start",
  progress: "conseqx:assessment:progress",
  completed: "conseqx:assessment:completed",
  view: "conseqx:assessment:view",
};

export function emitAssessmentStart({ orgId, systemId }) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAMES.start, { detail: { orgId, systemId } }));
  } catch {}
}

export function emitAssessmentProgress({ orgId, systemId, progress, result }) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAMES.progress, { detail: { orgId, systemId, progress, result } }));
  } catch {}
}

export function emitAssessmentCompleted(resultObject) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAMES.completed, { detail: resultObject }));
  } catch {}
}

export function onAssessmentStart(cb) {
  const handler = (e) => cb?.(e?.detail);
  window.addEventListener(EVENT_NAMES.start, handler);
  return () => window.removeEventListener(EVENT_NAMES.start, handler);
}

export function onAssessmentProgress(cb) {
  const handler = (e) => cb?.(e?.detail);
  window.addEventListener(EVENT_NAMES.progress, handler);
  return () => window.removeEventListener(EVENT_NAMES.progress, handler);
}

export function onAssessmentCompleted(cb) {
  const handler = (e) => cb?.(e?.detail);
  window.addEventListener(EVENT_NAMES.completed, handler);
  return () => window.removeEventListener(EVENT_NAMES.completed, handler);
}

export default {
  EVENT_NAMES,
  emitAssessmentStart,
  emitAssessmentProgress,
  emitAssessmentCompleted,
  onAssessmentStart,
  onAssessmentProgress,
  onAssessmentCompleted,
};
