// Lightweight mock job queue to emulate async, external upload ingestion and processing.
// Persists queue to localStorage and processes jobs in the background by calling service selector.
import * as svc from './serviceSelector';

const QUEUE_KEY = 'conseqx_job_queue_v1';
let intervalId = null;

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {}
}

async function processJob(job) {
  // job: { id, name, timestamp, preview, systems }
  try {
    // For each detected system, trigger the assessment run via service selector
    if (Array.isArray(job.systems) && job.systems.length) {
      for (const sys of job.systems) {
        try { await svc.runAssessment(job.orgId || 'anon', sys); } catch (e) { /* swallow */ }
      }
    }

    // write notifications so the app reacts the same way as manual uploads
    try {
      const makeNote = (title) => ({ id: `N-${Date.now().toString(36)}`, uploadId: job.id, read: false, title, body: `Analysis ready for ${job.name}`, ts: Date.now(), type: 'upload' });
      const reportKeys = ['conseqx_reports_notifications_v3', 'conseqx_reports_notifications_v1'];
      reportKeys.forEach((k) => {
        try {
          const raw = localStorage.getItem(k);
          const notes = raw ? JSON.parse(raw) : [];
          notes.unshift(makeNote(`Analysis ready: ${job.name}`));
          localStorage.setItem(k, JSON.stringify(notes));
        } catch (e) {}
      });
      try { window.dispatchEvent(new CustomEvent('conseqx:notifications:updated', { detail: { uploadId: job.id, name: job.name } })); } catch (e) {}
    } catch (e) {}
  } catch (e) {
    console.warn('[mockJobQueue] processJob failed', e);
  }
}

function enqueue(job) {
  const q = readQueue();
  q.push(job);
  writeQueue(q);
  return job.id;
}

function dequeue() {
  const q = readQueue();
  if (!q.length) return null;
  const job = q.shift();
  writeQueue(q);
  return job;
}

function start(pollMs = 5000) {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    try {
      const job = dequeue();
      if (job) {
        // emulate variable processing time
        setTimeout(() => { processJob(job); }, 400 + Math.random() * 1600);
      }
    } catch (e) { console.warn('[mockJobQueue] tick error', e); }
  }, pollMs);
}

function stop() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

function list() { return readQueue(); }

export default { enqueue, start, stop, list };
