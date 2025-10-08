#!/usr/bin/env node
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

const PORT = process.env.MOCK_API_PORT || 4001;
const DATA_DIR = path.join(__dirname, 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'jobQueue.json');

async function readJSON(p, fallback) {
  try {
    const s = await fs.readFile(p, 'utf8');
    return JSON.parse(s || '[]');
  } catch (e) {
    return fallback;
  }
}

async function writeJSON(p, obj) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
}

function makeSeries(base) {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const ts = Date.now() - i * 24 * 3600 * 1000;
    const v = Math.max(5, Math.min(95, base + Math.floor((Math.random() - 0.5) * 8)));
    const conf = Math.floor(2 + Math.random() * 6);
    arr.push({ ts, value: v, upper: Math.min(100, v + conf), lower: Math.max(0, v - conf) });
  }
  return arr;
}

async function handleOverview(req, res) {
  // simple mock: generate per system series and scores
  const systems = ['interdependency','orchestration','investigation','interpretation','illustration','inlignment'];
  const perSystem = {};
  const scores = {};
  systems.forEach((s, i) => {
    const base = 45 + i * 5 + Math.floor(Math.random() * 10);
    perSystem[s] = makeSeries(base);
    scores[s] = perSystem[s][perSystem[s].length-1].value;
  });

  const overallSeries = makeSeries(Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/systems.length || 60));

  const payload = { overallSeries, perSystemSeries: perSystem, scores, latest_upload_ts: Date.now() };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

async function handleEnqueue(req, res) {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    const job = body ? JSON.parse(body) : {};
    const queue = await readJSON(QUEUE_FILE, []);
    queue.unshift(job);
    await writeJSON(QUEUE_FILE, queue);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, queued: job }));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: String(e) }));
  }
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (req.method === 'GET' && parsed.pathname === '/api/overview') return handleOverview(req, res);
  if (req.method === 'POST' && parsed.pathname === '/api/enqueue') return handleEnqueue(req, res);

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => console.log(`Mock API listening on http://localhost:${PORT}`));
