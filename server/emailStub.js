const fs = require('fs').promises;
const path = require('path');

const OUTBOX = path.join(__dirname, 'data', 'outbox.json');

async function readOutbox() {
  try {
    const s = await fs.readFile(OUTBOX, 'utf8');
    return JSON.parse(s || '[]');
  } catch (e) {
    return [];
  }
}

async function writeOutbox(arr) {
  await fs.mkdir(path.dirname(OUTBOX), { recursive: true });
  await fs.writeFile(OUTBOX, JSON.stringify(arr, null, 2), 'utf8');
}

async function sendEmail(to, subject, body) {
  const out = await readOutbox();
  const entry = { id: `out_${Date.now()}`, to, subject, body, timestamp: Date.now() };
  out.unshift(entry);
  await writeOutbox(out);
  console.log(`Stub email queued -> ${to} : ${subject}`);
  return entry;
}

module.exports = { sendEmail };
