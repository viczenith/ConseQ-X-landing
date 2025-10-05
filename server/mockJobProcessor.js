#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const email = require('./emailStub');

const DATA_DIR = path.join(__dirname, 'data');
const QUEUE = path.join(DATA_DIR, 'jobQueue.json');
const PROCESSED = path.join(DATA_DIR, 'processedJobs.json');
const NOTIFS = path.join(DATA_DIR, 'notifications.json');

async function readJSON(p) {
  try {
    const s = await fs.readFile(p, 'utf8');
    return JSON.parse(s || '[]');
  } catch (e) {
    return [];
  }
}

async function writeJSON(p, obj) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
}

let running = true;

async function processJob(job) {
  console.log('Processing job', job.id || job.jobId || job.fileName || '(unknown)');
  // simulate work
  await new Promise((r) => setTimeout(r, 1500));

  const result = {
    jobId: job.id || job.jobId || `job_${Date.now()}`,
    status: 'completed',
    timestamp: Date.now(),
    orgId: job.orgId || job.org,
    system: job.system || job.systemId || null,
    score: Math.max(10, Math.min(99, Math.floor(40 + Math.random() * 50))),
    summary: `Auto-generated analysis for ${job.name || job.fileName || 'upload'}`,
  };

  // append to processed jobs
  const processed = await readJSON(PROCESSED);
  processed.unshift(result);
  await writeJSON(PROCESSED, processed);

  // create notification record
  const notif = {
    id: `notif_${Date.now()}`,
    to: job.notifyTo || job.orgEmail || 'dev@example.com',
    subject: `Analysis ready for ${job.name || job.fileName || result.system || 'your upload'}`,
    body: `Your analysis is ready. Score: ${result.score}%\n\nSummary: ${result.summary}`,
    timestamp: Date.now(),
  };
  const notifs = await readJSON(NOTIFS);
  notifs.unshift(notif);
  await writeJSON(NOTIFS, notifs);

  // send email via stub (writes to outbox.json)
  try {
    await email.sendEmail(notif.to, notif.subject, notif.body);
  } catch (e) {
    console.error('Failed to send email via stub:', e);
  }

  console.log('Job processed', result.jobId, '-> notification queued to', notif.to);
  return result;
}

async function loop() {
  while (running) {
    try {
      const queue = await readJSON(QUEUE);
      if (queue.length) {
        const job = queue.shift();
        await writeJSON(QUEUE, queue);
        await processJob(job);
      } else {
        // idle wait
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (e) {
      console.error('Error in job loop:', e);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

process.on('SIGINT', () => {
  running = false;
  console.log('Shutting down mock job processor...');
  setTimeout(() => process.exit(0), 500);
});

console.log('Mock job processor starting. Watching', QUEUE);
loop();
