const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4002 });
console.log('Mock WS Server listening on ws://localhost:4002');

wss.on('connection', (ws) => {
  console.log('client connected');
  ws.send(JSON.stringify({ type: 'welcome', ts: Date.now(), msg: 'mock live stream' }));

  const iv = setInterval(() => {
    const payload = { type: 'metric_update', ts: Date.now(), scores: { interdependency: Math.floor(40+Math.random()*50), orchestration: Math.floor(40+Math.random()*50), investigation: Math.floor(40+Math.random()*50), interpretation: Math.floor(40+Math.random()*50), illustration: Math.floor(40+Math.random()*50), inlignment: Math.floor(40+Math.random()*50) } };
    try { ws.send(JSON.stringify(payload)); } catch (e) {}
  }, 5000 + Math.floor(Math.random()*5000));

  ws.on('close', () => { clearInterval(iv); console.log('client disconnected'); });
});
