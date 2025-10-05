// Lightweight notification service stub for development
// Stores outbound notifications in localStorage under `conseqx_notifications_outbox`

const OUTBOX_KEY = 'conseqx_notifications_outbox_v1';

function readOutbox() {
  try { const raw = localStorage.getItem(OUTBOX_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function writeOutbox(arr) {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr)); } catch (e) {}
}

function sendEmail({ to, subject, body }) {
  const out = readOutbox();
  out.unshift({ id: `O-${Date.now().toString(36)}`, channel: 'email', to, subject, body, ts: Date.now() });
  writeOutbox(out);
  // emit event for UI
  try { window.dispatchEvent(new CustomEvent('conseqx:notifications:outbox', { detail: { channel: 'email', to, subject } })); } catch (e) {}
  return Promise.resolve({ ok: true });
}

function sendSMS({ to, body }) {
  const out = readOutbox();
  out.unshift({ id: `O-${Date.now().toString(36)}`, channel: 'sms', to, body, ts: Date.now() });
  writeOutbox(out);
  try { window.dispatchEvent(new CustomEvent('conseqx:notifications:outbox', { detail: { channel: 'sms', to } })); } catch (e) {}
  return Promise.resolve({ ok: true });
}

function listOutbox() { return readOutbox(); }

export default { sendEmail, sendSMS, listOutbox };
