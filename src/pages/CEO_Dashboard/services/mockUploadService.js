// src/services/mockUploadService.js
// Mock upload service (no backend) — stores uploads in localStorage and emits events.
// Keys and events:
//  - localStorage key: "conseqx_uploads_v1"
//  - event: window.dispatchEvent(new CustomEvent("conseqx:uploads:updated", { detail: { orgId } }))
//  - Broadcast channel: "conseqx_uploads"

const UPLOADS_KEY = "conseqx_uploads_v1";
const BC_NAME = "conseqx_uploads";

function readUploads() {
  try {
    const raw = localStorage.getItem(UPLOADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUploads(list) {
  try {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(list || []));
    // event & broadcast
    try {
      window.dispatchEvent(new CustomEvent("conseqx:uploads:updated", { detail: { count: (list || []).length } }));
    } catch {}
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(BC_NAME);
        bc.postMessage({ type: "uploads:updated", ts: Date.now() });
        bc.close();
      }
    } catch {}
  } catch {}
}

// naive analyzer: checks filename/text for canonical keywords
const CANONICAL = ["interdependency","iteration","investigation","interpretation","illustration","inlignment"];
function analyzeFilenameOrText(nameOrText = "") {
  const lowered = String(nameOrText || "").toLowerCase();
  const found = new Set();
  CANONICAL.forEach(k => {
    if (lowered.includes(k)) found.add(k);
    // allow short friendly terms
    if (k === "inlignment" && (lowered.includes("alignment") || lowered.includes("inlign"))) found.add(k);
    if (k === "investigation" && lowered.includes("investig")) found.add(k);
  });
  // if nothing found, pick a few randomly as a mock
  if (found.size === 0) {
    // pick 2 random
    const pick = CANONICAL.slice().sort(() => Math.random() - 0.5).slice(0, 2);
    pick.forEach(p => found.add(p));
  }
  return Array.from(found);
}

function makeId() {
  return `upl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const mockUploadService = {
  UPLOADS_KEY,
  readUploads() {
    return readUploads();
  },

  saveUploadRecord(rec) {
    const list = readUploads();
    list.unshift(rec);
    // keep last 200
    const truncated = list.slice(0, 200);
    writeUploads(truncated);
    return rec;
  },

  async manualUploadFile({ file, orgId = "anon", name = null, meta = {} } = {}) {
    // mock parse: read file name + optionally file text via FileReader to be a bit richer
    const id = makeId();
    let text = "";
    if (file && typeof FileReader !== "undefined") {
      try {
        text = await new Promise((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result || ""));
          fr.onerror = () => resolve("");
          // Try to read as text — docx is binary but this is just a mock to pick up names
          fr.readAsText(file.slice(0, 2048)); // read beginning chunk
        });
      } catch {
        text = "";
      }
    }
    const nameToUse = name || (file ? file.name : `upload_${Date.now()}`);
    const analyzedSystems = analyzeFilenameOrText(`${nameToUse} ${text}`);
    const rec = {
      id,
      orgId,
      name: nameToUse,
      timestamp: Date.now(),
      analyzedSystems,
      meta,
      // mock summary fields
      summary: `Mock summary generated for ${nameToUse}`,
      // optionally include a fake analysis payload
      analyzedPreview: {
        detected: analyzedSystems,
        confidence: Math.round(60 + Math.random() * 35),
      }
    };
    mockUploadService.saveUploadRecord(rec);
    return rec;
  },

  // simulate automatic ingestion (call to create a new upload entry)
  async simulateAutomaticIngest({ orgId = "anon", name = null, systems = null, meta = {} } = {}) {
    const id = makeId();
    const analyzedSystems = systems && Array.isArray(systems) && systems.length ? systems : analyzeFilenameOrText(name || `auto_${Date.now()}`);
    const rec = {
      id,
      orgId,
      name: name || `automatic_upload_${new Date().toISOString()}`,
      timestamp: Date.now(),
      analyzedSystems,
      meta,
      summary: `Automatic ingest (mock) - ${name || ""}`,
      analyzedPreview: { detected: analyzedSystems, confidence: Math.round(60 + Math.random() * 35) }
    };
    mockUploadService.saveUploadRecord(rec);
    return rec;
  },

  // return "dashboard summary" computed from latest upload(s)
  async getDashboardSummary({ orgId = "anon" } = {}) {
    const all = readUploads();
    const latest = all.find(u => u.orgId === orgId) || all[0] || null;
    const canonicalKeys = CANONICAL;
    const system_scores = {};
    canonicalKeys.forEach(k => system_scores[k] = null);
    if (latest && Array.isArray(latest.analyzedSystems)) {
      latest.analyzedSystems.forEach((k) => {
        if (canonicalKeys.includes(k)) system_scores[k] = 70 + Math.round(Math.random() * 20); // heuristic
      });
    }
    // fill nulls with random or null to indicate not assessed
    canonicalKeys.forEach(k => {
      if (system_scores[k] === null) {
        // 50% chance of being unknown vs low default
        system_scores[k] = Math.random() > 0.5 ? null : 45 + Math.round(Math.random() * 10);
      } else {
        system_scores[k] = Math.max(0, Math.min(100, system_scores[k]));
      }
    });

    const presentScores = Object.values(system_scores).filter(v => v !== null);
    const org_health = presentScores.length ? Math.round(presentScores.reduce((a,b)=>a+b,0)/presentScores.length) : null;

    return {
      org_health: org_health ?? 50,
      latest_upload: latest,
      latest_upload_ts: latest ? latest.timestamp : null,
      system_scores,
      transformation_readiness: 50 + Math.round(Math.random()*30),
      health_forecast: { next_30_days: Math.min(100, (org_health||50) + (Math.random()*10|0)), risk_areas: [] },
      organizational_insights: {
        collaboration_index: 50 + (Math.random()*30|0),
        innovation_velocity: 45 + (Math.random()*30|0),
        communication_effectiveness: 50 + (Math.random()*30|0),
        overall_culture_health: 50 + (Math.random()*30|0)
      },
      top_recommendations: [
        { action: "Run cross-team orchestration sprint", owner: "COO", priority: "high", expected_impact: "20% faster cycles" },
        { action: "Document playbook for critical handoffs", owner: "Head Ops", priority: "high" },
      ]
    };
  },

  // helper to clear uploads (for dev)
  clearAll() {
    try { localStorage.removeItem(UPLOADS_KEY); writeUploads([]); } catch {}
  }
};
